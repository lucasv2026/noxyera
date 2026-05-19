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

    // 2. Envoie la notification interne via lib/emails.ts
    try {
      if (email) {
        const { sendAuditNotificationEmail } = await import("@/lib/emails");
        await sendAuditNotificationEmail({
          nom: nom ?? undefined,
          email,
          telephone: telephone ?? undefined,
          secteur: secteur ?? undefined,
          adresse: adresse ?? undefined,
          superficie_m2: superficie ?? undefined,
          situation_actuelle: {
            prestataire_actuel: prestataire,
            problemes_nuisibles: problemesNuisibles,
            haccp_jour: haccpJour,
            description,
            nom_etablissement,
          },
          disponibilites: disponibilites ?? undefined,
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
