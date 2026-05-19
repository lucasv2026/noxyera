import { DEMO_CLIENTS, DEMO_SITES, DEMO_FACTURES } from "@/lib/demo-data";
import { CheckCircle2, Clock, AlertTriangle, Download, Mail, Phone, User, Shield, Building2, FileText } from "lucide-react";

const client = DEMO_CLIENTS[4]; // Brasserie Voltaire — c5
const sites = DEMO_SITES.filter((s) => s.clientId === "c5");
const factures = DEMO_FACTURES.filter((f) => f.clientId === "c5");
const prochainPassage = DEMO_SITES[7]?.prochainPassage; // s8 — Brasserie Voltaire

function FormuleBadge({ formule }: { formule: "essentiel" | "serenite" }) {
  if (formule === "serenite") {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
        style={{ background: "#1B3A2D", color: "#fff" }}
      >
        <Shield size={13} />
        Sérénité
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
      style={{ background: "#FEF3C7", color: "#92400E" }}
    >
      <Shield size={13} />
      Essentiel
    </span>
  );
}

function StatutBadge({ statut }: { statut: "conforme" | "a_planifier" | "urgent" }) {
  if (statut === "conforme") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
        style={{ background: "#D1FAE5", color: "#065F46" }}
      >
        <CheckCircle2 size={11} />
        Conforme
      </span>
    );
  }
  if (statut === "a_planifier") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
        style={{ background: "#FEF3C7", color: "#92400E" }}
      >
        <Clock size={11} />
        À planifier
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: "#FEE2E2", color: "#991B1B" }}
    >
      <AlertTriangle size={11} />
      Urgent
    </span>
  );
}

function HaccpBadge({ score }: { score: number }) {
  const color = score >= 90 ? "#059669" : score >= 75 ? "#D97706" : "#DC2626";
  const bg = score >= 90 ? "#D1FAE5" : score >= 75 ? "#FEF3C7" : "#FEE2E2";
  return (
    <span
      className="px-2 py-0.5 rounded-lg text-xs font-semibold"
      style={{ background: bg, color }}
    >
      HACCP {score}%
    </span>
  );
}

function FactureStatutBadge({ statut }: { statut: "payee" | "en_attente" | "en_retard" }) {
  if (statut === "payee") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
        style={{ background: "#D1FAE5", color: "#065F46" }}
      >
        <CheckCircle2 size={11} />
        Payée
      </span>
    );
  }
  if (statut === "en_attente") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
        style={{ background: "#FEF3C7", color: "#92400E" }}
      >
        <Clock size={11} />
        En attente
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: "#FEE2E2", color: "#991B1B" }}
    >
      <AlertTriangle size={11} />
      En retard
    </span>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatEur(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}

export default function MonComptePage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1A1A1A" }}>
          Mon compte
        </h1>
        <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
          {client.nom}
        </p>
      </div>

      {/* Card — Informations contrat */}
      <div className="rounded-2xl bg-white p-6 shadow-sm" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2 mb-5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "#D1FAE5" }}
          >
            <FileText size={15} style={{ color: "#059669" }} />
          </div>
          <h2 className="font-semibold text-base" style={{ color: "#1A1A1A" }}>
            Informations contrat
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#6B7280" }}>Formule</p>
            <FormuleBadge formule={client.formule} />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#6B7280" }}>Prix annuel</p>
            <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>{formatEur(client.prixAnnuel)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#6B7280" }}>Date de début</p>
            <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>5 janvier 2026</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#6B7280" }}>Date de renouvellement</p>
            <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>5 janvier 2027</p>
          </div>
          <div className="space-y-1 sm:col-span-2">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#6B7280" }}>Prochaine intervention</p>
            <p className="text-sm font-semibold" style={{ color: "#F26522" }}>
              {prochainPassage ? formatDate(prochainPassage) : "À planifier"}
            </p>
          </div>
        </div>
      </div>

      {/* Card — Sites couverts */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2 px-6 py-4 border-b" style={{ borderColor: "#F3F4F6" }}>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "#EDE9FE" }}
          >
            <Building2 size={15} style={{ color: "#7C3AED" }} />
          </div>
          <h2 className="font-semibold text-base" style={{ color: "#1A1A1A" }}>
            Sites couverts
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {sites.map((site) => (
            <div key={site.id} className="flex items-center gap-4 px-6 py-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: "#1B3A2D" }}
              >
                {site.nom.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm" style={{ color: "#1A1A1A" }}>{site.nom}</p>
                <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                  {site.adresse}, {site.ville}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <HaccpBadge score={site.haccpScore} />
                <StatutBadge statut={site.statut} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card — Historique de facturation */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2 px-6 py-4 border-b" style={{ borderColor: "#F3F4F6" }}>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "#FEF3C7" }}
          >
            <FileText size={15} style={{ color: "#D97706" }} />
          </div>
          <h2 className="font-semibold text-base" style={{ color: "#1A1A1A" }}>
            Historique de facturation
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {factures.map((facture) => (
            <div key={facture.id} className="flex items-center gap-4 px-6 py-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm" style={{ color: "#1A1A1A" }}>{facture.reference}</p>
                <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                  {formatDate(facture.date)} · {facture.description}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>{formatEur(facture.montant)}</p>
                <FactureStatutBadge statut={facture.statut} />
                <button
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-gray-100"
                  style={{ border: "1px solid #E5E7EB" }}
                  aria-label="Télécharger la facture"
                >
                  <Download size={14} style={{ color: "#6B7280" }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card — Mon compte */}
      <div className="rounded-2xl bg-white p-6 shadow-sm" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-2 mb-5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "#EDE9FE" }}
          >
            <User size={15} style={{ color: "#7C3AED" }} />
          </div>
          <h2 className="font-semibold text-base" style={{ color: "#1A1A1A" }}>
            Mon compte
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#F9FAFB" }}>
            <User size={16} style={{ color: "#6B7280" }} />
            <div>
              <p className="text-xs" style={{ color: "#6B7280" }}>Nom</p>
              <p className="text-sm font-medium" style={{ color: "#1A1A1A" }}>Jean Dupont</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#F9FAFB" }}>
            <Mail size={16} style={{ color: "#6B7280" }} />
            <div>
              <p className="text-xs" style={{ color: "#6B7280" }}>Email</p>
              <p className="text-sm font-medium" style={{ color: "#1A1A1A" }}>contact@brasserie-voltaire.fr</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#F9FAFB" }}>
            <Phone size={16} style={{ color: "#6B7280" }} />
            <div>
              <p className="text-xs" style={{ color: "#6B7280" }}>Téléphone</p>
              <p className="text-sm font-medium" style={{ color: "#1A1A1A" }}>06 12 34 56 78</p>
            </div>
          </div>
        </div>

        <a
          href="mailto:contact@noxyera.com"
          className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "#F26522", display: "flex" }}
        >
          <Mail size={15} />
          Contacter Noxyera
        </a>
      </div>
    </div>
  );
}
