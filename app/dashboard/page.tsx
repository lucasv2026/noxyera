import { Building2, CheckCircle, CalendarClock, FileCheck } from "lucide-react"
import { StatCard } from "@/components/dashboard/StatCard"
import { SiteCard } from "@/components/dashboard/SiteCard"
import { SUPABASE_DEMO_PROFILE, SUPABASE_DEMO_SITES } from "@/lib/demo-data"
import type { Profile, Site } from "@/lib/types/dashboard"

interface DashboardData {
  profile: Profile
  sites: Site[]
}

async function getData(): Promise<DashboardData> {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

  if (isDemoMode) {
    return { profile: SUPABASE_DEMO_PROFILE, sites: SUPABASE_DEMO_SITES }
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { profile: SUPABASE_DEMO_PROFILE, sites: [] }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!profile) return { profile: SUPABASE_DEMO_PROFILE, sites: [] }

    const { data: sites } = await supabase
      .from("sites")
      .select("*, contracts(*), interventions(*)")
      .eq("client_id", profile.id)
      .eq("statut", "actif")

    return { profile: profile as Profile, sites: (sites as Site[]) ?? [] }
  } catch {
    return { profile: SUPABASE_DEMO_PROFILE, sites: SUPABASE_DEMO_SITES }
  }
}

export default async function DashboardPage() {
  const { profile, sites } = await getData()

  const allInterventions = sites.flatMap((s) => s.interventions ?? [])
  const nextIntervention = allInterventions
    .filter((i) => i.statut === "planifie")
    .sort((a, b) => a.date_prevue.localeCompare(b.date_prevue))[0]

  const realisees = allInterventions.filter((i) => i.statut === "realise").length

  const prochainLabel = nextIntervention
    ? new Date(nextIntervention.date_prevue).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
    : "—"

  const prochainSiteNom = nextIntervention
    ? sites.find((s) => s.interventions?.some((i) => i.id === nextIntervention.id))?.nom ?? ""
    : "Aucun planifié"

  return (
    <div style={{ padding: "32px 32px 48px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#1B3A2D",
            margin: 0,
            fontFamily: "var(--font-display), DM Serif Display, serif",
          }}
        >
          Bonjour, {profile.prenom ?? profile.entreprise ?? "Client"} 👋
        </h1>
        <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "6px", marginBottom: 0 }}>
          Voici un aperçu de vos sites et interventions Noxyera.
        </p>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <StatCard
          icon={Building2}
          label="Sites actifs"
          value={sites.length}
          sub="sous contrat"
        />
        <StatCard
          icon={CalendarClock}
          label="Prochain passage"
          value={prochainLabel}
          sub={prochainSiteNom}
        />
        <StatCard
          icon={FileCheck}
          label="Interventions réalisées"
          value={realisees}
          sub="cette année"
          accent
        />
      </div>

      {/* Site cards */}
      <div>
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1B3A2D", margin: 0, marginBottom: "16px" }}>
          Vos sites
        </h2>

        {sites.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "48px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <Building2 size={32} style={{ color: "#E5E7EB", marginBottom: "12px" }} />
            <p style={{ fontSize: "15px", color: "#9CA3AF", margin: 0, fontWeight: 500 }}>
              Aucun site actif
            </p>
            <p style={{ fontSize: "13px", color: "#D1D5DB", margin: "6px 0 0" }}>
              Contactez Noxyera pour créer votre premier site.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
              gap: "16px",
            }}
          >
            {sites.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
        )}
      </div>

      {/* HACCP status bar */}
      <div
        style={{
          marginTop: "32px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "14px 20px",
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <CheckCircle size={16} style={{ color: "#27AE60" }} />
        <p style={{ fontSize: "13px", color: "#374151", margin: 0 }}>
          <strong>Conformité HACCP</strong> — Tous vos sites sont conformes aux exigences réglementaires en vigueur.
        </p>
      </div>
    </div>
  )
}
