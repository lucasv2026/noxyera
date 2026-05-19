import { redirect } from "next/navigation"
import { TechnicienHeader } from "@/components/technicien/TechnicienHeader"
import { TechnicienNav } from "@/components/technicien/TechnicienNav"
import { SwRegistrar } from "@/components/technicien/SwRegistrar"
import type { Profile } from "@/lib/types/dashboard"
import { SUPABASE_DEMO_TECH_PROFILE } from "@/lib/demo-data"

async function getTechProfile(): Promise<Profile | null> {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"
  if (isDemoMode) return SUPABASE_DEMO_TECH_PROFILE

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!profile || profile.role !== "technicien") return null
    return profile as Profile
  } catch {
    return null
  }
}

export default async function TechnicienLayout({ children }: { children: React.ReactNode }) {
  const profile = await getTechProfile()

  if (!profile) {
    redirect("/espace-technicien")
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8" }}>
      <SwRegistrar />
      <TechnicienHeader profile={profile} />
      <TechnicienNav />
      <main>{children}</main>
    </div>
  )
}
