import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Cron Vercel — tourne toutes les heures
// Passe les offres de mission expirées (proposee + expires_at < now) au statut 'expire'
// Protégé par Authorization: Bearer CRON_SECRET

export async function GET(request: NextRequest) {
  // Vérification du secret cron
  const authHeader = request.headers.get("Authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.log("[cron/expire-missions] Supabase non configuré — skip")
    return NextResponse.json({ expired: 0, mock: true })
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })

  // 1. Trouver toutes les offres expirées
  const { data: expiredMissions, error: fetchError } = await supabase
    .from("interventions")
    .select("id, site_id, date_prevue")
    .eq("statut", "proposee")
    .lt("expires_at", new Date().toISOString())

  if (fetchError) {
    console.error("CRON EXPIRE FETCH ERROR:", JSON.stringify(fetchError))
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!expiredMissions || expiredMissions.length === 0) {
    return NextResponse.json({ expired: 0 })
  }

  let expiredCount = 0

  for (const mission of expiredMissions) {
    // 2. Passer au statut 'expire' et libérer le technicien
    const { error: updateError } = await supabase
      .from("interventions")
      .update({
        statut: "expire",
        technicien_id: null,
      })
      .eq("id", mission.id)

    if (updateError) {
      console.error(`CRON EXPIRE UPDATE ERROR (${mission.id}):`, JSON.stringify(updateError))
      continue
    }

    expiredCount++

    // 3. Récupérer le nom du site pour l'email
    let nomSite = "Site inconnu"
    if (mission.site_id) {
      const { data: site } = await supabase
        .from("sites")
        .select("nom")
        .eq("id", mission.site_id)
        .single()
      if (site?.nom) nomSite = site.nom
    }

    // 4. Alerter l'admin
    const datePrevue = new Date(mission.date_prevue).toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    })

    try {
      const { sendMissionExpireedAdminEmail } = await import("@/lib/emails")
      await sendMissionExpireedAdminEmail({
        interventionId: mission.id,
        nomSite,
        datePrevue,
      })
    } catch (emailErr) {
      console.error(`EMAIL EXPIRE MISSION ERROR (${mission.id}):`, emailErr)
    }
  }

  console.log(`[cron/expire-missions] ${expiredCount} mission(s) expirée(s)`)
  return NextResponse.json({ expired: expiredCount })
}
