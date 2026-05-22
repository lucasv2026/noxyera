import { NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Validate caller is admin
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    let isAdmin = false
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle()
      isAdmin = profile?.role === "admin"
    }

    if (!isAdmin) return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Configuration manquante" }, { status: 500 })
    }

    const adminClient = createClient(supabaseUrl, serviceKey)

    const { data: admins, error } = await adminClient
      .from("profiles")
      .select("id, user_id, prenom, nom, email, created_at")
      .eq("role", "admin")
      .order("created_at", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ admins: admins ?? [] })
  } catch (err) {
    console.error("admin/admins error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
