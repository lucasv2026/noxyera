import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function GET() {
  const supabase = getAdminClient()
  if (!supabase) return NextResponse.json({ expired: [], refused: [], staleLeads: [] })

  const cutoff48h = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

  const [expiredRes, refusedRes, staleLeadsRes] = await Promise.all([
    // a) Missions expirées
    supabase
      .from("interventions")
      .select("id, date_prevue, sites(nom)")
      .eq("statut", "expire")
      .order("date_prevue", { ascending: false })
      .limit(5),

    // b) Missions refusées (proposee + refused_at not null)
    supabase
      .from("interventions")
      .select("id, date_prevue, refused_at, sites(nom)")
      .eq("statut", "proposee")
      .not("refused_at", "is", null)
      .order("refused_at", { ascending: false })
      .limit(5),

    // c) Leads sans réponse depuis > 48h
    supabase
      .from("leads")
      .select("id, email, nom_etablissement, secteur, created_at")
      .eq("statut", "nouveau")
      .lt("created_at", cutoff48h)
      .order("created_at", { ascending: true })
      .limit(10),
  ])

  return NextResponse.json({
    expired:    expiredRes.data    ?? [],
    refused:    refusedRes.data    ?? [],
    staleLeads: staleLeadsRes.data ?? [],
  })
}
