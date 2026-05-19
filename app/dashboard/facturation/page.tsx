import { CreditCard, CheckCircle2, Clock, AlertTriangle, Download, FileText } from "lucide-react";
import { DEMO_FACTURES } from "@/lib/demo-data";

function StatutBadge({ statut }: { statut: "payee" | "en_attente" | "en_retard" }) {
  if (statut === "payee") return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: "#D1FAE5", color: "#065F46" }}>
      <CheckCircle2 size={10} /> Payée
    </span>
  );
  if (statut === "en_attente") return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: "#FEF3C7", color: "#92400E" }}>
      <Clock size={10} /> En attente
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: "#FEE2E2", color: "#991B1B" }}>
      <AlertTriangle size={10} /> En retard
    </span>
  );
}

export default function DashboardFacturationPage() {
  const totalPaye = DEMO_FACTURES.filter((f) => f.statut === "payee").reduce((acc, f) => acc + f.montant, 0);
  const totalEnAttente = DEMO_FACTURES.filter((f) => f.statut !== "payee").reduce((acc, f) => acc + f.montant, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>Facturation</h1>
        <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
          Contrats annuels et historique de facturation
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={15} style={{ color: "#059669" }} />
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#6B7280" }}>Encaissé</p>
          </div>
          <p className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
            {totalPaye.toLocaleString("fr-FR")} €
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={15} style={{ color: "#D97706" }} />
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#6B7280" }}>En attente</p>
          </div>
          <p className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
            {totalEnAttente.toLocaleString("fr-FR")} €
          </p>
        </div>
      </div>

      {/* Factures table */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: "#F3F4F6" }}>
          <h2 className="font-semibold" style={{ color: "#1A1A1A" }}>Factures</h2>
        </div>

        <div className="divide-y">
          {DEMO_FACTURES.map((facture) => (
            <div
              key={facture.id}
              className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "#F5F0E8" }}
              >
                <FileText size={16} style={{ color: "#1B3A2D" }} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm" style={{ color: "#1A1A1A" }}>
                  {facture.reference}
                </p>
                <p className="text-xs mt-0.5 truncate" style={{ color: "#6B7280" }}>
                  {facture.description} ·{" "}
                  {new Date(facture.date).toLocaleDateString("fr-FR", {
                    day: "numeric", month: "long", year: "numeric"
                  })}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="font-semibold text-sm" style={{ color: "#1A1A1A" }}>
                  {facture.montant.toLocaleString("fr-FR")} €
                </p>
              </div>

              <StatutBadge statut={facture.statut} />

              <button
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium hover:opacity-90 shrink-0"
                style={{ background: "#F5F0E8", color: "#1B3A2D" }}
              >
                <Download size={13} />
                PDF
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
