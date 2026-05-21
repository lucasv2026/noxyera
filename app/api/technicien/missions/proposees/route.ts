import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const technicienId = searchParams.get("technicien_id")

  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return NextResponse.json({ missions: [] })
  }

  const supabase = getAdminClient()
  if (!supabase) return NextResponse.json({ missions: [] })

  let query = supabase
    .from("interventions")
    .select("id, date_prevue, type, notes, sites(id, nom, adresse, ville)")
    .eq("statut", "proposee")
    .order("date_prevue", { ascending: true })

  if (technicienId) {
    query = query.or(`technicien_id.is.null,technicien_id.eq.${technicienId}`)
  } else {
    query = query.is("technicien_id", null)
  }

  const { data, error } = await query
  if (error) console.error("PROPOSEES FETCH ERROR:", JSON.stringify(error))

  return NextResponse.json({ missions: data ?? [] })
}
