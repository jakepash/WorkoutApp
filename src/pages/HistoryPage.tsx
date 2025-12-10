import React, { useContext, useMemo } from "react";
import Card from "../components/Card";
import { ExerciseLogContext } from "../context/ExerciseLogContext";
import { EXERCISES } from "../data/exercises";
import { formatDisplayDate } from "../utils/date";

const HistoryPage: React.FC = () => {
  const { logs, workoutHistory } = useContext(ExerciseLogContext);

  const flattened = useMemo(() => {
    return Object.entries(logs)
      .map(([exerciseId, entries]) => {
        const exercise = EXERCISES.find(ex => ex.id === exerciseId);
        if (!exercise || entries.length === 0) return null;
        const sorted = [...entries].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        return {
          exercise,
          entries: sorted
        };
      })
      .filter(Boolean) as { exercise: (typeof EXERCISES)[number]; entries: typeof logs[string] }[];
  }, [logs]);

  const recent = flattened
    .map(item => ({ ...item, latest: item.entries[0] }))
    .sort((a, b) => new Date(b.latest.date).getTime() - new Date(a.latest.date).getTime());

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.25rem] text-slate-500">History</p>
        <h1 className="font-display text-2xl font-semibold text-ink">Workout history</h1>
        <p className="text-sm text-slate-600">Latest per-exercise logs plus full workout timelines.</p>
      </div>

      {recent.length === 0 && (
        <Card>
          <p className="text-sm text-slate-600">No sessions logged yet. Start from the Workouts tab.</p>
        </Card>
      )}

      {workoutHistory.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Workout logs</h2>
          <div className="space-y-3">
            {workoutHistory.map(workout => (
              <Card key={workout.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Workout</p>
                    <h3 className="text-lg font-semibold text-ink">
                      {workout.name || "Untitled"} · {formatDisplayDate(workout.workoutDate ?? workout.startedAt)}
                    </h3>
                  </div>
                  <div className="text-right text-xs font-semibold text-emerald-700">
                    <p>{workout.entries.length} exercise{workout.entries.length === 1 ? "" : "s"}</p>
                    {workout.durationSeconds && (
                      <p className="text-slate-500">{Math.round(workout.durationSeconds / 60)} min</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 text-xs text-slate-600">
                  {workout.effort && <span>Effort {workout.effort}/10</span>}
                  {workout.mood && <span>• Feel: {workout.mood}</span>}
                  {workout.note && <span>• Notes: {workout.note}</span>}
                </div>
                <div className="space-y-2 text-sm text-slate-700">
                  {workout.entries.map((entry, idx) => {
                    const ex = EXERCISES.find(e => e.id === entry.exerciseId);
                    return (
                      <div key={`${entry.exerciseId}-${idx}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="font-semibold text-ink">{ex?.name ?? entry.exerciseId}</p>
                        <div className="space-y-1">
                          {entry.sets.map((set, i) => (
                            <p key={i}>
                              Set {i + 1}: {set.weight === null ? "BW" : `${set.weight} lb`} × {set.reps}
                              {set.notes ? ` · ${set.notes}` : ""}
                            </p>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {recent.map(item => (
          <Card key={item.exercise.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-500">{item.exercise.category}</p>
                <h2 className="text-lg font-semibold text-ink">{item.exercise.name}</h2>
              </div>
              <span className="text-xs font-semibold text-emerald-700">{formatDisplayDate(item.latest.date)}</span>
            </div>
            <div className="space-y-1 text-sm text-slate-700">
              {item.latest.sets.map((set, i) => (
                <p key={i}>
                  Set {i + 1}: {set.weight === null ? "BW" : `${set.weight} lb`} × {set.reps}
                  {set.notes ? ` · ${set.notes}` : ""}
                </p>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Total sessions logged: {item.entries.length} · Last updated {formatDisplayDate(item.latest.date)}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;
