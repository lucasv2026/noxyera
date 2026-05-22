import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json(null, { status: 503 });

  const { data: client, error: clientError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (clientError || !client) {
    return NextResponse.json(null, { status: 404 });
  }

  const [{ data: interventions }, { data: audits }] = await Promise.all([
    supabase
      .from("interventions")
      .select("*")
      .eq("technicien_id", params.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("audits")
      .select("*")
      .eq("email", client.email ?? "")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return NextResponse.json({
    client,
    interventions: interventions ?? [],
    audits: audits ?? [],
  });
}
