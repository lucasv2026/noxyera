import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Car, Briefcase, Clock, Check, X } from "lucide-react";

interface Candidature {
  id: string;
  created_at: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  ville: string;
  code_postal: string;
  experience: string;
  certifications: string[] | null;
  vehicule: boolean;
  disponibilite: string;
  motivation: string | null;
  statut: string;
}

interface Intervention {
  id: string;
  date_prevue: string | null;
  type: string | null;
  statut: string;
  sites: { nom: string; adresse: string | null; ville: string | null } | null;
}

const STATUT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  nouveau:   { label: "Nouveau",   color: "#94A3B8", bg: "rgba(148,163,184,0.15)" },
  contacté:  { label: "Contacté",  color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  entretien: { label: "Entretien", color: "#60A5FA", bg: "rgba(96,165,250,0.15)" },
  accepté:   { label: "Accepté",   color: "#10B981", bg: "rgba(16,185,129,0.15)" },
  refusé:    { label: "Refusé",    color: "#EF4444", bg: "rgba(239,68,68,0.15)" },
};

const EXPERIENCE_MAP: Record<string, string> = {
  "0-1an":  "< 1 an",
  "1-3ans": "1 à 3 ans",
  "3-5ans": "3 à 5 ans",
  "5ans+":  "5 ans +",
};

const DISPO_MAP: Record<string, string> = {
  "temps-plein":  "Temps plein",
  "temps-partiel":"Temps partiel",
  "week-ends":    "Week-ends",
  "flexible":     "Flexible",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default async function CandidatureDetailPage({ params }: { params: { id: string } }) {
  let candidature: Candidature | null = null;
  let interventions: Intervention[] = [];

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { data } = await supabase
      .from("candidatures_techniciens")
      .select("*")
      .eq("id", params.id)
      .maybeSingle();

    candidature = data;

    // If accepted, check for matching profile and fetch interventions
    if (candidature?.statut === "accepté" && candidature.email) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", candidature.email)
        .maybeSingle();

      if (profileData?.id) {
        const { data: intData } = await supabase
          .from("interventions")
          .select("id, date_prevue, type, statut, sites(nom, adresse, ville)")
          .eq("technicien_id", profileData.id)
          .order("date_prevue", { ascending: false })
          .limit(20);

        interventions = (intData ?? []) as unknown as Intervention[];
      }
    }
  } catch {
    // Supabase unavailable
  }

  if (!candidature) notFound();

  const statut = STATUT_CONFIG[candidature.statut] ?? STATUT_CONFIG.nouveau;

  return (
    <div style={{ padding: 20, minHeight: "100vh", background: "#0D1F17" }}>
      {/* Back link */}
      <Link
        href="/admin-noxyera/candidatures"
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none",
          marginBottom: 20,
        }}
      >
        <ArrowLeft size={14} /> Retour aux candidatures
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "start" }}>
        {/* Left: profile card */}
        <div style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 24 }}>
          {/* Avatar + statut */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
            marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16, background: "rgba(242,101,34,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 700, color: "#F26522",
            }}>
              {(candidature.prenom?.[0] ?? "")}{(candidature.nom?.[0] ?? "")}
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: "white", margin: "0 0 8px" }}>
                {candidature.prenom} {candidature.nom}
              </p>
              <span style={{
                fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20,
                background: statut.bg, color: statut.color,
              }}>
                {statut.label}
              </span>
            </div>
          </div>

          {/* Contact info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Mail size={13} style={{ color: "#F26522", flexShrink: 0 }} />
              <a href={`mailto:${candidature.email}`} style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
                {candidature.email}
              </a>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Phone size={13} style={{ color: "#F26522", flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{candidature.telephone}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MapPin size={13} style={{ color: "#F26522", flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                {candidature.ville} ({candidature.code_postal})
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={13} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                Candidature du {formatDate(candidature.created_at)}
              </span>
            </div>
          </div>

          {/* Professional info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Briefcase size={13} style={{ color: "#60A5FA", flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                Expérience : {EXPERIENCE_MAP[candidature.experience] ?? candidature.experience}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={13} style={{ color: "#60A5FA", flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                Disponibilité : {DISPO_MAP[candidature.disponibilite] ?? candidature.disponibilite}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Car size={13} style={{ color: candidature.vehicule ? "#10B981" : "#EF4444", flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                Véhicule : {candidature.vehicule ? "Oui" : "Non"}
              </span>
            </div>
          </div>

          {/* Certifications */}
          {(candidature.certifications ?? []).length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>
                Certifications
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(candidature.certifications ?? []).map(cert => (
                  <span key={cert} style={{
                    fontSize: 11, padding: "3px 10px", borderRadius: 6,
                    background: "rgba(96,165,250,0.12)", color: "#60A5FA",
                  }}>
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <form action={`/api/admin/candidatures`} method="POST">
              <input type="hidden" name="id" value={candidature.id} />
              <input type="hidden" name="statut" value="accepté" />
              <a
                href={`/api/admin/valider-technicien`}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                  background: candidature.statut === "accepté" ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.15)",
                  color: "#10B981", border: "1px solid rgba(16,185,129,0.25)",
                  textDecoration: "none", cursor: "pointer",
                  opacity: candidature.statut === "accepté" ? 0.6 : 1,
                  pointerEvents: candidature.statut === "accepté" ? "none" : "auto",
                }}
              >
                <Check size={14} />
                {candidature.statut === "accepté" ? "Déjà validé ✓" : "Valider & créer compte"}
              </a>
            </form>

            <a
              href={`/admin-noxyera/candidatures`}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: "rgba(245,158,11,0.1)", color: "#F59E0B",
                border: "1px solid rgba(245,158,11,0.2)", textDecoration: "none",
              }}
            >
              <Calendar size={14} /> Planifier entretien
            </a>

            <a
              href={`/admin-noxyera/candidatures`}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 500,
                background: "transparent", color: "rgba(239,68,68,0.6)",
                border: "1px solid rgba(239,68,68,0.2)", textDecoration: "none",
              }}
            >
              <X size={12} /> Refuser
            </a>
          </div>
        </div>

        {/* Right: details + missions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Motivation */}
          {candidature.motivation && (
            <div style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>
                Lettre de motivation
              </p>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>
                &ldquo;{candidature.motivation}&rdquo;
              </p>
            </div>
          )}

          {/* Missions (if accepted and has profile) */}
          {candidature.statut === "accepté" && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "white", margin: "0 0 12px" }}>
                Missions ({interventions.length})
              </h2>
              <div style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
                {interventions.length === 0 ? (
                  <div style={{ padding: 32, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
                    Aucune mission pour ce technicien.
                  </div>
                ) : (
                  <div>
                    {interventions.map((mission, i) => (
                      <div
                        key={mission.id}
                        style={{
                          padding: "14px 20px",
                          borderBottom: i < interventions.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                          display: "flex", alignItems: "center", gap: 14,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "white", margin: "0 0 4px" }}>
                            {mission.sites?.nom ?? "—"}
                          </p>
                          {mission.date_prevue && (
                            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>
                              {formatDate(mission.date_prevue)}
                            </p>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          {mission.type && (
                            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "rgba(255,255,255,0.05)", color: "#60A5FA", fontWeight: 600 }}>
                              {mission.type}
                            </span>
                          )}
                          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "rgba(148,163,184,0.12)", color: "#94A3B8", fontWeight: 600 }}>
                            {mission.statut}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
