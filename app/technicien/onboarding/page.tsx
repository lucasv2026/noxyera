"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, Wrench, CheckCircle2, AlertCircle } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export default function TechnicienOnboardingPage() {
  const router = useRouter();
  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [error, setError]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [prenom, setPrenom]         = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.user_metadata?.prenom) {
        setPrenom(data.user.user_metadata.prenom);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(`Erreur : ${updateError.message}`);
        setLoading(false);
        return;
      }
      // Mark onboarding as done so auth callback won't redirect here again
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ onboarding_done: true })
          .eq("user_id", user.id);
      }
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/technicien/missions";
      }, 1500);
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
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
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "6px" }}>
          <Wrench size={20} style={{ color: "#F26522" }} />
          <h1 style={{ fontSize: "21px", fontWeight: 700, color: "#1B3A2D", margin: 0 }}>
            Bienvenue chez Noxyera
          </h1>
        </div>
        <p style={{ textAlign: "center", fontSize: "14px", color: "#6B7280", margin: "0 0 28px" }}>
          {prenom ? `Bonjour ${prenom} — configurez` : "Configurez"} votre accès technicien
        </p>

        {/* Succès */}
        {success ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              padding: "24px",
              background: "#F0FDF4",
              borderRadius: "12px",
              border: "1px solid #BBF7D0",
            }}
          >
            <CheckCircle2 size={36} style={{ color: "#10B981" }} />
            <p style={{ fontSize: "15px", fontWeight: 600, color: "#065F46", margin: 0 }}>
              Compte activé !
            </p>
            <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
              Redirection vers vos missions…
            </p>
          </div>
        ) : (
          <>
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

            <form onSubmit={handleSubmit}>
              {/* Nouveau mot de passe */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                  Nouveau mot de passe
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={14} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 caractères"
                    required
                    minLength={8}
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
                    }}
                  />
                </div>
              </div>

              {/* Confirmer mot de passe */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                  Confirmer le mot de passe
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={14} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Répétez votre mot de passe"
                    required
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
                {loading ? (
                  <>
                    <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                    Activation…
                  </>
                ) : (
                  "Activer mon compte"
                )}
              </button>
            </form>
          </>
        )}
      </div>

      <p style={{ marginTop: "24px", fontSize: "12px", color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
        Accès réservé aux techniciens certifiés Certibiocide
      </p>
    </div>
  );
}
