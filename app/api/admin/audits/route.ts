import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// GET — fetch tous les audits + techniciens disponibles
export async function GET() {
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ audits: [], techniciens: [] });

  const [auditsRes, techRes] = await Promise.all([
    supabase.from("audits").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, prenom, nom, email").eq("role", "technicien"),
  ]);

  if (auditsRes.error) console.error("AUDITS FETCH ERROR:", JSON.stringify(auditsRes.error));
  if (techRes.error)   console.error("TECH FETCH ERROR:", JSON.stringify(techRes.error));

  return NextResponse.json({
    audits:      auditsRes.data  ?? [],
    techniciens: techRes.data    ?? [],
  });
}

// PATCH — update audit (statut, technicien_id, date_audit_prevue)
export async function PATCH(request: Request) {
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ success: false });

  const body = await request.json();
  const { id, statut, technicien_id, date_audit_prevue, notes_internes } = body;

  const updates: Record<string, unknown> = {};
  if (statut           !== undefined) updates.statut            = statut;
  if (technicien_id    !== undefined) updates.technicien_id     = technicien_id;
  if (date_audit_prevue!== undefined) updates.date_audit_prevue = date_audit_prevue;
  if (notes_internes   !== undefined) updates.notes_internes    = notes_internes;

  const { error } = await supabase.from("audits").update(updates).eq("id", id);
  if (error) console.error("AUDIT UPDATE ERROR:", JSON.stringify(error));

  // Si statut → 'audit planifié' et technicien_id fourni → envoyer emails tech + client
  if (statut === "audit planifié" && technicien_id && date_audit_prevue) {
    try {
      const { data: auditData } = await supabase.from("audits").select("*").eq("id", id).single();
      const { data: techData }  = await supabase.from("profiles").select("email, prenom, nom, telephone").eq("id", technicien_id).single();

      const dateFormatted = new Date(date_audit_prevue).toLocaleDateString("fr-FR", {
        weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
      });

      if (auditData && techData) {
        const { sendAuditAssignEmail, sendAuditPlanifieClientEmail } = await import("@/lib/emails");

        // Email au technicien
        await sendAuditAssignEmail(techData.email, {
          nomTechnicien:    `${techData.prenom} ${techData.nom}`,
          nomEtablissement: auditData.nom_etablissement,
          adresse:          auditData.adresse,
          secteur:          auditData.secteur,
          superficie:       auditData.superficie ?? 0,
          zonesSensibles:   auditData.zones_sensibles ?? [],
          creneaux:         auditData.creneaux ?? [],
          jours:            auditData.jours ?? [],
          dateAuditPrevue:  dateFormatted,
        });

        // Email au client
        await sendAuditPlanifieClientEmail(auditData.email, {
          prenomClient:     auditData.prenom,
          nomEtablissement: auditData.nom_etablissement,
          adresse:          auditData.adresse,
          prenomTech:       techData.prenom,
          nomTech:          techData.nom,
          telephoneTech:    techData.telephone ?? "",
          dateFormatted,
        });
      }
    } catch (emailErr) {
      console.error("AUDIT ASSIGN EMAIL ERROR:", emailErr);
    }
  }

  return NextResponse.json({ success: !error });
}
