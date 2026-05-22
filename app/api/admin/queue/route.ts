import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function GET() {
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ leads: [], audits: [], candidatures: [] });

  const [
    { data: leads, error: leadsError },
    { data: audits, error: auditsError },
    { data: candidatures, error: candidaturesError },
  ] = await Promise.all([
    supabase
      .from("leads")
      .select("id, secteur, superficie, created_at, email, nom_etablissement, type")
      .order("created_at", { ascending: false }),
    supabase
      .from("audits")
      .select("id, nom_etablissement, email, statut, created_at, adresse, telephone")
      .order("created_at", { ascending: false }),
    supabase
      .from("candidatures_techniciens")
      .select("id, prenom, nom, email, ville, experience, statut, created_at, telephone")
      .order("created_at", { ascending: false }),
  ]);

  if (leadsError) console.error("QUEUE LEADS ERROR:", JSON.stringify(leadsError));
  if (auditsError) console.error("QUEUE AUDITS ERROR:", JSON.stringify(auditsError));
  if (candidaturesError) console.error("QUEUE CANDIDATURES ERROR:", JSON.stringify(candidaturesError));

  return NextResponse.json({
    leads: leads ?? [],
    audits: audits ?? [],
    candidatures: candidatures ?? [],
  });
}
