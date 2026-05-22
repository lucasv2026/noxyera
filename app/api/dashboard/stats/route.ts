import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

    // Sites count
    const { count: sitesCount } = await supabase
      .from("sites")
      .select("id", { count: "exact", head: true })
      .eq("client_id", profile.id)
      .eq("statut", "actif")

    // Site IDs
    const { data: siteRows } = await supabase
      .from("sites")
      .select("id")
      .eq("client_id", profile.id)
      .eq("statut", "actif")

    const siteIds = (siteRows ?? []).map((s: { id: string }) => s.id)

    let prochaineVisite: { date: string; siteName: string; daysFromNow: number } | null = null
    let haccpScore = 100
    let alertesCount = 0

    if (siteIds.length > 0) {
      // Prochaine visite
      const { data: nextInterv } = await supabase
        .from("interventions")
        .select("id, date_prevue, site_id, sites(nom)")
        .in("site_id", siteIds)
        .eq("statut", "planifie")
        .gte("date_prevue", new Date().toISOString())
        .order("date_prevue", { ascending: true })
        .limit(1)
        .maybeSingle()

      if (nextInterv) {
        const days = Math.ceil((new Date(nextInterv.date_prevue).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        const siteData = (nextInterv.sites as unknown as { nom: string } | null)
        prochaineVisite = {
          date: nextInterv.date_prevue,
          siteName: siteData?.nom ?? "—",
          daysFromNow: days,
        }
      }

      // Intervention IDs for rapports
      const { data: interventionRows } = await supabase
        .from("interventions")
        .select("id")
        .in("site_id", siteIds)

      const interventionIds = (interventionRows ?? []).map((i: { id: string }) => i.id)

      if (interventionIds.length > 0) {
        // HACCP score
        const { data: rapports } = await supabase
          .from("rapports")
          .select("haccp_conforme")
          .in("intervention_id", interventionIds)

        if (rapports && rapports.length > 0) {
          const conforme = rapports.filter((r: { haccp_conforme: boolean }) => r.haccp_conforme).length
          haccpScore = Math.round((conforme / rapports.length) * 100)
        }
      }

      // Alertes count: sites where last realise intervention was >90 days ago OR no realise at all
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      let alertes = 0
      for (const siteId of siteIds) {
        const { data: lastRealise } = await supabase
          .from("interventions")
          .select("date_reelle")
          .eq("site_id", siteId)
          .eq("statut", "realise")
          .order("date_reelle", { ascending: false })
          .limit(1)
          .maybeSingle()

        if (!lastRealise || (lastRealise.date_reelle && lastRealise.date_reelle < ninetyDaysAgo)) {
          alertes++
        }
      }
      alertesCount = alertes
    }

    return NextResponse.json({
      sitesCount: sitesCount ?? 0,
      prochaineVisite,
      haccpScore,
      alertesCount,
    })
  } catch (err) {
    console.error("dashboard/stats error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
