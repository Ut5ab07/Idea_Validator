export default function Footer() {
  return (
    <footer className="py-8 border-t border-white/5 bg-[#0a0a0f] text-center text-white/30 text-xs font-mono relative z-50">
      <div className="flex justify-center gap-6 mb-4">
        <a href="#" className="hover:text-amber-400 transition-colors">
          Twitter
        </a>
        <a href="#" className="hover:text-amber-400 transition-colors">
          GitHub
        </a>
        <a href="#" className="hover:text-amber-400 transition-colors">
          Terms
        </a>
      </div>
      <p>© 2026 IdeaValidator. All rights reserved.</p>
    </footer>
  );
}
