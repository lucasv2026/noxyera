import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// GET — liste des interventions pour la grille Planning admin
export async function GET() {
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ interventions: [] });

  const { data, error } = await supabase
    .from("interventions")
    .select("id, date_prevue, type, statut, technicien_id, notes, sites(nom, ville)")
    .order("date_prevue", { ascending: true });

  if (error) console.error("ADMIN INTERVENTIONS FETCH ERROR:", JSON.stringify(error));

  return NextResponse.json({ interventions: data ?? [] });
}
