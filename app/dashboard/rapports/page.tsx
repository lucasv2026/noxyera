import { FileText } from "lucide-react"
import { RapportTable } from "@/components/dashboard/RapportTable"
import { SUPABASE_DEMO_RAPPORTS } from "@/lib/demo-data"
import type { RapportWithRelations } from "@/lib/types/dashboard"

async function getRapports(): Promise<RapportWithRelations[]> {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

  if (isDemoMode) return SUPABASE_DEMO_RAPPORTS

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return SUPABASE_DEMO_RAPPORTS

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

export default async function RapportsPage() {
  const rapports = await getRapports()

  return (
    <div style={{ padding: "32px 32px 48px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "#F5F0E8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileText size={16} style={{ color: "#1B3A2D" }} />
          </div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#1B3A2D",
              margin: 0,
              fontFamily: "var(--font-display), DM Serif Display, serif",
            }}
          >
            Rapports d&apos;intervention
          </h1>
        </div>
        <p style={{ fontSize: "14px", color: "#6B7280", margin: 0, marginLeft: "48px" }}>
          Historique complet · téléchargement PDF disponible
        </p>
      </div>

      <RapportTable rapports={rapports} />
    </div>
  )
}
