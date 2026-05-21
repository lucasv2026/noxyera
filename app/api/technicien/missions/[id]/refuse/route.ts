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

  // Remet la mission dans le pool (technicien_id null, statut reste proposee)
  const { error } = await supabase
    .from("interventions")
    .update({ technicien_id: null, statut: "proposee" })
    .eq("id", params.id)

  if (error) console.error("REFUSE MISSION ERROR:", JSON.stringify(error))

  return NextResponse.json({ success: !error })
}
