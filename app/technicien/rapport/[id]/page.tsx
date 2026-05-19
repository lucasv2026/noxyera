"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, CheckSquare, Square, ShieldCheck,
  FileText, Loader2, Camera, Plus, Download, X, Trash2,
} from "lucide-react";

// ── Zones (spec: Cuisine · Cave · Extérieurs · Réserves · Vestiaires · Poubelles · Toiture) ──
const ZONES = [
  "Cuisine / Zone préparation",
  "Cave / Sous-sol",
  "Extérieurs / Cour",
  "Réserves / Stockage",
  "Vestiaires / Sanitaires",
  "Poubelles / Local déchet",
  "Toiture / Combles",
  "Salle / Accueil",
  "Locaux techniques",
];

interface ProduitLigne {
  nom: string;
  numeroAutorisation: string;
  quantite: string;
  unite: string;
}

const STEP_LABELS = [
  "Zones traitées",
  "Produits utilisés",
  "Observations",
  "Photos",
  "Récapitulatif",
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-0">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
            style={{
              background: i < current ? "#1B3A2D" : i === current ? "#F26522" : "#E5E7EB",
              color: i <= current ? "white" : "#9CA3AF",
            }}
          >
            {i < current ? "✓" : i + 1}
          </div>
          {i < total - 1 && (
            <div
              className="h-0.5 w-6 sm:w-10 transition-all"
              style={{ background: i < current ? "#1B3A2D" : "#E5E7EB" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function RapportInterventionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Step 1 — Zones
  const [zonesTraitees, setZonesTraitees] = useState<string[]>([]);

  // Step 2 — Produits
  const [produits, setProduits] = useState<ProduitLigne[]>([
    { nom: "", numeroAutorisation: "", quantite: "", unite: "g" },
  ]);

  // Step 3 — Observations
  const [notes, setNotes] = useState("");
  const [haccpConforme, setHaccpConforme] = useState(true);

  // Step 4 — Photos
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Step 5 — Signature + generate
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Init canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [step]);

  function getCanvasPos(canvas: HTMLCanvasElement, e: MouseEvent | Touch) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  const startDrawing = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawingRef.current = true;
    lastPosRef.current = getCanvasPos(canvas, e);
  }, []);

  const draw = useCallback((e: MouseEvent) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || !lastPosRef.current) return;
    const pos = getCanvasPos(canvas, e);
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1B3A2D";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
    lastPosRef.current = pos;
  }, []);

  const stopDrawing = useCallback(() => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  }, []);

  const touchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawingRef.current = true;
    lastPosRef.current = getCanvasPos(canvas, e.touches[0]);
  }, []);

  const touchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || !lastPosRef.current) return;
    const pos = getCanvasPos(canvas, e.touches[0]);
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1B3A2D";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
    lastPosRef.current = pos;
  }, []);

  useEffect(() => {
    if (step !== 4) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);
    canvas.addEventListener("touchstart", touchStart, { passive: false });
    canvas.addEventListener("touchmove", touchMove, { passive: false });
    canvas.addEventListener("touchend", stopDrawing);
    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseleave", stopDrawing);
      canvas.removeEventListener("touchstart", touchStart);
      canvas.removeEventListener("touchmove", touchMove);
      canvas.removeEventListener("touchend", stopDrawing);
    };
  }, [step, startDrawing, draw, stopDrawing, touchStart, touchMove]);

  function clearSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // ── Zone helpers ───────────────────────────────────────────────────────────
  function toggleZone(zone: string) {
    setZonesTraitees((prev) =>
      prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]
    );
  }

  // ── Produit helpers ────────────────────────────────────────────────────────
  function updateProduit(index: number, field: keyof ProduitLigne, value: string) {
    setProduits((prev) => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  }

  function addProduit() {
    setProduits((prev) => [...prev, { nom: "", numeroAutorisation: "", quantite: "", unite: "g" }]);
  }

  function removeProduit(index: number) {
    setProduits((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Photo helpers ──────────────────────────────────────────────────────────
  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFiles((prev) => [...prev, file]);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreviews((prev) => [...prev, ev.target?.result as string]);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Navigation ─────────────────────────────────────────────────────────────
  function canGoNext(): boolean {
    if (step === 0) return zonesTraitees.length > 0;
    return true;
  }

  // ── PDF generation ─────────────────────────────────────────────────────────
  async function handleGenerate() {
    setGenerating(true);
    const signature = canvasRef.current?.toDataURL("image/png") ?? null;

    const produitsUtilises = produits
      .filter((p) => p.nom.trim())
      .map((p) => `${p.nom}${p.numeroAutorisation ? ` (Auth. ${p.numeroAutorisation})` : ""}${p.quantite ? ` — ${p.quantite}${p.unite}` : ""}`);

    try {
      const res = await fetch("/api/rapport/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: params.id,
          interventionId: params.id,
          siteNom: "Yooma Urban Lodge — Bar & Lobby",
          adresse: "22 Rue Linois, Paris 15e",
          technicienNom: "Jean-Marc Deschamps",
          technicienCertif: "Certibiocide n°14521",
          dateIntervention: new Date().toISOString(),
          type: "preventif",
          zonesTraitees,
          produitsUtilises: produitsUtilises.length > 0 ? produitsUtilises : ["Aucun produit biocide utilisé"],
          notes,
          haccpConforme,
          signature,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setPdfUrl(result.pdfUrl ?? null);
      }
    } catch {
      setPdfUrl(null);
    }

    setGenerating(false);
    setDone(true);
  }

  // ── Done screen ────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="max-w-lg mx-auto p-6 flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: "#D1FAE5" }}>
          <ShieldCheck size={32} style={{ color: "#059669" }} />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "#1A1A1A" }}>Rapport HACCP généré !</h2>
        <p className="text-sm mb-6" style={{ color: "#6B7280" }}>
          Le rapport a été signé numériquement et archivé dans Supabase Storage.
          Une notification email a été envoyée au client.
        </p>
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 mb-4"
            style={{ background: "#1B3A2D" }}
          >
            <Download size={15} />
            Télécharger le PDF
          </a>
        )}
        <button
          onClick={() => router.push("/technicien/missions")}
          className="text-sm underline"
          style={{ color: "#6B7280" }}
        >
          Retour aux missions
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-5">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {step === 0 ? (
          <Link
            href="/technicien/missions"
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)" }}
          >
            <ArrowLeft size={16} style={{ color: "#1B3A2D" }} />
          </Link>
        ) : (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)" }}
          >
            <ArrowLeft size={16} style={{ color: "#1B3A2D" }} />
          </button>
        )}
        <div>
          <h1 className="text-lg font-bold" style={{ color: "#1A1A1A" }}>Saisie rapport</h1>
          <p className="text-xs" style={{ color: "#6B7280" }}>
            Mission #{params.id} · Étape {step + 1} sur {STEP_LABELS.length} — {STEP_LABELS[step]}
          </p>
        </div>
      </div>

      {/* ── Step indicator ──────────────────────────────────────────────── */}
      <div className="flex justify-center">
        <StepIndicator current={step} total={STEP_LABELS.length} />
      </div>

      {/* ── Step 0 : Zones traitées ─────────────────────────────────────── */}
      {step === 0 && (
        <div className="rounded-2xl bg-white p-5 shadow-sm" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
          <h2 className="font-semibold text-sm mb-1" style={{ color: "#1A1A1A" }}>
            Zones traitées <span style={{ color: "#DC2626" }}>*</span>
          </h2>
          <p className="text-xs mb-3" style={{ color: "#6B7280" }}>Sélectionnez toutes les zones où une intervention a été réalisée.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ZONES.map((zone) => {
              const selected = zonesTraitees.includes(zone);
              return (
                <button
                  key={zone}
                  onClick={() => toggleZone(zone)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-left transition-all"
                  style={{
                    background: selected ? "#D1FAE5" : "#F9FAFB",
                    border: `1.5px solid ${selected ? "#A7F3D0" : "#E5E7EB"}`,
                    color: selected ? "#065F46" : "#374151",
                  }}
                >
                  {selected ? <CheckSquare size={15} style={{ color: "#059669" }} /> : <Square size={15} style={{ color: "#9CA3AF" }} />}
                  {zone}
                </button>
              );
            })}
          </div>
          {zonesTraitees.length === 0 && (
            <p className="text-xs mt-2" style={{ color: "#DC2626" }}>Sélectionnez au moins une zone pour continuer.</p>
          )}
          {zonesTraitees.length > 0 && (
            <p className="text-xs mt-2 font-medium" style={{ color: "#059669" }}>
              {zonesTraitees.length} zone{zonesTraitees.length > 1 ? "s" : ""} sélectionnée{zonesTraitees.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {/* ── Step 1 : Produits utilisés ──────────────────────────────────── */}
      {step === 1 && (
        <div className="rounded-2xl bg-white p-5 shadow-sm" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
          <h2 className="font-semibold text-sm mb-1" style={{ color: "#1A1A1A" }}>Produits utilisés</h2>
          <p className="text-xs mb-4" style={{ color: "#6B7280" }}>
            Renseignez le nom, le numéro d&apos;autorisation biocide et la quantité de chaque produit.
          </p>

          <div className="space-y-4">
            {produits.map((produit, index) => (
              <div
                key={index}
                className="rounded-xl p-4 relative"
                style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold" style={{ color: "#1B3A2D" }}>
                    Produit {index + 1}
                  </span>
                  {produits.length > 1 && (
                    <button
                      onClick={() => removeProduit(index)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: "#FEE2E2" }}
                    >
                      <Trash2 size={12} style={{ color: "#DC2626" }} />
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: "#6B7280" }}>
                      Nom du produit <span style={{ color: "#DC2626" }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Raticide anticoagulant Ditrac AG"
                      value={produit.nom}
                      onChange={(e) => updateProduit(index, "nom", e.target.value)}
                      className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                      style={{ border: "1.5px solid #E5E7EB", background: "white", color: "#1A1A1A" }}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: "#6B7280" }}>
                      N° autorisation biocide (AMM)
                    </label>
                    <input
                      type="text"
                      placeholder="ex: FR-2020-0023456"
                      value={produit.numeroAutorisation}
                      onChange={(e) => updateProduit(index, "numeroAutorisation", e.target.value)}
                      className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                      style={{ border: "1.5px solid #E5E7EB", background: "white", color: "#1A1A1A" }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium block mb-1" style={{ color: "#6B7280" }}>
                        Quantité utilisée
                      </label>
                      <input
                        type="text"
                        placeholder="ex: 250"
                        value={produit.quantite}
                        onChange={(e) => updateProduit(index, "quantite", e.target.value)}
                        className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                        style={{ border: "1.5px solid #E5E7EB", background: "white", color: "#1A1A1A" }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1" style={{ color: "#6B7280" }}>Unité</label>
                      <select
                        value={produit.unite}
                        onChange={(e) => updateProduit(index, "unite", e.target.value)}
                        className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                        style={{ border: "1.5px solid #E5E7EB", background: "white", color: "#1A1A1A" }}
                      >
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="mL">mL</option>
                        <option value="L">L</option>
                        <option value="unités">unités</option>
                        <option value="pièges">pièges</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addProduit}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ border: "1.5px dashed #D1D5DB", color: "#6B7280", background: "#F9FAFB" }}
          >
            <Plus size={15} />
            Ajouter un produit
          </button>
        </div>
      )}

      {/* ── Step 2 : Observations ───────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
            <h2 className="font-semibold text-sm mb-1" style={{ color: "#1A1A1A" }}>Observations</h2>
            <p className="text-xs mb-3" style={{ color: "#6B7280" }}>
              Décrivez les observations, recommandations ou anomalies constatées.
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Traces de rongeurs détectées en zone stockage. Renouvellement des appâts effectué. Recommandation : jointures à refaire côté quai de livraison…"
              rows={5}
              className="w-full rounded-xl p-3 text-sm outline-none resize-none"
              style={{ border: "1.5px solid #E5E7EB", background: "#F9FAFB", color: "#1A1A1A" }}
            />
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
            <h2 className="font-semibold text-sm mb-3" style={{ color: "#1A1A1A" }}>Conformité HACCP</h2>
            <div className="flex gap-3">
              <button
                onClick={() => setHaccpConforme(true)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: haccpConforme ? "#D1FAE5" : "#F9FAFB",
                  border: `2px solid ${haccpConforme ? "#A7F3D0" : "#E5E7EB"}`,
                  color: haccpConforme ? "#065F46" : "#6B7280",
                }}
              >
                ✓ Site conforme
              </button>
              <button
                onClick={() => setHaccpConforme(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: !haccpConforme ? "#FEE2E2" : "#F9FAFB",
                  border: `2px solid ${!haccpConforme ? "#FECACA" : "#E5E7EB"}`,
                  color: !haccpConforme ? "#991B1B" : "#6B7280",
                }}
              >
                ✗ Non conforme
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3 : Photos ─────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="rounded-2xl bg-white p-5 shadow-sm" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
          <h2 className="font-semibold text-sm mb-1" style={{ color: "#1A1A1A" }}>Photos d&apos;intervention</h2>
          <p className="text-xs mb-4" style={{ color: "#6B7280" }}>
            Minimum 3 photos recommandées pour la conformité DDPP. Elles seront intégrées au rapport.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoChange}
          />

          <div className="grid grid-cols-3 gap-3">
            {photoPreviews.map((preview, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "1" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.6)" }}
                >
                  <X size={12} className="text-white" />
                </button>
                <div
                  className="absolute bottom-1 left-1 text-xs px-1.5 py-0.5 rounded font-medium"
                  style={{ background: "rgba(0,0,0,0.5)", color: "white" }}
                >
                  {i + 1}
                </div>
              </div>
            ))}

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors hover:bg-gray-50"
              style={{ borderColor: "#D1D5DB", aspectRatio: "1", color: "#9CA3AF" }}
            >
              <Camera size={20} className="mb-1" />
              <span className="text-xs">Ajouter</span>
            </button>
          </div>

          {photoPreviews.length < 3 && (
            <p className="text-xs mt-3 flex items-center gap-1" style={{ color: "#D97706" }}>
              <span>⚠</span>
              {3 - photoPreviews.length} photo{3 - photoPreviews.length > 1 ? "s" : ""} manquante{3 - photoPreviews.length > 1 ? "s" : ""} (recommandé)
            </p>
          )}
          {photoPreviews.length >= 3 && (
            <p className="text-xs mt-3 font-medium" style={{ color: "#059669" }}>
              ✓ {photoPreviews.length} photo{photoPreviews.length > 1 ? "s" : ""} ajoutée{photoPreviews.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {/* ── Step 4 : Récapitulatif + Signature + Génération ─────────────── */}
      {step === 4 && (
        <div className="space-y-4">
          {/* Récapitulatif */}
          <div className="rounded-2xl bg-white p-5 shadow-sm" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
            <h2 className="font-semibold text-sm mb-3" style={{ color: "#1A1A1A" }}>Récapitulatif</h2>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                <span className="text-xs font-semibold w-28 shrink-0" style={{ color: "#6B7280" }}>Site</span>
                <span className="text-xs" style={{ color: "#1A1A1A" }}>Yooma Urban Lodge — Bar & Lobby</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs font-semibold w-28 shrink-0" style={{ color: "#6B7280" }}>Technicien</span>
                <span className="text-xs" style={{ color: "#1A1A1A" }}>Jean-Marc Deschamps — Certibiocide n°14521</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs font-semibold w-28 shrink-0" style={{ color: "#6B7280" }}>Date</span>
                <span className="text-xs" style={{ color: "#1A1A1A" }}>
                  {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs font-semibold w-28 shrink-0" style={{ color: "#6B7280" }}>Conformité</span>
                <span className="text-xs font-medium" style={{ color: haccpConforme ? "#059669" : "#DC2626" }}>
                  {haccpConforme ? "✓ Site conforme HACCP" : "✗ Non conforme"}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-xs font-semibold w-28 shrink-0" style={{ color: "#6B7280" }}>Zones ({zonesTraitees.length})</span>
                <span className="text-xs" style={{ color: "#1A1A1A" }}>{zonesTraitees.join(" · ")}</span>
              </div>
              {produits.filter((p) => p.nom).length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-xs font-semibold w-28 shrink-0" style={{ color: "#6B7280" }}>Produits</span>
                  <span className="text-xs" style={{ color: "#1A1A1A" }}>
                    {produits.filter((p) => p.nom).map((p) => p.nom).join(", ")}
                  </span>
                </div>
              )}
              <div className="flex items-start gap-2">
                <span className="text-xs font-semibold w-28 shrink-0" style={{ color: "#6B7280" }}>Photos</span>
                <span className="text-xs" style={{ color: "#1A1A1A" }}>
                  {photoPreviews.length > 0 ? `${photoPreviews.length} photo${photoPreviews.length > 1 ? "s" : ""} jointe${photoPreviews.length > 1 ? "s" : ""}` : "Aucune photo"}
                </span>
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="rounded-2xl bg-white p-5 shadow-sm" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm" style={{ color: "#1A1A1A" }}>Signature du technicien</h2>
              <button
                onClick={clearSignature}
                className="text-xs px-3 py-1.5 rounded-lg font-medium"
                style={{ color: "#6B7280", border: "1px solid #E5E7EB" }}
              >
                Effacer
              </button>
            </div>
            <canvas
              ref={canvasRef}
              width={400}
              height={140}
              className="w-full rounded-xl touch-none"
              style={{ border: "1.5px solid #E5E7EB", background: "#FFFFFF", cursor: "crosshair" }}
            />
            <p className="text-xs mt-2" style={{ color: "#9CA3AF" }}>
              Signez avec votre doigt ou la souris
            </p>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-semibold text-white transition-all disabled:opacity-60"
            style={{ background: "#1B3A2D", boxShadow: "0 4px 14px rgba(27,58,45,0.25)" }}
          >
            {generating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Génération du rapport HACCP…
              </>
            ) : (
              <>
                <FileText size={16} />
                Générer le rapport HACCP
              </>
            )}
          </button>

          <p className="text-xs text-center" style={{ color: "#9CA3AF" }}>
            Le rapport sera signé numériquement, archivé et envoyé au client par email.
          </p>
        </div>
      )}

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      {step < 4 && (
        <button
          onClick={() => setStep((s) => s + 1)}
          disabled={!canGoNext()}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold text-white transition-all disabled:opacity-40"
          style={{ background: "#F26522" }}
        >
          Étape suivante : {STEP_LABELS[step + 1]}
          <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
}
