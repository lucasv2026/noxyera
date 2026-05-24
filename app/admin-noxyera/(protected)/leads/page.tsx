"use client";

import { useState, useEffect } from "react";
import { Target, Mail, TrendingUp, Euro, CheckCircle, X, ExternalLink, Loader2, AlertCircle, UserPlus } from "lucide-react";

const SECTEUR_MAP: Record<string, { label: string; color: string; bg: string }> = {
  restaurant:      { label: "Restaurant / Brasserie",     color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  hotel:           { label: "Hôtel / Hébergement",        color: "#60A5FA", bg: "rgba(96,165,250,0.15)" },
  entrepot:        { label: "Entrepôt / Logistique",      color: "#A78BFA", bg: "rgba(167,139,250,0.15)" },
  agroalimentaire: { label: "Industrie agroalimentaire",  color: "#34D399", bg: "rgba(52,211,153,0.15)" },
  immeuble:        { label: "Immeuble / Bailleur",        color: "#FB923C", bg: "rgba(251,146,60,0.15)" },
  bureau:          { label: "Bureau / Tertiaire",         color: "#94A3B8", bg: "rgba(148,163,184,0.15)" },
};

const FREQ_MAP: Record<number, string> = { 4: "4×/an", 6: "6×/an", 12: "12×/an" };

type LeadStatut = "nouveau" | "contacté" | "devis_envoyé" | "signé" | "perdu";

const STATUT_OPTIONS: { key: LeadStatut; label: string; color: string; bg: string }[] = [
  { key: "nouveau",       label: "Nouveau",       color: "#94A3B8", bg: "rgba(148,163,184,0.15)" },
  { key: "contacté",      label: "Contacté",      color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  { key: "devis_envoyé",  label: "Devis envoyé",  color: "#60A5FA", bg: "rgba(96,165,250,0.15)" },
  { key: "signé",         label: "Signé",         color: "#10B981", bg: "rgba(16,185,129,0.15)" },
  { key: "perdu",         label: "Perdu",         color: "#EF4444", bg: "rgba(239,68,68,0.15)" },
];

interface Lead {
  id: string;
  email: string;
  nom_etablissement?: string | null;
  secteur: string;
  superficie: number;
  frequence: number;
  curatives: boolean;
  prixEstime: number;
  formuleSuggeree: string;
  score_risque: number;
  statut: LeadStatut;
  createdAt: string;
}

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "aujourd'hui";
  if (days === 1) return "il y a 1j";
  return `il y a ${days}j`;
}

function getStatutConfig(statut: string) {
  return STATUT_OPTIONS.find(s => s.key === statut) ?? STATUT_OPTIONS[0];
}

// Modal créer compte client
function CreerClientModal({ lead, onClose, onSuccess }: {
  lead: Lead;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleCreer() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/creer-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          email: lead.email,
          nomEtablissement: lead.nom_etablissement,
          secteur: lead.secteur,
          superficie: lead.superficie,
          prixEstime: lead.prixEstime,
          formule: lead.formuleSuggeree,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error ?? "Erreur");
      setDone(true);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ width: "100%", maxWidth: 440, borderRadius: 20, padding: 24, background: "#122B1E", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "white", margin: 0 }}>Créer compte client</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "4px 0 0" }}>
              Crée l&apos;accès dashboard + envoie email bienvenue
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>

        {done ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <CheckCircle size={40} style={{ color: "#10B981", display: "block", margin: "0 auto 12px" }} />
            <p style={{ color: "white", fontWeight: 600, fontSize: 15 }}>Compte créé !</p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 8 }}>
              Email de bienvenue envoyé à {lead.email}
            </p>
            <button
              onClick={onClose}
              style={{ marginTop: 20, padding: "8px 24px", borderRadius: 12, background: "#10B981", color: "white", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13 }}
            >
              Fermer
            </button>
          </div>
        ) : (
          <>
            <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                ["Client", lead.email],
                ["Établissement", lead.nom_etablissement ?? "—"],
                ["Formule", lead.formuleSuggeree === "serenite" ? "Sérénité" : "Essentiel"],
                ["Montant", `${lead.prixEstime.toLocaleString("fr-FR")} €/an HT`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{v}</span>
                </div>
              ))}
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: "#FCA5A5", display: "flex", alignItems: "center", gap: 6 }}>
                <AlertCircle size={13} /> {error}
              </div>
            )}

            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <Mail size={12} style={{ color: "#60A5FA", flexShrink: 0 }} />
              Un email d&apos;invitation sera envoyé à cette adresse.
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={onClose}
                style={{ flex: 1, padding: "10px", borderRadius: 12, background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500 }}
              >
                Annuler
              </button>
              <button
                onClick={handleCreer}
                disabled={loading}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 12, background: "#10B981", color: "white", border: "none", cursor: loading ? "default" : "pointer", fontSize: 13, fontWeight: 600, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                {loading ? "Création…" : "Créer le compte"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("tous");
  const [creerClientLead, setCreerClientLead] = useState<Lead | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/leads");
        if (res.ok) {
          const data: Lead[] = await res.json();
          setLeads(data);
        } else {
          setLeads([]);
        }
      } catch {
        setLeads([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function updateStatut(id: string, statut: LeadStatut) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, statut } : l));
    try {
      await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, statut }),
      });
    } catch { /* non-blocking */ }
  }

  const filtered = filter === "tous" ? leads : leads.filter(l => l.statut === filter);

  // Stats
  const totalLeads = leads.length;
  const cetteSemanine = leads.filter(l => {
    const d = new Date(l.createdAt);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;
  const nbSignes = leads.filter(l => l.statut === "signé").length;
  const tauxConversion = totalLeads > 0 ? Math.round((nbSignes / totalLeads) * 100) : 0;
  const arrSigne = leads.filter(l => l.statut === "signé").reduce((acc, l) => acc + l.prixEstime, 0);

  return (
    <div style={{ padding: 20, minHeight: "100vh", background: "#0D1F17" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: "#10B981", color: "white", padding: "12px 20px", borderRadius: 12,
          fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <CheckCircle size={15} /> {toast}
        </div>
      )}

      {creerClientLead && (
        <CreerClientModal
          lead={creerClientLead}
          onClose={() => setCreerClientLead(null)}
          onSuccess={() => {
            updateStatut(creerClientLead.id, "signé");
            setCreerClientLead(null);
            showToast("Compte client créé, invitation envoyée");
          }}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "white", margin: "0 0 4px" }}>Leads & clients</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>
          Prospects capturés via le tunnel tarifaire
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total leads",       value: totalLeads,                                 icon: Target,     color: "#10B981" },
          { label: "Cette semaine",     value: cetteSemanine,                              icon: TrendingUp, color: "#60A5FA" },
          { label: "Taux conversion",   value: `${tauxConversion}%`,                       icon: CheckCircle,color: "#F59E0B" },
          { label: "ARR signé",         value: `${arrSigne.toLocaleString("fr-FR")} €`,    icon: Euro,       color: "#A78BFA" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "monospace", margin: 0 }}>
                {label}
              </p>
              <Icon size={13} style={{ color }} />
            </div>
            <p style={{ fontSize: 22, fontWeight: 700, color, margin: 0, fontFamily: "monospace" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {(["tous", ...STATUT_OPTIONS.map(s => s.key)] as const).map(key => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
              border: "none", cursor: "pointer",
              background: filter === key ? "#F26522" : "rgba(255,255,255,0.07)",
              color: filter === key ? "white" : "rgba(255,255,255,0.55)",
            }}
          >
            {key === "tous" ? "Tous" : getStatutConfig(key).label}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", display: "flex", alignItems: "center" }}>
          {filtered.length} lead{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tableau */}
      <div style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "white", margin: 0 }}>Pipeline commercial</h2>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", margin: 0 }}>triés par date ↓</p>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
            <Loader2 size={24} className="animate-spin" style={{ display: "inline-block" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
            Aucun lead dans cette catégorie.
          </div>
        ) : (
          <div>
            {filtered.map((lead, i) => {
              const secteurInfo = SECTEUR_MAP[lead.secteur] ?? { label: lead.secteur, color: "#94A3B8", bg: "rgba(148,163,184,0.15)" };
              const statutCfg = getStatutConfig(lead.statut);

              return (
                <div
                  key={lead.id}
                  style={{
                    padding: "16px 20px",
                    borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                    {/* Icône */}
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Mail size={14} style={{ color: "#60A5FA" }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "white" }}>{lead.email}</span>
                        {lead.nom_etablissement && (
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>· {lead.nom_etablissement}</span>
                        )}
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "monospace", marginLeft: "auto" }}>
                          {relativeDate(lead.createdAt)}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: secteurInfo.bg, color: secteurInfo.color, fontWeight: 500 }}>
                          {secteurInfo.label}
                        </span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                          {lead.superficie?.toLocaleString("fr-FR")} m²
                        </span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                          {FREQ_MAP[lead.frequence as number] ?? `${lead.frequence}×/an`}
                        </span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                          Curatives {lead.curatives ? "incluses" : "à part"}
                        </span>
                      </div>
                    </div>

                    {/* Prix + formule */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "white", margin: 0, fontFamily: "monospace" }}>
                        {lead.prixEstime.toLocaleString("fr-FR")} €/an
                      </p>
                      <span style={{
                        display: "inline-block", marginTop: 4,
                        fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                        background: lead.formuleSuggeree === "serenite" ? "rgba(96,165,250,0.15)" : "rgba(255,255,255,0.07)",
                        color: lead.formuleSuggeree === "serenite" ? "#60A5FA" : "rgba(255,255,255,0.5)",
                      }}>
                        {lead.formuleSuggeree === "serenite" ? "Sérénité" : "Essentiel"}
                      </span>
                    </div>
                  </div>

                  {/* Actions — statut + boutons */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, paddingLeft: 50, flexWrap: "wrap" }}>
                    {/* Dropdown statut */}
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Statut :</span>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {STATUT_OPTIONS.map(opt => (
                        <button
                          key={opt.key}
                          onClick={() => updateStatut(lead.id, opt.key)}
                          style={{
                            padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                            border: `1px solid ${lead.statut === opt.key ? opt.color + "60" : "rgba(255,255,255,0.08)"}`,
                            background: lead.statut === opt.key ? opt.bg : "rgba(255,255,255,0.04)",
                            color: lead.statut === opt.key ? opt.color : "rgba(255,255,255,0.3)",
                            cursor: "pointer",
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    <div style={{ flex: 1 }} />

                    {/* Contacter */}
                    <a
                      href={`mailto:${lead.email}?subject=Votre demande Noxyera&body=Bonjour,%0A%0A`}
                      style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "5px 12px", borderRadius: 10, fontSize: 11, fontWeight: 600,
                        background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)",
                        border: "1px solid rgba(255,255,255,0.1)", textDecoration: "none",
                      }}
                    >
                      <Mail size={11} /> Contacter
                    </a>

                    {/* Créer compte client (visible si signé ou devis envoyé) */}
                    {(lead.statut === "signé" || lead.statut === "devis_envoyé") && (
                      <button
                        onClick={() => setCreerClientLead(lead)}
                        style={{
                          display: "flex", alignItems: "center", gap: 5,
                          padding: "5px 12px", borderRadius: 10, fontSize: 11, fontWeight: 600,
                          background: "rgba(16,185,129,0.15)", color: "#10B981",
                          border: "1px solid rgba(16,185,129,0.25)", cursor: "pointer",
                        }}
                      >
                        <UserPlus size={11} /> Créer compte client
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ padding: "10px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
          Leads enregistrés depuis le tunnel estimateur landing page
        </div>
      </div>
    </div>
  );
}
