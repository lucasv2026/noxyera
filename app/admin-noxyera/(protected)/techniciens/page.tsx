import { ShieldCheck, Star, MapPin, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { ADMIN_TECHNICIENS } from "@/lib/demo-data";

export default function AdminTechniciensPage() {
  const actifsAujourdhui = ADMIN_TECHNICIENS.filter(t => t.missionsAujourdhui > 0).length;

  return (
    <div className="p-5 space-y-5 min-h-screen" style={{ background: "#0D1F17" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Techniciens</h1>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            {ADMIN_TECHNICIENS.length} techniciens · {actifsAujourdhui} en mission aujourd&apos;hui
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "#F26522" }}
        >
          + Ajouter technicien
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total certifiés", value: ADMIN_TECHNICIENS.length, color: "#10B981" },
          { label: "En mission / aujourd&apos;hui", value: actifsAujourdhui, color: "#60A5FA" },
          { label: "Note moyenne", value: (ADMIN_TECHNICIENS.reduce((acc, t) => acc + t.note, 0) / ADMIN_TECHNICIENS.length).toFixed(1) + "/5", color: "#F59E0B" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4"
            style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}
              dangerouslySetInnerHTML={{ __html: label }} />
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Techniciens list */}
      <div className="space-y-3">
          {ADMIN_TECHNICIENS.map((tech) => (
            <div
              key={tech.id}
              className="rounded-2xl p-5"
              style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: tech.statut === "actif" ? "#1B4332" : "#1A1A1A", color: tech.statut === "actif" ? "#10B981" : "#6B7280" }}
                >
                  {tech.nom.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm text-white">{tech.nom}</p>
                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{tech.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {tech.statut === "actif" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}>
                          <CheckCircle2 size={10} /> Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: "rgba(107,114,128,0.15)", color: "#6B7280" }}>
                          <XCircle size={10} /> Inactif
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    <div>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Certification</p>
                      <p className="text-xs font-medium mt-0.5 text-white flex items-center gap-1">
                        <ShieldCheck size={11} style={{ color: "#10B981" }} />
                        {tech.certif}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Région</p>
                      <p className="text-xs font-medium mt-0.5 text-white flex items-center gap-1">
                        <MapPin size={11} style={{ color: "#60A5FA" }} />
                        {tech.region}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Aujourd&apos;hui</p>
                      <p className="text-xs font-medium mt-0.5 text-white flex items-center gap-1">
                        <Calendar size={11} style={{ color: "#A78BFA" }} />
                        {tech.missionsAujourdhui} mission{tech.missionsAujourdhui > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Note</p>
                      <p className="text-xs font-medium mt-0.5 text-white flex items-center gap-1">
                        <Star size={11} style={{ color: "#F59E0B", fill: "#F59E0B" }} />
                        {tech.note}/5 ({tech.missionsTotal} missions)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
