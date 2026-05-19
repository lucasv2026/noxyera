import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { SUPABASE_DEMO_PROFILE } from "@/lib/demo-data"
import type { Profile } from "@/lib/types/dashboard"

async function getProfile(): Promise<Profile | null> {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"
  if (isDemoMode) return SUPABASE_DEMO_PROFILE

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

    if (!profile || profile.role !== "client") return null
    return profile as Profile
  } catch {
    return null
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile()

  if (!profile) {
    redirect("/login")
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", display: "flex" }}>
      <Sidebar profile={profile} />
      <main style={{ flex: 1, minWidth: 0 }}>
        {children}
      </main>
    </div>
  )
}
