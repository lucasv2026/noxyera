"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ClipboardList, Mail, Check, X, Loader2, Phone, MapPin, Star } from "lucide-react";

type Candidature = {
  id: string;
  created_at: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  ville: string;
  code_postal: string;
  experience: string;
  certifications: string[] | null;
  vehicule: boolean;
  disponibilite: string;
  motivation: string | null;
  statut: string;
};

const STATUT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  nouveau:   { label: "Nouveau",  color: "#94A3B8", bg: "rgba(148,163,184,0.15)" },
  contacté:  { label: "Contacté", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  entretien: { label: "Entretien",color: "#60A5FA", bg: "rgba(96,165,250,0.15)" },
  accepté:   { label: "Accepté",  color: "#10B981", bg: "rgba(16,185,129,0.15)" },
  refusé:    { label: "Refusé",   color: "#EF4444", bg: "rgba(239,68,68,0.15)" },
};

const EXPERIENCE_MAP: Record<string, string> = {
  "0-1an":  "< 1 an",
  "1-3ans": "1 à 3 ans",
  "3-5ans": "3 à 5 ans",
  "5ans+":  "5 ans +",
};

const DISPO_MAP: Record<string, string> = {
  "temps-plein":  "Temps plein",
  "temps-partiel":"Temps partiel",
  "week-ends":    "Week-ends",
  "flexible":     "Flexible",
};

// Données démo pour fallback
const DEMO_CANDIDATURES: Candidature[] = [
  {
    id: "c1", created_at: "2026-05-20T09:15:00Z",
    prenom: "Julien", nom: "Maréchal", email: "julien.marechal@gmail.com",
    telephone: "06 12 34 56 78", ville: "Lyon", code_postal: "69003",
    experience: "3-5ans", certifications: ["certiphyto", "biocides"], vehicule: true,
    disponibilite: "temps-plein", motivation: "Passionné par le domaine sanitaire, cherche à rejoindre une structure innovante.",
    statut: "nouveau",
  },
  {
    id: "c2", created_at: "2026-05-19T14:32:00Z",
    prenom: "Sophie", nom: "Bertrand", email: "s.bertrand@outlook.fr",
    telephone: "07 89 01 23 45", ville: "Paris", code_postal: "75011",
    experience: "1-3ans", certifications: ["haccp"], vehicule: false,
    disponibilite: "temps-partiel", motivation: null,
    statut: "contacté",
  },
  {
    id: "c3", created_at: "2026-05-18T11:00:00Z",
    prenom: "Marc", nom: "Dupuis", email: "marc.dupuis@wanadoo.fr",
    telephone: "06 55 44 33 22", ville: "Marseille", code_postal: "13008",
    experience: "5ans+", certifications: ["certiphyto", "haccp", "biocides"], vehicule: true,
    disponibilite: "flexible", motivation: "10 ans d'expérience en désinsectisation industrielle.",
    statut: "entretien",
  },
];

function relDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "aujourd'hui";
  if (d === 1) return "hier";
  return `il y a ${d}j`;
}

export default function AdminCandidaturesPage() {
  const [candidatures, setCandidatures] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("tous");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/candidatures");
        if (res.ok) {
          const data = await res.json();
          setCandidatures(data);
        } else {
          setCandidatures([]);
        }
      } catch {
        setCandidatures([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function updateStatut(id: string, statut: string) {
    setActionLoading(id + statut);
    try {
      await fetch("/api/admin/candidatures", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, statut }),
      });
      setCandidatures(prev => prev.map(c => c.id === id ? { ...c, statut } : c));
    } finally {
      setActionLoading(null);
    }
  }

  async function validerTechnicien(c: Candidature) {
    setActionLoading(c.id + "valider");
    try {
      const res = await fetch("/api/admin/valider-technicien", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidatureId: c.id, email: c.email, prenom: c.prenom, nom: c.nom }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setCandidatures(prev => prev.map(x => x.id === c.id ? { ...x, statut: "accepté" } : x));
        showToast(`Invitation envoyée à ${c.prenom} ${c.nom}`, "success");
      } else {
        showToast(data.error ?? "Erreur lors de la validation", "error");
      }
    } catch {
      showToast("Erreur réseau", "error");
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = filter === "tous" ? candidatures : candidatures.filter(c => c.statut === filter);
  const counts = {
    tous: candidatures.length,
    nouveau: candidatures.filter(c => c.statut === "nouveau").length,
    contacté: candidatures.filter(c => c.statut === "contacté").length,
    entretien: candidatures.filter(c => c.statut === "entretien").length,
    accepté: candidatures.filter(c => c.statut === "accepté").length,
    refusé: candidatures.filter(c => c.statut === "refusé").length,
  };

  return (
    <div style={{ padding: 20, minHeight: "100vh", background: "#0D1F17" }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: toast.type === "success" ? "#1B3A2D" : "#EF4444",
          color: "white", padding: "12px 20px", borderRadius: 12,
          fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", gap: 8,
          animation: "slideIn 0.2s ease",
        }}>
          {toast.type === "success" ? <Check size={15} /> : <X size={15} />}
          {toast.message}
        </div>
      )}
      <style>{`@keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <ClipboardList size={20} style={{ color: "#F26522" }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "white", margin: 0 }}>
            Candidatures techniciens
          </h1>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>
          Candidatures reçues via la page /techniciens
        </p>
      </div>

      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total", value: counts.tous, color: "#60A5FA" },
          { label: "Nouveaux", value: counts.nouveau, color: "#94A3B8" },
          { label: "Entretien", value: counts.entretien, color: "#F59E0B" },
          { label: "Acceptés", value: counts.accepté, color: "#10B981" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px 20px" }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>
              {label}
            </p>
            <p style={{ fontSize: 24, fontWeight: 700, color, margin: 0, fontFamily: "monospace" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {(["tous", "nouveau", "accepté", "entretien"] as const).map(key => (
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
            {key === "tous" ? "Toutes" : (STATUT_CONFIG[key]?.label ?? key)}{" "}
            <span style={{ opacity: 0.7 }}>({counts[key as keyof typeof counts] ?? 0})</span>
          </button>
        ))}
      </div>

      {/* Liste */}
      <div style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
            <Loader2 size={24} style={{ display: "inline-block" }} className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
            Aucune candidature dans cette catégorie.
          </div>
        ) : (
          <div>
            {filtered.map((c, i) => {
              const statut = STATUT_CONFIG[c.statut] ?? STATUT_CONFIG.nouveau;
              return (
                <div
                  key={c.id}
                  style={{
                    padding: "16px 20px",
                    borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}
                >
                  {/* Row 1: identité */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                    {/* Avatar */}
                    <div style={{
                      width: 40, height: 40, borderRadius: 12,
                      background: "rgba(255,255,255,0.06)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, fontWeight: 700, color: "#F26522", flexShrink: 0,
                    }}>
                      {c.prenom[0]}{c.nom[0]}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "white" }}>
                          {c.prenom} {c.nom}
                        </span>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                          background: statut.bg, color: statut.color,
                        }}>
                          {statut.label}
                        </span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", marginLeft: "auto" }}>
                          {relDate(c.created_at)}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: 16, marginTop: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: 4 }}>
                          <Mail size={11} /> {c.email}
                        </span>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: 4 }}>
                          <Phone size={11} /> {c.telephone}
                        </span>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: 4 }}>
                          <MapPin size={11} /> {c.ville} ({c.code_postal})
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
                          {EXPERIENCE_MAP[c.experience] ?? c.experience}
                        </span>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
                          {DISPO_MAP[c.disponibilite] ?? c.disponibilite}
                        </span>
                        {c.vehicule && (
                          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "rgba(16,185,129,0.12)", color: "#10B981" }}>
                            Véhicule ✓
                          </span>
                        )}
                        {(c.certifications ?? []).map(cert => (
                          <span key={cert} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "rgba(96,165,250,0.12)", color: "#60A5FA" }}>
                            {cert}
                          </span>
                        ))}
                      </div>

                      {c.motivation && (
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 8, fontStyle: "italic", maxWidth: 600 }}>
                          &ldquo;{c.motivation.slice(0, 140)}{c.motivation.length > 140 ? "…" : ""}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: actions */}
                  <div style={{ display: "flex", gap: 8, marginTop: 12, paddingLeft: 56, flexWrap: "wrap" }}>
                    {/* Contacter */}
                    <a
                      href={`mailto:${c.email}?subject=Candidature Noxyera — ${c.prenom} ${c.nom}&body=Bonjour ${c.prenom},%0A%0ANous avons bien reçu votre candidature pour rejoindre le réseau Noxyera.%0A%0A`}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                        background: "rgba(96,165,250,0.12)", color: "#60A5FA",
                        border: "1px solid rgba(96,165,250,0.2)", textDecoration: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => updateStatut(c.id, "contacté")}
                    >
                      <Mail size={12} /> Contacter
                    </a>

                    {/* Valider → crée compte */}
                    <button
                      onClick={() => validerTechnicien(c)}
                      disabled={c.statut === "accepté" || actionLoading === c.id + "valider"}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                        background: c.statut === "accepté" ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.15)",
                        color: "#10B981",
                        border: "1px solid rgba(16,185,129,0.25)",
                        cursor: c.statut === "accepté" ? "default" : "pointer",
                        opacity: c.statut === "accepté" ? 0.6 : 1,
                      }}
                    >
                      {actionLoading === c.id + "valider" ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Check size={12} />
                      )}
                      {c.statut === "accepté" ? "Validé ✓" : "Valider & créer compte"}
                    </button>

                    {/* Refuser */}
                    <button
                      onClick={() => updateStatut(c.id, "refusé")}
                      disabled={c.statut === "refusé" || actionLoading === c.id + "refusé"}
                      style={{
                        display: "flex", alignItems: "center", gap: 4,
                        padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 500,
                        background: "transparent", color: "rgba(239,68,68,0.55)",
                        border: "1px solid rgba(239,68,68,0.15)",
                        cursor: c.statut === "refusé" ? "default" : "pointer",
                        opacity: c.statut === "refusé" ? 0.4 : 1,
                      }}
                    >
                      <X size={10} /> Refuser
                    </button>

                    {/* Statut entretien */}
                    {c.statut !== "accepté" && c.statut !== "refusé" && (
                      <button
                        onClick={() => updateStatut(c.id, "entretien")}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                          background: "rgba(245,158,11,0.1)", color: "#F59E0B",
                          border: "1px solid rgba(245,158,11,0.2)",
                          cursor: "pointer",
                        }}
                      >
                        <Star size={12} /> Entretien
                      </button>
                    )}
                  </div>

                  {/* Voir le profil */}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                    <Link
                      href={`/admin-noxyera/candidatures/${c.id}`}
                      style={{
                        fontSize: 12, fontWeight: 600, color: "#F26522",
                        textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
                      }}
                    >
                      Voir le profil →
                    </Link>
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
