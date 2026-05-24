"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, MapPin, User, Calendar, Check, ChevronDown, Send, X } from "lucide-react";

type AuditStatut = "nouveau" | "technicien assigné" | "audit planifié" | "devis envoyé" | "signé";

interface Audit {
  id: string;
  created_at: string;
  nom_etablissement: string;
  adresse: string;
  secteur: string;
  superficie: number | null;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  creneaux: string[] | null;
  jours: string[] | null;
  zones_sensibles: string[] | null;
  historique_nuisibles: string | null;
  prestataire_actuel: boolean | null;
  rapports_a_jour: string | null;
  statut: AuditStatut;
  technicien_id: string | null;
  date_audit_prevue: string | null;
  notes_internes: string | null;
}

interface Technicien {
  id: string
  prenom: string
  nom: string
  email: string
  ville: string | null
  disponibilite: string | null
  certifications: string[] | null
}

const STATUT_CFG: Record<string, { label: string; color: string; bg: string }> = {
  "nouveau":            { label: "Nouveau",            color: "#94A3B8", bg: "rgba(148,163,184,0.15)" },
  "technicien assigné": { label: "Tech. assigné",      color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  "audit planifié":     { label: "Planifié",           color: "#60A5FA", bg: "rgba(96,165,250,0.15)" },
  "proposé":            { label: "Proposé",            color: "#F26522", bg: "rgba(242,101,34,0.15)" },
  "devis envoyé":       { label: "Devis envoyé",       color: "#A78BFA", bg: "rgba(167,139,250,0.15)" },
  "signé":              { label: "Signé ✓",            color: "#10B981", bg: "rgba(16,185,129,0.15)" },
};

const STATUT_OPTIONS: AuditStatut[] = ["nouveau", "technicien assigné", "audit planifié", "devis envoyé", "signé"];

const SECTEUR_LABELS: Record<string, string> = {
  restaurant: "Restaurant", hotel: "Hôtellerie",
  entrepot: "Entrepôt", agroalimentaire: "Agroalimentaire",
  immeuble: "Immeuble", bureau: "Bureau",
};

// Demo data fallback
const DEMO_AUDITS: Audit[] = [
  {
    id: "a1", created_at: "2026-05-21T09:30:00Z",
    nom_etablissement: "Brasserie du Marché", adresse: "12 place du Marché, 69001 Lyon",
    secteur: "restaurant", superficie: 180,
    prenom: "Marie", nom: "Lambert", email: "m.lambert@brasserie-marche.fr", telephone: "06 11 22 33 44",
    creneaux: ["Matin (8h-12h)", "Après-midi (14h-18h)"], jours: ["Lundi", "Mercredi", "Vendredi"],
    zones_sensibles: ["Cuisine", "Cave", "Poubelles"],
    historique_nuisibles: "oui_recent", prestataire_actuel: false, rapports_a_jour: "non",
    statut: "nouveau", technicien_id: null, date_audit_prevue: null, notes_internes: null,
  },
  {
    id: "a2", created_at: "2026-05-20T14:15:00Z",
    nom_etablissement: "Hôtel Belmont", adresse: "8 rue de Rivoli, 75001 Paris",
    secteur: "hotel", superficie: 450,
    prenom: "Thomas", nom: "Vidal", email: "t.vidal@hotel-belmont.com", telephone: "07 55 66 77 88",
    creneaux: ["Matin (8h-12h)"], jours: ["Mardi", "Jeudi"],
    zones_sensibles: ["Cuisine", "Réserves", "Livraisons"],
    historique_nuisibles: "oui_ancien", prestataire_actuel: true, rapports_a_jour: "partiellement",
    statut: "technicien assigné", technicien_id: "t1", date_audit_prevue: null, notes_internes: "Ancien prestataire Anticimex",
  },
];

// ── Proposer Mission Panel ──────────────────────────────────────────────────
function ProposerMissionPanel({
  audit,
  techniciens,
  onClose,
  onSuccess,
}: {
  audit: Audit
  techniciens: Technicien[]
  onClose: () => void
  onSuccess: (prenom: string) => void
}) {
  const [selected, setSelected] = useState<string>("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function handleProposer() {
    if (!selected) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/audits/${audit.id}/proposer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ technicienId: selected }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) throw new Error(data.error ?? "Erreur")
      onSuccess(data.prenomTech ?? "le technicien")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue")
    } finally {
      setLoading(false)
    }
  }

  const DISPO_LABELS: Record<string, string> = {
    "temps-plein":   "Temps plein",
    "temps-partiel": "Temps partiel",
    "week-ends":     "Week-ends",
    "flexible":      "Flexible",
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ width: "100%", maxWidth: 460, borderRadius: 20, background: "#122B1E", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "white", margin: 0 }}>Proposer une mission</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "4px 0 0" }}>
              {audit.nom_etablissement} · {SECTEUR_LABELS[audit.secteur] ?? audit.secteur}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={16} style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>

        {/* Techniciens list */}
        <div style={{ maxHeight: 320, overflowY: "auto", padding: "12px 16px" }}>
          {techniciens.length === 0 ? (
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "20px 0" }}>
              Aucun technicien disponible
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {techniciens.map(tech => {
                const isSelected = selected === tech.id
                return (
                  <button
                    key={tech.id}
                    onClick={() => setSelected(tech.id)}
                    style={{
                      padding: "12px 14px", borderRadius: 12, textAlign: "left", cursor: "pointer",
                      background: isSelected ? "rgba(242,101,34,0.15)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${isSelected ? "rgba(242,101,34,0.4)" : "rgba(255,255,255,0.07)"}`,
                      display: "flex", alignItems: "center", gap: 12,
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: isSelected ? "rgba(242,101,34,0.2)" : "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: isSelected ? "#F26522" : "rgba(255,255,255,0.6)", flexShrink: 0 }}>
                      {(tech.prenom?.[0] ?? "")}{(tech.nom?.[0] ?? "")}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "white", margin: 0 }}>{tech.prenom} {tech.nom}</p>
                      <div style={{ display: "flex", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                        {tech.ville && (
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 3 }}>
                            <MapPin size={9} /> {tech.ville}
                          </span>
                        )}
                        {tech.disponibilite && (
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                            {DISPO_LABELS[tech.disponibilite] ?? tech.disponibilite}
                          </span>
                        )}
                        {(tech.certifications ?? []).map(c => (
                          <span key={c} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "rgba(96,165,250,0.12)", color: "#60A5FA" }}>{c}</span>
                        ))}
                      </div>
                    </div>
                    {isSelected && <Check size={14} style={{ color: "#F26522", flexShrink: 0 }} />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 16px 16px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {error && (
            <p style={{ fontSize: 12, color: "#FCA5A5", marginBottom: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "8px 12px" }}>
              {error}
            </p>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 12, background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
              Annuler
            </button>
            <button
              onClick={handleProposer}
              disabled={!selected || loading}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px", borderRadius: 12, background: !selected ? "rgba(255,255,255,0.07)" : "#F26522", color: !selected ? "rgba(255,255,255,0.3)" : "white", border: "none", cursor: !selected || loading ? "default" : "pointer", fontSize: 13, fontWeight: 600, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {loading ? "Envoi…" : "Proposer à ce technicien"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function relDate(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return "aujourd'hui";
  if (d === 1) return "hier";
  return `il y a ${d}j`;
}

export default function AdminAuditsPage() {
  const [audits, setAudits]           = useState<Audit[]>([]);
  const [techniciens, setTechniciens] = useState<Technicien[]>([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState<string>("a-traiter");
  const [search, setSearch]           = useState("");
  const [saving, setSaving]           = useState<string | null>(null);
  const [toast, setToast]             = useState<string | null>(null);
  const [proposerTarget, setProposerTarget] = useState<Audit | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  // Inline edit state per audit
  const [edits, setEdits] = useState<Record<string, { technicien_id?: string; date?: string; notes?: string }>>({});

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/audits");
        if (res.ok) {
          const data = await res.json();
          setAudits(data.audits ?? []);
          setTechniciens(data.techniciens ?? []);
        } else {
          setAudits([]);
        }
      } catch {
        setAudits([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function setEdit(id: string, k: string, v: string) {
    setEdits(prev => ({ ...prev, [id]: { ...(prev[id] ?? {}), [k]: v } }));
  }

  async function handleConfirm(audit: Audit) {
    const edit = edits[audit.id] ?? {};
    const techId = edit.technicien_id ?? audit.technicien_id;
    const date   = edit.date ?? audit.date_audit_prevue;

    setSaving(audit.id);
    try {
      await fetch("/api/admin/audits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id:                audit.id,
          statut:            date ? "audit planifié" : "technicien assigné",
          technicien_id:     techId ?? null,
          date_audit_prevue: date ?? null,
          notes_internes:    edit.notes ?? audit.notes_internes,
        }),
      });
      setAudits(prev => prev.map(a => a.id === audit.id ? {
        ...a,
        statut:            date ? "audit planifié" as AuditStatut : "technicien assigné" as AuditStatut,
        technicien_id:     techId ?? a.technicien_id,
        date_audit_prevue: date ?? a.date_audit_prevue,
        notes_internes:    edit.notes ?? a.notes_internes,
      } : a));
      const msg = date ? "Audit planifié · Emails envoyés au client et au technicien ✓" : "Technicien assigné ✓";
      showToast(msg);
    } finally {
      setSaving(null);
    }
  }

  async function updateStatut(id: string, statut: AuditStatut) {
    setAudits(prev => prev.map(a => a.id === id ? { ...a, statut } : a));
    await fetch("/api/admin/audits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, statut }),
    });
  }

  const A_TRAITER   = ["nouveau", "technicien assigné", "en_cours", "reçu"];
  const CONFIRMES   = ["audit planifié", "planifié", "proposé", "confirmé"];
  const TERMINES    = ["réalisé", "terminé", "devis envoyé", "signé"];

  const filtered = audits
    .filter(a => {
      if (filter === "a-traiter") return A_TRAITER.includes(a.statut);
      if (filter === "confirmes") return CONFIRMES.includes(a.statut);
      if (filter === "termines")  return TERMINES.includes(a.statut);
      return true;
    })
    .filter(a => !search || a.nom_etablissement.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()));

  const counts = {
    "a-traiter": audits.filter(a => A_TRAITER.includes(a.statut)).length,
    "confirmes":  audits.filter(a => CONFIRMES.includes(a.statut)).length,
    "termines":   audits.filter(a => TERMINES.includes(a.statut)).length,
    tous: audits.length,
  };

  return (
    <div style={{ padding: 20, minHeight: "100vh", background: "#0D1F17" }}>
      {/* Proposer Mission Panel */}
      {proposerTarget && (
        <ProposerMissionPanel
          audit={proposerTarget}
          techniciens={techniciens}
          onClose={() => setProposerTarget(null)}
          onSuccess={(prenom) => {
            setAudits(prev => prev.map(a => a.id === proposerTarget.id ? { ...a, statut: "proposé" as AuditStatut } : a));
            setProposerTarget(null);
            showToast(`Offre envoyée à ${prenom} ✓`);
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: "#1B3A2D", color: "white", padding: "12px 20px", borderRadius: 12,
          fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <Check size={15} /> {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "white", margin: "0 0 4px" }}>Demandes d&apos;audit</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>Prospects ayant demandé un audit gratuit</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total",      value: audits.length },
          { label: "À traiter",  value: counts["a-traiter"] ?? 0 },
          { label: "Confirmés",  value: counts["confirmes"] ?? 0 },
          { label: "Terminés",   value: counts["termines"] ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px 20px" }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px", fontFamily: "monospace" }}>{label}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: "#10B981", margin: 0, fontFamily: "monospace" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters + search */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "0 0 220px" }}>
          <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
          <input
            placeholder="Rechercher…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "white", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" }}
          />
        </div>
        {([
          { key: "a-traiter", label: "À traiter" },
          { key: "confirmes",  label: "Confirmés" },
          { key: "termines",   label: "Terminés" },
        ]).map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", background: filter === key ? "#F26522" : "rgba(255,255,255,0.07)", color: filter === key ? "white" : "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: 5 }}>
            {label} ({counts[key as keyof typeof counts] ?? 0})
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
            <Loader2 size={24} className="animate-spin" style={{ display: "inline-block" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
            Aucune demande trouvée.
          </div>
        ) : (
          <div>
            {filtered.map((audit, i) => {
              const statut = STATUT_CFG[audit.statut] ?? STATUT_CFG["nouveau"];
              const edit   = edits[audit.id] ?? {};
              const assignedTech = techniciens.find(t => t.id === (edit.technicien_id ?? audit.technicien_id));

              return (
                <div key={audit.id} style={{ padding: "18px 20px", borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                  {/* Ligne principale */}
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    {/* Avatar */}
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: "#1B3A2D", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 15, fontWeight: 700, color: "#F26522" }}>
                      {audit.nom_etablissement[0]}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "white" }}>{audit.nom_etablissement}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: statut.bg, color: statut.color }}>{statut.label}</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "monospace", marginLeft: "auto" }}>{relDate(audit.created_at)}</span>
                      </div>

                      <div style={{ display: "flex", gap: 12, marginTop: 5, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", gap: 4 }}>
                          <MapPin size={11} /> {audit.adresse}
                        </span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>·</span>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{SECTEUR_LABELS[audit.secteur] ?? audit.secteur}</span>
                        {audit.superficie && <><span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>·</span><span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{audit.superficie} m²</span></>}
                      </div>

                      <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: 4 }}>
                          <User size={11} /> {audit.prenom} {audit.nom} · {audit.email} · {audit.telephone}
                        </span>
                      </div>

                      {(audit.creneaux?.length || audit.jours?.length) ? (
                        <div style={{ marginTop: 4 }}>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                            📅 {[...(audit.creneaux ?? []), ...(audit.jours ?? [])].join(" · ")}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Panneau d'assignation */}
                  <div style={{ marginTop: 14, paddingLeft: 54, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                    {/* Dropdown technicien */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 200 }}>
                      <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Technicien</label>
                      <div style={{ position: "relative" }}>
                        <select
                          value={edit.technicien_id ?? audit.technicien_id ?? ""}
                          onChange={e => setEdit(audit.id, "technicien_id", e.target.value)}
                          style={{ appearance: "none", paddingRight: 30, padding: "8px 30px 8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "white", fontSize: 12, outline: "none", cursor: "pointer", width: "100%" }}
                        >
                          <option value="">— Non assigné —</option>
                          {techniciens.map(t => (
                            <option key={t.id} value={t.id}>{t.prenom} {t.nom}</option>
                          ))}
                          {/* Demo fallback */}
                          {techniciens.length === 0 && (
                            <option value="demo-tech">Jean Martin (démo)</option>
                          )}
                        </select>
                        <ChevronDown size={12} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", pointerEvents: "none" }} />
                      </div>
                    </div>

                    {/* Date picker */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Date prévue</label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={edit.date ?? (audit.date_audit_prevue ? audit.date_audit_prevue.slice(0, 10) : "")}
                        onChange={e => setEdit(audit.id, "date", e.target.value)}
                        style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "white", fontSize: 12, outline: "none" }}
                      />
                    </div>

                    {/* Bouton confirmer */}
                    <button
                      onClick={() => handleConfirm(audit)}
                      disabled={saving === audit.id}
                      style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "#F26522", color: "white", border: "none", cursor: saving === audit.id ? "default" : "pointer", fontWeight: 600, fontSize: 12, opacity: saving === audit.id ? 0.7 : 1 }}
                    >
                      {saving === audit.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                      Confirmer et notifier
                    </button>

                    {/* Dropdown statut */}
                    <div style={{ position: "relative" }}>
                      <select
                        value={audit.statut}
                        onChange={e => updateStatut(audit.id, e.target.value as AuditStatut)}
                        style={{ appearance: "none", padding: "8px 28px 8px 12px", borderRadius: 8, border: `1px solid ${statut.color}40`, background: statut.bg, color: statut.color, fontSize: 12, fontWeight: 600, outline: "none", cursor: "pointer" }}
                      >
                        {STATUT_OPTIONS.map(s => (
                          <option key={s} value={s}>{STATUT_CFG[s]?.label ?? s}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: statut.color, pointerEvents: "none" }} />
                    </div>

                    {/* Proposer une mission — visible si audit planifié */}
                    {audit.statut === "audit planifié" && (
                      <button
                        onClick={() => setProposerTarget(audit)}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "rgba(242,101,34,0.15)", color: "#F26522", border: "1px solid rgba(242,101,34,0.3)", cursor: "pointer", fontWeight: 600, fontSize: 12 }}
                      >
                        <Send size={12} /> Proposer une mission
                      </button>
                    )}

                    {assignedTech && (
                      <span style={{ fontSize: 11, color: "#10B981", display: "flex", alignItems: "center", gap: 4 }}>
                        <Check size={11} /> {assignedTech.prenom} {assignedTech.nom}
                      </span>
                    )}
                  </div>

                  {/* Notes internes */}
                  <div style={{ marginTop: 10, paddingLeft: 54 }}>
                    <input
                      placeholder="Notes internes…"
                      value={edit.notes ?? audit.notes_internes ?? ""}
                      onChange={e => setEdit(audit.id, "notes", e.target.value)}
                      style={{ width: "100%", maxWidth: 500, boxSizing: "border-box", padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.6)", fontSize: 12, outline: "none" }}
                    />
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
