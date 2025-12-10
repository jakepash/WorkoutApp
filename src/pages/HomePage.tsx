import { Link } from "react-router-dom";
import Card from "../components/Card";
import Tag from "../components/Tag";
import { WORKOUT_TEMPLATES } from "../data/workouts";
import { useContext } from "react";
import { ExerciseLogContext } from "../context/ExerciseLogContext";
import { formatDisplayDate } from "../utils/date";
import { useState } from "react";
import Button from "../components/Button";

const HomePage = () => {
  const { activeWorkout, startWorkout, endWorkout } = useContext(ExerciseLogContext);
  const [showFinish, setShowFinish] = useState(false);
  const [finishName, setFinishName] = useState("");
  const [finishNote, setFinishNote] = useState("");
  const [finishEffort, setFinishEffort] = useState("7");
  const [finishMood, setFinishMood] = useState("Good");
  const [finishDate, setFinishDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [finishDuration, setFinishDuration] = useState<string>("");

  return (
    <>
      <div className="space-y-4">
        <section className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25rem] text-slate-500">Choose your day</p>
          <h1 className="font-display text-2xl font-semibold text-ink">Workout templates</h1>
          <p className="text-sm text-slate-600">
            Pick the day that fits how you feel. Each template lists sections with options—choose 5–7 total moves.
        </p>
      </section>

      <Card className="space-y-2 border border-emerald-100 bg-emerald-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25rem] text-emerald-700">Workout</p>
            <h2 className="font-semibold text-ink">
              {activeWorkout ? "Workout running" : "No active workout"}
            </h2>
            <p className="text-sm text-emerald-800">
              {activeWorkout
                ? `Started ${formatDisplayDate(activeWorkout.startedAt)}`
                : "Start a workout to group your logs today."}
            </p>
          </div>
          {activeWorkout ? (
            <button
              onClick={() => setShowFinish(true)}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
            >
              End workout
            </button>
          ) : (
            <button
              onClick={startWorkout}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
            >
              Start workout
            </button>
          )}
        </div>
        {activeWorkout && (
          <p className="text-xs text-emerald-900">
            Logs you add while this is running will be grouped under this workout.
          </p>
        )}
        <div className="flex gap-2">
          <Link
            to="/builder"
            className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700"
          >
            Open workout builder
          </Link>
        </div>
      </Card>

      <div className="space-y-4">
        {WORKOUT_TEMPLATES.map(template => (
          <Link key={template.id} to={`/workout/${template.id}`} className="block">
            <Card className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold text-lg text-ink">{template.name}</h2>
                <span className="text-xs font-medium text-slate-500">{template.tags.join(" · ")}</span>
              </div>
              <p className="text-sm text-slate-600">{template.description}</p>
              <div className="flex flex-wrap gap-2">
                {template.tags.map(tag => (
                  <Tag key={tag} label={tag} tone="emerald" />
                ))}
              </div>
            </Card>
          </Link>
        ))}
      </div>
      </div>

      {showFinish && activeWorkout && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 px-4 pb-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink">Finish workout</h3>
              <button className="text-sm text-slate-500" onClick={() => setShowFinish(false)}>
                Close
              </button>
            </div>
            <div className="mt-3 space-y-3">
              <label className="text-xs font-semibold text-slate-600">
                Name (optional)
                <input
                  value={finishName}
                  onChange={e => setFinishName(e.target.value)}
                  placeholder="Lower A, Upper B..."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Date
                <input
                  type="date"
                  value={finishDate}
                  onChange={e => setFinishDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Notes
                <textarea
                  value={finishNote}
                  onChange={e => setFinishNote(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-semibold text-slate-600">
                  Duration (minutes)
                  <input
                    type="number"
                    min="0"
                    value={finishDuration}
                    onChange={e => setFinishDuration(e.target.value)}
                    placeholder={
                      activeWorkout?.startedAt
                        ? Math.max(
                            1,
                            Math.floor(
                              (Date.now() - new Date(activeWorkout.startedAt).getTime()) / 60000
                            )
                          ).toString()
                        : ""
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
                <div />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-semibold text-slate-600">
                  Effort (1-10)
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={finishEffort}
                    onChange={e => setFinishEffort(e.target.value)}
                    className="mt-1 w-full"
                  />
                  <span className="text-xs text-slate-600">Current: {finishEffort}</span>
                </label>
                <label className="text-xs font-semibold text-slate-600">
                  How you feel
                  <select
                    value={finishMood}
                    onChange={e => setFinishMood(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option>Great</option>
                    <option>Good</option>
                    <option>Okay</option>
                    <option>Tired</option>
                  </select>
                </label>
              </div>
              <Button
                onClick={() => {
                  endWorkout({
                    name: finishName || undefined,
                    note: finishNote || undefined,
                    effort: finishEffort,
                    mood: finishMood,
                    workoutDate: finishDate,
                    durationSeconds:
                      finishDuration !== ""
                        ? Number(finishDuration) * 60
                        : activeWorkout?.startedAt
                        ? Math.max(
                            60,
                            Math.floor((Date.now() - new Date(activeWorkout.startedAt).getTime()) / 1000)
                          )
                        : undefined
                  });
                  setShowFinish(false);
                  setFinishName("");
                  setFinishNote("");
                  setFinishEffort("7");
                  setFinishMood("Good");
                  setFinishDate(new Date().toISOString().slice(0, 10));
                  setFinishDuration("");
                }}
              >
                Save workout
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HomePage;
