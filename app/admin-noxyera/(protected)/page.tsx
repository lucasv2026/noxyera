"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, SearchCheck, Target, ClipboardList, AlertTriangle, Clock, RefreshCw } from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────
interface LeadRow     { id: string; secteur: string | null; superficie: number | null; created_at: string; statut: string | null; email: string }
interface AuditRow    { id: string; nom_etablissement: string; email: string; statut: string | null; created_at: string; adresse: string | null }
interface CandRow     { id: string; prenom: string; nom: string; email: string; ville: string; experience: string; statut: string | null; created_at: string }

interface AlertExpired  { id: string; date_prevue: string; sites: { nom: string } | null }
interface AlertRefused  { id: string; date_prevue: string; refused_at: string; sites: { nom: string } | null }
interface AlertLead     { id: string; email: string; nom_etablissement: string | null; secteur: string; created_at: string }

// ── Helpers ────────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `il y a ${days}j`
}

function hoursAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 3600000)
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl ${className}`} style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)" }}>
      {children}
    </div>
  )
}

function typeBadgeStyle(type: string) {
  if (type === "Lead")        return { background: "rgba(16,185,129,0.15)",  color: "#10B981" }
  if (type === "Audit")       return { background: "rgba(245,158,11,0.15)",  color: "#F59E0B" }
  return { background: "rgba(167,139,250,0.15)", color: "#A78BFA" }
}

function queueTypeBadgeStyle(type: string) {
  if (type === "Audit")       return { background: "rgba(220,38,38,0.15)",   color: "#DC2626" }
  if (type === "Lead")        return { background: "rgba(245,158,11,0.15)",  color: "#F59E0B" }
  return { background: "rgba(167,139,250,0.15)", color: "#A78BFA" }
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [leads, setLeads]           = useState<LeadRow[]>([])
  const [audits, setAudits]         = useState<AuditRow[]>([])
  const [candidatures, setCand]     = useState<CandRow[]>([])
  const [clientsCount, setClients]  = useState(0)
  const [loading, setLoading]       = useState(true)

  const [expired, setExpired]       = useState<AlertExpired[]>([])
  const [refused, setRefused]       = useState<AlertRefused[]>([])
  const [staleLeads, setStaleLeads] = useState<AlertLead[]>([])
  const [alertsLoading, setAlertsLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/admin/dashboard")
        if (res.ok) {
          const d = await res.json()
          setLeads(d.leads        ?? [])
          setAudits(d.audits      ?? [])
          setCand(d.candidatures  ?? [])
          setClients(d.clientsCount ?? 0)
        }
      } catch { /* fallback to empty */ }
      finally { setLoading(false) }
    }

    async function loadAlerts() {
      try {
        const res = await fetch("/api/admin/alerts")
        if (res.ok) {
          const d = await res.json()
          setExpired(d.expired       ?? [])
          setRefused(d.refused       ?? [])
          setStaleLeads(d.staleLeads ?? [])
        }
      } catch { /* non-fatal */ }
      finally { setAlertsLoading(false) }
    }

    loadDashboard()
    loadAlerts()
  }, [])

  // ── KPIs ───────────────────────────────────────────────────────────────────
  const auditsEnAttente       = audits.filter(a => a.statut === "nouveau" || a.statut === "en_attente").length
  const leadsNouveaux         = leads.filter(l => !l.statut || l.statut === "nouveau").length
  const candidaturesNouvelles = candidatures.filter(c => !c.statut || c.statut === "nouveau").length

  const kpis = [
    { label: "Clients actifs",    value: loading ? "…" : clientsCount,           icon: Users,        color: "#60A5FA" },
    { label: "Audits en attente", value: loading ? "…" : auditsEnAttente,         icon: SearchCheck,  color: "#F59E0B" },
    { label: "Leads nouveaux",    value: loading ? "…" : leadsNouveaux,           icon: Target,       color: "#10B981" },
    { label: "Candidatures",      value: loading ? "…" : candidaturesNouvelles,   icon: ClipboardList,color: "#A78BFA" },
  ]

  // ── File d'attente ─────────────────────────────────────────────────────────
  type QueueItem = { type: string; label: string; detail: string; depuis: string; href: string; urgence: number }
  const queue: QueueItem[] = [
    ...audits.filter(a => a.statut === "nouveau" || a.statut === "en_attente").map(a => ({
      type: "Audit", label: a.nom_etablissement, detail: a.adresse ?? a.email,
      depuis: a.created_at, href: "/admin-noxyera/audits", urgence: 1,
    })),
    ...leads.filter(l => !l.statut || l.statut === "nouveau").slice(0, 5).map(l => ({
      type: "Lead", label: l.secteur ?? "Estimateur", detail: `${l.superficie ?? "?"} m²`,
      depuis: l.created_at, href: "/admin-noxyera/leads", urgence: 2,
    })),
    ...candidatures.filter(c => !c.statut || c.statut === "nouveau").map(c => ({
      type: "Candidature", label: `${c.prenom} ${c.nom}`, detail: c.ville,
      depuis: c.created_at, href: "/admin-noxyera/candidatures", urgence: 3,
    })),
  ].sort((a, b) => a.urgence - b.urgence || new Date(b.depuis).getTime() - new Date(a.depuis).getTime())

  // ── Activité récente ───────────────────────────────────────────────────────
  type ActivityItem = { type: string; label: string; date: string; statut?: string }
  const recent: ActivityItem[] = [
    ...leads.slice(0, 3).map(l => ({ type: "Lead", label: l.secteur ?? "Estimateur", date: l.created_at, statut: l.statut ?? undefined })),
    ...audits.slice(0, 3).map(a => ({ type: "Audit", label: a.nom_etablissement, date: a.created_at, statut: a.statut ?? undefined })),
    ...candidatures.slice(0, 3).map(c => ({ type: "Candidature", label: `${c.prenom} ${c.nom}`, date: c.created_at, statut: c.statut ?? undefined })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  // ── Total alerts ───────────────────────────────────────────────────────────
  const totalAlerts = expired.length + refused.length + staleLeads.length

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

      {/* ── Alertes ── */}
      {!alertsLoading && totalAlerts > 0 && (
        <div style={{ background: "#0D1F17", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={14} style={{ color: "#DC2626" }} />
              <h2 style={{ fontSize: 13, fontWeight: 700, color: "#DC2626", margin: 0 }}>
                Alertes — {totalAlerts} action{totalAlerts > 1 ? "s" : ""} requise{totalAlerts > 1 ? "s" : ""}
              </h2>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {/* Expirées */}
            {expired.map(item => (
              <div key={item.id} style={{ padding: "11px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "rgba(239,68,68,0.12)", color: "#EF4444", fontWeight: 600, flexShrink: 0 }}>Expirée</span>
                <span style={{ fontSize: 13, color: "white", flex: 1 }}>{item.sites?.nom ?? "Site inconnu"}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
                  offre expirée le {new Date(item.date_prevue).toLocaleDateString("fr-FR")} — à reproposer
                </span>
                <Link href="/admin-noxyera/planning" style={{ fontSize: 11, color: "#F26522", fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>Traiter →</Link>
              </div>
            ))}
            {/* Refusées */}
            {refused.map(item => (
              <div key={item.id} style={{ padding: "11px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "rgba(245,158,11,0.12)", color: "#F59E0B", fontWeight: 600, flexShrink: 0 }}>Refusée</span>
                <span style={{ fontSize: 13, color: "white", flex: 1 }}>{item.sites?.nom ?? "Site inconnu"}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
                  refusée {timeAgo(item.refused_at)} — à reproposer
                </span>
                <Link href="/admin-noxyera/planning" style={{ fontSize: 11, color: "#F26522", fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>Traiter →</Link>
              </div>
            ))}
            {/* Leads en attente */}
            {staleLeads.map(lead => (
              <div key={lead.id} style={{ padding: "11px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "rgba(234,179,8,0.12)", color: "#EAB308", fontWeight: 600, flexShrink: 0 }}>Lead froid</span>
                <span style={{ fontSize: 13, color: "white", flex: 1 }}>{lead.email}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
                  {lead.secteur} — en attente depuis {hoursAgo(lead.created_at)}h
                </span>
                <Link href="/admin-noxyera/leads" style={{ fontSize: 11, color: "#F26522", fontWeight: 600, textDecoration: "none", flexShrink: 0 }}>Traiter →</Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
                {label}
              </p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}>
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
        {loading ? (
          <div className="px-5 py-8 text-center" style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Chargement…</div>
        ) : queue.length === 0 ? (
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
                      <span className="px-2 py-1 rounded-full text-xs font-medium" style={queueTypeBadgeStyle(item.type)}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-white">{item.label}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{item.detail}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
                      {timeAgo(item.depuis)}
                    </td>
                    <td className="px-5 py-3">
                      <Link href={item.href} className="text-xs font-semibold" style={{ color: "#F26522", textDecoration: "none" }}>
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
        {loading ? (
          <div className="px-5 py-8 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>Chargement…</div>
        ) : recent.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
            Aucune activité récente
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            {recent.map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <span className="px-2 py-1 rounded-full text-xs font-medium shrink-0" style={typeBadgeStyle(item.type)}>
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
