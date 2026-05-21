'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ChevronRight } from 'lucide-react'

type Client = {
  id: string
  full_name: string | null
  email: string | null
  telephone: string | null
  entreprise: string | null
  created_at: string
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function ClientsTable({ clients }: { clients: Client[] }) {
  const [search, setSearch] = useState('')

  const filtered = clients.filter(c =>
    (c.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.entreprise ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="px-5 py-4 flex items-center gap-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <h2 className="font-semibold text-sm text-white flex-1">Tous les clients</h2>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "rgba(255,255,255,0.3)" }} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-4 py-2 rounded-xl text-sm outline-none w-48 transition-all"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "white",
            }}
          />
        </div>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
          {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table header */}
      <div className="hidden lg:grid px-5 py-3 text-xs uppercase tracking-wider"
        style={{
          gridTemplateColumns: "3fr 3fr 2fr 2fr 2fr auto",
          color: "rgba(255,255,255,0.3)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          fontFamily: "monospace"
        }}>
        <span>Nom</span>
        <span>Email</span>
        <span>Entreprise</span>
        <span>Téléphone</span>
        <span>Inscrit le</span>
        <span></span>
      </div>

      <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        {filtered.length === 0 && (
          <div className="px-5 py-8 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
            {clients.length === 0 ? "Aucun client pour l'instant" : `Aucun client ne correspond à "${search}"`}
          </div>
        )}
        {filtered.map(client => (
          <div key={client.id}
            className="flex lg:grid items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors cursor-pointer"
            style={{ gridTemplateColumns: "3fr 3fr 2fr 2fr 2fr auto" }}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: "#1B4332", color: "#10B981" }}>
                {(client.full_name ?? client.email ?? '?').slice(0, 2).toUpperCase()}
              </div>
              <p className="font-medium text-sm text-white truncate">{client.full_name ?? '—'}</p>
            </div>
            <p className="text-xs hidden lg:block truncate" style={{ color: "rgba(255,255,255,0.55)" }}>
              {client.email ?? '—'}
            </p>
            <p className="text-xs hidden lg:block truncate" style={{ color: "rgba(255,255,255,0.55)" }}>
              {client.entreprise ?? '—'}
            </p>
            <p className="text-xs hidden lg:block" style={{ color: "rgba(255,255,255,0.55)" }}>
              {client.telephone ?? '—'}
            </p>
            <p className="text-xs hidden lg:block" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
              {formatDate(client.created_at)}
            </p>
            <Link href={`/admin-noxyera/clients/${client.id}`}
              className="text-xs font-semibold shrink-0"
              style={{ color: "#F26522", textDecoration: "none" }}>
              Voir →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
