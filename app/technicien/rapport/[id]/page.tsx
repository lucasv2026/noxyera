"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Plus, Trash2, Camera, X, Lock, CheckCircle, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"
import type SignatureCanvas from "react-signature-canvas"
import { SUPABASE_DEMO_MISSIONS_TODAY, SUPABASE_DEMO_TECH_PROFILE } from "@/lib/demo-data"

const SignaturePad = dynamic(
  () => import("@/components/technicien/SignaturePad").then((m) => m.SignaturePad),
  { ssr: false }
)

// ─── Zones ────────────────────────────────────────────────────────────────────
const ZONES = [
  { id: "cuisine",     label: "Cuisine",              icon: "🍳" },
  { id: "cave",        label: "Cave / Sous-sol",       icon: "🏚️" },
  { id: "reserves",    label: "Réserves",              icon: "📦" },
  { id: "exterieurs",  label: "Extérieurs / Terrasse", icon: "🌿" },
  { id: "vestiaires",  label: "Vestiaires",            icon: "👔" },
  { id: "poubelles",   label: "Local poubelles",       icon: "🗑️" },
  { id: "toiture",     label: "Toiture / Combles",     icon: "🏠" },
  { id: "salle",       label: "Salle de restauration", icon: "🪑" },
]

interface Produit {
  nom: string
  autorisation: string
  quantite: string
  unite: "mL" | "L" | "g" | "kg" | "pièces" | "pièges"
}

// ─── Barre de progression ──────────────────────────────────────────────────────
function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "28px" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", flex: i < total - 1 ? 1 : "unset" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 700,
              background: i < step ? "#1B3A2D" : i === step ? "#F26522" : "white",
              color: i <= step ? "white" : "#9CA3AF",
              border: i > step ? "1.5px solid #E5E7EB" : "none",
              flexShrink: 0,
            }}
          >
            {i < step ? <CheckCircle size={14} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div style={{ flex: 1, height: "2px", background: i < step ? "#1B3A2D" : "#E5E7EB", borderRadius: "1px" }} />
          )}
        </div>
      ))}
      <span style={{ marginLeft: "8px", fontSize: "12px", color: "#6B7280", whiteSpace: "nowrap" }}>
        Étape {step + 1}/{total}
      </span>
    </div>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function RapportPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const sigRef = useRef<any>(null)

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // État formulaire
  const [selectedZones, setSelectedZones] = useState<string[]>([])
  const [produits, setProduits] = useState<Produit[]>([
    { nom: "", autorisation: "", quantite: "", unite: "mL" },
  ])
  const [observations, setObservations] = useState("")
  const [presenceActive, setPresenceActive] = useState(false)
  const [recommandationSuivi, setRecommandationSuivi] = useState(false)
  const [photos, setPhotos] = useState<{ file: File; url: string; uploaded?: string }[]>([])

  // Récupère les infos de la mission (démo ou Supabase)
  const demoMission = SUPABASE_DEMO_MISSIONS_TODAY.find((m) => m.id === params.id)
    ?? SUPABASE_DEMO_MISSIONS_TODAY[0]

  // ── Zones ──────────────────────────────────────────────────────────────────
  function toggleZone(id: string) {
    setSelectedZones((prev) =>
      prev.includes(id) ? prev.filter((z) => z !== id) : [...prev, id]
    )
  }

  // ── Produits ───────────────────────────────────────────────────────────────
  function addProduit() {
    setProduits((p) => [...p, { nom: "", autorisation: "", quantite: "", unite: "mL" }])
  }
  function removeProduit(i: number) {
    setProduits((p) => p.filter((_, idx) => idx !== i))
  }
  function updateProduit(i: number, field: keyof Produit, value: string) {
    setProduits((p) => p.map((prod, idx) => idx === i ? { ...prod, [field]: value } : prod))
  }

  // ── Photos ─────────────────────────────────────────────────────────────────
  function handlePhotoAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const remaining = 8 - photos.length
    files.slice(0, remaining).forEach((file) => {
      const url = URL.createObjectURL(file)
      setPhotos((p) => [...p, { file, url }])
    })
    e.target.value = ""
  }
  function removePhoto(i: number) {
    setPhotos((p) => p.filter((_, idx) => idx !== i))
  }

  // ── Validation par étape ───────────────────────────────────────────────────
  function canProceed(): boolean {
    if (step === 0) return selectedZones.length > 0
    if (step === 1) return produits.length > 0 && produits.every((p) => p.nom.trim() !== "")
    if (step === 3) return photos.length > 0
    return true
  }

  // ── Génération PDF ─────────────────────────────────────────────────────────
  async function handleGenerate() {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      setError("Veuillez signer le rapport avant de le générer.")
      return
    }
    setError("")
    setLoading(true)

    try {
      const signatureDataUrl = sigRef.current.toDataURL("image/png")

      // Upload photos vers Supabase Storage
      const photoUrls: string[] = []
      const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

      if (!isDemoMode) {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        for (const p of photos) {
          const { data: uploadData } = await supabase.storage
            .from("rapports-photos")
            .upload(`${params.id}/${Date.now()}_${p.file.name}`, p.file)
          if (uploadData) {
            const { data: urlData } = supabase.storage
              .from("rapports-photos")
              .getPublicUrl(uploadData.path)
            photoUrls.push(urlData.publicUrl)
          }
        }
      } else {
        photoUrls.push(...photos.map((p) => p.url))
      }

      // Appel API génération PDF
      const res = await fetch("/api/rapport/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interventionId: params.id,
          technicienId: SUPABASE_DEMO_TECH_PROFILE.id,
          zonesTraitees: selectedZones.map((id) => ZONES.find((z) => z.id === id)?.label ?? id),
          produitsUtilises: produits.map((p) => `${p.nom} — AMM ${p.autorisation} — ${p.quantite} ${p.unite}`),
          observations,
          presenceActive,
          recommandationSuivi,
          photosUrl: photoUrls,
          signatureDataUrl,
          siteName: demoMission.sites?.nom ?? "—",
          siteAdresse: `${demoMission.sites?.adresse}, ${demoMission.sites?.ville} ${demoMission.sites?.code_postal}`,
          secteur: demoMission.sites?.secteur ?? "—",
          type: presenceActive ? "curatif" : demoMission.type,
          formule: demoMission.contracts?.formule ?? "essentiel",
          frequence: demoMission.contracts?.frequence ?? 4,
          technicienNom: `${SUPABASE_DEMO_TECH_PROFILE.prenom} ${SUPABASE_DEMO_TECH_PROFILE.nom}`,
          datePrevue: demoMission.date_prevue,
        }),
      })

      if (!res.ok) throw new Error("Erreur génération PDF")

      setSuccess(true)
      setTimeout(() => router.push("/technicien/missions?success=1"), 2000)
    } catch (e) {
      setError("Une erreur est survenue. Réessayez.")
    } finally {
      setLoading(false)
    }
  }

  // ─── Rendu étapes ─────────────────────────────────────────────────────────
  const TOTAL_STEPS = 5

  if (success) {
    return (
      <div style={{ maxWidth: "600px", margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>✅</div>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 8px" }}>
          Rapport généré avec succès !
        </h2>
        <p style={{ color: "#6B7280", fontSize: "14px" }}>
          Le PDF HACCP a été transmis au client. Redirection…
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "28px 20px 80px" }}>
      {/* Titre + site */}
      <div style={{ marginBottom: "8px" }}>
        <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Rapport d&apos;intervention HACCP
        </p>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1B3A2D", margin: 0 }}>
          {demoMission.sites?.nom ?? "—"}
        </h1>
        <p style={{ fontSize: "13px", color: "#6B7280", margin: "2px 0 0" }}>
          {demoMission.sites?.adresse}, {demoMission.sites?.ville}
        </p>
      </div>

      <div style={{ height: "1px", background: "#E5E7EB", margin: "16px 0 24px" }} />

      <StepBar step={step} total={TOTAL_STEPS} />

      {/* ── Étape 0 : Zones ── */}
      {step === 0 && (
        <div>
          <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 6px" }}>
            Zones traitées
          </h2>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 18px" }}>
            Sélectionnez toutes les zones inspectées (min. 1)
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {ZONES.map((z) => {
              const selected = selectedZones.includes(z.id)
              return (
                <button
                  key={z.id}
                  onClick={() => toggleZone(z.id)}
                  style={{
                    padding: "14px 12px",
                    borderRadius: "12px",
                    border: selected ? "2px solid #1B3A2D" : "1.5px solid #E5E7EB",
                    background: selected ? "#F0FDF4" : "white",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>{z.icon}</span>
                  <span style={{ fontSize: "13px", fontWeight: selected ? 700 : 400, color: selected ? "#1B3A2D" : "#374151" }}>
                    {z.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Étape 1 : Produits ── */}
      {step === 1 && (
        <div>
          <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 6px" }}>
            Produits utilisés
          </h2>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 18px" }}>
            Renseignez chaque produit biocide appliqué
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {produits.map((prod, i) => (
              <div
                key={i}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "16px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
                  position: "relative",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase" }}>
                    Produit {i + 1}
                  </span>
                  {produits.length > 1 && (
                    <button onClick={() => removeProduit(i)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                      <Trash2 size={14} style={{ color: "#EF4444" }} />
                    </button>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "#6B7280", display: "block", marginBottom: "4px" }}>
                      Nom du produit *
                    </label>
                    <input
                      value={prod.nom}
                      onChange={(e) => updateProduit(i, "nom", e.target.value)}
                      placeholder="ex: K-Othrine SC 7.5"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 600, color: "#6B7280", display: "block", marginBottom: "4px" }}>
                      N° autorisation biocide
                    </label>
                    <input
                      value={prod.autorisation}
                      onChange={(e) => updateProduit(i, "autorisation", e.target.value)}
                      placeholder="AMM-XXXXX"
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "11px", fontWeight: 600, color: "#6B7280", display: "block", marginBottom: "4px" }}>
                        Quantité
                      </label>
                      <input
                        value={prod.quantite}
                        onChange={(e) => updateProduit(i, "quantite", e.target.value)}
                        placeholder="50"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "11px", fontWeight: 600, color: "#6B7280", display: "block", marginBottom: "4px" }}>
                        Unité
                      </label>
                      <select
                        value={prod.unite}
                        onChange={(e) => updateProduit(i, "unite", e.target.value)}
                        style={{ ...inputStyle, width: "80px" }}
                      >
                        {["mL", "L", "g", "kg", "pièces", "pièges"].map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={addProduit}
            style={{
              marginTop: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              borderRadius: "10px",
              border: "1.5px dashed #D1D5DB",
              background: "transparent",
              color: "#6B7280",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <Plus size={14} />
            Ajouter un produit
          </button>
        </div>
      )}

      {/* ── Étape 2 : Observations ── */}
      {step === 2 && (
        <div>
          <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 6px" }}>
            Observations
          </h2>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 18px" }}>
            Décrivez vos constats sur site
          </p>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            rows={6}
            placeholder="Décrivez vos observations : présence de nuisibles, points d'entrée identifiés, recommandations..."
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1.5px solid #E5E7EB",
              fontSize: "14px",
              color: "#1A1A1A",
              background: "white",
              resize: "vertical",
              boxSizing: "border-box",
              outline: "none",
            }}
          />
          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <Toggle
              label="Présence active détectée"
              sub="Le type d'intervention sera changé en Curatif"
              value={presenceActive}
              onChange={setPresenceActive}
              accent
            />
            <Toggle
              label="Recommandation de suivi sous 15 jours"
              value={recommandationSuivi}
              onChange={setRecommandationSuivi}
            />
          </div>
        </div>
      )}

      {/* ── Étape 3 : Photos ── */}
      {step === 3 && (
        <div>
          <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 6px" }}>
            Photos
          </h2>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 18px" }}>
            Minimum 1 photo · maximum 8 · preuves horodatées
          </p>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "16px",
              borderRadius: "12px",
              border: "2px dashed #D1D5DB",
              background: "white",
              cursor: "pointer",
              marginBottom: "16px",
            }}
          >
            <Camera size={18} style={{ color: "#9CA3AF" }} />
            <span style={{ fontSize: "14px", color: "#6B7280", fontWeight: 500 }}>
              Ajouter des photos ({photos.length}/8)
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={handlePhotoAdd}
              style={{ display: "none" }}
              disabled={photos.length >= 8}
            />
          </label>

          {photos.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              {photos.map((p, i) => (
                <div key={i} style={{ position: "relative", borderRadius: "8px", overflow: "hidden", aspectRatio: "1" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button
                    onClick={() => removePhoto(i)}
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      background: "rgba(0,0,0,0.6)",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X size={11} style={{ color: "white" }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Étape 4 : Récapitulatif + Signature ── */}
      {step === 4 && (
        <div>
          <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 18px" }}>
            Récapitulatif & Signature
          </h2>

          {/* Recap */}
          <div style={{ background: "white", borderRadius: "12px", padding: "16px", marginBottom: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" }}>
            <RecapRow label="Site" value={demoMission.sites?.nom ?? "—"} />
            <RecapRow label="Adresse" value={`${demoMission.sites?.adresse}, ${demoMission.sites?.ville}`} />
            <RecapRow label="Date" value={new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} />
            <RecapRow label="Technicien" value={`${SUPABASE_DEMO_TECH_PROFILE.prenom} ${SUPABASE_DEMO_TECH_PROFILE.nom} — Certifié Certibiocide`} />
            <RecapRow
              label="Type"
              value={presenceActive ? "Curatif (présence active)" : demoMission.type === "preventif" ? "Préventif" : demoMission.type}
            />
            <RecapRow label="Zones traitées" value={selectedZones.map((id) => ZONES.find((z) => z.id === id)?.label).join(", ") || "—"} />
            <RecapRow label="Produits" value={`${produits.filter((p) => p.nom).length} produit(s)`} />
            <RecapRow label="Photos" value={`${photos.length} photo(s) uploadée(s)`} />
            {recommandationSuivi && (
              <RecapRow label="Suivi" value="Recommandé sous 15 jours" highlight />
            )}
          </div>

          {/* Signature */}
          <div style={{ background: "white", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.07)", marginBottom: "20px" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#374151", margin: "0 0 10px" }}>
              Signez ici pour valider le rapport
            </p>
            <div style={{ border: "1.5px solid #E5E7EB", borderRadius: "8px", overflow: "hidden", background: "#FAFAFA" }}>
              <SignaturePad ref={sigRef} penColor="#1B3A2D" width={540} height={150} />
            </div>
            <button
              onClick={() => sigRef.current?.clear()}
              style={{
                marginTop: "8px",
                fontSize: "12px",
                color: "#6B7280",
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Effacer
            </button>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: "8px", background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: "13px", marginBottom: "12px" }}>
              {error}
            </div>
          )}

          {/* Bouton générer */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "16px",
              borderRadius: "12px",
              border: "none",
              background: loading ? "#9CA3AF" : "#F26522",
              color: "white",
              fontSize: "16px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 4px 14px rgba(242,101,34,0.4)",
            }}
          >
            {loading ? (
              <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Génération en cours…</>
            ) : (
              <><Lock size={16} /> Générer le rapport HACCP</>
            )}
          </button>
        </div>
      )}

      {/* ── Navigation ── */}
      {step < 4 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "28px", gap: "12px" }}>
          <button
            onClick={() => step > 0 && setStep(step - 1)}
            disabled={step === 0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "12px 20px",
              borderRadius: "10px",
              border: "1.5px solid #E5E7EB",
              background: "white",
              color: step === 0 ? "#D1D5DB" : "#374151",
              fontSize: "14px",
              fontWeight: 600,
              cursor: step === 0 ? "not-allowed" : "pointer",
            }}
          >
            <ChevronLeft size={15} /> Retour
          </button>
          <button
            onClick={() => canProceed() && setStep(step + 1)}
            disabled={!canProceed()}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "12px 20px",
              borderRadius: "10px",
              border: "none",
              background: canProceed() ? "#1B3A2D" : "#E5E7EB",
              color: canProceed() ? "white" : "#9CA3AF",
              fontSize: "14px",
              fontWeight: 700,
              cursor: canProceed() ? "pointer" : "not-allowed",
            }}
          >
            Suivant <ChevronRight size={15} />
          </button>
        </div>
      )}
      {step === 4 && (
        <button
          onClick={() => setStep(3)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "12px 20px",
            borderRadius: "10px",
            border: "1.5px solid #E5E7EB",
            background: "white",
            color: "#374151",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            marginTop: "12px",
          }}
        >
          <ChevronLeft size={15} /> Retour
        </button>
      )}
    </div>
  )
}

// ─── Sous-composants ───────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: "8px",
  border: "1.5px solid #E5E7EB",
  fontSize: "13px",
  color: "#1A1A1A",
  background: "#F9FAFB",
  outline: "none",
  boxSizing: "border-box",
}

function Toggle({
  label,
  sub,
  value,
  onChange,
  accent,
}: {
  label: string
  sub?: string
  value: boolean
  onChange: (v: boolean) => void
  accent?: boolean
}) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        borderRadius: "10px",
        background: value && accent ? "#FFF7F3" : "white",
        border: value && accent ? "1.5px solid #F26522" : "1.5px solid #E5E7EB",
        cursor: "pointer",
        gap: "12px",
      }}
    >
      <div>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "#1B3A2D", margin: 0 }}>{label}</p>
        {sub && <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "2px 0 0" }}>{sub}</p>}
      </div>
      <div
        style={{
          width: "42px",
          height: "24px",
          borderRadius: "12px",
          background: value ? (accent ? "#F26522" : "#1B3A2D") : "#E5E7EB",
          position: "relative",
          flexShrink: 0,
          transition: "background 0.2s",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "3px",
            left: value ? "21px" : "3px",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            background: "white",
            transition: "left 0.2s",
          }}
        />
      </div>
    </div>
  )
}

function RecapRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", gap: "12px", padding: "8px 0", borderBottom: "1px solid #F9FAFB" }}>
      <span style={{ fontSize: "12px", color: "#9CA3AF", minWidth: "110px", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "13px", fontWeight: 500, color: highlight ? "#F26522" : "#374151" }}>{value}</span>
    </div>
  )
}
