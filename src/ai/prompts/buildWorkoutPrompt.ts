import { WorkoutContext } from "../workoutPlanning";
import { EXERCISES } from "../../data/exercises";
import { AiWorkoutPlan } from "../workoutPlanning";

export const BUILD_WORKOUT_SYSTEM_PROMPT = `
You are an expert strength and conditioning coach designing safe, effective workouts for general population users.
You must output JSON matching the AiWorkoutPlan TypeScript interface.
Rules:
- Only use exerciseId values from the provided exercise list.
- Aim for 5–8 total exercises across warmup, main, finisher depending on time.
- Use clear, concise names and notes.
- Respect soreness/injuries and avoid risky selections when appropriate.
- Keep duration close to the requested timeMinutes.
`;

function formatExerciseList() {
  return EXERCISES.map(ex => {
    return `${ex.id} | ${ex.name} | ${ex.bodyRegion} | ${ex.equipment.join(", ")}`;
  }).join("\n");
}

export function buildWorkoutUserPrompt(ctx: WorkoutContext): string {
  const lines: string[] = [];
  lines.push("User context:");
  lines.push(`- Goal: ${ctx.goal}`);
  lines.push(`- Experience: ${ctx.experienceLevel}`);
  lines.push(`- Focus areas: ${ctx.focusAreas.join(", ") || "none"}`);
  lines.push(`- Available equipment: ${ctx.availableEquipment.join(", ") || "bodyweight only"}`);
  lines.push(`- Time: ${ctx.timeMinutes} minutes`);
  lines.push(`- Soreness: ${ctx.sorenessAreas.join(", ") || "none"}`);
  lines.push(`- Injuries: ${ctx.injuries.join(", ") || "none"}`);
  lines.push(`- Recent workouts: ${ctx.recentWorkoutNames.join(", ") || "none provided"}`);
  lines.push("");
  lines.push("Available exercises (id | name | bodyPart | equipment):");
  lines.push(formatExerciseList());
  lines.push("");
  lines.push("Output JSON that matches the AiWorkoutPlan shape. Use only exerciseId values from the list above.");
  return lines.join("\n");
}
