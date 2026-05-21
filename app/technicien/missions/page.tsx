import Link from "next/link"
import { Suspense } from "react"
import { ArrowRight, CalendarDays, MapPin, Clock, AlertTriangle } from "lucide-react"
import {
  SUPABASE_DEMO_TECH_PROFILE,
  SUPABASE_DEMO_MISSIONS_TODAY,
  SUPABASE_DEMO_MISSIONS_WEEK,
  type MissionWithSite,
} from "@/lib/demo-data"
import type { Profile } from "@/lib/types/dashboard"
import { RapportSuccessBanner } from "@/components/technicien/RapportSuccessBanner"
import { MissionsProposees } from "@/components/technicien/MissionsProposees"

const TYPE_CONFIG = {
  preventif: { label: "Préventif",  bg: "#D1FAE5", color: "#065F46" },
  curatif:   { label: "Curatif",    bg: "#FEF3C7", color: "#92400E" },
  urgence:   { label: "Urgence",    bg: "#FEE2E2", color: "#DC2626" },
}

function formatHour(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })
}

interface MissionsData {
  profile: Profile
  today: MissionWithSite[]
  week: MissionWithSite[]
}

async function getData(): Promise<MissionsData> {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

  if (isDemoMode) {
    return {
      profile: SUPABASE_DEMO_TECH_PROFILE,
      today: SUPABASE_DEMO_MISSIONS_TODAY,
      week: SUPABASE_DEMO_MISSIONS_WEEK,
    }
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { profile: SUPABASE_DEMO_TECH_PROFILE, today: [], week: [] }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!profile) return { profile: SUPABASE_DEMO_TECH_PROFILE, today: [], week: [] }

    const todayStr = new Date().toISOString().split("T")[0]
    const in7days = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split("T")[0]

    const { data: todayMissions } = await supabase
      .from("interventions")
      .select("*, sites(id, nom, adresse, ville, secteur, code_postal, client_id), contracts(formule, frequence)")
      .eq("technicien_id", profile.id)
      .eq("statut", "planifie")
      .gte("date_prevue", todayStr + "T00:00:00")
      .lte("date_prevue", todayStr + "T23:59:59")
      .order("date_prevue", { ascending: true })

    const { data: weekMissions } = await supabase
      .from("interventions")
      .select("*, sites(id, nom, adresse, ville, secteur, code_postal, client_id), contracts(formule, frequence)")
      .eq("technicien_id", profile.id)
      .eq("statut", "planifie")
      .gt("date_prevue", todayStr + "T23:59:59")
      .lte("date_prevue", in7days + "T23:59:59")
      .order("date_prevue", { ascending: true })

    return {
      profile: profile as Profile,
      today: (todayMissions as MissionWithSite[]) ?? [],
      week: (weekMissions as MissionWithSite[]) ?? [],
    }
  } catch {
    return {
      profile: SUPABASE_DEMO_TECH_PROFILE,
      today: SUPABASE_DEMO_MISSIONS_TODAY,
      week: SUPABASE_DEMO_MISSIONS_WEEK,
    }
  }
}

export default async function MissionsPage() {
  const { profile, today, week } = await getData()

  const todayLabel = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  // Capitalize first letter
  const todayDisplay = todayLabel.charAt(0).toUpperCase() + todayLabel.slice(1)

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 20px 64px" }}>
      <Suspense fallback={null}>
        <RapportSuccessBanner />
      </Suspense>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#1B3A2D", margin: 0 }}>
          Mon planning
        </h1>
        <p style={{ fontSize: "14px", color: "#F26522", fontWeight: 600, marginTop: "4px", marginBottom: 0 }}>
          {todayDisplay}
        </p>
      </div>

      {/* Missions proposées */}
      <MissionsProposees technicienId={profile.id} />

      {/* Missions aujourd'hui */}
      <section style={{ marginBottom: "40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <CalendarDays size={15} style={{ color: "#1B3A2D" }} />
          <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1B3A2D", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Aujourd&apos;hui — {today.length} mission{today.length > 1 ? "s" : ""}
          </h2>
        </div>

        {today.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "40px 24px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
              <CalendarDays size={18} style={{ color: "#F59E0B" }} />
            </div>
            <p style={{ fontSize: "16px", fontWeight: 600, color: "#1B3A2D", margin: "0 0 6px" }}>
              Aucune mission planifiée aujourd&apos;hui.
            </p>
            <p style={{ fontSize: "14px", color: "#9CA3AF", margin: 0 }}>
              Bonne journée, {profile.prenom} !
            </p>
            <Link
              href="#semaine"
              style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "16px", fontSize: "13px", color: "#F26522", fontWeight: 600, textDecoration: "none" }}
            >
              Voir toutes mes missions <ArrowRight size={12} />
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {today.map((mission) => {
              const tc = TYPE_CONFIG[mission.type]
              const site = mission.sites
              return (
                <div
                  key={mission.id}
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    padding: "20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    border: mission.type === "urgence" ? "1.5px solid #FCA5A5" : "1.5px solid transparent",
                  }}
                >
                  {/* Heure + badge */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Clock size={13} style={{ color: "#9CA3AF" }} />
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#374151" }}>
                        {formatHour(mission.date_prevue)}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {mission.type === "urgence" && (
                        <AlertTriangle size={13} style={{ color: "#DC2626" }} />
                      )}
                      <span style={{ padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, background: tc.bg, color: tc.color }}>
                        {tc.label}
                      </span>
                    </div>
                  </div>

                  {/* Nom site */}
                  <p style={{ fontSize: "16px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 4px" }}>
                    {site?.nom ?? "—"}
                  </p>

                  {/* Adresse */}
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "10px" }}>
                    <MapPin size={12} style={{ color: "#9CA3AF" }} />
                    <span style={{ fontSize: "13px", color: "#6B7280" }}>
                      {site?.adresse} — {site?.ville} {site?.code_postal}
                    </span>
                  </div>

                  {/* Contrat + note */}
                  {mission.contracts && (
                    <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "0 0 6px" }}>
                      Formule {mission.contracts.formule === "serenite" ? "Sérénité" : "Essentiel"} · {mission.contracts.frequence} passages/an
                    </p>
                  )}
                  {mission.notes && (
                    <p style={{ fontSize: "13px", color: "#4B5563", margin: "0 0 16px", fontStyle: "italic" }}>
                      Note : {mission.notes}
                    </p>
                  )}

                  {/* Préparez votre intervention */}
                  <div style={{
                    marginTop: "12px", paddingTop: "12px",
                    borderTop: "1px solid rgba(0,0,0,0.06)"
                  }}>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>
                      Préparez votre intervention
                    </p>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {["Cuisine", "Cave", "Réserves"].map(zone => (
                        <span key={zone} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", backgroundColor: "#F5F0E8", color: "#6B7280" }}>
                          {zone}
                        </span>
                      ))}
                      <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", backgroundColor: "#D1FAE5", color: "#065F46", fontWeight: 600 }}>
                        Données pré-chargées
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/technicien/mission/${mission.id}/arrivee`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "14px",
                      marginTop: "12px",
                      borderRadius: "8px",
                      background: "#1B3A2D",
                      color: "white",
                      fontSize: "15px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Démarrer l&apos;intervention
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Missions de la semaine */}
      {week.length > 0 && (
        <section id="semaine">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <CalendarDays size={15} style={{ color: "#6B7280" }} />
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#6B7280", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Cette semaine — {week.length} mission{week.length > 1 ? "s" : ""}
            </h2>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            {week.map((mission, idx) => {
              const tc = TYPE_CONFIG[mission.type]
              return (
                <div
                  key={mission.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 18px",
                    borderBottom: idx < week.length - 1 ? "1px solid #F9FAFB" : "none",
                  }}
                >
                  <div style={{ minWidth: "80px" }}>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "#374151", margin: 0 }}>
                      {formatDateShort(mission.date_prevue)}
                    </p>
                    <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>
                      {formatHour(mission.date_prevue)}
                    </p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#1B3A2D", margin: 0 }}>
                      {mission.sites?.nom ?? "—"}
                    </p>
                    <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>
                      {mission.sites?.ville}
                    </p>
                  </div>
                  <span style={{ padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, background: tc.bg, color: tc.color }}>
                    {tc.label}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
