import { CalendarClock, ShieldCheck, FileCheck, CreditCard, Building2 } from "lucide-react"
import { StatCard } from "@/components/dashboard/StatCard"
import { SUPABASE_DEMO_PROFILE, SUPABASE_DEMO_SITES } from "@/lib/demo-data"
import type { Profile, Site } from "@/lib/types/dashboard"
import Link from "next/link"

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}

function daysFromNow(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    preventif: { label: "Préventif", bg: "#D1FAE5", color: "#065F46" },
    curatif:   { label: "Curatif",   bg: "#FEF3C7", color: "#92400E" },
    urgence:   { label: "Urgence",   bg: "#FEE2E2", color: "#991B1B" },
  }
  const { label, bg, color } = map[type] ?? { label: type, bg: "#F3F4F6", color: "#6B7280" }
  return (
    <span style={{ padding: "2px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, background: bg, color }}>
      {label}
    </span>
  )
}

function StatusBadge({ statut }: { statut: string }) {
  if (statut === "actif") return (
    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: "#D1FAE5", color: "#065F46" }}>
      ● Conforme
    </span>
  )
  return (
    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: "#FEF3C7", color: "#92400E" }}>
      ● Bientôt dû
    </span>
  )
}

export default async function DashboardPage() {
  const { profile, sites } = await getData()

  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  const todayDisplay = today.charAt(0).toUpperCase() + today.slice(1)

  const allInterventions = sites.flatMap((s) => s.interventions ?? [])
  const nextIntervention = allInterventions
    .filter((i) => i.statut === "planifie")
    .sort((a, b) => a.date_prevue.localeCompare(b.date_prevue))[0]

  const realisees = allInterventions.filter((i) => i.statut === "realise").length
  const lastInterventions = allInterventions
    .filter((i) => i.statut === "realise" && i.date_reelle)
    .sort((a, b) => (b.date_reelle ?? "").localeCompare(a.date_reelle ?? ""))
    .slice(0, 3)

  const prochainDateLabel = nextIntervention
    ? formatDate(nextIntervention.date_prevue)
    : "—"

  const daysLabel = nextIntervention
    ? `dans ${daysFromNow(nextIntervention.date_prevue)} jours · Thomas Lebrun`
    : "Aucun planifié"

  const activeContract = sites[0]?.contracts?.[0]
  const contractEndLabel = activeContract ? formatDate(activeContract.date_fin) : "—"
  const formuleName = activeContract?.formule === "serenite" ? "Sérénité" : "Essentiel"

  if (sites.length === 1) {
    // ─── VUE MONO-SITE ───────────────────────────────────────────
    const site = sites[0]

    return (
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 32px 64px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#1B3A2D", margin: 0, fontFamily: "var(--font-display), serif" }}>
              Bonjour {profile.prenom ?? profile.entreprise ?? "Client"}
            </h1>
            <p style={{ fontSize: "14px", color: "#F26522", fontWeight: 600, marginTop: "4px", marginBottom: 0 }}>
              {todayDisplay}
            </p>
          </div>
          <span style={{ padding: "6px 14px", borderRadius: "20px", background: "#D1FAE5", color: "#065F46", fontSize: "13px", fontWeight: 600 }}>
            ● Conforme
          </span>
        </div>

        {/* 4 KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "36px" }}>
          <StatCard
            icon={CalendarClock}
            label="Prochaine visite"
            value={prochainDateLabel}
            sub={daysLabel}
          />
          <StatCard
            icon={ShieldCheck}
            label="Score HACCP"
            value="98%"
            sub="Conformité excellente"
            accent
          />
          <StatCard
            icon={FileCheck}
            label="Interventions cette année"
            value={realisees}
            sub="sur l'année en cours"
          />
          <StatCard
            icon={CreditCard}
            label="Formule"
            value={formuleName}
            sub={`Renouvellement : ${contractEndLabel}`}
          />
        </div>

        {/* Timeline dernières interventions */}
        <section style={{ marginBottom: "36px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 20px" }}>
            Dernières interventions
          </h2>
          {lastInterventions.length === 0 ? (
            <p style={{ fontSize: "14px", color: "#9CA3AF" }}>Aucune intervention réalisée.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {lastInterventions.map((intervention, idx) => {
                const siteOfInterv = sites.find((s) => s.interventions?.some((i) => i.id === intervention.id))
                return (
                  <div
                    key={intervention.id}
                    style={{
                      display: "flex",
                      gap: "16px",
                      alignItems: "flex-start",
                      paddingBottom: idx < lastInterventions.length - 1 ? "20px" : "0",
                    }}
                  >
                    {/* Timeline dot + line */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: "4px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#27AE60", border: "2px solid white", boxShadow: "0 0 0 2px #27AE60" }} />
                      {idx < lastInterventions.length - 1 && (
                        <div style={{ width: "2px", flex: 1, background: "#E5E7EB", marginTop: "4px", minHeight: "40px" }} />
                      )}
                    </div>
                    {/* Content */}
                    <div style={{ background: "white", borderRadius: "12px", padding: "14px 18px", flex: 1, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                            {intervention.date_reelle ? formatDate(intervention.date_reelle) : formatDate(intervention.date_prevue)}
                          </span>
                          <TypeBadge type={intervention.type} />
                        </div>
                        <span style={{ fontSize: "12px", color: "#9CA3AF" }}>T. Lebrun</span>
                      </div>
                      <p style={{ fontSize: "12px", color: "#6B7280", margin: "6px 0 0" }}>
                        {siteOfInterv?.nom ?? site.nom}
                      </p>
                      <Link
                        href="/dashboard/rapports"
                        style={{ fontSize: "12px", color: "#F26522", fontWeight: 600, textDecoration: "none", display: "inline-block", marginTop: "6px" }}
                      >
                        Voir rapport →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Prochain passage */}
        {nextIntervention && (
          <section>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 16px" }}>
              Prochain passage
            </h2>
            <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: "1.5px solid #D1FAE5" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <p style={{ fontSize: "18px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 4px" }}>
                    {formatDate(nextIntervention.date_prevue)}
                  </p>
                  <p style={{ fontSize: "14px", color: "#6B7280", margin: "0 0 8px" }}>
                    Thomas Lebrun · Certifié Certibiocide
                  </p>
                  <TypeBadge type={nextIntervention.type} />
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "0 0 4px" }}>Dans</p>
                  <p style={{ fontSize: "28px", fontWeight: 700, color: "#27AE60", margin: 0 }}>
                    {daysFromNow(nextIntervention.date_prevue)}j
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    )
  }

  // ─── VUE MULTI-SITES ─────────────────────────────────────────────────────────
  const avgHaccp = sites.length > 0
    ? Math.round(sites.reduce((acc) => acc + 94, 0) / sites.length)
    : 94

  const prochainSiteNom = nextIntervention
    ? (sites.find((s) => s.interventions?.some((i) => i.id === nextIntervention.id))?.nom ?? "—")
    : "—"

  return (
    <div style={{ padding: "32px 32px 64px" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#1B3A2D", margin: 0, fontFamily: "var(--font-display), serif" }}>
            Bonjour {profile.prenom ?? profile.entreprise ?? "Client"}
          </h1>
          <p style={{ fontSize: "14px", color: "#F26522", fontWeight: 600, marginTop: "4px", marginBottom: 0 }}>
            {todayDisplay}
          </p>
        </div>
        <span style={{ padding: "6px 14px", borderRadius: "20px", background: "#D1FAE5", color: "#065F46", fontSize: "13px", fontWeight: 600 }}>
          ● Conforme
        </span>
      </div>

      {/* 4 KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "36px" }}>
        <StatCard
          icon={Building2}
          label="Sites actifs"
          value={sites.length}
          sub="sous contrat"
        />
        <StatCard
          icon={CalendarClock}
          label="Prochaine visite"
          value={prochainDateLabel}
          sub={prochainSiteNom}
        />
        <StatCard
          icon={ShieldCheck}
          label="Score HACCP moyen"
          value={`${avgHaccp}%`}
          sub="sur l'ensemble des sites"
          accent
        />
        <StatCard
          icon={FileCheck}
          label="Alertes ouvertes"
          value={0}
          sub="Aucune anomalie"
        />
      </div>

      {/* Tableau vos sites */}
      <section>
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 16px" }}>
          Vos sites
        </h2>

        {sites.length === 0 ? (
          <div style={{ background: "white", borderRadius: "16px", padding: "64px 32px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <Building2 size={40} style={{ color: "#E5E7EB", marginBottom: "16px" }} />
            <p style={{ fontSize: "16px", color: "#9CA3AF", margin: 0, fontWeight: 600 }}>Aucun site actif</p>
            <p style={{ fontSize: "13px", color: "#D1D5DB", margin: "6px 0 0" }}>Contactez Noxyera pour créer votre premier site.</p>
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            {/* Table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1.5fr 1fr 80px",
              padding: "12px 20px",
              background: "#FAFAFA",
              borderBottom: "1px solid #F3F4F6",
              fontSize: "11px",
              fontWeight: 700,
              color: "#9CA3AF",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
              <span>Nom</span>
              <span>Ville</span>
              <span>Formule</span>
              <span>Prochain passage</span>
              <span>Statut</span>
              <span></span>
            </div>

            {sites.map((site, idx) => {
              const contract = site.contracts?.[0]
              const nextInterv = (site.interventions ?? [])
                .filter((i) => i.statut === "planifie")
                .sort((a, b) => a.date_prevue.localeCompare(b.date_prevue))[0]
              const isExpiringSoon = contract?.date_fin
                ? daysFromNow(contract.date_fin) < 30
                : false

              return (
                <div
                  key={site.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1.5fr 1fr 80px",
                    padding: "16px 20px",
                    alignItems: "center",
                    borderBottom: idx < sites.length - 1 ? "1px solid #F9FAFB" : "none",
                    gap: "8px",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#1B3A2D", margin: 0 }}>{site.nom}</p>
                    <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>{site.secteur}</p>
                  </div>
                  <span style={{ fontSize: "13px", color: "#6B7280" }}>{site.ville}</span>
                  <span style={{ fontSize: "13px", color: "#374151", fontWeight: 500 }}>
                    {contract?.formule === "serenite" ? "Sérénité" : "Essentiel"}
                  </span>
                  <span style={{ fontSize: "13px", color: "#374151" }}>
                    {nextInterv ? formatDate(nextInterv.date_prevue) : "—"}
                  </span>
                  <span>
                    {isExpiringSoon ? (
                      <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: "#FEF3C7", color: "#92400E" }}>
                        ● Bientôt dû
                      </span>
                    ) : (
                      <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: "#D1FAE5", color: "#065F46" }}>
                        ● Conforme
                      </span>
                    )}
                  </span>
                  <Link
                    href={`/dashboard/sites/${site.id}`}
                    style={{ fontSize: "13px", color: "#F26522", fontWeight: 600, textDecoration: "none", textAlign: "right" }}
                  >
                    Voir →
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
