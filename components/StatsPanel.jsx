"use client";

const difficultyLabel = (val) => {
  if (val <= 1.5) return "Very Easy";
  if (val <= 2.5) return "Easy";
  if (val <= 3.5) return "Moderate";
  if (val <= 4.5) return "Hard";
  return "Very Hard";
};

function StatCard({ label, value, sub, accent, icon }) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border bg-white/[0.02] backdrop-blur-md p-8 group hover:bg-white/[0.04] transition-all duration-500"
      style={{ borderColor: `${accent}33` }}
    >
      {/* Corner accent */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-[0.07] transition-opacity group-hover:opacity-10"
        style={{ background: accent }}
      />
      <div className="absolute top-6 right-6 text-2xl opacity-30 grayscale group-hover:grayscale-0 transition-all duration-500">{icon}</div>

      <p className="text-[10px] tracking-[0.2em] uppercase font-bold mb-4 opacity-70" style={{ color: `${accent}` }}>
        {label}
      </p>
      <p className="font-display text-4xl font-bold text-white mb-2">{value}</p>
      {sub && <p className="text-xs text-white/40 tracking-wide font-medium">{sub}</p>}

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 h-[3px] w-full bg-white/5">
        <div
          className="h-full w-1/3 group-hover:w-full transition-all duration-700 ease-out"
          style={{ background: accent }}
        />
      </div>
    </div>
  );
}

export default function StatsPanel({ total, mostCommonCategory, avgDifficulty }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <StatCard
        label="Total Ideas"
        value={total}
        sub={`Across all categories`}
        accent="#fbbf24"
        icon="💡"
      />
      <StatCard
        label="Top Category"
        value={mostCommonCategory}
        sub="Most represented"
        accent="#f97316"
        icon="📂"
      />
      <StatCard
        label="Avg Difficulty"
        value={`${avgDifficulty} / 5`}
        sub={difficultyLabel(parseFloat(avgDifficulty))}
        accent="#a78bfa"
        icon="⚡"
      />
    </div>
  );
}
