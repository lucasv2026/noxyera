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
  if (!supabase) return NextResponse.json({ success: false, error: "Supabase non configuré" })

  const body = await request.json().catch(() => ({}))
  const { technicienId } = body as { technicienId: string }

  if (!technicienId) {
    return NextResponse.json({ success: false, error: "technicienId requis" }, { status: 400 })
  }

  // 1. Vérifier que l'intervention est dans un statut permettant l'offre
  const { data: intervention, error: fetchError } = await supabase
    .from("interventions")
    .select("id, date_prevue, type, site_id, statut, notes_client, prix_technicien")
    .eq("id", params.id)
    .single()

  if (fetchError || !intervention) {
    return NextResponse.json({ success: false, error: "Intervention introuvable" }, { status: 404 })
  }

  if (!["planifie", "proposee"].includes(intervention.statut)) {
    return NextResponse.json(
      { success: false, error: `Statut '${intervention.statut}' ne permet pas une nouvelle offre` },
      { status: 409 }
    )
  }

  // 2. Récupérer le profil du technicien
  const { data: tech, error: techError } = await supabase
    .from("profiles")
    .select("email, prenom, nom")
    .eq("id", technicienId)
    .single()

  if (techError || !tech) {
    return NextResponse.json({ success: false, error: "Technicien introuvable" }, { status: 404 })
  }

  // 3. Récupérer le site
  const { data: site } = await supabase
    .from("sites")
    .select("nom, adresse, secteur, superficie")
    .eq("id", intervention.site_id)
    .single()

  // 4. Mettre à jour l'intervention
  const offeredAt = new Date()
  const expiresAt = new Date(offeredAt.getTime() + 24 * 60 * 60 * 1000) // +24h exactement

  const { error: updateError } = await supabase
    .from("interventions")
    .update({
      technicien_id: technicienId,
      statut: "proposee",
      offered_at: offeredAt.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .eq("id", params.id)

  if (updateError) {
    console.error("OFFRIR MISSION UPDATE ERROR:", JSON.stringify(updateError))
    return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
  }

  // 5. Envoyer l'email d'offre au technicien (T1)
  if (tech.email) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://noxyera.com"
    const datePrevue = new Date(intervention.date_prevue).toLocaleDateString("fr-FR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
    try {
      const { sendOffreMissionEmail } = await import("@/lib/emails")
      await sendOffreMissionEmail(tech.email, {
        prenomTechnicien: tech.prenom ?? "",
        nomSite: site?.nom ?? "Établissement",
        adresseSite: site?.adresse ?? "",
        datePrevue,
        type: intervention.type ?? "preventif",
        secteur: site?.secteur ?? "",
        superficie: site?.superficie ?? null,
        notesClient: intervention.notes_client ?? null,
        prixTechnicien: intervention.prix_technicien ?? null,
        appUrl: siteUrl,
      })
    } catch (emailErr) {
      console.error("EMAIL OFFRIR MISSION ERROR:", emailErr)
    }
  }

  return NextResponse.json({ success: true })
}
