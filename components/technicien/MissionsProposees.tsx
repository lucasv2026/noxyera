"use client"

import { useState, useEffect } from "react"
import { Check, X, Loader2, CalendarDays, MapPin, Euro } from "lucide-react"

interface MissionProposee {
  id: string
  date_prevue: string
  type: string
  notes: string | null
  sites: { nom: string; adresse: string; ville: string } | null
}

function formatDateFr(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  })
}

export function MissionsProposees({ technicienId }: { technicienId: string }) {
  const [missions, setMissions]   = useState<MissionProposee[]>([])
  const [loading, setLoading]     = useState(true)
  const [acting, setActing]       = useState<string | null>(null)
  const [toast, setToast]         = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/technicien/missions/proposees?technicien_id=${technicienId}`)
      .then(r => r.json())
      .then(d => setMissions(d.missions ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [technicienId])

  async function accept(id: string) {
    setActing(id)
    try {
      await fetch(`/api/technicien/missions/${id}/accept`, { method: "POST" })
      setMissions(prev => prev.filter(m => m.id !== id))
      setToast("Mission acceptée ✓ — Elle apparaît dans votre planning")
      setTimeout(() => setToast(null), 4000)
    } finally { setActing(null) }
  }

  async function refuse(id: string) {
    setActing(id)
    try {
      await fetch(`/api/technicien/missions/${id}/refuse`, { method: "POST" })
      setMissions(prev => prev.filter(m => m.id !== id))
    } finally { setActing(null) }
  }

  if (loading) return null
  if (missions.length === 0) return null

  return (
    <section style={{ marginBottom: 40 }}>
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: "#10B981", color: "white", padding: "12px 20px",
          borderRadius: 12, fontSize: 13, fontWeight: 600,
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}>
          ✓ {toast}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F26522" }} />
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "#F26522", margin: 0, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
          Missions proposées — {missions.length} à accepter
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {missions.map(mission => {
          const nomSite = mission.sites?.nom ?? (mission.notes ? mission.notes.split(" - ")[0] : "Établissement")
          const adresse = mission.sites?.adresse ?? (mission.notes ? mission.notes.split(" - ").slice(1).join(" - ") : "")
          const isActing = acting === mission.id

          return (
            <div key={mission.id} style={{
              background: "white", borderRadius: 16, padding: 20,
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              border: "1.5px solid #FEE2CC",
            }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                  background: mission.type === "audit" ? "#EFF6FF" : "#D1FAE5",
                  color: mission.type === "audit" ? "#1D4ED8" : "#065F46",
                  textTransform: "uppercase" as const,
                }}>
                  {mission.type === "audit" ? "Audit" : mission.type === "preventif" ? "Préventif" : "Curatif"}
                </span>
                <span style={{ fontSize: 12, color: "#9CA3AF", marginLeft: "auto" }}>Proposée</span>
              </div>

              {/* Date */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <CalendarDays size={13} style={{ color: "#F26522" }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: "#1B3A2D" }}>
                  {formatDateFr(mission.date_prevue)}
                </span>
              </div>

              {/* Site */}
              <p style={{ fontSize: 15, fontWeight: 700, color: "#1B3A2D", margin: "0 0 4px" }}>{nomSite}</p>
              {adresse && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                  <MapPin size={12} style={{ color: "#9CA3AF" }} />
                  <span style={{ fontSize: 13, color: "#6B7280" }}>{adresse}</span>
                </div>
              )}

              {/* Boutons */}
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button
                  onClick={() => accept(mission.id)}
                  disabled={!!acting}
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 6, padding: "12px", borderRadius: 10, border: "none",
                    background: "#1B3A2D", color: "white", fontSize: 14, fontWeight: 600,
                    cursor: acting ? "default" : "pointer", opacity: acting ? 0.7 : 1,
                  }}
                >
                  {isActing ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Check size={14} />}
                  Accepter
                </button>
                <button
                  onClick={() => refuse(mission.id)}
                  disabled={!!acting}
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 6, padding: "12px", borderRadius: 10,
                    border: "1.5px solid #E5E7EB", background: "white",
                    color: "#6B7280", fontSize: 14, fontWeight: 600,
                    cursor: acting ? "default" : "pointer", opacity: acting ? 0.7 : 1,
                  }}
                >
                  <X size={14} />
                  Refuser
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
