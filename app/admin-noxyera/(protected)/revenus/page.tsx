"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, AlertTriangle, Euro } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

type Client = {
  id: string;
  prenom: string | null;
  nom: string | null;
  entreprise: string | null;
  email: string | null;
  created_at: string;
};

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl ${className}`} style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)" }}>
      {children}
    </div>
  );
}

function CardHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      <h3 className="font-semibold text-sm text-white">{title}</h3>
      {right}
    </div>
  );
}

function formatEur(n: number): string {
  return n.toLocaleString("fr-FR") + " €";
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl px-3 py-2 text-xs"
        style={{ background: "#0D1F17", border: "1px solid rgba(255,255,255,0.15)", color: "white" }}>
        <p style={{ color: "rgba(255,255,255,0.5)" }}>{label}</p>
        <p className="font-bold mt-0.5">{formatEur(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function RevenusPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/facturation")
      .then(r => r.ok ? r.json() : [])
      .then(data => setClients(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const clientsActifs = clients.length;
  const arr = 0;
  const mrr = 0;
  const churnRisk = 0;
  const facturesEnAttente: never[] = [];
  const monthlyRevenue: { month: string; revenue: number }[] = [];
  const topClients: never[] = [];

  return (
    <div className="p-5 space-y-5 min-h-screen" style={{ background: "#0D1F17" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Revenus</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
            Tableau de bord financier — ARR & MRR
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
          style={{ background: "rgba(148,163,184,0.1)", border: "1px solid rgba(148,163,184,0.2)", color: "rgba(148,163,184,0.6)", fontFamily: "monospace" }}>
          <TrendingUp size={12} />
          Non configuré
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "ARR total",
            value: loading ? "…" : formatEur(arr),
            icon: TrendingUp,
            color: "#10B981",
            sub: "Revenu annuel récurrent",
          },
          {
            label: "MRR",
            value: loading ? "…" : formatEur(mrr),
            icon: Euro,
            color: "#60A5FA",
            sub: "Revenu mensuel récurrent",
          },
          {
            label: "Clients actifs",
            value: loading ? "…" : clientsActifs,
            icon: Users,
            color: "#A78BFA",
            sub: "Comptes créés",
          },
          {
            label: "Risque churn",
            value: loading ? "…" : churnRisk,
            icon: AlertTriangle,
            color: "#F59E0B",
            sub: "Clients à planifier",
          },
        ].map(({ label, value, icon: Icon, color, sub }) => (
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
            <p className="mt-2 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{sub}</p>
          </Card>
        ))}
      </div>

      {/* Revenue chart */}
      <Card>
        <CardHeader
          title="Revenus mensuels"
          right={
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
              Données {new Date().getFullYear()}
            </span>
          }
        />
        <div className="px-5 py-5" style={{ height: 260 }}>
          {monthlyRevenue.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
              Aucune donnée de revenu disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "monospace" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`}
                  tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "monospace" }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Bar dataKey="revenue" fill="#4ade80" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Main grid: top clients + factures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top clients */}
        <Card>
          <CardHeader title="Top clients par ARR" />
          {topClients.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
              Aucun contrat renseigné
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            </div>
          )}
          <div className="px-5 py-2.5 text-xs" style={{ color: "rgba(255,255,255,0.25)", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            Risque churn: Faible · Moyen · Élevé
          </div>
        </Card>

        {/* Factures en attente */}
        <Card>
          <CardHeader
            title="Factures en attente"
            right={
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(148,163,184,0.1)", color: "rgba(148,163,184,0.6)" }}>
                0 facture
              </span>
            }
          />
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="px-5 py-6 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
              Aucune facture en attente
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
