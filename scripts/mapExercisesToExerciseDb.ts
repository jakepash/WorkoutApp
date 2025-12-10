/* Mapping script: run with
   EXERCISEDB_API_KEY=... npx tsx scripts/mapExercisesToExerciseDb.ts
*/
import fs from "fs";
import path from "path";
import { EXERCISES } from "../src/data/exercises";
import { Exercise } from "../src/types";
import { ExerciseDbExercise, searchExercisesByName } from "../src/services/exerciseDbApi";

interface ExerciseDbMappingRow {
  localId: string;
  localName: string;
  exerciseDbId: string | null;
  exerciseDbName?: string;
  bodyPart?: string;
  target?: string;
  equipment?: string;
  confidence: number;
  notes?: string;
}

function tokenize(str: string): Set<string> {
  return new Set(
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
  );
}

function tokenJaccard(a: string, b: string): number {
  const setA = tokenize(a);
  const setB = tokenize(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  const intersection = [...setA].filter(t => setB.has(t)).length;
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

function equipmentBonus(localEquip: string[], remoteEquip?: string): number {
  if (!remoteEquip) return 0;
  const r = remoteEquip.toLowerCase();
  return localEquip.some(e => r.includes(e.toLowerCase())) ? 0.1 : 0;
}

function bodyRegionBonus(region: string, bodyPart?: string): number {
  if (!bodyPart) return 0;
  const bp = bodyPart.toLowerCase();
  if (region === "lower" && bp.includes("leg")) return 0.1;
  if (region === "upper" && (bp.includes("back") || bp.includes("chest") || bp.includes("shoulder") || bp.includes("upper"))) return 0.1;
  if (region === "core" && (bp.includes("waist") || bp.includes("core") || bp.includes("abs"))) return 0.1;
  return 0;
}

async function mapExercise(ex: Exercise): Promise<ExerciseDbMappingRow> {
  const searchName = ex.exerciseDbName || ex.name;
  const normalized = searchName.toLowerCase();
  try {
    let results = await searchExercisesByName(searchName, 10, 0);
    if (!results.length && normalized !== searchName) {
      results = await searchExercisesByName(normalized, 10, 0);
    }
    if (!results.length) {
      return {
        localId: ex.id,
        localName: ex.name,
        exerciseDbId: null,
        confidence: 0,
        notes: "no results from ExerciseDB"
      };
    }

    const exact = results.find(r => r.name.toLowerCase() === searchName.toLowerCase());
    if (exact) {
      return {
        localId: ex.id,
        localName: ex.name,
        exerciseDbId: exact.id,
        exerciseDbName: exact.name,
        bodyPart: exact.bodyPart,
        target: exact.target,
        equipment: exact.equipment,
        confidence: 1
      };
    }

    let best: { row: ExerciseDbExercise; score: number } = { row: results[0], score: 0 };
    for (const r of results) {
      const base = tokenJaccard(ex.name, r.name);
      const bonus = equipmentBonus(ex.equipment, r.equipment) + bodyRegionBonus(ex.bodyRegion, r.bodyPart);
      const score = base + bonus;
      if (score > best.score) best = { row: r, score };
    }

    if (best.score < 0.3) {
      return {
        localId: ex.id,
        localName: ex.name,
        exerciseDbId: null,
        confidence: best.score,
        notes: "low confidence match, manual review recommended"
      };
    }

    return {
      localId: ex.id,
      localName: ex.name,
      exerciseDbId: best.row.id,
      exerciseDbName: best.row.name,
      bodyPart: best.row.bodyPart,
      target: best.row.target,
      equipment: best.row.equipment,
      confidence: best.score
    };
  } catch (err: any) {
    return {
      localId: ex.id,
      localName: ex.name,
      exerciseDbId: null,
      confidence: 0,
      notes: `API error: ${err.message}`
    };
  }
}

async function main() {
  const rows: ExerciseDbMappingRow[] = [];
  for (const ex of EXERCISES) {
    const row = await mapExercise(ex);
    console.log(`Mapped ${ex.id} -> ${row.exerciseDbId || "none"} (conf=${row.confidence.toFixed(2)})`);
    rows.push(row);
  }

  const outPath = path.join(process.cwd(), "src/data/exerciseDbMapping.ts");
  const header =
    `// Auto-generated mapping from local exercises to ExerciseDB\n` +
    `export interface ExerciseDbMappingRow {\n` +
    `  localId: string;\n  localName: string;\n  exerciseDbId: string | null;\n  exerciseDbName?: string;\n  bodyPart?: string;\n  target?: string;\n  equipment?: string;\n  confidence: number;\n  notes?: string;\n}\n`;
  const body = `export const EXERCISE_DB_MAPPING: ExerciseDbMappingRow[] = ${JSON.stringify(rows, null, 2)};\n`;
  fs.writeFileSync(outPath, header + body, "utf8");
  console.log(`Wrote mapping to ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
