import { Building2 } from "lucide-react"
import { SUPABASE_DEMO_PROFILE, SUPABASE_DEMO_SITES } from "@/lib/demo-data"
import type { Profile, Site } from "@/lib/types/dashboard"
import Link from "next/link"

interface SitesData {
  profile: Profile
  sites: Site[]
}

async function getData(): Promise<SitesData> {
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

function daysFromNow(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function SiteStatusBadge({ contract }: { contract?: { date_fin: string; statut: string } | null }) {
  if (!contract) return (
    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: "#F3F4F6", color: "#6B7280" }}>
      Sans contrat
    </span>
  )
  if (contract.statut === "expire") return (
    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: "#FEE2E2", color: "#991B1B" }}>
      ● Expiré
    </span>
  )
  if (daysFromNow(contract.date_fin) < 30) return (
    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: "#FEF3C7", color: "#92400E" }}>
      ● Bientôt dû
    </span>
  )
  return (
    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: "#D1FAE5", color: "#065F46" }}>
      ● Actif
    </span>
  )
}

export default async function SitesPage() {
  const { sites } = await getData()

  return (
    <div style={{ padding: "32px 32px 64px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1B3A2D", margin: 0, fontFamily: "var(--font-display), serif" }}>
          Mes sites
        </h1>
        <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "6px", marginBottom: 0 }}>
          {sites.length} site{sites.length > 1 ? "s" : ""} sous contrat Noxyera
        </p>
      </div>

      {sites.length === 0 ? (
        <div style={{ background: "white", borderRadius: "16px", padding: "64px 32px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <Building2 size={40} style={{ color: "#E5E7EB", marginBottom: "16px" }} />
          <p style={{ fontSize: "16px", color: "#9CA3AF", margin: 0, fontWeight: 600 }}>Aucun site actif</p>
          <p style={{ fontSize: "13px", color: "#D1D5DB", margin: "8px 0 0" }}>Vos sites apparaîtront ici une fois votre contrat activé.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" }}>
          {sites.map((site) => {
            const contract = site.contracts?.[0] ?? null
            const nextInterv = (site.interventions ?? [])
              .filter((i) => i.statut === "planifie")
              .sort((a, b) => a.date_prevue.localeCompare(b.date_prevue))[0]

            return (
              <div
                key={site.id}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  border: "1px solid rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {/* Top */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                  <div>
                    <p style={{ fontSize: "16px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 4px" }}>{site.nom}</p>
                    <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>{site.ville}</p>
                  </div>
                  <SiteStatusBadge contract={contract} />
                </div>

                {/* Details */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Secteur</p>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#374151", margin: 0 }}>{site.secteur}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Superficie</p>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#374151", margin: 0 }}>{site.superficie} m²</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Formule</p>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#1B3A2D", margin: 0 }}>
                      {contract?.formule === "serenite" ? "Sérénité" : "Essentiel"}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 2px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Prix / an</p>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#374151", margin: 0 }}>
                      {contract ? `${contract.prix_annuel.toLocaleString("fr-FR")} €` : "—"}
                    </p>
                  </div>
                </div>

                {/* Prochain passage */}
                {nextInterv && (
                  <div style={{ padding: "10px 14px", borderRadius: "10px", background: "#F5F0E8", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: "#1B3A2D", fontWeight: 600 }}>
                      Prochain passage : {new Date(nextInterv.date_prevue).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                    </span>
                  </div>
                )}

                {/* CTA */}
                <Link
                  href={`/dashboard/sites/${site.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px 16px",
                    borderRadius: "10px",
                    background: "#1B3A2D",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Voir détail →
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
