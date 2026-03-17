"use client";

export default function Navbar() {
  return (
    <header className="border-b border-white/[0.05] bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 bg-amber-400 rotate-45 rounded-md" />
            <div className="absolute inset-[3px] bg-[#0a0a0f] rotate-45 rounded-md" />
            <div className="absolute inset-[6px] bg-amber-400 rotate-45 rounded-md" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">
            Idea<span className="text-amber-400">Validator</span>
          </span>
        </div>

        {/* Center tag */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-amber-400/50 tracking-widest uppercase">
          <span className="animate-pulse-amber">◆</span>
          <span>Startup Command Center</span>
          <span className="animate-pulse-amber">◆</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 tracking-wider">LIVE</span>
          </div>
          <button className="w-8 h-8 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15 transition-colors flex items-center justify-center text-amber-400 text-sm">
            ⊕
          </button>
        </div>
      </div>
    </header>
  );
}
