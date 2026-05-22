"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { MapPin, ArrowLeft, Clock } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

interface SiteData {
  id: string
  nom: string
  adresse: string
  ville: string
  code_postal: string
  secteur: string
  superficie: number | null
}

interface InterventionData {
  id: string
  type: string
  date_prevue: string
  notes_client: string | null
  sites: SiteData | null
}

const SECTEUR_LABELS: Record<string, string> = {
  restaurant: "Restaurant",
  hotel: "Hôtel",
  entrepot: "Entrepôt",
  agroalimentaire: "Agroalimentaire",
  immeuble: "Immeuble",
  bureau: "Bureau",
}

function ProgressBar({ step }: { step: number }) {
  const steps = ["Arrivée", "Zones", "Produits", "Signature"]
  const pct = (step / steps.length) * 100
  return (
    <div style={{ marginBottom: "28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#F26522" }}>
          Étape {step}/{steps.length}
        </span>
        <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{steps[step - 1]}</span>
      </div>
      <div style={{ height: "6px", background: "#E5E7EB", borderRadius: "99px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "#F26522", borderRadius: "99px", transition: "width 0.3s" }} />
      </div>
    </div>
  )
}

export default function ArriveePage() {
  const params = useParams()
  const router = useRouter()
  const missionId = params?.id as string

  const [intervention, setIntervention] = useState<InterventionData | null>(null)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [time, setTime] = useState(
    new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  )
  const [loading, setLoading] = useState(false)

  // Fetch intervention + site from Supabase
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase
      .from("interventions")
      .select("id, type, date_prevue, notes_client, sites(id, nom, adresse, ville, code_postal, secteur, superficie)")
      .eq("id", missionId)
      .maybeSingle()
      .then(({ data }) => {
        setIntervention(data as InterventionData | null)
        setFetchLoading(false)
      })
  }, [missionId])

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  async function handleArrivee() {
    setLoading(true)
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      await supabase
        .from("interventions")
        .update({ statut: "en_cours", heure_arrivee: new Date().toISOString() })
        .eq("id", missionId)
    } catch {
      // Proceed anyway — arrivée saved locally
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(`mission-${missionId}-arrivee`, new Date().toISOString())
      // Pass sector to zones page for pre-check
      if (intervention?.sites?.secteur) {
        localStorage.setItem(`mission-${missionId}-secteur`, intervention.sites.secteur)
      }
    }

    router.push(`/technicien/mission/${missionId}/zones`)
  }

  const site = intervention?.sites

  if (fetchLoading) {
    return (
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "4px solid #F5F0E8", borderTopColor: "#1B3A2D", margin: "0 auto", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 20px 64px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <button
          onClick={() => router.push("/technicien/missions")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "4px",
            color: "#6B7280", fontSize: "14px", padding: 0,
          }}
        >
          <ArrowLeft size={16} /> Retour
        </button>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: "13px", color: "#9CA3AF", fontFamily: "monospace" }}>
          #{missionId.slice(-6).toUpperCase()}
        </span>
      </div>

      <ProgressBar step={1} />

      {/* Central card */}
      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "32px 28px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        marginBottom: "20px",
        textAlign: "center",
      }}>
        <div style={{
          width: "72px", height: "72px", borderRadius: "50%",
          background: "#F0F9F4",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <MapPin size={32} color="#1B3A2D" />
        </div>

        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1A1A1A", margin: "0 0 8px" }}>
          Confirmez votre arrivée
        </h1>

        {site && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "16px", fontWeight: 600, color: "#1B3A2D", margin: "0 0 4px" }}>
              {site.nom}
            </p>
            <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 8px" }}>
              {site.adresse}{site.ville ? ` — ${site.ville}` : ""}{site.code_postal ? ` ${site.code_postal}` : ""}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
              {site.secteur && (
                <span style={{ padding: "3px 10px", borderRadius: "20px", background: "#F5F0E8", color: "#1B3A2D", fontSize: "12px", fontWeight: 500 }}>
                  {SECTEUR_LABELS[site.secteur] ?? site.secteur}
                </span>
              )}
              {site.superficie && (
                <span style={{ padding: "3px 10px", borderRadius: "20px", background: "#F5F0E8", color: "#1B3A2D", fontSize: "12px", fontWeight: 500 }}>
                  {site.superficie} m²
                </span>
              )}
            </div>
          </div>
        )}

        {/* Date prévue */}
        {intervention?.date_prevue && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            marginBottom: "16px",
          }}>
            <Clock size={14} color="#9CA3AF" />
            <span style={{ fontSize: "13px", color: "#6B7280" }}>
              Prévue le {new Date(intervention.date_prevue).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>
        )}

        {/* Live clock */}
        <div style={{
          background: "#F5F0E8", borderRadius: "12px", padding: "16px",
          marginBottom: "8px",
        }}>
          <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Heure actuelle
          </p>
          <p style={{ fontSize: "36px", fontWeight: 700, color: "#1B3A2D", margin: 0, fontFamily: "monospace" }}>
            {time}
          </p>
        </div>
      </div>

      {/* Notes client */}
      {intervention?.notes_client && (
        <div style={{
          background: "#FFF7ED",
          border: "1px solid #FDE68A",
          borderRadius: "10px",
          padding: "12px 16px",
          marginBottom: "20px",
        }}>
          <p style={{ fontSize: "11px", color: "#92400E", fontWeight: 700, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Notes client
          </p>
          <p style={{ fontSize: "13px", color: "#78350F", margin: 0, fontStyle: "italic" }}>
            {intervention.notes_client}
          </p>
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={handleArrivee}
        disabled={loading}
        style={{
          width: "100%",
          height: "64px",
          borderRadius: "12px",
          background: loading ? "#6B7280" : "#1B3A2D",
          color: "white",
          fontSize: "18px",
          fontWeight: 700,
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
          boxShadow: loading ? "none" : "0 4px 16px rgba(27,58,45,0.3)",
          transition: "all 0.15s",
        }}
      >
        {loading ? (
          <>
            <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spin 0.8s linear infinite" }} />
            Enregistrement...
          </>
        ) : (
          "Je suis sur site ✓"
        )}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
