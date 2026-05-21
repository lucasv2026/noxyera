import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// GET — fetch toutes les candidatures
export async function GET() {
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json([]);
  }
  const { data, error } = await supabase
    .from("candidatures_techniciens")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("CANDIDATURES FETCH ERROR:", JSON.stringify(error));
    return NextResponse.json([]);
  }
  return NextResponse.json(data ?? []);
}

// PATCH — update statut
export async function PATCH(request: Request) {
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ success: false });

  const { id, statut } = await request.json();
  const { error } = await supabase
    .from("candidatures_techniciens")
    .update({ statut })
    .eq("id", id);

  if (error) console.error("CANDIDATURE UPDATE ERROR:", JSON.stringify(error));
  return NextResponse.json({ success: !error });
}
