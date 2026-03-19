"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import Navbar from "../../components/Navbar";
import IdeaCard from "../../components/IdeaCard";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myIdeas, setMyIdeas] = useState([]);
  const [reviews, setReviews] = useState([]);
  const router = useRouter();

  // 1. Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/"); // Redirect if not logged in
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // 2. Fetch User's Ideas
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "ideas"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ideasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMyIdeas(ideasData);
    });

    return () => unsubscribe();
  }, [user]);

  // 3. Fetch Reviews for User's Ideas
  useEffect(() => {
    if (myIdeas.length === 0) {
      setReviews([]);
      return;
    }

    const unsubscribers = [];

    myIdeas.forEach((idea) => {
      const q = query(
        collection(db, "ideas", idea.id, "reviews"),
        orderBy("createdAt", "desc")
      );

      const unsub = onSnapshot(q, (snapshot) => {
        const ideaReviews = snapshot.docs.map(doc => ({
          id: doc.id,
          ideaId: idea.id,
          ideaTitle: idea.title,
          ...doc.data()
        }));
        
        setReviews(prevReviews => {
          // Remove old reviews for this idea and add new ones
          const filtered = prevReviews.filter(r => r.ideaId !== idea.id);
          return [...filtered, ...ideaReviews].sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
        });
      });
      unsubscribers.push(unsub);
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [myIdeas]);

  // 4. Calculate Stats
  const stats = useMemo(() => {
    const totalIdeas = myIdeas.length;
    const totalVotes = myIdeas.reduce((sum, idea) => sum + (idea.votes || 0), 0);
    const totalReviews = reviews.length;
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : 0;

    return { totalIdeas, totalVotes, totalReviews, avgRating };
  }, [myIdeas, reviews]);

  if (loading) return <div className="text-white text-center mt-20">Loading dashboard...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-amber-500/30">
      <Navbar user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* User Identity Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-orange-600 p-[2px]">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a0f] flex items-center justify-center">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold font-display text-amber-400">
                    {user.email?.[0].toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display text-white">
                {user.displayName || "Anonymous Creator"}
              </h1>
              <p className="text-white/50 font-mono text-sm mt-1">{user.email}</p>
            </div>
          </div>
          
          <div className="flex gap-4">
             {/* Action buttons could go here */}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <StatCard label="Total Ideas" value={stats.totalIdeas} icon="💡" />
          <StatCard label="Total Upvotes" value={stats.totalVotes} icon="🔥" />
          <StatCard label="Reviews Received" value={stats.totalReviews} icon="💬" />
          <StatCard label="Avg Rating" value={stats.avgRating} icon="⭐" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: My Ideas */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold font-display border-b border-white/10 pb-4">
              My Published Ideas
            </h2>
            
            {myIdeas.length === 0 ? (
              <div className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-8 text-center">
                <p className="text-white/50 mb-4">You haven't published any ideas yet.</p>
                <button 
                  onClick={() => router.push("/")}
                  className="px-6 py-2 bg-amber-400 text-black font-bold rounded-lg hover:bg-amber-300 transition-colors"
                >
                  Create Your First Idea
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {myIdeas.map((idea, index) => (
                  <IdeaCard 
                    key={idea.id} 
                    idea={idea} 
                    index={index} 
                    user={user}
                    // Pass simplified callbacks as we might handle edit/delete differently here or reuse logic
                    onDelete={() => {}} 
                    onEdit={() => {}}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Recent Reviews */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-display border-b border-white/10 pb-4">
              Recent Reviews
            </h2>
            
            <div className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-1 max-h-[600px] overflow-y-auto custom-scrollbar">
              {reviews.length === 0 ? (
                <div className="p-8 text-center text-white/50">
                  No reviews yet. Share your ideas to get feedback!
                </div>
              ) : (
                <div className="space-y-1">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 hover:bg-white/[0.02] rounded-xl transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-amber-400 font-mono text-xs">
                          {review.rating} / 5 ⭐ 
                        </span>
                        <span className="text-white/30 text-[10px]">
                          {review.createdAt?.seconds ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                        </span>
                      </div>
                      <p className="text-white/80 text-sm mb-3 line-clamp-3">"{review.content}"</p>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-white/10 overflow-hidden">
                                {review.userPhoto ? (
                                    <img src={review.userPhoto} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[8px] text-white/50">
                                        {review.userName?.[0]}
                                    </div>
                                )}
                            </div>
                            <span className="text-xs text-white/50 truncate max-w-[100px]">{review.userName}</span>
                         </div>
                         <span className="text-[10px] text-white/30 bg-white/5 px-2 py-1 rounded-full truncate max-w-[120px]">
                            on {review.ideaTitle}
                         </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-[#0a0a0f] border border-white/5 p-6 rounded-2xl hover:border-amber-500/20 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <span className="text-white/50 text-sm font-mono uppercase tracking-wider">{label}</span>
        <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
      </div>
      <div className="text-4xl font-bold font-display text-white group-hover:text-amber-400 transition-colors">
        {value}
      </div>
    </div>
  );
}
