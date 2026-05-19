import { CreditCard, Calculator, CalendarClock, Download, FileText } from "lucide-react"

interface FactureRow {
  periode: string
  reference: string
  sites: string
  ht: string
  tva: string
  ttc: string
  statut: string
}

interface FacturationData {
  totalAnnuel: string
  mensualisation: string
  prochainPrelevement: string
  entrepriseLabel: string
  historique: FactureRow[]
}

async function getData(): Promise<FacturationData> {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

  if (isDemoMode) {
    return {
      totalAnnuel: "3 200 €",
      mensualisation: "266 € /mois",
      prochainPrelevement: "15 juin 2026",
      entrepriseLabel: "Yooma Urban Lodge",
      historique: [
        { periode: "Mai 2026", reference: "NOX-2026-0510", sites: "2 sites", ht: "266,67 €", tva: "53,33 €", ttc: "320,00 €", statut: "Payée" },
        { periode: "Avr 2026", reference: "NOX-2026-0410", sites: "2 sites", ht: "266,67 €", tva: "53,33 €", ttc: "320,00 €", statut: "Payée" },
        { periode: "Mar 2026", reference: "NOX-2026-0310", sites: "2 sites", ht: "266,67 €", tva: "53,33 €", ttc: "320,00 €", statut: "Payée" },
      ],
    }
  }

  try {
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return {
      totalAnnuel: "—",
      mensualisation: "—",
      prochainPrelevement: "—",
      entrepriseLabel: "",
      historique: [],
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, entreprise")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!profile) return {
      totalAnnuel: "—",
      mensualisation: "—",
      prochainPrelevement: "—",
      entrepriseLabel: "",
      historique: [],
    }

    const { data: contracts } = await supabase
      .from("contracts")
      .select("prix_annuel, date_fin, formule")
      .eq("statut", "actif")

    const totalAnnuel = (contracts ?? []).reduce((acc: number, c: { prix_annuel: number }) => acc + (c.prix_annuel ?? 0), 0)
    const mensuel = totalAnnuel / 12

    return {
      totalAnnuel: totalAnnuel > 0 ? `${totalAnnuel.toLocaleString("fr-FR")} €` : "—",
      mensualisation: mensuel > 0 ? `${Math.round(mensuel).toLocaleString("fr-FR")} € /mois` : "—",
      prochainPrelevement: "—",
      entrepriseLabel: (profile as { id: string; entreprise?: string }).entreprise ?? "",
      historique: [],
    }
  } catch {
    return {
      totalAnnuel: "—",
      mensualisation: "—",
      prochainPrelevement: "—",
      entrepriseLabel: "",
      historique: [],
    }
  }
}

export default async function FacturationPage() {
  const data = await getData()

  return (
    <div style={{ padding: "32px 32px 64px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1B3A2D", margin: 0, fontFamily: "var(--font-display), serif" }}>
            Facturation
          </h1>
          {data.entrepriseLabel && (
            <span style={{ padding: "4px 12px", borderRadius: "20px", background: "#F5F0E8", color: "#1B3A2D", fontSize: "12px", fontWeight: 600 }}>
              {data.entrepriseLabel}
            </span>
          )}
        </div>
        <button
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "10px 18px", borderRadius: "10px",
            background: "#F5F0E8", color: "#1B3A2D",
            fontSize: "13px", fontWeight: 600,
            border: "none", cursor: "pointer",
          }}
        >
          <Download size={14} />
          Exporter relevé
        </button>
      </div>

      {/* 3 KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "36px" }}>
        {[
          {
            icon: CreditCard,
            label: "Total contrats/an",
            value: data.totalAnnuel,
            sub: "Montant annuel HT",
          },
          {
            icon: Calculator,
            label: "Mensualisation",
            value: data.mensualisation,
            sub: "TTC (TVA 20%)",
          },
          {
            icon: CalendarClock,
            label: "Prochain prélèvement",
            value: data.prochainPrelevement,
            sub: "Via Stripe",
          },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div
            key={label}
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "#F5F0E8", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={16} style={{ color: "#1B3A2D" }} />
              </div>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
            </div>
            <p style={{ fontSize: "24px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 4px" }}>{value}</p>
            <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Tableau historique */}
      <div>
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 16px" }}>
          Historique de facturation
        </h2>

        <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          {data.historique.length === 0 ? (
            <div style={{ padding: "64px 32px", textAlign: "center" }}>
              <FileText size={40} style={{ color: "#E5E7EB", marginBottom: "16px" }} />
              <p style={{ fontSize: "16px", color: "#9CA3AF", margin: 0, fontWeight: 600 }}>Aucune donnée disponible</p>
              <p style={{ fontSize: "13px", color: "#D1D5DB", margin: "8px 0 0" }}>Votre historique de facturation apparaîtra ici une fois votre abonnement activé.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.5fr 0.8fr 1fr 0.8fr 1fr 1fr 60px",
                padding: "12px 20px",
                background: "#FAFAFA",
                borderBottom: "1px solid #F3F4F6",
                fontSize: "11px",
                fontWeight: 700,
                color: "#9CA3AF",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                gap: "8px",
              }}>
                <span>Période</span>
                <span>Référence</span>
                <span>Sites</span>
                <span>Montant HT</span>
                <span>TVA 20%</span>
                <span>Total TTC</span>
                <span>Statut</span>
                <span>PDF</span>
              </div>

              {data.historique.map((row, idx) => (
                <div
                  key={row.reference}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1.5fr 0.8fr 1fr 0.8fr 1fr 1fr 60px",
                    padding: "14px 20px",
                    borderBottom: idx < data.historique.length - 1 ? "1px solid #F9FAFB" : "none",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#374151" }}>{row.periode}</span>
                  <span style={{ color: "#6B7280", fontFamily: "monospace", fontSize: "12px" }}>{row.reference}</span>
                  <span style={{ color: "#6B7280" }}>{row.sites}</span>
                  <span style={{ color: "#374151", fontWeight: 500 }}>{row.ht}</span>
                  <span style={{ color: "#9CA3AF" }}>{row.tva}</span>
                  <span style={{ fontWeight: 700, color: "#1B3A2D" }}>{row.ttc}</span>
                  <span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: "#D1FAE5", color: "#065F46" }}>
                      ● {row.statut}
                    </span>
                  </span>
                  <button
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      width: "32px", height: "32px", borderRadius: "8px",
                      background: "#F5F0E8", border: "none", cursor: "pointer",
                    }}
                  >
                    <FileText size={14} style={{ color: "#1B3A2D" }} />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
