import React from "react";

interface TagProps {
  label: string;
  tone?: "emerald" | "slate";
}

const toneMap = {
  emerald: "bg-emerald-100 text-emerald-700",
  slate: "bg-slate-200 text-slate-700"
};

const Tag: React.FC<TagProps> = ({ label, tone = "slate" }) => {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneMap[tone]}`}>{label}</span>;
};

export default Tag;
