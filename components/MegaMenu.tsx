"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Activity, Building2, Factory, FileText, Menu, Package, Search, Shield, UtensilsCrossed, UserPlus, X } from "lucide-react";
import { Logo } from "@/components/logo";

const SECTEUR_ITEMS = [
  { icon: UtensilsCrossed, title: "Restauration & Brasseries", desc: "Conformité HACCP pour restaurants", href: "/suivi-sanitaire#restauration" },
  { icon: Building2,       title: "Hôtellerie",                desc: "Gestion nuisibles pour hôtels",    href: "/suivi-sanitaire#hotellerie" },
  { icon: Package,         title: "Entrepôts & Logistique",    desc: "Protection zones de stockage",      href: "/suivi-sanitaire#entrepots" },
  { icon: Factory,         title: "Industrie agroalimentaire", desc: "Conformité sites de production",    href: "/suivi-sanitaire#agroalimentaire" },
];

const SERVICE_ITEMS = [
  { icon: FileText,  title: "Rapport HACCP automatique", desc: "PDF horodaté après chaque passage",  href: "/suivi-sanitaire#rapport",     badge: null },
  { icon: Activity,  title: "Pest Alert Score",           desc: "Score de risque en temps réel",      href: "/suivi-sanitaire#pest-alert",  badge: null },
  { icon: Shield,    title: "Techniciens certifiés",      desc: "Certibiocide & HACCP",               href: "/suivi-sanitaire#techniciens", badge: null },
  { icon: Search,    title: "Audit à distance",           desc: "Diagnostic visioconférence",          href: "/audit-distance",             badge: "Bêta" },
];

function DropdownItem({ icon: Icon, title, desc, href, badge }: {
  icon: React.ElementType
  title: string
  desc: string
  href: string
  badge?: string | null
}) {
  return (
    <Link
      href={href}
      style={{ display: "flex", gap: "12px", alignItems: "center", padding: "10px 12px", borderRadius: "8px", textDecoration: "none" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#F5F0E8"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
    >
      <div style={{
        width: "40px", height: "40px", background: "#F5F0E8", borderRadius: "8px",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={18} style={{ color: "#1B3A2D" }} />
      </div>
      <div>
        <p style={{ fontSize: "14px", fontWeight: 700, color: "#1B3A2D", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
          {title}
          {badge && (
            <span style={{ fontSize: "10px", fontWeight: 700, background: "#F26522", color: "white", padding: "1px 6px", borderRadius: "6px" }}>
              {badge}
            </span>
          )}
        </p>
        <p style={{ fontSize: "12px", color: "#6B7280", margin: "2px 0 0" }}>{desc}</p>
      </div>
    </Link>
  )
}

export function MegaMenu() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<"client" | "technicien">("client");
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleDropdownEnter = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    closeTimerRef.current = setTimeout(() => setDropdownOpen(false), 200);
  };

  return (
    <header
      style={{
        background: "#1B3A2D",
        height: "64px",
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        {/* Logo */}
        <Logo dark />

        {/* Desktop nav — centre-gauche */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            flex: 1,
            marginLeft: "48px",
          }}
          className="hide-mobile"
        >
          {/* Suivi sanitaire avec dropdown */}
          <div
            style={{ position: "relative" }}
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.85)",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "8px 0",
              }}
            >
              Suivi sanitaire
              <span style={{ fontSize: "10px", opacity: 0.7 }}>▾</span>
            </button>

            {dropdownOpen && (
              <div
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: "0",
                  background: "white",
                  borderRadius: "16px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  padding: "16px",
                  width: "520px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "4px",
                  zIndex: 100,
                }}
              >
                {/* Colonne Par secteur */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {SECTEUR_ITEMS.map((item) => (
                    <DropdownItem key={item.href} {...item} />
                  ))}
                </div>

                {/* Colonne Nos services */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  {SERVICE_ITEMS.map((item) => (
                    <DropdownItem key={item.href} {...item} />
                  ))}
                </div>

                {/* Séparateur + Devenir technicien */}
                <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #E5E7EB", marginTop: "8px", paddingTop: "12px" }}>
                  <p style={{ fontSize: "11px", textTransform: "uppercase", color: "#6B7280", fontWeight: 700, letterSpacing: "0.08em", margin: "0 12px 6px" }}>
                    Vous êtes technicien ?
                  </p>
                  <DropdownItem
                    icon={UserPlus}
                    title="Devenir technicien"
                    desc="Rejoignez notre réseau"
                    href="/devenir-technicien"
                    badge="On recrute"
                  />
                </div>
              </div>
            )}
          </div>

          <Link href="/tarifs" style={{ fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>
            Tarifs
          </Link>
          <Link href="/blog" style={{ fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>
            Blog
          </Link>
        </nav>

        {/* Desktop — boutons droits */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }} className="hide-mobile">
          {/* Toggle Client / Technicien */}
          <div style={{
            display: "flex", gap: "0", borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.2)", overflow: "hidden",
            marginRight: "8px",
          }}>
            {[
              { id: "client" as const,     label: "Mon établissement",   href: null },
              { id: "technicien" as const, label: "Je suis technicien",  href: "/espace-technicien" },
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => {
                  setActiveMode(pill.id);
                  if (pill.href) window.location.href = pill.href;
                }}
                style={{
                  padding: "6px 14px", fontSize: "12px", fontWeight: 500,
                  backgroundColor: activeMode === pill.id ? "rgba(255,255,255,0.15)" : "transparent",
                  color: activeMode === pill.id ? "white" : "rgba(255,255,255,0.6)",
                  border: "none", cursor: "pointer", whiteSpace: "nowrap" as const,
                  transition: "all 0.15s",
                }}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <Link
            href="/espace-technicien"
            style={{ border: "1px solid rgba(255,255,255,0.3)", color: "white", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}
          >
            Techniciens
          </Link>
          <Link
            href="/login"
            style={{ background: "#F26522", color: "white", padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}
          >
            Accès Client
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "white", fontSize: "22px", padding: "4px 8px", display: "none" }}
          className="show-mobile"
          aria-label="Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div style={{ position: "absolute", top: "64px", left: 0, right: 0, background: "#1B3A2D", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "16px 24px", zIndex: 99 }}>
          {/* Suivi sanitaire accordion */}
          <button
            onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", color: "rgba(255,255,255,0.85)", fontSize: "15px", fontWeight: 500, borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            Suivi sanitaire
            <span style={{ fontSize: "12px" }}>{mobileServicesOpen ? "▲" : "▼"}</span>
          </button>

          {mobileServicesOpen && (
            <div style={{ padding: "8px 0 8px 8px" }}>
              <p style={{ fontSize: "11px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.08em", margin: "8px 0 6px" }}>Par secteur</p>
              {SECTEUR_ITEMS.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} style={{ display: "block", padding: "8px 0", color: "rgba(255,255,255,0.75)", fontSize: "14px", textDecoration: "none" }}>
                  {item.title}
                </Link>
              ))}
              <p style={{ fontSize: "11px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.08em", margin: "12px 0 6px" }}>Nos services</p>
              {SERVICE_ITEMS.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} style={{ display: "block", padding: "8px 0", color: "rgba(255,255,255,0.75)", fontSize: "14px", textDecoration: "none" }}>
                  {item.title}
                  {item.badge && (
                    <span style={{ marginLeft: "6px", fontSize: "10px", fontWeight: 700, background: "#F26522", color: "white", padding: "1px 6px", borderRadius: "6px" }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}

          {[
            { label: "Tarifs", href: "/tarifs" },
            { label: "Blog", href: "/blog" },
            { label: "Techniciens", href: "/espace-technicien" },
            { label: "Devenir technicien", href: "/devenir-technicien" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)} style={{ display: "block", padding: "12px 0", color: "rgba(255,255,255,0.85)", fontSize: "15px", fontWeight: 500, textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {label}
            </Link>
          ))}

          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            style={{ display: "block", marginTop: "16px", textAlign: "center", background: "#F26522", color: "white", padding: "12px", borderRadius: "10px", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}
          >
            Accès Client
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
}
