"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  UtensilsCrossed, Building2, Package, Factory, Home, Briefcase,
  Check, ArrowRight, ArrowLeft, Loader2, CheckCircle2, MapPin,
} from "lucide-react";
import { MegaMenu } from "@/components/MegaMenu";

// ── Types ─────────────────────────────────────────────────────────────────────
interface AdresseSuggestion { label: string; lat: number; lng: number }

interface FormData {
  // Étape 1
  nomEtablissement: string;
  adresse: string;
  adresseLat?: number;
  adresseLng?: number;
  secteur: string;
  superficie: number;
  anneeConstruction: string;
  // Étape 2
  historiqueNuisibles: string;
  prestataireActuel: string;
  rapportsAJour: string;
  zonesSensibles: string[];
  // Étape 3
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  creneaux: string[];
  jours: string[];
}

// ── Constantes ────────────────────────────────────────────────────────────────
const SECTEURS = [
  { id: "restaurant",      label: "Restaurant / Brasserie",   icon: UtensilsCrossed },
  { id: "hotel",           label: "Hôtellerie",               icon: Building2 },
  { id: "entrepot",        label: "Entrepôt / Logistique",    icon: Package },
  { id: "agroalimentaire", label: "Industrie agroalimentaire",icon: Factory },
  { id: "immeuble",        label: "Immeuble / Bailleur",      icon: Home },
  { id: "bureau",          label: "Bureau / Tertiaire",       icon: Briefcase },
];

const SUPERFICIE_CFG: Record<string, { min: number; max: number; step: number; def: number }> = {
  restaurant:      { min: 50,  max: 500,  step: 10,  def: 100 },
  hotel:           { min: 50,  max: 1000, step: 25,  def: 250 },
  entrepot:        { min: 200, max: 5000, step: 100, def: 500 },
  agroalimentaire: { min: 200, max: 5000, step: 100, def: 500 },
  immeuble:        { min: 50,  max: 1000, step: 25,  def: 150 },
  bureau:          { min: 50,  max: 500,  step: 10,  def: 100 },
};

const ZONES = ["Cuisine", "Cave", "Réserves", "Poubelles", "Extérieurs", "Livraisons"];
const CRENEAUX = ["Matin (8h-12h)", "Après-midi (14h-18h)", "Soir (après 18h)"];
const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

// ── Styles communs ────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box",
  border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "12px 16px",
  fontSize: 15, color: "#1A1A1A", outline: "none", background: "white",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6,
};
const fieldStyle: React.CSSProperties = { marginBottom: 20 };

// ── Composant progress bar ────────────────────────────────────────────────────
function ProgressBar({ step }: { step: number }) {
  const steps = ["Établissement", "Situation", "Contact"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 40 }}>
      {steps.map((label, i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        return (
          <div key={n} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : undefined }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700,
                background: done ? "#1B3A2D" : active ? "#F26522" : "#E5E7EB",
                color: done || active ? "white" : "#9CA3AF",
              }}>
                {done ? <Check size={16} /> : n}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: active ? "#F26522" : done ? "#1B3A2D" : "#9CA3AF", whiteSpace: "nowrap" }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: step > n ? "#1B3A2D" : "#E5E7EB", margin: "0 8px", marginBottom: 22 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Multi-select pill ─────────────────────────────────────────────────────────
function PillSelect({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(opt => {
        const on = selected.includes(opt);
        return (
          <button key={opt} type="button" onClick={() => onChange(on ? selected.filter(x => x !== opt) : [...selected, opt])}
            style={{
              padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer",
              border: `1.5px solid ${on ? "#F26522" : "#E5E7EB"}`,
              background: on ? "#FFF5EE" : "white",
              color: on ? "#F26522" : "#6B7280",
            }}>
            {on && <Check size={12} style={{ marginRight: 5, verticalAlign: "middle" }} />}{opt}
          </button>
        );
      })}
    </div>
  );
}

// ── Choix unique avec boutons ─────────────────────────────────────────────────
function ChoiceGroup({ options, value, onChange }: { options: { key: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(opt => (
        <button key={opt.key} type="button" onClick={() => onChange(opt.key)}
          style={{
            padding: "10px 18px", borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: "pointer",
            border: `1.5px solid ${value === opt.key ? "#F26522" : "#E5E7EB"}`,
            background: value === opt.key ? "#FFF5EE" : "white",
            color: value === opt.key ? "#F26522" : "#374151",
          }}>
          {value === opt.key && <Check size={12} style={{ marginRight: 6, verticalAlign: "middle" }} />}{opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Contenu principal (lit useSearchParams) ───────────────────────────────────
function AuditFormContent() {
  const searchParams = useSearchParams();

  const initSecteur    = searchParams.get("secteur")    ?? "restaurant";
  const initSuperficie = Number(searchParams.get("superficie") ?? SUPERFICIE_CFG[initSecteur]?.def ?? 100);

  const [step, setStep]           = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState("");

  const [form, setForm] = useState<FormData>({
    nomEtablissement: "",
    adresse: "", adresseLat: undefined, adresseLng: undefined,
    secteur: initSecteur,
    superficie: initSuperficie,
    anneeConstruction: "",
    historiqueNuisibles: "", prestataireActuel: "", rapportsAJour: "", zonesSensibles: [],
    prenom: "", nom: "", email: "", telephone: "", creneaux: [], jours: [],
  });

  // Adresse autocomplete
  const [adresseSuggestions, setAdresseSuggestions] = useState<AdresseSuggestion[]>([]);
  const [adresseLoading, setAdresseLoading] = useState(false);
  const adresseTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchAdresse = useCallback(async (q: string) => {
    if (q.length < 3) { setAdresseSuggestions([]); return; }
    setAdresseLoading(true);
    try {
      const r = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=5`);
      const d = await r.json();
      setAdresseSuggestions(
        d.features?.map((f: { properties: { label: string }; geometry: { coordinates: [number, number] } }) => ({
          label: f.properties.label,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
        })) ?? []
      );
    } catch { setAdresseSuggestions([]); }
    finally { setAdresseLoading(false); }
  }, []);

  function handleAdresseChange(v: string) {
    set("adresse", v);
    set("adresseLat", undefined);
    set("adresseLng", undefined);
    if (adresseTimer.current) clearTimeout(adresseTimer.current);
    adresseTimer.current = setTimeout(() => fetchAdresse(v), 350);
  }

  function set<K extends keyof FormData>(k: K, v: FormData[K]) {
    setForm(prev => ({ ...prev, [k]: v }));
  }

  // Superficie reset when secteur changes (only if not pre-filled from URL)
  useEffect(() => {
    const cfg = SUPERFICIE_CFG[form.secteur];
    if (cfg) set("superficie", cfg.def);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.secteur]);

  const cfg = SUPERFICIE_CFG[form.secteur] ?? SUPERFICIE_CFG.restaurant;
  const sliderPct = ((form.superficie - cfg.min) / (cfg.max - cfg.min)) * 100;

  // ── Validation par étape ──────────────────────────────────────────────────
  function canNext() {
    if (step === 1) return form.nomEtablissement.trim() && form.adresse.trim() && form.secteur;
    if (step === 2) return form.historiqueNuisibles && form.prestataireActuel && form.rapportsAJour;
    return true;
  }

  function canSubmit() {
    return form.prenom.trim() && form.nom.trim() &&
      form.email.includes("@") && form.telephone.trim().length >= 10;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom_etablissement:    form.nomEtablissement,
          adresse:              form.adresse,
          lat:                  form.adresseLat,
          lng:                  form.adresseLng,
          secteur:              form.secteur,
          superficie:           form.superficie,
          annee_construction:   form.anneeConstruction || null,
          historique_nuisibles: form.historiqueNuisibles,
          prestataire_actuel:   form.prestataireActuel === "oui",
          rapports_a_jour:      form.rapportsAJour,
          zones_sensibles:      form.zonesSensibles,
          prenom:               form.prenom,
          nom:                  form.nom,
          email:                form.email,
          telephone:            form.telephone,
          creneaux:             form.creneaux,
          jours:                form.jours,
        }),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      setSuccess(true);
    } catch {
      setError("Une erreur est survenue. Réessayez ou écrivez-nous directement.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Page succès ───────────────────────────────────────────────────────────
  if (success) {
    return (
      <div style={{ maxWidth: 520, margin: "80px auto", textAlign: "center", padding: "0 24px" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <CheckCircle2 size={40} color="#22C55E" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1B3A2D", margin: "0 0 12px" }}>
          Demande confirmée !
        </h1>
        <p style={{ fontSize: 16, color: "#6B7280", margin: "0 0 8px" }}>
          Nous avons bien reçu votre demande d&apos;audit pour <strong style={{ color: "#1B3A2D" }}>{form.nomEtablissement}</strong>.
        </p>
        <p style={{ fontSize: 15, color: "#6B7280", margin: "0 0 32px" }}>
          Un technicien certifié vous contactera sous 48h pour confirmer un créneau.
        </p>
        <p style={{ fontSize: 13, color: "#9CA3AF", margin: "0 0 32px" }}>
          Un email de confirmation a été envoyé à <strong>{form.email}</strong>
        </p>
        <Link href="/"
          style={{ display: "inline-block", background: "#1B3A2D", color: "white", padding: "14px 32px", borderRadius: 10, textDecoration: "none", fontWeight: 600, fontSize: 15 }}>
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 80px" }}>
      {/* En-tête */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <span style={{ display: "inline-block", background: "#FFF5EE", color: "#F26522", fontSize: 12, fontWeight: 700, padding: "4px 14px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
          Gratuit · Sans engagement
        </span>
        <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, color: "#1B3A2D", margin: "0 0 12px" }}>
          Demandez votre audit gratuit
        </h1>
        <p style={{ fontSize: 16, color: "#6B7280", margin: 0, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
          Un technicien certifié analyse votre établissement et vous propose un plan de traitement personnalisé sous 48h.
        </p>
      </div>

      <ProgressBar step={step} />

      <form onSubmit={handleSubmit}>
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #E5E7EB", padding: "32px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>

          {/* ── ÉTAPE 1 ── */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1B3A2D", margin: "0 0 24px" }}>Votre établissement</h2>

              <div style={fieldStyle}>
                <label style={labelStyle}>Nom de l&apos;établissement *</label>
                <input style={inputStyle} placeholder="Ex : Brasserie Le Voltaire" value={form.nomEtablissement}
                  onChange={e => set("nomEtablissement", e.target.value)} required />
              </div>

              <div style={{ ...fieldStyle, position: "relative" }}>
                <label style={labelStyle}>Adresse *</label>
                <div style={{ position: "relative" }}>
                  <input style={{ ...inputStyle, paddingLeft: 40 }} placeholder="Commencez à taper l'adresse…"
                    value={form.adresse} onChange={e => handleAdresseChange(e.target.value)} autoComplete="off" />
                  <MapPin size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                  {adresseLoading && <Loader2 size={14} className="animate-spin" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />}
                </div>
                {adresseSuggestions.length > 0 && (
                  <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "white", border: "1px solid #E5E7EB", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 50, overflow: "hidden" }}>
                    {adresseSuggestions.map(s => (
                      <button key={s.label} type="button"
                        onClick={() => { set("adresse", s.label); set("adresseLat", s.lat); set("adresseLng", s.lng); setAdresseSuggestions([]); }}
                        style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#374151", textAlign: "left" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#F9FAFB")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}
                      >
                        <MapPin size={13} style={{ color: "#F26522", flexShrink: 0 }} />{s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Secteur d&apos;activité *</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {SECTEURS.map(({ id, label, icon: Icon }) => (
                    <button key={id} type="button" onClick={() => set("secteur", id)}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                        padding: "14px 8px", borderRadius: 12, cursor: "pointer",
                        border: `2px solid ${form.secteur === id ? "#F26522" : "#E5E7EB"}`,
                        background: form.secteur === id ? "#FFF5EE" : "white",
                      }}>
                      <Icon size={20} style={{ color: form.secteur === id ? "#F26522" : "#9CA3AF" }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: form.secteur === id ? "#F26522" : "#6B7280", textAlign: "center", lineHeight: 1.3 }}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Superficie (m²) — <strong style={{ color: "#F26522" }}>{form.superficie.toLocaleString("fr-FR")} m²</strong></label>
                <div style={{ position: "relative", padding: "0 2px" }}>
                  <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 4, borderRadius: 4, background: "#E5E7EB", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <div style={{ position: "absolute", top: "50%", left: 0, width: `${sliderPct}%`, height: 4, borderRadius: 4, background: "#F26522", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input type="range" min={cfg.min} max={cfg.max} step={cfg.step} value={form.superficie}
                    onChange={e => set("superficie", Number(e.target.value))}
                    style={{ position: "relative", width: "100%", height: 4, appearance: "none", background: "transparent", cursor: "pointer", zIndex: 1 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9CA3AF", marginTop: 6 }}>
                  <span>{cfg.min} m²</span><span>{cfg.max} m²</span>
                </div>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Année de construction approximative</label>
                <select style={{ ...inputStyle, cursor: "pointer" }} value={form.anneeConstruction} onChange={e => set("anneeConstruction", e.target.value)}>
                  <option value="">Non renseigné</option>
                  <option value="avant_1970">Avant 1970</option>
                  <option value="1970_2000">1970 – 2000</option>
                  <option value="apres_2000">Après 2000</option>
                </select>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 2 ── */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1B3A2D", margin: "0 0 24px" }}>Situation actuelle</h2>

              <div style={fieldStyle}>
                <label style={labelStyle}>Avez-vous déjà eu des nuisibles ? *</label>
                <ChoiceGroup
                  value={form.historiqueNuisibles}
                  onChange={v => set("historiqueNuisibles", v)}
                  options={[
                    { key: "oui_recent",    label: "Oui, récemment" },
                    { key: "oui_ancien",    label: "Oui, il y a plus d'un an" },
                    { key: "jamais",        label: "Jamais" },
                    { key: "sais_pas",      label: "Je ne sais pas" },
                  ]}
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Avez-vous un prestataire actuel ? *</label>
                <ChoiceGroup
                  value={form.prestataireActuel}
                  onChange={v => set("prestataireActuel", v)}
                  options={[{ key: "oui", label: "Oui" }, { key: "non", label: "Non" }]}
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Vos rapports HACCP sont-ils à jour ? *</label>
                <ChoiceGroup
                  value={form.rapportsAJour}
                  onChange={v => set("rapportsAJour", v)}
                  options={[
                    { key: "oui",          label: "Oui" },
                    { key: "non",          label: "Non" },
                    { key: "partiellement",label: "Partiellement" },
                  ]}
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Zones sensibles (facultatif)</label>
                <PillSelect options={ZONES} selected={form.zonesSensibles} onChange={v => set("zonesSensibles", v)} />
              </div>
            </div>
          )}

          {/* ── ÉTAPE 3 ── */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1B3A2D", margin: "0 0 24px" }}>Vos disponibilités</h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={labelStyle}>Prénom *</label>
                  <input style={inputStyle} placeholder="Jean" value={form.prenom} onChange={e => set("prenom", e.target.value)} required />
                </div>
                <div>
                  <label style={labelStyle}>Nom *</label>
                  <input style={inputStyle} placeholder="Dupont" value={form.nom} onChange={e => set("nom", e.target.value)} required />
                </div>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Email professionnel *</label>
                <input style={inputStyle} type="email" placeholder="jean@etablissement.fr" value={form.email} onChange={e => set("email", e.target.value)} required />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Téléphone *</label>
                <input style={inputStyle} type="tel" placeholder="06 12 34 56 78" value={form.telephone} onChange={e => set("telephone", e.target.value)} required />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Créneaux préférés</label>
                <PillSelect options={CRENEAUX} selected={form.creneaux} onChange={v => set("creneaux", v)} />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Jours préférés</label>
                <PillSelect options={JOURS} selected={form.jours} onChange={v => set("jours", v)} />
              </div>

              {error && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "12px 16px", fontSize: 14, color: "#DC2626", marginTop: 8 }}>
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Boutons navigation ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
          {step > 1 ? (
            <button type="button" onClick={() => setStep(s => s - 1)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 10, background: "white", border: "1.5px solid #E5E7EB", color: "#374151", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
              <ArrowLeft size={16} /> Retour
            </button>
          ) : <div />}

          {step < 3 ? (
            <button type="button" onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 10, background: canNext() ? "#F26522" : "#E5E7EB", color: "white", fontWeight: 700, fontSize: 15, cursor: canNext() ? "pointer" : "default", border: "none" }}>
              Continuer <ArrowRight size={16} />
            </button>
          ) : (
            <button type="submit" disabled={!canSubmit() || submitting}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 10, background: canSubmit() && !submitting ? "#F26522" : "#E5E7EB", color: "white", fontWeight: 700, fontSize: 15, cursor: canSubmit() && !submitting ? "pointer" : "default", border: "none" }}>
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Envoi…</> : <>Confirmer ma demande d&apos;audit <ArrowRight size={16} /></>}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// ── Export default avec Suspense (useSearchParams nécessite Suspense) ─────────
export default function AuditPage() {
  return (
    <>
      <MegaMenu />
      <Suspense fallback={<div style={{ padding: 80, textAlign: "center", color: "#9CA3AF" }}><Loader2 size={24} className="animate-spin" style={{ display: "inline-block" }} /></div>}>
        <AuditFormContent />
      </Suspense>
    </>
  );
}
