"use client"

import { useState } from "react"
import { Calendar, CheckCircle2, Clock, XCircle, Download } from "lucide-react"

interface InterventionWithSite {
  id: string
  site_id: string
  siteNom: string
  type: string
  statut: string
  date_prevue: string
  date_reelle?: string | null
  notes?: string | null
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    preventif: { label: "Préventif", bg: "#D1FAE5", color: "#065F46" },
    curatif:   { label: "Curatif",   bg: "#FEF3C7", color: "#92400E" },
    urgence:   { label: "Urgence",   bg: "#FEE2E2", color: "#991B1B" },
  }
  const { label, bg, color } = map[type] ?? { label: type, bg: "#F3F4F6", color: "#6B7280" }
  return (
    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: bg, color }}>
      {label}
    </span>
  )
}

function StatutBadge({ statut }: { statut: string }) {
  if (statut === "realise") return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: "#D1FAE5", color: "#065F46", whiteSpace: "nowrap" }}>
      <CheckCircle2 size={10} /> Réalisée
    </span>
  )
  if (statut === "planifie") return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: "#FEF3C7", color: "#92400E", whiteSpace: "nowrap" }}>
      <Clock size={10} /> Planifiée
    </span>
  )
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: "#F3F4F6", color: "#6B7280", whiteSpace: "nowrap" }}>
      <XCircle size={10} /> Annulée
    </span>
  )
}

const TABS = ["Toutes", "Planifiées", "Réalisées", "Annulées"] as const

export default function InterventionsClient({ interventions }: { interventions: InterventionWithSite[] }) {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Toutes")
  const [filterSite, setFilterSite] = useState("all")
  const [filterMois, setFilterMois] = useState("all")

  const siteOptions = Array.from(
    new Map(interventions.map((i) => [i.site_id, i.siteNom])).entries()
  ).map(([id, label]) => ({ id, label }))

  const allMonths = Array.from(
    new Set(interventions.map((i) => i.date_prevue.slice(0, 7)))
  ).sort().reverse()

  const tabFiltered = interventions.filter((i) => {
    if (activeTab === "Planifiées") return i.statut === "planifie"
    if (activeTab === "Réalisées") return i.statut === "realise"
    if (activeTab === "Annulées") return i.statut === "annule"
    return true
  })

  const filtered = tabFiltered
    .filter((i) => filterSite === "all" || i.site_id === filterSite)
    .filter((i) => filterMois === "all" || i.date_prevue.startsWith(filterMois))
    .sort((a, b) => new Date(b.date_prevue).getTime() - new Date(a.date_prevue).getTime())

  const counts = {
    Toutes:    interventions.length,
    Planifiées: interventions.filter((i) => i.statut === "planifie").length,
    Réalisées: interventions.filter((i) => i.statut === "realise").length,
    Annulées:  interventions.filter((i) => i.statut === "annule").length,
  }

  return (
    <div style={{ padding: "32px 32px 64px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1B3A2D", margin: 0, fontFamily: "var(--font-display), serif" }}>
            Interventions
          </h1>
          <p style={{ fontSize: "14px", color: "#6B7280", margin: "4px 0 0" }}>
            {interventions.length} intervention{interventions.length > 1 ? "s" : ""} au total
          </p>
        </div>
        <button
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "10px 18px", borderRadius: "10px",
            background: "#F5F0E8", color: "#1B3A2D",
            fontSize: "13px", fontWeight: 600,
            border: "none", cursor: "pointer",
          }}
        >
          <Download size={14} />
          Exporter
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", flexWrap: "wrap" }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
              background: activeTab === tab ? "#1B3A2D" : "white",
              color: activeTab === tab ? "white" : "#6B7280",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            {tab} <span style={{ opacity: 0.7, fontWeight: 400 }}>({counts[tab]})</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px",
        background: "white", padding: "14px 18px", borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: "20px",
      }}>
        <select
          value={filterSite}
          onChange={(e) => setFilterSite(e.target.value)}
          style={{ fontSize: "13px", borderRadius: "8px", padding: "7px 12px", background: "#F5F0E8", color: "#1B3A2D", border: "none", outline: "none", fontWeight: 500 }}
        >
          <option value="all">Tous les sites</option>
          {siteOptions.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>

        <select
          value={filterMois}
          onChange={(e) => setFilterMois(e.target.value)}
          style={{ fontSize: "13px", borderRadius: "8px", padding: "7px 12px", background: "#F5F0E8", color: "#1B3A2D", border: "none", outline: "none", fontWeight: 500 }}
        >
          <option value="all">Tous les mois</option>
          {allMonths.map((m) => {
            const [year, month] = m.split("-")
            const label = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
            return <option key={m} value={m}>{label}</option>
          })}
        </select>

        {(filterSite !== "all" || filterMois !== "all") && (
          <button
            onClick={() => { setFilterSite("all"); setFilterMois("all") }}
            style={{ fontSize: "12px", color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
          >
            Réinitialiser
          </button>
        )}

        <span style={{ marginLeft: "auto", fontSize: "12px", color: "#9CA3AF" }}>
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        {/* Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1.5fr 1.2fr 1fr 1fr 1fr",
          padding: "12px 20px",
          background: "#FAFAFA",
          borderBottom: "1px solid #F3F4F6",
          fontSize: "11px",
          fontWeight: 700,
          color: "#9CA3AF",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}>
          <span>Site</span>
          <span>Date</span>
          <span>Technicien</span>
          <span>Type</span>
          <span>Statut</span>
          <span>Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "48px 32px", textAlign: "center" }}>
            <Calendar size={32} style={{ color: "#D1D5DB", marginBottom: "12px" }} />
            <p style={{ fontSize: "14px", color: "#6B7280", fontWeight: 500, margin: 0 }}>Aucune intervention</p>
            <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "6px 0 0" }}>Modifiez les filtres pour voir plus de résultats.</p>
          </div>
        ) : (
          <div>
            {filtered.map((intervention, idx) => (
              <div
                key={intervention.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1.5fr 1.2fr 1fr 1fr 1fr",
                  padding: "14px 20px",
                  alignItems: "center",
                  borderBottom: idx < filtered.length - 1 ? "1px solid #F9FAFB" : "none",
                  gap: "8px",
                }}
              >
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#1B3A2D", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {intervention.siteNom}
                </p>
                <p style={{ fontSize: "13px", color: "#374151", margin: 0 }}>
                  {new Date(intervention.date_prevue).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: "#F5F0E8", color: "#1B3A2D",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "10px", fontWeight: 700, flexShrink: 0,
                  }}>
                    TL
                  </div>
                  <span style={{ fontSize: "12px", color: "#6B7280" }}>Thomas Lebrun</span>
                </div>
                <TypeBadge type={intervention.type} />
                <StatutBadge statut={intervention.statut} />
                <div>
                  {intervention.statut === "realise" ? (
                    <button
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        padding: "6px 12px", borderRadius: "8px",
                        background: "#1B3A2D", color: "white",
                        fontSize: "11px", fontWeight: 600,
                        border: "none", cursor: "pointer",
                      }}
                    >
                      <Download size={11} /> PDF
                    </button>
                  ) : (
                    <span style={{ fontSize: "12px", color: "#9CA3AF" }}>—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "16px", textAlign: "center" }}>
        {interventions.length} intervention{interventions.length > 1 ? "s" : ""} au total
      </p>
    </div>
  )
}
