'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `il y a ${hours}h`
  const days = Math.floor(hours / 24)
  return `il y a ${days}j`
}

function typeBadgeStyle(type: string) {
  if (type === 'Audit') return { background: 'rgba(220,38,38,0.15)', color: '#DC2626' }
  if (type === 'Lead') return { background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }
  return { background: 'rgba(167,139,250,0.15)', color: '#A78BFA' }
}

type Lead = { id: string; secteur: string | null; superficie: string | null; created_at: string; statut: string | null; email: string | null }
type Audit = { id: string; nom_etablissement: string | null; email: string | null; statut: string | null; created_at: string; adresse: string | null; telephone: string | null }
type Candidature = { id: string; prenom: string | null; nom: string | null; email: string | null; ville: string | null; experience: string | null; statut: string | null; created_at: string; telephone: string | null }

type QueueItem = {
  type: 'Audit' | 'Lead' | 'Candidature'
  label: string
  detail: string
  email: string
  date: string
  href: string
  urgence: number
}

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
  verticalAlign: "top" as const,
}

export default function QueuePage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [audits, setAudits] = useState<Audit[]>([])
  const [candidatures, setCandidatures] = useState<Candidature[]>([])

  useEffect(() => {
    fetch('/api/admin/queue')
      .then(r => r.json())
      .then((d: { leads: Lead[]; audits: Audit[]; candidatures: Candidature[] }) => {
        setLeads(d.leads ?? [])
        setAudits(d.audits ?? [])
        setCandidatures(d.candidatures ?? [])
      })
      .catch(() => {})
  }, [])

  const filteredLeads = leads.filter(l => !l.statut || l.statut === 'nouveau')
  const filteredAudits = audits.filter(a => a.statut === 'nouveau' || a.statut === 'en_attente')
  const filteredCandidatures = candidatures.filter(c => !c.statut || c.statut === 'nouveau')

  const queue: QueueItem[] = [
    ...filteredAudits.map(a => ({
      type: 'Audit' as const,
      label: a.nom_etablissement ?? '—',
      detail: a.adresse ?? '—',
      email: a.email ?? '—',
      date: a.created_at,
      href: '/admin-noxyera/audits',
      urgence: 1,
    })),
    ...filteredLeads.map(l => ({
      type: 'Lead' as const,
      label: l.secteur ?? 'Estimateur',
      detail: `${l.superficie ?? '?'} m²`,
      email: l.email ?? '—',
      date: l.created_at,
      href: '/admin-noxyera/leads',
      urgence: 2,
    })),
    ...filteredCandidatures.map(c => ({
      type: 'Candidature' as const,
      label: `${c.prenom} ${c.nom}`,
      detail: `${c.ville ?? '—'} · ${c.experience ?? '?'} ans d'exp.`,
      email: c.email ?? '—',
      date: c.created_at,
      href: '/admin-noxyera/candidatures',
      urgence: 3,
    })),
  ].sort((a, b) => a.urgence - b.urgence || new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="p-5 space-y-5 min-h-screen" style={{ background: "#0D1F17" }}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">File d&apos;attente</h1>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
          {queue.length} action{queue.length !== 1 ? 's' : ''} en attente
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Audits", value: filteredAudits.length, color: "#DC2626" },
          { label: "Leads", value: filteredLeads.length, color: "#F59E0B" },
          { label: "Candidatures", value: filteredCandidatures.length, color: "#A78BFA" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ ...cardStyle, padding: "16px 20px" }}>
            <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.4)", fontFamily: "monospace", marginBottom: "6px" }}>
              {label}
            </p>
            <p style={{ fontSize: "24px", fontWeight: 700, color, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={cardStyle}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: "white", margin: 0 }}>
            Toutes les actions en attente
          </h2>
        </div>
        {queue.length === 0 ? (
          <p style={{ padding: "40px 20px", textAlign: "center", fontSize: "14px", color: "#10B981" }}>
            Aucune action en attente ✓
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Qui / Quoi</th>
                  <th style={thStyle}>Détail</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Depuis</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((item, i) => (
                  <tr key={i}>
                    <td style={tdStyle}>
                      <span style={{
                        padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 600,
                        ...typeBadgeStyle(item.type)
                      }}>
                        {item.type}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: "white" }}>{item.label}</td>
                    <td style={{ ...tdStyle, maxWidth: "200px", color: "rgba(255,255,255,0.55)" }}>{item.detail}</td>
                    <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>{item.email}</td>
                    <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "12px", color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
                      {formatDate(item.date)}
                    </td>
                    <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "12px", color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
                      {timeAgo(item.date)}
                    </td>
                    <td style={tdStyle}>
                      <Link href={item.href}
                        style={{ color: "#F26522", fontWeight: 600, fontSize: "13px", textDecoration: "none" }}>
                        Voir →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
