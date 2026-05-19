import { Building2, Calendar, FileCheck, ChevronRight } from "lucide-react"
import Link from "next/link"
import type { Site } from "@/lib/types/dashboard"
import { StatusBadge } from "./StatusBadge"

interface SiteCardProps {
  site: Site
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}

export function SiteCard({ site }: SiteCardProps) {
  const contract = site.contracts?.[0]
  const nextIntervention = site.interventions
    ?.filter((i) => i.statut === "planifie")
    .sort((a, b) => a.date_prevue.localeCompare(b.date_prevue))[0]

  const doneCount = site.interventions?.filter((i) => i.statut === "realise").length ?? 0

  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "18px 20px",
          borderBottom: "1px solid #F3F4F6",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "#F5F0E8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Building2 size={16} style={{ color: "#1B3A2D" }} />
          </div>
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1B3A2D", margin: 0 }}>
              {site.nom}
            </h3>
            <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0, marginTop: "2px" }}>
              {site.adresse} · {site.ville}
            </p>
          </div>
        </div>
        <StatusBadge status={site.statut} type="site" />
      </div>

      {/* Body */}
      <div style={{ padding: "16px 20px" }}>
        {/* Contract info */}
        {contract ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginBottom: "14px",
            }}
          >
            <div>
              <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Formule
              </p>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#374151", margin: 0, marginTop: "2px", textTransform: "capitalize" }}>
                {contract.formule}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Passages/an
              </p>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#374151", margin: 0, marginTop: "2px" }}>
                {contract.frequence}×
              </p>
            </div>
            <div>
              <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Prix annuel
              </p>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#374151", margin: 0, marginTop: "2px" }}>
                {contract.prix_annuel.toLocaleString("fr-FR")} €
              </p>
            </div>
            <div>
              <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Interventions
              </p>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#374151", margin: 0, marginTop: "2px" }}>
                {doneCount} réalisée{doneCount > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "14px" }}>Aucun contrat actif</p>
        )}

        {/* Next intervention */}
        {nextIntervention ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 12px",
              background: "#F0FDF4",
              borderRadius: "8px",
              marginBottom: "14px",
            }}
          >
            <Calendar size={14} style={{ color: "#16A34A", flexShrink: 0 }} />
            <span style={{ fontSize: "12px", color: "#15803D", fontWeight: 500 }}>
              Prochain passage · {formatDate(nextIntervention.date_prevue)}
            </span>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 12px",
              background: "#F9FAFB",
              borderRadius: "8px",
              marginBottom: "14px",
            }}
          >
            <Calendar size={14} style={{ color: "#9CA3AF", flexShrink: 0 }} />
            <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Aucune intervention planifiée</span>
          </div>
        )}

        {/* HACCP + link */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <FileCheck size={13} style={{ color: "#27AE60" }} />
            <span style={{ fontSize: "12px", color: "#27AE60", fontWeight: 500 }}>HACCP conforme</span>
          </div>
          <Link
            href="/dashboard/interventions"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              color: "#1B3A2D",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Voir les interventions
            <ChevronRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  )
}
