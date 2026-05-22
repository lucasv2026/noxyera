"use client"

import { useState, useEffect } from "react"
import { Loader2, CalendarDays, MapPin, Clock, Euro, AlertTriangle } from "lucide-react"

interface MissionProposee {
  id: string
  date_prevue: string
  type: string
  notes: string | null
  notes_client: string | null
  expires_at: string | null
  prix_technicien?: number | null
  sites: { nom: string; adresse: string; ville: string; secteur?: string; superficie?: number } | null
}

function formatDateFr(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  })
}

function getCountdownLabel(expiresAt: string | null): { label: string; urgent: boolean } | null {
  if (!expiresAt) return null
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return null
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const label = hours > 0
    ? `Expire dans ${hours}h${minutes > 0 ? ` ${minutes}min` : ""}`
    : `Expire dans ${minutes}min`
  return { label, urgent: hours < 2 }
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    audit:     { label: "Audit",     bg: "#EFF6FF", color: "#1D4ED8" },
    preventif: { label: "Préventif", bg: "#D1FAE5", color: "#065F46" },
    curatif:   { label: "Curatif",   bg: "#FEF3C7", color: "#92400E" },
    urgence:   { label: "Urgence",   bg: "#FEE2E2", color: "#991B1B" },
  }
  const cfg = map[type] ?? { label: type, bg: "#F3F4F6", color: "#6B7280" }
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
      background: cfg.bg, color: cfg.color, textTransform: "uppercase",
    }}>
      {cfg.label}
    </span>
  )
}

interface ConfirmModalProps {
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}

function ConfirmModal({ onConfirm, onCancel, loading }: ConfirmModalProps) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "white", borderRadius: 16, padding: 32,
        maxWidth: 400, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1B3A2D", margin: "0 0 12px" }}>
          Confirmer l&apos;acceptation
        </h3>
        <p style={{ fontSize: 14, color: "#6B7280", margin: "0 0 24px" }}>
          Confirmer l&apos;acceptation de cette mission ?
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1, padding: "12px", borderRadius: 10, border: "1.5px solid #E5E7EB",
              background: "white", color: "#374151", fontSize: 14, fontWeight: 600,
              cursor: loading ? "default" : "pointer",
            }}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1, padding: "12px", borderRadius: 10, border: "none",
              background: "#1B3A2D", color: "white", fontSize: 14, fontWeight: 600,
              cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : null}
            Confirmer
          </button>
        </div>
      </div>
    </div>
  )
}

export function MissionsProposees({ technicienId }: { technicienId: string }) {
  const [missions, setMissions] = useState<MissionProposee[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [confirmModal, setConfirmModal] = useState<{ missionId: string } | null>(null)

  useEffect(() => {
    fetch(`/api/technicien/missions/proposees?technicien_id=${technicienId}`)
      .then(r => r.json())
      .then(d => setMissions(d.missions ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [technicienId])

  async function doAccept(id: string) {
    setActing(id)
    try {
      await fetch(`/api/technicien/missions/${id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ technicien_id: technicienId }),
      })
      setMissions(prev => prev.filter(m => m.id !== id))
      setToast("Offre acceptée — L'intervention apparaît dans votre planning")
      setTimeout(() => setToast(null), 4000)
    } finally {
      setActing(null)
      setConfirmModal(null)
    }
  }

  async function refuse(id: string) {
    setActing(id)
    try {
      await fetch(`/api/technicien/missions/${id}/refuse`, { method: "POST" })
      setMissions(prev => prev.filter(m => m.id !== id))
    } finally {
      setActing(null)
    }
  }

  if (loading) return null

  return (
    <section style={{ marginBottom: 40, maxWidth: "896px", margin: "0 auto 40px" }}>
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: "#1B3A2D", color: "white", padding: "12px 20px",
          borderRadius: 12, fontSize: 13, fontWeight: 600,
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}>
          ✓ {toast}
        </div>
      )}

      {confirmModal && (
        <ConfirmModal
          onConfirm={() => doAccept(confirmModal.missionId)}
          onCancel={() => setConfirmModal(null)}
          loading={acting === confirmModal.missionId}
        />
      )}

      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F26522", flexShrink: 0 }} />
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "#F26522", margin: 0, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
          Offres de mission{missions.length > 0 ? ` — ${missions.length} à accepter` : ""}
        </h2>
      </div>

      {missions.length === 0 ? (
        <div style={{
          background: "#FFFBEB", borderRadius: 16, padding: "28px 24px",
          border: "1.5px solid #FDE68A",
          display: "flex", alignItems: "flex-start", gap: 12,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Clock size={16} style={{ color: "#F59E0B" }} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#92400E", margin: "0 0 4px" }}>
              Aucune offre en attente
            </p>
            <p style={{ fontSize: 13, color: "#B45309", margin: 0 }}>
              Vous serez notifié par email et notification dès qu&apos;une offre vous est proposée.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {missions.map(mission => {
            const nomSite = mission.sites?.nom ?? "Établissement"
            const adresse = mission.sites?.adresse ?? ""
            const ville = mission.sites?.ville ?? ""
            const secteur = mission.sites?.secteur ?? null
            const superficie = mission.sites?.superficie ?? null
            const isActing = acting === mission.id
            const countdown = getCountdownLabel(mission.expires_at ?? null)
            const notesClient = mission.notes_client

            return (
              <div
                key={mission.id}
                style={{
                  background: "#FFFBEB",
                  borderRadius: 16,
                  padding: 24,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  border: countdown?.urgent ? "1.5px solid #FCA5A5" : "1.5px solid #FDE68A",
                }}
              >
                {/* Header: type badge + countdown */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                  <TypeBadge type={mission.type} />
                  <span style={{ fontSize: 12, color: "#9CA3AF", marginLeft: "auto" }}>Offre proposée</span>
                  {countdown && (
                    <span style={{
                      display: "flex", alignItems: "center", gap: 3,
                      fontSize: 11, fontWeight: 600,
                      color: countdown.urgent ? "#991B1B" : "#6B7280",
                      background: countdown.urgent ? "#FEE2E2" : "#F9FAFB",
                      padding: "2px 8px", borderRadius: 6,
                    }}>
                      <Clock size={10} />
                      {countdown.label}
                    </span>
                  )}
                </div>

                {/* Date */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <CalendarDays size={13} style={{ color: "#F26522" }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#1B3A2D" }}>
                    {formatDateFr(mission.date_prevue)}
                  </span>
                </div>

                {/* Site */}
                <p style={{ fontSize: 16, fontWeight: 700, color: "#1B3A2D", margin: "0 0 6px" }}>{nomSite}</p>

                {adresse && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                    <MapPin size={12} style={{ color: "#9CA3AF" }} />
                    <span style={{ fontSize: 13, color: "#6B7280" }}>{adresse}{ville ? `, ${ville}` : ""}</span>
                  </div>
                )}

                {/* Sector + superficie */}
                {(secteur || superficie) && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                    {secteur && (
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#F5F0E8", color: "#6B7280", fontWeight: 600 }}>
                        {secteur}
                      </span>
                    )}
                    {superficie && (
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#F5F0E8", color: "#6B7280" }}>
                        {superficie} m²
                      </span>
                    )}
                  </div>
                )}

                {/* Notes client */}
                {notesClient && (
                  <div style={{
                    background: "#FFFBEB", border: "1px solid #FDE68A",
                    borderRadius: 8, padding: "10px 14px", marginTop: 10,
                    display: "flex", gap: 8,
                  }}>
                    <AlertTriangle size={14} style={{ color: "#92400E", flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: "#92400E", margin: 0 }}>
                      <strong>Notes :</strong> {notesClient}
                    </p>
                  </div>
                )}

                {/* Rémunération */}
                {mission.prix_technicien != null && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 10 }}>
                    <Euro size={13} style={{ color: "#10B981" }} />
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#065F46" }}>
                      {mission.prix_technicien} €
                    </span>
                  </div>
                )}

                {/* Buttons */}
                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <button
                    onClick={() => refuse(mission.id)}
                    disabled={!!acting}
                    style={{
                      flex: 1, minHeight: 48,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: "12px", borderRadius: 10,
                      border: "1.5px solid #991B1B", background: "white",
                      color: "#991B1B", fontSize: 14, fontWeight: 600,
                      cursor: acting ? "default" : "pointer", opacity: acting ? 0.7 : 1,
                    }}
                  >
                    {isActing && acting ? (
                      <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                    ) : "Refuser"}
                  </button>
                  <button
                    onClick={() => setConfirmModal({ missionId: mission.id })}
                    disabled={!!acting}
                    style={{
                      flex: 1, minHeight: 48,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: "12px", borderRadius: 10, border: "none",
                      background: "#1B3A2D", color: "white", fontSize: 14, fontWeight: 600,
                      cursor: acting ? "default" : "pointer", opacity: acting ? 0.7 : 1,
                    }}
                  >
                    Accepter
                  </button>
                </div>

                <p style={{ fontSize: 11, color: "#9CA3AF", margin: "10px 0 0", textAlign: "center" }}>
                  Vous êtes libre d&apos;accepter ou refuser sans justification.
                </p>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
