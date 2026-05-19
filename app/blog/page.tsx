import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { BLOG_ARTICLES } from "@/lib/blog-data";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Blog — Réglementation HACCP, anti-nuisibles et conformité",
  description:
    "Conseils pratiques sur la réglementation HACCP, la gestion anti-nuisibles et la conformité sanitaire pour les restaurants et hôtels en France.",
  openGraph: {
    title: "Blog Noxyera — HACCP & Anti-Nuisibles",
    description: "Conseils pratiques sur la réglementation HACCP, la gestion anti-nuisibles et la conformité sanitaire.",
  },
};

const CATEGORIE_COLORS: Record<string, { bg: string; text: string }> = {
  HACCP:            { bg: "rgba(16,185,129,0.12)", text: "#10B981" },
  Règlementation:   { bg: "rgba(96,165,250,0.12)", text: "#60A5FA" },
  Nuisibles:        { bg: "rgba(245,158,11,0.12)",  text: "#F59E0B" },
  "Bonnes pratiques": { bg: "rgba(167,139,250,0.12)", text: "#A78BFA" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogPage() {
  const [featured, ...rest] = BLOG_ARTICLES;
  const cat = CATEGORIE_COLORS[featured.categorie] ?? { bg: "rgba(255,255,255,0.08)", text: "white" };

  return (
    <div className="min-h-screen" style={{ background: "#0D1F17" }}>
      {/* Nav */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-6 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
          <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
          <Link href="/tarifs" className="hover:text-white transition-colors">Tarifs</Link>
          <Link
            href="/login"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "#F26522" }}
          >
            Accès Client
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20">
        {/* Header */}
        <div className="py-12 text-center">
          <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "#F26522", fontFamily: "monospace" }}>
            Le Blog Noxyera
          </p>
          <h1 className="text-4xl font-bold text-white mb-4">
            HACCP, Nuisibles & Conformité
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.5)" }}>
            Guides pratiques pour les restaurateurs, hôteliers et responsables qualité qui veulent rester conformes sans effort.
          </p>
        </div>

        {/* Article à la une */}
        <Link href={`/blog/${featured.slug}`} className="block mb-8 group">
          <div
            className="rounded-2xl p-8 transition-all group-hover:border-opacity-30"
            style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: cat.bg, color: cat.text }}
              >
                {featured.categorie}
              </span>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: "rgba(242,101,34,0.15)", color: "#F26522" }}
              >
                À la une
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-green-300 transition-colors">
              {featured.titre}
            </h2>
            <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.5)" }}>
              {featured.description}
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                <Clock size={11} /> {featured.tempsLecture} min de lecture
              </span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                {formatDate(featured.date)}
              </span>
              <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#10B981" }}>
                Lire l&apos;article <ArrowRight size={12} />
              </span>
            </div>
          </div>
        </Link>

        {/* Grille des autres articles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {rest.map((article) => {
            const c = CATEGORIE_COLORS[article.categorie] ?? { bg: "rgba(255,255,255,0.08)", text: "white" };
            return (
              <Link key={article.slug} href={`/blog/${article.slug}`} className="group block">
                <div
                  className="rounded-2xl p-5 h-full flex flex-col transition-all"
                  style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <span
                    className="self-start px-2 py-0.5 rounded-full text-xs font-semibold mb-3"
                    style={{ background: c.bg, color: c.text }}
                  >
                    {article.categorie}
                  </span>
                  <h3 className="text-sm font-bold text-white mb-2 flex-1 group-hover:text-green-300 transition-colors leading-snug">
                    {article.titre}
                  </h3>
                  <p className="text-xs mb-4 line-clamp-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {article.description}
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <span className="text-xs flex items-center gap-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                      <Clock size={10} /> {article.tempsLecture} min
                    </span>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                      {formatDate(article.date)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div
          className="mt-16 rounded-2xl p-8 text-center"
          style={{ background: "#122B1E", border: "1px solid rgba(242,101,34,0.2)" }}
        >
          <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "#F26522" }}>
            Passez à l&apos;action
          </p>
          <h2 className="text-2xl font-bold text-white mb-3">
            Quel est le risque nuisibles de votre établissement ?
          </h2>
          <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
            Obtenez votre Pest Alert Score gratuit en 30 secondes.
          </p>
          <Link
            href="/suivi-sanitaire"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm"
            style={{ background: "#F26522" }}
          >
            Calculer mon score <ArrowRight size={14} />
          </Link>
        </div>
      </main>
    </div>
  );
}
