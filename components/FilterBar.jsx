"use client";

import { useMemo } from "react";

function Select({ label, value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white/[0.03] border border-amber-500/20 rounded-xl pl-4 pr-9 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50 focus:bg-white/[0.05] transition-all font-mono cursor-pointer min-w-[140px]"
      >
        <option value="All" className="bg-[#0a0a0f]">
          {label}: All
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[#0a0a0f]">
            {opt}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400/50 pointer-events-none text-xs">
        ▾
      </div>
    </div>
  );
}

export default function FilterBar({ filters, onChange, ideas }) {
  const categories = useMemo(() => [...new Set(ideas.map((i) => i.category))].sort(), [ideas]);
  const potentials = ["Low", "Medium", "High", "Very High"];

  return (
    <div className="flex flex-wrap gap-2">
      <Select
        label="Category"
        value={filters.category}
        onChange={(v) => onChange({ ...filters, category: v })}
        options={categories}
      />
      <Select
        label="Difficulty"
        value={filters.difficulty}
        onChange={(v) => onChange({ ...filters, difficulty: v })}
        options={["1", "2", "3", "4", "5"]}
      />
      <Select
        label="Market"
        value={filters.marketPotential}
        onChange={(v) => onChange({ ...filters, marketPotential: v })}
        options={potentials}
      />
    </div>
  );
}
