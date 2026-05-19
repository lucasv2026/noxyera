"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
  { href: "/technicien/missions", label: "Planning" },
  { href: "/technicien/clients",  label: "Mes clients" },
  { href: "/technicien/profil",   label: "Profil" },
]

export function TechnicienNav() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        background: "#1B3A2D",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "0 20px",
          display: "flex",
          gap: "4px",
        }}
      >
        {NAV_ITEMS.map(({ href, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              style={{
                padding: "10px 18px",
                borderRadius: "20px 20px 0 0",
                fontSize: "13px",
                fontWeight: isActive ? 700 : 500,
                textDecoration: "none",
                color: isActive ? "#F26522" : "rgba(255,255,255,0.5)",
                background: isActive ? "rgba(242,101,34,0.12)" : "transparent",
                transition: "color 0.15s, background 0.15s",
                marginBottom: "-1px",
                borderBottom: isActive ? "2px solid #F26522" : "2px solid transparent",
              }}
            >
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
