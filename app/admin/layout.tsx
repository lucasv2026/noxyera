import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, LogOut } from "lucide-react";
import { AdminNavLinks } from "./AdminNavLinks";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const adminSession = cookieStore.get('admin_session')?.value
  // fallback: aussi accepter l'ancien cookie admin_secret
  const adminSecretOld = cookieStore.get('admin_secret')?.value
  const validSecret = process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET

  if (!validSecret || (adminSession !== validSecret && adminSecretOld !== validSecret)) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen" style={{ background: "#0D1F17" }}>
      {/* Sidebar */}
      <aside
        className="fixed inset-y-0 left-0 hidden w-60 flex-col lg:flex"
        style={{ background: "#0A1A11", borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#F26522" }}>
            <Shield size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-white font-bold tracking-widest text-sm">NOXYERA</p>
            <p className="text-xs font-medium" style={{ color: "#F26522" }}>ADMIN</p>
          </div>
        </div>

        {/* Status */}
        <div className="mx-4 my-3 flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <span className="w-2 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.4)" }} />
          <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
            Opérationnel
          </span>
        </div>

        {/* Nav — active state géré côté client via AdminNavLinks */}
        <AdminNavLinks />

        {/* Footer */}
        <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: "#F26522", color: "white" }}>
              A
            </div>
            <div>
              <p className="text-xs font-medium text-white">Administrateur</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{process.env.ADMIN_EMAIL ?? 'admin@noxyera.com'}</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-white/8 w-full"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            <LogOut size={14} />
            Déconnexion
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden flex items-center gap-3 px-4 py-4" style={{ background: "#0A1A11" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#F26522" }}>
          <Shield size={16} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="text-white font-bold tracking-widest text-sm">NOXYERA ADMIN</span>
      </header>

      <main className="lg:pl-60">{children}</main>
    </div>
  );
}
