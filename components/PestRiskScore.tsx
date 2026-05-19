"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { calculerScoreRisque } from "@/lib/riskScore";
import { secteurs, type Secteur } from "@/lib/pricing";

const NIVEAU_COLOR: Record<string, string> = {
  faible:   "#10B981",
  modere:   "#F59E0B",
  eleve:    "#F97316",
  critique: "#DC2626",
};

const NIVEAU_LABEL: Record<string, string> = {
  faible:   "Faible",
  modere:   "Modéré",
  eleve:    "Élevé",
  critique: "Critique",
};

function extractArrondissement(adresse: string): number | undefined {
  const m = adresse.match(/\b(7500[1-9]|750[1-9]\d|7520\d)\b/)
    ?? adresse.match(/\b([1-9]|1\d|20)\s*(?:er|ème|eme|e)\b/i);
  if (!m) return undefined;
  const raw = parseInt(m[1], 10);
  if (raw > 75000) return raw - 75000;
  return raw;
}

export function PestRiskScore({ onSecteurSelect }: { onSecteurSelect?: (s: Secteur) => void }) {
  const [adresse, setAdresse] = useState("");
  const [secteur, setSecteur] = useState<Secteur>("restaurant");
  const [result, setResult] = useState<ReturnType<typeof calculerScoreRisque> | null>(null);
  const [animScore, setAnimScore] = useState(0);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function handleAnalyse() {
    const arr = extractArrondissement(adresse);
    const res = calculerScoreRisque({ secteur, arrondissement: arr });
    setResult(res);
    setAnimScore(0);

    if (animRef.current) clearInterval(animRef.current);
    const target = res.score;
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    animRef.current = setInterval(() => {
      current = Math.min(current + increment, target);
      setAnimScore(Math.round(current * 10) / 10);
      if (current >= target) clearInterval(animRef.current!);
    }, duration / steps);
  }

  useEffect(() => () => { if (animRef.current) clearInterval(animRef.current); }, []);

  const color = result ? NIVEAU_COLOR[result.niveau] : "#10B981";
  const gaugePct = result ? (animScore / 10) * 100 : 0;

  return (
    <section
      id="risk-score"
      className="bg-white px-6 py-16"
    >
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: "#F26522" }}>
          Diagnostic gratuit
        </p>
        <h2 className="text-3xl font-bold" style={{ color: "#1B3A2D" }}>
          Votre établissement est-il à risque ?
        </h2>
        <p className="mt-3 text-sm leading-6 text-gray-500">
          Renseignez votre adresse et secteur pour obtenir votre score de risque sanitaire instantané.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_200px_auto]">
          <div className="relative">
            <MapPin
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="Ex: 12 rue de la Paix, Paris 75001"
              className="h-12 w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-4 text-sm outline-none focus:ring-2"
              style={{ "--tw-ring-color": "#1B3A2D" } as React.CSSProperties}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyse()}
            />
          </div>

          <select
            value={secteur}
            onChange={(e) => setSecteur(e.target.value as Secteur)}
            className="h-12 rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm text-gray-700 outline-none focus:ring-2"
            style={{ "--tw-ring-color": "#1B3A2D" } as React.CSSProperties}
          >
            {secteurs.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>

          <button
            onClick={handleAnalyse}
            className="h-12 rounded-xl px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#1B3A2D" }}
          >
            Analyser
          </button>
        </div>

        {result && (
          <div
            className="mt-8 rounded-2xl p-6"
            style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Score de risque
              </p>
              <span
                className="rounded-full px-3 py-1 text-xs font-bold text-white"
                style={{ background: color }}
              >
                {NIVEAU_LABEL[result.niveau]}
              </span>
            </div>

            {/* Gauge */}
            <div className="mb-2 flex items-end gap-2">
              <span className="text-5xl font-bold" style={{ color }}>
                {animScore.toFixed(1)}
              </span>
              <span className="mb-1 text-lg font-medium text-gray-400">/10</span>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${gaugePct}%`,
                  background: `linear-gradient(90deg, #10B981 0%, ${color} 100%)`,
                  transition: "width 0.05s linear",
                }}
              />
            </div>

            <p className="mt-5 text-sm leading-6 text-gray-700">
              {result.message}
            </p>

            <button
              onClick={() => {
                onSecteurSelect?.(secteur);
                document.getElementById("estimateur")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#F26522" }}
            >
              Sécuriser mon établissement
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
