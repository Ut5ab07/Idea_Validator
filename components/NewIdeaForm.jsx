"use client";

import { useState, useEffect } from "react";
import { db, auth } from "../lib/firebase";
import { collection, addDoc, updateDoc, doc, query, where, getDocs, serverTimestamp } from "firebase/firestore";

const categories = [
  "LegalTech",
  "CleanTech",
  "EdTech",
  "FoodTech",
  "HealthTech",
  "SaaS",
  "MediaTech",
  "MarTech",
];

const difficulties = [1, 2, 3, 4, 5];
const marketPotentials = ["Low", "Medium", "High", "Very High"];
const expiryOptions = [
  { label: "No Expiry", value: "none" },
  { label: "24 Hours", value: "24h" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
];

export default function NewIdeaForm({ onAdd, onUpdate, initialData, onCancel, isOpenProp, user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showReview, setShowReview] = useState(false);
  
  // Use isOpenProp if provided (controlled mode), otherwise rely on local isOpen
  const isControlled = typeof isOpenProp !== 'undefined';
  const showForm = isControlled ? isOpenProp : isOpen;
  const isEditing = !!initialData;

  const [formData, setFormData] = useState({
    title: "",
    category: categories[0],
    difficulty: 3,
    market: "Medium",
    description: "",
    problem: "",
    expiry: "none"
  });

  // Pre-fill form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        category: initialData.category || categories[0],
        difficulty: initialData.difficulty || 3,
        market: initialData.market || initialData.marketPotential || "Medium",
        description: initialData.description || "",
        problem: initialData.problem || "",
        expiry: "none" // Editing expiry might be tricky if we don't store the option key
      });
    } else {
       // Reset if switching from edit to create
       setFormData({
        title: "",
        category: categories[0],
        difficulty: 3,
        market: "Medium",
        description: "",
        problem: "",
        expiry: "none"
      });
    }
  }, [initialData]);

  const calculateExpiry = (option) => {
    if (option === "none") return null;
    const now = new Date();
    switch (option) {
      case "24h": return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case "7d": return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case "30d": return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      default: return null;
    }
  };

  const handleReview = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.problem.trim()) {
      setError("Please fill in all required fields");
      return;
    }
    setError(null);
    setShowReview(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        // --- UPDATE LOGIC ---
        const updates = {
          title: formData.title.trim(),
          category: formData.category,
          difficulty: Number(formData.difficulty),
          market: formData.market,
          description: formData.description.trim(),
          problem: formData.problem.trim(),
          marketPotential: formData.market, // Ensure compatibility with existing data structure if needed
          updatedAt: serverTimestamp(),
        };

        if (initialData.id && typeof initialData.id === 'string' && initialData.id.length > 20) {
           const ideaRef = doc(db, "ideas", initialData.id);
           await updateDoc(ideaRef, updates);
        } else {
           console.warn("Updating local-only idea");
        }

        if (onUpdate) {
          onUpdate({
            ...initialData,
            ...updates,
            updatedAt: new Date()
          });
        }
        
        if (onCancel) onCancel(); // Close the modal/form

      } else {
        // --- CREATE LOGIC ---
        // Duplicate Check 
        const q = query(collection(db, "ideas"), where("title", "==", formData.title.trim()));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          throw new Error("An idea with this title already exists. Please choose a unique title.");
        }

        const docData = {
          ...formData, // Spread form data including expiry option key if needed or calculated below
          title: formData.title.trim(),
          description: formData.description.trim(),
          problem: formData.problem.trim(),
          difficulty: Number(formData.difficulty),
          visibility: "active",
          status: "active",
          votes: 0,
          views: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          expiresAt: calculateExpiry(formData.expiry),
          userId: user.uid,
          userName: user.displayName || "Anonymous",
          userPhoto: user.photoURL || null,
        };

        const docRef = await addDoc(collection(db, "ideas"), docData);

        if (onAdd) {
            onAdd({
              ...docData,
              id: docRef.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
        }

        setFormData({
            title: "",
            category: categories[0],
            difficulty: 3,
            market: "Medium",
            description: "",
            problem: "",
            expiry: "none"
        });
        setIsOpen(false);
      } // End Create Logic

      setShowReview(false);
      
    } catch (err) {
      console.error("Error saving idea:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
      if (isControlled && onCancel) {
          onCancel();
      } else {
          setIsOpen(false);
      }
      setShowReview(false);
      setError(null);
  }

  // If NOT controlled and NOT open, show the "Add New Idea" button
  if (!isControlled && !isOpen) {
    if (!user) {
        return (
            <div className="flex items-center gap-4 px-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl w-full md:w-auto">
                <span className="text-white/60 text-sm">Please login to submit ideas</span>
            </div>
        );
    }
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-3 px-6 py-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl hover:bg-amber-500/20 transition-all w-full md:w-auto"
      >
        <div className="w-8 h-8 rounded-lg bg-amber-500 text-black flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
          +
        </div>
        <span className="font-display font-semibold text-lg text-white">Add New Idea</span>
      </button>
    );
  }
  
  // If controlled and not open, render nothing (or handled by parent)
  if (isControlled && !isOpenProp) return null;

  return (
    <div className={`w-full bg-white/[0.03] border border-amber-500/20 rounded-3xl p-8 backdrop-blur-xl animate-fade-in-up ${isEditing ? 'border-none bg-transparent p-0' : ''}`}>
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-display font-bold text-2xl text-white">
            {isEditing ? "Edit Startup Idea" : "New Startup Idea"}
        </h2>
        <button
          onClick={handleClose}
          className="text-white/40 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          ⚠️ {error}
        </div>
      )}

      {showReview ? (
        <div className="space-y-6 animate-fade-in">
           <div className="space-y-4 bg-white/[0.03] p-6 rounded-2xl border border-white/10">
             <div>
               <label className="text-xs font-bold tracking-widest uppercase text-white/40">Title</label>
               <h3 className="text-xl font-bold text-white">{formData.title}</h3>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-bold tracking-widest uppercase text-white/40">Category</label>
                  <p className="text-amber-400">{formData.category}</p>
               </div>
               <div>
                  <label className="text-xs font-bold tracking-widest uppercase text-white/40">Market</label>
                  <p className="text-amber-400">{formData.market}</p>
               </div>
               <div>
                  <label className="text-xs font-bold tracking-widest uppercase text-white/40">Difficulty</label>
                  <p className="text-amber-400">{formData.difficulty}/5</p>
               </div>
               {!isEditing && (
                <div>
                  <label className="text-xs font-bold tracking-widest uppercase text-white/40">Expiry</label>
                  <p className="text-amber-400">{formData.expiry === 'none' ? 'No Expiry' : formData.expiry}</p>
               </div>
               )}
             </div>
             <div>
               <label className="text-xs font-bold tracking-widest uppercase text-white/40">Problem</label>
               <p className="text-white/80">{formData.problem}</p>
             </div>
             <div>
               <label className="text-xs font-bold tracking-widest uppercase text-white/40">Solution</label>
               <p className="text-white/80">{formData.description}</p>
             </div>
           </div>

           <div className="pt-4 flex justify-end gap-3">
             <button
               type="button"
               onClick={() => setShowReview(false)}
               className="px-6 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05] transition-all font-semibold"
               disabled={loading}
             >
               Back to Edit
             </button>
             <button
               type="button"
               onClick={handleConfirm}
               disabled={loading}
               className="px-8 py-3 bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50"
             >
                {loading ? (isEditing ? "Updating..." : "Publishing...") : (isEditing ? "Confirm Update" : "Confirm & Submit")}
             </button>
           </div>
        </div>
      ) : (
      <form onSubmit={handleReview} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-widest uppercase text-white/40">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all font-display font-semibold"
              placeholder="e.g. AI-Powered Coffee Maker"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold tracking-widest uppercase text-white/40">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all appearance-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[#0a0a0f]">{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-widest uppercase text-white/40">Difficulty (1-5)</label>
            <div className="flex gap-4 items-center bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3">
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="font-mono text-amber-400 font-bold w-4">{formData.difficulty}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold tracking-widest uppercase text-white/40">Market Potential</label>
            <select
              value={formData.market}
              onChange={(e) => setFormData({ ...formData, market: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all appearance-none cursor-pointer"
            >
              {marketPotentials.map((m) => (
                <option key={m} value={m} className="bg-[#0a0a0f]">{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold tracking-widest uppercase text-white/40">The Problem</label>
          <textarea
            required
            rows={2}
            value={formData.problem}
            onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all resize-none"
            placeholder="What pain point are you solving?"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold tracking-widest uppercase text-white/40">Solution / Description</label>
          <textarea
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all resize-none"
            placeholder="How does your idea solve the problem?"
          />
        </div>

        {!isEditing && (
            <div className="space-y-2">
            <label className="text-xs font-bold tracking-widest uppercase text-white/40">Idea Expiry (Optional)</label>
            <select
                value={formData.expiry}
                onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all appearance-none cursor-pointer"
            >
                {expiryOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0a0a0f]">{opt.label}</option>
                ))}
            </select>
            </div>
        )}

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05] transition-all font-semibold"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? "Update Idea" : "Review Idea"}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
