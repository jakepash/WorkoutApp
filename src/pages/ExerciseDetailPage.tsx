import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button";
import Card from "../components/Card";
import Tag from "../components/Tag";
import { EXERCISES } from "../data/exercises";
import { ExerciseLogContext } from "../context/ExerciseLogContext";
import { SetEntry } from "../types";
import { formatDisplayDate, todayISO } from "../utils/date";
import { fetchExerciseGifByName, fetchExerciseImageByName } from "../services/exerciseDb";
import { loadGifCache, saveGifCache } from "../storage";

interface EditableSet {
  weight: string;
  reps: string;
  notes: string;
}

const ExerciseDetailPage: React.FC = () => {
  const apiKey = import.meta.env.VITE_EXERCISEDB_API_KEY as string | undefined;

  const withApiKey = useCallback(
    (url?: string) => {
      if (!url) return url;
      if (!apiKey) return url;
      if (url.includes("rapidapi.com") && !url.includes("rapidapi-key=")) {
        const sep = url.includes("?") ? "&" : "?";
        return `${url}${sep}rapidapi-key=${apiKey}`;
      }
      return url;
    },
    [apiKey]
  );

  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const exercise = EXERCISES.find(ex => ex.id === exerciseId);
  const { logs, addLogEntry, activeWorkout } = useContext(ExerciseLogContext);
  const exerciseLogs = useMemo(() => {
    const entries = logs[exerciseId ?? ""] ?? [];
    return [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, exerciseId]);
  const [mediaUrl, setMediaUrl] = useState<string | undefined>(exercise?.gifUrl);
  const [finalMediaUrl, setFinalMediaUrl] = useState<string | undefined>(undefined);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const lastLoggedSet = useMemo(() => {
    if (exerciseLogs.length === 0) return undefined;
    const latest = exerciseLogs[0];
    if (!latest.sets.length) return undefined;
    return latest.sets[latest.sets.length - 1];
  }, [exerciseLogs]);

  const makeDefaultSet = useCallback(
    (): EditableSet => ({
      weight: lastLoggedSet?.weight != null ? String(lastLoggedSet.weight) : "",
      reps: lastLoggedSet?.reps ? String(lastLoggedSet.reps) : "",
      notes: ""
    }),
    [lastLoggedSet]
  );

  const [sets, setSets] = useState<EditableSet[]>([makeDefaultSet()]);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const displayTarget = exercise?.exerciseDbTarget || exercise?.category;
  const displayBodyPart = exercise?.exerciseDbBodyPart || exercise?.bodyRegion;
  const displayEquipment =
    exercise?.exerciseDbEquipment || (exercise ? exercise.equipment.join(", ") : undefined);
  const instructions: string[] =
    exercise?.exerciseDbInstructions && exercise.exerciseDbInstructions.length > 0
      ? exercise.exerciseDbInstructions
      : exercise?.cues
      ? [exercise.cues]
      : [];
  const secondaryMuscles = exercise?.exerciseDbSecondaryMuscles || [];

  useEffect(() => {
    if (!exercise) return;
    const cache = loadGifCache();
    const cached = cache[exercise.id];
    if (cached) {
      setMediaUrl(withApiKey(cached));
      return;
    }
    if (exercise.gifUrl) {
      const url = withApiKey(exercise.gifUrl);
      setMediaUrl(url);
      saveGifCache({ ...cache, [exercise.id]: url });
      return;
    }
    if (exercise.exerciseDbImage180) {
      const url = withApiKey(exercise.exerciseDbImage180);
      setMediaUrl(url);
      saveGifCache({ ...cache, [exercise.id]: url });
      return;
    }
    setMediaLoading(true);
    fetchExerciseGifByName(exercise.name)
      .then(url => {
        if (url) {
          setMediaUrl(url);
          saveGifCache({ ...cache, [exercise.id]: url });
          return;
        }
        return fetchExerciseImageByName(exercise.name).then(imgUrl => {
          if (imgUrl) {
            const withKey = withApiKey(imgUrl);
            setMediaUrl(withKey);
            saveGifCache({ ...cache, [exercise.id]: withKey });
          }
        });
      })
      .finally(() => setMediaLoading(false));
  }, [exercise, withApiKey]);

  // If media is from ExerciseDB image endpoint, fetch with headers and cache as data URL to avoid CORS issues.
  useEffect(() => {
    if (!exercise || !mediaUrl) {
      setFinalMediaUrl(undefined);
      return;
    }

    const cache = loadGifCache();
    const cached = cache[`${exercise.id}_data`];
    if (cached?.startsWith("data:")) {
      setFinalMediaUrl(cached);
      return;
    }

    const needsFetch = mediaUrl.includes("exercisedb.p.rapidapi.com/image");
    if (!needsFetch) {
      setFinalMediaUrl(mediaUrl);
      return;
    }

    setMediaLoading(true);
    fetch(mediaUrl, {
      headers: {
        ...(apiKey ? { "X-RapidAPI-Key": apiKey } : {}),
        ...(import.meta.env.VITE_EXERCISEDB_API_HOST
          ? { "X-RapidAPI-Host": import.meta.env.VITE_EXERCISEDB_API_HOST }
          : {})
      }
    })
      .then(async res => {
        const blob = await res.blob();
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      })
      .then(dataUrl => {
        setFinalMediaUrl(dataUrl);
        saveGifCache({ ...cache, [`${exercise.id}_data`]: dataUrl });
      })
      .catch(() => {
        setFinalMediaUrl(mediaUrl);
      })
      .finally(() => setMediaLoading(false));
  }, [exercise, mediaUrl, apiKey]);

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

  const handleAddSet = () => setSets(prev => [...prev, makeDefaultSet()]);

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

    const logDate =
      activeWorkout?.workoutDate ??
      activeWorkout?.startedAt?.slice(0, 10) ??
      todayISO();

    addLogEntry(exercise.id, logDate, parsed);
    setMessage("Session saved");
    setSets([makeDefaultSet()]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-xs font-semibold text-emerald-700">
        <button onClick={() => navigate(-1)} className="underline">
          Back
        </button>
        <button onClick={() => navigate("/")} className="underline">
          Home
        </button>
      </div>
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
          <div className="mt-3 space-y-1 text-xs text-slate-600">
            {displayBodyPart && (
              <p>
                <span className="font-semibold text-ink">Body part:</span> {displayBodyPart}
              </p>
            )}
            {displayTarget && (
              <p>
                <span className="font-semibold text-ink">Target:</span> {displayTarget}
              </p>
            )}
            {displayEquipment && (
              <p>
                <span className="font-semibold text-ink">Equipment:</span> {displayEquipment}
              </p>
            )}
            {secondaryMuscles.length > 0 && (
              <p>
                <span className="font-semibold text-ink">Secondary:</span> {secondaryMuscles.join(", ")}
              </p>
            )}
          </div>
        </div>
        {finalMediaUrl ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <img
              src={finalMediaUrl}
              alt={exercise.name}
              className="w-full max-h-[320px] object-contain bg-white"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-6 text-sm text-slate-500">
            {mediaLoading ? "Loading demo..." : `Demo for ${exercise.mediaKey ?? "this move"} coming soon.`}
          </div>
        )}
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <button
            onClick={() => setShowInstructions(prev => !prev)}
            className="flex w-full items-center justify-between text-sm font-semibold text-ink"
          >
            <span>Instructions</span>
            <span className="text-xs text-slate-500">{showInstructions ? "Hide" : "Show"}</span>
          </button>
          {showInstructions && (
            <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm text-slate-700">
              {instructions.length === 0 ? (
                <li>No instructions available.</li>
              ) : (
                instructions.map((step, idx) => <li key={idx}>{step}</li>)
              )}
            </ol>
          )}
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
          <p className="text-sm text-slate-600">Add sets for this exercise. Date comes from the workout.</p>
        </div>
        <div className="space-y-3">
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
            <Button onClick={handleSave}>Save workout</Button>
          </div>
          {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
          {message && <p className="text-sm font-semibold text-emerald-700">{message}</p>}
        </div>
      </Card>
    </div>
  );
};

export default ExerciseDetailPage;
