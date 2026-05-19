import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      nom?: string;
      email?: string;
      telephone?: string;
      secteur?: string;
      adresse?: string;
      superficie?: number | null;
      employes?: number | null;
      prestataire?: boolean;
      problemesNuisibles?: string;
      haccpJour?: string;
      description?: string;
      photosUrl?: string[];
      disponibilites?: string;
      nom_etablissement?: string;
    };

    const { nom, email, telephone, secteur, adresse, superficie, employes,
            prestataire, problemesNuisibles, haccpJour, description,
            photosUrl, disponibilites, nom_etablissement } = body;

    // 1. INSERT INTO leads
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = createClient();

      await supabase.from("leads").insert({
        nom: nom ?? "",
        email: email ?? "",
        telephone: telephone ?? null,
        secteur: secteur ?? null,
        adresse: adresse ?? null,
        superficie_m2: superficie ?? null,
        employes: employes ?? null,
        type: "audit_distance",
        situation_actuelle: {
          prestataire_actuel: prestataire,
          problemes_nuisibles: problemesNuisibles,
          haccp_jour: haccpJour,
          description,
          nom_etablissement,
        },
        photos_url: photosUrl ?? [],
        disponibilites: disponibilites ?? null,
        prestataire_actuel: prestataire ?? null,
        score_risque: null,
      });
    } catch {
      // Demo mode — silently ignore DB errors
    }

    // 2. Send confirmation email via Resend (if available)
    try {
      if (process.env.RESEND_API_KEY && email) {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: "Noxyera <contact@noxyera.com>",
          to: email,
          subject: "Votre demande d'audit à distance Noxyera",
          html: `
            <h2>Demande reçue ✓</h2>
            <p>Bonjour ${nom},</p>
            <p>Nous avons bien reçu votre demande d'audit à distance pour <strong>${nom_etablissement ?? adresse}</strong>.</p>
            <p>Notre équipe vous contactera sous <strong>24h</strong> pour organiser la session.</p>
            <br/>
            <p>L'équipe Noxyera</p>
          `,
        });

        // 3. Notify lucas@agencenikita.com
        await resend.emails.send({
          from: "Noxyera Leads <contact@noxyera.com>",
          to: "lucas@agencenikita.com",
          subject: `Nouvelle demande audit à distance — ${nom_etablissement ?? adresse}`,
          html: `
            <h2>Nouvelle demande d'audit à distance</h2>
            <ul>
              <li><strong>Nom :</strong> ${nom}</li>
              <li><strong>Email :</strong> ${email}</li>
              <li><strong>Téléphone :</strong> ${telephone ?? "—"}</li>
              <li><strong>Établissement :</strong> ${nom_etablissement ?? "—"}</li>
              <li><strong>Adresse :</strong> ${adresse ?? "—"}</li>
              <li><strong>Secteur :</strong> ${secteur ?? "—"}</li>
              <li><strong>Superficie :</strong> ${superficie ?? "—"} m²</li>
              <li><strong>Disponibilités :</strong> ${disponibilites ?? "—"}</li>
            </ul>
          `,
        });
      }
    } catch {
      // Email optional — silently ignore
    }

    return NextResponse.json({ success: true });
  } catch {
    // Fallback: always return success for demo mode
    return NextResponse.json({ success: true });
  }
}
