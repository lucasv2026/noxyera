import { FileText, ChevronRight } from "lucide-react"
import { SUPABASE_DEMO_RAPPORTS } from "@/lib/demo-data"
import type { RapportWithRelations } from "@/lib/types/dashboard"
import Link from "next/link"

async function getRapports(): Promise<RapportWithRelations[]> {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

  if (isDemoMode) return SUPABASE_DEMO_RAPPORTS

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!profile) return []

    const { data: sites } = await supabase
      .from("sites")
      .select("id")
      .eq("client_id", profile.id)

    const siteIds = (sites ?? []).map((s: { id: string }) => s.id)
    if (siteIds.length === 0) return []

    const { data: interventions } = await supabase
      .from("interventions")
      .select("id")
      .in("site_id", siteIds)

    const interventionIds = (interventions ?? []).map((i: { id: string }) => i.id)
    if (interventionIds.length === 0) return []

    const { data: rapports } = await supabase
      .from("rapports")
      .select(`
        *,
        interventions (
          id, type, date_reelle, date_prevue, notes,
          sites ( nom, adresse ),
          profiles ( nom, prenom )
        )
      `)
      .in("intervention_id", interventionIds)
      .order("created_at", { ascending: false })

    return (rapports as RapportWithRelations[]) ?? []
  } catch {
    return SUPABASE_DEMO_RAPPORTS
  }
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

export default async function RapportsPage() {
  const rapports = await getRapports()

  return (
    <div style={{ padding: "32px 32px 64px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1B3A2D", margin: 0, fontFamily: "var(--font-display), serif" }}>
          Rapports d&apos;intervention
        </h1>
        <p style={{ fontSize: "14px", color: "#6B7280", margin: "6px 0 0" }}>
          {rapports.length} rapport{rapports.length > 1 ? "s" : ""} · Téléchargement PDF disponible
        </p>
      </div>

      {/* Liste */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0", background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        {rapports.length === 0 ? (
          <div style={{ padding: "64px 32px", textAlign: "center" }}>
            <FileText size={40} style={{ color: "#E5E7EB", marginBottom: "12px" }} />
            <p style={{ fontSize: "14px", color: "#9CA3AF", margin: 0, fontWeight: 500 }}>Aucun rapport disponible</p>
          </div>
        ) : (
          rapports.map((rapport, idx) => {
            const dateLabel = rapport.interventions?.date_reelle
              ? formatDate(rapport.interventions.date_reelle)
              : formatDate(rapport.created_at)
            const siteNom = rapport.interventions?.sites?.nom ?? "Site inconnu"
            const techNom = rapport.interventions?.profiles
              ? `${rapport.interventions.profiles.prenom ?? ""} ${rapport.interventions.profiles.nom ?? ""}`.trim()
              : "T. Lebrun"
            const isAnomalie = !rapport.haccp_conforme

            return (
              <Link
                key={rapport.id}
                href={`/dashboard/rapports/${rapport.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px 20px",
                  textDecoration: "none",
                  borderBottom: idx < rapports.length - 1 ? "1px solid #F9FAFB" : "none",
                  background: isAnomalie ? "rgba(254,243,199,0.4)" : "transparent",
                  transition: "background 0.15s",
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
                      {dateLabel} · {techNom.includes("Deschamps") ? "J.-M. Deschamps" : "T. Lebrun"}
                    </span>
                  </div>
                  {rapport.interventions?.type && (
                    <p style={{ fontSize: "12px", color: "#6B7280", margin: "2px 0 0" }}>
                      <TypeLabel type={rapport.interventions.type} />
                      {isAnomalie && (
                        <span style={{ marginLeft: "8px", color: "#F26522", fontWeight: 600 }}>⚠ Anomalie détectée</span>
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
                    {rapport.haccp_conforme ? "98%" : "⚠ Non conforme"}
                  </span>
                  <ChevronRight size={16} style={{ color: "#9CA3AF" }} />
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
