import { NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    // Validate caller is admin
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    const body = await req.json() as { email?: string; prenom?: string; nom?: string }
    const { email, prenom, nom } = body

    if (!email || !prenom || !nom) {
      return NextResponse.json({ error: "email, prenom et nom sont requis" }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Configuration manquante" }, { status: 500 })
    }

    const adminClient = createClient(supabaseUrl, serviceKey)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://noxyera.com"

    const { error } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { prenom, nom, role: "admin" },
      redirectTo: `${siteUrl}/admin-noxyera/onboarding`,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("inviter-admin error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
