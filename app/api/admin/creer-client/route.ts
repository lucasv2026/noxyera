import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const body = await request.json();
  const { leadId, email, nomEtablissement, secteur, superficie, prixEstime, formule, adresse } = body;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.log("[creer-client mock] leadId:", leadId);
    return NextResponse.json({ success: true, mock: true });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://noxyera.com";

  try {
    // 1. Invite via Supabase — envoie le lien magique, crée le compte
    const { data, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { role: "client", nom_etablissement: nomEtablissement },
      redirectTo: `${siteUrl}/dashboard/onboarding`,
    });

    if (inviteError) {
      console.error("INVITE CLIENT ERROR:", JSON.stringify(inviteError));
    }

    const authUserId = data?.user?.id;

    if (authUserId) {
      // 2. Attendre que le trigger handle_new_user crée la ligne profiles
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 3. Récupérer le profiles.id (UUID interne, ≠ auth user id)
      const { data: profileRow, error: profileFetchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", authUserId)
        .single();

      if (profileFetchError) console.error("PROFILE FETCH ERROR:", JSON.stringify(profileFetchError));

      const profileId = profileRow?.id;

      if (profileId) {
        // 4. INSERT site avec profiles.id (FK correcte)
        const { data: siteData, error: siteError } = await supabase.from("sites").insert({
          client_id: profileId,
          nom: nomEtablissement,
          adresse: adresse ?? "",
          secteur: secteur ?? "restaurant",
          superficie: superficie ?? 100,
          statut: "conforme",
          haccp_score: 80,
        }).select().single();

        if (siteError) console.error("SITE INSERT ERROR:", JSON.stringify(siteError));

        // 5. INSERT contract avec profiles.id (FK correcte)
        if (siteData?.id) {
          const { error: contractError } = await supabase.from("contracts").insert({
            client_id: profileId,
            site_id: siteData.id,
            formule: formule ?? "essentiel",
            prix_annuel: prixEstime ?? 0,
            statut: "actif",
            date_debut: new Date().toISOString().split("T")[0],
          });
          if (contractError) console.error("CONTRACT INSERT ERROR:", JSON.stringify(contractError));
        }
      }
    }

    // 6. UPDATE lead statut → signé
    if (leadId) {
      await supabase.from("leads").update({ statut: "signé" }).eq("id", leadId);
    }

    // 7. Email de bienvenue (sans mot de passe — le lien arrive séparément via Supabase)
    try {
      const { sendWelcomeEmail } = await import("@/lib/emails");
      await sendWelcomeEmail(email, {
        prenom: "",
        nomEtablissement: nomEtablissement ?? email,
        formule: formule === "serenite" ? "Sérénité" : "Essentiel",
        prixAnnuel: prixEstime ?? 0,
      });
    } catch (emailErr) {
      console.error("EMAIL creer-client ERROR:", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("CREER CLIENT ERROR:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
