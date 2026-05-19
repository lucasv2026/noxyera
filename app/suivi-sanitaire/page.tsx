import Link from "next/link";
import { FileText, Clock, Download, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/logo";

const ETAPES = [
  {
    num: "01",
    titre: "Intervention réalisée",
    texte: "Le technicien certifié Certibiocide effectue l'intervention sur site. Il saisit les zones traitées, les produits utilisés et prend des photos si nécessaire.",
  },
  {
    num: "02",
    titre: "Rapport généré automatiquement",
    texte: "À la fin de l'intervention, le rapport HACCP est généré instantanément depuis l'app technicien. Il est horodaté et signé numériquement.",
  },
  {
    num: "03",
    titre: "Archivage sécurisé",
    texte: "Le PDF est archivé dans Supabase Storage avec chiffrement. Vous y avez accès 24h/24 depuis votre tableau de bord client.",
  },
  {
    num: "04",
    titre: "Disponible en 1 clic",
    texte: "En cas de contrôle DDPP ou de vérification interne, téléchargez votre rapport en un clic. Format homologué, horodatage certifié.",
  },
];

const ARGUMENTS = [
  {
    icon: ShieldCheck,
    titre: "Conformité DDPP garantie",
    texte: "Nos rapports respectent le format exigé par la Direction Départementale de la Protection des Populations.",
  },
  {
    icon: Clock,
    titre: "Horodatage certifié",
    texte: "Chaque rapport est horodaté à la milliseconde lors de sa génération, avec signature numérique du technicien.",
  },
  {
    icon: Download,
    titre: "Export PDF instantané",
    texte: "Téléchargez vos rapports en PDF depuis votre espace client à tout moment, sans délai.",
  },
  {
    icon: FileText,
    titre: "Historique illimité",
    texte: "Conservez l'intégralité de vos passages et interventions dans un historique complet, consultable à tout moment.",
  },
];

export default function SuiviSanitairePage() {
  return (
    <div style={{ background: "#F5F0E8", minHeight: "100vh" }}>
      {/* Nav */}
      <header className="sticky top-0 z-10 px-6 py-4" style={{ background: "white", borderBottom: "1px solid #E5E7EB" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Link href="/tarifs" className="text-sm font-medium" style={{ color: "#6B7280" }}>Tarifs</Link>
            <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-xl transition-colors hover:bg-gray-100" style={{ color: "#1B3A2D" }}>
              Accès Client
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-20">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-5" style={{ color: "#1A1A1A" }}>
            Le suivi sanitaire<br />
            <span style={{ color: "#1B3A2D" }}>100% numérique</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#6B7280" }}>
            Noxyera génère automatiquement vos rapports HACCP après chaque intervention.
            Horodatés, signés numériquement, accessibles en un clic.
          </p>
        </div>

        {/* Comment ça marche */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-10" style={{ color: "#1A1A1A" }}>
            Comment ça fonctionne
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ETAPES.map((etape) => (
              <div key={etape.num} className="rounded-2xl bg-white p-6 shadow-sm" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold mb-4"
                  style={{ background: "#1B3A2D", color: "white" }}
                >
                  {etape.num}
                </div>
                <h3 className="font-semibold text-sm mb-2" style={{ color: "#1A1A1A" }}>
                  {etape.titre}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>
                  {etape.texte}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Aperçu rapport */}
        <div className="rounded-3xl overflow-hidden shadow-lg" style={{ background: "#1B3A2D" }}>
          <div className="p-8 sm:p-12">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <FileText size={13} className="text-white" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.6)" }}>
                  Rapport HACCP — Exemple
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Un rapport complet en 30 secondes
              </h2>
              <p className="text-base mb-8" style={{ color: "rgba(255,255,255,0.7)" }}>
                Dès que l&apos;intervention est validée par le technicien, le PDF est généré, signé numériquement et disponible dans votre espace client.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  "Zones traitées avec cartographie",
                  "Produits biocides utilisés (n° AMM)",
                  "Date et heure exactes d'intervention",
                  "Signature numérique technicien",
                  "Technicien certifié Certibiocide",
                  "Conformité DDPP attestée",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="shrink-0 mt-0.5" style={{ color: "#4ADE80" }} />
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4 arguments */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-10" style={{ color: "#1A1A1A" }}>
            Pourquoi c&apos;est important
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {ARGUMENTS.map(({ icon: Icon, titre, texte }) => (
              <div
                key={titre}
                className="rounded-2xl bg-white p-6 shadow-sm flex gap-4"
                style={{ border: "1px solid rgba(0,0,0,0.06)" }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#F5F0E8" }}>
                  <Icon size={18} style={{ color: "#1B3A2D" }} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: "#1A1A1A" }}>{titre}</h3>
                  <p className="text-sm" style={{ color: "#6B7280" }}>{texte}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "#F26522", boxShadow: "0 4px 20px rgba(242,101,34,0.35)" }}
          >
            Estimer mon tarif en 60 secondes
            <ArrowRight size={18} />
          </Link>
          <p className="text-sm mt-3" style={{ color: "#6B7280" }}>
            Sans engagement · Résultat immédiat
          </p>
        </div>
      </main>
    </div>
  );
}
