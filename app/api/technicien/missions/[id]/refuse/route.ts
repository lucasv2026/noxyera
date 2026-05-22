import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const supabase = getAdminClient()
  if (!supabase) return NextResponse.json({ success: false })

  // 1. Récupérer les données avant de modifier (pour l'email admin)
  const { data: intervention } = await supabase
    .from("interventions")
    .select("id, date_prevue, site_id")
    .eq("id", params.id)
    .single()

  let nomSite = "Site inconnu"
  if (intervention?.site_id) {
    const { data: site } = await supabase
      .from("sites")
      .select("nom")
      .eq("id", intervention.site_id)
      .single()
    if (site?.nom) nomSite = site.nom
  }

  // 2. Reset : technicien_id=null, statut='proposee', refused_at=now()
  const { error } = await supabase
    .from("interventions")
    .update({
      technicien_id: null,
      statut: "proposee",
      refused_at: new Date().toISOString(),
    })
    .eq("id", params.id)

  if (error) {
    console.error("REFUSE MISSION ERROR:", JSON.stringify(error))
    return NextResponse.json({ success: false, error: true })
  }

  // 3. Alerter l'admin
  if (intervention) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://noxyera.com"
    const datePrevue = new Date(intervention.date_prevue).toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    })
    try {
      const { sendMissionRefuseeAdminEmail } = await import("@/lib/emails")
      await sendMissionRefuseeAdminEmail({
        interventionId: intervention.id,
        nomSite,
        datePrevue,
        adminPlanningUrl: `${siteUrl}/admin-noxyera/planning`,
      })
    } catch (emailErr) {
      console.error("EMAIL REFUSE MISSION ERROR:", emailErr)
    }
  }

  return NextResponse.json({ success: true, error: false })
}
