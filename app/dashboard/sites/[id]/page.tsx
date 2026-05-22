import Link from "next/link"
import { Check, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { SUPABASE_DEMO_SITES, SUPABASE_DEMO_RAPPORTS } from "@/lib/demo-data"
import type { Site, Contract, RapportWithRelations } from "@/lib/types/dashboard"

interface SiteDetailData {
  site: Site & { contracts: Contract[] }
  rapports: RapportWithRelations[]
  technicien: { prenom: string | null; nom: string | null; telephone: string | null } | null
  haccpScore: number
}

async function getData(siteId: string): Promise<SiteDetailData | null> {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

  if (isDemoMode) {
    const demoSite = SUPABASE_DEMO_SITES.find((s) => s.id === siteId) ?? SUPABASE_DEMO_SITES[0]
    return {
      site: demoSite as unknown as Site & { contracts: Contract[] },
      rapports: SUPABASE_DEMO_RAPPORTS.slice(0, 5),
      technicien: { prenom: "Thomas", nom: "Lebrun", telephone: "06 12 34 56 78" },
      haccpScore: 98,
    }
  }

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!profile) return null

    // Security: validate site belongs to this client
    const { data: site } = await supabase
      .from("sites")
      .select("*, contracts(*)")
      .eq("id", siteId)
      .eq("client_id", profile.id)
      .maybeSingle()

    if (!site) return null

    // Fetch last 5 rapports via interventions
    const { data: interventionRows } = await supabase
      .from("interventions")
      .select("id")
      .eq("site_id", siteId)

    const interventionIds = (interventionRows ?? []).map((i: { id: string }) => i.id)

    let rapports: RapportWithRelations[] = []
    let technicien: { prenom: string | null; nom: string | null; telephone: string | null } | null = null
    let haccpScore = 100

    if (interventionIds.length > 0) {
      const { data: rapportRows } = await supabase
        .from("rapports")
        .select(`
          id, created_at, haccp_conforme, pdf_url, intervention_id,
          interventions(id, type, date_reelle, date_prevue, notes, sites(nom, adresse), profiles(nom, prenom))
        `)
        .in("intervention_id", interventionIds)
        .order("created_at", { ascending: false })
        .limit(5)

      rapports = (rapportRows as unknown as RapportWithRelations[]) ?? []

      // Compute HACCP score from all rapports
      const { data: allRapports } = await supabase
        .from("rapports")
        .select("haccp_conforme")
        .in("intervention_id", interventionIds)

      if (allRapports && allRapports.length > 0) {
        const conforme = allRapports.filter((r: { haccp_conforme: boolean }) => r.haccp_conforme).length
        haccpScore = Math.round((conforme / allRapports.length) * 100)
      }

      // Technicien from last intervention with a technicien_id
      const { data: lastInterv } = await supabase
        .from("interventions")
        .select("technicien_id")
        .eq("site_id", siteId)
        .not("technicien_id", "is", null)
        .order("date_prevue", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (lastInterv?.technicien_id) {
        const { data: techProfile } = await supabase
          .from("profiles")
          .select("prenom, nom, telephone")
          .eq("id", lastInterv.technicien_id)
          .maybeSingle()
        technicien = techProfile ?? null
      }
    }

    return {
      site: site as unknown as Site & { contracts: Contract[] },
      rapports,
      technicien,
      haccpScore,
    }
  } catch {
    return null
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}

function HaccpCircle({ score }: { score: number }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 90 ? "#27AE60" : score >= 70 ? "#F59E0B" : "#EF4444"
  const label = score >= 90 ? "Conformité excellente" : score >= 70 ? "Conformité correcte" : "Attention requise"
  const labelColor = score >= 90 ? "#27AE60" : score >= 70 ? "#F59E0B" : "#EF4444"

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="10" />
        <circle
          cx="65" cy="65" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
        />
        <text x="65" y="62" textAnchor="middle" fontSize="22" fontWeight="700" fill="#1B3A2D">{score}%</text>
        <text x="65" y="78" textAnchor="middle" fontSize="10" fill="#9CA3AF">HACCP</text>
      </svg>
      <p style={{ fontSize: "13px", fontWeight: 600, color: labelColor, margin: 0 }}>{label}</p>
    </div>
  )
}

export default async function SiteDetailPage({ params }: { params: { id: string } }) {
  const data = await getData(params.id)

  if (!data) {
    return (
      <div style={{ padding: "32px", textAlign: "center" }}>
        <p style={{ color: "#9CA3AF", fontSize: "14px" }}>Site introuvable ou accès refusé.</p>
        <Link href="/dashboard/sites" style={{ color: "#F26522", fontSize: "14px", fontWeight: 600 }}>
          ← Retour aux sites
        </Link>
      </div>
    )
  }

  const { site, rapports, technicien, haccpScore } = data
  const contract = site.contracts?.[0]

  const techName = technicien
    ? [technicien.prenom, technicien.nom].filter(Boolean).join(" ")
    : null

  const techInitials = technicien
    ? ((technicien.prenom?.[0] ?? "") + (technicien.nom?.[0] ?? "")).toUpperCase()
    : "?"

  return (
    <div style={{ padding: "32px 32px 64px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "24px", fontSize: "13px", color: "#9CA3AF" }}>
        <Link href="/dashboard/sites" style={{ color: "#9CA3AF", textDecoration: "none" }}>Mes sites</Link>
        <span>›</span>
        <span style={{ color: "#1B3A2D", fontWeight: 600 }}>{site.nom}</span>
      </div>

      {/* Title */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 8px", fontFamily: "var(--font-display), serif" }}>
            {site.nom}
          </h1>
          <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>{site.adresse} · {site.ville} {site.code_postal}</p>
        </div>
        <Link
          href={`/dashboard/rapports`}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "10px 18px", borderRadius: "10px",
            background: "#1B3A2D", color: "white",
            fontSize: "13px", fontWeight: 600, textDecoration: "none",
          }}
        >
          Exporter rapport HACCP complet →
        </Link>
      </div>

      {/* 2-col layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>

        {/* === COLONNE GAUCHE === */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Fiche site */}
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Fiche site
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {[
                { label: "Secteur", value: site.secteur ?? "—" },
                { label: "Superficie", value: site.superficie ? `${site.superficie} m²` : "—" },
                { label: "Début contrat", value: contract ? formatDate(contract.date_debut) : "—" },
                { label: "Fin contrat", value: contract ? formatDate(contract.date_fin) : "—" },
                { label: "Prix annuel", value: contract ? `${contract.prix_annuel.toLocaleString("fr-FR")} €` : "—" },
                { label: "Formule", value: contract?.formule === "serenite" ? "Sérénité" : "Essentiel" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151", margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Technicien attitré */}
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Technicien attitré
            </h2>
            {techName ? (
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{
                  width: "56px", height: "56px", borderRadius: "50%",
                  background: "#F26522", color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px", fontWeight: 700, flexShrink: 0,
                }}>
                  {techInitials}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "16px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 2px" }}>{techName}</p>
                  <span style={{ padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, background: "#D1FAE5", color: "#065F46" }}>
                    Certifié Noxyera
                  </span>
                  {technicien?.telephone && (
                    <p style={{ fontSize: "12px", color: "#6B7280", margin: "6px 0 0" }}>{technicien.telephone}</p>
                  )}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: "14px", color: "#9CA3AF", margin: 0 }}>Aucun technicien assigné</p>
            )}
          </div>
        </div>

        {/* === COLONNE DROITE === */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Score HACCP */}
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", display: "flex", justifyContent: "center" }}>
            <HaccpCircle score={haccpScore} />
          </div>

          {/* Derniers rapports */}
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Derniers rapports
            </h2>
            {rapports.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#9CA3AF", margin: 0 }}>Aucun rapport disponible.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {rapports.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      background: "#F5F0E8",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "#1B3A2D", margin: 0 }}>
                        {r.interventions?.date_reelle
                          ? formatDate(r.interventions.date_reelle)
                          : formatDate(r.created_at)}
                      </p>
                      <span style={{
                        padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 600,
                        background: r.haccp_conforme ? "#D1FAE5" : "#FEE2E2",
                        color: r.haccp_conforme ? "#065F46" : "#991B1B",
                        display: "inline-flex", alignItems: "center", gap: "3px",
                      }}>
                        {r.haccp_conforme ? <Check size={11} /> : <AlertTriangle size={11} />}
                        {r.haccp_conforme ? "HACCP conforme" : "Non conforme"}
                      </span>
                    </div>
                    <Link
                      href={`/dashboard/rapports/${r.id}`}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        background: "#1B3A2D",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: 600,
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      PDF →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
