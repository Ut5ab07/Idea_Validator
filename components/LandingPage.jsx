"use client";

import { useState, useEffect } from "react";
import AuthModal from "./AuthModal";

export default function LandingPage({ stats, trendingIdeas }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate random particles on client side to avoid hydration mismatch
    const count = 30; // Number of particles
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1, // 1px to 4px
      duration: Math.random() * 10 + 10, // 10s to 20s
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.1
    }));
    setParticles(newParticles);
  }, []);

  const openAuth = () => setIsAuthModalOpen(true);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] animate-blob mix-blend-screen" />
          <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-screen" />
          <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-screen" />
      
          {/* Floating Light Particles */}
          {particles.map((p) => (
             <div 
               key={p.id}
               className="absolute rounded-full bg-amber-400 blur-[1px] animate-pulse"
               style={{
                 left: `${p.x}%`,
                 top: `${p.y}%`,
                 width: `${p.size}px`,
                 height: `${p.size}px`,
                 opacity: p.opacity,
                 animation: `float ${p.duration}s ease-in-out infinite, pulse-amber ${Math.random() * 3 + 2}s ease-in-out infinite`,
                 animationDelay: `${p.delay}s`
               }}
             />
          ))}
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold tracking-widest uppercase mb-8 animate-fade-in-up">
           <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
           Live Idea Validation
        </div>
        
        <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          Stop Building in <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">
             The Dark.
          </span>
        </h1>
        
        <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          Get brutal feedback, find your technical co-founder, and gauge market potential before writing a single line of code.
        </p>
        
        <button 
          onClick={openAuth}
          className="group relative px-8 py-4 bg-amber-500 text-black font-bold text-lg rounded-xl transition-all shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)] animate-fade-in-up hover:shadow-[0_0_60px_-10px_rgba(245,158,11,0.7)] hover:scale-105 active:scale-95" 
          style={{ animationDelay: '300ms' }}
        >
          <span className="relative z-10 flex items-center gap-2">
            Validate My Idea
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </span>
          <span className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 -z-10 bg-amber-400 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
        </button>

        {/* Floating Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
           <StatBox label="Ideas Validated" value={stats.totalIdeas || "100+"} delay={0} />
           <StatBox label="Reviews Given" value={stats.totalVotes || "500+"} delay={100} />
           <StatBox label="Active Builders" value={stats.totalUsers || "250+"} delay={200} />
           <StatBox label="Co-founder Matches" value={stats.matches || "12"} delay={300} />
        </div>
      </section>

      {/* --- TRENDING TEASER (Blurred) --- */}
      <section className="py-20 border-t border-white/5 relative bg-[#050508]">
        <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
                <div>
                   <h2 className="text-3xl font-display font-bold text-white mb-2">🔥 Trending Right Now</h2>
                   <p className="text-white/50">Top rated ideas from the community</p>
                </div>
                <div className="hidden md:block text-amber-500/50 text-sm font-mono animate-pulse">
                   • Live Activity
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* Overlay Gate */}
                <div className="absolute inset-0 z-20 backdrop-blur-[6px] bg-[#0a0a0f]/40 flex flex-col items-center justify-center border border-white/10 rounded-3xl">
                    <div className="p-8 bg-[#0a0a0f] border border-amber-500/20 rounded-2xl text-center shadow-2xl shadow-amber-500/10 max-w-md transform hover:scale-105 transition-transform duration-500">
                        <div className="text-4xl mb-4">🔒</div>
                        <h3 className="text-xl font-bold text-white mb-2">Unlock These Insights</h3>
                        <p className="text-white/50 mb-6">Sign in to see full details, market analysis, and join the discussion.</p>
                        <button 
                            onClick={openAuth}
                            className="w-full py-3 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-bold rounded-xl transition-all"
                        >
                            Reveal Ideas
                        </button>
                    </div>
                </div>

                {/* Blurred Cards Content */}
                {trendingIdeas && trendingIdeas.length > 0 ? trendingIdeas.slice(0, 3).map((idea, i) => (
                    <div key={i} className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 flex flex-col gap-4 opacity-50 select-none pointer-events-none">
                        <div className="flex justify-between">
                            <div className="h-6 w-24 bg-white/10 rounded-full" />
                            <div className="h-6 w-8 bg-amber-500/20 rounded-full" />
                        </div>
                        <div className="h-8 w-3/4 bg-white/20 rounded-lg" />
                        <div className="space-y-2">
                            <div className="h-4 w-full bg-white/5 rounded" />
                            <div className="h-4 w-full bg-white/5 rounded" />
                            <div className="h-4 w-2/3 bg-white/5 rounded" />
                        </div>
                        <div className="mt-auto pt-4 flex gap-4">
                            <div className="h-10 w-full bg-white/5 rounded-xl" />
                        </div>
                    </div>
                )) : (
                    // Fallback skeletons if data isn't loaded yet
                    [1,2,3].map(i => (
                        <div key={i} className="h-64 rounded-3xl bg-white/[0.03] border border-white/5" />
                    ))
                )}
            </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon="🎯"
            title="Market Validation"
            desc="Don't guess. Let the crowd rate your Market Potential and Difficulty before you commit instantly."
          />
          <FeatureCard 
            icon="🤝"
            title="Find Co-founders"
            desc="Flag your ideas with 'Dev Needed' or 'Co-founder Needed' to attract the right builders."
          />
          <FeatureCard 
            icon="💬"
            title="Brutal Feedback"
            desc="Get honest, anonymous reviews from other founders. No sugar-coating, just improvements."
          />
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-20 text-center border-t border-white/10 bg-gradient-to-b from-[#0a0a0f] to-amber-900/10 z-10 relative">
          <h2 className="text-3xl font-bold text-white mb-8">Ready to launch?</h2>
          <button 
             onClick={openAuth}
             className="px-10 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all font-mono tracking-tight"
          >
             Start Validating Now
          </button>
      </section>

    </div>
  );
}


function StatBox({ label, value, delay }) {
    return (
        <div 
            className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-500/30 transition-colors group animate-float shadow-lg backdrop-blur-sm"
            style={{ animationDelay: `${delay * 5}ms` }}
        >
            <div className="text-3xl md:text-4xl font-display font-bold text-white mb-2 group-hover:text-amber-400 transition-colors bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent group-hover:text-amber-400">
                {value}
            </div>
            <div className="text-xs text-white/40 uppercase tracking-widest font-mono">
                {label}
            </div>
        </div>
    )
}

function FeatureCard({ icon, title, desc }) {
    return (
        <div className="p-8 rounded-3xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-white/50 leading-relaxed">
                {desc}
            </p>
        </div>
    )
}