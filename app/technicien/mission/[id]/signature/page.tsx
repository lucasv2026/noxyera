"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Check, Smartphone } from "lucide-react"

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

type State = "idle" | "loading" | "success"

export default function SignaturePage() {
  const params = useParams()
  const router = useRouter()
  const missionId = params?.id as string
  const [state, setState] = useState<State>("idle")

  async function handleCloture() {
    setState("loading")
    try {
      await fetch("/api/rapport/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId }),
      })
    } catch {
      // Ignore in demo mode
    }
    setState("success")
    setTimeout(() => {
      router.push("/technicien/missions?success=1")
    }, 2000)
  }

  if (state === "success") {
    return (
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
        <div style={{
          width: "80px", height: "80px", borderRadius: "50%",
          background: "#D1FAE5", color: "#065F46",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "36px", margin: "0 auto 20px",
          animation: "pop 0.4s ease",
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
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "32px 20px 64px" }}>
      <ProgressBar step={4} />

      <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 6px" }}>Récapitulatif</h1>
      <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 24px" }}>Vérifiez avant de clôturer</p>

      {/* Récap card */}
      <div style={{
        background: "#D1FAE5",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "24px",
        border: "1px solid #A7F3D0",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", textAlign: "center" }}>
          {[
            { value: "4", label: "Pièges inspectés" },
            { value: "0", label: "Alertes" },
            { value: "2", label: "Produits loggés" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p style={{ fontSize: "28px", fontWeight: 700, color: "#065F46", margin: 0 }}>{value}</p>
              <p style={{ fontSize: "11px", color: "#047857", margin: 0, fontWeight: 500 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleCloture}
        style={{
          width: "100%",
          padding: "18px",
          borderRadius: "14px",
          background: "#27AE60",
          color: "white",
          fontSize: "16px",
          fontWeight: 700,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(39,174,96,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        }}
      >
        <Smartphone size={16} /> Clôturer l&apos;intervention
      </button>
    </div>
  )
}
