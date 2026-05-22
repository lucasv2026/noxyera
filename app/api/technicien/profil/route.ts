import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, prenom, nom, email, telephone, certif_biocide_numero, certif_biocide_expiration, rc_pro_expiration")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const firstOfYear = new Date(now.getFullYear(), 0, 1).toISOString()

    // Gains this month
    const { data: monthInterventions } = await supabase
      .from("interventions")
      .select("prix_technicien")
      .eq("technicien_id", profile.id)
      .eq("statut", "realise")
      .gte("date_reelle", firstOfMonth)

    const gainsMonth = (monthInterventions ?? []).reduce(
      (acc: number, i: { prix_technicien: number | null }) => acc + (i.prix_technicien ?? 0),
      0
    )
    const interventionsMonth = (monthInterventions ?? []).length

    // Gains YTD
    const { data: ytdInterventions } = await supabase
      .from("interventions")
      .select("prix_technicien")
      .eq("technicien_id", profile.id)
      .eq("statut", "realise")
      .gte("date_reelle", firstOfYear)

    const gainsYTD = (ytdInterventions ?? []).reduce(
      (acc: number, i: { prix_technicien: number | null }) => acc + (i.prix_technicien ?? 0),
      0
    )

    // Next virement: 1er du mois prochain
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const nextVirement = `1er ${nextMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`

    return NextResponse.json({
      profile: {
        prenom: profile.prenom ?? null,
        nom: profile.nom ?? null,
        email: profile.email ?? null,
        telephone: profile.telephone ?? null,
        certif_biocide_numero: (profile as Record<string, unknown>).certif_biocide_numero ?? null,
        certif_biocide_expiration: (profile as Record<string, unknown>).certif_biocide_expiration ?? null,
        rc_pro_expiration: (profile as Record<string, unknown>).rc_pro_expiration ?? null,
      },
      gainsMonth,
      interventionsMonth,
      gainsYTD,
      nextVirement,
    })
  } catch (err) {
    console.error("technicien/profil error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
