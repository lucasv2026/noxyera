"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, UtensilsCrossed, Warehouse, Package, Leaf, Shirt, Trash2, LayoutGrid, Home, X } from "lucide-react"

function ProgressBar({ step }: { step: number }) {
  const total = 4
  const pct = (step / total) * 100
  return (
    <div style={{ marginBottom: "28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#F26522" }}>Étape {step}/{total}</span>
        <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Zones inspectées</span>
      </div>
      <div style={{ height: "6px", background: "#E5E7EB", borderRadius: "99px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "#F26522", borderRadius: "99px", transition: "width 0.3s" }} />
      </div>
    </div>
  )
}

const ZONES = [
  { id: "cuisine", label: "Cuisine", Icon: UtensilsCrossed },
  { id: "cave", label: "Cave", Icon: Warehouse },
  { id: "reserves", label: "Réserves", Icon: Package },
  { id: "exterieurs", label: "Extérieurs", Icon: Leaf },
  { id: "vestiaires", label: "Vestiaires", Icon: Shirt },
  { id: "poubelles", label: "Poubelles", Icon: Trash2 },
  { id: "salle", label: "Salle", Icon: LayoutGrid },
  { id: "toiture", label: "Toiture", Icon: Home },
]

// Default zones pre-checked by sector type (used only on first visit, no previous rapport)
const SECTEUR_ZONES: Record<string, string[]> = {
  restaurant:      ["cuisine", "salle", "cave", "reserves", "poubelles"],
  hotel:           ["salle", "exterieurs", "poubelles"],
  entrepot:        ["reserves", "exterieurs", "poubelles"],
  agroalimentaire: ["cuisine", "reserves", "poubelles", "exterieurs"],
  immeuble:        ["cave", "exterieurs", "poubelles", "toiture"],
  bureau:          ["salle", "exterieurs"],
}

export default function ZonesPage() {
  const params = useParams()
  const router = useRouter()
  const missionId = params?.id as string

  const [selectedZones, setSelectedZones] = useState<string[]>([])
  const [prefillDate, setPrefillDate] = useState<string | null>(null)
  const [prefillDismissed, setPrefillDismissed] = useState(false)
  const [secteurPrefill, setSecteurPrefill] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Try localStorage prefill
    const prefillKey = `mission-${missionId}-prefill`
    const storedPrefill = localStorage.getItem(prefillKey)
    if (storedPrefill) {
      try {
        const parsed = JSON.parse(storedPrefill)
        if (parsed.zones && Array.isArray(parsed.zones)) {
          setSelectedZones(parsed.zones)
          if (parsed.date) setPrefillDate(parsed.date)
          return
        }
      } catch {
        // Ignore
      }
    }

    // Fallback: try Supabase prefill in non-demo mode
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"
    if (isDemoMode) return

    async function fetchLastReport() {
      try {
        const { createClient } = await import("@supabase/supabase-js")
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        // Get site_id for this intervention
        const { data: intervention } = await supabase
          .from("interventions")
          .select("site_id")
          .eq("id", missionId)
          .maybeSingle()

        if (!intervention?.site_id) return

        // Get last rapport for this site
        const { data: rapport } = await supabase
          .from("rapports")
          .select("zones_traitees, produits_utilises, created_at, interventions!inner(site_id)")
          .eq("interventions.site_id", intervention.site_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()

        if (rapport?.zones_traitees && Array.isArray(rapport.zones_traitees)) {
          setSelectedZones(rapport.zones_traitees)
          if (rapport.created_at) setPrefillDate(rapport.created_at)
          // Also save produits prefill for next step
          if (rapport.produits_utilises) {
            localStorage.setItem(
              `mission-${missionId}-prefill`,
              JSON.stringify({
                zones: rapport.zones_traitees,
                produits: rapport.produits_utilises,
                date: rapport.created_at,
              })
            )
          }
          return // prefill from last report — skip sector defaults
        }

        // No previous report — pre-check zones by sector type
        const secteur = localStorage.getItem(`mission-${missionId}-secteur`)
        if (secteur && SECTEUR_ZONES[secteur]) {
          setSelectedZones(SECTEUR_ZONES[secteur])
          setSecteurPrefill(secteur)
        }
      } catch {
        // Ignore
      }
    }

    fetchLastReport()
  }, [missionId])

  function toggleZone(id: string) {
    setSelectedZones((prev) =>
      prev.includes(id) ? prev.filter((z) => z !== id) : [...prev, id]
    )
  }

  function handleReset() {
    setSelectedZones([])
    setPrefillDismissed(true)
  }

  function handleContinue() {
    if (selectedZones.length === 0) return
    if (typeof window !== "undefined") {
      localStorage.setItem(`mission-${missionId}-zones`, JSON.stringify(selectedZones))
    }
    router.push(`/technicien/mission/${missionId}/produits`)
  }

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 20px 120px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <button
          onClick={() => router.push(`/technicien/mission/${missionId}/arrivee`)}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", color: "#6B7280", fontSize: "14px", padding: 0 }}
        >
          <ArrowLeft size={16} /> Retour
        </button>
      </div>

      <ProgressBar step={2} />

      <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 6px" }}>
        Zones inspectées
      </h1>
      <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 20px" }}>
        Sélectionnez toutes les zones traitées lors de cette intervention
      </p>

      {/* Prefill banner — last report */}
      {prefillDate && !prefillDismissed && selectedZones.length > 0 && (
        <div style={{
          background: "#D1FAE5", border: "1px solid #A7F3D0", borderRadius: "10px",
          padding: "12px 16px", marginBottom: "20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: "13px", color: "#065F46", fontWeight: 500 }}>
            Pré-rempli depuis le passage du{" "}
            {new Date(prefillDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          <button
            onClick={handleReset}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#065F46", display: "flex", alignItems: "center" }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Prefill banner — sector defaults (first visit) */}
      {secteurPrefill && !prefillDate && !prefillDismissed && selectedZones.length > 0 && (
        <div style={{
          background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "10px",
          padding: "12px 16px", marginBottom: "20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: "13px", color: "#1D4ED8", fontWeight: 500 }}>
            Zones suggérées pour ce type de site — modifiez si besoin
          </span>
          <button
            onClick={handleReset}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#1D4ED8", display: "flex", alignItems: "center" }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
        {ZONES.map(({ id, label, Icon }) => {
          const selected = selectedZones.includes(id)
          return (
            <button
              key={id}
              onClick={() => toggleZone(id)}
              style={{
                width: "100%",
                padding: "20px 12px",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.15s",
                background: selected ? "#FFF5EE" : "white",
                border: selected ? "2px solid #F26522" : "2px solid #E5E7EB",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Icon size={28} color={selected ? "#F26522" : "#6B7280"} />
              <span style={{ fontSize: "14px", fontWeight: 500, color: selected ? "#F26522" : "#374151" }}>
                {label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Sticky footer */}
      <div style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        padding: "16px 24px",
        background: "white",
        borderTop: "1px solid #E5E7EB",
      }}>
        <div style={{ maxWidth: "480px", margin: "0 auto" }}>
          {selectedZones.length > 0 && (
            <p style={{ fontSize: "12px", color: "#6B7280", textAlign: "center", margin: "0 0 8px" }}>
              {selectedZones.length} zone{selectedZones.length > 1 ? "s" : ""} sélectionnée{selectedZones.length > 1 ? "s" : ""}
            </p>
          )}
          <button
            onClick={handleContinue}
            disabled={selectedZones.length === 0}
            style={{
              width: "100%",
              height: "52px",
              borderRadius: "10px",
              background: "#1B3A2D",
              color: "white",
              fontSize: "16px",
              fontWeight: 700,
              border: "none",
              cursor: selectedZones.length === 0 ? "not-allowed" : "pointer",
              opacity: selectedZones.length === 0 ? 0.4 : 1,
              transition: "opacity 0.15s",
            }}
          >
            Continuer →
          </button>
        </div>
      </div>
    </div>
  )
}
