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
  HACCP:              { bg: "rgba(16,185,129,0.12)", text: "#10B981" },
  Règlementation:     { bg: "rgba(96,165,250,0.12)", text: "#60A5FA" },
  Nuisibles:          { bg: "rgba(245,158,11,0.12)",  text: "#F59E0B" },
  "Bonnes pratiques": { bg: "rgba(167,139,250,0.12)", text: "#A78BFA" },
};

function renderMarkdown(content: string): string {
  return content
    // Tables
    .replace(/\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/g, (_, header, rows) => {
      const th = header.split("|").filter(Boolean).map((c: string) => `<th>${c.trim()}</th>`).join("");
      const trs = rows.trim().split("\n").map((row: string) =>
        `<tr>${row.split("|").filter(Boolean).map((c: string) => `<td>${c.trim()}</td>`).join("")}</tr>`
      ).join("");
      return `<table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`;
    })
    // H2
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    // H3
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Paragraphs
    .replace(/^(?!<[htul]).+$/gm, (line) => line.trim() ? `<p>${line}</p>` : '')
    // Cleanup
    .replace(/\n{3,}/g, '\n\n');
}

export default function BlogArticlePage({ params }: Props) {
  const article = getArticle(params.slug);
  if (!article) notFound();

  const cat = CATEGORIE_COLORS[article.categorie] ?? { bg: "rgba(255,255,255,0.08)", text: "white" };
  const autresArticles = BLOG_ARTICLES.filter(a => a.slug !== article.slug).slice(0, 3);

  return (
    <div className="min-h-screen" style={{ background: "#0D1F17" }}>
      {/* Nav */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-6 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
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

      <main className="mx-auto max-w-3xl px-6 pb-20">
        {/* Breadcrumb */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs mb-8 hover:text-white transition-colors"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          <ArrowLeft size={12} /> Retour au blog
        </Link>

        {/* Header article */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: cat.bg, color: cat.text }}
            >
              {article.categorie}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white leading-tight mb-4">
            {article.titre}
          </h1>
          <p className="text-base mb-5" style={{ color: "rgba(255,255,255,0.55)" }}>
            {article.description}
          </p>
          <div className="flex items-center gap-5 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            <span className="flex items-center gap-1.5">
              <Calendar size={11} />
              {new Date(article.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={11} /> {article.tempsLecture} min de lecture
            </span>
            <span>Par l&apos;équipe Noxyera</span>
          </div>
        </div>

        {/* Séparateur */}
        <div className="mb-8" style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />

        {/* Contenu */}
        <div
          className="prose-noxyera"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(article.contenu) }}
          style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.8 }}
        />

        {/* CTA inline */}
        <div
          className="mt-12 rounded-2xl p-6"
          style={{ background: "#122B1E", border: "1px solid rgba(242,101,34,0.2)" }}
        >
          <p className="text-sm font-bold text-white mb-2">
            Noxyera — Conformité HACCP sans effort
          </p>
          <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
            Rapports PDF automatiques, Pest Alert Score en temps réel, techniciens certifiés Certibiocide.
          </p>
          <div className="flex gap-3">
            <Link
              href="/suivi-sanitaire"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-xs"
              style={{ background: "#F26522" }}
            >
              Calculer mon score <ArrowRight size={12} />
            </Link>
            <Link
              href="/tarifs"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
            >
              Voir les tarifs
            </Link>
          </div>
        </div>

        {/* Autres articles */}
        {autresArticles.length > 0 && (
          <div className="mt-12">
            <h2 className="text-base font-bold text-white mb-4">À lire aussi</h2>
            <div className="space-y-3">
              {autresArticles.map((a) => {
                const ac = CATEGORIE_COLORS[a.categorie] ?? { bg: "rgba(255,255,255,0.08)", text: "white" };
                return (
                  <Link key={a.slug} href={`/blog/${a.slug}`} className="group flex items-center gap-4 p-4 rounded-xl transition-colors hover:bg-white/5"
                    style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-semibold shrink-0"
                      style={{ background: ac.bg, color: ac.text }}
                    >
                      {a.categorie}
                    </span>
                    <span className="text-sm text-white group-hover:text-green-300 transition-colors flex-1">
                      {a.titre}
                    </span>
                    <ArrowRight size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
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
