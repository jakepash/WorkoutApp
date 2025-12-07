import { Link } from "react-router-dom";
import Card from "../components/Card";
import Tag from "../components/Tag";
import { WORKOUT_TEMPLATES } from "../data/workouts";

const HomePage = () => {
  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25rem] text-slate-500">Choose your day</p>
        <h1 className="font-display text-2xl font-semibold text-ink">Workout templates</h1>
        <p className="text-sm text-slate-600">
          Pick the day that fits how you feel. Each template lists sections with options—choose 5–7 total moves.
        </p>
      </section>
      <div className="space-y-3">
        {WORKOUT_TEMPLATES.map(template => (
          <Link key={template.id} to={`/workout/${template.id}`}>
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
  );
};

export default HomePage;
