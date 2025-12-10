import React, { useContext, useMemo, useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import { ExerciseLogContext } from "../context/ExerciseLogContext";
import { generateJson } from "../ai/jsonClient";
import { buildWorkoutUserPrompt, BUILD_WORKOUT_SYSTEM_PROMPT } from "../ai/prompts/buildWorkoutPrompt";
import { AiWorkoutPlan, AiWorkoutExercisePlan, TrainingGoal, WorkoutContext } from "../ai/workoutPlanning";
import { Link, useNavigate } from "react-router-dom";
import { EXERCISES } from "../data/exercises";
import { saveAiPlan } from "../storage";

const GOAL_OPTIONS: TrainingGoal[] = ["build", "maintain", "recover", "endurance"];
const EXPERIENCE = ["beginner", "intermediate", "advanced"] as const;
const EQUIPMENT = ["bodyweight", "dumbbells", "barbell", "bench", "cables", "machines", "bands", "trap bar"];
const FOCUS = ["upper", "lower", "full", "push", "pull", "core", "glutes", "conditioning"];

const AiBuilderPage: React.FC = () => {
  const { activeWorkout, startWorkout, workoutHistory } = useContext(ExerciseLogContext);
  const [goal, setGoal] = useState<TrainingGoal>("build");
  const [experience, setExperience] = useState<(typeof EXPERIENCE)[number]>("intermediate");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>(["bodyweight", "dumbbells"]);
  const [timeMinutes, setTimeMinutes] = useState<number>(45);
  const [soreness, setSoreness] = useState("");
  const [injuries, setInjuries] = useState("");
  const [feel, setFeel] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<AiWorkoutPlan | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const navigate = useNavigate();

  const recentWorkoutNames = useMemo(
    () => (workoutHistory || []).slice(0, 3).map(w => w.name || "Workout"),
    [workoutHistory]
  );

  const toggleList = (list: string[], value: string, setter: (v: string[]) => void) => {
    setter(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  };

  const handleGenerate = async () => {
    setError(null);
    setDebugInfo(null);
    setPlan(null);

    if (!goal || !timeMinutes) {
      setError("Please select a goal and time.");
      return;
    }

    const ctx: WorkoutContext = {
      goal,
      experienceLevel: experience,
      focusAreas,
      availableEquipment: equipment,
      timeMinutes,
      sorenessAreas: soreness ? soreness.split(",").map(s => s.trim()).filter(Boolean) : [],
      injuries: injuries ? injuries.split(",").map(s => s.trim()).filter(Boolean) : [],
      recentWorkoutNames
    };

    try {
      setLoading(true);
      const userPrompt = buildWorkoutUserPrompt(ctx);
      const { data, raw } = await generateJson<AiWorkoutPlan>({
        purpose: "build_workout",
        systemPrompt: BUILD_WORKOUT_SYSTEM_PROMPT,
        userPrompt,
        preset: "default"
      });
      const validIds = new Set(EXERCISES.map(ex => ex.id));

      const coerceList = (list?: any[]): AiWorkoutExercisePlan[] => {
        if (!Array.isArray(list)) return [];
        return list
          .map(item => {
            if (!item?.exerciseId || !validIds.has(item.exerciseId)) return null;
            return {
              exerciseId: item.exerciseId,
              displayName: item.displayName || item.name || item.exerciseId,
              sets:
                Array.isArray(item.sets) && item.sets.length
                  ? item.sets
                  : [{ reps: item.reps || "8-12" }],
              notes: item.notes,
              priority: item.priority
            } as AiWorkoutExercisePlan;
          })
          .filter(Boolean) as AiWorkoutExercisePlan[];
      };

      const rawPlan: any = (data as any).workoutPlan ? (data as any).workoutPlan : data;
      const flatExercises = coerceList(rawPlan.exercises);

      const normalized: AiWorkoutPlan = {
        name: rawPlan.name || "AI Workout",
        goal: rawPlan.goal || goal,
        durationMinutes: Number(rawPlan.durationMinutes || timeMinutes),
        focusAreas: Array.isArray(rawPlan.focusAreas) ? rawPlan.focusAreas : [],
        notes: rawPlan.notes,
        warmup: coerceList(rawPlan.warmup),
        main: [...coerceList(rawPlan.main), ...flatExercises],
        finisher: coerceList(rawPlan.finisher)
      };

      const hasExercises =
        normalized.main.length > 0 ||
        normalized.warmup.length > 0 ||
        normalized.finisher.length > 0;
      if (!hasExercises) {
        setError("AI did not generate any exercises. Please adjust inputs and try again.");
        setDebugInfo(
          `Filtered counts -> warmup: ${normalized.warmup.length}, main: ${normalized.main.length}, finisher: ${normalized.finisher.length}. Raw content: ${typeof raw?.content === "string" ? raw.content.slice(0, 400) : ""}`
        );
        setPlan(null);
        return;
      }
      saveAiPlan(normalized);
      setPlan(normalized);
      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError("Could not generate workout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (title: string, items?: { label: string; exercises?: any[] }[]) => {
    if (!items) return null;
    const filtered = items.filter(item => Array.isArray(item.exercises) && item.exercises.length > 0);
    if (!filtered.length) return null;
    return (
      <Card className="space-y-2">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <div className="space-y-2">
          {filtered.map((item, idx) => (
            <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-sm font-semibold text-ink">{item.label}</p>
              <div className="space-y-1">
                {item.exercises?.map((ex, i) => (
                  <div key={i} className="flex items-start justify-between text-sm">
                    <div>
                      <p className="font-semibold text-ink">{ex.displayName}</p>
                      <p className="text-xs text-slate-600">
                        {ex.sets
                          .map((s: any) => `${s.reps}${s.rir ? ` (RIR ${s.rir})` : ""}${s.tempo ? ` @ ${s.tempo}` : ""}`)
                          .join(" · ")}
                      </p>
                      {ex.notes && <p className="text-xs text-slate-500">{ex.notes}</p>}
                    </div>
                    <Link to={`/exercise/${ex.exerciseId}`} className="text-xs font-semibold text-emerald-700 underline">
                      Open
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const normalizedPlan = useMemo(() => {
    if (!plan) return null;
    return {
      ...plan,
      focusAreas: Array.isArray(plan.focusAreas) ? plan.focusAreas : [],
      warmup: Array.isArray(plan.warmup) ? plan.warmup : [],
      main: Array.isArray(plan.main) ? plan.main : [],
      finisher: Array.isArray(plan.finisher) ? plan.finisher : []
    };
  }, [plan]);

  const workoutSections =
    normalizedPlan &&
    [
      normalizedPlan.warmup.length ? { label: "Warmup", exercises: normalizedPlan.warmup } : null,
      normalizedPlan.main.length ? { label: "Main", exercises: normalizedPlan.main } : null,
      normalizedPlan.finisher.length ? { label: "Finisher", exercises: normalizedPlan.finisher } : null
    ].filter(Boolean);

  return (
    <div className="space-y-4">
      <Card className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25rem] text-slate-500">AI Builder</p>
        <h1 className="font-display text-2xl font-semibold text-ink">AI Workout Builder</h1>
        <p className="text-sm text-slate-600">
          Provide context and let the AI suggest a session using your exercise library.
        </p>
      </Card>

      <Card className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-slate-600">Goal</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {GOAL_OPTIONS.map(g => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  goal === g ? "bg-emerald-600 text-white" : "bg-slate-100 text-ink"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-600">Experience</p>
          <select
            value={experience}
            onChange={e => setExperience(e.target.value as any)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {EXPERIENCE.map(e => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-600">Focus areas</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {FOCUS.map(f => (
              <button
                key={f}
                onClick={() => toggleList(focusAreas, f, setFocusAreas)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  focusAreas.includes(f) ? "bg-emerald-600 text-white" : "bg-slate-100 text-ink"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-600">Available equipment</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {EQUIPMENT.map(eq => (
              <button
                key={eq}
                onClick={() => toggleList(equipment, eq, setEquipment)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  equipment.includes(eq) ? "bg-emerald-600 text-white" : "bg-slate-100 text-ink"
                }`}
              >
                {eq}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs font-semibold text-slate-600">
            Time available (min)
            <input
              type="number"
              value={timeMinutes}
              min={15}
              max={120}
              onChange={e => setTimeMinutes(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Soreness
            <input
              type="text"
              value={soreness}
              onChange={e => setSoreness(e.target.value)}
              placeholder="e.g. shoulders, knees"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Injuries
            <input
              type="text"
              value={injuries}
              onChange={e => setInjuries(e.target.value)}
              placeholder="e.g. lower back"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            How do you feel?
            <input
              type="text"
              value={feel.join(", ")}
              onChange={e => setFeel(e.target.value.split(",").map(v => v.trim()).filter(Boolean))}
              placeholder="e.g. fresh, tired"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate workout"}
        </Button>
        {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
        {debugInfo && <p className="text-xs text-slate-500 whitespace-pre-wrap">{debugInfo}</p>}
      </Card>

      {normalizedPlan && (
        <div className="space-y-3">
          <Card className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25rem] text-slate-500">Plan</p>
                <h2 className="font-display text-xl font-semibold text-ink">{normalizedPlan.name}</h2>
              </div>
              <div className="text-right text-xs text-slate-600">
                <p>Goal: {normalizedPlan.goal}</p>
                <p>Duration: {normalizedPlan.durationMinutes} min</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">Focus: {normalizedPlan.focusAreas.join(", ")}</p>
            {normalizedPlan.notes && <p className="text-sm text-slate-600">{normalizedPlan.notes}</p>}
          </Card>

          {workoutSections && renderSection("Sections", workoutSections as any)}
          {(!normalizedPlan.main || normalizedPlan.main.length === 0) && (
            <Card>
              <p className="text-sm text-rose-600">
                AI did not generate any exercises. Please adjust your inputs and try again.
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AiBuilderPage;
