import Link from "next/link";
import { MapPin, Clock, CheckCircle2, Play, ChevronRight } from "lucide-react";
import { DEMO_TECHNICIENS } from "@/lib/demo-data";

const TYPE_MAP = {
  preventif: { label: "Préventif", bg: "#D1FAE5", color: "#065F46" },
  curatif: { label: "Curatif", bg: "#FEF3C7", color: "#92400E" },
  urgence: { label: "Urgence", bg: "#FEE2E2", color: "#991B1B" },
};

const STATUT_MAP = {
  realise: { label: "Terminé", bg: "#D1FAE5", color: "#065F46", icon: CheckCircle2 },
  planifie: { label: "À venir", bg: "#F5F0E8", color: "#1B3A2D", icon: Clock },
  en_cours: { label: "En cours", bg: "#FEF3C7", color: "#92400E", icon: Play },
  annule: { label: "Annulé", bg: "#F3F4F6", color: "#6B7280", icon: Clock },
};

export default function MissionsPage() {
  const technicien = DEMO_TECHNICIENS[0];
  const missions = technicien.missions;
  const done = missions.filter((m) => m.statut === "realise").length;

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long"
  });

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm capitalize" style={{ color: "#6B7280" }}>{today}</p>
          <h1 className="text-xl font-bold mt-0.5" style={{ color: "#1A1A1A" }}>
            Bonjour, {technicien.nom.split(" ")[0]}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{technicien.certif}</p>
        </div>
        <div
          className="rounded-2xl px-4 py-3 text-center"
          style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)" }}
        >
          <p className="text-2xl font-bold" style={{ color: "#1B3A2D" }}>
            {done}/{missions.length}
          </p>
          <p className="text-xs" style={{ color: "#6B7280" }}>missions</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="rounded-2xl bg-white p-4 shadow-sm" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium" style={{ color: "#6B7280" }}>Progression du jour</p>
          <p className="text-xs font-semibold" style={{ color: "#1B3A2D" }}>
            {Math.round((done / missions.length) * 100)}%
          </p>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(done / missions.length) * 100}%`,
              background: "#1B3A2D",
            }}
          />
        </div>
      </div>

      {/* Missions list */}
      <div className="space-y-3">
        {missions.map((mission, idx) => {
          const typeConfig = TYPE_MAP[mission.type];
          const statutConfig = STATUT_MAP[mission.statut];
          const StatutIcon = statutConfig.icon;

          return (
            <div
              key={mission.id}
              className="rounded-2xl bg-white p-4 shadow-sm"
              style={{ border: "1px solid rgba(0,0,0,0.06)" }}
            >
              {/* Top row */}
              <div className="flex items-start gap-3">
                {/* Numéro */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 mt-0.5"
                  style={{
                    background: mission.statut === "realise" ? "#D1FAE5" : "#F5F0E8",
                    color: mission.statut === "realise" ? "#065F46" : "#1B3A2D",
                  }}
                >
                  {mission.statut === "realise" ? <CheckCircle2 size={14} /> : idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: "#1A1A1A" }}>
                    {mission.siteNom}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-xs" style={{ color: "#6B7280" }}>
                    <MapPin size={11} />
                    <span className="truncate">{mission.adresse}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs" style={{ color: "#6B7280" }}>
                    <Clock size={11} />
                    {mission.heure}
                  </div>
                </div>
              </div>

              {/* Bottom row */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: "#F3F4F6" }}>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: typeConfig.bg, color: typeConfig.color }}
                >
                  {typeConfig.label}
                </span>

                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: statutConfig.bg, color: statutConfig.color }}
                >
                  <StatutIcon size={10} />
                  {statutConfig.label}
                </span>

                <div className="flex-1" />

                {mission.statut !== "realise" && (
                  <Link
                    href={`/technicien/rapport/${mission.id}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: "#F26522" }}
                  >
                    <Play size={11} />
                    Démarrer
                  </Link>
                )}

                {mission.statut === "realise" && (
                  <Link
                    href={`/technicien/rapport/${mission.id}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                    style={{ background: "#F5F0E8", color: "#1B3A2D" }}
                  >
                    Rapport <ChevronRight size={11} />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
