const BASE_URL = "https://exercisedb.p.rapidapi.com";
const API_KEY = process.env.EXERCISEDB_API_KEY;
const API_HOST = process.env.EXERCISEDB_API_HOST || "exercisedb.p.rapidapi.com";

if (!API_KEY) {
  throw new Error("EXERCISEDB_API_KEY is missing. Set it in your environment before running the mapping script.");
}

export interface ExerciseDbExercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  secondaryMuscles: string[];
  instructions: string[];
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category:
    | "strength"
    | "cardio"
    | "mobility"
    | "balance"
    | "stretching"
    | "plyometrics"
    | "rehabilitation";
}

async function request<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }

  const res = await fetch(url.toString(), {
    headers: {
      "X-RapidAPI-Key": API_KEY!,
      "X-RapidAPI-Host": API_HOST
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ExerciseDB request failed (${res.status}): ${text}`);
  }

  return (await res.json()) as T;
}

export async function searchExercisesByName(
  name: string,
  limit: number = 5,
  offset: number = 0
): Promise<ExerciseDbExercise[]> {
  const path = `/exercises/name/${encodeURIComponent(name.toLowerCase())}`;
  return request<ExerciseDbExercise[]>(path, { limit, offset });
}

export async function getExerciseById(id: string): Promise<ExerciseDbExercise | null> {
  try {
    return await request<ExerciseDbExercise>(`/exercises/exercise/${id}`);
  } catch (err: any) {
    if (String(err?.message || "").includes("404")) return null;
    throw err;
  }
}

export async function getAllExercisesPaginated(limit: number, maxPages?: number): Promise<ExerciseDbExercise[]> {
  const all: ExerciseDbExercise[] = [];
  let offset = 0;
  let page = 0;

  while (true) {
    if (maxPages !== undefined && page >= maxPages) break;
    const chunk = await request<ExerciseDbExercise[]>("/exercises", { limit, offset });
    if (chunk.length === 0) break;
    all.push(...chunk);
    if (chunk.length < limit) break;
    offset += limit;
    page += 1;
  }

  return all;
}
