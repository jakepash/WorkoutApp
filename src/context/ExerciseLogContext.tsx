import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { ExerciseLogEntry, ExerciseLogState, WorkoutExerciseEntry, WorkoutLog, SetEntry } from "../types";
import { loadLogs, loadWorkouts, saveLogs, saveWorkouts } from "../storage";

interface ExerciseLogContextValue {
  logs: ExerciseLogState;
  addLogEntry: (exerciseId: string, date: string, sets: SetEntry[]) => void;
  activeWorkout: WorkoutLog | null;
  workoutHistory: WorkoutLog[];
  startWorkout: () => void;
  endWorkout: (details?: { name?: string; note?: string; effort?: string; mood?: string; workoutDate?: string; durationSeconds?: number }) => void;
}

export const ExerciseLogContext = createContext<ExerciseLogContextValue>({
  logs: {},
  addLogEntry: () => {},
  activeWorkout: null,
  workoutHistory: [],
  startWorkout: () => {},
  endWorkout: () => {}
});

function buildEntry(exerciseId: string, date: string, sets: SetEntry[]): ExerciseLogEntry {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`,
    exerciseId,
    date,
    sets,
    createdAt: new Date().toISOString()
  };
}

export const ExerciseLogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<ExerciseLogState>({});
  const [activeWorkout, setActiveWorkout] = useState<WorkoutLog | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>([]);

  useEffect(() => {
    setLogs(loadLogs());
    setWorkoutHistory(loadWorkouts());
  }, []);

  const persistWorkouts = useCallback((workouts: WorkoutLog[]) => {
    setWorkoutHistory(workouts);
    saveWorkouts(workouts);
  }, []);

  const addLogEntry = useCallback(
    (exerciseId: string, date: string, sets: SetEntry[]) => {
      setLogs(prev => {
        const entry = buildEntry(exerciseId, date, sets);
        const nextEntries = [...(prev[exerciseId] ?? []), entry].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const nextState = { ...prev, [exerciseId]: nextEntries };
        saveLogs(nextState);
        return nextState;
      });

      // Attach to active workout if one is running
      setActiveWorkout(prev => {
        if (!prev) return prev;
        const workoutEntry: WorkoutExerciseEntry = { exerciseId, date, sets };
        const updated: WorkoutLog = { ...prev, entries: [...prev.entries, workoutEntry] };
        return updated;
      });
    },
    []
  );

  const startWorkout = useCallback(() => {
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`;
    setActiveWorkout({
      id,
      startedAt: new Date().toISOString(),
      entries: []
    });
  }, []);

  const endWorkout = useCallback(
    (details?: {
      name?: string;
      note?: string;
      effort?: string;
      mood?: string;
      workoutDate?: string;
      durationSeconds?: number;
    }) => {
      setActiveWorkout(prev => {
        if (!prev) return prev;
        const endTime = new Date().toISOString();
        const durationSeconds =
          details?.durationSeconds ??
          (prev.startedAt ? Math.max(0, Math.floor((new Date(endTime).getTime() - new Date(prev.startedAt).getTime()) / 1000)) : undefined);
        const finished: WorkoutLog = {
          ...prev,
          endedAt: endTime,
          note: details?.note,
          name: details?.name,
          effort: details?.effort,
          mood: details?.mood,
          workoutDate: details?.workoutDate ?? prev.startedAt,
          durationSeconds
        };
        const updatedHistory = [finished, ...workoutHistory].sort(
          (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
        );
        persistWorkouts(updatedHistory);
        return null;
      });
    },
    [persistWorkouts, workoutHistory]
  );

  const value = useMemo(
    () => ({
      logs,
      addLogEntry,
      activeWorkout,
      workoutHistory,
      startWorkout,
      endWorkout
    }),
    [logs, addLogEntry, activeWorkout, workoutHistory, startWorkout, endWorkout]
  );

  return <ExerciseLogContext.Provider value={value}>{children}</ExerciseLogContext.Provider>;
};
