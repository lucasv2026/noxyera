import { SUPABASE_DEMO_RAPPORTS } from "@/lib/demo-data"
import type { RapportWithRelations } from "@/lib/types/dashboard"
import { RapportsClient } from "./RapportsClient"

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

export default async function RapportsPage() {
  const rapports = await getRapports()
  return <RapportsClient rapports={rapports} />
}
