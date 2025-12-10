import { ExerciseLogState, WorkoutLog } from "./types";
import { AiWorkoutPlan } from "./ai/workoutPlanning";

const LOGS_KEY = "workoutLogsV1";
const WORKOUTS_KEY = "workoutSessionsV1";
const CUSTOM_EXERCISES_KEY = "workoutCustomExercisesV1";
const BUILDER_DRAFT_KEY = "workoutBuilderDraftV1";
const GIF_CACHE_KEY = "workoutGifCacheV1";
const AI_PLAN_KEY = "aiWorkoutPlanV1";

export function loadLogs(): ExerciseLogState {
  if (typeof localStorage === "undefined") return {};
  const raw = localStorage.getItem(LOGS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ExerciseLogState;
  } catch {
    return {};
  }
}

export function saveLogs(state: ExerciseLogState): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(LOGS_KEY, JSON.stringify(state));
}

export function loadWorkouts(): WorkoutLog[] {
  if (typeof localStorage === "undefined") return [];
  const raw = localStorage.getItem(WORKOUTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as WorkoutLog[];
  } catch {
    return [];
  }
}

export function saveWorkouts(workouts: WorkoutLog[]): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
}

export function loadCustomExercises() {
  if (typeof localStorage === "undefined") return [];
  const raw = localStorage.getItem(CUSTOM_EXERCISES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomExercises(list: any[]): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(list));
}

export function loadBuilderDraft() {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(BUILDER_DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveBuilderDraft(draft: any): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(BUILDER_DRAFT_KEY, JSON.stringify(draft));
}

export function loadGifCache(): Record<string, string> {
  if (typeof localStorage === "undefined") return {};
  const raw = localStorage.getItem(GIF_CACHE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export function saveGifCache(cache: Record<string, string>): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(GIF_CACHE_KEY, JSON.stringify(cache));
}

export function loadAiPlan(): AiWorkoutPlan | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(AI_PLAN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AiWorkoutPlan;
  } catch {
    return null;
  }
}

export function saveAiPlan(plan: AiWorkoutPlan): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(AI_PLAN_KEY, JSON.stringify(plan));
}
