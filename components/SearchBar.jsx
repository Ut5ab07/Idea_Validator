"use client";

export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative flex-1 min-w-0">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400/50 text-sm select-none pointer-events-none">
        ⌕
      </div>
      <input
        type="text"
        placeholder="Search ideas, descriptions..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/[0.03] border border-amber-500/20 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-amber-400/50 focus:bg-white/[0.05] transition-all font-mono tracking-wide"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors text-xs"
        >
          ✕
        </button>
      )}
    </div>
  );
}
