"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Wrench, AlertCircle, Loader2, ArrowRight, LockOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";

export default function EspaceTechnicienPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // ── Mode démo : accès direct sans Supabase ──────────────────────────────
    if (isDemoMode) {
      router.push("/technicien/missions");
      return;
    }

    // ── Mode production : auth Supabase ────────────────────────────────────
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", data.user?.id)
      .maybeSingle();

    if (profile?.role !== "technicien") {
      setError("Accès réservé aux techniciens Noxyera.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    router.push("/technicien/missions");
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
      <div style={{ marginBottom: "40px" }}>
        <Logo dark />
      </div>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "white",
          borderRadius: "20px",
          padding: "36px 32px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
        }}
      >
        {/* Titre */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "4px" }}>
          <Wrench size={18} style={{ color: "#F26522" }} />
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1B3A2D", margin: 0 }}>
            Espace Technicien
          </h1>
        </div>
        <p style={{ textAlign: "center", fontSize: "13px", color: "#6B7280", margin: "0 0 28px" }}>
          Accédez à vos missions du jour
        </p>

        {/* Bannière démo */}
        {isDemoMode && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px 16px",
              background: "#FFF7ED",
              border: "1px solid #FED7AA",
              borderRadius: "10px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <LockOpen size={16} style={{ color: "#92400E" }} />
            <div>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#92400E", margin: 0 }}>
                Mode démo actif
              </p>
              <p style={{ fontSize: "12px", color: "#B45309", margin: "2px 0 0" }}>
                Cliquez sur &quot;Accéder&quot; pour entrer sans identifiants.
              </p>
            </div>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #FECACA",
              background: "#FEF2F2",
              fontSize: "13px",
              color: "#DC2626",
            }}
          >
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Email professionnel
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={14} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isDemoMode ? "Ignoré en mode démo" : "technicien@noxyera.com"}
                required={!isDemoMode}
                style={{
                  width: "100%",
                  paddingLeft: "40px",
                  paddingRight: "16px",
                  paddingTop: "11px",
                  paddingBottom: "11px",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: "10px",
                  fontSize: "14px",
                  color: "#1A1A1A",
                  background: isDemoMode ? "#F9FAFB" : "#F9FAFB",
                  outline: "none",
                  boxSizing: "border-box",
                  opacity: isDemoMode ? 0.5 : 1,
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Mot de passe
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={14} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isDemoMode ? "Ignoré en mode démo" : "••••••••"}
                required={!isDemoMode}
                style={{
                  width: "100%",
                  paddingLeft: "40px",
                  paddingRight: "16px",
                  paddingTop: "11px",
                  paddingBottom: "11px",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: "10px",
                  fontSize: "14px",
                  color: "#1A1A1A",
                  background: "#F9FAFB",
                  outline: "none",
                  boxSizing: "border-box",
                  opacity: isDemoMode ? 0.5 : 1,
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
              borderRadius: "12px",
              border: "none",
              background: loading ? "#9CA3AF" : "#F26522",
              color: "white",
              fontSize: "15px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 4px 14px rgba(242,101,34,0.4)",
            }}
          >
            {loading
              ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Connexion…</>
              : <>{isDemoMode ? "Accéder aux missions →" : "Accéder à mes missions"} {!loading && !isDemoMode && <ArrowRight size={14} />}</>
            }
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <Link href="/login" style={{ fontSize: "13px", color: "#6B7280", textDecoration: "none" }}>
            ← Espace client
          </Link>
        </div>
      </div>

      <p style={{ marginTop: "28px", fontSize: "12px", color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
        Accès réservé aux techniciens certifiés Certibiocide
      </p>
    </div>
  );
}
