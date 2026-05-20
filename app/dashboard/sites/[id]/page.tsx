"use client"

import { SUPABASE_DEMO_SITES, SUPABASE_DEMO_RAPPORTS } from "@/lib/demo-data"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Check, AlertTriangle } from "lucide-react"

const ZONE_CONFIG: Record<string, { label: string; ok: boolean }> = {
  cuisine: { label: "Cuisine", ok: true },
  cave: { label: "Cave", ok: true },
  reserves: { label: "Réserves", ok: true },
  exterieurs: { label: "Extérieurs", ok: false },
}

function HaccpCircle({ score }: { score: number }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="10" />
        <circle
          cx="65" cy="65" r={radius}
          fill="none"
          stroke="#27AE60"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
        />
        <text x="65" y="62" textAnchor="middle" fontSize="22" fontWeight="700" fill="#1B3A2D">{score}%</text>
        <text x="65" y="78" textAnchor="middle" fontSize="10" fill="#9CA3AF">HACCP</text>
      </svg>
      <p style={{ fontSize: "13px", fontWeight: 600, color: "#27AE60", margin: 0 }}>Conformité excellente</p>
    </div>
  )
}

export default function SiteDetailPage() {
  const params = useParams()
  const siteId = params?.id as string

  const site = SUPABASE_DEMO_SITES.find((s) => s.id === siteId) ?? SUPABASE_DEMO_SITES[0]
  const contract = site.contracts?.[0]
  const rapports = SUPABASE_DEMO_RAPPORTS.slice(0, 2)

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })

  const zones = ["cuisine", "cave", "reserves", "exterieurs"]

  return (
    <div style={{ padding: "32px 32px 64px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "24px", fontSize: "13px", color: "#9CA3AF" }}>
        <Link href="/dashboard/sites" style={{ color: "#9CA3AF", textDecoration: "none" }}>Mes sites</Link>
        <span>›</span>
        <span style={{ color: "#1B3A2D", fontWeight: 600 }}>{site.nom}</span>
      </div>

      {/* Title */}
      <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 8px", fontFamily: "var(--font-display), serif" }}>
        {site.nom}
      </h1>
      <p style={{ fontSize: "14px", color: "#6B7280", margin: "0 0 32px" }}>{site.adresse} · {site.ville} {site.code_postal}</p>

      {/* 2-col layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>

        {/* === COLONNE GAUCHE === */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Fiche site */}
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Fiche site
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {[
                { label: "Secteur", value: site.secteur },
                { label: "Superficie", value: `${site.superficie} m²` },
                { label: "Début contrat", value: contract ? formatDate(contract.date_debut) : "—" },
                { label: "Fin contrat", value: contract ? formatDate(contract.date_fin) : "—" },
                { label: "Prix annuel", value: contract ? `${contract.prix_annuel.toLocaleString("fr-FR")} €` : "—" },
                { label: "Formule", value: contract?.formule === "serenite" ? "Sérénité" : "Essentiel" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151", margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Technicien attitré */}
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Technicien attitré
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "50%",
                background: "#F26522", color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px", fontWeight: 700, flexShrink: 0,
              }}>
                TL
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 2px" }}>Thomas Lebrun</p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, background: "#D1FAE5", color: "#065F46" }}>
                    Certifié Noxyera
                  </span>
                  <span style={{ fontSize: "12px", color: "#F59E0B" }}>★★★★★ 4.9</span>
                </div>
                <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "6px 0 0" }}>N° CERT-NXR-2024-001</p>
                <p style={{ fontSize: "12px", color: "#6B7280", margin: "2px 0 0" }}>06 12 34 56 78</p>
              </div>
            </div>
          </div>
        </div>

        {/* === COLONNE DROITE === */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Zones surveillées */}
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Zones surveillées
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {zones.map((z) => {
                const conf = ZONE_CONFIG[z]
                return (
                  <span
                    key={z}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: 600,
                      background: conf.ok ? "#D1FAE5" : "#FEF3C7",
                      color: conf.ok ? "#065F46" : "#92400E",
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      {conf.ok ? <Check size={12} /> : <AlertTriangle size={12} />} {conf.label}
                    </span>
                  </span>
                )
              })}
            </div>
          </div>

          {/* Score HACCP */}
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", display: "flex", justifyContent: "center" }}>
            <HaccpCircle score={98} />
          </div>

          {/* 2 derniers rapports */}
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Derniers rapports
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {rapports.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    background: "#F5F0E8",
                    gap: "12px",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#1B3A2D", margin: 0 }}>
                      {r.interventions?.date_reelle
                        ? formatDate(r.interventions.date_reelle)
                        : formatDate(r.created_at)}
                    </p>
                    <span style={{ padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, background: "#D1FAE5", color: "#065F46" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "3px" }}><Check size={11} /> HACCP</span>
                    </span>
                  </div>
                  <Link
                    href={`/dashboard/rapports/${r.id}`}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      background: "#1B3A2D",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: 600,
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    PDF →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
