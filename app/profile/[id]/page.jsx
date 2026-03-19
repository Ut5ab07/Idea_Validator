"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../lib/firebase";
import Navbar from "../../../components/Navbar";
import IdeaCard from "../../../components/IdeaCard";

export default function PublicProfile() {
  const { id } = useParams(); // Retrieves userId from the route
  const [currentUser, setCurrentUser] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsCount, setReviewsCount] = useState(0);

  // Monitor Auth State (needed for IdeaCard voting logic)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Ideas for this Profile User
  useEffect(() => {
    if (!id) return;

    const q = query(
      collection(db, "ideas"),
      where("userId", "==", id),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ideasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIdeas(ideasData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  // Fetch Reviews Count across all this user's ideas
  const [reviewCountsMap, setReviewCountsMap] = useState({});

  useEffect(() => {
      if (ideas.length === 0) return;
      
      const unsubs = ideas.map(idea => {
          return onSnapshot(collection(db, "ideas", idea.id, "reviews"), (snap) => {
              setReviewCountsMap(prev => ({...prev, [idea.id]: snap.size}));
          });
      });
      return () => unsubs.forEach(u => u());
  }, [ideas]);

  const stats = useMemo(() => {
    const totalIdeas = ideas.length;
    const totalVotes = ideas.reduce((sum, idea) => sum + (idea.votes || 0), 0);
    const totalReviews = Object.values(reviewCountsMap).reduce((a, b) => a + b, 0);
    return { totalIdeas, totalVotes, totalReviews };
  }, [ideas, reviewCountsMap]);

  // Derive User Info from the first idea found (since we don't have a users collection)
  // If user has no ideas, we can't show much info other than "User ID: ..."
  const profileUser = useMemo(() => {
    if (ideas.length > 0) {
        return {
            displayName: ideas[0].userName,
            photoURL: ideas[0].userPhoto,
            email: "Hidden" // Don't show email publicly
        };
    }
    return null;
  }, [ideas]);

  if (loading) return <div className="text-white text-center mt-20">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-amber-500/30">
      <Navbar user={currentUser} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mb-16 animate-fade-in-up">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-orange-600 p-[2px] mb-6 shadow-2xl shadow-amber-500/20">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a0f] flex items-center justify-center">
                {profileUser?.photoURL ? (
                  <img src={profileUser.photoURL} alt={profileUser.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold font-display text-amber-400">
                    {profileUser?.displayName?.[0]?.toUpperCase() || "?"}
                  </span>
                )}
              </div>
            </div>
            <h1 className="text-4xl font-bold font-display text-white mb-2">
              {profileUser?.displayName || "Anonymous User"}
            </h1>
            <p className="text-white/40 font-mono text-sm">
                Member since {ideas.length > 0 && ideas[ideas.length-1].createdAt ? new Date(ideas[ideas.length-1].createdAt.seconds * 1000).getFullYear() : "Recently"}
            </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-20 max-w-4xl mx-auto">
          <StatCard label="Ideas Published" value={stats.totalIdeas} icon="💡" />
          <StatCard label="Total Upvotes" value={stats.totalVotes} icon="🔥" />
          <StatCard label="Reviews Received" value={stats.totalReviews} icon="💬" />
        </div>

        {/* Ideas Grid */}
        <div className="space-y-8">
            <h2 className="text-2xl font-bold font-display border-b border-white/10 pb-4">
              Published Ideas
            </h2>
            
            {ideas.length === 0 ? (
              <div className="text-center py-20 bg-[#0a0a0f] border border-white/5 rounded-3xl">
                <p className="text-white/30 text-lg">This user hasn't published any ideas yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {ideas.map((idea, index) => (
                  <IdeaCard 
                    key={idea.id} 
                    idea={idea} 
                    index={index} 
                    user={currentUser}
                    onDelete={() => {}} // Viewer cannot delete
                    onEdit={() => {}}   // Viewer cannot edit
                  />
                ))}
              </div>
            )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-[#0a0a0f] border border-white/5 p-6 rounded-2xl hover:border-amber-500/20 transition-all group text-center">
      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300 inline-block">{icon}</div>
      <div className="text-3xl font-bold font-display text-white group-hover:text-amber-400 transition-colors mb-1">
        {value}
      </div>
      <div className="text-white/40 text-xs font-mono uppercase tracking-wider">{label}</div>
    </div>
  );
}