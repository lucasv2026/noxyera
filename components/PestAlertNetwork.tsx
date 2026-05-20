"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Building2, Factory, Hotel, Loader2, Search, Store, Truck, Warehouse, type LucideIcon } from "lucide-react";
import type { Secteur } from "@/lib/pricing";

const SECTEUR_ITEMS: Array<{ id: Secteur; label: string; icon: LucideIcon }> = [
  { id: "restaurant",      label: "Restaurant",          icon: Store },
  { id: "hotel",           label: "Hôtel",               icon: Hotel },
  { id: "entrepot",        label: "Entrepôt / Logistique", icon: Warehouse },
  { id: "agroalimentaire", label: "Industrie alim.",     icon: Factory },
  { id: "immeuble",        label: "Immeuble / Bailleur", icon: Building2 },
  { id: "bureau",          label: "Bureau / Tertiaire",  icon: Truck },
]

const LOADING_MESSAGES = [
  "Analyse des données de votre zone…",
  "Consultation des signalements locaux…",
  "Calcul du score de risque…",
  "Score en cours de finalisation…",
]

// ── Score basé sur la vraie adresse ──────────────────────────────────────────
const PARIS_RISK: Record<number, number> = {
  1: 6.2, 2: 5.8, 3: 6.5, 4: 6.1, 5: 6.8,
  6: 5.9, 7: 5.2, 8: 5.5, 9: 6.9, 10: 7.4,
  11: 7.8, 12: 6.6, 13: 7.1, 14: 6.3, 15: 6.7,
  16: 4.8, 17: 6.0, 18: 8.2, 19: 7.9, 20: 8.0
}


function calculateScore(citycode: string, postcode: string, secteur: string): number {
  let base = 5.5

  if (citycode && citycode.startsWith('75') && citycode.length === 5) {
    const arr = parseInt(citycode.slice(3))
    base = PARIS_RISK[arr] ?? 6.0
  } else if (postcode) {
    const dept = postcode.slice(0, 2)
    const idf = ['77','78','91','92','93','94','95']
    if (idf.includes(dept)) {
      base = 5.5 + (parseInt(dept) % 7) * 0.3
    } else {
      base = 4.2 + (parseInt(dept) % 10) * 0.22
    }
  }

  const bonus: Record<string, number> = { restaurant: 0.8, hotel: 0.6, entrepot: 0.4, agroalimentaire: 0.5 }
  base += bonus[secteur] ?? 0
  return Math.min(10, Math.round(base * 10) / 10)
}

interface SuggestionItem {
  label: string
  lat: number
  lng: number
  citycode: string
  postcode: string
  city: string
}

function AnimGauge({ label, score, color, delay = 0 }: {
  label: string; score: number; color: string; delay?: number
}) {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => {
      let c = 0
      const steps = 60
      const inc = score / steps
      const id = setInterval(() => {
        c = Math.min(c + inc, score)
        setCurrent(Math.round(c * 10) / 10)
        if (c >= score) clearInterval(id)
      }, 1500 / steps)
      return () => clearInterval(id)
    }, delay)
    return () => clearTimeout(t)
  }, [score, delay])

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>{label}</span>
        <span style={{ fontSize: "14px", fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>
          {current.toFixed(1)}<span style={{ fontSize: "12px", fontWeight: 400, color: "#9CA3AF" }}>/10</span>
        </span>
      </div>
      <div style={{ height: "10px", width: "100%", overflow: "hidden", borderRadius: "999px", background: "#E5E7EB" }}>
        <div
          style={{
            height: "100%",
            borderRadius: "999px",
            width: `${(current / 10) * 100}%`,
            background: `linear-gradient(90deg, #10B981, ${color})`,
            transition: "none",
          }}
        />
      </div>
    </div>
  )
}

export function PestAlertNetwork({ onSecteurSelect }: { onSecteurSelect?: (s: Secteur) => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedCitycode, setSelectedCitycode] = useState('')
  const [selectedPostcode, setSelectedPostcode] = useState('')
  const [secteur, setSecteur] = useState<Secteur>("restaurant")
  const [loadingMsg, setLoadingMsg] = useState(0)
  const [score, setScore] = useState<number | null>(null)
  const debounceRef = useRef<NodeJS.Timeout>()
  const loadingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleInputChange = (value: string) => {
    setQuery(value)
    clearTimeout(debounceRef.current)
    if (value.length < 3) { setSuggestions([]); setShowSuggestions(false); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(value)}&limit=5&autocomplete=1`)
        const data = await res.json()
        const results: SuggestionItem[] = data.features.map((f: {
          properties: { label: string; citycode: string; postcode: string; city: string }
          geometry: { coordinates: [number, number] }
        }) => ({
          label: f.properties.label,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          citycode: f.properties.citycode,
          postcode: f.properties.postcode,
          city: f.properties.city,
        }))
        setSuggestions(results)
        setShowSuggestions(true)
      } catch { /* silent */ }
    }, 150)
  }

  function selectSuggestion(s: SuggestionItem) {
    setQuery(s.label)
    setSelectedCitycode(s.citycode)
    setSelectedPostcode(s.postcode)
    setSuggestions([])
    setShowSuggestions(false)
  }

  async function handleAnalyse() {
    if (!query) return
    setStep(2)
    setLoadingMsg(0)

    let idx = 0
    loadingRef.current = setInterval(() => {
      idx = Math.min(idx + 1, LOADING_MESSAGES.length - 1)
      setLoadingMsg(idx)
    }, 700)

    await new Promise(resolve => setTimeout(resolve, 2800))
    if (loadingRef.current) clearInterval(loadingRef.current)

    const computed = calculateScore(selectedCitycode, selectedPostcode, secteur)
    setScore(computed)
    setStep(3)
  }

  // Dérivés d'affichage
  const scoreColor = score !== null ? (score > 7 ? '#DC2626' : score >= 5 ? '#F26522' : '#27AE60') : '#F26522'
  const scoreLabel = score !== null ? (score > 7 ? 'Risque élevé' : score >= 5 ? 'Risque modéré' : 'Risque faible') : ''
  const scoreMessage = score !== null
    ? score > 7
      ? 'Votre zone est classée à risque élevé. 3 établissements proches ont signalé des nuisibles ce trimestre.'
      : score >= 5
      ? 'Risque modéré dans votre secteur. Un passage préventif est recommandé.'
      : 'Risque faible. Maintenez votre niveau de protection avec un contrat préventif.'
    : ''

  // Jauges dérivées du score global
  const rongeurs = score !== null ? Math.min(9.9, Math.round((score * 1.1) * 10) / 10) : 0
  const blattes   = score !== null ? Math.min(9.9, Math.round((score * 0.9) * 10) / 10) : 0
  const punaises  = score !== null ? Math.min(9.9, Math.round((score * 0.7) * 10) / 10) : 0

  return (
    <section id="pest-alert" style={{ background: "white", padding: "64px 24px" }}>
      <div style={{ maxWidth: "768px", margin: "0 auto" }}>
        <p style={{ marginBottom: "8px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "#F26522" }}>
          Pest Alert Network — gratuit
        </p>
        <h2 style={{ fontSize: "30px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 8px" }}>
          Votre établissement est-il à risque ?
        </h2>
        <p style={{ marginTop: "8px", fontSize: "14px", lineHeight: 1.6, color: "#6B7280" }}>
          Score calculé selon votre adresse réelle : arrondissement parisien, département, secteur d&apos;activité.
        </p>

        {/* ── ÉTAPE 1 : Formulaire ── */}
        {step === 1 && (
          <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Champ recherche avec autocomplete */}
            <div style={{ position: "relative" }}>
              <Search size={15} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
              <input
                type="text"
                value={query}
                onChange={e => handleInputChange(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Tapez votre adresse…"
                style={{
                  height: "48px", width: "100%", borderRadius: "12px",
                  border: "1.5px solid #E5E7EB", background: "#F9FAFB",
                  paddingLeft: "40px", paddingRight: "16px", fontSize: "14px",
                  outline: "none", boxSizing: "border-box", color: "#1A1A1A",
                }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
                  zIndex: 50, background: "white", borderRadius: "12px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  border: "1px solid #E5E7EB", overflow: "hidden",
                }}>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onMouseDown={() => selectSuggestion(s)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        width: "100%", padding: "12px 16px", cursor: "pointer",
                        border: "none", background: "white", textAlign: "left",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#F5F0E8" }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "white" }}
                    >
                      <span style={{ fontWeight: 600, color: "#1A1A1A", fontSize: "14px" }}>{s.label}</span>
                      <span style={{ color: "#9CA3AF", fontSize: "12px", flexShrink: 0, marginLeft: "8px" }}>{s.city}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tuiles secteur */}
            <div>
              <p style={{ marginBottom: "12px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9CA3AF" }}>
                Votre secteur
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {SECTEUR_ITEMS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSecteur(id)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
                      borderRadius: "12px", padding: "12px 8px", textAlign: "center",
                      border: secteur === id ? "1.5px solid #1B3A2D" : "1.5px solid #E5E7EB",
                      background: secteur === id ? "rgba(27,58,45,0.06)" : "white",
                      cursor: "pointer",
                    }}
                  >
                    <Icon size={18} style={{ color: secteur === id ? "#1B3A2D" : "#9CA3AF" }} />
                    <span style={{ fontSize: "12px", fontWeight: 500, color: secteur === id ? "#1B3A2D" : "#6B7280", lineHeight: 1.2 }}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAnalyse}
              disabled={!query}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                borderRadius: "12px", padding: "14px 32px", fontSize: "14px",
                fontWeight: 600, color: "white", background: "#F26522",
                border: "none", cursor: query ? "pointer" : "not-allowed",
                opacity: query ? 1 : 0.4, alignSelf: "flex-start",
              }}
            >
              Analyser mon risque
              <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* ── ÉTAPE 2 : Loading ── */}
        {step === 2 && (
          <div style={{ marginTop: "48px", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
            <Loader2 size={40} style={{ color: "#1B3A2D", animation: "spin 1s linear infinite" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: "center" }}>
              {LOADING_MESSAGES.map((msg, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: "14px", margin: 0, transition: "all 0.3s",
                    color: i === loadingMsg ? "#1B3A2D" : "#D1D5DB",
                    fontWeight: i === loadingMsg ? 600 : 400,
                  }}
                >
                  {i < loadingMsg ? "— " : i === loadingMsg ? "» " : ""}{msg}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* ── ÉTAPE 3 : Résultats ── */}
        {step === 3 && score !== null && (
          <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Score global */}
            <div style={{
              borderRadius: "16px", padding: "24px",
              background: scoreColor === '#DC2626' ? "rgba(220,38,38,0.08)" : scoreColor === '#F26522' ? "rgba(242,101,34,0.08)" : "rgba(39,174,96,0.08)",
              border: `1.5px solid ${scoreColor}30`,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px" }}>
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", color: "#6B7280", margin: "0 0 4px", letterSpacing: "0.08em" }}>
                    Score de risque Noxyera
                  </p>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
                    <span style={{ fontSize: "64px", fontWeight: 700, lineHeight: 1, color: scoreColor }}>
                      {score.toFixed(1)}
                    </span>
                    <span style={{ fontSize: "20px", fontWeight: 500, color: "#9CA3AF", marginBottom: "4px" }}>/10</span>
                  </div>
                </div>
                <span style={{
                  padding: "4px 12px", borderRadius: "999px", fontSize: "13px",
                  fontWeight: 700, color: "white", background: scoreColor,
                }}>
                  {scoreLabel}
                </span>
              </div>

              {/* Jauges animées */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <AnimGauge label="Rongeurs" score={rongeurs} color="#DC2626" delay={0} />
                <AnimGauge label="Blattes" score={blattes} color="#F97316" delay={200} />
                <AnimGauge label="Punaises de lit" score={punaises} color="#8B5CF6" delay={400} />
              </div>
            </div>

            {/* Message contextuel */}
            <p style={{ fontSize: "14px", lineHeight: 1.7, color: "#4B5563", margin: 0 }}>{scoreMessage}</p>

            {/* CTA dynamique */}
            {score > 5 ? (
              <div>
                <a
                  href="/#estimateur"
                  style={{
                    display: "block", width: "100%", textAlign: "center",
                    padding: "16px 32px", fontSize: "16px", fontWeight: 700,
                    background: "#F26522", color: "white", borderRadius: "12px",
                    boxShadow: "0 4px 14px rgba(242,101,34,0.35)",
                    textDecoration: "none", boxSizing: "border-box" as const,
                  }}
                >
                  Sécuriser mon établissement — Audit gratuit 48h →
                </a>
                <p style={{ fontSize: "12px", color: "#9CA3AF", textAlign: "center", margin: "10px 0 0" }}>
                  Sans engagement · Réponse sous 24h · Technicien certifié Certibiocide
                </p>
              </div>
            ) : (
              <div>
                <a
                  href="/#pest-alert"
                  style={{
                    display: "block", width: "100%", textAlign: "center",
                    padding: "16px 32px", fontSize: "16px", fontWeight: 600,
                    background: "white", color: "#27AE60",
                    border: "2px solid #27AE60", borderRadius: "12px",
                    textDecoration: "none", boxSizing: "border-box" as const,
                  }}
                >
                  Recevoir les alertes de ma zone →
                </a>
                <p style={{ fontSize: "12px", color: "#9CA3AF", textAlign: "center", margin: "10px 0 0" }}>
                  Sans engagement · Réponse sous 24h · Technicien certifié Certibiocide
                </p>
              </div>
            )}

            <button
              onClick={() => { setStep(1); setScore(null); onSecteurSelect?.(secteur) }}
              style={{ fontSize: "12px", color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", alignSelf: "flex-start" }}
            >
              Nouvelle analyse
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </section>
  )
}
