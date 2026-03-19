"use client";

import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { isAdmin } from "../lib/roles";
import Link from "next/link";
import AuthModal from "./AuthModal";

export default function Navbar({ user }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="border-b border-white/[0.05] bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="relative w-10 h-10 block">
            <div className="absolute inset-0 bg-amber-400 rotate-45 rounded-md" />
            <div className="absolute inset-[3px] bg-[#0a0a0f] rotate-45 rounded-md" />
            <div className="absolute inset-[6px] bg-amber-400 rotate-45 rounded-md" />
          </Link>
          <Link href="/" className="font-display font-bold text-xl tracking-tight text-white">
            Idea<span className="text-amber-400">Validator</span>
          </Link>
        </div>

        {/* Center tag */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-amber-400/50 tracking-widest uppercase">
          <span className="animate-pulse-amber">◆</span>
          <span>Startup Command Center</span>
          <span className="animate-pulse-amber">◆</span>
        </div>

        {/* Right - Auth */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 tracking-wider">LIVE</span>
          </div>

          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              {isAdmin(user) && (
                <Link 
                  href="/admin" 
                  className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded hover:bg-red-500/20 text-xs font-bold transition-all"
                >
                  ADMIN
                </Link>
              )}
              <Link href="/dashboard" className="flex items-center gap-3 group">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName} 
                    className="w-8 h-8 rounded-full border border-amber-500/30 group-hover:border-amber-400 transition-colors"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold group-hover:bg-amber-400 transition-colors">
                    {user.displayName ? user.displayName[0] : "U"}
                  </div>
                )}
                <span className="hidden md:block text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                  {user.displayName}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-white/40 hover:text-white transition-colors"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-gray-200 transition-all font-mono tracking-wide"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
}

