import { Link, useNavigate, useParams } from "react-router-dom";
import Card from "../components/Card";
import Tag from "../components/Tag";
import { EXERCISES } from "../data/exercises";
import { WORKOUT_TEMPLATES } from "../data/workouts";
import { Exercise } from "../types";

const WorkoutDetailPage = () => {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const workout = WORKOUT_TEMPLATES.find(w => w.id === workoutId);

  if (!workout) {
    return (
      <Card>
        <div className="space-y-3">
          <p className="text-sm text-slate-600">Workout not found.</p>
          <button className="text-emerald-600 underline" onClick={() => navigate("/")}>
            Back home
          </button>
        </div>
      </Card>
    );
  }

  const getExercise = (id: string): Exercise | undefined => EXERCISES.find(ex => ex.id === id);

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25rem] text-slate-500">Template</p>
            <h1 className="font-display text-2xl font-semibold text-ink">{workout.name}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {workout.tags.map(tag => (
              <Tag key={tag} label={tag} tone="emerald" />
            ))}
          </div>
        </div>
        <p className="text-sm text-slate-600">{workout.description}</p>
        <p className="text-xs font-medium text-emerald-700">
          Pick 5–7 total exercises from these sections based on how you feel today.
        </p>
      </Card>

      {workout.sections.map(section => (
        <Card key={section.label} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">{section.label}</h2>
            <span className="text-xs uppercase tracking-widest text-slate-500">
              {section.exerciseIds.length} options
            </span>
          </div>
          <div className="space-y-2">
            {section.exerciseIds.map(id => {
              const exercise = getExercise(id);
              if (!exercise) return null;
              return (
                <Link to={`/exercise/${exercise.id}`} key={exercise.id} className="block">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 hover:border-emerald-200 hover:bg-white">
                    <div>
                      <p className="text-sm font-semibold text-ink">{exercise.name}</p>
                      <p className="text-xs text-slate-600">
                        {exercise.category} · {exercise.defaultReps} reps
                      </p>
                    </div>
                    <Tag label={exercise.bodyRegion} />
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default WorkoutDetailPage;
