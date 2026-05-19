"use client"

import { useState } from "react"
import { FileText, Download, Filter } from "lucide-react"
import type { RapportWithRelations } from "@/lib/types/dashboard"
import { StatusBadge } from "./StatusBadge"

interface RapportTableProps {
  rapports: RapportWithRelations[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    preventif: { label: "Préventif", bg: "#EFF6FF", color: "#1D4ED8" },
    curatif:   { label: "Curatif",   bg: "#FFF7ED", color: "#C2410C" },
    urgence:   { label: "Urgence",   bg: "#FEF2F2", color: "#DC2626" },
  }
  const c = map[type] ?? { label: type, bg: "#F3F4F6", color: "#6B7280" }
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "2px 8px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: 600,
        background: c.bg,
        color: c.color,
      }}
    >
      {c.label}
    </span>
  )
}

export function RapportTable({ rapports }: RapportTableProps) {
  const [filterSite, setFilterSite] = useState("all")

  const siteNames = Array.from(
    new Set(rapports.map((r) => r.interventions?.sites?.nom).filter(Boolean))
  ) as string[]

  const filtered = filterSite === "all"
    ? rapports
    : rapports.filter((r) => r.interventions?.sites?.nom === filterSite)

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <Filter size={14} style={{ color: "#9CA3AF" }} />
        <select
          value={filterSite}
          onChange={(e) => setFilterSite(e.target.value)}
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
            fontSize: "13px",
            color: "#374151",
            background: "white",
            cursor: "pointer",
          }}
        >
          <option value="all">Tous les sites</option>
          {siteNames.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
          {filtered.length} rapport{filtered.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px",
            background: "white",
            borderRadius: "12px",
            color: "#9CA3AF",
            fontSize: "14px",
          }}
        >
          Aucun rapport trouvé
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          {/* Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.4fr 0.8fr 0.8fr 0.8fr 80px",
              padding: "10px 20px",
              background: "#F9FAFB",
              borderBottom: "1px solid #F3F4F6",
            }}
          >
            {["Date", "Site", "Technicien", "Type", "HACCP", ""].map((h) => (
              <span key={h} style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((r, idx) => {
            const iv = r.interventions
            const date = r.signe_le ?? r.created_at
            const techNom = iv?.profiles
              ? `${iv.profiles.prenom ?? ""} ${iv.profiles.nom ?? ""}`.trim() || "—"
              : "—"

            return (
              <div
                key={r.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.4fr 0.8fr 0.8fr 0.8fr 80px",
                  padding: "14px 20px",
                  borderBottom: idx < filtered.length - 1 ? "1px solid #F9FAFB" : "none",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "13px", color: "#374151" }}>{formatDate(date)}</span>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: "#1B3A2D", margin: 0 }}>
                    {iv?.sites?.nom ?? "—"}
                  </p>
                  <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>
                    {iv?.sites?.adresse ?? ""}
                  </p>
                </div>
                <span style={{ fontSize: "13px", color: "#374151" }}>{techNom}</span>
                <TypeBadge type={iv?.type ?? ""} />
                <StatusBadge status={r.haccp_conforme ? "actif" : "inactif"} type="site" />
                <a
                  href={r.pdf_url ?? "/api/rapport/demo"}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "6px 10px",
                    background: "#F5F0E8",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#1B3A2D",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Download size={11} />
                  PDF
                </a>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
