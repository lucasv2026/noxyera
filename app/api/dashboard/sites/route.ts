import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type SiteStatus = "urgent" | "bientot_du" | "conforme"

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

    const { data: sites } = await supabase
      .from("sites")
      .select("*, contracts(*), interventions(*)")
      .eq("client_id", profile.id)
      .eq("statut", "actif")

    if (!sites) return NextResponse.json([])

    const now = Date.now()
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000
    const fourteenDaysFromNow = now + 14 * 24 * 60 * 60 * 1000

    const sitesWithStatus = sites.map((site) => {
      const interventions = (site.interventions ?? []) as Array<{
        id: string
        statut: string
        date_reelle: string | null
        date_prevue: string
      }>

      const realised = interventions
        .filter((i) => i.statut === "realise" && i.date_reelle)
        .sort((a, b) => (b.date_reelle ?? "").localeCompare(a.date_reelle ?? ""))

      const lastRealise = realised[0] ?? null

      const nextPlanifie = interventions
        .filter((i) => i.statut === "planifie")
        .sort((a, b) => a.date_prevue.localeCompare(b.date_prevue))[0] ?? null

      let siteStatus: SiteStatus = "conforme"

      if (!lastRealise || (lastRealise.date_reelle && new Date(lastRealise.date_reelle).getTime() < ninetyDaysAgo)) {
        siteStatus = "urgent"
      } else if (nextPlanifie && new Date(nextPlanifie.date_prevue).getTime() < fourteenDaysFromNow) {
        siteStatus = "bientot_du"
      }

      return { ...site, siteStatus }
    })

    return NextResponse.json(sitesWithStatus)
  } catch (err) {
    console.error("dashboard/sites error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
