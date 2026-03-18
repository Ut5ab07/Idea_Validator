"use client";

import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  where 
} from "firebase/firestore";

export default function ReviewSection({ ideaId, user, isOpen, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const q = query(
      collection(db, "ideas", ideaId, "reviews"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(reviewsData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [ideaId, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in to add a review.");
      return;
    }
    if (!newReview.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      await addDoc(collection(db, "ideas", ideaId, "reviews"), {
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        userPhoto: user.photoURL || null,
        content: newReview.trim(),
        rating: Number(rating),
        createdAt: serverTimestamp()
      });
      setNewReview("");
      setRating(5);
    } catch (err) {
      console.error("Error adding review:", err);
      setError("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-fade-in-up">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
          <h3 className="text-xl font-bold text-white font-display">Reviews ({reviews.length})</h3>
          <button 
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {/* Review Form */}
          {user ? (
            <form onSubmit={handleSubmit} className="mb-8 bg-white/5 p-5 rounded-xl border border-white/10">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase text-white/50">Add your review</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-lg transition-colors ${rating >= star ? 'text-amber-400' : 'text-white/20'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              placeholder="What do you think about this idea?"
              className="w-full bg-black/20 text-white rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500/50 min-h-[80px]"
              required
            />
            <div className="flex justify-between items-center">
              {error && <span className="text-red-400 text-xs">{error}</span>}
              <button
                type="submit"
                disabled={submitting}
                className="ml-auto bg-amber-500 text-black px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-amber-400 disabled:opacity-50 transition-all"
              >
                {submitting ? "Posting..." : "Post Review"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 text-center p-4 bg-white/5 rounded-xl border border-white/10 text-white/50 text-sm">
          Please sign in to leave a review.
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-white/20 py-8 animate-pulse">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center text-white/20 py-8 italic">No reviews yet. Be the first!</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.05]">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center text-[10px] font-bold text-white border border-white/10">
                    {review.userName[0].toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-white/80">{review.userName}</span>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-xs ${i < review.rating ? 'text-amber-400' : 'text-white/10'}`}>★</span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-white/70 leading-relaxed font-mono">{review.content}</p>
              <div className="mt-2 text-[10px] text-white/20">
                {review.createdAt?.seconds ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
              </div>
            </div>
          ))
        )}
      </div>
      </div>
      </div>
    </div>
  );
}