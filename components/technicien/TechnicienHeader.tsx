"use client"

import { useRouter } from "next/navigation"
import { LogOut, User } from "lucide-react"
import { Logo } from "@/components/logo"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types/dashboard"

interface TechnicienHeaderProps {
  profile: Profile
}

export function TechnicienHeader({ profile }: TechnicienHeaderProps) {
  const router = useRouter()
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

  async function handleSignOut() {
    if (!isDemoMode) {
      const supabase = createClient()
      await supabase.auth.signOut()
    }
    router.push("/espace-technicien")
  }

  return (
    <header
      style={{
        background: "#1B3A2D",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Logo dark />

        {/* Technicien info + déconnexion */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: "rgba(242,101,34,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User size={13} style={{ color: "#F26522" }} />
            </div>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "white" }}>
              {profile.prenom} {profile.nom}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "7px 12px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "transparent",
              color: "rgba(255,255,255,0.5)",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            <LogOut size={12} />
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  )
}
