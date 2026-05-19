import { FileText, CheckCircle2, ShieldCheck, Calendar } from "lucide-react";
import { DEMO_INTERVENTIONS } from "@/lib/demo-data";

const TYPE_MAP = {
  preventif: { label: "Préventif", bg: "#D1FAE5", color: "#065F46" },
  curatif: { label: "Curatif", bg: "#FEF3C7", color: "#92400E" },
  urgence: { label: "Urgence", bg: "#FEE2E2", color: "#991B1B" },
};

export default function HistoriqueTechnicienPage() {
  const realisees = DEMO_INTERVENTIONS.filter(
    (i) => i.statut === "realise" && i.technicienNom === "Thomas Lebrun"
  ).sort((a, b) => new Date(b.dateReelle!).getTime() - new Date(a.dateReelle!).getTime());

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "#1A1A1A" }}>Historique</h1>
        <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>
          {realisees.length} intervention{realisees.length > 1 ? "s" : ""} réalisée{realisees.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* Stat card */}
      <div
        className="rounded-2xl p-4 flex items-center gap-4"
        style={{ background: "#D1FAE5", border: "1px solid #A7F3D0" }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "white" }}>
          <ShieldCheck size={20} style={{ color: "#059669" }} />
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: "#065F46" }}>
            Taux de conformité HACCP : 100%
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#047857" }}>
            Tous les rapports sont conformes aux exigences DDPP
          </p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {realisees.map((intervention) => {
          const typeConfig = TYPE_MAP[intervention.type];
          return (
            <div
              key={intervention.id}
              className="rounded-2xl bg-white p-4 shadow-sm"
              style={{ border: "1px solid rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "#F5F0E8" }}
                >
                  <FileText size={16} style={{ color: "#1B3A2D" }} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: "#1A1A1A" }}>
                    {intervention.siteNom}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs flex items-center gap-1" style={{ color: "#6B7280" }}>
                      <Calendar size={10} />
                      {intervention.dateReelle && new Date(intervention.dateReelle).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </span>
                  </div>
                  {intervention.notes && (
                    <p className="text-xs mt-1.5 line-clamp-2" style={{ color: "#6B7280" }}>
                      {intervention.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: "#F3F4F6" }}>
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: typeConfig.bg, color: typeConfig.color }}
                >
                  {typeConfig.label}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: "#D1FAE5", color: "#065F46" }}
                >
                  <CheckCircle2 size={10} />
                  HACCP conforme
                </span>
              </div>
            </div>
          );
        })}

        {realisees.length === 0 && (
          <div className="text-center py-12" style={{ color: "#6B7280" }}>
            <FileText size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucune intervention terminée</p>
          </div>
        )}
      </div>
    </div>
  );
}
