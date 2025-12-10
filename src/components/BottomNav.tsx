import { NavLink } from "react-router-dom";
import React from "react";

const tabs = [
  { to: "/", label: "Workouts", icon: "🏋️" },
  { to: "/builder", label: "Builder", icon: "🛠️" },
  { to: "/ai-builder", label: "AI Builder", icon: "🤖" },
  { to: "/history", label: "History", icon: "🕑" }
];

const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl justify-around px-6 py-3">
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-xs font-semibold transition ${
                isActive ? "text-emerald-600" : "text-slate-500"
              }`
            }
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
