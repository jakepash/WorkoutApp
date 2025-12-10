export type TrainingGoal = "build" | "maintain" | "recover" | "endurance";

export interface WorkoutContext {
  goal: TrainingGoal;
  experienceLevel: "beginner" | "intermediate" | "advanced";
  focusAreas: string[];
  availableEquipment: string[];
  timeMinutes: number;
  sorenessAreas: string[];
  injuries: string[];
  recentWorkoutNames: string[];
}

export interface AiExerciseSetPlan {
  reps: number | string;
  rir?: number;
  tempo?: string;
}

export interface AiWorkoutExercisePlan {
  exerciseId: string;
  displayName: string;
  sets: AiExerciseSetPlan[];
  notes?: string;
  priority?: number;
}

export interface AiWorkoutPlan {
  name: string;
  goal: TrainingGoal;
  durationMinutes: number;
  focusAreas: string[];
  notes?: string;
  warmup?: AiWorkoutExercisePlan[];
  main: AiWorkoutExercisePlan[];
  finisher?: AiWorkoutExercisePlan[];
}
