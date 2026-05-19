"use client"

import { useParams } from "next/navigation"
import { SUPABASE_DEMO_RAPPORTS } from "@/lib/demo-data"
import Link from "next/link"

function QrCodeSimulation({ reference, datetime }: { reference: string; datetime: string }) {
  // Simple SVG QR-like pattern
  const cells: { x: number; y: number }[] = []
  const size = 7
  const seed = reference.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if ((row < 2 && col < 2) || (row < 2 && col > size - 3) || (row > size - 3 && col < 2)) {
        cells.push({ x: col, y: row })
      } else if ((seed + row * 7 + col) % 3 === 0) {
        cells.push({ x: col, y: row })
      }
    }
  }
  const cellSize = 14

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
      <div style={{ padding: "16px", background: "#F9FAFB", borderRadius: "12px", border: "1px solid #E5E7EB" }}>
        <svg width={size * cellSize} height={size * cellSize}>
          {cells.map(({ x, y }) => (
            <rect key={`${x}-${y}`} x={x * cellSize + 1} y={y * cellSize + 1} width={cellSize - 2} height={cellSize - 2} fill="#1B3A2D" rx="1" />
          ))}
        </svg>
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: "12px", fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>Référence : {reference}</p>
        <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 4px" }}>Horodatage UTC : {datetime}</p>
        <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: "#D1FAE5", color: "#065F46" }}>
          Document conforme HACCP
        </span>
      </div>
    </div>
  )
}

export default function RapportDetailPage() {
  const params = useParams()
  const rapportId = params?.id as string

  const rapport = SUPABASE_DEMO_RAPPORTS.find((r) => r.id === rapportId) ?? SUPABASE_DEMO_RAPPORTS[0]

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })

  const techNom = rapport.interventions?.profiles
    ? `${rapport.interventions.profiles.prenom ?? ""} ${rapport.interventions.profiles.nom ?? ""}`.trim()
    : "Jean-Marc Deschamps"

  const siteNom = rapport.interventions?.sites?.nom ?? "Yooma Urban Lodge Paris 15e"
  const dateLabel = rapport.interventions?.date_reelle
    ? formatDate(rapport.interventions.date_reelle)
    : formatDate(rapport.created_at)

  const typeLabel: Record<string, string> = {
    preventif: "Préventif",
    curatif: "Curatif",
    urgence: "Urgence",
  }

  // Demo products
  const produits = [
    { nom: "Brodifacoum 0.005% blocs", amm: "AMM 9810234", quantite: "50 mL" },
    { nom: "Bromadiolone pâtes", amm: "AMM 8720156", quantite: "30 mL" },
    { nom: "Imidaclopride gel", amm: "AMM 9340812", quantite: "15 g" },
  ]

  const zones = ["Cuisine", "Cave", "Réserves", "Zone de livraison", "Extérieurs"]
  const reference = `NXR-2026-${rapport.id.toUpperCase().replace("-", "").slice(0, 6)}`
  const datetime = rapport.created_at

  return (
    <div style={{ padding: "32px 32px 64px", maxWidth: "860px", margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "24px", fontSize: "13px", color: "#9CA3AF" }}>
        <Link href="/dashboard/rapports" style={{ color: "#9CA3AF", textDecoration: "none" }}>Rapports</Link>
        <span>›</span>
        <span style={{ color: "#1B3A2D", fontWeight: 600 }}>Rapport {reference}</span>
      </div>

      {/* Title */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1B3A2D", margin: 0 }}>
            Rapport d&apos;intervention
          </h1>
          <p style={{ fontSize: "14px", color: "#6B7280", margin: "4px 0 0" }}>{reference}</p>
        </div>
        <span style={{
          padding: "6px 16px", borderRadius: "20px",
          background: rapport.haccp_conforme ? "#D1FAE5" : "#FEF3C7",
          color: rapport.haccp_conforme ? "#065F46" : "#92400E",
          fontSize: "13px", fontWeight: 700,
        }}>
          {rapport.haccp_conforme ? "✓ HACCP Conforme" : "⚠ Anomalie détectée"}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Section 1 — Résumé */}
        <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Résumé de l&apos;intervention
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {[
              { label: "Date", value: dateLabel },
              { label: "Site", value: siteNom },
              { label: "Technicien", value: techNom },
              { label: "N° Certibiocide", value: "CERT-NXR-2024-001" },
              { label: "Type", value: typeLabel[rapport.interventions?.type ?? "preventif"] ?? "Préventif" },
              { label: "Statut HACCP", value: rapport.haccp_conforme ? "Conforme" : "Non conforme" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151", margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2 — Produits biocides */}
        <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Produits biocides utilisés
          </h2>
          <div style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid #F3F4F6" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr",
              padding: "10px 16px",
              background: "#FAFAFA",
              borderBottom: "1px solid #F3F4F6",
              fontSize: "11px", fontWeight: 700, color: "#9CA3AF",
              textTransform: "uppercase", letterSpacing: "0.05em",
            }}>
              <span>Produit</span>
              <span>N° Autorisation</span>
              <span>Quantité</span>
            </div>
            {produits.map((p, idx) => (
              <div
                key={p.amm}
                style={{
                  display: "grid", gridTemplateColumns: "2fr 1fr 1fr",
                  padding: "12px 16px",
                  borderBottom: idx < produits.length - 1 ? "1px solid #F9FAFB" : "none",
                  fontSize: "13px",
                }}
              >
                <span style={{ fontWeight: 600, color: "#374151" }}>{p.nom}</span>
                <span style={{ color: "#6B7280", fontFamily: "monospace" }}>{p.amm}</span>
                <span style={{ color: "#374151" }}>{p.quantite}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3 — Zones traitées */}
        <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Zones traitées
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {zones.map((zone, i) => (
              <span
                key={zone}
                style={{
                  padding: "6px 16px", borderRadius: "20px",
                  fontSize: "13px", fontWeight: 600,
                  background: i < 3 ? "#D1FAE5" : "#F5F0E8",
                  color: i < 3 ? "#065F46" : "#1B3A2D",
                }}
              >
                {zone} {i < 3 ? "✓" : ""}
              </span>
            ))}
          </div>
        </div>

        {/* Section 4 — QR Code */}
        <div style={{ background: "white", borderRadius: "16px", padding: "32px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", textAlign: "center" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 24px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            QR Code de vérification
          </h2>
          <QrCodeSimulation reference={reference} datetime={new Date(datetime).toUTCString()} />
        </div>

        {/* CTA télécharger */}
        <div style={{ textAlign: "center" }}>
          <button
            style={{
              padding: "14px 32px",
              borderRadius: "12px",
              background: "#F26522",
              color: "white",
              fontSize: "15px",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(242,101,34,0.3)",
            }}
            onClick={() => alert("Téléchargement PDF — disponible avec Supabase Storage activé.")}
          >
            Télécharger PDF
          </button>
        </div>
      </div>
    </div>
  )
}
