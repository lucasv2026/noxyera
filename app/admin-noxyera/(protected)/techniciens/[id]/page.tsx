import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, ShieldCheck, Calendar, Clock } from "lucide-react";
import { notFound } from "next/navigation";

interface Profile {
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

interface Site {
  nom: string;
  adresse: string | null;
  ville: string | null;
  secteur: string | null;
}

interface Intervention {
  id: string;
  date_prevue: string | null;
  type: string | null;
  statut: string;
  sites: Site | null;
}

const DISPO_MAP: Record<string, string> = {
  "temps-plein":  "Temps plein",
  "temps-partiel":"Temps partiel",
  "week-ends":    "Week-ends",
  "flexible":     "Flexible",
};

const STATUT_CFG: Record<string, { label: string; color: string; bg: string }> = {
  planifie:  { label: "Planifiée",  color: "#60A5FA", bg: "rgba(96,165,250,0.12)" },
  en_cours:  { label: "En cours",   color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  realise:   { label: "Réalisée",   color: "#9CA3AF", bg: "rgba(156,163,175,0.12)" },
  proposee:  { label: "Proposée",   color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  annule:    { label: "Annulée",    color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
};

const TYPE_CFG: Record<string, { label: string; color: string }> = {
  audit:     { label: "Audit",     color: "#60A5FA" },
  preventif: { label: "Préventif", color: "#10B981" },
  curatif:   { label: "Curatif",   color: "#F59E0B" },
  urgence:   { label: "Urgence",   color: "#EF4444" },
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function TechnicienDetailPage({ params }: { params: { id: string } }) {
  let profile: Profile | null = null;
  let interventions: Intervention[] = [];
  let rapportsCount = 0;

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, prenom, nom, email, telephone, ville, disponibilite, certifications, created_at')
      .eq('id', params.id)
      .maybeSingle();

    profile = profileData;

    if (profile) {
      const { data: intData } = await supabase
        .from('interventions')
        .select('id, date_prevue, type, statut, sites(nom, adresse, ville, secteur)')
        .eq('technicien_id', params.id)
        .order('date_prevue', { ascending: false })
        .limit(20);

      interventions = (intData ?? []) as unknown as Intervention[];

      const { count } = await supabase
        .from('rapports')
        .select('id', { count: 'exact', head: true })
        .eq('technicien_id', params.id);

      rapportsCount = count ?? 0;
    }
  } catch {
    // Supabase unavailable
  }

  if (!profile) notFound();

  const initials = [(profile.prenom ?? "")[0], (profile.nom ?? "")[0]].filter(Boolean).join("").toUpperCase();
  const realiseCount = interventions.filter(i => i.statut === 'realise').length;
  const enCoursCount = interventions.filter(i => ['en_cours', 'planifie'].includes(i.statut)).length;

  return (
    <div style={{ padding: 20, minHeight: "100vh", background: "#0D1F17" }}>
      {/* Back */}
      <Link
        href="/admin-noxyera/techniciens"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none", marginBottom: 20 }}
      >
        <ArrowLeft size={14} /> Retour aux techniciens
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>
        {/* Left: profile card */}
        <div style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
          {/* Avatar */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16, background: "rgba(242,101,34,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 700, color: "#F26522",
            }}>
              {initials || "?"}
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: "white", margin: "0 0 4px" }}>
                {profile.prenom} {profile.nom}
              </p>
              {profile.disponibilite && (
                <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: "rgba(16,185,129,0.1)", color: "#10B981" }}>
                  {DISPO_MAP[profile.disponibilite] ?? profile.disponibilite}
                </span>
              )}
            </div>
          </div>

          {/* Contact info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            {profile.email && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Mail size={13} style={{ color: "#F26522", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{profile.email}</span>
              </div>
            )}
            {profile.telephone && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Phone size={13} style={{ color: "#F26522", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{profile.telephone}</span>
              </div>
            )}
            {profile.ville && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin size={13} style={{ color: "#F26522", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{profile.ville}</span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={13} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                Inscrit le {formatDate(profile.created_at)}
              </span>
            </div>
          </div>

          {/* Certifications */}
          {(profile.certifications ?? []).length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>
                Certifications
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(profile.certifications ?? []).map(cert => (
                  <span key={cert} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, background: "rgba(96,165,250,0.12)", color: "#60A5FA", display: "flex", alignItems: "center", gap: 4 }}>
                    <ShieldCheck size={9} /> {cert}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              { label: "Réalisées", value: realiseCount, color: "#10B981" },
              { label: "En cours", value: enCoursCount, color: "#F59E0B" },
              { label: "Rapports", value: rapportsCount, color: "#60A5FA" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                <p style={{ fontSize: 18, fontWeight: 700, color, margin: "0 0 2px" }}>{value}</p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: missions list */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "white", margin: "0 0 14px" }}>
            Missions ({interventions.length})
          </h2>
          <div style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
            {interventions.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
                Aucune mission pour ce technicien.
              </div>
            ) : (
              <div>
                {interventions.map((mission, i) => {
                  const statutCfg = STATUT_CFG[mission.statut] ?? { label: mission.statut, color: "#9CA3AF", bg: "rgba(156,163,175,0.12)" };
                  const typeCfg = mission.type ? (TYPE_CFG[mission.type] ?? { label: mission.type, color: "#9CA3AF" }) : null;

                  return (
                    <div
                      key={mission.id}
                      style={{
                        padding: "14px 20px",
                        borderBottom: i < interventions.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                        display: "flex", alignItems: "center", gap: 14,
                      }}
                    >
                      {/* Date */}
                      <div style={{ flexShrink: 0, width: 90, textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
                          <Clock size={10} />
                          {mission.date_prevue ? formatDate(mission.date_prevue) : "—"}
                        </div>
                      </div>

                      {/* Site info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "white", margin: "0 0 4px" }}>
                          {mission.sites?.nom ?? "—"}
                        </p>
                        {(mission.sites?.adresse || mission.sites?.ville) && (
                          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
                            <MapPin size={10} />
                            {[mission.sites?.adresse, mission.sites?.ville].filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>

                      {/* Badges */}
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        {typeCfg && (
                          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "rgba(255,255,255,0.05)", color: typeCfg.color, fontWeight: 600 }}>
                            {typeCfg.label}
                          </span>
                        )}
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: statutCfg.bg, color: statutCfg.color, fontWeight: 600 }}>
                          {statutCfg.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
