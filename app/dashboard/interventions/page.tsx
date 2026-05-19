import { Calendar } from "lucide-react"
import { SUPABASE_DEMO_SITES } from "@/lib/demo-data"
import type { Site } from "@/lib/types/dashboard"
import InterventionsClient from "./InterventionsClient"

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

async function getData(): Promise<InterventionWithSite[]> {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

  if (isDemoMode) {
    return SUPABASE_DEMO_SITES.flatMap((site: Site) =>
      (site.interventions ?? []).map((i) => ({ ...i, siteNom: site.nom }))
    )
  }

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
      .select("id, nom")
      .eq("client_id", profile.id)

    const siteIds = (sites ?? []).map((s: { id: string }) => s.id)
    if (siteIds.length === 0) return []

    const siteMap: Record<string, string> = {}
    for (const s of sites ?? []) {
      siteMap[(s as { id: string; nom: string }).id] = (s as { id: string; nom: string }).nom
    }

    const { data: interventions } = await supabase
      .from("interventions")
      .select("id, site_id, type, statut, date_prevue, date_reelle, notes")
      .in("site_id", siteIds)
      .order("date_prevue", { ascending: false })

    return (interventions ?? []).map((i: {
      id: string; site_id: string; type: string; statut: string;
      date_prevue: string; date_reelle?: string | null; notes?: string | null
    }) => ({
      ...i,
      siteNom: siteMap[i.site_id] ?? "Site inconnu",
    }))
  } catch {
    return []
  }
}

export default async function InterventionsPage() {
  const interventions = await getData()

  if (interventions.length === 0) {
    return (
      <div style={{ padding: "32px 32px 64px" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1B3A2D", margin: 0, fontFamily: "var(--font-display), serif" }}>
            Interventions
          </h1>
          <p style={{ fontSize: "14px", color: "#6B7280", margin: "4px 0 0" }}>
            0 intervention au total
          </p>
        </div>
        <div style={{ background: "white", borderRadius: "16px", padding: "64px 32px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <Calendar size={40} style={{ color: "#E5E7EB", marginBottom: "16px" }} />
          <p style={{ fontSize: "16px", color: "#9CA3AF", margin: 0, fontWeight: 600 }}>Aucune donnée disponible</p>
          <p style={{ fontSize: "13px", color: "#D1D5DB", margin: "8px 0 0" }}>Vos interventions planifiées et réalisées apparaîtront ici.</p>
        </div>
      </div>
    )
  }

  return <InterventionsClient interventions={interventions} />
}
