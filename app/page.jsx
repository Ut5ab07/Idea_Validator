"use client";

import { useState, useMemo, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, where, writeBatch, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../lib/firebase";
import Navbar from "../components/Navbar";
import StatsPanel from "../components/StatsPanel";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import IdeaCard from "../components/IdeaCard";
import NewIdeaForm from "../components/NewIdeaForm";
import { ideas as initialIdeas } from "../data/ideas";

export default function Home() {
  const [allIdeas, setAllIdeas] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ category: "All", difficulty: "All", marketPotential: "All" });
  const [editingIdea, setEditingIdea] = useState(null);
  const [user, setUser] = useState(null);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Load ideas from Cloud Firestore
  useEffect(() => {
    // We want all ideas, but you can add where("visibility", "==", "active") if needed
    const q = query(
      collection(db, "ideas"),
      orderBy("createdAt", "desc")
    );
    
    // Using onSnapshot for real-time updates as requested
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ideasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Merge with initial mock data if you want to keep it, OR simply replace.
      // Since requirements say "Use the existing ideas data fetched from Firestore", 
      // let's prefer Firestore, but maybe fallback or merge if empty to not break the UI initially.
      // For now, let's purely use Firestore + initialIdeas as a seed if needed, 
      // but simpler is to setAllIdeas(ideasData) if you have seeded the DB.
      // If the DB is empty, it will be empty.
      setAllIdeas(ideasData);
    });

    return () => unsubscribe();
  }, []);

  // Compute Trending Ideas: Top 3 by votes
  const trendingIdeas = useMemo(() => {
    // Sort by votes (desc) -> createdAt (desc)
    // Filter active visibility/status
    return [...allIdeas]
      .filter(i => (i.visibility === 'active' || !i.visibility) && (i.status === 'active' || !i.status))
      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
      .slice(0, 3);
  }, [allIdeas]);

  const handleAddIdea = (newIdea) => {
    // Handled by Firestore listener automatically
  };

  const handleUpdateIdea = (updatedIdea) => {
     // Handled by Firestore listener automatically
    setEditingIdea(null);
  };

  const handleDeleteIdea = (id) => {
     // Handled by Firestore listener automatically
  };

  const filtered = useMemo(() => {
    return allIdeas.filter((idea) => {
      const matchSearch =
        idea.title.toLowerCase().includes(search.toLowerCase()) ||
        idea.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = filters.category === "All" || idea.category === filters.category;
      const matchDiff = filters.difficulty === "All" || String(idea.difficulty) === filters.difficulty;
      const matchMarket = filters.marketPotential === "All" || idea.marketPotential === filters.marketPotential;
      return matchSearch && matchCat && matchDiff && matchMarket;
    });
  }, [search, filters, allIdeas]);

  const mostCommonCategory = useMemo(() => {
    const counts = {};
    allIdeas.forEach((i) => (counts[i.category] = (counts[i.category] || 0) + 1));
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  }, [allIdeas]);

  const avgDifficulty = useMemo(() => {
    const avg = allIdeas.reduce((s, i) => s + i.difficulty, 0) / allIdeas.length;
    return avg.toFixed(1);
  }, [allIdeas]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-mono">
      
      {/* Ambient background grid */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(251,191,36,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(251,191,36,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[100px] translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="relative z-10 transition-all duration-500">
        <Navbar user={user} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-16">
          <StatsPanel
            total={allIdeas.length}
            mostCommonCategory={mostCommonCategory}
            avgDifficulty={avgDifficulty}
          />
          
          <div className="flex justify-center">
             <NewIdeaForm 
                onAdd={handleAddIdea} 
                onUpdate={handleUpdateIdea}
                initialData={editingIdea}
                onCancel={() => setEditingIdea(null)}
                isOpenProp={editingIdea ? true : undefined}
                user={user}
             />
          </div>

          {/* Trending Section */}
          {trendingIdeas.length > 0 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-4">
                 <div className="h-8 w-1 bg-amber-500 rounded-full" />
                 <h2 className="text-2xl font-bold text-white tracking-tight">
                    🔥 Trending Ideas
                 </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {trendingIdeas.map((idea, i) => (
                  <IdeaCard 
                    key={`trending-${idea.id}`} 
                    idea={idea} 
                    index={i} 
                    onDelete={() => handleDeleteIdea(idea.id)} 
                    onEdit={setEditingIdea}
                    isTrending={true}
                    user={user}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
            <SearchBar value={search} onChange={setSearch} />
            <FilterBar filters={filters} onChange={setFilters} ideas={allIdeas} />
          </div>

          {/* Results count */}
          <div className="flex items-center gap-6 opacity-60">
            <div className="h-px flex-1 bg-amber-500/20" />
            <span className="text-amber-400 text-xs tracking-[0.2em] uppercase font-bold">
              {filtered.length} idea{filtered.length !== 1 ? "s" : ""} found
            </span>
            <div className="h-px flex-1 bg-amber-500/20" />
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filtered.map((idea, i) => (
                <IdeaCard 
                  key={idea.id || i} 
                  idea={idea} 
                  index={i} 
                  onDelete={() => handleDeleteIdea(idea.id)}
                  onEdit={setEditingIdea}
                  user={user}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 text-amber-400/40">
              <div className="text-6xl mb-6 opacity-50">⌀</div>
              <p className="text-sm tracking-[0.2em] uppercase font-bold">No matching ideas</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
