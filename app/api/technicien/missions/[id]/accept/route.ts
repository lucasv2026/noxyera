import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = getAdminClient()
  if (!supabase) return NextResponse.json({ success: false })

  const body = await request.json().catch(() => ({}))
  const technicienId = body.technicien_id

  // 1. Mettre à jour le statut avec accepted_at
  const updates: Record<string, unknown> = {
    statut: "planifie",
    accepted_at: new Date().toISOString(),
  }
  if (technicienId) updates.technicien_id = technicienId

  const { error: updateError } = await supabase
    .from("interventions")
    .update(updates)
    .eq("id", params.id)

  if (updateError) {
    console.error("ACCEPT MISSION UPDATE ERROR:", JSON.stringify(updateError))
    return NextResponse.json({ success: false })
  }

  // 2. Récupérer les données liées (site + profil technicien séparément pour éviter les ambiguïtés FK)
  const { data: interventionRaw, error: fetchError } = await supabase
    .from("interventions")
    .select("id, date_prevue, type, site_id, technicien_id")
    .eq("id", params.id)
    .single()

  if (fetchError || !interventionRaw) {
    console.error("ACCEPT MISSION FETCH ERROR:", JSON.stringify(fetchError))
    return NextResponse.json({ success: true }) // L'update a réussi même si l'email échoue
  }

  // 3. Récupérer le site
  const { data: site } = await supabase
    .from("sites")
    .select("nom, adresse, client_id")
    .eq("id", interventionRaw.site_id)
    .single()

  // 4. Récupérer le technicien
  const { data: tech } = await supabase
    .from("profiles")
    .select("prenom, nom, email, numero_certibiocide")
    .eq("id", interventionRaw.technicien_id)
    .single()

  // 5. Récupérer l'email du client via client_id du site
  let clientEmail: string | null = null
  let clientPrenom = ""

  if (site?.client_id) {
    // Essai 1 : client_id = profiles.user_id (données historiques)
    const { data: clientByUserId } = await supabase
      .from("profiles")
      .select("email, prenom")
      .eq("user_id", site.client_id)
      .maybeSingle()

    if (clientByUserId) {
      clientEmail = clientByUserId.email
      clientPrenom = clientByUserId.prenom ?? ""
    } else {
      // Essai 2 : client_id = profiles.id (données après migration)
      const { data: clientById } = await supabase
        .from("profiles")
        .select("email, prenom")
        .eq("id", site.client_id)
        .maybeSingle()
      clientEmail = clientById?.email ?? null
      clientPrenom = clientById?.prenom ?? ""
    }
  }

  // 6. Envoyer l'email de confirmation au client (C3)
  if (clientEmail && tech) {
    const datePrevue = new Date(interventionRaw.date_prevue).toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
    try {
      const { sendConfirmationInterventionEmail } = await import("@/lib/emails")
      await sendConfirmationInterventionEmail(clientEmail, {
        prenomClient: clientPrenom,
        nomSite: site?.nom ?? "votre site",
        adresseSite: site?.adresse ?? "",
        datePrevue,
        nomTechnicien: `${tech.prenom} ${tech.nom}`,
        numeroCertibiocide: tech.numero_certibiocide ?? null,
      })
    } catch (emailErr) {
      console.error("EMAIL ACCEPT MISSION ERROR:", emailErr)
    }
  }

  return NextResponse.json({ success: true })
}
