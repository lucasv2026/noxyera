import { TrendingUp, Users, FileSignature, ShieldCheck, AlertTriangle, Clock, Star, ArrowUpRight, MapPin } from "lucide-react";
import {
  ADMIN_METRICS, ADMIN_ALERTS, ADMIN_TOP_CLIENTS, ADMIN_TECHNICIENS,
} from "@/lib/demo-data";
import RevenueChart from "./components/revenue-chart";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      <h3 className="font-semibold text-sm text-white">{title}</h3>
      {right}
    </div>
  );
}

const RECENT_RATINGS = [
  { tech: "Thomas Lebrun", client: "Hilton Paris Opéra", rating: 5, comment: "Ponctuel, rapport très détaillé." },
  { tech: "Sophie Martin", client: "Amazon Logistics", rating: 4, comment: "Bon travail, quelques écarts documentation." },
  { tech: "Marc Durand", client: "Groupe Bonduelle", rating: 5, comment: "Excellence technique, recommandé." },
];

export default function AdminPage() {
  const churnColor = (level: "low" | "medium" | "high") =>
    level === "high" ? "#DC2626" : level === "medium" ? "#F59E0B" : "#10B981";

  return (
    <div className="p-5 space-y-5 min-h-screen" style={{ background: "#0D1F17" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Vue Administrateur</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
            Plateforme NOXYERA — Back-office opérationnel
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10B981", fontFamily: "monospace" }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#10B981" }} />
          En direct · {ADMIN_METRICS.techniciansToday} techniciens actifs
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "GMV ce mois",
            value: `${ADMIN_METRICS.gmv.toLocaleString("fr-FR")} €`,
            icon: TrendingUp, color: "#10B981", change: "+18%",
          },
          {
            label: "Contrats actifs",
            value: ADMIN_METRICS.activeContracts,
            icon: FileSignature, color: "#60A5FA", change: "+5 ce mois",
          },
          {
            label: "Techniciens actifs",
            value: ADMIN_METRICS.techniciansToday,
            icon: Users, color: "#A78BFA", change: "sur 31 total",
          },
          {
            label: "Conformité SLA",
            value: `${ADMIN_METRICS.slaCompliance}%`,
            icon: ShieldCheck, color: "#F59E0B", change: "cible >98%",
          },
        ].map(({ label, value, icon: Icon, color, change }) => (
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
            <p className="mt-2 text-xs flex items-center gap-1" style={{ color }}>
              <ArrowUpRight size={11} /> {change}
            </p>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT */}
        <div className="space-y-4">
          {/* Techniciens actifs */}
          <Card>
            <CardHeader
              title="Techniciens actifs aujourd'hui"
              right={
                <div className="flex items-center gap-3 text-xs" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#10B981" }} />
                    En intervention
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#6B7280" }} />
                    En transit
                  </span>
                </div>
              }
            />
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              {ADMIN_TECHNICIENS.filter(t => t.statut === "actif").map((tech) => (
                <div key={tech.id} className="flex items-center gap-3 px-5 py-3">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: tech.missionsAujourdhui > 0 ? "#10B981" : "#6B7280" }}
                  />
                  <p className="flex-1 text-xs font-medium text-white">{tech.nom}</p>
                  <span className="flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    <MapPin size={10} />
                    {tech.region}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: tech.missionsAujourdhui > 0 ? "rgba(16,185,129,0.12)" : "rgba(107,114,128,0.12)",
                      color: tech.missionsAujourdhui > 0 ? "#10B981" : "#9CA3AF",
                    }}
                  >
                    {tech.missionsAujourdhui} mission{tech.missionsAujourdhui > 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Alertes */}
          <Card>
            <CardHeader title="Alertes en attente" />
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              {ADMIN_ALERTS.map((alert) => (
                <div key={alert.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/3 transition-colors cursor-pointer">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: alert.level === "danger" ? "#7F1D1D"
                        : alert.level === "warning" ? "#78350F"
                        : "#1E3A5F",
                    }}
                  >
                    <AlertTriangle size={12} style={{
                      color: alert.level === "danger" ? "#FCA5A5"
                        : alert.level === "warning" ? "#FCD34D"
                        : "#93C5FD",
                    }} />
                  </div>
                  <p className="flex-1 text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>{alert.text}</p>
                  <Clock size={11} style={{ color: "rgba(255,255,255,0.25)" }} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          {/* Graphe ARR */}
          <Card>
            <CardHeader
              title="Croissance ARR"
              right={
                <span className="text-xs font-semibold" style={{ color: "#10B981", fontFamily: "monospace" }}>+23% vs N-1</span>
              }
            />
            <div className="px-4 py-4">
              <RevenueChart />
              <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#1B4332" }} /> CA mensuel
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ background: "#F26522" }} /> Marge nette
                </span>
              </div>
            </div>
          </Card>

          {/* Top clients */}
          <Card>
            <CardHeader title="Clients par ARR" />
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              {ADMIN_TOP_CLIENTS.map((client, i) => (
                <div key={client.name} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-xs w-4 shrink-0" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
                    {i + 1}
                  </span>
                  <p className="flex-1 text-xs truncate" style={{ color: "rgba(255,255,255,0.75)" }}>
                    {client.name}
                  </p>
                  <span className="text-xs font-bold text-white" style={{ fontFamily: "monospace" }}>
                    {client.arr.toLocaleString("fr-FR")} €
                  </span>
                  <span className="text-xs font-medium" style={{
                    color: client.trend.startsWith("+") ? "#10B981" : "#DC2626",
                    fontFamily: "monospace",
                  }}>
                    {client.trend}
                  </span>
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: churnColor(client.churn) }}
                    title={`Risque churn : ${client.churn}`}
                  />
                </div>
              ))}
            </div>
            <div className="px-5 py-2 text-xs" style={{ color: "rgba(255,255,255,0.3)", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              ● Rouge = risque churn élevé · ● Orange = moyen · ● Vert = faible
            </div>
          </Card>

          {/* Dernières évaluations */}
          <Card>
            <CardHeader title="Dernières évaluations techniciens" />
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              {RECENT_RATINGS.map((r, i) => (
                <div key={i} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-white">{r.tech}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} size={10} style={{ color: s < r.rating ? "#F59E0B" : "rgba(255,255,255,0.15)", fill: s < r.rating ? "#F59E0B" : "transparent" }} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {r.client}
                  </p>
                  <p className="text-xs italic" style={{ color: "rgba(255,255,255,0.55)" }}>
                    &ldquo;{r.comment}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
