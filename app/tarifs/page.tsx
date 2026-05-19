"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, ArrowRight, Lock } from "lucide-react"

// Price IDs Stripe — placeholders jusqu'à configuration dans Stripe Dashboard
const STRIPE_PRICES = {
  ESSENTIEL_ANNUEL: process.env.NEXT_PUBLIC_STRIPE_PRICE_ESSENTIEL_ANNUEL || 'price_essentiel_placeholder',
  SERENITE_ANNUEL: process.env.NEXT_PUBLIC_STRIPE_PRICE_SERENITE_ANNUEL || 'price_serenite_placeholder',
}

const ESSENTIEL = [
  "4 passages préventifs/an (trimestriel)",
  "Délai urgence 72h",
  "Rapports HACCP basiques auto-générés",
  "Tableau de bord accès basique",
  "Interventions curatives facturées à part (€180–250)",
]

const SERENITE = [
  "4 à 12 passages/an selon site",
  "Interventions curatives illimitées incluses",
  "Délai urgence 24–48h garanti",
  "Rapports HACCP horodatés et signés numériquement",
  "Tableau de bord historique complet",
  "Export PDF automatique",
  "Accès prioritaire technicien dédié",
]

const EXEMPLES = [
  { secteur: "Restaurant 100m²", essentiel: 900, serenite: 1400 },
  { secteur: "Hôtel 20 chambres", essentiel: 1200, serenite: 2000 },
  { secteur: "Entrepôt 3 000m²", essentiel: 2000, serenite: 3500 },
]

export default function TarifsPage() {
  const [loadingPrice, setLoadingPrice] = useState<string | null>(null)

  async function handleSouscrire(priceId: string) {
    setLoadingPrice(priceId)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          clientEmail: 'demo@noxyera.fr', // sera remplacé par le vrai email après login
          clientNom: 'Client Noxyera',
        }),
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        alert('Stripe non configuré — contactez lucas@agencenikita.com')
      }
    } catch {
      alert('Erreur réseau — veuillez réessayer')
    } finally {
      setLoadingPrice(null)
    }
  }

  return (
    <div style={{ background: "#F5F0E8", minHeight: "100vh" }}>
      {/* Nav */}
      <header style={{ position: "sticky", top: 0, zIndex: 10, background: "white", borderBottom: "1px solid #E5E7EB", padding: "16px 24px" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontSize: "20px", fontWeight: 800, color: "#1B3A2D" }}>Noxyera</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/login" style={{ fontSize: "14px", fontWeight: 500, padding: "8px 16px", borderRadius: "12px", color: "#1B3A2D", textDecoration: "none" }}>
              Accès Client
            </Link>
            <Link href="/" style={{ fontSize: "14px", fontWeight: 600, padding: "8px 16px", borderRadius: "12px", color: "white", background: "#F26522", textDecoration: "none" }}>
              Estimer mon tarif
            </Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1024px", margin: "0 auto", padding: "64px 24px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, marginBottom: "16px", background: "#D1FAE5", color: "#065F46" }}>
            Tarifs transparents · Prix fixe · Sans commission
          </span>
          <h1 style={{ fontSize: "42px", fontWeight: 800, color: "#1A1A1A", margin: "0 0 16px" }}>
            Deux formules claires
          </h1>
          <p style={{ fontSize: "18px", color: "#6B7280", maxWidth: "480px", margin: "0 auto" }}>
            Choisissez le niveau de protection adapté à votre activité. Tous les prix sont annuels HT.
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", maxWidth: "768px", margin: "0 auto 64px" }}>
          {/* Essentiel */}
          <div style={{ borderRadius: "24px", background: "white", padding: "32px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6B7280", margin: "0 0 8px" }}>Formule</p>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#1A1A1A", margin: "0 0 8px" }}>Essentiel</h2>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "4px" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, color: "#F26522" }}>À partir de 900 €</span>
              <span style={{ fontSize: "14px", fontWeight: 500, color: "#6B7280" }}>/an HT</span>
            </div>
            <p style={{ fontSize: "14px", color: "#6B7280", margin: "0 0 24px" }}>
              La base pour être en conformité réglementaire.
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {ESSENTIEL.map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px", color: "#374151" }}>
                  <CheckCircle2 size={15} style={{ color: "#6B7280", flexShrink: 0, marginTop: "2px" }} />
                  {item}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSouscrire(STRIPE_PRICES.ESSENTIEL_ANNUEL)}
              disabled={loadingPrice === STRIPE_PRICES.ESSENTIEL_ANNUEL}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                width: "100%", padding: "14px", borderRadius: "12px",
                fontSize: "14px", fontWeight: 700,
                background: loadingPrice === STRIPE_PRICES.ESSENTIEL_ANNUEL ? "#E5E7EB" : "#F26522",
                color: loadingPrice === STRIPE_PRICES.ESSENTIEL_ANNUEL ? "#9CA3AF" : "white",
                border: "none", cursor: loadingPrice === STRIPE_PRICES.ESSENTIEL_ANNUEL ? "not-allowed" : "pointer",
                transition: "opacity 0.15s",
              }}
            >
              {loadingPrice === STRIPE_PRICES.ESSENTIEL_ANNUEL ? "Chargement…" : "Souscrire Essentiel"}
              {loadingPrice !== STRIPE_PRICES.ESSENTIEL_ANNUEL && <ArrowRight size={15} />}
            </button>

            <Link
              href="/#pest-alert"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "10px", padding: "10px", borderRadius: "12px", fontSize: "13px", fontWeight: 600, color: "#6B7280", textDecoration: "none", background: "#F9FAFB" }}
            >
              Démarrer l&apos;audit gratuit d&apos;abord
            </Link>
          </div>

          {/* Sérénité */}
          <div style={{ borderRadius: "24px", padding: "32px", boxShadow: "0 8px 32px rgba(27,58,45,0.2)", background: "#1B3A2D", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "16px", right: "16px", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700, background: "#F26522", color: "white" }}>
              Recommandée
            </div>

            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.5)", margin: "0 0 8px" }}>Formule</p>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "white", margin: "0 0 8px" }}>Sérénité</h2>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "4px" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, color: "white" }}>Sur devis</span>
            </div>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.65)", margin: "0 0 24px" }}>
              Protection complète et conformité HACCP maximale.
            </p>

            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {SERENITE.map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "14px", color: "rgba(255,255,255,0.85)" }}>
                  <CheckCircle2 size={15} style={{ color: "#4ADE80", flexShrink: 0, marginTop: "2px" }} />
                  {item}
                </li>
              ))}
            </ul>

            <a
              href="mailto:contact@noxyera.com"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                width: "100%", padding: "14px", borderRadius: "12px",
                fontSize: "14px", fontWeight: 700, color: "white",
                background: "#22C55E", boxShadow: "0 4px 14px rgba(34,197,94,0.35)",
                textDecoration: "none",
              }}
            >
              Parler à un expert
              <ArrowRight size={15} />
            </a>
          </div>
        </div>

        {/* Exemples tarifaires */}
        <div style={{ marginBottom: "64px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, textAlign: "center", color: "#1A1A1A", margin: "0 0 32px" }}>
            Exemples de tarifs indicatifs
          </h2>
          <div style={{ borderRadius: "16px", background: "white", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.06)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "12px 24px", background: "#F5F0E8", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6B7280" }}>
              <span>Profil</span>
              <span style={{ textAlign: "center" }}>Essentiel</span>
              <span style={{ textAlign: "center", color: "#1B3A2D" }}>Sérénité</span>
            </div>
            {EXEMPLES.map((ex, i) => (
              <div
                key={ex.secteur}
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "16px 24px", alignItems: "center", borderTop: i > 0 ? "1px solid #F3F4F6" : undefined }}
              >
                <span style={{ fontSize: "14px", fontWeight: 500, color: "#1A1A1A" }}>{ex.secteur}</span>
                <span style={{ textAlign: "center", fontSize: "14px", fontWeight: 600, color: "#6B7280" }}>
                  {ex.essentiel.toLocaleString("fr-FR")} €/an
                </span>
                <span style={{ textAlign: "center", fontSize: "14px", fontWeight: 700, color: "#1B3A2D" }}>
                  {ex.serenite.toLocaleString("fr-FR")} €/an
                </span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "12px", textAlign: "center", marginTop: "12px", color: "#9CA3AF" }}>
            Tarifs HT indicatifs. Obtenez votre devis précis avec l&apos;estimateur en ligne.
          </p>
        </div>

        {/* Paiement sécurisé */}
        <div style={{ borderRadius: "16px", padding: "28px 32px", display: "flex", flexDirection: "column", gap: "20px", background: "white", border: "1px solid rgba(0,0,0,0.06)", marginBottom: "64px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", background: "#F0FDF4" }}>
                <Lock size={18} style={{ color: "#16A34A" }} />
              </div>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A1A1A", margin: 0 }}>Paiement sécurisé</p>
                <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>Propulsé par Stripe</p>
              </div>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexWrap: "wrap", gap: "24px" }}>
              {["Paiement en ligne sécurisé", "Facture PDF automatique", "Renouvellement annuel automatique"].map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#374151" }}>
                  <CheckCircle2 size={14} style={{ color: "#16A34A" }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA final */}
        <div style={{ textAlign: "center" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "16px 32px", borderRadius: "16px",
              fontSize: "16px", fontWeight: 700, color: "white",
              background: "#F26522", boxShadow: "0 4px 20px rgba(242,101,34,0.35)",
              textDecoration: "none",
            }}
          >
            Obtenir mon estimation gratuite
            <ArrowRight size={18} />
          </Link>
          <p style={{ fontSize: "14px", marginTop: "12px", color: "#6B7280" }}>
            En 60 secondes · Sans engagement · Sans CB
          </p>
        </div>
      </main>
    </div>
  )
}
