"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Minus, Plus, Check } from "lucide-react"

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
              {isDone ? <Check size={12} /> : idx + 1}
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

const PRODUITS_INITIAL = [
  { id: "p1", nom: "Brodifacoum 0.005% blocs", amm: "AMM 9810234", unite: "mL" },
  { id: "p2", nom: "Bromadiolone pâtes", amm: "AMM 8720156", unite: "mL" },
]

export default function ProduitsPage() {
  const params = useParams()
  const router = useRouter()
  const missionId = params?.id as string

  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(PRODUITS_INITIAL.map((p) => [p.id, 0]))
  )

  function adjust(id: string, delta: number) {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta) }))
  }

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "32px 20px 64px" }}>
      <ProgressBar step={3} />

      <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 6px" }}>Produits utilisés</h1>
      <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 24px" }}>
        Saisissez les quantités de produits biocides utilisés
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "28px" }}>
        {PRODUITS_INITIAL.map((produit) => (
          <div
            key={produit.id}
            style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
          >
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 2px" }}>{produit.nom}</p>
            <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 16px", fontFamily: "monospace" }}>{produit.amm}</p>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button
                onClick={() => adjust(produit.id, -5)}
                style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  border: "none", background: "#F3F4F6", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Minus size={16} style={{ color: "#6B7280" }} />
              </button>

              <div style={{ flex: 1, textAlign: "center" }}>
                <span style={{ fontSize: "28px", fontWeight: 700, color: "#1B3A2D" }}>{quantities[produit.id]}</span>
                <span style={{ fontSize: "14px", color: "#9CA3AF", marginLeft: "4px" }}>{produit.unite}</span>
              </div>

              <button
                onClick={() => adjust(produit.id, 5)}
                style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  border: "none", background: "#1B3A2D", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Plus size={16} style={{ color: "white" }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push(`/technicien/mission/${missionId}/signature`)}
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
        Aperçu + Signature →
      </button>
    </div>
  )
}
