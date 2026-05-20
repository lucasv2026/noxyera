"use client";

import { useState } from "react";
import { Target, Mail, TrendingUp, Euro, CheckCircle, X, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { ADMIN_LEADS } from "@/lib/demo-data";

const SECTEUR_MAP: Record<string, { label: string; color: string; bg: string }> = {
  restaurant:      { label: "Restaurant / Brasserie",     color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  hotel:           { label: "Hôtel / Hébergement",        color: "#60A5FA", bg: "rgba(96,165,250,0.15)" },
  entrepot:        { label: "Entrepôt / Logistique",      color: "#A78BFA", bg: "rgba(167,139,250,0.15)" },
  agroalimentaire: { label: "Industrie agroalimentaire",  color: "#34D399", bg: "rgba(52,211,153,0.15)" },
  immeuble:        { label: "Immeuble / Bailleur",        color: "#FB923C", bg: "rgba(251,146,60,0.15)" },
  bureau:          { label: "Bureau / Tertiaire",         color: "#94A3B8", bg: "rgba(148,163,184,0.15)" },
};

const FREQ_MAP: Record<number, string> = { 4: "4×/an", 6: "6×/an", 12: "12×/an" };

type FilterStatut = "tous" | "a_rappeler" | "propose" | "signe";
type LeadStatut = "a_rappeler" | "propose" | "signe";

const FILTER_TABS: { key: FilterStatut; label: string }[] = [
  { key: "tous",       label: "Tous" },
  { key: "a_rappeler", label: "À rappeler" },
  { key: "propose",    label: "Proposé" },
  { key: "signe",      label: "Signé" },
];

function getScoreColor(score: number): { bar: string; bg: string; label: string } {
  if (score < 4)  return { bar: "#10B981", bg: "rgba(16,185,129,0.2)",  label: "Faible" };
  if (score <= 7) return { bar: "#F59E0B", bg: "rgba(245,158,11,0.2)",  label: "Modéré" };
  return              { bar: "#EF4444", bg: "rgba(239,68,68,0.2)",      label: "Élevé" };
}

function getStatutConfig(statut: string): { label: string; color: string; bg: string } {
  if (statut === "a_rappeler") return { label: "À rappeler", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" };
  if (statut === "propose")    return { label: "Proposé",    color: "#60A5FA", bg: "rgba(96,165,250,0.15)" };
  if (statut === "signe")      return { label: "Signé",      color: "#10B981", bg: "rgba(16,185,129,0.15)" };
  return { label: statut, color: "rgba(255,255,255,0.5)", bg: "rgba(255,255,255,0.08)" };
}

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "aujourd'hui";
  if (days === 1) return "il y a 1j";
  return `il y a ${days}j`;
}

type Lead = typeof ADMIN_LEADS[number];

// ── Stripe Checkout Modal ────────────────────────────────────────────────────
function CheckoutModal({
  lead,
  onClose,
}: {
  lead: Lead;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const montantCentimes = lead.prixEstime * 100;

  async function handleLaunch() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: lead.email,
          montant: montantCentimes,
          description: `Contrat annuel Noxyera — ${lead.nom_etablissement ?? lead.email} (${lead.formuleSuggeree === "serenite" ? "Sérénité" : "Essentiel"})`,
          formule: lead.formuleSuggeree,
          metadata: {
            lead_id: lead.id,
            site_nom: lead.nom_etablissement ?? "",
            secteur: lead.secteur,
            superficie: String(lead.superficie),
            frequence: String(lead.frequence),
          },
          successUrl: `${window.location.origin}/admin/leads?paiement=success&lead=${lead.id}`,
          cancelUrl: `${window.location.origin}/admin/leads`,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Erreur Stripe");
      }
      window.open(data.url, "_blank");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 space-y-5"
        style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Convertir en client</h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
              Lancer le paiement Stripe pour ce prospect
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
          >
            <X size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>

        {/* Lead summary */}
        <div
          className="rounded-xl p-4 space-y-3"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Prospect</span>
            <span className="text-sm font-semibold text-white">{lead.email}</span>
          </div>
          {lead.nom_etablissement && (
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Établissement</span>
              <span className="text-sm text-white">{lead.nom_etablissement}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Formule</span>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{
                background: lead.formuleSuggeree === "serenite"
                  ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.08)",
                color: lead.formuleSuggeree === "serenite" ? "#60A5FA" : "rgba(255,255,255,0.6)",
              }}
            >
              {lead.formuleSuggeree === "serenite" ? "Sérénité" : "Essentiel"}
            </span>
          </div>
          <div
            className="flex items-center justify-between pt-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Montant annuel</span>
            <span className="text-xl font-bold" style={{ color: "#10B981", fontFamily: "monospace" }}>
              {lead.prixEstime.toLocaleString("fr-FR")} € HT/an
            </span>
          </div>
        </div>

        {/* Info */}
        <div
          className="flex items-start gap-2.5 rounded-xl p-3"
          style={{ background: "rgba(242,101,34,0.1)", border: "1px solid rgba(242,101,34,0.2)" }}
        >
          <AlertCircle size={14} style={{ color: "#F26522" }} className="shrink-0 mt-0.5" />
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
            Un lien Stripe Checkout sera ouvert dans un nouvel onglet. Le prospect recevra un email de confirmation dès le paiement effectué.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="rounded-xl p-3 text-xs"
            style={{ background: "rgba(239,68,68,0.1)", color: "#FCA5A5", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><AlertCircle size={13} /> {error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}
          >
            Annuler
          </button>
          <button
            onClick={handleLaunch}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: "#10B981", color: "white" }}
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <ExternalLink size={15} />
            )}
            {loading ? "Création…" : "Lancer le paiement"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function AdminLeadsPage() {
  const [filter, setFilter] = useState<FilterStatut>("tous");
  const [statuts, setStatuts] = useState<Record<string, LeadStatut>>(
    Object.fromEntries(ADMIN_LEADS.map((l) => [l.id, l.statut as LeadStatut]))
  );
  const [checkoutLead, setCheckoutLead] = useState<Lead | null>(null);

  const filtered = filter === "tous"
    ? ADMIN_LEADS
    : ADMIN_LEADS.filter((l) => statuts[l.id] === filter);

  const totalPotentiel = ADMIN_LEADS.reduce((acc, l) => acc + l.prixEstime, 0);
  const nbSignes = Object.values(statuts).filter((s) => s === "signe").length;

  function setLeadStatut(id: string, statut: LeadStatut) {
    setStatuts((prev) => ({ ...prev, [id]: statut }));
  }

  return (
    <div className="p-5 space-y-5 min-h-screen" style={{ background: "#0D1F17" }}>
      {/* Checkout Modal */}
      {checkoutLead && (
        <CheckoutModal lead={checkoutLead} onClose={() => setCheckoutLead(null)} />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Leads estimateur</h1>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          Prospects capturés via le tunnel tarifaire de la landing page
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Leads reçus",     value: ADMIN_LEADS.length,                               icon: Target,     color: "#10B981" },
          { label: "Valeur pipeline", value: `${totalPotentiel.toLocaleString("fr-FR")} €/an`,  icon: Euro,       color: "#60A5FA" },
          { label: "Leads signés",    value: `${nbSignes}/${ADMIN_LEADS.length}`,               icon: TrendingUp, color: "#F59E0B" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-5"
            style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
                {label}
              </p>
              <Icon size={14} style={{ color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={
              filter === key
                ? { background: "#F26522", color: "white" }
                : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.55)" }
            }
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-xs" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
          {filtered.length} lead{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Leads table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 className="font-semibold text-sm text-white">Pipeline commercial</h2>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
            Triés par date décroissante
          </p>
        </div>

        <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {filtered.map((lead) => {
            const secteurInfo = SECTEUR_MAP[lead.secteur] ?? { label: lead.secteur, color: "#94A3B8", bg: "rgba(148,163,184,0.15)" };
            const scoreInfo   = getScoreColor(lead.score_risque);
            const currentStatut = statuts[lead.id] ?? lead.statut;

            return (
              <div
                key={lead.id}
                className="px-5 py-4 hover:bg-white/[0.02] transition-colors"
              >
                {/* Row 1: icon + identity + score bar + prix */}
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "rgba(255,255,255,0.06)" }}>
                    <Mail size={15} style={{ color: "#60A5FA" }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-white">{lead.email}</p>
                      {lead.nom_etablissement && (
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                          · {lead.nom_etablissement}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: secteurInfo.bg, color: secteurInfo.color }}>
                        {secteurInfo.label}
                      </span>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                        {lead.superficie.toLocaleString("fr-FR")} m²
                      </span>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                        {FREQ_MAP[lead.frequence]}
                      </span>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                        Curatives {lead.curatives ? "incluses" : "à part"}
                      </span>
                      <span className="text-xs ml-1" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>
                        {relativeDate(lead.createdAt)}
                      </span>
                    </div>

                    {/* Pest Alert score bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs shrink-0" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
                        Score Pest Alert
                      </span>
                      <div className="flex-1 max-w-[120px] h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${(lead.score_risque / 10) * 100}%`, background: scoreInfo.bar }}
                        />
                      </div>
                      <span className="text-xs font-semibold shrink-0"
                        style={{ color: scoreInfo.bar, fontFamily: "monospace" }}>
                        {lead.score_risque.toFixed(1)}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-xs"
                        style={{ background: scoreInfo.bg, color: scoreInfo.bar }}>
                        {scoreInfo.label}
                      </span>
                    </div>
                  </div>

                  {/* Right: prix + formule */}
                  <div className="text-right shrink-0 space-y-1.5">
                    <p className="text-base font-bold text-white" style={{ fontFamily: "monospace" }}>
                      {lead.prixEstime.toLocaleString("fr-FR")} €/an
                    </p>
                    <span
                      className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: lead.formuleSuggeree === "serenite"
                          ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.08)",
                        color: lead.formuleSuggeree === "serenite" ? "#60A5FA" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {lead.formuleSuggeree === "serenite" ? "Sérénité" : "Essentiel"}
                    </span>
                  </div>
                </div>

                {/* Row 2: status buttons + convert */}
                <div className="flex items-center gap-2 mt-3" style={{ paddingLeft: "52px" }}>
                  <div className="flex items-center gap-1.5 mr-2">
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Statut :</span>
                    {(["a_rappeler", "propose", "signe"] as const).map((s) => {
                      const cfg = getStatutConfig(s);
                      const isActive = currentStatut === s;
                      return (
                        <button
                          key={s}
                          onClick={() => setLeadStatut(lead.id, s)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                          style={
                            isActive
                              ? { background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40` }
                              : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" }
                          }
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex-1" />

                  {/* Convert button */}
                  <button
                    onClick={() => setCheckoutLead(lead)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                    style={{ background: "rgba(16,185,129,0.15)", color: "#10B981", border: "1px solid rgba(16,185,129,0.25)" }}
                  >
                    <CheckCircle size={12} />
                    Convertir en client
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-5 py-3 text-xs text-center"
          style={{ color: "rgba(255,255,255,0.25)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          Les leads sont sauvegardés automatiquement depuis le tunnel estimateur de la landing page.
        </div>
      </div>
    </div>
  );
}
