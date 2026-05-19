"use client";

import { useState } from "react";
import { Calendar, CheckCircle2, Clock, AlertTriangle, XCircle, Download, FileText, Filter } from "lucide-react";
import { DEMO_YOOMA_INTERVENTIONS, DEMO_YOOMA_RAPPORTS, DEMO_YOOMA_SITES } from "@/lib/demo-data";

function TypeBadge({ type }: { type: "preventif" | "curatif" | "urgence" }) {
  const map = {
    preventif: { label: "Préventif", bg: "#D1FAE5", color: "#065F46" },
    curatif:   { label: "Curatif",   bg: "#FEF3C7", color: "#92400E" },
    urgence:   { label: "Urgence",   bg: "#FEE2E2", color: "#991B1B" },
  };
  const { label, bg, color } = map[type];
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap" style={{ background: bg, color }}>
      {label}
    </span>
  );
}

function StatutBadge({ statut }: { statut: string }) {
  if (statut === "realise") return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap" style={{ background: "#D1FAE5", color: "#065F46" }}>
      <CheckCircle2 size={10} /> Réalisée
    </span>
  );
  if (statut === "planifie") return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap" style={{ background: "#FEF3C7", color: "#92400E" }}>
      <Clock size={10} /> Planifiée
    </span>
  );
  if (statut === "en_cours") return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap" style={{ background: "#FEF3C7", color: "#D97706" }}>
      <AlertTriangle size={10} /> En cours
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap" style={{ background: "#F3F4F6", color: "#6B7280" }}>
      <XCircle size={10} /> Annulée
    </span>
  );
}

export default function InterventionsPage() {
  const [filterSite, setFilterSite]   = useState("all");
  const [filterMois, setFilterMois]   = useState("all");

  // Build unique site options
  const siteOptions = DEMO_YOOMA_SITES.map((s) => ({ id: s.id, label: s.nom.replace("Yooma Urban Lodge — ", "") }));

  // Months present in interventions
  const allMonths = Array.from(
    new Set(DEMO_YOOMA_INTERVENTIONS.map((i) => i.datePrevue.slice(0, 7)))
  ).sort().reverse();

  const filtered = DEMO_YOOMA_INTERVENTIONS
    .filter((i) => filterSite === "all" || i.siteId === filterSite)
    .filter((i) => filterMois === "all" || i.datePrevue.startsWith(filterMois))
    .sort((a, b) => new Date(b.datePrevue).getTime() - new Date(a.datePrevue).getTime());

  // Map intervention → rapport
  const rapportByIntervention = Object.fromEntries(
    DEMO_YOOMA_RAPPORTS.map((r) => [r.interventionId, r])
  );

  const counts = {
    total:    DEMO_YOOMA_INTERVENTIONS.length,
    realises: DEMO_YOOMA_INTERVENTIONS.filter((i) => i.statut === "realise").length,
    planifie: DEMO_YOOMA_INTERVENTIONS.filter((i) => i.statut === "planifie").length,
  };

  return (
    <div className="p-5 sm:p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>Interventions</h1>
        <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>
          Historique complet de toutes vos interventions anti-nuisibles
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: counts.total, color: "#1B3A2D", bg: "#F5F0E8" },
          { label: "Réalisées", value: counts.realises, color: "#059669", bg: "#D1FAE5" },
          { label: "Planifiées", value: counts.planifie, color: "#D97706", bg: "#FEF3C7" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="rounded-2xl bg-white p-4 shadow-sm text-center" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
            <p className="text-xs font-medium mb-1" style={{ color: "#6B7280" }}>{label}</p>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm"
        style={{ border: "1px solid rgba(0,0,0,0.06)" }}
      >
        <Filter size={14} style={{ color: "#6B7280" }} />
        <span className="text-xs font-medium" style={{ color: "#6B7280" }}>Filtrer :</span>

        <select
          value={filterSite}
          onChange={(e) => setFilterSite(e.target.value)}
          className="text-sm rounded-xl px-3 py-1.5 outline-none font-medium"
          style={{ background: "#F5F0E8", color: "#1B3A2D", border: "none" }}
        >
          <option value="all">Tous les sites</option>
          {siteOptions.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>

        <select
          value={filterMois}
          onChange={(e) => setFilterMois(e.target.value)}
          className="text-sm rounded-xl px-3 py-1.5 outline-none font-medium"
          style={{ background: "#F5F0E8", color: "#1B3A2D", border: "none" }}
        >
          <option value="all">Tous les mois</option>
          {allMonths.map((m) => {
            const [year, month] = m.split("-");
            const label = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
            return <option key={m} value={m}>{label}</option>;
          })}
        </select>

        {(filterSite !== "all" || filterMois !== "all") && (
          <button
            onClick={() => { setFilterSite("all"); setFilterMois("all"); }}
            className="text-xs font-medium underline"
            style={{ color: "#6B7280" }}
          >
            Réinitialiser
          </button>
        )}

        <span className="ml-auto text-xs" style={{ color: "#6B7280" }}>
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
        {/* Table header — desktop */}
        <div
          className="hidden lg:grid px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b"
          style={{
            gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr 1fr",
            color: "#9CA3AF",
            borderColor: "#F3F4F6",
            background: "#FAFAFA",
          }}
        >
          <span>Date</span>
          <span>Site</span>
          <span>Technicien</span>
          <span>Type</span>
          <span>Statut</span>
          <span>Rapport</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Calendar size={32} className="mx-auto mb-3" style={{ color: "#D1D5DB" }} />
            <p className="text-sm font-medium" style={{ color: "#6B7280" }}>Aucune intervention</p>
            <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>Modifiez les filtres pour afficher plus de résultats.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((intervention) => {
              const rapport = rapportByIntervention[intervention.id];
              return (
                <div
                  key={intervention.id}
                  className="flex flex-col lg:grid gap-3 lg:gap-0 px-5 py-4 hover:bg-gray-50 transition-colors"
                  style={{ gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr 1fr", alignItems: "center" }}
                >
                  {/* Date */}
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#1A1A1A" }}>
                      {new Date(intervention.datePrevue).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                    {intervention.dateReelle && intervention.dateReelle !== intervention.datePrevue && (
                      <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                        Réalisée le {new Date(intervention.dateReelle).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </p>
                    )}
                  </div>

                  {/* Site */}
                  <p className="text-sm truncate" style={{ color: "#1A1A1A" }}>{intervention.siteNom}</p>

                  {/* Technicien */}
                  <p className="text-sm" style={{ color: "#6B7280" }}>{intervention.technicienNom}</p>

                  {/* Type */}
                  <div><TypeBadge type={intervention.type} /></div>

                  {/* Statut */}
                  <div><StatutBadge statut={intervention.statut} /></div>

                  {/* Rapport */}
                  <div>
                    {rapport ? (
                      <button
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-opacity hover:opacity-80"
                        style={{ background: "#1B3A2D", color: "white" }}
                        onClick={() => alert("PDF disponible — génération en cours de configuration Supabase Storage.")}
                      >
                        <Download size={12} />
                        PDF
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: "#9CA3AF" }}>
                        <FileText size={12} />
                        {intervention.statut === "planifie" ? "À venir" : "–"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
