import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import { EXERCISES } from "../data/exercises";
import { CustomExerciseInput, WorkoutBuilderDraft } from "../types";
import { loadBuilderDraft, loadCustomExercises, saveBuilderDraft, saveCustomExercises } from "../storage";
import { searchExerciseDb } from "../services/exerciseDb";

const emptyCustom: CustomExerciseInput = { id: "", name: "", bodyPart: "", equipment: "", notes: "", gifUrl: "" };

const WorkoutBuilderPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [localResults, setLocalResults] = useState(EXERCISES);
  const [remoteResults, setRemoteResults] = useState<CustomExerciseInput[]>([]);
  const [selected, setSelected] = useState<CustomExerciseInput[]>([]);
  const [draftName, setDraftName] = useState("");
  const [draftNote, setDraftNote] = useState("");
  const [customForm, setCustomForm] = useState<CustomExerciseInput>(emptyCustom);
  const [customLibrary, setCustomLibrary] = useState<CustomExerciseInput[]>(loadCustomExercises());
  const [loadingRemote, setLoadingRemote] = useState(false);

  useEffect(() => {
    const draft = loadBuilderDraft() as WorkoutBuilderDraft | null;
    if (draft) {
      setSelected(draft.exercises || []);
      setDraftName(draft.name || "");
      setDraftNote(draft.note || "");
    }
  }, []);

  useEffect(() => {
    const filtered = EXERCISES.filter(ex =>
      ex.name.toLowerCase().includes(query.toLowerCase()) ||
      ex.category.toLowerCase().includes(query.toLowerCase())
    );
    setLocalResults(filtered);
  }, [query]);

  const handleAdd = (exercise: CustomExerciseInput) => {
    if (selected.find(sel => sel.id === exercise.id)) return;
    const next = [...selected, exercise];
    setSelected(next);
    saveBuilderDraft({ name: draftName, note: draftNote, exercises: next });
  };

  const handleRemove = (id: string) => {
    const next = selected.filter(item => item.id !== id);
    setSelected(next);
    saveBuilderDraft({ name: draftName, note: draftNote, exercises: next });
  };

  const handleCustomSave = () => {
    if (!customForm.name.trim()) return;
    const id = customForm.id || `custom_${Date.now()}`;
    const entry: CustomExerciseInput = { ...customForm, id };
    const nextLib = [...customLibrary, entry];
    setCustomLibrary(nextLib);
    saveCustomExercises(nextLib);
    setCustomForm(emptyCustom);
  };

  const handleRemoteSearch = async () => {
    if (!query.trim()) {
      setRemoteResults([]);
      return;
    }
    setLoadingRemote(true);
    const results = await searchExerciseDb(query.trim());
    setRemoteResults(results);
    setLoadingRemote(false);
  };

  const selectedCount = selected.length;

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.25rem] text-slate-500">Builder</p>
        <h1 className="font-display text-2xl font-semibold text-ink">Workout builder</h1>
        <p className="text-sm text-slate-600">Pick exercises from the library, search ExerciseDB, or add your own.</p>
      </div>

      <Card className="space-y-3">
        <div className="grid gap-2">
          <label className="text-xs font-semibold text-slate-600">
            Workout name
            <input
              value={draftName}
              onChange={e => setDraftName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Notes
            <textarea
              value={draftNote}
              onChange={e => setDraftNote(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
        </div>
        <p className="text-xs text-slate-500">
          Selections are saved locally. ExerciseDB search requires `VITE_EXERCISEDB_API_KEY` in your env.
        </p>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search exercises"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          <Button variant="ghost" onClick={handleRemoteSearch} className="w-24">
            Search API
          </Button>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Library matches</p>
          <div className="space-y-2">
            {localResults.slice(0, 6).map(ex => (
              <button
                key={ex.id}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm hover:border-emerald-200"
                onClick={() =>
                  handleAdd({
                    id: ex.id,
                    name: ex.name,
                    bodyPart: ex.bodyRegion,
                    equipment: ex.equipment.join(", "),
                    notes: ex.cues
                  })
                }
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">{ex.name}</span>
                  <span className="text-xs text-slate-500">{ex.bodyRegion}</span>
                </div>
                <p className="text-xs text-slate-600">{ex.cues}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">ExerciseDB results</p>
          {loadingRemote && <p className="text-xs text-slate-500">Searching…</p>}
          {!loadingRemote && remoteResults.length === 0 && (
            <p className="text-xs text-slate-500">No results yet. Provide API key and search.</p>
          )}
          <div className="space-y-2">
            {remoteResults.map(ex => (
              <button
                key={ex.id}
                className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-left text-sm hover:border-emerald-300"
                onClick={() => handleAdd(ex)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">{ex.name}</span>
                  <span className="text-xs text-slate-500">{ex.bodyPart}</span>
                </div>
                <p className="text-xs text-slate-600">{ex.equipment}</p>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Add custom exercise</p>
        <div className="grid gap-2 md:grid-cols-2">
          <label className="text-xs font-semibold text-slate-600">
            Name
            <input
              value={customForm.name}
              onChange={e => setCustomForm({ ...customForm, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Body part
            <input
              value={customForm.bodyPart}
              onChange={e => setCustomForm({ ...customForm, bodyPart: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Equipment
            <input
              value={customForm.equipment}
              onChange={e => setCustomForm({ ...customForm, equipment: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            GIF URL
            <input
              value={customForm.gifUrl}
              onChange={e => setCustomForm({ ...customForm, gifUrl: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="text-xs font-semibold text-slate-600 md:col-span-2">
            Notes
            <textarea
              value={customForm.notes}
              onChange={e => setCustomForm({ ...customForm, notes: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleCustomSave} className="w-32">
            Save custom
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (!customForm.name.trim()) return;
              const id = customForm.id || `custom_${Date.now()}`;
              const entry: CustomExerciseInput = { ...customForm, id };
              handleAdd(entry);
              const nextLib = [...customLibrary, entry];
              setCustomLibrary(nextLib);
              saveCustomExercises(nextLib);
              setCustomForm(emptyCustom);
            }}
          >
            Save & add
          </Button>
        </div>
        {customLibrary.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Your custom exercises</p>
            <div className="space-y-2">
              {customLibrary.map(ex => (
                <div key={ex.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <div>
                    <p className="font-semibold text-ink">{ex.name}</p>
                    <p className="text-xs text-slate-500">{ex.bodyPart}</p>
                  </div>
                  <Button variant="ghost" className="w-24" onClick={() => handleAdd(ex)}>
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink">Selected exercises</h2>
          <span className="text-xs text-slate-500">{selectedCount} chosen</span>
        </div>
        {selectedCount === 0 ? (
          <p className="text-sm text-slate-600">Nothing selected yet.</p>
        ) : (
          <div className="space-y-2">
            {selected.map(ex => (
              <div key={ex.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                <div>
                  <p className="font-semibold text-ink">{ex.name}</p>
                  <p className="text-xs text-slate-600">
                    {[ex.bodyPart, ex.equipment].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <button className="text-xs font-semibold text-rose-600 underline" onClick={() => handleRemove(ex.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
        <Button
          onClick={() => saveBuilderDraft({ name: draftName, note: draftNote, exercises: selected })}
          className="w-full"
        >
          Save draft
        </Button>
      </Card>
    </div>
  );
};

export default WorkoutBuilderPage;
