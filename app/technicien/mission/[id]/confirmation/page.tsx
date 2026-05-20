"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { CheckCircle2, Mail } from "lucide-react"
import Link from "next/link"

export default function ConfirmationPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const missionId = params?.id as string

  const [siteNom, setSiteNom] = useState<string>("")
  const [dateLabel, setDateLabel] = useState<string>("")
  const [heureLabel, setHeureLabel] = useState<string>("")

  useEffect(() => {
    // Récupérer le nom du site depuis localStorage ou searchParams
    const storedSite = localStorage.getItem(`mission-${missionId}-site`)
    const paramSite = searchParams?.get("site")
    setSiteNom(storedSite ?? paramSite ?? "Site de l'intervention")

    const now = new Date()
    setDateLabel(now.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }))
    setHeureLabel(now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }))
  }, [missionId, searchParams])

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", padding: "0 20px" }}>
      <div style={{
        background: "white",
        borderRadius: 16,
        padding: 40,
        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        maxWidth: 480,
        margin: "auto",
        marginTop: 60,
        textAlign: "center",
      }}>
        {/* 1. Badge succès */}
        <CheckCircle2 size={64} style={{ color: "#22C55E" }} />
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1B3A2D", marginTop: 16, marginBottom: 8 }}>
          Intervention clôturée ✓
        </h1>

        {/* 2. Infos contexte */}
        <p style={{ fontSize: 16, fontWeight: 600, color: "#1B3A2D", margin: "0 0 4px" }}>
          {siteNom}
        </p>
        <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 28px" }}>
          Clôturée le {dateLabel} à {heureLabel}
        </p>

        {/* 3. Statut rapport */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          background: "#FFF7F3",
          border: "1px solid #FDE3D1",
          borderRadius: 10,
          padding: "12px 20px",
          marginBottom: 32,
        }}>
          <Mail size={20} style={{ color: "#F26522", flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: "#1A1A1A" }}>
            Rapport HACCP généré et envoyé au client
          </span>
        </div>

        {/* 4. Bouton retour */}
        <Link
          href="/technicien/missions"
          style={{
            display: "inline-block",
            background: "#1B3A2D",
            color: "white",
            padding: "14px 32px",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Retour aux missions
        </Link>
      </div>
    </div>
  )
}
