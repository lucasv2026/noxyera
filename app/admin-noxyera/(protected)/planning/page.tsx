"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, ChevronLeft, ChevronRight, Users, Clock, CheckCircle2, X, UserCheck, MapPin, AlertTriangle, RefreshCw } from "lucide-react";
import { DEMO_INTERVENTIONS, ADMIN_TECHNICIENS as DEMO_TECHNICIENS, DEMO_CLIENTS } from "@/lib/demo-data";
import type { TypeIntervention, StatutIntervention } from "@/lib/demo-data";

// ── Types pour les données réelles ───────────────────────────────────────────
interface TodayIntervention {
  id: string
  type: string
  statut: string
  date_prevue: string
  heure_arrivee: string | null
  sites: { nom: string; adresse: string } | null
  technicien: { prenom: string; nom: string } | null
}

const STATUT_TODAY: Record<string, { label: string; color: string; bg: string; border: string; pulse?: boolean }> = {
  proposee: { label: "En attente de réponse",  color: "#94A3B8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.2)" },
  planifie: { label: "Confirmée",              color: "#60A5FA", bg: "rgba(96,165,250,0.10)",  border: "rgba(96,165,250,0.25)" },
  en_cours: { label: "En cours",               color: "#10B981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.3)", pulse: true },
  realise:  { label: "Terminée",               color: "#10B981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.15)" },
  expire:   { label: "Expirée — à reproposer", color: "#EF4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)" },
  annule:   { label: "Annulée",                color: "#6B7280", bg: "rgba(107,114,128,0.06)", border: "rgba(107,114,128,0.15)" },
}

// ── Section "Aujourd'hui en temps réel" ────────────────────────────────────
function TodayView() {
  const [interventions, setInterventions] = useState<TodayIntervention[]>([])
  const [loading, setLoading]             = useState(true)
  const [lastRefresh, setLastRefresh]     = useState<Date>(new Date())

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/planning/today")
      if (res.ok) {
        const data = await res.json()
        setInterventions(data)
      }
    } catch { /* non-fatal */ }
    finally {
      setLoading(false)
      setLastRefresh(new Date())
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 60_000) // rafraîchissement toutes les 60s
    return () => clearInterval(interval)
  }, [load])

  const TYPE_LABELS: Record<string, string> = {
    preventif: "Préventif", curatif: "Curatif", urgence: "Urgence", audit: "Audit",
  }

  return (
    <div style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, marginBottom: 0 }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "white", margin: 0 }}>
            Interventions du jour
          </h2>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", margin: "2px 0 0", fontFamily: "monospace" }}>
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>
            Mis à jour {lastRefresh.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <button
            onClick={load}
            style={{ background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 8, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: "rgba(255,255,255,0.5)", fontSize: 11 }}
          >
            <RefreshCw size={11} /> Rafraîchir
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: "32px 20px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
          Chargement…
        </div>
      ) : interventions.length === 0 ? (
        <div style={{ padding: "32px 20px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
          Aucune intervention prévue aujourd&apos;hui.
        </div>
      ) : (
        <div>
          {interventions.map((inter, i) => {
            const cfg = STATUT_TODAY[inter.statut] ?? STATUT_TODAY.proposee
            const isEnCours = inter.statut === "en_cours"
            const isRealise = inter.statut === "realise"
            const isAnnule  = inter.statut === "annule"

            return (
              <div
                key={inter.id}
                style={{
                  padding: "14px 20px",
                  borderBottom: i < interventions.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  borderLeft: `3px solid ${cfg.color}`,
                  opacity: isAnnule ? 0.5 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  {/* Heure */}
                  <div style={{ textAlign: "center", flexShrink: 0, minWidth: 48 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: cfg.color, margin: 0, fontFamily: "monospace" }}>
                      {new Date(inter.date_prevue).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "2px 0 0" }}>
                      {TYPE_LABELS[inter.type] ?? inter.type}
                    </p>
                  </div>

                  {/* Infos */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: 13, fontWeight: 600, color: "white",
                        textDecoration: isAnnule ? "line-through" : "none",
                      }}>
                        {inter.sites?.nom ?? "Site inconnu"}
                      </span>

                      {/* Statut badge */}
                      <span style={{
                        fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 600,
                        background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        {isEnCours && (
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block", animation: "pulse 1.5s ease-in-out infinite" }} />
                        )}
                        {isRealise ? "✓ " : ""}{cfg.label}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 12, marginTop: 4, flexWrap: "wrap" }}>
                      {inter.sites?.adresse && (
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 3 }}>
                          <MapPin size={9} /> {inter.sites.adresse}
                        </span>
                      )}
                      {inter.technicien ? (
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                          🔧 {inter.technicien.prenom} {inter.technicien.nom}
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: "#F59E0B" }}>⚠ Non assigné</span>
                      )}
                      {isEnCours && inter.heure_arrivee && (
                        <span style={{ fontSize: 11, color: "#10B981", fontWeight: 600 }}>
                          Arrivé à {new Date(inter.heure_arrivee).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <style>{`@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }`}</style>
    </div>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────
interface InterventionWithTech {
  id: string;
  clientId: string;
  date: string;
  type: TypeIntervention;
  statut: StatutIntervention;
  technicienId: string | null;
  notes?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────
function getWeekDays(refDate: Date): Date[] {
  const day = refDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(refDate);
  monday.setDate(refDate.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = ["jan", "fév", "mars", "avr", "mai", "juin", "juil", "août", "sep", "oct", "nov", "déc"];

function sameDay(a: Date, b: Date) {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl ${className}`} style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)" }}>
      {children}
    </div>
  );
}

function TypeBadge({ type }: { type: TypeIntervention }) {
  const cfg = {
    preventif: { label: "Préventif", bg: "rgba(96,165,250,0.15)", color: "#60A5FA" },
    curatif:   { label: "Curatif",   bg: "rgba(245,158,11,0.15)", color: "#F59E0B" },
    urgence:   { label: "Urgence",   bg: "rgba(220,38,38,0.15)",  color: "#DC2626" },
  }[type];
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

// ── Modal assignation technicien ──────────────────────────────────────────
function AssignModal({
  intervention,
  allInterventions,
  onClose,
  onAssign,
}: {
  intervention: InterventionWithTech;
  allInterventions: InterventionWithTech[];
  onClose: () => void;
  onAssign: (techId: string) => void;
}) {
  const client = DEMO_CLIENTS.find(c => c.id === intervention.clientId);
  const currentTech = DEMO_TECHNICIENS.find(t => t.id === intervention.technicienId);
  const [selected, setSelected] = useState(intervention.technicienId ?? "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="w-full max-w-md rounded-2xl" style={{ background: "#0D1F17", border: "1px solid rgba(255,255,255,0.12)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <p className="text-sm font-bold text-white">Assigner un technicien</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
              {client?.nom ?? intervention.clientId} · {new Date(intervention.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
            <X size={14} style={{ color: "rgba(255,255,255,0.6)" }} />
          </button>
        </div>

        {/* Infos intervention */}
        <div className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <TypeBadge type={intervention.type} />
          {currentTech && (
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              Actuellement : {currentTech.nom}
            </span>
          )}
          {!currentTech && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
              Non assigné
            </span>
          )}
        </div>

        {/* Liste techniciens */}
        <div className="p-5 space-y-2 max-h-72 overflow-y-auto">
          {DEMO_TECHNICIENS.filter(t => t.statut === "actif").map(tech => {
            const isSelected = selected === tech.id;
            const missionsJour = allInterventions.filter(
              i => i.technicienId === tech.id && sameDay(new Date(i.date), new Date(intervention.date))
            ).length;
            const busy = missionsJour >= 3;

            return (
              <button
                key={tech.id}
                onClick={() => !busy && setSelected(tech.id)}
                disabled={busy}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                style={{
                  background: isSelected ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${isSelected ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.07)"}`,
                  opacity: busy ? 0.5 : 1,
                  cursor: busy ? "not-allowed" : "pointer",
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: isSelected ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.07)", color: isSelected ? "#10B981" : "rgba(255,255,255,0.7)" }}
                >
                  {tech.nom.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{tech.nom}</p>
                  <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                    <MapPin size={9} /> {tech.region}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold" style={{ color: busy ? "#DC2626" : missionsJour > 0 ? "#F59E0B" : "#10B981" }}>
                    {missionsJour}/3 missions
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>ce jour</p>
                </div>
                {isSelected && <CheckCircle2 size={14} style={{ color: "#10B981" }} className="shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}
          >
            Annuler
          </button>
          <button
            disabled={!selected}
            onClick={() => { onAssign(selected); onClose(); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity"
            style={{ background: selected ? "#10B981" : "#1B3A2D", opacity: selected ? 1 : 0.5 }}
          >
            <span className="flex items-center justify-center gap-2">
              <UserCheck size={14} /> Confirmer
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Mapper nom technicien → id
function nomToTechId(nom: string | null): string | null {
  if (!nom) return null;
  const found = DEMO_TECHNICIENS.find(t => t.nom === nom);
  return found?.id ?? null;
}

// ── Page principale ───────────────────────────────────────────────────────
export default function PlanningPage() {
  const [weekRef, setWeekRef] = useState(new Date());
  const [interventions, setInterventions] = useState<InterventionWithTech[]>(
    DEMO_INTERVENTIONS.map(i => ({
      id: i.id,
      clientId: i.clientId,
      date: i.datePrevue,
      type: i.type,
      statut: i.statut as StatutIntervention,
      technicienId: nomToTechId(i.technicienNom),
    }))
  );
  const [assignTarget, setAssignTarget] = useState<InterventionWithTech | null>(null);

  const today = new Date();
  const weekDays = getWeekDays(weekRef);
  const monthLabel = (() => {
    const start = weekDays[0];
    const end = weekDays[6];
    if (start.getMonth() === end.getMonth()) {
      return `${MONTHS_FR[start.getMonth()]} ${start.getFullYear()}`;
    }
    return `${MONTHS_FR[start.getMonth()]} – ${MONTHS_FR[end.getMonth()]} ${end.getFullYear()}`;
  })();

  const nonAssignees = interventions.filter(i => !i.technicienId);
  const assignees = interventions.filter(i => i.technicienId);

  function handleAssign(interventionId: string, techId: string) {
    setInterventions(prev =>
      prev.map(i => i.id === interventionId ? { ...i, technicienId: techId, statut: "planifiee" as StatutIntervention } : i)
    );
  }

  return (
    <div className="p-5 space-y-5 min-h-screen" style={{ background: "#0D1F17" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Planning</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
            {assignees.length} assignée{assignees.length > 1 ? "s" : ""} · {nonAssignees.length} en attente
          </p>
        </div>
        {nonAssignees.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#F59E0B" }}>
            <AlertTriangle size={12} />
            {nonAssignees.length} à assigner
          </div>
        )}
      </div>

      {/* Interventions du jour — temps réel */}
      <TodayView />

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Cette semaine", value: interventions.filter(i => { const d = new Date(i.date); return weekDays.some(w => sameDay(d, w)); }).length, color: "#10B981", icon: Calendar },
          { label: "Techniciens dispo", value: DEMO_TECHNICIENS.filter(t => t.statut === "actif").length, color: "#60A5FA", icon: Users },
          { label: "Non assignées", value: nonAssignees.length, color: nonAssignees.length > 0 ? "#F59E0B" : "#10B981", icon: Clock },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>{label}</p>
              <Icon size={13} style={{ color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Calendrier semaine */}
      <div className="rounded-2xl" style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)" }}>
        {/* Nav semaine */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <button
            onClick={() => { const d = new Date(weekRef); d.setDate(d.getDate() - 7); setWeekRef(d); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={14} style={{ color: "rgba(255,255,255,0.6)" }} />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-white capitalize">{monthLabel}</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
              {weekDays[0].getDate()} – {weekDays[6].getDate()}
            </p>
          </div>
          <button
            onClick={() => { const d = new Date(weekRef); d.setDate(d.getDate() + 7); setWeekRef(d); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.6)" }} />
          </button>
        </div>

        {/* Grille 7 jours */}
        <div className="grid grid-cols-7 divide-x" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {weekDays.map((day, idx) => {
            const isToday = sameDay(day, today);
            const dayInterventions = interventions.filter(i => sameDay(new Date(i.date), day));

            return (
              <div key={idx} className="p-2 min-h-[110px]">
                {/* Entête jour */}
                <div className="text-center mb-2">
                  <p className="text-xs uppercase" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "monospace" }}>
                    {DAY_NAMES[idx]}
                  </p>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center mx-auto mt-0.5 text-sm font-bold"
                    style={{
                      background: isToday ? "#F26522" : "transparent",
                      color: isToday ? "white" : "rgba(255,255,255,0.7)",
                    }}
                  >
                    {day.getDate()}
                  </div>
                </div>

                {/* Interventions du jour */}
                <div className="space-y-1">
                  {dayInterventions.map(inter => {
                    const client = DEMO_CLIENTS.find(c => c.id === inter.clientId);
                    const tech = DEMO_TECHNICIENS.find(t => t.id === inter.technicienId);
                    const isUnassigned = !inter.technicienId;

                    return (
                      <button
                        key={inter.id}
                        onClick={() => setAssignTarget(inter)}
                        className="w-full text-left px-1.5 py-1 rounded-lg text-xs transition-all hover:scale-105"
                        style={{
                          background: isUnassigned ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.12)",
                          border: `1px solid ${isUnassigned ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.2)"}`,
                        }}
                      >
                        <p className="font-semibold truncate" style={{ color: isUnassigned ? "#F59E0B" : "#10B981" }}>
                          {client?.nom?.split(" ").slice(-1)[0] ?? "Client"}
                        </p>
                        {tech && (
                          <p className="truncate mt-0.5" style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>
                            {tech.nom.split(" ")[0]}
                          </p>
                        )}
                        {isUnassigned && (
                          <p style={{ color: "rgba(245,158,11,0.7)", fontSize: 10 }}>Assigner →</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* File d'attente — interventions non assignées */}
      {nonAssignees.length > 0 && (
        <div className="rounded-2xl" style={{ background: "#122B1E", border: "1px solid rgba(245,158,11,0.2)" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <h3 className="font-semibold text-sm text-white">À assigner</h3>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
              {nonAssignees.length}
            </span>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {nonAssignees.map(inter => {
              const client = DEMO_CLIENTS.find(c => c.id === inter.clientId);
              return (
                <div key={inter.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{client?.nom ?? inter.clientId}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>
                      {new Date(inter.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                  </div>
                  <TypeBadge type={inter.type} />
                  <button
                    onClick={() => setAssignTarget(inter)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: "#F26522" }}
                  >
                    <UserCheck size={11} /> Assigner
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Planning techniciens */}
      <div className="rounded-2xl" style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="font-semibold text-sm text-white">Charge techniciens — semaine</h3>
        </div>
        <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {DEMO_TECHNICIENS.filter(t => t.statut === "actif").map(tech => {
            const weekCount = interventions.filter(i =>
              i.technicienId === tech.id && weekDays.some(d => sameDay(d, new Date(i.date)))
            ).length;
            const pct = Math.min((weekCount / 7) * 100, 100);
            return (
              <div key={tech.id} className="flex items-center gap-4 px-5 py-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)" }}>
                  {tech.nom.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-white">{tech.nom}</p>
                    <p className="text-xs font-bold" style={{ color: weekCount >= 5 ? "#DC2626" : weekCount >= 3 ? "#F59E0B" : "#10B981", fontFamily: "monospace" }}>
                      {weekCount} mission{weekCount > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${pct}%`,
                      background: weekCount >= 5 ? "#DC2626" : weekCount >= 3 ? "#F59E0B" : "#10B981",
                    }} />
                  </div>
                </div>
                <span className="text-xs shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>{tech.region}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal assignation */}
      {assignTarget && (
        <AssignModal
          intervention={assignTarget}
          allInterventions={interventions}
          onClose={() => setAssignTarget(null)}
          onAssign={(techId) => handleAssign(assignTarget.id, techId)}
        />
      )}
    </div>
  );
}
