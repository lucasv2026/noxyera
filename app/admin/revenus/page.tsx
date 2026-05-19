"use client";

import { TrendingUp, Users, AlertTriangle, Euro } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ADMIN_METRICS, ADMIN_TOP_CLIENTS, DEMO_CLIENTS, DEMO_FACTURES } from "@/lib/demo-data";

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
  const arr = DEMO_CLIENTS.reduce((acc, c) => acc + c.prixAnnuel, 0);
  const mrr = Math.round(arr / 12);
  const clientsActifs = DEMO_CLIENTS.length;
  const churnRisk = DEMO_CLIENTS.filter(c => c.statut === "a_planifier").length;

  const facturesEnAttente = DEMO_FACTURES.filter(f => f.statut !== "payee");

  function getClientNom(clientId: string): string {
    return DEMO_CLIENTS.find(c => c.id === clientId)?.nom ?? clientId;
  }

  const churnColor = (level: "low" | "medium" | "high") =>
    level === "high" ? "#DC2626" : level === "medium" ? "#F59E0B" : "#10B981";
  const churnLabel = (level: "low" | "medium" | "high") =>
    level === "high" ? "Élevé" : level === "medium" ? "Moyen" : "Faible";
  const churnBg = (level: "low" | "medium" | "high") =>
    level === "high" ? "rgba(220,38,38,0.15)" : level === "medium" ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)";

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
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10B981", fontFamily: "monospace" }}>
          <TrendingUp size={12} />
          +23% vs N-1
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "ARR total",
            value: formatEur(arr),
            icon: TrendingUp,
            color: "#10B981",
            sub: "Revenu annuel récurrent",
          },
          {
            label: "MRR",
            value: formatEur(mrr),
            icon: Euro,
            color: "#60A5FA",
            sub: "Revenu mensuel récurrent",
          },
          {
            label: "Clients actifs",
            value: clientsActifs,
            icon: Users,
            color: "#A78BFA",
            sub: `${DEMO_CLIENTS.filter(c => c.formule === "serenite").length} Sérénité · ${DEMO_CLIENTS.filter(c => c.formule === "essentiel").length} Essentiel`,
          },
          {
            label: "Risque churn",
            value: churnRisk,
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
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ADMIN_METRICS.monthlyRevenue} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
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
        </div>
      </Card>

      {/* Main grid: top clients + factures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top clients */}
        <Card>
          <CardHeader title="Top clients par ARR" />
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            {[...ADMIN_TOP_CLIENTS].sort((a, b) => b.arr - a.arr).map((client, i) => (
              <div key={client.name} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/3 transition-colors">
                <span className="text-xs w-5 shrink-0 font-bold" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{client.name}</p>
                </div>
                <span className="text-sm font-bold text-white shrink-0" style={{ fontFamily: "monospace" }}>
                  {client.arr.toLocaleString("fr-FR")} €
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
                  style={{ background: churnBg(client.churn), color: churnColor(client.churn) }}
                >
                  {churnLabel(client.churn)}
                </span>
                <span
                  className="text-xs font-semibold shrink-0"
                  style={{
                    color: client.trend.startsWith("+") ? "#10B981" : "#DC2626",
                    fontFamily: "monospace",
                  }}
                >
                  {client.trend}
                </span>
              </div>
            ))}
          </div>
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
                style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
                {facturesEnAttente.length} facture{facturesEnAttente.length > 1 ? "s" : ""}
              </span>
            }
          />
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            {facturesEnAttente.length === 0 && (
              <div className="px-5 py-6 text-center text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                Aucune facture en attente
              </div>
            )}
            {facturesEnAttente.map(f => (
              <div key={f.id} className="flex items-center gap-3 px-5 py-4 hover:bg-white/3 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white" style={{ fontFamily: "monospace" }}>
                    {f.reference}
                  </p>
                  <p className="text-xs truncate mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {getClientNom(f.clientId)}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>
                    {new Date(f.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <p className="text-sm font-bold text-white shrink-0" style={{ fontFamily: "monospace" }}>
                  {f.montant.toLocaleString("fr-FR")} €
                </p>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-medium shrink-0"
                  style={{
                    background: f.statut === "en_retard" ? "rgba(220,38,38,0.15)" : "rgba(245,158,11,0.15)",
                    color: f.statut === "en_retard" ? "#DC2626" : "#F59E0B",
                  }}
                >
                  {f.statut === "en_retard" ? "En retard" : "En attente"}
                </span>
              </div>
            ))}
          </div>
          {facturesEnAttente.length > 0 && (
            <div className="px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                Total en attente :{" "}
                <span className="font-bold text-white">
                  {formatEur(facturesEnAttente.reduce((acc, f) => acc + f.montant, 0))}
                </span>
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
