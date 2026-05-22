import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Shield } from 'lucide-react'
import { AdminSidebar } from './AdminSidebar'

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
      <AdminSidebar adminName={adminName} adminEmail={adminEmail} initials={initials} />

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
