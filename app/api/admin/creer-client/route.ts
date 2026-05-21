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

  const motDePasse = "Nox" + Math.floor(1000 + Math.random() * 9000).toString();

  try {
    // 1. Crée user Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: motDePasse,
      email_confirm: true,
      user_metadata: { role: "client", nom_etablissement: nomEtablissement },
    });

    if (authError) {
      console.error("AUTH CREATE CLIENT ERROR:", JSON.stringify(authError));
    }

    const userId = authData?.user?.id;

    if (userId) {
      // 2. INSERT profiles
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId, email, role: "client",
        nom: nomEtablissement ?? "",
        prenom: "",
      });
      if (profileError) console.error("PROFILE CLIENT ERROR:", JSON.stringify(profileError));

      // 3. INSERT sites
      const { data: siteData, error: siteError } = await supabase.from("sites").insert({
        client_id: userId,
        nom: nomEtablissement,
        adresse: adresse ?? "",
        secteur: secteur ?? "restaurant",
        superficie: superficie ?? 100,
        statut: "conforme",
        haccp_score: 80,
      }).select().single();
      if (siteError) console.error("SITE INSERT ERROR:", JSON.stringify(siteError));

      // 4. INSERT contracts
      if (siteData?.id) {
        const { error: contractError } = await supabase.from("contracts").insert({
          client_id: userId,
          site_id: siteData.id,
          formule: formule ?? "essentiel",
          prix_annuel: prixEstime ?? 0,
          statut: "actif",
          date_debut: new Date().toISOString().split("T")[0],
        });
        if (contractError) console.error("CONTRACT INSERT ERROR:", JSON.stringify(contractError));
      }
    }

    // 5. UPDATE lead statut → signé
    if (leadId) {
      await supabase.from("leads").update({ statut: "signé" }).eq("id", leadId);
    }

    // 6. Envoie email bienvenue
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

    return NextResponse.json({ success: true, motDePasse });
  } catch (err) {
    console.error("CREER CLIENT ERROR:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
