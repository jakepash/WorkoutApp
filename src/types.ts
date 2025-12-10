export type ExerciseCategory =
  | "squat"
  | "hinge"
  | "single_leg"
  | "pull"
  | "push"
  | "calf_tib"
  | "posture"
  | "core"
  | "mobility"
  | "other";

export type BodyRegion = "lower" | "upper" | "full" | "core";

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  bodyRegion: BodyRegion;
  equipment: string[];
  unilateral: boolean;
  defaultSets: number;
  defaultReps: string;
  cues: string;
  mediaKey?: string;
  gifUrl?: string;
  exerciseDbName?: string;
  exerciseDbId?: string;
  exerciseDbBodyPart?: string;
  exerciseDbTarget?: string;
  exerciseDbEquipment?: string;
  exerciseDbImage180?: string;
  exerciseDbSecondaryMuscles?: string[];
  exerciseDbInstructions?: string[];
}

export interface WorkoutSection {
  label: string;
  exerciseIds: string[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  tags: string[];
  sections: WorkoutSection[];
}

export interface SetEntry {
  weight: number | null;
  reps: number;
  notes?: string;
}

export interface ExerciseLogEntry {
  id: string;
  exerciseId: string;
  date: string;
  sets: SetEntry[];
  createdAt: string;
}

export interface ExerciseLogState {
  [exerciseId: string]: ExerciseLogEntry[];
}

export interface WorkoutExerciseEntry {
  exerciseId: string;
  date: string;
  sets: SetEntry[];
}

export interface WorkoutLog {
  id: string;
  startedAt: string;
  endedAt?: string;
  entries: SessionExerciseEntry[];
  note?: string;
  name?: string;
  effort?: string;
  mood?: string;
  workoutDate?: string;
  durationSeconds?: number;
}

export interface CustomExerciseInput {
  id: string;
  name: string;
  bodyPart?: string;
  equipment?: string;
  notes?: string;
  gifUrl?: string;
}

export interface WorkoutBuilderDraft {
  name: string;
  exercises: CustomExerciseInput[];
  note?: string;
}
