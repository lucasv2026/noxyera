"use client";

import { useState } from "react";
import { Lock, User, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export default function DashboardOnboardingPage() {
  const [prenom, setPrenom]     = useState("");
  const [nom, setNom]           = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
      // Mettre à jour le mot de passe et les métadonnées
      const { data: userData, error: updateError } = await supabase.auth.updateUser({
        password,
        data: { prenom, nom },
      });

      if (updateError) {
        setError(`Erreur : ${updateError.message}`);
        setLoading(false);
        return;
      }

      // Mettre à jour le profil avec prénom/nom
      if (userData.user?.id && (prenom || nom)) {
        await supabase
          .from("profiles")
          .update({ prenom, nom })
          .eq("user_id", userData.user.id);
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
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
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F0E8",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      {/* Logo */}
      <div
        style={{
          marginBottom: "28px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "#1B3A2D",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 700,
            fontSize: "16px",
          }}
        >
          N
        </div>
        <span style={{ fontSize: "18px", fontWeight: 700, color: "#1B3A2D", letterSpacing: "0.05em" }}>
          NOXYERA
        </span>
      </div>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "white",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div style={{ padding: "28px 32px 20px", borderBottom: "1px solid #F3F4F6" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1B3A2D", margin: "0 0 6px" }}>
            Votre espace Noxyera est prêt
          </h1>
          <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>
            Dernière étape — définissez votre accès personnel
          </p>
        </div>

        <div style={{ padding: "28px 32px" }}>
          {/* Succès */}
          {success ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                padding: "28px",
                background: "#F0FDF4",
                borderRadius: "12px",
                border: "1px solid #BBF7D0",
              }}
            >
              <CheckCircle2 size={40} style={{ color: "#10B981" }} />
              <p style={{ fontSize: "16px", fontWeight: 600, color: "#065F46", margin: 0 }}>
                Compte activé avec succès !
              </p>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
                Redirection vers votre tableau de bord…
              </p>
            </div>
          ) : (
            <>
              {/* Erreur */}
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
                  <AlertTriangle size={14} />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Prénom */}
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Votre prénom
                  </label>
                  <div style={{ position: "relative" }}>
                    <User size={14} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                    <input
                      type="text"
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      placeholder="Jean"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Nom */}
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Votre nom
                  </label>
                  <div style={{ position: "relative" }}>
                    <User size={14} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                    <input
                      type="text"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      placeholder="Dupont"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Mot de passe */}
                <div style={{ marginBottom: "14px" }}>
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
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Confirmer */}
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
                      style={inputStyle}
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
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                      Activation…
                    </>
                  ) : (
                    "Accéder à mon espace →"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <p style={{ marginTop: "20px", fontSize: "12px", color: "#9CA3AF", textAlign: "center" }}>
        Accès sécurisé — vos données sont protégées
      </p>
    </div>
  );
}
