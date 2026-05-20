"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { SUPABASE_DEMO_MISSIONS_TODAY, SUPABASE_DEMO_MISSIONS_WEEK } from "@/lib/demo-data"
import { MapPin, ArrowLeft } from "lucide-react"

const DEMO_MISSIONS = [...SUPABASE_DEMO_MISSIONS_TODAY, ...SUPABASE_DEMO_MISSIONS_WEEK]

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

  const mission = DEMO_MISSIONS.find((m) => m.id === missionId) ?? DEMO_MISSIONS[0]

  const [time, setTime] = useState(
    new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  async function handleArrivee() {
    setLoading(true)
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

    if (!isDemoMode) {
      try {
        const { createClient } = await import("@supabase/supabase-js")
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        await supabase
          .from("interventions")
          .update({ statut: "en_cours", heure_arrivee: new Date().toISOString() })
          .eq("id", missionId)
      } catch {
        // Proceed anyway
      }
    }

    // Save arrival time for recap
    if (typeof window !== "undefined") {
      localStorage.setItem(`mission-${missionId}-arrivee`, new Date().toISOString())
    }

    router.push(`/technicien/mission/${missionId}/zones`)
  }

  const site = mission?.sites

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
        marginBottom: "24px",
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
            <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
              {site.adresse} — {site.ville} {site.code_postal}
            </p>
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
