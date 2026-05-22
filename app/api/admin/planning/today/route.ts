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
  if (!supabase) return NextResponse.json([])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data, error } = await supabase
    .from("interventions")
    .select(`
      id,
      type,
      statut,
      date_prevue,
      heure_arrivee,
      sites ( nom, adresse ),
      technicien:profiles!interventions_technicien_id_fkey ( prenom, nom )
    `)
    .gte("date_prevue", today.toISOString())
    .lt("date_prevue", tomorrow.toISOString())
    .order("date_prevue", { ascending: true })

  if (error) console.error("[planning/today] FETCH ERROR:", JSON.stringify(error))

  return NextResponse.json(data ?? [])
}
