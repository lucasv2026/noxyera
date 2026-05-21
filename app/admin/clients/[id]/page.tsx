import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { notFound } from 'next/navigation'

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: client } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!client) notFound()

  const [{ data: interventions }, { data: audits }] = await Promise.all([
    supabase
      .from('interventions')
      .select('*')
      .eq('technicien_id', params.id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('audits')
      .select('*')
      .eq('email', client.email ?? '')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const cardStyle = {
    background: "#122B1E",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    marginBottom: "20px",
  }

  const headerStyle = {
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
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
    <div className="p-5 min-h-screen" style={{ background: "#0D1F17" }}>
      {/* Back */}
      <Link href="/admin/clients"
        style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.5)", fontSize: "13px", textDecoration: "none", marginBottom: "20px" }}>
        ← Retour aux clients
      </Link>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            background: "#1B4332", color: "#10B981",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px", fontWeight: 700
          }}>
            {(client.full_name ?? client.email ?? '?').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "white", margin: 0 }}>
              {client.full_name ?? '—'}
            </h1>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: "4px 0 0" }}>
              {client.email ?? '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Infos contact */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: "white", margin: 0 }}>Informations</h2>
        </div>
        <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {[
            { label: "Email", value: client.email },
            { label: "Téléphone", value: client.telephone },
            { label: "Entreprise", value: client.entreprise },
            { label: "Inscrit le", value: formatDate(client.created_at) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                {label}
              </p>
              <p style={{ fontSize: "14px", color: "white", margin: 0 }}>{value ?? '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Historique des audits */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: "white", margin: 0 }}>
            Audits ({(audits ?? []).length})
          </h2>
        </div>
        {(audits ?? []).length === 0 ? (
          <p style={{ padding: "24px 20px", fontSize: "13px", color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
            Aucun audit
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Établissement</th>
                <th style={thStyle}>Adresse</th>
                <th style={thStyle}>Statut</th>
                <th style={thStyle}>Date</th>
              </tr>
            </thead>
            <tbody>
              {(audits ?? []).map((a: Record<string, unknown>) => (
                <tr key={a.id as string}>
                  <td style={tdStyle}>{(a.nom_etablissement as string) ?? '—'}</td>
                  <td style={tdStyle}>{(a.adresse as string) ?? '—'}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: "2px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600,
                      background: "rgba(245,158,11,0.15)", color: "#F59E0B"
                    }}>
                      {(a.statut as string) ?? 'nouveau'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "12px" }}>
                    {formatDate(a.created_at as string)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Historique des interventions */}
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: "white", margin: 0 }}>
            Interventions ({(interventions ?? []).length})
          </h2>
        </div>
        {(interventions ?? []).length === 0 ? (
          <p style={{ padding: "24px 20px", fontSize: "13px", color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
            Aucune intervention enregistrée
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Statut</th>
                <th style={thStyle}>Date</th>
              </tr>
            </thead>
            <tbody>
              {(interventions ?? []).map((iv: Record<string, unknown>) => (
                <tr key={iv.id as string}>
                  <td style={tdStyle}>{(iv.type as string) ?? '—'}</td>
                  <td style={tdStyle}>{(iv.statut as string) ?? '—'}</td>
                  <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "12px" }}>
                    {formatDate(iv.created_at as string)}
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
