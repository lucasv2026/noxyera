"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, CheckCircle2, Calendar, FileText, ShieldCheck,
  Zap, Users, BarChart3, Clock, Download, UserCircle,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { PriceEstimator } from "@/components/landing/price-estimator";
import { PestAlertNetwork } from "@/components/PestAlertNetwork";
import type { Secteur } from "@/lib/pricing";

// ── Navigation ───────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ background: "rgba(27,67,50,0.97)", borderColor: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Logo dark />
        <nav className="hidden items-center gap-8 text-sm md:flex" style={{ color: "rgba(255,255,255,0.8)" }}>
          <Link href="/suivi-sanitaire" className="hover:text-white transition-colors">Suivi sanitaire</Link>
          <Link href="/tarifs" className="hover:text-white transition-colors">Tarifs</Link>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/espace-technicien"
            className="hidden sm:inline-flex items-center rounded-[10px] border px-3 py-2 text-xs font-medium transition-colors hover:bg-white/10"
            style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)" }}
          >
            Techniciens
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-white/10"
            style={{ borderColor: "rgba(255,255,255,0.5)" }}
          >
            <UserCircle size={16} />
            Accès Client
          </Link>
        </div>
      </div>
    </header>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section style={{ background: "#f5f0e8", minHeight: "88vh" }} className="flex items-center">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
        {/* Texte */}
        <div>
          <p
            className="mb-4 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: "#6b7280" }}
          >
            Conformité anti-nuisibles B2B
          </p>
          <h1
            className="font-heading text-5xl font-normal leading-[1.1] md:text-6xl"
            style={{ color: "#1b4332" }}
          >
            Vos sites, enfin{" "}
            <span style={{ textDecorationLine: "underline", textDecorationColor: "#f97316", textDecorationThickness: "3px", textUnderlineOffset: "6px" }}>
              protégés.
            </span>
            <br />
            Et documentés.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8" style={{ color: "#4b5563" }}>
            Noxyera connecte vos établissements à des techniciens Certibiocide vérifiés —
            interventions planifiées, rapports automatiques, zéro paperasse.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#estimateur"
              className="inline-flex items-center gap-2 rounded-[14px] px-6 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "#1b4332", boxShadow: "0 4px 14px rgba(27,67,50,0.25)" }}
            >
              <Calendar size={15} />
              Audit gratuit — 48h
              <ArrowRight size={15} />
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-[14px] border px-6 py-3.5 text-sm font-semibold transition-all hover:bg-black/5"
              style={{ borderColor: "#1b4332", color: "#1b4332" }}
            >
              Voir la démo
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 flex flex-wrap items-center gap-5">
            {[
              "Techniciens certifiés Certibiocide",
              "100% sans engagement",
              "Intervention sous 48h",
            ].map((t) => (
              <span key={t} className="flex items-center gap-2 text-sm" style={{ color: "#4b5563" }}>
                <CheckCircle2 size={14} style={{ color: "#10b981" }} />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Image — hall d'hôtel / restaurant professionnel */}
        <div className="relative">
          <div
            className="overflow-hidden rounded-2xl shadow-2xl"
            style={{ aspectRatio: "4/3" }}
          >
            <Image
              src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=85"
              alt="Restaurant professionnel"
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>
          {/* Badge flottant HACCP */}
          <div
            className="absolute -bottom-4 -left-4 rounded-2xl p-4 shadow-xl"
            style={{ background: "white", minWidth: "200px" }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#d1fae5" }}>
                <ShieldCheck size={18} style={{ color: "#059669" }} />
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: "#1b4332" }}>Rapport HACCP généré</p>
                <p className="text-xs" style={{ color: "#6b7280" }}>Brasserie Voltaire · conforme</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Features strip ────────────────────────────────────────────────────────────
function FeaturesStrip() {
  return (
    <section style={{ background: "white", borderColor: "#e5e7eb" }} className="border-y">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, title: "Conformité DDPP garantie",    text: "Rapports horodatés générés automatiquement après chaque visite. Prêts pour vos contrôles." },
            { icon: Zap,         title: "Interventions rapides 24-48h", text: "Infestation détectée ? Un technicien expert intervient rapidement. Inclus dans le forfait Sérénité." },
            { icon: Users,       title: "Techniciens vérifiés",         text: "Tous certifiés Certibiocide, formés aux normes HACCP, et experts de leur métier." },
            { icon: FileText,    title: "Zéro administratif",           text: "Rapports générés en automatique. Téléchargeables depuis votre espace en ligne." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex flex-col gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#d1fae5" }}>
                <Icon size={18} style={{ color: "#1b4332" }} />
              </div>
              <p className="font-body text-sm font-bold" style={{ color: "#1b4332" }}>{title}</p>
              <p className="text-sm leading-6" style={{ color: "#6b7280" }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Comment ça marche ─────────────────────────────────────────────────────────
function HowItWorksSection() {
  return (
    <section className="px-6 py-20" style={{ background: "#ecede8" }}>
      <div className="mx-auto max-w-7xl">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "#6b7280" }}>
          Notre méthode
        </p>
        <h2 className="font-heading mb-12 text-center text-4xl" style={{ color: "#1b4332" }}>
          Comment ça marche ?
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              num: "01", icon: Calendar,
              title: "Audit gratuit sous 48h",
              text: "Un technicien certifié Certibiocide vient sur site évaluer vos risques et proposer un plan adapté.",
            },
            {
              num: "02", icon: ShieldCheck,
              title: "Contrat annuel sur mesure",
              text: "Formule Essentiel ou Sérénité selon votre profil de risque — prix fixe, sans mauvaise surprise.",
            },
            {
              num: "03", icon: FileText,
              title: "Rapports disponibles en 1 clic",
              text: "HACCP, PMS, fiches biocides — tout est archivé et téléchargeable à tout moment depuis votre espace.",
            },
          ].map(({ num, icon: Icon, title, text }) => (
            <article key={num} className="relative rounded-2xl bg-white p-7 shadow-sm">
              <div
                className="mb-5 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: "#f97316" }}
              >
                {num}
              </div>
              <div className="mb-4">
                <Icon size={20} style={{ color: "#1b4332" }} />
              </div>
              <h3 className="font-heading text-xl" style={{ color: "#1b4332" }}>{title}</h3>
              <p className="mt-3 text-sm leading-6" style={{ color: "#6b7280" }}>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pest Alert section ────────────────────────────────────────────────────────
// ── Secteurs clients ─────────────────────────────────────────────────────────
function SecteursSection({ onSecteurSelect }: { onSecteurSelect: (s: Secteur) => void }) {
  return (
    <section className="bg-white px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "#6b7280" }}>
          Nos secteurs
        </p>
        <h2 className="font-heading mb-12 text-center text-4xl" style={{ color: "#1b4332" }}>
          Ils nous font confiance
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80",
              label: "Restauration & Brasseries",
              secteur: "restaurant" as Secteur,
            },
            {
              src: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80",
              label: "Hôtellerie",
              secteur: "hotel" as Secteur,
            },
            {
              src: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=600&q=80",
              label: "Logistique & Agroalimentaire",
              secteur: "entrepot" as Secteur,
            },
          ].map(({ src, label, secteur }) => (
            <button
              key={label}
              onClick={() => {
                onSecteurSelect(secteur);
                document.getElementById("estimateur")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group overflow-hidden rounded-2xl text-left shadow-sm transition-all hover:shadow-md"
              style={{ border: "1px solid rgba(0,0,0,0.06)" }}
            >
              <div className="relative h-52 w-full overflow-hidden">
                <Image src={src} alt={label} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
              </div>
              <div className="bg-white px-5 py-4">
                <p className="font-body font-semibold text-sm" style={{ color: "#1b4332" }}>{label}</p>
                <p className="mt-1 flex items-center gap-1 text-xs" style={{ color: "#6b7280" }}>
                  Estimer mon tarif
                  <ArrowRight size={11} />
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Platform preview (dark section) ──────────────────────────────────────────
function PlatformSection() {
  return (
    <section className="px-6 py-20" style={{ background: "#1b4332" }}>
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.5)" }}>
              Plateforme
            </p>
            <h2 className="font-heading mb-6 text-4xl text-white">
              Un tableau de bord pensé pour les pros de la restauration
            </h2>
            <p className="text-lg leading-8" style={{ color: "rgba(255,255,255,0.7)" }}>
              Score HACCP en temps réel, historique des passages, rapports téléchargeables —
              tout ce dont vous avez besoin pour rester conforme sans effort.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { icon: BarChart3,  label: "Score HACCP en direct" },
                { icon: Calendar,   label: "Planning interventions" },
                { icon: Download,   label: "Export PDF instantané" },
                { icon: Clock,      label: "Historique illimité" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <Icon size={14} className="text-white" />
                  </div>
                  <span className="text-sm text-white/80">{label}</span>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard"
              className="mt-8 inline-flex items-center gap-2 rounded-[14px] px-6 py-3.5 text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: "#f5f0e8", color: "#1b4332" }}
            >
              Voir le dashboard démo
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Dashboard preview card */}
          <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#0d1f17", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <span className="text-sm font-semibold text-white">Dashboard — Brasserie Voltaire</span>
              <span className="flex items-center gap-1.5 text-xs" style={{ color: "#10b981" }}>
                <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: "#10b981" }} />
                Conforme
              </span>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: "Score HACCP",       value: "96 / 100",   color: "#10b981" },
                { label: "Prochaine visite",  value: "22 mai 2026", color: "white" },
                { label: "Technicien",         value: "Thomas Lebrun (Certibiocide)", color: "rgba(255,255,255,0.7)" },
                { label: "Dernier rapport",   value: "Télécharger PDF →",  color: "#f97316" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</span>
                  <span className="text-sm font-semibold" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── CTA finale ────────────────────────────────────────────────────────────────
// ── Conformité couverte ───────────────────────────────────────────────────────
function ConformiteSection() {
  const badges = [
    {
      code: "HACCP",
      label: "HACCP",
      desc: "Hazard Analysis Critical Control Points",
      color: "#065F46", bg: "#D1FAE5",
    },
    {
      code: "PMS",
      label: "Plan de Maîtrise Sanitaire",
      desc: "Conformité plan sanitaire",
      color: "#1e40af", bg: "#DBEAFE",
    },
    {
      code: "CERTIBIO",
      label: "Certibiocide",
      desc: "Techniciens certifiés ANSES",
      color: "#7c2d12", bg: "#FED7AA",
    },
    {
      code: "HYGIENE",
      label: "Paquet Hygiène EU",
      desc: "Règlements CE 852/2004 & 853/2004",
      color: "#1b4332", bg: "#D1FAE5",
    },
    {
      code: "IFSBRC",
      label: "IFS / BRC",
      desc: "Standards de sécurité alimentaire",
      color: "#5b21b6", bg: "#EDE9FE",
    },
    {
      code: "RSD",
      label: "RSD Art. 119",
      desc: "Règlement Sanitaire Départemental",
      color: "#7f1d1d", bg: "#FEE2E2",
    },
  ];

  return (
    <section className="px-6 py-20" style={{ background: "#f5f0e8" }}>
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "#6b7280" }}>
          Conformité garantie
        </p>
        <h2 className="font-heading mb-4 text-center text-4xl" style={{ color: "#1b4332" }}>
          Toutes vos obligations couvertes
        </h2>
        <p className="mb-12 text-center text-base leading-7 max-w-xl mx-auto" style={{ color: "#4b5563" }}>
          Noxyera couvre l&apos;ensemble des réglementations sanitaires applicables aux
          professionnels de l&apos;alimentation, de l&apos;hôtellerie et de l&apos;industrie en France.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map(({ code, label, desc, color, bg }) => (
            <div
              key={code}
              className="flex items-start gap-3 rounded-2xl bg-white p-5 shadow-sm"
              style={{ border: "1px solid rgba(0,0,0,0.05)" }}
            >
              <div
                className="shrink-0 flex items-center justify-center rounded-xl px-2.5 py-1.5 text-xs font-bold"
                style={{ background: bg, color }}
              >
                {code}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm" style={{ color: "#1A1A1A" }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs" style={{ color: "#9CA3AF" }}>
          Chaque rapport Noxyera inclut les mentions de conformité requises par les organismes de contrôle.
        </p>
      </div>
    </section>
  );
}

// ── Pourquoi les PME nous choisissent ────────────────────────────────────────
function PmeSection() {
  const benefits = [
    {
      title: "Conformité réglementaire garantie",
      desc: "Rapports horodatés générés automatiquement après chaque visite.",
    },
    {
      title: "Interventions rapides 24-48h",
      desc: "Infestation détectée ? Un technicien intervient rapidement.",
    },
    {
      title: "Techniciens vérifiés et experts",
      desc: "Tous certifiés Certibiocide, formés HACCP.",
    },
    {
      title: "Un prix transparent, une seule facture",
      desc: "Pas de coût caché, pas de surprise.",
    },
    {
      title: "Zéro administratif",
      desc: "Rapports générés en automatique, téléchargeables depuis votre espace.",
    },
  ];

  return (
    <section className="px-6 py-20" style={{ background: "white" }}>
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          {/* Image cuisine */}
          <div className="relative overflow-hidden rounded-2xl shadow-xl" style={{ aspectRatio: "4/3" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80"
              alt="Cuisine professionnelle conforme HACCP"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div style={{ position: "absolute", bottom: "16px", left: "16px" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "6px 14px", borderRadius: "20px",
                background: "rgba(255,255,255,0.95)", fontSize: "12px", fontWeight: 700, color: "#1B3A2D",
              }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#27AE60", display: "inline-block" }} />
                Cuisine certifiée conforme
              </span>
            </div>
          </div>

          {/* Bénéfices */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "#F26522" }}>
              Pourquoi nous choisir
            </p>
            <h2 className="font-heading mb-8 text-4xl" style={{ color: "#1B3A2D" }}>
              Pourquoi les PME nous choisissent
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {benefits.map((b, i) => (
                <div key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: "#D1FAE5", display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0, marginTop: "2px",
                  }}>
                    <CheckCircle2 size={14} style={{ color: "#27AE60" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 3px" }}>
                      {b.title}
                    </p>
                    <p style={{ fontSize: "13px", color: "#6B7280", margin: 0, lineHeight: 1.5 }}>
                      {b.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/#estimateur"
              className="mt-8 inline-flex items-center gap-2 rounded-[14px] px-6 py-3.5 text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: "#1B3A2D", color: "white" }}
            >
              Obtenir un devis gratuit <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="px-6 py-24 text-center" style={{ background: "#1b4332" }}>
      <div className="mx-auto max-w-2xl">
        <h2 className="font-heading text-4xl text-white md:text-5xl">
          Votre établissement mérite mieux qu&apos;un rapport manuscrit.
        </h2>
        <p className="mt-5 text-lg" style={{ color: "rgba(255,255,255,0.7)" }}>
          Rejoignez les 200+ établissements qui font confiance à Noxyera pour leur conformité sanitaire.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="#estimateur"
            className="inline-flex items-center gap-2 rounded-[14px] px-8 py-4 text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: "#f5f0e8", color: "#1b4332" }}
          >
            <Calendar size={15} />
            Demander un audit gratuit
            <ArrowRight size={15} />
          </a>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-[14px] border px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/10"
            style={{ borderColor: "rgba(255,255,255,0.3)" }}
          >
            Voir la démo
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="px-6 py-8" style={{ background: "#1b4332", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Logo dark />
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
          © 2026 Noxyera SAS · Paris, France · contact@noxyera.com
        </p>
        <div className="flex gap-5 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
          <Link href="/suivi-sanitaire" className="hover:text-white/70 transition-colors">Suivi sanitaire</Link>
          <Link href="/tarifs" className="hover:text-white/70 transition-colors">Tarifs</Link>
          <Link href="/blog" className="hover:text-white/70 transition-colors">Blog</Link>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [secteurPreselect, setSecteurPreselect] = useState<Secteur>("restaurant");

  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturesStrip />
      <PestAlertNetwork onSecteurSelect={setSecteurPreselect} />
      <HowItWorksSection />
      <PmeSection />
      <SecteursSection onSecteurSelect={setSecteurPreselect} />
      <PlatformSection />
      <PriceEstimator defaultSecteur={secteurPreselect} />
      <ConformiteSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
