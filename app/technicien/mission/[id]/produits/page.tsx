"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Camera, Plus, X } from "lucide-react"

function ProgressBar({ step }: { step: number }) {
  const total = 4
  const pct = (step / total) * 100
  return (
    <div style={{ marginBottom: "28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#F26522" }}>Étape {step}/{total}</span>
        <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Photos & Produits</span>
      </div>
      <div style={{ height: "6px", background: "#E5E7EB", borderRadius: "99px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "#F26522", borderRadius: "99px", transition: "width 0.3s" }} />
      </div>
    </div>
  )
}

interface ProduitLine {
  id: string
  nom: string
  biocide: string
  quantite: string
}

interface PhotoPreview {
  id: string
  url: string
  file: File
}

export default function ProduitsPage() {
  const params = useParams()
  const router = useRouter()
  const missionId = params?.id as string

  const [photos, setPhotos] = useState<PhotoPreview[]>([])
  const [produits, setProduits] = useState<ProduitLine[]>([
    { id: "p1", nom: "", biocide: "", quantite: "" },
  ])
  const [prefillDate, setPrefillDate] = useState<string | null>(null)
  const [prefillDismissed, setPrefillDismissed] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Try prefill from localStorage
    const prefillKey = `mission-${missionId}-prefill`
    const stored = localStorage.getItem(prefillKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.produits && Array.isArray(parsed.produits) && parsed.produits.length > 0) {
          setProduits(
            parsed.produits.map((p: Partial<ProduitLine>, i: number) => ({
              id: `prefill-${i}`,
              nom: p.nom ?? "",
              biocide: p.biocide ?? "",
              quantite: p.quantite ?? "",
            }))
          )
          if (parsed.date) setPrefillDate(parsed.date)
        }
      } catch {
        // Ignore
      }
    }
  }, [missionId])

  function handlePhotoCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const newPhotos = files.map((file) => ({
      id: `photo-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      file,
    }))
    setPhotos((prev) => [...prev, ...newPhotos])
    // Reset input so same file can be added again
    e.target.value = ""
  }

  function removePhoto(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  function updateProduit(id: string, field: keyof ProduitLine, value: string) {
    setProduits((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  function removeProduit(id: string) {
    setProduits((prev) => prev.filter((p) => p.id !== id))
  }

  function addProduit() {
    setProduits((prev) => [...prev, { id: `p-${Date.now()}`, nom: "", biocide: "", quantite: "" }])
  }

  function handleReset() {
    setProduits([{ id: "p1", nom: "", biocide: "", quantite: "" }])
    setPrefillDismissed(true)
  }

  function handleContinue() {
    if (photos.length === 0) return

    if (typeof window !== "undefined") {
      // Save produits to localStorage for signature recap
      localStorage.setItem(`mission-${missionId}-produits`, JSON.stringify(produits))
      // Save photo count (can't store files in localStorage)
      localStorage.setItem(`mission-${missionId}-photos-count`, String(photos.length))
    }

    // Store photos in a ref accessible across navigation via sessionStorage keys
    // We store photo URLs in sessionStorage for the signature page to preview
    if (typeof window !== "undefined") {
      try {
        const urls = photos.map((p) => p.url)
        sessionStorage.setItem(`mission-${missionId}-photo-urls`, JSON.stringify(urls))
      } catch {
        // Storage quota — ignore
      }
    }

    router.push(`/technicien/mission/${missionId}/signature`)
  }

  const inputStyle: React.CSSProperties = {
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "15px",
    width: "100%",
    outline: "none",
    boxSizing: "border-box",
    color: "#1A1A1A",
    background: "white",
  }

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 20px 120px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <button
          onClick={() => router.push(`/technicien/mission/${missionId}/zones`)}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", color: "#6B7280", fontSize: "14px", padding: 0 }}
        >
          <ArrowLeft size={16} /> Retour
        </button>
      </div>

      <ProgressBar step={3} />

      {/* ── PHOTOS ── */}
      <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 12px" }}>
        Photos de l&apos;intervention
      </h2>

      <label style={{ display: "block", cursor: "pointer", marginBottom: "16px" }}>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          style={{ display: "none" }}
          onChange={handlePhotoCapture}
        />
        <div style={{
          border: "2px dashed #D1D5DB",
          borderRadius: "12px",
          padding: "28px 24px",
          textAlign: "center",
          background: "white",
          transition: "border-color 0.15s",
        }}>
          <Camera size={32} color="#9CA3AF" style={{ margin: "0 auto 8px" }} />
          <p style={{ fontSize: "15px", fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>
            Appuyez pour prendre une photo
          </p>
          <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>
            ou sélectionner depuis la galerie
          </p>
        </div>
      </label>

      {photos.length > 0 && (
        <>
          <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 10px" }}>
            {photos.length} photo{photos.length > 1 ? "s" : ""} ajoutée{photos.length > 1 ? "s" : ""}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "24px" }}>
            {photos.map((photo) => (
              <div key={photo.id} style={{ position: "relative" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt=""
                  style={{ width: "100%", height: "100px", borderRadius: "8px", objectFit: "cover", display: "block" }}
                />
                <button
                  onClick={() => removePhoto(photo.id)}
                  style={{
                    position: "absolute", top: "4px", right: "4px",
                    width: "20px", height: "20px",
                    borderRadius: "50%", background: "#EF4444", border: "none",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <X size={10} color="white" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── PRODUITS ── */}
      <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 12px" }}>
        Produits utilisés
      </h2>

      {/* Prefill banner */}
      {prefillDate && !prefillDismissed && produits.some((p) => p.nom) && (
        <div style={{
          background: "#D1FAE5", border: "1px solid #A7F3D0", borderRadius: "10px",
          padding: "12px 16px", marginBottom: "16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: "13px", color: "#065F46", fontWeight: 500 }}>
            Pré-rempli depuis le passage du{" "}
            {new Date(prefillDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          <button
            onClick={handleReset}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#065F46", display: "flex", alignItems: "center" }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
        {produits.map((produit, idx) => (
          <div
            key={produit.id}
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase" }}>
                Produit {idx + 1}
              </span>
              {produits.length > 1 && (
                <button
                  onClick={() => removeProduit(produit.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", display: "flex", alignItems: "center" }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <input
                type="text"
                placeholder="Nom du produit"
                value={produit.nom}
                onChange={(e) => updateProduit(produit.id, "nom", e.target.value)}
                style={inputStyle}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="N° biocide / AMM"
                  value={produit.biocide}
                  onChange={(e) => updateProduit(produit.id, "biocide", e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Quantité + unité"
                  value={produit.quantite}
                  onChange={(e) => updateProduit(produit.id, "quantite", e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add product button */}
      <button
        onClick={addProduit}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "10px",
          background: "none",
          border: "2px solid #1B3A2D",
          color: "#1B3A2D",
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          marginBottom: "32px",
        }}
      >
        <Plus size={16} /> Ajouter un produit
      </button>

      {/* Sticky footer */}
      <div style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        padding: "16px 24px",
        background: "white",
        borderTop: "1px solid #E5E7EB",
      }}>
        <div style={{ maxWidth: "480px", margin: "0 auto" }}>
          {photos.length === 0 && (
            <p style={{ fontSize: "12px", color: "#F26522", textAlign: "center", margin: "0 0 8px", fontWeight: 500 }}>
              Au moins 1 photo requise pour continuer
            </p>
          )}
          <button
            onClick={handleContinue}
            disabled={photos.length === 0}
            style={{
              width: "100%",
              height: "52px",
              borderRadius: "10px",
              background: "#1B3A2D",
              color: "white",
              fontSize: "16px",
              fontWeight: 700,
              border: "none",
              cursor: photos.length === 0 ? "not-allowed" : "pointer",
              opacity: photos.length === 0 ? 0.4 : 1,
              transition: "opacity 0.15s",
            }}
          >
            Continuer →
          </button>
        </div>
      </div>
    </div>
  )
}
