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
  if (!supabase) return NextResponse.json([]);

  const { data, error } = await supabase
    .from("profiles")
    .select("id, prenom, nom, email, telephone, entreprise, created_at")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("CLIENTS FETCH ERROR:", JSON.stringify(error));
    return NextResponse.json([]);
  }
  return NextResponse.json(data ?? []);
}
