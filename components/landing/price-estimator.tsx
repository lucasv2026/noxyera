"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  Factory,
  Hotel,
  Loader2,
  Store,
  Truck,
  Warehouse,
} from "lucide-react";
import {
  formuleSuggeree,
  SUPERFICIE_CONFIG,
  frequences,
  secteurs,
  type Frequence,
  type Secteur,
} from "@/lib/pricing";
import { cn } from "@/lib/utils";

const secteurIcons = {
  restaurant:      Store,
  hotel:           Hotel,
  entrepot:        Warehouse,
  agroalimentaire: Factory,
  immeuble:        Building2,
  bureau:          Truck,
};

const euroFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function formatSuperficie(v: number): string {
  return `${v.toLocaleString("fr-FR")} m²`;
}

type SubmitState = "idle" | "loading" | "success" | "error";

interface PriceEstimatorProps {
  defaultSecteur?: Secteur;
}

export function PriceEstimator({ defaultSecteur }: PriceEstimatorProps) {
  const [secteur, setSecteur]       = useState<Secteur>(defaultSecteur ?? "restaurant");
  const [superficie, setSuperficie] = useState<number>(SUPERFICIE_CONFIG["restaurant"].defaultValue);
  const [frequence, setFrequence]   = useState<Frequence>(4);
  const [curatives, setCuratives]   = useState(true);
  const [email, setEmail]           = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [message, setMessage]       = useState("");
  const [prixCalcule, setPrixCalcule] = useState<number>(1200);
  const [prixBas, setPrixBas]         = useState<number>(1100);
  const [prixHaut, setPrixHaut]       = useState<number>(1350);

  // When sector changes → reset superficie to sector default
  useEffect(() => {
    setSuperficie(SUPERFICIE_CONFIG[secteur].defaultValue);
  }, [secteur]);

  // Recalculer le prix à chaque changement — fourchette ±10%
  useEffect(() => {
    if (!secteur) return;
    const base: Record<string, number> = {
      restaurant: 9, hotel: 11, entrepot: 1.5,
      agroalimentaire: 2, immeuble: 1, bureau: 0.8,
    };
    const freq: Record<number, number> = { 4: 1, 6: 1.3, 12: 1.8 };
    const montant = (base[secteur] ?? 5) * superficie * (freq[frequence] ?? 1) * (curatives ? 1.25 : 1);
    const arrondi = Math.max(600, Math.ceil(montant / 50) * 50);
    const bas     = Math.max(600, Math.ceil(arrondi * 0.9 / 50) * 50);
    const haut    = Math.ceil(arrondi * 1.1 / 50) * 50;
    setPrixCalcule(arrondi);
    setPrixBas(bas);
    setPrixHaut(haut);
  }, [secteur, superficie, frequence, curatives]);

  const cfg = SUPERFICIE_CONFIG[secteur];
  const sliderPct = ((superficie - cfg.min) / (cfg.max - cfg.min)) * 100;

  const formule  = formuleSuggeree(curatives, frequence);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("loading");
    setMessage("");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          secteur,
          superficie,
          frequence,
          curatives,
          nuisible: curatives ? "multi" : "insectes",
          prix_estime:      prixCalcule,
          prix_bas:         prixBas,
          prix_haut:        prixHaut,
          formule_suggeree: formule,
        }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(payload.message ?? "Impossible d'enregistrer la demande.");
      setSubmitState("success");
      setMessage(payload.message ?? "Estimation enregistrée.");
    } catch (error) {
      setSubmitState("error");
      setMessage(error instanceof Error ? error.message : "Impossible d'enregistrer la demande.");
    }
  }

  return (
    <section
      id="estimateur"
      className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1fr_400px]"
    >
      {/* ── Formulaire ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="flex flex-col gap-2 border-b pb-6 md:flex-row md:items-end md:justify-between" style={{ borderColor: "#E5E7EB" }}>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "#F26522" }}>
              Estimateur tarifaire
            </p>
            <h2 className="mt-2 text-3xl font-bold" style={{ color: "#1B3A2D" }}>
              Votre tarif en 60 secondes
            </h2>
          </div>
          <p className="text-sm" style={{ color: "#6B7280" }}>
            Prix fixe annuel · sans frais cachés
          </p>
        </div>

        <div className="mt-8 grid gap-10">

          {/* ── Étape 1 : Secteur ── */}
          <EstimatorStep number="1" title="Secteur d'activité">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {secteurs.map((item) => {
                const Icon = secteurIcons[item.id];
                const selected = secteur === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSecteur(item.id)}
                    className={cn(
                      "flex min-h-20 items-start gap-3 rounded-xl border p-4 text-left transition-all",
                      selected
                        ? "border-orange-300 bg-orange-50 shadow-sm"
                        : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
                    )}
                  >
                    <span className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      selected ? "bg-orange-500 text-white" : "bg-stone-100 text-stone-500"
                    )}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className={cn("text-sm font-semibold leading-tight", selected ? "text-stone-800" : "text-stone-600")}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </EstimatorStep>

          {/* ── Étape 2 : Superficie ── */}
          <EstimatorStep number="2" title={`Superficie (${cfg.unite})`}>
            <div className="rounded-xl p-5" style={{ background: "#F9F7F4", border: "1px solid #E8E2D9" }}>
              {/* Valeur affichée */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium" style={{ color: "#9CA3AF" }}>
                  {formatSuperficie(cfg.min)}
                </span>
                <span
                  className="rounded-xl px-4 py-1.5 text-base font-black"
                  style={{ background: "#F26522", color: "white", minWidth: "110px", textAlign: "center" }}
                >
                  {formatSuperficie(superficie)}
                </span>
                <span className="text-sm font-medium" style={{ color: "#9CA3AF" }}>
                  {formatSuperficie(cfg.max)}
                </span>
              </div>

              {/* Slider avec track custom */}
              <div className="relative mt-2 px-1">
                <div
                  className="absolute top-1/2 left-0 h-2 rounded-full -translate-y-1/2"
                  style={{ width: "100%", background: "#E0D9D0" }}
                />
                <div
                  className="absolute top-1/2 left-0 h-2 rounded-full -translate-y-1/2 pointer-events-none"
                  style={{ width: `${sliderPct}%`, background: "#F26522" }}
                />
                <input
                  type="range"
                  min={cfg.min}
                  max={cfg.max}
                  step={cfg.step}
                  value={superficie}
                  onChange={(e) => setSuperficie(Number(e.target.value))}
                  className="relative w-full h-2 appearance-none bg-transparent cursor-pointer"
                  style={{ zIndex: 1 }}
                  aria-label="Superficie"
                />
              </div>

              <p className="mt-4 text-xs" style={{ color: "#9CA3AF" }}>
                {cfg.exemples}
              </p>
            </div>
          </EstimatorStep>

          {/* ── Étape 3 : Fréquence ── */}
          <EstimatorStep number="3" title="Fréquence de passage">
            <div className="grid gap-3 md:grid-cols-3">
              {frequences.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFrequence(item.value)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-all",
                    frequence === item.value
                      ? "border-orange-300 bg-orange-50 shadow-sm"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  )}
                >
                  <span className="block font-bold text-sm" style={{ color: "#1B3A2D" }}>
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-xs" style={{ color: "#6B7280" }}>
                    {item.cadence}
                  </span>
                </button>
              ))}
            </div>
          </EstimatorStep>

          {/* ── Étape 4 : Curatives ── */}
          <EstimatorStep number="4" title="Interventions curatives (infestations)">
            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setCuratives(true)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all",
                  curatives
                    ? "border-orange-300 bg-orange-50 shadow-sm"
                    : "border-stone-200 bg-white hover:border-stone-300"
                )}
              >
                <span className="block font-bold text-sm" style={{ color: "#1B3A2D" }}>
                  Incluses dans le forfait
                </span>
                <span className="mt-1 block text-xs" style={{ color: "#6B7280" }}>
                  Recommandé pour les sites à risque — illimité Sérénité.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setCuratives(false)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all",
                  !curatives
                    ? "border-orange-300 bg-orange-50 shadow-sm"
                    : "border-stone-200 bg-white hover:border-stone-300"
                )}
              >
                <span className="block font-bold text-sm" style={{ color: "#1B3A2D" }}>
                  Facturées à part (€200–400)
                </span>
                <span className="mt-1 block text-xs" style={{ color: "#6B7280" }}>
                  Adapté aux sites à faible risque d&apos;infestation.
                </span>
              </button>
            </div>
          </EstimatorStep>
        </div>
      </div>

      {/* ── Panel CTA ──────────────────────────────────────────────────── */}
      <aside className="h-fit rounded-2xl text-white shadow-lg lg:sticky lg:top-6" style={{ background: "#1B3A2D" }}>
        <div className="px-6 pt-6 pb-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] mb-3" style={{ color: "#F26522" }}>
            Estimation gratuite
          </p>
          <h3 className="text-xl font-bold text-white mb-3 leading-snug">
            Recevez votre devis gratuit
          </h3>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
            Estimez votre tarif annuel en 60 secondes selon votre secteur, votre surface et la fréquence de passage souhaitée. Vous recevez votre devis personnalisé immédiatement par email.
          </p>

          {submitState === "success" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl p-4" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
                <Check size={16} className="shrink-0" style={{ color: "#10B981" }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#10B981" }}>Estimation envoyée !</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{email}</p>
                </div>
              </div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                Votre devis précis vous sera envoyé sous 24h par notre équipe.
              </p>
              <Link
                href={`/audit?secteur=${secteur}&superficie=${superficie}&frequence=${frequence}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: "#F26522", boxShadow: "0 4px 12px rgba(242,101,34,0.4)" }}
              >
                Demander mon audit gratuit
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@entreprise.fr"
                className="h-11 w-full rounded-xl border-0 bg-white/10 px-4 text-sm text-white outline-none ring-2 ring-transparent transition placeholder:text-white/40 focus:ring-orange-400"
              />
              <button
                type="submit"
                disabled={submitState === "loading"}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "#F26522", boxShadow: "0 4px 12px rgba(242,101,34,0.4)" }}
              >
                {submitState === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Recevoir mon devis gratuit →
              </button>
              {submitState === "error" && message && (
                <p className="text-xs text-orange-300">{message}</p>
              )}
              <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.35)" }}>
                Estimation gratuite · Sans engagement · Réponse immédiate
              </p>
            </form>
          )}
        </div>
      </aside>
    </section>
  );
}

function EstimatorStep({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black text-white"
          style={{ background: "#1B3A2D" }}
        >
          {number}
        </span>
        <h3 className="text-lg font-bold" style={{ color: "#1B3A2D" }}>
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}
