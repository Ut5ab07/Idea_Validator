"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { checkLoginMethods, loginWithGoogle, loginWithEmail, registerWithEmail, getAuthErrorMessage } from "../lib/auth";

export default function AuthModal({ isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState("login"); // 'login', 'signup'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
        resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setView("login");
    setError("");
    setLoading(false);
    setEmail("");
    setPassword("");
    setName("");
    setShowPassword(false);
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");
    const result = await loginWithGoogle();
    if (result.error) {
       setError(getAuthErrorMessage(result.error));
    } else {
        onClose();
    }
    setLoading(false);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail || !password) {
        setError("Please fill in all fields.");
        setLoading(false);
        return;
    }

    if (view === "login") {
        try {
            // Smart login check: Suggest Google if account exists with it
            const methods = await checkLoginMethods(trimmedEmail);
            if (methods && methods.includes("google.com")) {
                setError("This account was created using Google. Please continue with Google.");
                setLoading(false);
                return;
            }
        } catch (err) {
            console.error("Method check failed:", err);
            // Proceed to login anyway
        }
        
        const result = await loginWithEmail(trimmedEmail, password);
        if (result.error) {
            setError(getAuthErrorMessage(result.error));
        } else {
            onClose();
        }
    } else {
        const result = await registerWithEmail(trimmedEmail, password, name);
        if (result.error) {
             setError(getAuthErrorMessage(result.error));
        } else {
            onClose();
        }
    }
    setLoading(false);
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-all duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
          <h3 className="text-xl font-bold text-white font-display">
            {view === "login" ? "Welcome Back" : "Join IdeaValidator"}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}

            <button
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-3 mb-6 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
            >
                {loading ? (
                    <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                )}
                <span>Continue with Google</span>
            </button>

            <div className="mb-6 flex items-center gap-4 opacity-50">
                <div className="h-px flex-1 bg-white/20" />
                <span className="text-xs font-mono text-white/50">OR</span>
                <div className="h-px flex-1 bg-white/20" />
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
                {view === "signup" && (
                    <div>
                        <label className="block text-xs font-mono text-white/50 mb-1 ml-1">FULL NAME</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-amber-400/50 transition-colors"
                            placeholder="John Doe"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-xs font-mono text-white/50 mb-1 ml-1">EMAIL ADDRESS</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-amber-400/50 transition-colors"
                        placeholder="admin@ideavalidator.com"
                    />
                </div>

                <div>
                    <label className="block text-xs font-mono text-white/50 mb-1 ml-1">PASSWORD</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-4 pr-12 py-3 text-white placeholder-white/20 focus:outline-none focus:border-amber-400/50 transition-colors"
                            placeholder="••••••••"
                            minLength={6}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1 z-10"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-black font-bold rounded-lg hover:from-amber-300 hover:to-orange-300 transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                    {loading && <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
                    <span>
                        {view === "login" ? "Sign In" : "Create Account"}
                    </span>
                </button>
            </form>

            <div className="mt-6 text-center">
                <button
                    onClick={() => {
                        setView(view === "login" ? "signup" : "login");
                        setError("");
                    }}
                    className="text-sm text-white/50 hover:text-white transition-colors"
                >
                    {view === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
            </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
