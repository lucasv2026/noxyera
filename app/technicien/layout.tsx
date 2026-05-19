import Link from "next/link";
import { Shield, Calendar, History, LogOut } from "lucide-react";

export default function TechnicienLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "#F5F0E8" }}>
      {/* Top header */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-3.5"
        style={{ background: "#1B3A2D", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#F26522" }}>
            <Shield size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-white font-bold tracking-widest text-sm">NOXYERA</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Espace Technicien</p>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          <Link
            href="/technicien/missions"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            <Calendar size={14} />
            <span className="hidden sm:inline">Missions</span>
          </Link>
          <Link
            href="/technicien/historique"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            <History size={14} />
            <span className="hidden sm:inline">Historique</span>
          </Link>
          <Link
            href="/espace-technicien"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            <LogOut size={14} />
          </Link>
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}
