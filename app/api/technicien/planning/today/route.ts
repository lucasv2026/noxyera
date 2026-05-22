import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

    const todayStr = new Date().toISOString().split("T")[0]

    const { data: interventions } = await supabase
      .from("interventions")
      .select("*, sites(*)")
      .eq("technicien_id", profile.id)
      .in("statut", ["planifie", "en_cours"])
      .gte("date_prevue", todayStr + "T00:00:00")
      .lte("date_prevue", todayStr + "T23:59:59")
      .order("date_prevue", { ascending: true })

    return NextResponse.json({ interventions: interventions ?? [] })
  } catch (err) {
    console.error("technicien/planning/today error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
