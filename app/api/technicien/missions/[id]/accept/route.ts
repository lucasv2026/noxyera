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

  const updates: Record<string, unknown> = { statut: "planifie" }
  if (technicienId) updates.technicien_id = technicienId

  const { error } = await supabase
    .from("interventions")
    .update(updates)
    .eq("id", params.id)

  if (error) {
    console.error("ACCEPT MISSION ERROR:", JSON.stringify(error))
    return NextResponse.json({ success: false })
  }

  return NextResponse.json({ success: true })
}
