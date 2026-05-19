import { MapPin, Building2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { DEMO_SITES } from "@/lib/demo-data";

function StatutBadge({ statut }: { statut: "conforme" | "a_planifier" | "urgent" }) {
  if (statut === "conforme") return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: "#D1FAE5", color: "#065F46" }}>
      <CheckCircle2 size={10} /> Conforme
    </span>
  );
  if (statut === "a_planifier") return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: "#FEF3C7", color: "#92400E" }}>
      <Clock size={10} /> À planifier
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: "#FEE2E2", color: "#991B1B" }}>
      <AlertTriangle size={10} /> Urgent
    </span>
  );
}

export default function DashboardSitesPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>Sites</h1>
        <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
          {DEMO_SITES.length} sites actifs dans votre portefeuille
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {DEMO_SITES.map((site) => (
          <div
            key={site.id}
            className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
            style={{ border: "1px solid rgba(0,0,0,0.06)" }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "#F5F0E8" }}
                >
                  <Building2 size={16} style={{ color: "#1B3A2D" }} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: "#1A1A1A" }}>
                    {site.nom}
                  </p>
                  <p className="text-xs truncate" style={{ color: "#6B7280" }}>
                    {site.secteur}
                  </p>
                </div>
              </div>
              <StatutBadge statut={site.statut} />
            </div>

            {/* Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm" style={{ color: "#6B7280" }}>
                <MapPin size={13} />
                <span className="truncate">{site.adresse}, {site.ville}</span>
              </div>

              <div className="flex items-center justify-between text-sm pt-3 border-t" style={{ borderColor: "#F3F4F6" }}>
                <div>
                  <p className="text-xs" style={{ color: "#6B7280" }}>Superficie</p>
                  <p className="font-semibold text-sm" style={{ color: "#1A1A1A" }}>
                    {site.superficie.toLocaleString("fr-FR")} m²
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: "#6B7280" }}>Score HACCP</p>
                  <p className="font-semibold text-sm" style={{ color: site.haccpScore >= 90 ? "#059669" : site.haccpScore >= 75 ? "#D97706" : "#DC2626" }}>
                    {site.haccpScore}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: "#6B7280" }}>Formule</p>
                  <p className="font-semibold text-sm capitalize" style={{ color: "#1B3A2D" }}>
                    {site.formule === "serenite" ? "Sérénité" : "Essentiel"}
                  </p>
                </div>
              </div>

              {site.prochainPassage && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium mt-1"
                  style={{ background: "#F5F0E8", color: "#1B3A2D" }}
                >
                  <Clock size={12} />
                  Prochain passage :{" "}
                  {new Date(site.prochainPassage).toLocaleDateString("fr-FR", {
                    day: "numeric", month: "long", year: "numeric"
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
