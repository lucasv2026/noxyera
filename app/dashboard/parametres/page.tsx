"use client"

import { useState } from "react"

const SECTIONS = ["Mon compte", "Notifications", "Sécurité", "Facturation & abonnement"] as const
type Section = typeof SECTIONS[number]

function ComingSoon({ title }: { title: string }) {
  return (
    <div style={{ background: "white", borderRadius: "16px", padding: "40px 32px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", textAlign: "center" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 12px" }}>{title}</h2>
      <p style={{ fontSize: "14px", color: "#6B7280", margin: "0 0 16px" }}>
        Disponible prochainement · Cette fonctionnalité sera disponible dans la prochaine mise à jour.
      </p>
      <span style={{ padding: "6px 16px", borderRadius: "20px", background: "#FEF3C7", color: "#92400E", fontSize: "12px", fontWeight: 700 }}>
        Bientôt
      </span>
    </div>
  )
}

function InputField({ label, defaultValue, type = "text" }: { label: string; defaultValue: string; type?: string }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#9CA3AF", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </label>
      <input
        type={type}
        defaultValue={defaultValue}
        style={{
          width: "100%",
          padding: "10px 14px",
          borderRadius: "10px",
          border: "1px solid #E5E7EB",
          fontSize: "14px",
          color: "#374151",
          background: "white",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  )
}

export default function ParametresPage() {
  const [activeSection, setActiveSection] = useState<Section>("Mon compte")

  return (
    <div style={{ padding: "32px 32px 64px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1B3A2D", margin: 0, fontFamily: "var(--font-display), serif" }}>
          Paramètres
        </h1>
      </div>

      {/* Layout 2 cols */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "24px", alignItems: "start" }}>

        {/* Menu gauche */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {SECTIONS.map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: activeSection === section ? 700 : 500,
                background: activeSection === section ? "#F5F0E8" : "transparent",
                color: activeSection === section ? "#1B3A2D" : "#6B7280",
                textAlign: "left",
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {section}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {activeSection === "Mon compte" ? (
            <>
              {/* Informations entreprise */}
              <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 20px" }}>
                  Informations entreprise
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                  <InputField label="Raison sociale" defaultValue="Yooma Urban Lodge" />
                  <InputField label="SIRET" defaultValue="12345678901234" />
                  <InputField label="Adresse facturation" defaultValue="22 Rue Linois, Paris 15e" />
                  <InputField label="Email facturation" defaultValue="compta@yooma.com" type="email" />
                </div>
                <button
                  style={{
                    padding: "10px 24px",
                    borderRadius: "10px",
                    background: "#F26522",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Enregistrer
                </button>
              </div>

              {/* Contact principal */}
              <div style={{ background: "white", borderRadius: "16px", padding: "28px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 20px" }}>
                  Contact principal
                </h2>

                {/* Avatar + nom */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                  <div style={{
                    width: "56px", height: "56px", borderRadius: "50%",
                    background: "#D1FAE5", color: "#065F46",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "18px", fontWeight: 700, flexShrink: 0,
                  }}>
                    LV
                  </div>
                  <div>
                    <p style={{ fontSize: "16px", fontWeight: 700, color: "#1B3A2D", margin: 0 }}>Lucas Van Dard</p>
                    <p style={{ fontSize: "13px", color: "#6B7280", margin: "2px 0 0" }}>Directeur</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                  <InputField label="Prénom" defaultValue="Lucas" />
                  <InputField label="Nom" defaultValue="Van Dard" />
                  <InputField label="Email" defaultValue="lucas@agencenikita.com" type="email" />
                  <InputField label="Téléphone" defaultValue="+33 6 12 34 56 78" type="tel" />
                </div>
                <button
                  style={{
                    padding: "10px 24px",
                    borderRadius: "10px",
                    background: "#F26522",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Enregistrer
                </button>
              </div>
            </>
          ) : (
            <ComingSoon title={activeSection} />
          )}
        </div>
      </div>
    </div>
  )
}
