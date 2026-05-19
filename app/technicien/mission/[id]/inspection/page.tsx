"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"

function ProgressBar({ step }: { step: number }) {
  const steps = ["Arrivée", "Inspection", "Produits", "Signature"]
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "28px" }}>
      {steps.map((label, idx) => {
        const isActive = idx === step - 1
        const isDone = idx < step - 1
        return (
          <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: isActive ? "#F26522" : isDone ? "#27AE60" : "#E5E7EB",
              color: isActive || isDone ? "white" : "#9CA3AF",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "12px", fontWeight: 700,
            }}>
              {isDone ? "✓" : idx + 1}
            </div>
            <span style={{ fontSize: "10px", color: isActive ? "#F26522" : "#9CA3AF", fontWeight: isActive ? 700 : 400 }}>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

const PIEGES = [
  { id: "R1", label: "R1 Cuisine" },
  { id: "R2", label: "R2 Cave" },
  { id: "R3", label: "R3 Réserves" },
  { id: "I1", label: "I1 Salle" },
]

const CONSO_OPTIONS = [0, 25, 50, 75, 100]

interface PiegeResult {
  conso: number
  traces: boolean
  observation: string
  photo: boolean
}

export default function InspectionPage() {
  const params = useParams()
  const router = useRouter()
  const missionId = params?.id as string

  const [results, setResults] = useState<Record<string, PiegeResult>>(
    Object.fromEntries(PIEGES.map((p) => [p.id, { conso: 0, traces: false, observation: "", photo: false }]))
  )

  function updateResult(id: string, patch: Partial<PiegeResult>) {
    setResults((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "32px 20px 64px" }}>
      <ProgressBar step={2} />

      <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 6px" }}>Inspection des pièges</h1>
      <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 24px" }}>{PIEGES.length} pièges à inspecter</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "28px" }}>
        {PIEGES.map((piege) => {
          const res = results[piege.id]
          return (
            <div
              key={piege.id}
              style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
            >
              <p style={{ fontSize: "15px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 14px" }}>{piege.label}</p>

              {/* Photo */}
              <label
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 14px", borderRadius: "8px",
                  background: res.photo ? "#D1FAE5" : "#F5F0E8",
                  color: res.photo ? "#065F46" : "#1B3A2D",
                  fontSize: "12px", fontWeight: 600, cursor: "pointer",
                  marginBottom: "12px", width: "fit-content",
                }}
              >
                📷 {res.photo ? "Photo ajoutée ✓" : "Photo"}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: "none" }}
                  onChange={() => updateResult(piege.id, { photo: true })}
                />
              </label>

              {/* Consommation */}
              <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 6px", fontWeight: 600, textTransform: "uppercase" }}>Consommation</p>
              <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
                {CONSO_OPTIONS.map((val) => (
                  <button
                    key={val}
                    onClick={() => updateResult(piege.id, { conso: val })}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 700,
                      background: res.conso === val ? "#F26522" : "#F3F4F6",
                      color: res.conso === val ? "white" : "#6B7280",
                    }}
                  >
                    {val}%
                  </button>
                ))}
              </div>

              {/* Traces */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <button
                  onClick={() => updateResult(piege.id, { traces: !res.traces })}
                  style={{
                    width: "20px", height: "20px", borderRadius: "4px",
                    border: "2px solid",
                    borderColor: res.traces ? "#DC2626" : "#D1D5DB",
                    background: res.traces ? "#FEE2E2" : "white",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "11px", fontWeight: 700, color: "#DC2626",
                  }}
                >
                  {res.traces ? "✓" : ""}
                </button>
                <span style={{ fontSize: "13px", color: "#374151" }}>Traces détectées</span>
              </div>

              {/* Observation */}
              <textarea
                placeholder="Observation (facultatif)..."
                value={res.observation}
                onChange={(e) => updateResult(piege.id, { observation: e.target.value })}
                style={{
                  width: "100%",
                  minHeight: "60px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  fontSize: "13px",
                  color: "#374151",
                  resize: "vertical",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>
          )
        })}
      </div>

      <button
        onClick={() => router.push(`/technicien/mission/${missionId}/produits`)}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: "14px",
          background: "#1B3A2D",
          color: "white",
          fontSize: "16px",
          fontWeight: 700,
          border: "none",
          cursor: "pointer",
        }}
      >
        Suivant →
      </button>
    </div>
  )
}
