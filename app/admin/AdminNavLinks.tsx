"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Wrench, Target, Calendar, TrendingUp, ClipboardList, SearchCheck } from "lucide-react"

const NAV = [
  { label: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
  { label: "File d'attente",  href: "/admin/queue", icon: ClipboardList },
  { label: "Clients CRM",     href: "/admin/clients", icon: Users },
  { label: "Audits",          href: "/admin/audits", icon: SearchCheck },
  { label: "Planning",        href: "/admin/planning", icon: Calendar },
  { label: "Facturation",     href: "/admin/facturation", icon: TrendingUp },
  { label: "Candidatures",    href: "/admin/candidatures", icon: Wrench },
  { label: "Leads",           href: "/admin/leads", icon: Target },
]

export function AdminNavLinks() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin"
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <nav className="flex-1 px-3 py-3 space-y-0.5">
      {NAV.map(({ label, href, icon: Icon }) => {
        const active = isActive(href)
        return (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              color: active ? "#ffffff" : "rgba(255,255,255,0.5)",
              background: active ? "rgba(242,101,34,0.18)" : "transparent",
              paddingLeft: active ? "10px" : "12px",
              paddingRight: "12px",
              borderLeft: active ? "3px solid #F26522" : "3px solid transparent",
            }}
          >
            <Icon size={15} style={{ color: active ? "#F26522" : "inherit" }} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
