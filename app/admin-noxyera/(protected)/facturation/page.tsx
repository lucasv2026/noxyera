import { createClient } from '@supabase/supabase-js'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function FacturationPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: clients } = await supabase
    .from('profiles')
    .select('id, full_name, email, entreprise, created_at')
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  const clientsCount = clients?.length ?? 0
  const mrrEstime = clientsCount * 150
  const arrEstime = clientsCount * 1800

  const cardStyle = {
    background: "#122B1E",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
  }

  const thStyle: React.CSSProperties = {
    padding: "10px 20px",
    textAlign: "left" as const,
    fontSize: "11px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: "rgba(255,255,255,0.3)",
    fontFamily: "monospace",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  }

  const tdStyle: React.CSSProperties = {
    padding: "12px 20px",
    fontSize: "13px",
    color: "rgba(255,255,255,0.75)",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  }

  return (
    <div className="p-5 space-y-5 min-h-screen" style={{ background: "#0D1F17" }}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Facturation</h1>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
          Aperçu financier — données estimées
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { label: "Clients actifs", value: clientsCount.toString(), color: "#60A5FA", suffix: "" },
          { label: "MRR estimé", value: mrrEstime.toLocaleString("fr-FR"), color: "#10B981", suffix: " €/mois" },
          { label: "ARR estimé", value: arrEstime.toLocaleString("fr-FR"), color: "#A78BFA", suffix: " €/an" },
        ].map(({ label, value, color, suffix }) => (
          <div key={label} style={{ ...cardStyle, padding: "20px" }}>
            <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", fontFamily: "monospace", marginBottom: "8px" }}>
              {label}
            </p>
            <p style={{ fontSize: "28px", fontWeight: 700, color, margin: 0 }}>
              {value}<span style={{ fontSize: "14px", fontWeight: 400, color: "rgba(255,255,255,0.4)" }}>{suffix}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Encart info */}
      <div style={{
        background: "rgba(242,101,34,0.08)",
        border: "1px solid rgba(242,101,34,0.25)",
        borderRadius: "12px",
        padding: "16px 20px",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
      }}>
        <span style={{ fontSize: "16px", flexShrink: 0 }}>ℹ️</span>
        <div>
          <p style={{ fontSize: "13px", fontWeight: 600, color: "#F26522", margin: "0 0 4px" }}>
            Module en développement
          </p>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.6 }}>
            La gestion des contrats et factures sera disponible dans une prochaine mise à jour.
            Les chiffres affichés sont des estimations basées sur 150 €/client/mois.
          </p>
        </div>
      </div>

      {/* Tableau clients */}
      <div style={{ ...cardStyle }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: "white", margin: 0 }}>
            Clients ({clientsCount})
          </h2>
        </div>
        {clientsCount === 0 ? (
          <p style={{ padding: "32px 20px", textAlign: "center", fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
            Aucun client pour l&apos;instant
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Nom</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Inscrit le</th>
                <th style={thStyle}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {(clients ?? []).map(client => (
                <tr key={client.id}>
                  <td style={tdStyle}>{client.full_name ?? '—'}</td>
                  <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "12px" }}>{client.email ?? '—'}</td>
                  <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "12px" }}>{formatDate(client.created_at)}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: "2px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600,
                      background: "rgba(16,185,129,0.15)", color: "#10B981"
                    }}>
                      Actif
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
