"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Loader2, ShieldCheck, FileText, BarChart3, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";

const FEATURES = [
  { icon: ShieldCheck, text: "Conformité HACCP automatique après chaque intervention" },
  { icon: FileText,    text: "Rapports PDF horodatés disponibles en 1 clic" },
  { icon: BarChart3,   text: "Tableau de bord interventions & historique complet" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isDemoMode) {
      router.push("/dashboard");
      return;
    }

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Email ou mot de passe incorrect. Vérifiez vos identifiants.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", data.user?.id)
      .maybeSingle();

    const redirect =
      profile?.role === "admin"      ? "/admin"
      : profile?.role === "technicien" ? "/technicien/missions"
      : "/dashboard";

    router.push(redirect);
    router.refresh();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1B3A2D",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: "32px" }}>
        <Logo dark />
      </div>

      {/* Carte principale */}
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "white",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
        }}
      >
        {/* Header de la carte */}
        <div
          style={{
            padding: "28px 32px 24px",
            borderBottom: "1px solid #F3F4F6",
          }}
        >
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#1B3A2D",
              margin: 0,
              fontFamily: "var(--font-body), DM Sans, sans-serif",
            }}
          >
            Espace Client Noxyera
          </h1>
          <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "6px", marginBottom: "16px" }}>
            Accédez à vos rapports HACCP, interventions et tableau de bord.
          </p>

          {/* Feature pills */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon size={13} style={{ color: "#10B981", flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: "#4B5563" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Formulaire */}
        <div style={{ padding: "28px 32px" }}>
          {error && (
            <div
              style={{
                marginBottom: "20px",
                padding: "12px 14px",
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: "12px",
                fontSize: "13px",
                color: "#DC2626",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}
              >
                Email professionnel
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={15}
                  style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@etablissement.fr"
                  required
                  style={{
                    width: "100%",
                    paddingLeft: "40px",
                    paddingRight: "16px",
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    border: "1.5px solid #E5E7EB",
                    borderRadius: "12px",
                    fontSize: "14px",
                    color: "#1A1A1A",
                    background: "#F9FAFB",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>
                  Mot de passe
                </label>
                <a href="mailto:contact@noxyera.com" style={{ fontSize: "12px", color: "#1B3A2D", textDecoration: "none" }}>
                  Mot de passe oublié ?
                </a>
              </div>
              <div style={{ position: "relative" }}>
                <Lock
                  size={15}
                  style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%",
                    paddingLeft: "40px",
                    paddingRight: "16px",
                    paddingTop: "12px",
                    paddingBottom: "12px",
                    border: "1.5px solid #E5E7EB",
                    borderRadius: "12px",
                    fontSize: "14px",
                    color: "#1A1A1A",
                    background: "#F9FAFB",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "14px",
                background: loading ? "#9CA3AF" : "#1B3A2D",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 14px rgba(27,58,45,0.3)",
                transition: "all 0.15s",
              }}
            >
              {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
              {loading ? "Connexion en cours…" : "Se connecter"}
            </button>
          </form>

          {/* Pas encore de compte */}
          <div
            style={{
              marginTop: "20px",
              paddingTop: "20px",
              borderTop: "1px solid #F3F4F6",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "13px", color: "#6B7280" }}>
              Pas encore client ?{" "}
              <Link
                href="/#estimateur"
                style={{ color: "#F26522", fontWeight: 600, textDecoration: "none" }}
              >
                Obtenir une estimation gratuite →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Mode démo */}
      {isDemoMode && (
        <div style={{ marginTop: "24px", width: "100%", maxWidth: "440px" }}>
          <p
            style={{
              textAlign: "center",
              fontSize: "11px",
              color: "rgba(255,255,255,0.35)",
              marginBottom: "10px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Mode démo — accès direct
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            {[
              { label: "Dashboard client", href: "/dashboard", color: "#10B981", border: "rgba(16,185,129,0.4)" },
              { label: "Admin", href: "/admin", color: "#60A5FA", border: "rgba(96,165,250,0.4)" },
              { label: "Technicien", href: "/technicien/missions", color: "#FBBF24", border: "rgba(251,191,36,0.4)" },
            ].map(({ label, href, color, border }) => (
              <Link
                key={href}
                href={href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px 6px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${border}`,
                  color,
                  fontSize: "12px",
                  fontWeight: 600,
                  textAlign: "center",
                  textDecoration: "none",
                  transition: "background 0.15s",
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <Link
        href="/"
        style={{
          marginTop: "24px",
          fontSize: "13px",
          color: "rgba(255,255,255,0.35)",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        ← Retour à l&apos;accueil
      </Link>
    </div>
  );
}
