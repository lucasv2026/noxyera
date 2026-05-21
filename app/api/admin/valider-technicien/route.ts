import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const { candidatureId, email, prenom, nom } = await request.json();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.log("[valider-technicien mock] candidatureId:", candidatureId);
    return NextResponse.json({ success: true, mock: true });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. Génère mot de passe temporaire
  const motDePasse = "Nox" + Math.floor(1000 + Math.random() * 9000).toString();

  try {
    // 2. Crée user Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: motDePasse,
      email_confirm: true,
      user_metadata: { prenom, nom, role: "technicien" },
    });

    if (authError) {
      console.error("AUTH CREATE ERROR:", JSON.stringify(authError));
      // Continuer quand même pour mettre à jour la candidature
    }

    const userId = authData?.user?.id;

    // 3. INSERT dans profiles
    if (userId) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
        email,
        prenom,
        nom,
        role: "technicien",
      });
      if (profileError) console.error("PROFILE INSERT ERROR:", JSON.stringify(profileError));
    }

    // 4. UPDATE candidature statut → accepté
    const { error: updateError } = await supabase
      .from("candidatures_techniciens")
      .update({ statut: "accepté" })
      .eq("id", candidatureId);
    if (updateError) console.error("CANDIDATURE UPDATE ERROR:", JSON.stringify(updateError));

    // 5. Envoi email avec identifiants
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://noxyera.com";
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Noxyera <onboarding@resend.dev>",
        to: email,
        subject: "Bienvenue chez Noxyera — vos accès technicien",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
            <h2 style="color:#1B3A2D">Bienvenue ${prenom} !</h2>
            <p>Votre candidature a été acceptée. Voici vos accès :</p>
            <div style="background:#F5F0E8;padding:16px;border-radius:8px;margin:16px 0">
              <p style="margin:0"><strong>Email :</strong> ${email}</p>
              <p style="margin:8px 0 0"><strong>Mot de passe temporaire :</strong> ${motDePasse}</p>
            </div>
            <p>Connectez-vous sur <a href="${siteUrl}/technicien/login">${siteUrl}/technicien/login</a></p>
            <p style="color:#6B7280;font-size:12px">Changez votre mot de passe à la première connexion.</p>
          </div>
        `,
      });
      console.log("EMAIL valider-technicien envoyé à", email);
    } catch (emailErr) {
      console.error("EMAIL ERROR valider-technicien:", emailErr);
    }

    return NextResponse.json({ success: true, motDePasse });
  } catch (err) {
    console.error("VALIDER TECHNICIEN ERROR:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
