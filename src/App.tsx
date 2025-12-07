import { Link, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import WorkoutDetailPage from "./pages/WorkoutDetailPage";
import ExerciseDetailPage from "./pages/ExerciseDetailPage";

function App() {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link to="/" className="font-display text-xl font-semibold text-ink">
            Workout Logger
          </Link>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Offline ready
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-12 pt-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/workout/:workoutId" element={<WorkoutDetailPage />} />
          <Route path="/exercise/:exerciseId" element={<ExerciseDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
