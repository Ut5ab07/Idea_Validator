"use client";

import { useState } from "react";
import { db, auth } from "../lib/firebase";
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore";

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

export default function NewIdeaForm({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    category: categories[0],
    difficulty: 3,
    market: "Medium",
    description: "",
    problem: "",
    expiry: "none"
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Validate fields
      if (!formData.title.trim() || !formData.description.trim() || !formData.problem.trim()) {
        throw new Error("Please fill in all required fields");
      }

      // 2. Duplicate Check
      const q = query(collection(db, "ideas"), where("title", "==", formData.title.trim()));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        throw new Error("An idea with this title already exists. Please choose a unique title.");
      }

      // 3. Prepare Data
      const docData = {
        title: formData.title.trim(),
        category: formData.category,
        difficulty: Number(formData.difficulty),
        market: formData.market,
        description: formData.description.trim(),
        problem: formData.problem.trim(),
        visibility: "active",
        status: "active",
        votes: 0,
        views: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        expiresAt: calculateExpiry(formData.expiry),
        userId: auth.currentUser ? auth.currentUser.uid : "anonymous",
      };

      // 4. Save to Firestore
      const docRef = await addDoc(collection(db, "ideas"), docData);

      // 5. Update UI (Optimistic/Local)
      onAdd({
        ...docData,
        id: docRef.id,
        createdAt: new Date(), // Use local date for immediate display
        updatedAt: new Date(),
      });
      
      // Reset form
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
      
    } catch (err) {
      console.error("Error adding idea:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
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

  return (
    <div className="w-full bg-white/[0.03] border border-amber-500/20 rounded-3xl p-8 backdrop-blur-xl animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-display font-bold text-2xl text-white">New Startup Idea</h2>
        <button
          onClick={() => setIsOpen(false)}
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

      <form onSubmit={handleSubmit} className="space-y-6">
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

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
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
            {loading ? "Validating..." : "Launch Idea"}
          </button>
        </div>
      </form>
    </div>
  );
}
