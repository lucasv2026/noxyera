import { NextResponse } from "next/server";
import { rateLimit } from '@/lib/rateLimit'
import { AuditSchema } from '@/lib/schemas'
import * as Sentry from '@sentry/nextjs'

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
    if (!rateLimit(ip)) {
      return Response.json({ error: 'Trop de requêtes. Réessayez dans 1 minute.' }, { status: 429 })
    }

    // Validation
    const body = await request.json()
    const parsed = AuditSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })
    }

    const {
      nom,
      email,
      telephone,
      secteur,
      adresse,
      superficie,
      nb_employes,
      prestataire_actuel,
      problemes_recents,
      rapports_a_jour,
      photos_url,
      disponibilites,
      nom_etablissement,
      situation_actuelle,
    } = parsed.data;

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
        employes: nb_employes ?? null,
        type: "audit_distance",
        situation_actuelle: situation_actuelle ?? {
          prestataire_actuel,
          problemes_nuisibles: problemes_recents,
          haccp_jour: rapports_a_jour,
          nom_etablissement,
        },
        photos_url: photos_url ?? [],
        disponibilites: disponibilites ?? null,
        prestataire_actuel: prestataire_actuel ?? null,
        score_risque: null,
      });
    } catch {
      // Demo mode — silently ignore DB errors
    }

    // 2. Envoie la notification interne via lib/emails.tsx
    try {
      if (email) {
        const { sendAuditNotifEmail } = await import("@/lib/emails");
        await sendAuditNotifEmail({
          nomEtablissement: nom_etablissement ?? nom ?? '—',
          adresse: adresse ?? '—',
          secteur: secteur ?? '—',
          nomContact: nom ?? '—',
          emailContact: email,
          telephone: telephone ?? '—',
          situation: {
            prestataire: prestataire_actuel ?? false,
            problemes: problemes_recents ?? '—',
            rapports: rapports_a_jour ?? '—',
          },
          disponibilites: disponibilites ?? '—',
        });
      }
    } catch (emailErr) {
      Sentry.captureException(emailErr)
      // Email optional — silently ignore
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err)
    // Fallback: always return success for demo mode
    return NextResponse.json({ success: true });
  }
}
