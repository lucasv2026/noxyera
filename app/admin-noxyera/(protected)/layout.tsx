import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Shield, LayoutDashboard, Users, Wrench, Target, LogOut, Calendar, TrendingUp, ClipboardList, SearchCheck, UserCog } from 'lucide-react'

const NAV = [
  { label: 'Tableau de bord', href: '/admin-noxyera', icon: LayoutDashboard },
  { label: "File d'attente", href: '/admin-noxyera/queue', icon: ClipboardList },
  { label: 'Clients CRM', href: '/admin-noxyera/clients', icon: Users },
  { label: 'Audits', href: '/admin-noxyera/audits', icon: SearchCheck },
  { label: 'Planning', href: '/admin-noxyera/planning', icon: Calendar },
  { label: 'Facturation', href: '/admin-noxyera/facturation', icon: TrendingUp },
  { label: 'Candidatures', href: '/admin-noxyera/candidatures', icon: Wrench },
  { label: 'Admins', href: '/admin-noxyera/admins', icon: UserCog },
  { label: 'Leads', href: '/admin-noxyera/leads', icon: Target },
]

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  let isAdmin = false
  let adminName = 'Administrateur'
  let adminEmail = process.env.ADMIN_EMAIL ?? 'admin@noxyera.com'

  // Check Supabase auth first
  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, prenom, nom, email")
        .eq("user_id", user.id)
        .maybeSingle()

      if (profile?.role === 'admin') {
        isAdmin = true
        adminEmail = profile.email ?? user.email ?? adminEmail
        adminName = [profile.prenom, profile.nom].filter(Boolean).join(' ') || 'Administrateur'
      }
    }
  } catch {
    // Supabase unavailable, fall through to cookie check
  }

  // Emergency fallback: cookie
  if (!isAdmin) {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')
    if (session?.value === 'authenticated') isAdmin = true
  }

  if (!isAdmin) redirect('/admin-noxyera/login')

  const initials = adminName
    .split(' ')
    .map((w: string) => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'A'

  return (
    <div className="min-h-screen" style={{ background: '#0D1F17' }}>
      {/* Sidebar desktop */}
      <aside
        className="fixed inset-y-0 left-0 hidden w-60 flex-col lg:flex"
        style={{ background: '#0A1A11', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#F26522' }}>
            <Shield size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-white font-bold tracking-widest text-sm">NOXYERA</p>
            <p className="text-xs font-medium" style={{ color: '#F26522' }}>ADMIN</p>
          </div>
        </div>

        {/* Status */}
        <div className="mx-4 my-3 flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#10B981' }} />
          <span className="text-xs font-medium" style={{ color: '#10B981', fontFamily: 'monospace' }}>
            Opérationnel
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {NAV.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-white/8"
              style={{ color: 'rgba(255,255,255,0.65)' }}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: '#F26522', color: 'white' }}>
              {initials}
            </div>
            <div>
              <p className="text-xs font-medium text-white">{adminName}</p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {adminEmail}
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors hover:bg-white/8 w-full"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            <LogOut size={14} />
            Retour au site
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden flex items-center gap-3 px-4 py-4" style={{ background: '#0A1A11' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#F26522' }}>
          <Shield size={16} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="text-white font-bold tracking-widest text-sm">NOXYERA ADMIN</span>
      </header>

      <main className="lg:pl-60">{children}</main>
    </div>
  )
}
