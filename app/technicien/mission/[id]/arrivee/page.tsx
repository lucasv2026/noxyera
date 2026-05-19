"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { SUPABASE_DEMO_MISSIONS_TODAY } from "@/lib/demo-data"

function ProgressBar({ step }: { step: number }) {
  const steps = ["Arrivée", "Inspection", "Produits", "Signature"]
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "28px" }}>
      {steps.map((label, idx) => {
        const isActive = idx === step - 1
        const isDone = idx < step - 1
        return (
          <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: isActive ? "#F26522" : isDone ? "#27AE60" : "#E5E7EB",
              color: isActive || isDone ? "white" : "#9CA3AF",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: 700,
            }}>
              {isDone ? "✓" : idx + 1}
            </div>
            <span style={{ fontSize: "10px", color: isActive ? "#F26522" : "#9CA3AF", fontWeight: isActive ? 700 : 400 }}>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function ArriveeePage() {
  const params = useParams()
  const router = useRouter()
  const missionId = params?.id as string

  const mission = SUPABASE_DEMO_MISSIONS_TODAY.find((m) => m.id === missionId) ?? SUPABASE_DEMO_MISSIONS_TODAY[0]

  const [time, setTime] = useState(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const typeLabel: Record<string, string> = {
    preventif: "Préventif",
    curatif: "Curatif",
    urgence: "Urgence",
  }

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "32px 20px 64px" }}>
      {/* Badge intervention en cours */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <span style={{ padding: "6px 16px", borderRadius: "20px", background: "#FEE2E2", color: "#DC2626", fontSize: "12px", fontWeight: 700 }}>
          ● INTERVENTION EN COURS
        </span>
      </div>

      <ProgressBar step={1} />

      {/* Card */}
      <div style={{ background: "white", borderRadius: "20px", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", marginBottom: "24px" }}>
        {/* Heure temps réel */}
        <div style={{ textAlign: "center", marginBottom: "20px", padding: "16px", background: "#F5F0E8", borderRadius: "12px" }}>
          <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "0 0 4px", fontWeight: 600, textTransform: "uppercase" }}>Heure actuelle</p>
          <p style={{ fontSize: "36px", fontWeight: 700, color: "#1B3A2D", margin: 0, fontFamily: "monospace" }}>{time}</p>
        </div>

        {/* Adresse */}
        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "0 0 4px", fontWeight: 600, textTransform: "uppercase" }}>Site</p>
          <p style={{ fontSize: "16px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 2px" }}>{mission.sites?.nom ?? "—"}</p>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
            {mission.sites?.adresse} · {mission.sites?.ville} {mission.sites?.code_postal}
          </p>
        </div>

        {/* Type */}
        <div>
          <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "0 0 6px", fontWeight: 600, textTransform: "uppercase" }}>Type d&apos;intervention</p>
          <span style={{
            padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700,
            background: mission.type === "urgence" ? "#FEE2E2" : mission.type === "curatif" ? "#FEF3C7" : "#D1FAE5",
            color: mission.type === "urgence" ? "#991B1B" : mission.type === "curatif" ? "#92400E" : "#065F46",
          }}>
            {typeLabel[mission.type] ?? mission.type}
          </span>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => router.push(`/technicien/mission/${missionId}/inspection`)}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: "14px",
          background: "#27AE60",
          color: "white",
          fontSize: "16px",
          fontWeight: 700,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(39,174,96,0.3)",
        }}
      >
        📍 Je suis sur site
      </button>
    </div>
  )
}
