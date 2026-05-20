"use client"

import { Phone, Check, AlertTriangle } from "lucide-react"

export default function TechnicienProfilPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 20px 64px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 28px" }}>
        Mon profil
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        {/* === COLONNE GAUCHE === */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Avatar + identité */}
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", textAlign: "center" }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: "#F26522", color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "28px", fontWeight: 700,
              margin: "0 auto 16px",
            }}>
              TL
            </div>
            <p style={{ fontSize: "22px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 6px" }}>Thomas Lebrun</p>
            <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: "20px", background: "#D1FAE5", color: "#065F46", fontSize: "12px", fontWeight: 700, marginBottom: "10px" }}>
              Certifié Noxyera
            </span>
            <div style={{ fontSize: "14px", color: "#F59E0B", marginBottom: "8px" }}>★★★★★ 4.9</div>
            <p style={{ fontSize: "13px", color: "#9CA3AF", margin: "0 0 4px" }}>124 interventions</p>
            <p style={{ fontSize: "12px", color: "#6B7280", margin: 0, fontFamily: "monospace" }}>N° CERT-NXR-2024-001</p>
          </div>

          {/* Card gains */}
          <div style={{ background: "#F26522", borderRadius: "16px", padding: "24px", color: "white" }}>
            <p style={{ fontSize: "12px", fontWeight: 600, margin: "0 0 8px", opacity: 0.85, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Gains ce mois
            </p>
            <p style={{ fontSize: "36px", fontWeight: 700, margin: "0 0 4px", lineHeight: 1 }}>3 840 €</p>
            <p style={{ fontSize: "13px", margin: "0 0 16px", opacity: 0.85 }}>14 interventions · +12% vs mois dernier</p>
            <div style={{ height: "1px", background: "rgba(255,255,255,0.3)", margin: "0 0 14px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", opacity: 0.9 }}>
              <div>
                <p style={{ margin: "0 0 2px", opacity: 0.7 }}>Cumul YTD</p>
                <p style={{ fontWeight: 700, fontSize: "16px", margin: 0 }}>18 240 €</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: "0 0 2px", opacity: 0.7 }}>Prochain virement</p>
                <p style={{ fontWeight: 700, fontSize: "14px", margin: 0 }}>1er juin 2026</p>
              </div>
            </div>
          </div>
        </div>

        {/* === COLONNE DROITE === */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Mes documents */}
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Mes documents
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "Certibiocide", info: "Exp. 12/2026", ok: true },
                { label: "RC Pro", info: "Exp. 03/2027", ok: true },
                { label: "Convention Noxyera", info: "Sans limite", ok: true },
              ].map(({ label, info, ok }) => (
                <div
                  key={label}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px", borderRadius: "10px",
                    background: "#F9FAFB", border: "1px solid #F3F4F6",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#374151", margin: 0 }}>{label}</p>
                    <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>{info}</p>
                  </div>
                  <span style={{
                    padding: "3px 10px", borderRadius: "20px",
                    fontSize: "11px", fontWeight: 700,
                    background: ok ? "#D1FAE5" : "#FEE2E2",
                    color: ok ? "#065F46" : "#991B1B",
                  }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      {ok ? <Check size={12} /> : <AlertTriangle size={12} />} {ok ? "Valide" : "Expiré"}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Support Noxyera */}
          <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Support Noxyera
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#F5F0E8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Phone size={14} style={{ color: "#1B3A2D" }} />
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>Téléphone</p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151", margin: 0 }}>01 23 45 67 89</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#F5F0E8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>
                  @
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>Email</p>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151", margin: 0 }}>support@noxyera.com</p>
                </div>
              </div>
            </div>
            <a
              href="tel:0123456789"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                padding: "10px 20px", borderRadius: "10px",
                background: "#1B3A2D", color: "white",
                fontSize: "14px", fontWeight: 700, textDecoration: "none",
              }}
            >
              <Phone size={14} />
              Appeler
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
