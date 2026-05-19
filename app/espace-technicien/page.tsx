"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Wrench, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";

export default function EspaceTechnicienPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

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
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "#1B3A2D" }}
    >
      {/* Logo */}
      <div className="mb-10">
        <Logo dark />
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Wrench size={18} style={{ color: "#F26522" }} />
          <h1 className="text-xl font-bold" style={{ color: "#1B3A2D" }}>
            Espace Technicien
          </h1>
        </div>
        <p className="text-center text-sm mb-8" style={{ color: "#6B7280" }}>
          Connexion — Accédez à vos missions du jour
        </p>

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>
              Email professionnel
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="technicien@noxyera.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                style={{ border: "1.5px solid #E5E7EB", color: "#1A1A1A", background: "#F9FAFB" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>
              Mot de passe
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none"
                style={{ border: "1.5px solid #E5E7EB", color: "#1A1A1A", background: "#F9FAFB" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: "#F26522", boxShadow: "0 4px 14px rgba(242,101,34,0.35)" }}
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? "Connexion…" : "Accéder à mes missions"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm hover:underline" style={{ color: "#6B7280" }}>
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>

      <p className="mt-8 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
        Accès réservé aux techniciens certifiés Certibiocide
      </p>
    </div>
  );
}
