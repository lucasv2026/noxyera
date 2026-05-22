import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format invalide" }, { status: 400 });
  }

  const { candidatureId, email, prenom, nom } = body;

  // Validation des champs obligatoires
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "email valide requis" }, { status: 400 });
  }
  if (!prenom || !nom) {
    return NextResponse.json({ error: "prenom et nom requis" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.log("[valider-technicien mock] candidatureId:", candidatureId);
    return NextResponse.json({ success: true, mock: true });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://noxyera.com";

  try {
    // 1. Invite via Supabase — envoie le lien magique, crée le compte
    const { data, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { prenom, nom, role: "technicien" },
      redirectTo: `${siteUrl}/technicien/onboarding`,
    });

    if (inviteError) {
      console.error("INVITE TECHNICIEN ERROR:", JSON.stringify(inviteError));
      // Continuer quand même pour mettre à jour la candidature
    }

    // 2. Mettre à jour le profil créé par le trigger (attendre que le trigger s'exécute)
    if (data?.user?.id) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ prenom, nom })
        .eq("user_id", data.user.id);
      if (profileError) console.error("PROFILE UPDATE ERROR:", JSON.stringify(profileError));
    }

    // 3. UPDATE candidature statut → accepté
    const { error: updateError } = await supabase
      .from("candidatures_techniciens")
      .update({ statut: "accepté" })
      .eq("id", candidatureId);
    if (updateError) console.error("CANDIDATURE UPDATE ERROR:", JSON.stringify(updateError));

    // 4. Email de bienvenue branded (sans mot de passe)
    try {
      const { sendTechnicienBienvenueEmail } = await import("@/lib/emails");
      await sendTechnicienBienvenueEmail(email, { prenom: String(prenom) });
    } catch (emailErr) {
      console.error("EMAIL ERROR valider-technicien:", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("VALIDER TECHNICIEN ERROR:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
