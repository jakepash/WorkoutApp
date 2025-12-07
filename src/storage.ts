import { ExerciseLogState } from "./types";

const LOGS_KEY = "workoutLogsV1";

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
