import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Format invalide" }, { status: 400 });
  }

  // Validation minimale
  const { nom_etablissement, adresse, secteur, prenom, nom, email, telephone } = body;
  if (!nom_etablissement || !adresse || !secteur || !prenom || !nom || !email || !telephone) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: dbError } = await supabase.from("audits").insert({
      nom_etablissement:    body.nom_etablissement,
      adresse:              body.adresse,
      lat:                  body.lat ?? null,
      lng:                  body.lng ?? null,
      secteur:              body.secteur,
      superficie:           body.superficie ?? null,
      annee_construction:   body.annee_construction ?? null,
      historique_nuisibles: body.historique_nuisibles ?? null,
      prestataire_actuel:   body.prestataire_actuel ?? null,
      rapports_a_jour:      body.rapports_a_jour ?? null,
      zones_sensibles:      body.zones_sensibles ?? [],
      prenom:               body.prenom,
      nom:                  body.nom,
      email:                body.email,
      telephone:            body.telephone,
      creneaux:             body.creneaux ?? [],
      jours:                body.jours ?? [],
      statut:               "nouveau",
    });

    if (dbError) {
      console.error("AUDIT INSERT ERROR:", JSON.stringify(dbError));
      // Ne pas bloquer — envoyer les emails quand même
    }
  } else {
    console.log("[audit mock] No Supabase config, skipping DB insert");
  }

  // Emails — non-bloquants
  try {
    // C2 : accusé de réception — aucun technicien assigné à ce stade, pas de date
    // C3 se déclenche UNIQUEMENT depuis accept/route.ts après acceptation technicien
    const { sendAuditReceptionEmail, sendAuditAdminNotif } = await import("@/lib/emails");
    await Promise.allSettled([
      sendAuditReceptionEmail(String(email), {
        prenom:           String(prenom),
        nomEtablissement: String(nom_etablissement),
      }),
      sendAuditAdminNotif({
        nomEtablissement:  String(nom_etablissement),
        adresse:           String(adresse),
        secteur:           String(secteur),
        superficie:        Number(body.superficie ?? 0),
        prenom:            String(prenom),
        nom:               String(nom),
        email:             String(email),
        telephone:         String(telephone),
        historiqueNuisibles: String(body.historique_nuisibles ?? "—"),
        prestataireActuel:  body.prestataire_actuel === true,
        rapportsAJour:     String(body.rapports_a_jour ?? "—"),
        zonesSensibles:    Array.isArray(body.zones_sensibles) ? (body.zones_sensibles as string[]) : [],
        creneaux:          Array.isArray(body.creneaux) ? (body.creneaux as string[]) : [],
        jours:             Array.isArray(body.jours) ? (body.jours as string[]) : [],
      }),
    ]);
  } catch (emailErr) {
    console.error("AUDIT EMAIL ERROR:", emailErr);
  }

  return NextResponse.json({ success: true });
}
