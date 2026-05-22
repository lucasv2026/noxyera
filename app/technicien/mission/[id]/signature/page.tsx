"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Check } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

interface ProduitLine {
  id: string
  nom: string
  biocide: string
  quantite: string
}

interface TechProfile {
  id: string
  prenom: string
  nom: string
  numero_certif: string | null
  user_id: string
}

interface SiteInfo {
  nom: string
  adresse: string
  secteur: string
}

interface InterventionInfo {
  id: string
  type: string
  date_prevue: string
  technicien_id: string | null
  sites: SiteInfo | null
}

type State = "idle" | "loading" | "success"

function ProgressBar({ step }: { step: number }) {
  const total = 4
  const pct = (step / total) * 100
  return (
    <div style={{ marginBottom: "28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#F26522" }}>Étape {step}/{total}</span>
        <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Signature & Clôture</span>
      </div>
      <div style={{ height: "6px", background: "#E5E7EB", borderRadius: "99px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "#F26522", borderRadius: "99px", transition: "width 0.3s" }} />
      </div>
    </div>
  )
}

export default function SignaturePage() {
  const params = useParams()
  const router = useRouter()
  const missionId = params?.id as string

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)

  const [hasSignature, setHasSignature] = useState(false)
  const [state, setState] = useState<State>("idle")

  // Recap data from localStorage
  const [zones, setZones] = useState<string[]>([])
  const [produits, setProduits] = useState<ProduitLine[]>([])
  const [photoCount, setPhotoCount] = useState(0)
  const [photoUrls, setPhotoUrls] = useState<string[]>([])

  // Real Supabase data
  const [techProfile, setTechProfile] = useState<TechProfile | null>(null)
  const [intervention, setIntervention] = useState<InterventionInfo | null>(null)

  // Load localStorage data
  useEffect(() => {
    if (typeof window === "undefined") return
    const storedZones = localStorage.getItem(`mission-${missionId}-zones`)
    if (storedZones) { try { setZones(JSON.parse(storedZones)) } catch { /* ignore */ } }
    const storedProduits = localStorage.getItem(`mission-${missionId}-produits`)
    if (storedProduits) { try { setProduits(JSON.parse(storedProduits)) } catch { /* ignore */ } }
    const storedCount = localStorage.getItem(`mission-${missionId}-photos-count`)
    if (storedCount) setPhotoCount(parseInt(storedCount, 10) || 0)
    const storedUrls = sessionStorage.getItem(`mission-${missionId}-photo-urls`)
    if (storedUrls) { try { setPhotoUrls(JSON.parse(storedUrls)) } catch { /* ignore */ } }
  }, [missionId])

  // Fetch real tech profile + intervention from Supabase
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    async function fetchData() {
      // Current user's profile
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, prenom, nom, numero_certif, user_id")
          .eq("user_id", user.id)
          .maybeSingle()
        if (profile) setTechProfile(profile as TechProfile)
      }

      // Intervention + site info
      const { data } = await supabase
        .from("interventions")
        .select("id, type, date_prevue, technicien_id, sites(nom, adresse, secteur)")
        .eq("id", missionId)
        .maybeSingle()
      if (data) setIntervention(data as unknown as InterventionInfo)
    }

    fetchData()
  }, [missionId])

  // Draw placeholder on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    ctx.fillStyle = "#F9FAFB"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "#D1D5DB"
    ctx.font = "16px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("Signez ici", canvas.width / 2, canvas.height / 2)
  }, [])

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect()
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
  }

  function startDrawing(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current
    if (!canvas) return
    isDrawing.current = true
    lastPos.current = getPos(e, canvas)
    if (!hasSignature) {
      const ctx = canvas.getContext("2d")
      if (ctx) { ctx.fillStyle = "#F9FAFB"; ctx.fillRect(0, 0, canvas.width, canvas.height) }
      setHasSignature(true)
    }
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing.current || !lastPos.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const pos = getPos(e, canvas)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = "#1B3A2D"
    ctx.lineWidth = 2.5
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.stroke()
    lastPos.current = pos
  }

  function stopDrawing() {
    isDrawing.current = false
    lastPos.current = null
  }

  function clearSignature() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    ctx.fillStyle = "#F9FAFB"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "#D1D5DB"
    ctx.font = "16px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("Signez ici", canvas.width / 2, canvas.height / 2)
    setHasSignature(false)
  }

  async function handleCloture() {
    if (!hasSignature) return
    setState("loading")

    const canvas = canvasRef.current
    const signatureDataUrl = canvas ? canvas.toDataURL("image/png") : null

    const site = intervention?.sites
    const techNom = techProfile
      ? `${techProfile.prenom} ${techProfile.nom}`
      : "Technicien Noxyera"

    try {
      const res = await fetch("/api/rapport/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interventionId:       missionId,
          technicienId:         techProfile?.id ?? null,
          zonesTraitees:        zones,
          produitsUtilises:     produits,
          observations:         "",
          presenceActive:       false,
          recommandationSuivi:  false,
          photosUrl:            photoUrls,
          signatureDataUrl,
          siteName:             site?.nom ?? "",
          siteAdresse:          site?.adresse ?? "",
          secteur:              site?.secteur ?? "",
          type:                 intervention?.type ?? "preventif",
          technicienNom:        techNom,
          datePrevue:           intervention?.date_prevue ?? "",
        }),
      })

      if (!res.ok) {
        console.error("[signature] rapport/generate error", res.status)
      }
    } catch (err) {
      console.error("[signature] rapport/generate exception:", err)
      // Proceed anyway — don't block the technicien
    }

    // Cleanup localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem(`mission-${missionId}-zones`)
      localStorage.removeItem(`mission-${missionId}-produits`)
      localStorage.removeItem(`mission-${missionId}-photos-count`)
      localStorage.removeItem(`mission-${missionId}-arrivee`)
      localStorage.removeItem(`mission-${missionId}-secteur`)
      localStorage.removeItem(`mission-${missionId}-prefill`)
      try { sessionStorage.removeItem(`mission-${missionId}-photo-urls`) } catch { /* ignore */ }
    }

    setState("success")
    setTimeout(() => {
      router.push(`/technicien/mission/${missionId}/confirmation`)
    }, 2000)
  }

  const ZONE_LABELS: Record<string, string> = {
    cuisine: "Cuisine", cave: "Cave", reserves: "Réserves", exterieurs: "Extérieurs",
    vestiaires: "Vestiaires", poubelles: "Poubelles", salle: "Salle", toiture: "Toiture",
  }

  if (state === "success") {
    return (
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
        <div style={{
          width: "80px", height: "80px", borderRadius: "50%",
          background: "#D1FAE5", color: "#065F46",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <Check size={36} />
        </div>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 8px" }}>
          Intervention clôturée !
        </h2>
        <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>
          Rapport généré et transmis. Redirection en cours...
        </p>
      </div>
    )
  }

  if (state === "loading") {
    return (
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
        <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "4px solid #F5F0E8", borderTopColor: "#F26522", margin: "0 auto 20px", animation: "spin 0.8s linear infinite" }} />
        <p style={{ fontSize: "16px", fontWeight: 600, color: "#1B3A2D" }}>Génération du rapport...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "24px 20px 140px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <button
          onClick={() => router.push(`/technicien/mission/${missionId}/produits`)}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", color: "#6B7280", fontSize: "14px", padding: 0 }}
        >
          <ArrowLeft size={16} /> Retour
        </button>
      </div>

      <ProgressBar step={4} />

      <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 6px" }}>
        Signature & Clôture
      </h1>
      <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 24px" }}>
        Signez pour valider et générer le rapport HACCP
      </p>

      {/* Signature canvas */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>Signature du technicien</span>
          <button
            onClick={clearSignature}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#6B7280", fontWeight: 500 }}
          >
            Effacer
          </button>
        </div>
        <canvas
          ref={canvasRef}
          style={{
            width: "100%", height: "180px",
            border: hasSignature ? "2px solid #1B3A2D" : "2px dashed #D1D5DB",
            borderRadius: "12px", background: "#F9FAFB",
            cursor: "crosshair", touchAction: "none", display: "block",
          }}
          onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
          onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
        />
        {hasSignature && (
          <p style={{ fontSize: "11px", color: "#27AE60", margin: "4px 0 0", fontWeight: 600 }}>
            ✓ Signature apposée
          </p>
        )}
      </div>

      {/* Recap card */}
      <div style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Récapitulatif
        </h2>

        {/* Site */}
        {intervention?.sites && (
          <div style={{ marginBottom: "16px" }}>
            <p style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600, margin: "0 0 4px", textTransform: "uppercase" }}>
              Site
            </p>
            <p style={{ fontSize: "13px", color: "#374151", margin: 0, fontWeight: 600 }}>{intervention.sites.nom}</p>
            <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "2px 0 0" }}>{intervention.sites.adresse}</p>
          </div>
        )}

        {/* Zones */}
        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600, margin: "0 0 8px", textTransform: "uppercase" }}>
            Zones traitées
          </p>
          {zones.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {zones.map((z) => (
                <span key={z} style={{ padding: "3px 10px", borderRadius: "20px", background: "#F5F0E8", color: "#1B3A2D", fontSize: "12px", fontWeight: 500 }}>
                  {ZONE_LABELS[z] ?? z}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "13px", color: "#9CA3AF", margin: 0 }}>Aucune zone sélectionnée</p>
          )}
        </div>

        {/* Produits */}
        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600, margin: "0 0 8px", textTransform: "uppercase" }}>
            Produits utilisés
          </p>
          {produits.filter((p) => p.nom).length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {produits.filter((p) => p.nom).map((p) => (
                <span key={p.id} style={{ fontSize: "13px", color: "#374151" }}>
                  {p.nom}{p.quantite ? ` — ${p.quantite}` : ""}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "13px", color: "#9CA3AF", margin: 0 }}>Aucun produit renseigné</p>
          )}
        </div>

        {/* Photos */}
        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600, margin: "0 0 8px", textTransform: "uppercase" }}>
            Photos
          </p>
          {photoCount > 0 ? (
            <div>
              <p style={{ fontSize: "13px", color: "#374151", margin: "0 0 8px" }}>
                {photoCount} photo{photoCount > 1 ? "s" : ""} ajoutée{photoCount > 1 ? "s" : ""}
              </p>
              {photoUrls.length > 0 && (
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {photoUrls.slice(0, 4).map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={url} alt="" style={{ width: "60px", height: "60px", borderRadius: "6px", objectFit: "cover" }} />
                  ))}
                  {photoUrls.length > 4 && (
                    <div style={{ width: "60px", height: "60px", borderRadius: "6px", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#9CA3AF" }}>
                      +{photoUrls.length - 4}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p style={{ fontSize: "13px", color: "#9CA3AF", margin: 0 }}>Aucune photo</p>
          )}
        </div>

        {/* Technicien */}
        <div>
          <p style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600, margin: "0 0 4px", textTransform: "uppercase" }}>
            Technicien
          </p>
          <p style={{ fontSize: "13px", color: "#374151", margin: 0 }}>
            {techProfile ? `${techProfile.prenom} ${techProfile.nom}` : "—"}
          </p>
          {techProfile?.numero_certif && (
            <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "2px 0 0" }}>
              N° Certibiocide : {techProfile.numero_certif}
            </p>
          )}
        </div>
      </div>

      {/* Sticky footer */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        padding: "16px 24px", background: "white", borderTop: "1px solid #E5E7EB",
      }}>
        <div style={{ maxWidth: "480px", margin: "0 auto" }}>
          {!hasSignature && (
            <p style={{ fontSize: "12px", color: "#F26522", textAlign: "center", margin: "0 0 8px", fontWeight: 500 }}>
              Signature requise pour clôturer
            </p>
          )}
          <button
            onClick={handleCloture}
            disabled={!hasSignature}
            style={{
              width: "100%", height: "64px", borderRadius: "12px",
              background: "#F26522", color: "white", fontSize: "17px", fontWeight: 700,
              border: "none", cursor: !hasSignature ? "not-allowed" : "pointer",
              opacity: !hasSignature ? 0.4 : 1, transition: "opacity 0.15s",
            }}
          >
            Générer le rapport HACCP et clôturer
          </button>
        </div>
      </div>
    </div>
  )
}
