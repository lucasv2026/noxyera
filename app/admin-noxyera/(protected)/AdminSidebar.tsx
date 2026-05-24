"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Shield, LayoutDashboard, Users, Wrench, Target, LogOut,
  Calendar, TrendingUp, ClipboardList, SearchCheck, UserCog,
  Kanban, HardHat,
} from 'lucide-react'

// Nav grouped by section
const NAV_SECTIONS = [
  {
    section: null, // no label for top items
    items: [
      { label: 'Tableau de bord', href: '/admin-noxyera', icon: LayoutDashboard },
      { label: "File d'attente", href: '/admin-noxyera/queue', icon: ClipboardList },
    ],
  },
  {
    section: 'Clients',
    items: [
      { label: 'CRM Pipeline', href: '/admin-noxyera/crm', icon: Kanban },
      { label: 'Clients', href: '/admin-noxyera/clients', icon: Users },
      { label: 'Leads', href: '/admin-noxyera/leads', icon: Target },
    ],
  },
  {
    section: 'Opérations',
    items: [
      { label: 'Audits', href: '/admin-noxyera/audits', icon: SearchCheck },
      { label: 'Planning', href: '/admin-noxyera/planning', icon: Calendar },
      { label: 'Facturation', href: '/admin-noxyera/facturation', icon: TrendingUp },
    ],
  },
  {
    section: 'Équipe',
    items: [
      { label: 'Candidatures', href: '/admin-noxyera/candidatures', icon: Wrench },
      { label: 'Techniciens', href: '/admin-noxyera/techniciens', icon: HardHat },
      { label: 'Admins', href: '/admin-noxyera/admins', icon: UserCog },
    ],
  },
]

interface AdminSidebarProps {
  adminName: string
  adminEmail: string
  initials: string
}

export function AdminSidebar({ adminName, adminEmail, initials }: AdminSidebarProps) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/admin-noxyera') return pathname === '/admin-noxyera'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside
      className="fixed inset-y-0 left-0 hidden w-56 flex-col lg:flex"
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

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {NAV_SECTIONS.map(({ section, items }) => (
          <div key={section ?? '__top'} style={{ marginBottom: section ? 4 : 0 }}>
            {/* Section label */}
            {section && (
              <p style={{
                fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)',
                textTransform: 'uppercase', letterSpacing: '0.12em',
                padding: '10px 12px 4px',
                margin: 0,
              }}>
                {section}
              </p>
            )}
            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {items.map(({ label, href, icon: Icon }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 rounded-xl text-sm transition-all ${
                      active
                        ? 'bg-white text-[#1B3A2D] font-semibold'
                        : 'text-white/70 hover:bg-white/10 hover:text-white font-medium'
                    }`}
                    style={{
                      padding: '8px 12px',
                      paddingLeft: active ? '10px' : '12px',
                      borderLeft: active ? '3px solid #F26522' : '3px solid transparent',
                    }}
                  >
                    <Icon
                      size={14}
                      className={active ? 'text-[#1B3A2D]' : 'text-white/45'}
                      style={{ flexShrink: 0 }}
                    />
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 px-3 py-2 mb-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: '#F26522', color: 'white' }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <p className="text-xs font-medium text-white truncate">{adminName}</p>
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {adminEmail}
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm w-full"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          <LogOut size={13} />
          Retour au site
        </Link>
      </div>
    </aside>
  )
}
