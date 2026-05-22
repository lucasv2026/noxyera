'use client'

import { useEffect, useState } from 'react'
import ClientsTable from './ClientsTable'

type Client = {
  id: string
  full_name: string | null
  email: string | null
  telephone: string | null
  entreprise: string | null
  created_at: string
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    fetch('/api/admin/clients')
      .then(r => r.json())
      .then((data: Client[]) => setClients(data))
      .catch(() => {})
  }, [])

  return (
    <div className="p-5 space-y-5 min-h-screen" style={{ background: "#0D1F17" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients CRM</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            {clients.length} client{clients.length !== 1 ? 's' : ''} enregistré{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Total clients", value: clients.length, color: "#60A5FA" },
          { label: "Ce mois", value: clients.filter(c => {
            const d = new Date(c.created_at)
            const now = new Date()
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
          }).length, color: "#10B981" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4"
            style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
              {label}
            </p>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <ClientsTable clients={clients} />
    </div>
  )
}
