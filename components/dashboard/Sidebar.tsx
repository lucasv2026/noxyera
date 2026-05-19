"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Wrench, FileText, CreditCard, LogOut, User } from "lucide-react"
import { Logo } from "@/components/logo"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types/dashboard"

const NAV_ITEMS = [
  { href: "/dashboard",               icon: LayoutDashboard, label: "Mes sites" },
  { href: "/dashboard/interventions", icon: Wrench,          label: "Interventions" },
  { href: "/dashboard/rapports",      icon: FileText,        label: "Rapports" },
  { href: "/dashboard/mon-compte",    icon: CreditCard,      label: "Mon contrat" },
]

interface SidebarProps {
  profile: Profile | null
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

  async function handleSignOut() {
    if (!isDemoMode) {
      const supabase = createClient()
      await supabase.auth.signOut()
    }
    router.push("/login")
  }

  return (
    <aside
      style={{
        width: "240px",
        minHeight: "100vh",
        background: "#1B3A2D",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Logo dark />
      </div>

      {/* Nav */}
      <nav style={{ padding: "12px 12px", flex: 1 }}>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "8px",
                marginBottom: "2px",
                textDecoration: "none",
                background: isActive ? "rgba(242,101,34,0.15)" : "transparent",
                color: isActive ? "#F26522" : "rgba(255,255,255,0.65)",
                fontSize: "14px",
                fontWeight: isActive ? 600 : 400,
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + signout */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {profile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              marginBottom: "4px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "rgba(242,101,34,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <User size={14} style={{ color: "#F26522" }} />
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "white", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {profile.prenom} {profile.nom}
              </p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {profile.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            padding: "10px 12px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            color: "rgba(255,255,255,0.4)",
            fontSize: "13px",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <LogOut size={14} />
          Se déconnecter
        </button>
      </div>
    </aside>
  )
}
