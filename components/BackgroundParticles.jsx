"use client";

import { useState, useEffect } from "react";

export default function BackgroundParticles({ count = 20 }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate random particles on client side to avoid hydration mismatch
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
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
       {particles.map((p) => (
         <div 
           key={p.id}
           className="absolute rounded-full bg-amber-400 blur-[1px]"
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
  );
}