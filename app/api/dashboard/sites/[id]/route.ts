import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
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

    // Security: validate site belongs to this client
    const { data: site } = await supabase
      .from("sites")
      .select("*, contracts(*)")
      .eq("id", params.id)
      .eq("client_id", profile.id)
      .maybeSingle()

    if (!site) return NextResponse.json({ error: "Site not found or access denied" }, { status: 404 })

    // Last 5 rapports with intervention info
    const { data: interventionRows } = await supabase
      .from("interventions")
      .select("id")
      .eq("site_id", params.id)

    const interventionIds = (interventionRows ?? []).map((i: { id: string }) => i.id)

    let rapports: unknown[] = []
    let technicien: { prenom: string | null; nom: string | null; telephone: string | null } | null = null

    if (interventionIds.length > 0) {
      const { data: rapportRows } = await supabase
        .from("rapports")
        .select(`
          id, created_at, haccp_conforme, pdf_url,
          interventions(date_reelle, date_prevue, type, sites(nom))
        `)
        .in("intervention_id", interventionIds)
        .order("created_at", { ascending: false })
        .limit(5)

      rapports = rapportRows ?? []

      // Technicien from last intervention with a technicien_id
      const { data: lastInterv } = await supabase
        .from("interventions")
        .select("technicien_id")
        .eq("site_id", params.id)
        .not("technicien_id", "is", null)
        .order("date_prevue", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (lastInterv?.technicien_id) {
        const { data: techProfile } = await supabase
          .from("profiles")
          .select("prenom, nom, telephone")
          .eq("id", lastInterv.technicien_id)
          .maybeSingle()

        technicien = techProfile ?? null
      }
    }

    return NextResponse.json({ site, rapports, technicien })
  } catch (err) {
    console.error("dashboard/sites/[id] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
