"use client";

import { useState } from "react";
import Link from "next/link";
import { auth, db } from "../lib/firebase";
import { doc, updateDoc, deleteDoc, increment, arrayUnion, arrayRemove } from "firebase/firestore";
import ReviewSection from "./ReviewSection";

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

export default function IdeaCard({ idea, index, onDelete, onEdit, isTrending, user }) {
  // Check if current user is the owner of the idea. 
  const isOwner = user && idea.userId === user.uid;
  const [upvoting, setUpvoting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  
  const hasVoted = user && idea.votedBy?.includes(user.uid);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this idea?")) return;
    
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "ideas", idea.id));
      // onDelete prop notifies parent to update UI if needed (though onSnapshot usually handles it)
      if (onDelete) onDelete(idea.id);
    } catch (err) {
      console.error("Error deleting idea:", err);
      alert("Failed to delete idea.");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpvote = async (e) => {
    e.stopPropagation();
    if (upvoting) return;

    if (!user) {
        alert("Please sign in to vote!");
        return;
    }
    
    // Only vote if it has a valid string ID (Firestore ID)
    if (typeof idea.id === 'number') {
        alert("This is a demo idea (local data) and cannot be upvoted separately. Create a new idea to test upvoting!");
        return;
    }

    setUpvoting(true);

    try {
        const ideaRef = doc(db, "ideas", idea.id);
        if (hasVoted) {
            await updateDoc(ideaRef, {
                votes: increment(-1),
                votedBy: arrayRemove(user.uid)
            });
        } else {
            await updateDoc(ideaRef, {
                votes: increment(1),
                votedBy: arrayUnion(user.uid)
            });
        }
    } catch (err) {
        console.error("Error upvoting:", err);
    } finally {
        setUpvoting(false);
    }
  };

  const cat = categoryColors[idea.category] ?? {
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    border: "border-amber-500/25",
  };
  const market = marketConfig[idea.market || idea.marketPotential];

  const formatTimestamp = (ts) => {
    if (!ts) return null;
    const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const createdDate = formatTimestamp(idea.createdAt);
  const updatedDate = formatTimestamp(idea.updatedAt);
  const showUpdated = updatedDate && updatedDate !== createdDate;

  return (
    <div
      className={`group relative rounded-3xl border border-white/[0.05] bg-white/[0.015] p-8 transition-all duration-500 animate-fade-in-up flex flex-col gap-6 ${isTrending ? 'shadow-[0_0_50px_-12px_rgba(245,158,11,0.2)] border-amber-500/20' : 'hover:border-amber-500/30 hover:bg-white/[0.03]'}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-3xl bg-amber-500/0 group-hover:bg-amber-500/[0.01] transition-colors duration-500 pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-display font-semibold text-xl text-white leading-tight flex-1 tracking-tight">
          {idea.title}
        </h3>
        {/* Upvote Button - Mobile/Card Top */}
        <button
            onClick={handleUpvote}
            disabled={upvoting}
            className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                hasVoted 
                ? 'bg-amber-500 text-black border-amber-500 hover:bg-amber-400' 
                : 'bg-white/5 text-white/40 border-white/10 hover:border-amber-500/50 hover:text-amber-400'
            }`}
        >
            <span className="text-sm border-r border-current/20 pr-2">👍</span>
            <span className="text-xs font-bold font-mono">{idea.votes || 0}</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <span
          className={`shrink-0 text-[10px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full border ${cat.bg} ${cat.text} ${cat.border}`}
        >
          {idea.category}
        </span>
        {/* Render collaborator badges if true or string "true" */}
        {(idea.lookingForCofounder === true || idea.lookingForCofounder === "true") && (
          <span className="shrink-0 text-[10px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 text-amber-200 animate-pulse">
            Cofounder Needed
          </span>
        )}
        {(idea.lookingForDev === true || idea.lookingForDev === "true") && (
          <span className="shrink-0 text-[10px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full border border-blue-500/25 bg-blue-500/10 text-blue-200 animate-pulse">
            Dev Needed
          </span>
        )}
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
            {idea.market || idea.marketPotential}
          </span>
        </div>
        <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${market.bar} ${market.bg} transition-all duration-1000 ease-out`}
            style={{ animationDelay: `${index * 100 + 400}ms` }}
          />
        </div>
      </div>

      {/* Footer Actions & Timestamps */}
      <div className="pt-4 mt-auto border-t border-white/[0.05] flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {isOwner && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(idea);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-2 text-white/70 hover:text-amber-400 bg-white/5 hover:bg-white/10 rounded-full transition-all"
                  title="Edit Idea"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-2 text-white/70 hover:text-red-400 bg-white/5 hover:bg-white/10 rounded-full transition-all"
                  title="Delete Idea"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowReviews(true);
                }}
                className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
                Reviews
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowReviews(true);
                }}
                className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
            >
                Add Review
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-[10px] text-white/40 font-mono">
            {idea.userId ? (
             <Link href={`/profile/${idea.userId}`} className="w-fit flex items-center gap-2 group/user hover:text-white transition-colors mb-2 pb-2 border-b border-white/10">
                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 overflow-hidden group-hover/user:border-amber-400/50 transition-colors">
                    {idea.userPhoto ? (
                        <img src={idea.userPhoto} alt={idea.userName || "User"} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-white/70 bg-amber-500/10">
                            {(idea.userName || "A")[0]?.toUpperCase()}
                        </div>
                    )}
                </div>
                <span className="group-hover/user:text-amber-400 transition-colors font-bold text-xs text-white/70">By {idea.userName || "Anonymous"}</span>
            </Link>
            ) : (
                <div className="w-fit flex items-center gap-2 mb-2 pb-2 border-b border-white/10 opacity-50 cursor-default">
                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-bold text-white/50">?</div>
                    <span className="font-bold text-xs text-white/50">By Anonymous</span>
                </div>
            )}
          <span>Created: {createdDate}</span>
          {showUpdated && <span>Updated: {updatedDate}</span>}
        </div>

        <ReviewSection 
          ideaId={idea.id} 
          user={user} 
          ideaOwnerId={idea.userId}
          isOpen={showReviews} 
          onClose={() => setShowReviews(false)}
        />
      </div>
    </div>
  );
}
