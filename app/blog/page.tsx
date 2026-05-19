import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
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
  HACCP:              { bg: "#D1FAE5", text: "#065F46" },
  Règlementation:     { bg: "#DBEAFE", text: "#1E40AF" },
  Nuisibles:          { bg: "#FEF3C7", text: "#92400E" },
  "Bonnes pratiques": { bg: "#EDE9FE", text: "#5B21B6" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogPage() {
  const [featured, ...rest] = BLOG_ARTICLES;
  const cat = CATEGORIE_COLORS[featured.categorie] ?? { bg: "#F3F4F6", text: "#6B7280" };

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8" }}>
      {/* Nav verte */}
      <header style={{ background: "#1B3A2D", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px" }}>
          <Logo dark />
          <nav style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <Link href="/" style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Accueil</Link>
            <Link href="/tarifs" style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Tarifs</Link>
            <Link
              href="/login"
              style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, color: "white", background: "#F26522", textDecoration: "none" }}
            >
              Accès Client
            </Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "0 24px 80px" }}>
        {/* Header */}
        <div style={{ padding: "48px 0 36px", textAlign: "center" }}>
          <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 700, color: "#F26522", marginBottom: "10px" }}>
            Le Blog Noxyera
          </p>
          <h1 style={{ fontSize: "36px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 12px", fontFamily: "var(--font-display), serif" }}>
            HACCP, Nuisibles & Conformité
          </h1>
          <p style={{ fontSize: "15px", color: "#6B7280", maxWidth: "520px", margin: "0 auto", lineHeight: 1.6 }}>
            Guides pratiques pour les restaurateurs, hôteliers et responsables qualité qui veulent rester conformes sans effort.
          </p>
        </div>

        {/* Article à la une */}
        <Link href={`/blog/${featured.slug}`} style={{ display: "block", marginBottom: "24px", textDecoration: "none" }}>
          <div
            style={{
              borderRadius: "20px",
              padding: "32px",
              background: "white",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.05)",
              transition: "box-shadow 0.2s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, background: cat.bg, color: cat.text }}>
                {featured.categorie}
              </span>
              <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, background: "#FFF7ED", color: "#F26522" }}>
                À la une
              </span>
            </div>
            <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 10px", fontFamily: "var(--font-display), serif" }}>
              {featured.titre}
            </h2>
            <p style={{ fontSize: "14px", color: "#6B7280", margin: "0 0 20px", lineHeight: 1.6 }}>
              {featured.description}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "5px", color: "#9CA3AF" }}>
                <Clock size={11} /> {featured.tempsLecture} min de lecture
              </span>
              <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{formatDate(featured.date)}</span>
              <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", fontWeight: 600, color: "#1B3A2D" }}>
                Lire l&apos;article <ArrowRight size={12} />
              </span>
            </div>
          </div>
        </Link>

        {/* Grille des autres articles */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {rest.map((article) => {
            const c = CATEGORIE_COLORS[article.categorie] ?? { bg: "#F3F4F6", text: "#6B7280" };
            return (
              <Link key={article.slug} href={`/blog/${article.slug}`} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    borderRadius: "16px",
                    padding: "20px",
                    background: "white",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                    border: "1px solid rgba(0,0,0,0.04)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <span style={{ alignSelf: "flex-start", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: c.bg, color: c.text, marginBottom: "12px" }}>
                    {article.categorie}
                  </span>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 8px", flex: 1, lineHeight: 1.4 }}>
                    {article.titre}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 16px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {article.description}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "auto" }}>
                    <span style={{ fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", color: "#9CA3AF" }}>
                      <Clock size={10} /> {article.tempsLecture} min
                    </span>
                    <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{formatDate(article.date)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: "56px",
            borderRadius: "20px",
            padding: "36px 32px",
            textAlign: "center",
            background: "#1B3A2D",
          }}
        >
          <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 700, color: "#F26522", marginBottom: "10px" }}>
            Passez à l&apos;action
          </p>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "white", margin: "0 0 10px", fontFamily: "var(--font-display), serif" }}>
            Quel est le risque nuisibles de votre établissement ?
          </h2>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", margin: "0 0 24px" }}>
            Obtenez votre Pest Alert Score gratuit en 30 secondes.
          </p>
          <Link
            href="/suivi-sanitaire"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px", borderRadius: "12px", background: "#F26522", color: "white", fontWeight: 600, fontSize: "14px", textDecoration: "none" }}
          >
            Calculer mon score <ArrowRight size={14} />
          </Link>
        </div>
      </main>
    </div>
  );
}
