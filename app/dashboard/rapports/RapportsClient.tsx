"use client"

import { useState, useMemo } from "react"
import { FileText, ChevronRight, AlertTriangle } from "lucide-react"
import type { RapportWithRelations } from "@/lib/types/dashboard"
import Link from "next/link"
import { PdfDownloadButton } from "./PdfDownloadButton"

interface RapportsClientProps {
  rapports: RapportWithRelations[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}

function TypeLabel({ type }: { type: string }) {
  const map: Record<string, string> = {
    preventif: "Préventif",
    curatif: "Curatif",
    urgence: "Urgence",
  }
  return <span>{map[type] ?? type}</span>
}

const PERIOD_OPTIONS = [
  { label: "3 mois", value: "3m" },
  { label: "6 mois", value: "6m" },
  { label: "12 mois", value: "12m" },
  { label: "Tout", value: "all" },
] as const

type PeriodValue = typeof PERIOD_OPTIONS[number]["value"]

export function RapportsClient({ rapports }: RapportsClientProps) {
  const [siteFilter, setSiteFilter] = useState<string>("all")
  const [periodFilter, setPeriodFilter] = useState<PeriodValue>("all")

  // Unique site names
  const siteNames = useMemo(() => {
    const names = new Set<string>()
    rapports.forEach((r) => {
      const nom = r.interventions?.sites?.nom
      if (nom) names.add(nom)
    })
    return Array.from(names).sort()
  }, [rapports])

  const filtered = useMemo(() => {
    let result = rapports

    // Site filter
    if (siteFilter !== "all") {
      result = result.filter((r) => r.interventions?.sites?.nom === siteFilter)
    }

    // Period filter
    if (periodFilter !== "all") {
      const months = periodFilter === "3m" ? 3 : periodFilter === "6m" ? 6 : 12
      const cutoff = new Date()
      cutoff.setMonth(cutoff.getMonth() - months)
      result = result.filter((r) => new Date(r.created_at) >= cutoff)
    }

    return result
  }, [rapports, siteFilter, periodFilter])

  const selectStyle: React.CSSProperties = {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid #E5E7EB",
    background: "white",
    fontSize: "13px",
    color: "#374151",
    fontWeight: 500,
    cursor: "pointer",
    outline: "none",
  }

  return (
    <div style={{ padding: "32px 32px 64px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1B3A2D", margin: 0, fontFamily: "var(--font-display), serif" }}>
            Rapports d&apos;intervention
          </h1>
          <p style={{ fontSize: "14px", color: "#6B7280", margin: "6px 0 0" }}>
            {filtered.length} rapport{filtered.length > 1 ? "s" : ""} · Téléchargement PDF disponible
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {siteNames.length > 1 && (
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="all">Tous les sites</option>
              {siteNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          )}
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value as PeriodValue)}
            style={selectStyle}
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0", background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "64px 32px", textAlign: "center" }}>
            <FileText size={40} style={{ color: "#E5E7EB", marginBottom: "12px" }} />
            <p style={{ fontSize: "14px", color: "#9CA3AF", margin: 0, fontWeight: 500 }}>Aucun rapport disponible</p>
          </div>
        ) : (
          filtered.map((rapport, idx) => {
            const dateLabel = rapport.interventions?.date_reelle
              ? formatDate(rapport.interventions.date_reelle)
              : formatDate(rapport.created_at)
            const siteNom = rapport.interventions?.sites?.nom ?? "Site inconnu"
            const techProfile = rapport.interventions?.profiles
            const techNom = techProfile
              ? `${techProfile.prenom ?? ""} ${techProfile.nom ?? ""}`.trim()
              : "—"
            const isAnomalie = !rapport.haccp_conforme

            return (
              <div
                key={rapport.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px 20px",
                  borderBottom: idx < filtered.length - 1 ? "1px solid #F9FAFB" : "none",
                  background: isAnomalie ? "rgba(254,243,199,0.4)" : "transparent",
                }}
              >
                <Link
                  href={`/dashboard/rapports/${rapport.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    flex: 1,
                    minWidth: 0,
                    textDecoration: "none",
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "10px",
                    background: "#F5F0E8", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <FileText size={16} style={{ color: "#1B3A2D" }} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "#1B3A2D", margin: 0 }}>{siteNom}</p>
                      <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                        {dateLabel}{techNom ? ` · ${techNom}` : ""}
                      </span>
                    </div>
                    {rapport.interventions?.type && (
                      <p style={{ fontSize: "12px", color: "#6B7280", margin: "2px 0 0" }}>
                        <TypeLabel type={rapport.interventions.type} />
                        {isAnomalie && (
                          <span style={{ marginLeft: "8px", color: "#F26522", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <AlertTriangle size={12} /> Anomalie détectée
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Score badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                    <span style={{
                      padding: "4px 12px", borderRadius: "20px",
                      fontSize: "12px", fontWeight: 700,
                      background: rapport.haccp_conforme ? "#D1FAE5" : "#FEF3C7",
                      color: rapport.haccp_conforme ? "#065F46" : "#92400E",
                    }}>
                      {rapport.haccp_conforme ? "Conforme" : "Non conforme"}
                    </span>
                    <ChevronRight size={16} style={{ color: "#9CA3AF" }} />
                  </div>
                </Link>

                {/* Bouton télécharger PDF */}
                <PdfDownloadButton pdfUrl={rapport.pdf_url} />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
