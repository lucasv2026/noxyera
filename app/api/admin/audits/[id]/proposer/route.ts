import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = getAdminClient()
  if (!supabase) return NextResponse.json({ success: false, error: "Supabase non configuré" })

  const body = await request.json().catch(() => ({}))
  const { technicienId } = body as { technicienId: string }

  if (!technicienId) {
    return NextResponse.json({ success: false, error: "technicienId requis" }, { status: 400 })
  }

  // 1. Fetch audit
  const { data: audit, error: auditError } = await supabase
    .from("audits")
    .select("id, nom_etablissement, adresse, secteur, superficie, date_audit_prevue, technicien_id")
    .eq("id", params.id)
    .single()

  if (auditError || !audit) {
    return NextResponse.json({ success: false, error: "Audit introuvable" }, { status: 404 })
  }

  // 2. Fetch technicien
  const { data: tech } = await supabase
    .from("profiles")
    .select("email, prenom, nom")
    .eq("id", technicienId)
    .single()

  if (!tech) {
    return NextResponse.json({ success: false, error: "Technicien introuvable" }, { status: 404 })
  }

  const offeredAt = new Date()
  const expiresAt = new Date(offeredAt.getTime() + 24 * 60 * 60 * 1000) // +24h exactement

  // 3. Find or create intervention for this audit (clé stable = audit_id, idempotent)
  const interventionData = {
    audit_id:      params.id,
    technicien_id: technicienId,
    type:          "audit",
    date_prevue:   audit.date_audit_prevue ?? new Date().toISOString(),
    statut:        "proposee",
    offered_at:    offeredAt.toISOString(),
    expires_at:    expiresAt.toISOString(),
    notes:         `Audit — ${audit.nom_etablissement} — ${audit.adresse}`,
  }

  const { data: existing } = await supabase
    .from("interventions")
    .select("id")
    .eq("audit_id", params.id)
    .maybeSingle()

  const { error: interventionError } = existing?.id
    ? await supabase.from("interventions").update(interventionData).eq("id", existing.id)
    : await supabase.from("interventions").insert(interventionData)

  if (interventionError) {
    console.error("PROPOSER INTERVENTION ERROR:", JSON.stringify(interventionError))
    return NextResponse.json({ success: false, error: interventionError.message }, { status: 500 })
  }

  // 4. Update audit statut → 'proposé'
  await supabase
    .from("audits")
    .update({ statut: "proposé", technicien_id: technicienId })
    .eq("id", params.id)

  // 5. Email T1 au technicien (offre de mission)
  if (tech.email) {
    const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL ?? "https://noxyera.com"
    const datePrevue = audit.date_audit_prevue
      ? new Date(audit.date_audit_prevue).toLocaleDateString("fr-FR", {
          weekday: "long", day: "numeric", month: "long", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        })
      : "À définir"

    try {
      const { sendOffreMissionEmail } = await import("@/lib/emails")
      await sendOffreMissionEmail(tech.email, {
        prenomTechnicien: tech.prenom ?? "",
        nomSite:          audit.nom_etablissement,
        adresseSite:      audit.adresse,
        datePrevue,
        type:             "audit",
        secteur:          audit.secteur ?? "",
        superficie:       audit.superficie ?? null,
        notesClient:      null,
        prixTechnicien:   null,
        appUrl:           siteUrl,
      })
    } catch (emailErr) {
      console.error("[audits/proposer] EMAIL ERROR:", emailErr)
    }
  }

  return NextResponse.json({ success: true, prenomTech: tech.prenom })
}
