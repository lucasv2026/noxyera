import Link from "next/link";
import { ShieldCheck, MapPin, Mail, Phone, ArrowRight } from "lucide-react";

interface TechnicienRow {
  id: string;
  prenom: string | null;
  nom: string | null;
  email: string | null;
  telephone: string | null;
  ville: string | null;
  disponibilite: string | null;
  certifications: string[] | null;
  created_at: string;
}

interface InterventionRow {
  technicien_id: string;
  statut: string;
}

const DISPO_MAP: Record<string, string> = {
  "temps-plein":  "Temps plein",
  "temps-partiel":"Temps partiel",
  "week-ends":    "Week-ends",
  "flexible":     "Flexible",
};

export default async function AdminTechniciensPage() {
  let techniciens: TechnicienRow[] = [];
  let interventionStats: InterventionRow[] = [];

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { data: techData } = await supabase
      .from('profiles')
      .select('id, prenom, nom, email, telephone, ville, disponibilite, certifications, created_at')
      .eq('role', 'technicien')
      .order('created_at', { ascending: false });

    techniciens = techData ?? [];

    if (techniciens.length > 0) {
      const { data: intData } = await supabase
        .from('interventions')
        .select('technicien_id, statut')
        .in('technicien_id', techniciens.map(t => t.id));
      interventionStats = intData ?? [];
    }
  } catch {
    // Supabase unavailable — show empty list
  }

  function statsFor(id: string) {
    const rows = interventionStats.filter(r => r.technicien_id === id);
    const realise = rows.filter(r => r.statut === 'realise').length;
    const enCours = rows.filter(r => ['en_cours', 'planifie'].includes(r.statut)).length;
    return { realise, enCours };
  }

  return (
    <div style={{ padding: 20, minHeight: "100vh", background: "#0D1F17" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "white", margin: "0 0 4px" }}>Techniciens</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            {techniciens.length} technicien{techniciens.length !== 1 ? "s" : ""} dans la base
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total", value: techniciens.length, color: "#10B981" },
          {
            label: "Interventions réalisées",
            value: interventionStats.filter(r => r.statut === 'realise').length,
            color: "#60A5FA",
          },
          {
            label: "En cours",
            value: interventionStats.filter(r => ['en_cours', 'planifie'].includes(r.statut)).length,
            color: "#F59E0B",
          },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "16px 20px" }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px", fontFamily: "monospace" }}>
              {label}
            </p>
            <p style={{ fontSize: 24, fontWeight: 700, color, margin: 0, fontFamily: "monospace" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
        {techniciens.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
            Aucun technicien enregistré.
          </div>
        ) : (
          <div>
            {techniciens.map((tech, i) => {
              const { realise, enCours } = statsFor(tech.id);
              const initials = [(tech.prenom ?? "")[0], (tech.nom ?? "")[0]].filter(Boolean).join("").toUpperCase();
              return (
                <div
                  key={tech.id}
                  style={{
                    padding: "16px 20px",
                    borderBottom: i < techniciens.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    display: "flex", alignItems: "flex-start", gap: 14,
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: "rgba(242,101,34,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, color: "#F26522", flexShrink: 0,
                  }}>
                    {initials || "?"}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "white" }}>
                        {tech.prenom} {tech.nom}
                      </span>
                      {tech.disponibilite && (
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
                          {DISPO_MAP[tech.disponibilite] ?? tech.disponibilite}
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 14, marginTop: 5, flexWrap: "wrap" }}>
                      {tech.email && (
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", gap: 4 }}>
                          <Mail size={11} /> {tech.email}
                        </span>
                      )}
                      {tech.telephone && (
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", gap: 4 }}>
                          <Phone size={11} /> {tech.telephone}
                        </span>
                      )}
                      {tech.ville && (
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", gap: 4 }}>
                          <MapPin size={11} /> {tech.ville}
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                      {(tech.certifications ?? []).map(cert => (
                        <span key={cert} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "rgba(96,165,250,0.12)", color: "#60A5FA", display: "flex", alignItems: "center", gap: 3 }}>
                          <ShieldCheck size={9} /> {cert}
                        </span>
                      ))}
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "rgba(16,185,129,0.1)", color: "#10B981" }}>
                        {realise} réalisée{realise !== 1 ? "s" : ""}
                      </span>
                      {enCours > 0 && (
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>
                          {enCours} en cours
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/admin-noxyera/techniciens/${tech.id}`}
                    style={{
                      display: "flex", alignItems: "center", gap: 4,
                      padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                      background: "rgba(242,101,34,0.12)", color: "#F26522",
                      border: "1px solid rgba(242,101,34,0.2)", textDecoration: "none",
                      flexShrink: 0,
                    }}
                  >
                    Voir profil <ArrowRight size={12} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
