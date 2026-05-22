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
  if (!supabase) {
    return NextResponse.json({ leads: [], audits: [], candidatures: [], clientsCount: 0 })
  }

  const [leadsRes, auditsRes, candidaturesRes, clientsRes] = await Promise.all([
    supabase
      .from("leads")
      .select("id, secteur, superficie, created_at, statut, email, nom_etablissement")
      .order("created_at", { ascending: false }),
    supabase
      .from("audits")
      .select("id, nom_etablissement, email, statut, created_at, adresse")
      .order("created_at", { ascending: false }),
    supabase
      .from("candidatures_techniciens")
      .select("id, prenom, nom, email, ville, experience, statut, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "client"),
  ])

  return NextResponse.json({
    leads:        leadsRes.data        ?? [],
    audits:       auditsRes.data       ?? [],
    candidatures: candidaturesRes.data ?? [],
    clientsCount: clientsRes.count     ?? 0,
  })
}
