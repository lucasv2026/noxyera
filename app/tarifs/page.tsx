import Link from "next/link";
import { CheckCircle2, ArrowRight, Lock } from "lucide-react";
import { Logo } from "@/components/logo";

const ESSENTIEL = [
  "4 passages préventifs/an (trimestriel)",
  "Délai urgence 72h",
  "Rapports HACCP basiques auto-générés",
  "Tableau de bord accès basique",
  "Interventions curatives facturées à part (€180–250)",
];

const SERENITE = [
  "4 à 12 passages/an selon site",
  "Interventions curatives illimitées incluses",
  "Délai urgence 24–48h garanti",
  "Rapports HACCP horodatés et signés numériquement",
  "Tableau de bord historique complet",
  "Export PDF automatique",
  "Accès prioritaire technicien dédié",
];

const EXEMPLES = [
  { secteur: "Restaurant 100m²", essentiel: 900, serenite: 1400 },
  { secteur: "Hôtel 20 chambres", essentiel: 1200, serenite: 2000 },
  { secteur: "Entrepôt 3 000m²", essentiel: 2000, serenite: 3500 },
];

export default function TarifsPage() {
  return (
    <div style={{ background: "#F5F0E8", minHeight: "100vh" }}>
      {/* Nav */}
      <header className="sticky top-0 z-10 px-6 py-4" style={{ background: "white", borderBottom: "1px solid #E5E7EB" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-xl transition-colors hover:bg-gray-100" style={{ color: "#1B3A2D" }}>
              Accès Client
            </Link>
            <Link href="/" className="text-sm font-semibold px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-90" style={{ background: "#F26522" }}>
              Estimer mon tarif
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-16">
        {/* Hero */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{ background: "#D1FAE5", color: "#065F46" }}>
            Tarifs transparents · Prix fixe · Sans commission
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: "#1A1A1A" }}>
            Deux formules claires
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "#6B7280" }}>
            Choisissez le niveau de protection adapté à votre activité. Tous les prix sont annuels HT.
          </p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Essentiel */}
          <div className="rounded-3xl bg-white p-8 shadow-sm" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#6B7280" }}>Formule</p>
            <h2 className="text-2xl font-bold mb-1" style={{ color: "#1A1A1A" }}>Essentiel</h2>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-bold" style={{ color: "#F26522" }}>À partir de 900 €</span>
              <span className="text-sm font-medium" style={{ color: "#6B7280" }}>/an HT</span>
            </div>
            <p className="text-sm mb-6" style={{ color: "#6B7280" }}>
              La base pour être en conformité réglementaire.
            </p>

            <ul className="space-y-3 mb-8">
              {ESSENTIEL.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: "#374151" }}>
                  <CheckCircle2 size={15} className="shrink-0 mt-0.5" style={{ color: "#6B7280" }} />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/#pest-alert"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-90"
              style={{ background: "#F26522", color: "white" }}
            >
              Démarrer l&apos;audit gratuit
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Sérénité */}
          <div
            className="rounded-3xl p-8 shadow-lg relative overflow-hidden"
            style={{ background: "#1B3A2D" }}
          >
            <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "#F26522", color: "white" }}>
              Recommandée
            </div>

            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Formule</p>
            <h2 className="text-2xl font-bold mb-1 text-white">Sérénité</h2>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-bold text-white">Sur devis</span>
            </div>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.65)" }}>
              Protection complète et conformité HACCP maximale.
            </p>

            <ul className="space-y-3 mb-8">
              {SERENITE.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
                  <CheckCircle2 size={15} className="shrink-0 mt-0.5" style={{ color: "#4ADE80" }} />
                  {item}
                </li>
              ))}
            </ul>

            <a
              href="mailto:contact@noxyera.com"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#22C55E", boxShadow: "0 4px 14px rgba(34,197,94,0.35)" }}
            >
              Parler à un expert
              <ArrowRight size={15} />
            </a>
          </div>
        </div>

        {/* Exemples tarifaires */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: "#1A1A1A" }}>
            Exemples de tarifs indicatifs
          </h2>
          <div className="rounded-2xl bg-white overflow-hidden shadow-sm" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="grid grid-cols-3 px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ background: "#F5F0E8", color: "#6B7280" }}>
              <span>Profil</span>
              <span className="text-center">Essentiel</span>
              <span className="text-center" style={{ color: "#1B3A2D" }}>Sérénité</span>
            </div>
            {EXEMPLES.map((ex, i) => (
              <div
                key={ex.secteur}
                className="grid grid-cols-3 px-6 py-4 items-center"
                style={{ borderTop: i > 0 ? "1px solid #F3F4F6" : undefined }}
              >
                <span className="text-sm font-medium" style={{ color: "#1A1A1A" }}>{ex.secteur}</span>
                <span className="text-center text-sm font-semibold" style={{ color: "#6B7280" }}>
                  {ex.essentiel.toLocaleString("fr-FR")} €/an
                </span>
                <span className="text-center text-sm font-bold" style={{ color: "#1B3A2D" }}>
                  {ex.serenite.toLocaleString("fr-FR")} €/an
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-center mt-3" style={{ color: "#9CA3AF" }}>
            Tarifs HT indicatifs. Obtenez votre devis précis avec l&apos;estimateur en ligne.
          </p>
        </div>

        {/* Paiement sécurisé */}
        <div className="rounded-2xl px-8 py-7 flex flex-col sm:flex-row items-center gap-5" style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#F0FDF4" }}>
              <Lock size={18} style={{ color: "#16A34A" }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#1A1A1A" }}>Paiement sécurisé</p>
              <p className="text-xs" style={{ color: "#6B7280" }}>Propulsé par Stripe</p>
            </div>
          </div>
          <div className="hidden sm:block w-px self-stretch" style={{ background: "#F3F4F6" }} />
          <ul className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm" style={{ color: "#374151" }}>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={14} style={{ color: "#16A34A" }} />
              Paiement en ligne sécurisé
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={14} style={{ color: "#16A34A" }} />
              Facture PDF automatique
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 size={14} style={{ color: "#16A34A" }} />
              Renouvellement annuel automatique
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#F26522", boxShadow: "0 4px 20px rgba(242,101,34,0.35)" }}
          >
            Obtenir mon estimation gratuite
            <ArrowRight size={18} />
          </Link>
          <p className="text-sm mt-3" style={{ color: "#6B7280" }}>
            En 60 secondes · Sans engagement · Sans CB
          </p>
        </div>
      </main>
    </div>
  );
}
