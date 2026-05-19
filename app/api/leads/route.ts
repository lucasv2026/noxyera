import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  formuleSuggeree,
  secteurs,
  type Frequence,
  type Secteur
} from "@/lib/pricing";

type LeadPayload = {
  email?: unknown;
  secteur?: unknown;
  superficie?: unknown;
  frequence?: unknown;
  curatives?: unknown;
  prix_estime?: unknown;
  formule_suggeree?: unknown;
  score_risque?: unknown;
};

const frequenceValues = [4, 6, 12] as const;

export async function POST(request: Request) {
  let payload: LeadPayload;

  try {
    payload = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json(
      { message: "Le format de la demande est invalide." },
      { status: 400 }
    );
  }

  const validation = validateLead(payload);

  if (!validation.ok) {
    return NextResponse.json({ message: validation.message }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      {
        saved: false,
        message: "Estimation calculée. Configure Supabase pour l'enregistrer en base."
      },
      { status: 202 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { error } = await supabase.from("leads").insert(validation.data);

  if (error) {
    return NextResponse.json(
      { message: "Impossible d'enregistrer le lead pour le moment." },
      { status: 500 }
    );
  }

  // Fire email notification to Lucas — non-blocking
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'
  fetch(`${siteUrl}/api/email/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'nouveau_lead',
      data: {
        email: validation.data.email,
        secteur: validation.data.secteur,
        superficie: validation.data.superficie,
        prixEstime: validation.data.prix_estime,
        formuleSuggeree: validation.data.formule_suggeree,
        score_risque: validation.data.score_risque,
      }
    })
  }).catch(() => {}) // non-blocking, ignore errors

  return NextResponse.json({
    saved: true,
    message: "Estimation enregistrée. Un conseiller Noxyera peut vous recontacter."
  });
}

function validateLead(payload: LeadPayload):
  | {
      ok: true;
      data: {
        email: string;
        secteur: Secteur;
        superficie: number;
        frequence: Frequence;
        curatives: boolean;
        prix_estime: number;
        formule_suggeree: "essentiel" | "serenite";
        score_risque: number | null;
      };
    }
  | { ok: false; message: string } {
  if (typeof payload.email !== "string" || !payload.email.includes("@")) {
    return { ok: false, message: "Renseignez une adresse email valide." };
  }

  if (
    typeof payload.secteur !== "string" ||
    !secteurs.some((item) => item.id === payload.secteur)
  ) {
    return { ok: false, message: "Sélectionnez un secteur valide." };
  }

  const superficie = Number(payload.superficie);
  const frequence = Number(payload.frequence);

  if (!Number.isFinite(superficie) || superficie < 50 || superficie > 100000) {
    return { ok: false, message: "La superficie doit être comprise entre 50 et 100 000m²." };
  }

  if (!frequenceValues.includes(frequence as Frequence)) {
    return { ok: false, message: "Sélectionnez une fréquence valide." };
  }

  if (typeof payload.curatives !== "boolean") {
    return { ok: false, message: "Sélectionnez le mode curatif souhaité." };
  }

  const secteur = payload.secteur as Secteur;
  const typedFrequence = frequence as Frequence;
  const formule = formuleSuggeree(payload.curatives, typedFrequence);

  const scoreRisque =
    typeof payload.score_risque === "number" && payload.score_risque >= 0 && payload.score_risque <= 10
      ? payload.score_risque
      : null;

  return {
    ok: true,
    data: {
      email: payload.email.trim().toLowerCase(),
      secteur,
      superficie,
      frequence: typedFrequence,
      curatives: payload.curatives,
      prix_estime:
        typeof payload.prix_estime === "number" ? payload.prix_estime : 0,
      formule_suggeree: formule,
      score_risque: scoreRisque,
    }
  };
}
