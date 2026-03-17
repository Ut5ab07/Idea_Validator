"use client";

const categoryColors = {
  LegalTech: { bg: "bg-blue-500/10", text: "text-blue-300", border: "border-blue-500/25" },
  CleanTech: { bg: "bg-green-500/10", text: "text-green-300", border: "border-green-500/25" },
  EdTech: { bg: "bg-sky-500/10", text: "text-sky-300", border: "border-sky-500/25" },
  FoodTech: { bg: "bg-orange-500/10", text: "text-orange-300", border: "border-orange-500/25" },
  HealthTech: { bg: "bg-rose-500/10", text: "text-rose-300", border: "border-rose-500/25" },
  SaaS: { bg: "bg-violet-500/10", text: "text-violet-300", border: "border-violet-500/25" },
  MediaTech: { bg: "bg-pink-500/10", text: "text-pink-300", border: "border-pink-500/25" },
  MarTech: { bg: "bg-yellow-500/10", text: "text-yellow-300", border: "border-yellow-500/25" },
};

const marketConfig = {
  Low: { color: "text-slate-400", bar: "w-1/4", bg: "bg-slate-400" },
  Medium: { color: "text-amber-300", bar: "w-2/4", bg: "bg-amber-300" },
  High: { color: "text-orange-300", bar: "w-3/4", bg: "bg-orange-400" },
  "Very High": { color: "text-green-300", bar: "w-full", bg: "bg-green-400" },
};

const difficultyColors = ["", "bg-green-400", "bg-lime-400", "bg-amber-400", "bg-orange-400", "bg-red-500"];

export default function IdeaCard({ idea, index, onDelete }) {
  const cat = categoryColors[idea.category] ?? {
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    border: "border-amber-500/25",
  };
  const market = marketConfig[idea.market || idea.marketPotential];

  return (
    <div
      className="group relative rounded-3xl border border-white/[0.05] bg-white/[0.015] p-8 hover:border-amber-500/30 hover:bg-white/[0.03] transition-all duration-500 animate-fade-in-up flex flex-col gap-6"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm("Are you sure you want to delete this idea?")) onDelete();
          }}
          className="absolute top-4 right-4 p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
          title="Delete Idea"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}

      {/* Hover glow */}
      <div className="absolute inset-0 rounded-3xl bg-amber-500/0 group-hover:bg-amber-500/[0.01] transition-colors duration-500 pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-display font-semibold text-xl text-white leading-tight flex-1 tracking-tight">
          {idea.title}
        </h3>
        <span
          className={`shrink-0 text-[10px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full border ${cat.bg} ${cat.text} ${cat.border}`}
        >
          {idea.category}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-white/50 leading-loose font-mono tracking-wide">{idea.description}</p>

      {/* Difficulty */}
      <div className="space-y-2 pt-2">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-white/20">Complexity</span>
          <span className="text-xs text-white/40 font-mono">{idea.difficulty} / 5</span>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                n <= idea.difficulty ? difficultyColors[idea.difficulty] : "bg-white/[0.05]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Market Potential */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-white/20">Market Potential</span>
          <span className={`text-xs font-bold tracking-wide font-display ${market.color}`}>
            {idea.marketPotential}
          </span>
        </div>
        <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${market.bar} ${market.bg} transition-all duration-1000 ease-out`}
            style={{ animationDelay: `${index * 100 + 400}ms` }}
          />
        </div>
      </div>
    </div>
  );
}
