"use client";

import { useState } from "react";

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

export default function NewIdeaForm({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: categories[0],
    difficulty: 3,
    marketPotential: "Medium",
    description: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    
    onAdd({
      ...formData,
      id: Date.now(), // simple unique id
    });
    
    // Reset form
    setFormData({
      title: "",
      category: categories[0],
      difficulty: 3,
      marketPotential: "Medium",
      description: "",
    });
    setIsOpen(false);
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
              value={formData.marketPotential}
              onChange={(e) => setFormData({ ...formData, marketPotential: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all appearance-none cursor-pointer"
            >
              {marketPotentials.map((m) => (
                <option key={m} value={m} className="bg-[#0a0a0f]">{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold tracking-widest uppercase text-white/40">Description</label>
          <textarea
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-all resize-none"
            placeholder="Describe the problem and solution..."
          />
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-6 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.05] transition-all font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
          >
            Launch Idea
          </button>
        </div>
      </form>
    </div>
  );
}
