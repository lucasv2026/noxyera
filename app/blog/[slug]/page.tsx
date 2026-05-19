import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, ArrowRight } from "lucide-react";
import { BLOG_ARTICLES, getArticle } from "@/lib/blog-data";
import { Logo } from "@/components/logo";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return BLOG_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticle(params.slug);
  if (!article) return {};
  return {
    title: article.titre,
    description: article.description,
    openGraph: {
      title: article.titre,
      description: article.description,
      type: "article",
      publishedTime: article.date,
      authors: ["Noxyera"],
    },
  };
}

const CATEGORIE_COLORS: Record<string, { bg: string; text: string }> = {
  HACCP:              { bg: "#D1FAE5", text: "#065F46" },
  Règlementation:     { bg: "#DBEAFE", text: "#1E40AF" },
  Nuisibles:          { bg: "#FEF3C7", text: "#92400E" },
  "Bonnes pratiques": { bg: "#EDE9FE", text: "#5B21B6" },
};

function renderMarkdown(content: string): string {
  return content
    .replace(/\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/g, (_, header, rows) => {
      const th = header.split("|").filter(Boolean).map((c: string) => `<th>${c.trim()}</th>`).join("");
      const trs = rows.trim().split("\n").map((row: string) =>
        `<tr>${row.split("|").filter(Boolean).map((c: string) => `<td>${c.trim()}</td>`).join("")}</tr>`
      ).join("");
      return `<table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`;
    })
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/^(?!<[htul]).+$/gm, (line) => line.trim() ? `<p>${line}</p>` : '')
    .replace(/\n{3,}/g, '\n\n');
}

export default function BlogArticlePage({ params }: Props) {
  const article = getArticle(params.slug);
  if (!article) notFound();

  const cat = CATEGORIE_COLORS[article.categorie] ?? { bg: "#F3F4F6", text: "#6B7280" };
  const autresArticles = BLOG_ARTICLES.filter(a => a.slug !== article.slug).slice(0, 3);

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8" }}>
      {/* Nav verte */}
      <header style={{ background: "#1B3A2D", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px" }}>
          <Logo dark />
          <nav style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <Link href="/blog" style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Blog</Link>
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

      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px 80px" }}>
        {/* Breadcrumb */}
        <Link
          href="/blog"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6B7280", textDecoration: "none", marginTop: "28px", marginBottom: "24px" }}
        >
          <ArrowLeft size={13} /> Retour au blog
        </Link>

        {/* Header article */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, background: cat.bg, color: cat.text }}>
              {article.categorie}
            </span>
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 14px", lineHeight: 1.25, fontFamily: "var(--font-display), serif" }}>
            {article.titre}
          </h1>
          <p style={{ fontSize: "15px", color: "#6B7280", margin: "0 0 18px", lineHeight: 1.6 }}>
            {article.description}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: "12px", color: "#9CA3AF" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Calendar size={11} />
              {new Date(article.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Clock size={11} /> {article.tempsLecture} min de lecture
            </span>
            <span>Par l&apos;équipe Noxyera</span>
          </div>
        </div>

        <div style={{ height: "1px", background: "#E5E7EB", marginBottom: "32px" }} />

        {/* Contenu article */}
        <div
          className="prose-noxyera"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(article.contenu) }}
          style={{ color: "#1A1A1A", lineHeight: 1.8, fontSize: "15px" }}
        />

        {/* CTA inline */}
        <div
          style={{
            marginTop: "48px",
            borderRadius: "16px",
            padding: "28px",
            background: "#1B3A2D",
          }}
        >
          <p style={{ fontSize: "15px", fontWeight: 700, color: "white", margin: "0 0 8px" }}>
            Noxyera — Conformité HACCP sans effort
          </p>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", margin: "0 0 20px" }}>
            Rapports PDF automatiques, Pest Alert Score en temps réel, techniciens certifiés Certibiocide.
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link
              href="/suivi-sanitaire"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 18px", borderRadius: "10px", background: "#F26522", color: "white", fontWeight: 600, fontSize: "13px", textDecoration: "none" }}
            >
              Calculer mon score <ArrowRight size={12} />
            </Link>
            <Link
              href="/tarifs"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 18px", borderRadius: "10px", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", fontSize: "13px", textDecoration: "none" }}
            >
              Voir les tarifs
            </Link>
          </div>
        </div>

        {/* Autres articles */}
        {autresArticles.length > 0 && (
          <div style={{ marginTop: "48px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 16px" }}>À lire aussi</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {autresArticles.map((a) => {
                const ac = CATEGORIE_COLORS[a.categorie] ?? { bg: "#F3F4F6", text: "#6B7280" };
                return (
                  <Link
                    key={a.slug}
                    href={`/blog/${a.slug}`}
                    style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px", borderRadius: "12px", background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", textDecoration: "none", border: "1px solid rgba(0,0,0,0.04)" }}
                  >
                    <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: ac.bg, color: ac.text, flexShrink: 0 }}>
                      {a.categorie}
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "#1B3A2D", flex: 1 }}>
                      {a.titre}
                    </span>
                    <ArrowRight size={13} style={{ color: "#9CA3AF", flexShrink: 0 }} />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
