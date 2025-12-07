import React, { useContext, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import Tag from "../components/Tag";
import { EXERCISES } from "../data/exercises";
import { ExerciseLogContext } from "../context/ExerciseLogContext";
import { SetEntry } from "../types";
import { formatDisplayDate, todayISO } from "../utils/date";

interface EditableSet {
  weight: string;
  reps: string;
  notes: string;
}

const blankSet: EditableSet = { weight: "", reps: "", notes: "" };

const ExerciseDetailPage: React.FC = () => {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const exercise = EXERCISES.find(ex => ex.id === exerciseId);
  const { logs, addLogEntry } = useContext(ExerciseLogContext);
  const [date, setDate] = useState<string>(todayISO());
  const [sets, setSets] = useState<EditableSet[]>([blankSet]);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const exerciseLogs = useMemo(() => logs[exerciseId ?? ""] ?? [], [logs, exerciseId]);

  if (!exercise) {
    return (
      <Card className="space-y-3">
        <p className="text-sm text-slate-600">Exercise not found.</p>
        <button className="text-emerald-600 underline" onClick={() => navigate(-1)}>
          Go back
        </button>
      </Card>
    );
  }

  const handleSetChange = (index: number, field: keyof EditableSet, value: string) => {
    setSets(prev => prev.map((set, i) => (i === index ? { ...set, [field]: value } : set)));
  };

  const handleAddSet = () => setSets(prev => [...prev, blankSet]);

  const handleRemoveSet = (index: number) => setSets(prev => prev.filter((_, i) => i !== index));

  const handleSave = () => {
    setError("");
    const parsed: SetEntry[] = sets
      .map(set => ({
        weight: set.weight === "" ? null : Number(set.weight),
        reps: Number(set.reps),
        notes: set.notes?.trim() || undefined
      }))
      .filter(set => Number.isFinite(set.reps) && set.reps > 0);

    if (parsed.length === 0) {
      setError("Add at least one set with reps.");
      return;
    }

    addLogEntry(exercise.id, date, parsed);
    setMessage("Session saved");
    setSets([blankSet]);
  };

  return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className="text-xs font-semibold text-emerald-700 underline">
        Back
      </button>
      <Card className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.25rem] text-slate-500">Exercise</p>
            <h1 className="font-display text-2xl font-semibold text-ink">{exercise.name}</h1>
            <div className="flex flex-wrap gap-2">
              <Tag label={exercise.category} />
              <Tag label={exercise.bodyRegion} tone="emerald" />
              {exercise.equipment.map(eq => (
                <Tag key={eq} label={eq} />
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-emerald-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
            {exercise.unilateral ? "Unilateral" : "Bilateral"}
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="font-semibold text-ink">Cues</p>
          <p className="mt-1 leading-relaxed">{exercise.cues}</p>
          <p className="mt-2 text-xs text-slate-500">
            {exercise.defaultSets} x {exercise.defaultReps} suggested
          </p>
        </div>
        <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-6 text-sm text-slate-500">
          Demo for <span className="ml-1 font-semibold text-ink">{exercise.mediaKey ?? "this move"}</span> coming soon.
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink">Recent history</h2>
          <span className="text-xs text-slate-500">{exerciseLogs.length || "No"} sessions</span>
        </div>
        {exerciseLogs.length === 0 ? (
          <p className="text-sm text-slate-600">No history yet. Log your first session below.</p>
        ) : (
          <div className="space-y-3">
            {exerciseLogs.map((entry, index) => (
              <div
                key={entry.id}
                className={`rounded-xl border px-4 py-3 ${
                  index === 0 ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">{formatDisplayDate(entry.date)}</p>
                  {index === 0 && <span className="text-xs font-semibold text-emerald-700">Most recent</span>}
                </div>
                <div className="mt-2 space-y-1 text-sm text-slate-700">
                  {entry.sets.map((set, i) => (
                    <p key={i}>
                      Set {i + 1} – {set.weight === null ? "BW" : `${set.weight} lb`} × {set.reps}
                      {set.notes ? ` · ${set.notes}` : ""}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="font-semibold text-ink">Log new session</h2>
          <p className="text-sm text-slate-600">Add sets for today or adjust the date.</p>
        </div>
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-600">
            Date
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <div className="space-y-3">
            {sets.map((set, index) => (
              <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">Set {index + 1}</p>
                  {sets.length > 1 && (
                    <button
                      onClick={() => handleRemoveSet(index)}
                      className="text-xs font-semibold text-rose-600 underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="text-xs font-semibold text-slate-600">
                    Weight (lb)
                    <input
                      type="number"
                      inputMode="decimal"
                      value={set.weight}
                      onChange={e => handleSetChange(index, "weight", e.target.value)}
                      placeholder="BW"
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-600">
                    Reps
                    <input
                      type="number"
                      inputMode="numeric"
                      value={set.reps}
                      onChange={e => handleSetChange(index, "reps", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    />
                  </label>
                </div>
                <label className="mt-2 block text-xs font-semibold text-slate-600">
                  Notes (optional)
                  <input
                    type="text"
                    value={set.notes}
                    onChange={e => handleSetChange(index, "notes", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleAddSet} className="w-40">
              + Add set
            </Button>
            <Button onClick={handleSave}>Save session</Button>
          </div>
          {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
          {message && <p className="text-sm font-semibold text-emerald-700">{message}</p>}
        </div>
      </Card>
    </div>
  );
};

export default ExerciseDetailPage;
