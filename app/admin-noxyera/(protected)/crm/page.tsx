"use client";

import { useState, useEffect } from "react";
import { Kanban, Loader2, ArrowRight, User, MapPin, Mail, Calendar } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Lead {
  id: string;
  email: string | null;
  nom_etablissement: string | null;
  secteur: string | null;
  created_at: string;
  statut: string | null;
}

interface Candidature {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  ville: string;
  certifications: string[] | null;
  statut: string;
  created_at: string;
}

interface CRMData {
  leads: Lead[];
  candidatures: Candidature[];
  profiles_techniciens: Array<{
    id: string;
    prenom: string | null;
    nom: string | null;
    email: string | null;
    ville: string | null;
    certifications: string[] | null;
    disponibilite: string | null;
  }>;
}

// ── Pipeline config ───────────────────────────────────────────────────────────

const CLIENT_PIPELINE = [
  { key: "nouveau",      label: "Prospect",         color: "#94A3B8" },
  { key: "contacté",     label: "En discussion",     color: "#F59E0B" },
  { key: "audit planifié", label: "Audit planifié",  color: "#60A5FA" },
  { key: "signé",        label: "Client actif",      color: "#10B981" },
  { key: "perdu",        label: "Perdu",             color: "#EF4444" },
];

const TECH_PIPELINE = [
  { key: "nouveau",    label: "Candidature reçue", color: "#94A3B8" },
  { key: "entretien",  label: "Entretien",         color: "#F59E0B" },
  { key: "accepté",    label: "Validé",            color: "#10B981" },
  { key: "refusé",     label: "Refusé",            color: "#EF4444" },
];

function relDate(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return "aujourd'hui";
  if (d === 1) return "hier";
  return `il y a ${d}j`;
}

// ── Column component ──────────────────────────────────────────────────────────

function PipelineColumn({
  stage,
  items,
}: {
  stage: { key: string; label: string; color: string };
  items: React.ReactNode[];
}) {
  return (
    <div style={{ flex: "0 0 220px", minWidth: 220 }}>
      {/* Column header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
        padding: "8px 12px", borderRadius: 10,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: stage.color, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{stage.label}</span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
          {items.length}
        </span>
      </div>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 80 }}>
        {items.length === 0 ? (
          <div style={{
            padding: "16px 12px", borderRadius: 10, textAlign: "center",
            border: "1px dashed rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.2)",
            fontSize: 12,
          }}>
            Aucun
          </div>
        ) : items}
      </div>
    </div>
  );
}

// ── Lead card ─────────────────────────────────────────────────────────────────

function LeadCard({
  lead,
  onAdvance,
  advancing,
  currentPipelineIndex,
}: {
  lead: Lead;
  onAdvance: () => void;
  advancing: boolean;
  currentPipelineIndex: number;
}) {
  const isLast = currentPipelineIndex >= CLIENT_PIPELINE.length - 1;
  return (
    <div style={{
      background: "#122B1E", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10, padding: "12px 14px",
    }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: "white", margin: "0 0 4px" }}>
        {lead.nom_etablissement ?? "—"}
      </p>
      {lead.secteur && (
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{lead.secteur}</span>
      )}
      <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
        {lead.email && (
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", gap: 4 }}>
            <Mail size={9} /> {lead.email}
          </span>
        )}
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: 4 }}>
          <Calendar size={9} /> {relDate(lead.created_at)}
        </span>
      </div>
      {!isLast && (
        <button
          onClick={onAdvance}
          disabled={advancing}
          style={{
            marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            width: "100%", padding: "6px 0", borderRadius: 8,
            background: "rgba(242,101,34,0.12)", color: "#F26522",
            border: "1px solid rgba(242,101,34,0.25)",
            fontSize: 11, fontWeight: 600, cursor: advancing ? "default" : "pointer",
            opacity: advancing ? 0.6 : 1,
          }}
        >
          {advancing ? <Loader2 size={11} className="animate-spin" /> : <ArrowRight size={11} />}
          Étape suivante
        </button>
      )}
    </div>
  );
}

// ── Candidature card ──────────────────────────────────────────────────────────

function CandidatureCard({
  c,
  onAdvance,
  advancing,
  currentPipelineIndex,
}: {
  c: Candidature;
  onAdvance: () => void;
  advancing: boolean;
  currentPipelineIndex: number;
}) {
  const isLast = currentPipelineIndex >= TECH_PIPELINE.length - 1;
  return (
    <div style={{
      background: "#122B1E", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10, padding: "12px 14px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: "rgba(242,101,34,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: "#F26522", flexShrink: 0,
        }}>
          {c.prenom[0]}{c.nom[0]}
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "white", margin: 0 }}>
            {c.prenom} {c.nom}
          </p>
          {c.ville && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 3 }}>
              <MapPin size={9} /> {c.ville}
            </span>
          )}
        </div>
      </div>
      {(c.certifications ?? []).length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
          {(c.certifications ?? []).slice(0, 3).map(cert => (
            <span key={cert} style={{
              fontSize: 10, padding: "1px 6px", borderRadius: 4,
              background: "rgba(96,165,250,0.1)", color: "#60A5FA",
            }}>
              {cert}
            </span>
          ))}
        </div>
      )}
      {!isLast && (
        <button
          onClick={onAdvance}
          disabled={advancing}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
            width: "100%", padding: "6px 0", borderRadius: 8,
            background: "rgba(242,101,34,0.12)", color: "#F26522",
            border: "1px solid rgba(242,101,34,0.25)",
            fontSize: 11, fontWeight: 600, cursor: advancing ? "default" : "pointer",
            opacity: advancing ? 0.6 : 1,
          }}
        >
          {advancing ? <Loader2 size={11} className="animate-spin" /> : <ArrowRight size={11} />}
          Étape suivante
        </button>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminCRMPage() {
  const [data, setData] = useState<CRMData | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/crm")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function advanceLead(lead: Lead) {
    const idx = CLIENT_PIPELINE.findIndex(s => s.key === (lead.statut ?? "nouveau"));
    if (idx < 0 || idx >= CLIENT_PIPELINE.length - 1) return;
    const nextStatut = CLIENT_PIPELINE[idx + 1].key;
    setAdvancing(lead.id);
    try {
      await fetch("/api/admin/crm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: lead.id, type: "lead", statut: nextStatut }),
      });
      setData(prev => prev ? {
        ...prev,
        leads: prev.leads.map(l => l.id === lead.id ? { ...l, statut: nextStatut } : l),
      } : prev);
    } finally {
      setAdvancing(null);
    }
  }

  async function advanceCandidature(c: Candidature) {
    const idx = TECH_PIPELINE.findIndex(s => s.key === c.statut);
    if (idx < 0 || idx >= TECH_PIPELINE.length - 1) return;
    const nextStatut = TECH_PIPELINE[idx + 1].key;
    setAdvancing(c.id);
    try {
      await fetch("/api/admin/crm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: c.id, type: "candidature", statut: nextStatut }),
      });
      setData(prev => prev ? {
        ...prev,
        candidatures: prev.candidatures.map(x => x.id === c.id ? { ...x, statut: nextStatut } : x),
      } : prev);
    } finally {
      setAdvancing(null);
    }
  }

  return (
    <div style={{ padding: 20, minHeight: "100vh", background: "#0D1F17" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <Kanban size={20} style={{ color: "#F26522" }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "white", margin: 0 }}>
            CRM Pipeline
          </h1>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>
          Vue Kanban des prospects clients et candidats techniciens
        </p>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
          <Loader2 size={28} className="animate-spin" style={{ display: "inline-block" }} />
        </div>
      ) : (
        <>
          {/* ── Section 1: Pipeline Clients ── */}
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "white", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F26522", display: "inline-block" }} />
              Pipeline Clients
            </h2>
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
              {CLIENT_PIPELINE.map(stage => {
                const items = (data?.leads ?? []).filter(l => (l.statut ?? "nouveau") === stage.key);
                return (
                  <PipelineColumn key={stage.key} stage={stage} items={items.map(lead => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onAdvance={() => advanceLead(lead)}
                      advancing={advancing === lead.id}
                      currentPipelineIndex={CLIENT_PIPELINE.findIndex(s => s.key === (lead.statut ?? "nouveau"))}
                    />
                  ))} />
                );
              })}
            </div>
          </div>

          {/* ── Section 2: Pipeline Techniciens ── */}
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "white", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#60A5FA", display: "inline-block" }} />
              Pipeline Techniciens
            </h2>
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
              {TECH_PIPELINE.map(stage => {
                const items = (data?.candidatures ?? []).filter(c => c.statut === stage.key);
                return (
                  <PipelineColumn key={stage.key} stage={stage} items={items.map(c => (
                    <CandidatureCard
                      key={c.id}
                      c={c}
                      onAdvance={() => advanceCandidature(c)}
                      advancing={advancing === c.id}
                      currentPipelineIndex={TECH_PIPELINE.findIndex(s => s.key === c.statut)}
                    />
                  ))} />
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
