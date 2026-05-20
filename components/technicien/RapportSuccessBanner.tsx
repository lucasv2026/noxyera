"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

export function RapportSuccessBanner() {
  const searchParams = useSearchParams()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (searchParams.get("rapport") === "ok") {
      setVisible(true)
      const timer = setTimeout(() => setVisible(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  if (!visible) return null

  return (
    <div style={{
      position: "fixed",
      top: "72px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 1000,
      background: "#065F46",
      color: "white",
      padding: "14px 24px",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: 600,
      boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      maxWidth: "calc(100vw - 48px)",
      animation: "slideDown 0.3s ease",
    }}>
      ✓ Rapport généré et envoyé avec succès
      <style>{`@keyframes slideDown { from { opacity: 0; transform: translateX(-50%) translateY(-12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>
    </div>
  )
}
