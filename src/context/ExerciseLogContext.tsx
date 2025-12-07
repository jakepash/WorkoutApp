import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { ExerciseLogEntry, ExerciseLogState, SetEntry } from "../types";
import { loadLogs, saveLogs } from "../storage";

interface ExerciseLogContextValue {
  logs: ExerciseLogState;
  addLogEntry: (exerciseId: string, date: string, sets: SetEntry[]) => void;
}

export const ExerciseLogContext = createContext<ExerciseLogContextValue>({
  logs: {},
  addLogEntry: () => {}
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

  useEffect(() => {
    setLogs(loadLogs());
  }, []);

  const addLogEntry = useCallback((exerciseId: string, date: string, sets: SetEntry[]) => {
    setLogs(prev => {
      const entry = buildEntry(exerciseId, date, sets);
      const nextEntries = [...(prev[exerciseId] ?? []), entry].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const nextState = { ...prev, [exerciseId]: nextEntries };
      saveLogs(nextState);
      return nextState;
    });
  }, []);

  const value = useMemo(
    () => ({
      logs,
      addLogEntry
    }),
    [logs, addLogEntry]
  );

  return <ExerciseLogContext.Provider value={value}>{children}</ExerciseLogContext.Provider>;
};
