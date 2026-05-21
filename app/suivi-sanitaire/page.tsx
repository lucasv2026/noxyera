"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, ShieldCheck, Clock, Download, Rat, Bug, ClipboardList, Zap, BedDouble, VolumeX, Camera, Trophy, Map, Package, BarChart2, RefreshCw, Factory, Pencil, FlaskConical, CheckSquare, type LucideIcon } from "lucide-react";
import { MegaMenu } from "@/components/MegaMenu";

const sectionStyle = (bg: string) => ({
  background: bg,
  padding: "80px 24px",
});

const innerStyle = {
  maxWidth: "1000px",
  margin: "0 auto",
};

const h2Style = {
  fontSize: "32px",
  fontWeight: 700,
  color: "#1A1A1A",
  margin: "0 0 12px",
};

const subtitleStyle = {
  fontSize: "16px",
  color: "#6B7280",
  margin: "0 0 40px",
  lineHeight: 1.6,
};

const cardGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: "16px",
  marginBottom: "32px",
};

const cardStyle = {
  background: "white",
  borderRadius: "16px",
  padding: "20px",
  border: "1px solid rgba(0,0,0,0.06)",
  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
};

const badgeStyle = {
  display: "inline-block",
  padding: "4px 14px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: 700,
  background: "#F26522",
  color: "white",
  marginBottom: "16px",
};

const ctaButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "12px 24px",
  borderRadius: "12px",
  background: "#F26522",
  color: "white",
  fontWeight: 600,
  fontSize: "14px",
  textDecoration: "none",
};

const outlineBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "12px 24px",
  borderRadius: "12px",
  border: "1.5px solid rgba(255,255,255,0.5)",
  color: "white",
  fontWeight: 600,
  fontSize: "14px",
  textDecoration: "none",
};

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function FeatureCard({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <div style={cardStyle}>
      <div style={{ marginBottom: "10px" }}><Icon size={22} style={{ color: "#1B3A2D" }} /></div>
      <p style={{ fontSize: "14px", fontWeight: 700, color: "#1A1A1A", margin: "0 0 6px" }}>{title}</p>
      <p style={{ fontSize: "13px", color: "#6B7280", margin: 0, lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}

export default function SuiviSanitairePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8" }}>
      <MegaMenu />

      {/* Header vert */}
      <header style={{ background: "#1B3A2D", padding: "64px 24px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
          <span style={badgeStyle}>Suivi sanitaire</span>
          <h1
            style={{
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 700,
              color: "white",
              margin: "0 0 16px",
              lineHeight: 1.15,
            }}
          >
            Protection complète contre les nuisibles<br />pour votre établissement
          </h1>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", margin: "0 0 32px", lineHeight: 1.6 }}>
            Techniciens certifiés Certibiocide, rapports HACCP automatiques,<br />
            interventions sous 48h — tout inclus dans votre forfait Noxyera.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => scrollTo("pest-alert")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                borderRadius: "12px",
                background: "#F26522",
                color: "white",
                fontWeight: 600,
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Calculer mon score <ArrowRight size={14} />
            </button>
            <Link href="/tarifs" style={outlineBtnStyle}>
              Voir les tarifs
            </Link>
          </div>
        </div>
      </header>

      {/* Section restauration */}
      <section id="restauration" style={sectionStyle("#F5F0E8")}>
        <div style={innerStyle}>
          <h2 style={h2Style}>Restauration & Brasseries</h2>
          <p style={subtitleStyle}>
            Les restaurants et brasseries font face aux risques nuisibles les plus élevés du secteur alimentaire.
            Noxyera vous protège avec un suivi adapté aux exigences DDPP.
          </p>
          <div style={cardGridStyle}>
            <FeatureCard icon={Rat} title="Contrôle rongeurs" desc="Pièges homologués et relevés mensuels documentés pour votre PMS." />
            <FeatureCard icon={Bug} title="Lutte contre les blattes" desc="Traitement gel certifié HACCP, sans interruption de service." />
            <FeatureCard icon={ClipboardList} title="Plan PMS inclus" desc="Mise à jour automatique de votre Plan de Maîtrise Sanitaire." />
            <FeatureCard icon={Zap} title="Intervention 24-48h" desc="Infestation détectée ? Un technicien intervient rapidement." />
          </div>
          <Link href="/tarifs" style={ctaButtonStyle}>
            Estimer mon tarif → <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Section hôtellerie */}
      <section id="hotellerie" style={sectionStyle("white")}>
        <div style={innerStyle}>
          <h2 style={h2Style}>Hôtellerie & Résidences</h2>
          <p style={subtitleStyle}>
            Les punaises de lit et la gestion discrète des nuisibles sont au cœur de notre offre hôtelière.
            Zéro perturbation pour vos clients, conformité totale pour votre établissement.
          </p>
          <div style={cardGridStyle}>
            <FeatureCard icon={BedDouble} title="Détection punaises de lit" desc="Inspection chien détecteur + traitement thermique certifié." />
            <FeatureCard icon={VolumeX} title="Intervention discrète" desc="Nos techniciens opèrent en dehors des heures d'occupation." />
            <FeatureCard icon={Camera} title="Documentation photographique" desc="Photos des zones traitées dans chaque rapport PDF." />
            <FeatureCard icon={Trophy} title="Certification affichable" desc="Badge Noxyera certifié pour rassurer vos voyageurs." />
          </div>
          <Link href="/tarifs" style={ctaButtonStyle}>
            Estimer mon tarif → <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Section entrepôts */}
      <section id="entrepots" style={sectionStyle("#F5F0E8")}>
        <div style={innerStyle}>
          <h2 style={h2Style}>Entrepôts & Logistique</h2>
          <p style={subtitleStyle}>
            Les entrepôts et sites logistiques nécessitent une surveillance renforcée due aux flux constants
            de marchandises et aux zones de stockage étendues.
          </p>
          <div style={cardGridStyle}>
            <FeatureCard icon={Map} title="Cartographie des zones" desc="Plan de l'entrepôt avec localisation de chaque dispositif de contrôle." />
            <FeatureCard icon={Package} title="Zones de quai sécurisées" desc="Protection des zones de réception, vecteurs d'introduction nuisibles." />
            <FeatureCard icon={BarChart2} title="Rapports IFS/BRC" desc="Documentation conforme aux standards internationaux de sécurité alimentaire." />
            <FeatureCard icon={RefreshCw} title="Fréquence adaptable" desc="Passages hebdomadaires ou mensuels selon votre volume d'activité." />
          </div>
          <Link href="/tarifs" style={ctaButtonStyle}>
            Estimer mon tarif → <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Section agroalimentaire */}
      <section id="agroalimentaire" style={sectionStyle("white")}>
        <div style={innerStyle}>
          <h2 style={h2Style}>Industrie agroalimentaire</h2>
          <p style={subtitleStyle}>
            Pour les sites de production alimentaire, la conformité HACCP n&apos;est pas une option.
            Noxyera fournit la documentation certifiée exigée par les auditeurs.
          </p>
          <div style={cardGridStyle}>
            <FeatureCard icon={Factory} title="Plan de lutte intégrée" desc="Stratégie IPM adaptée à chaque ligne de production." />
            <FeatureCard icon={Pencil} title="Traçabilité produits" desc="Numéros AMM de tous les biocides utilisés, archivés 10 ans." />
            <FeatureCard icon={FlaskConical} title="Analyse des risques" desc="Évaluation HACCP dédiée aux risques de contamination nuisibles." />
            <FeatureCard icon={CheckSquare} title="Audit IFS/BRC prêt" desc="Rapport prêt pour vos audits de certification alimentaire." />
          </div>
          <Link href="/tarifs" style={ctaButtonStyle}>
            Estimer mon tarif → <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Section rapport HACCP */}
      <section id="rapport" style={sectionStyle("#F5F0E8")}>
        <div style={innerStyle}>
          <h2 style={h2Style}>Rapport HACCP automatique</h2>
          <p style={subtitleStyle}>
            Fini les rapports manuscrits illisibles. Après chaque intervention Noxyera, un PDF complet et
            conforme est généré automatiquement et archivé dans votre espace client.
          </p>
          <p style={{ fontSize: "15px", color: "#6B7280", margin: "0 0 24px", lineHeight: 1.7 }}>
            Notre système génère le rapport en temps réel dès que le technicien valide l&apos;intervention sur
            son application mobile. Le document est immédiatement horodaté, signé numériquement et disponible
            dans votre tableau de bord.
          </p>
          <p style={{ fontSize: "15px", color: "#6B7280", margin: "0 0 32px", lineHeight: 1.7 }}>
            En cas de contrôle DDPP ou d&apos;audit interne, vous pouvez présenter vos rapports en quelques secondes.
            Format homologué, signatures vérifiables, historique illimité.
          </p>
          <div style={cardGridStyle}>
            <div style={cardStyle}>
              <FileText size={20} style={{ color: "#1B3A2D", marginBottom: "10px" }} />
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#1A1A1A", margin: "0 0 6px" }}>Génération automatique</p>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: 0, lineHeight: 1.5 }}>Créé instantanément à la fin de chaque intervention, sans action de votre part.</p>
            </div>
            <div style={cardStyle}>
              <Download size={20} style={{ color: "#1B3A2D", marginBottom: "10px" }} />
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#1A1A1A", margin: "0 0 6px" }}>Export PDF</p>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: 0, lineHeight: 1.5 }}>Téléchargeable en un clic depuis votre espace client, au format homologué DDPP.</p>
            </div>
            <div style={cardStyle}>
              <ShieldCheck size={20} style={{ color: "#1B3A2D", marginBottom: "10px" }} />
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#1A1A1A", margin: "0 0 6px" }}>Signé numériquement</p>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: 0, lineHeight: 1.5 }}>Signature numérique du technicien certifiée et horodatée à la milliseconde.</p>
            </div>
            <div style={cardStyle}>
              <Clock size={20} style={{ color: "#1B3A2D", marginBottom: "10px" }} />
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#1A1A1A", margin: "0 0 6px" }}>Stocké 10 ans</p>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: 0, lineHeight: 1.5 }}>Archivage sécurisé Supabase avec chiffrement. Accessible à tout moment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section techniciens */}
      <section id="techniciens" style={sectionStyle("white")}>
        <div style={innerStyle}>
          <h2 style={h2Style}>Techniciens certifiés Certibiocide</h2>
          <p style={subtitleStyle}>
            Tous nos techniciens sont certifiés Certibiocide par l&apos;ANSES et formés aux exigences HACCP.
            Chaque certification est vérifiable et incluse dans vos rapports.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "center", textAlign: "center", padding: "40px 0" }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "50%",
              background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto"
            }}>
              <ShieldCheck size={28} style={{ color: "#059669" }} />
            </div>
            <div style={{ maxWidth: "560px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#1A1A1A", margin: "0 0 12px" }}>
                Des techniciens rigoureusement sélectionnés
              </h3>
              <p style={{ fontSize: "15px", color: "#6B7280", lineHeight: 1.7, margin: 0 }}>
                Chaque technicien Noxyera est certifié Certibiocide par l&apos;ANSES avant toute intervention.
                Cette certification est vérifiée, à jour, et apparaît dans chaque rapport remis à votre établissement.
              </p>
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "#D1FAE5", borderRadius: "999px", padding: "8px 18px"
            }}>
              <ShieldCheck size={14} style={{ color: "#059669" }} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#065F46" }}>Certification Certibiocide ANSES vérifiée</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section Pest Alert Score (fond vert) */}
      <section id="pest-alert" style={{ background: "#1B3A2D", padding: "80px 24px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
          <span
            style={{
              display: "inline-block",
              padding: "4px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 700,
              background: "rgba(242,101,34,0.2)",
              color: "#F26522",
              marginBottom: "16px",
            }}
          >
            Gratuit — 30 secondes
          </span>
          <h2
            style={{
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 700,
              color: "white",
              margin: "0 0 14px",
            }}
          >
            Calculez votre Pest Alert Score
          </h2>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.7)", margin: "0 0 32px", lineHeight: 1.6 }}>
            Score calculé en temps réel : météo locale, chantiers voisins, données Alim&apos;confiance.
            Découvrez le niveau de risque nuisibles de votre établissement.
          </p>
          <Link
            href="/#pest-alert"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "14px 28px",
              borderRadius: "12px",
              background: "#F26522",
              color: "white",
              fontWeight: 700,
              fontSize: "15px",
              textDecoration: "none",
            }}
          >
            Calculer mon score <ArrowRight size={15} />
          </Link>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginTop: "12px" }}>
            Sans inscription · Résultat immédiat
          </p>
        </div>
      </section>

      {/* Footer simple */}
      <footer style={{ background: "#1B3A2D", borderTop: "1px solid rgba(255,255,255,0.07)", padding: "24px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: 0 }}>
            © 2026 Noxyera SAS · Paris, France · contact@noxyera.com
          </p>
        </div>
      </footer>
    </div>
  );
}
