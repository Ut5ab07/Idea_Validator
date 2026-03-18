"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  getDocs 
} from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { isAdmin } from "../../lib/roles";
import Navbar from "../../components/Navbar";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsMap, setReviewsMap] = useState({}); // { ideaId: [reviews] }
  const [loadingReviews, setLoadingReviews] = useState({}); // { ideaId: boolean }

  // 1. Auth Check - Client Side Protection
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Check if logged in & is admin
      if (!currentUser || !isAdmin(currentUser)) {
        router.push("/");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 2. Fetch All Ideas
  useEffect(() => {
    if (!user) return; // Wait for user

    const q = query(collection(db, "ideas"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ideasData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setIdeas(ideasData);
      setLoading(false);
    }, (error) => {
      console.error("Admin fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 3. Delete Idea Function
  const handleDeleteIdea = async (ideaId) => {
    if (!window.confirm("CRITICAL WARNING: Are you sure you want to delete this idea? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "ideas", ideaId));
      // No need to update state manually, onSnapshot handles it
      alert("Idea deleted successfully.");
    } catch (err) {
      console.error("Error deleting idea:", err);
      alert("Failed to delete idea: " + err.message);
    }
  };

  // 4. Fetch Reviews for a specific Idea
  const fetchReviews = async (ideaId) => {
    if (reviewsMap[ideaId]) {
      // Toggle logic: if already loaded, we might just want to hide/show, 
      // but for simplicity let's just re-fetch or use state to toggle visibility UI
      // Let's implement toggle in the render, this function just ensures data.
      return;
    }

    setLoadingReviews(prev => ({ ...prev, [ideaId]: true }));
    try {
      const q = query(collection(db, "ideas", ideaId, "reviews"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      setReviewsMap(prev => ({ ...prev, [ideaId]: reviews }));
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoadingReviews(prev => ({ ...prev, [ideaId]: false }));
    }
  };

  // 5. Delete Review
  const handleDeleteReview = async (ideaId, reviewId) => {
     if (!window.confirm("Are you sure you want to delete this review?")) return;

     try {
       await deleteDoc(doc(db, "ideas", ideaId, "reviews", reviewId));
       
       // Update local state since reviews aren't on a live snapshot for every single idea
       setReviewsMap(prev => ({
         ...prev,
         [ideaId]: prev[ideaId].filter(r => r.id !== reviewId)
       }));
     } catch (err) {
       console.error("Delete review error:", err);
       alert("Failed to delete review.");
     }
  };

  if (loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">Loading Admin Panel...</div>;
  if (!user) return null; // Will redirect

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-mono">
      <Navbar user={user} />
      
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-display font-bold text-red-500">Admin Dashboard</h1>
            <div className="text-xs bg-red-500/10 border border-red-500/20 px-3 py-1 rounded text-red-400">
                Logged in as: {user.email}
            </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-xs uppercase text-white/50 tracking-wider">
                            <th className="p-4">Idea</th>
                            <th className="p-4">Author</th>
                            <th className="p-4">Stats</th>
                            <th className="p-4">Dates</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {ideas.map(idea => (
                            <IdeaRow 
                                key={idea.id} 
                                idea={idea} 
                                onDeleteIdea={handleDeleteIdea}
                                reviews={reviewsMap[idea.id]}
                                onLoadReviews={() => fetchReviews(idea.id)}
                                loadingReviews={loadingReviews[idea.id]}
                                onDeleteReview={handleDeleteReview}
                            />
                        ))}
                        {ideas.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-white/30 italic">No ideas found in database.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  );
}

function IdeaRow({ idea, onDeleteIdea, reviews, onLoadReviews, loadingReviews, onDeleteReview }) {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        if (!expanded && !reviews) {
            onLoadReviews();
        }
        setExpanded(!expanded);
    }

    return (
        <>
            <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 max-w-xs">
                    <div className="font-bold text-white truncate" title={idea.title}>{idea.title || "Untitled"}</div>
                    <div className="text-xs text-white/40 truncate mt-1">{idea.id}</div>
                    <div className="mt-2 text-[10px] inline-block px-2 py-0.5 rounded border border-white/10 bg-white/5 text-white/60">
                        {idea.category}
                    </div>
                </td>
                <td className="p-4">
                    <div className="text-sm">{idea.userName || "Anonymous"}</div>
                    <div className="text-xs text-white/30">{idea.userId?.substring(0,8)}...</div>
                </td>
                <td className="p-4 text-sm">
                    <div className="flex gap-3">
                        <span title="Votes">👍 {idea.votes || 0}</span>
                        {/* If you had actual review counts saved on idea doc, trigger fetching to verify */}
                        <span title="Reviews" className="cursor-help">💬 ?</span> 
                    </div>
                </td>
                <td className="p-4 text-xs text-white/40">
                    <div>Created: {idea.createdAt?.seconds ? new Date(idea.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</div>
                </td>
                <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={toggleExpand}
                            className="px-3 py-1.5 text-xs font-bold border border-white/10 hover:bg-white/10 rounded transition-colors text-blue-300"
                        >
                            {expanded ? "Hide Reviews" : "Manage Reviews"}
                        </button>
                        <button 
                            onClick={() => onDeleteIdea(idea.id)}
                            className="px-3 py-1.5 text-xs font-bold bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 rounded transition-colors"
                        >
                            Delete Idea
                        </button>
                    </div>
                </td>
            </tr>
            {expanded && (
                <tr className="bg-black/20">
                    <td colSpan="5" className="p-4 pl-12 border-b border-white/5 shadow-inner">
                        <h4 className="text-xs font-bold uppercase text-white/30 mb-4 tracking-widest">Reviews & Comments</h4>
                        
                        {loadingReviews && <div className="text-xs animate-pulse text-white/50">Loading reviews...</div>}
                        
                        {!loadingReviews && reviews && reviews.length === 0 && (
                            <div className="text-sm text-white/30 italic">No reviews found for this idea.</div>
                        )}

                        {!loadingReviews && reviews && reviews.length > 0 && (
                            <div className="space-y-3">
                                {reviews.map(review => (
                                    <div key={review.id} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-white/[0.03] border border-white/5">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-amber-400">{review.rating} ★</span>
                                                <span className="text-[10px] text-white/30">From: {review.userName || "Anon"}</span>
                                            </div>
                                            <p className="text-sm text-white/80">{review.text}</p>
                                        </div>
                                        <button 
                                            onClick={() => onDeleteReview(idea.id, review.id)}
                                            className="text-red-500/50 hover:text-red-500 p-1 transition-colors"
                                            title="Delete Review"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 6h18"></path>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </td>
                </tr>
            )}
        </>
    );
}
