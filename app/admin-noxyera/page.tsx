import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Users, SearchCheck, Target, ClipboardList } from 'lucide-react'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `il y a ${days}j`
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {children}
    </div>
  )
}

export default async function AdminPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [
    { data: leadsData },
    { data: auditsData },
    { data: candidaturesData },
    { data: clientsData },
  ] = await Promise.all([
    supabase.from('leads').select('id, secteur, superficie, created_at, statut').order('created_at', { ascending: false }),
    supabase.from('audits').select('id, nom_etablissement, email, statut, created_at, adresse').order('created_at', { ascending: false }),
    supabase.from('candidatures_techniciens').select('id, prenom, nom, email, ville, experience, statut, created_at').order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, full_name, email').eq('role', 'client'),
  ])

  const leads = leadsData ?? []
  const audits = auditsData ?? []
  const candidatures = candidaturesData ?? []
  const clients = clientsData ?? []

  // KPIs
  const auditsEnAttente = audits.filter(a => a.statut === 'nouveau' || a.statut === 'en_attente').length
  const leadsNouveaux = leads.filter(l => !l.statut || l.statut === 'nouveau').length
  const candidaturesNouvelles = candidatures.filter(c => !c.statut || c.statut === 'nouveau').length
  const clientsActifs = clients.length

  // File d'attente unifiée
  type QueueItem = { type: string; label: string; detail: string; depuis: string; href: string; urgence: number }
  const queue: QueueItem[] = [
    ...audits.filter(a => a.statut === 'nouveau' || a.statut === 'en_attente').map(a => ({
      type: 'Audit',
      label: a.nom_etablissement,
      detail: a.adresse ?? a.email,
      depuis: a.created_at,
      href: '/admin-noxyera/audits',
      urgence: 1,
    })),
    ...leads.filter(l => !l.statut || l.statut === 'nouveau').slice(0, 5).map(l => ({
      type: 'Lead',
      label: l.secteur ?? 'Estimateur',
      detail: `${l.superficie ?? '?'} m²`,
      depuis: l.created_at,
      href: '/admin-noxyera/leads',
      urgence: 2,
    })),
    ...candidatures.filter(c => !c.statut || c.statut === 'nouveau').map(c => ({
      type: 'Candidature',
      label: `${c.prenom} ${c.nom}`,
      detail: c.ville,
      depuis: c.created_at,
      href: '/admin-noxyera/candidatures',
      urgence: 3,
    })),
  ].sort((a, b) => a.urgence - b.urgence || new Date(b.depuis).getTime() - new Date(a.depuis).getTime())

  // Activité récente
  type ActivityItem = { type: string; label: string; date: string; statut?: string }
  const recent: ActivityItem[] = [
    ...leads.slice(0, 3).map(l => ({ type: 'Lead', label: l.secteur ?? 'Estimateur', date: l.created_at, statut: l.statut })),
    ...audits.slice(0, 3).map(a => ({ type: 'Audit', label: a.nom_etablissement, date: a.created_at, statut: a.statut })),
    ...candidatures.slice(0, 3).map(c => ({ type: 'Candidature', label: `${c.prenom} ${c.nom}`, date: c.created_at, statut: c.statut })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  const kpis = [
    { label: "Clients actifs", value: clientsActifs, icon: Users, color: "#60A5FA" },
    { label: "Audits en attente", value: auditsEnAttente, icon: SearchCheck, color: "#F59E0B" },
    { label: "Leads nouveaux", value: leadsNouveaux, icon: Target, color: "#10B981" },
    { label: "Candidatures", value: candidaturesNouvelles, icon: ClipboardList, color: "#A78BFA" },
  ]

  function typeBadgeStyle(type: string) {
    if (type === 'Lead') return { background: 'rgba(16,185,129,0.15)', color: '#10B981' }
    if (type === 'Audit') return { background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }
    return { background: 'rgba(167,139,250,0.15)', color: '#A78BFA' }
  }

  function queueTypeBadgeStyle(type: string) {
    if (type === 'Audit') return { background: 'rgba(220,38,38,0.15)', color: '#DC2626' }
    if (type === 'Lead') return { background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }
    return { background: 'rgba(167,139,250,0.15)', color: '#A78BFA' }
  }

  return (
    <div className="p-5 space-y-5 min-h-screen" style={{ background: "#0D1F17" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
            Plateforme NOXYERA — Back-office opérationnel
          </p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
                {label}
              </p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.05)" }}>
                <Icon size={14} style={{ color }} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white leading-none">{value}</p>
          </Card>
        ))}
      </div>

      {/* File d'attente */}
      <Card>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 className="font-semibold text-sm text-white">File d&apos;attente</h2>
        </div>
        {queue.length === 0 ? (
          <div className="px-5 py-8 text-center" style={{ color: "#10B981", fontSize: "14px" }}>
            Aucune action en attente ✓
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["Type", "Qui", "Détail", "Depuis", "Action"].map(col => (
                    <th key={col} className="px-5 py-3 text-left text-xs uppercase tracking-wider"
                      style={{ color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queue.map((item, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td className="px-5 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium"
                        style={queueTypeBadgeStyle(item.type)}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-white">{item.label}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{item.detail}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
                      {timeAgo(item.depuis)}
                    </td>
                    <td className="px-5 py-3">
                      <Link href={item.href}
                        className="text-xs font-semibold"
                        style={{ color: "#F26522", textDecoration: "none" }}>
                        Voir →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Activité récente */}
      <Card>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 className="font-semibold text-sm text-white">Activité récente</h2>
        </div>
        {recent.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
            Aucune activité récente
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            {recent.map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <span className="px-2 py-1 rounded-full text-xs font-medium shrink-0"
                  style={typeBadgeStyle(item.type)}>
                  {item.type}
                </span>
                <p className="flex-1 text-sm text-white truncate">{item.label}</p>
                {item.statut && (
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}>
                    {item.statut}
                  </span>
                )}
                <span className="text-xs shrink-0" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
                  {timeAgo(item.date)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
