import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// GET — fetch tous les leads
export async function GET() {
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json([]);

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("LEADS FETCH ERROR:", JSON.stringify(error));
    return NextResponse.json([]);
  }

  // Normalise les champs pour le composant (camelCase)
  const normalized = (data ?? []).map((l: Record<string, unknown>) => ({
    id:                String(l.id),
    email:             String(l.email ?? ""),
    nom_etablissement: l.nom_etablissement ? String(l.nom_etablissement) : null,
    secteur:           String(l.secteur ?? "restaurant"),
    superficie:        Number(l.superficie ?? l.superficie_m2 ?? 100),
    frequence:         Number(l.frequence ?? 4),
    curatives:         Boolean(l.curatives),
    prixEstime:        Number(l.prix_estime ?? 0),
    formuleSuggeree:   String(l.formule_suggeree ?? "essentiel"),
    score_risque:      Number(l.score_risque ?? l.score_global ?? 0),
    statut:            String(l.statut ?? "nouveau"),
    createdAt:         String(l.created_at ?? new Date().toISOString()),
  }));

  return NextResponse.json(normalized);
}

// PATCH — update statut
export async function PATCH(request: Request) {
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ success: false });

  const { id, statut } = await request.json();
  const { error } = await supabase
    .from("leads")
    .update({ statut })
    .eq("id", id);

  if (error) console.error("LEAD UPDATE ERROR:", JSON.stringify(error));
  return NextResponse.json({ success: !error });
}
