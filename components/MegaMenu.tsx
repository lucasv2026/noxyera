"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Building2, Factory, FileText, Menu, Package, Shield, UtensilsCrossed, UserPlus, X } from "lucide-react";
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

function SpaceToggle({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const isTechnicien = pathname.startsWith("/technicien");

  const activePill: React.CSSProperties = {
    background: "white",
    color: "#1B3A2D",
    fontWeight: 600,
    borderRadius: 999,
    padding: "7px 18px",
    fontSize: 13,
    cursor: "pointer",
    border: "none",
    flex: mobile ? 1 : undefined,
    textAlign: mobile ? "center" : undefined,
    whiteSpace: "nowrap",
    textDecoration: "none",
    display: mobile ? "block" : "inline-block",
  };

  const inactivePill: React.CSSProperties = {
    background: "transparent",
    color: "rgba(255,255,255,0.8)",
    fontWeight: 400,
    borderRadius: 999,
    padding: "7px 18px",
    fontSize: 13,
    cursor: "pointer",
    border: "none",
    flex: mobile ? 1 : undefined,
    textAlign: mobile ? "center" : undefined,
    whiteSpace: "nowrap",
    textDecoration: "none",
    display: mobile ? "block" : "inline-block",
  };

  return (
    <div style={{
      display: "flex",
      background: "rgba(255,255,255,0.12)",
      borderRadius: 999,
      padding: 3,
      gap: 2,
      width: mobile ? "100%" : undefined,
    }}>
      <Link
        href="/"
        style={!isTechnicien ? activePill : inactivePill}
      >
        Espace client
      </Link>
      <Link
        href="/techniciens"
        style={isTechnicien ? activePill : inactivePill}
      >
        Je suis technicien
      </Link>
    </div>
  );
}

function useNavSpace() {
  const pathname = usePathname();
  const isTechnicien = pathname.startsWith("/technicien");
  return isTechnicien ? "technicien" : "client";
}

export function MegaMenu() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const navSpace = useNavSpace();

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
          position: "relative",
        }}
      >
        {/* Zone gauche — Logo + liens nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px", flexShrink: 0 }}>
          <Logo dark />

          {/* Liens nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: "28px" }} className="hide-mobile">
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
                  color: "white",
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
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {SECTEUR_ITEMS.map((item) => (
                      <DropdownItem key={item.href} {...item} />
                    ))}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {SERVICE_ITEMS.map((item) => (
                      <DropdownItem key={item.href} {...item} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href="/tarifs" style={{ fontSize: "14px", fontWeight: 500, color: "white", textDecoration: "none" }}>
              Tarifs
            </Link>
            <Link href="/blog" style={{ fontSize: "14px", fontWeight: 500, color: "white", textDecoration: "none" }}>
              Blog
            </Link>
          </nav>
        </div>

        {/* Toggle centré absolument */}
        <div
          className="hide-mobile"
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            pointerEvents: "auto",
          }}
        >
          <SpaceToggle />
        </div>

        {/* Zone droite — bouton CTA unique */}
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }} className="hide-mobile">
          {navSpace === "technicien" ? (
            <Link
              href="/espace-technicien"
              style={{
                background: "#F26522",
                color: "white",
                padding: "9px 20px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Espace Technicien
            </Link>
          ) : (
            <Link
              href="/login"
              style={{
                background: "#F26522",
                color: "white",
                padding: "9px 20px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Accès Client
            </Link>
          )}
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
          {/* Toggle pills en haut du drawer */}
          <div style={{ marginBottom: 16 }}>
            <SpaceToggle mobile />
          </div>

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
          ].map(({ label, href }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)} style={{ display: "block", padding: "12px 0", color: "rgba(255,255,255,0.85)", fontSize: "15px", fontWeight: 500, textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {label}
            </Link>
          ))}

          {/* Bouton CTA en bas du drawer */}
          {navSpace === "technicien" ? (
            <Link
              href="/espace-technicien"
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block", marginTop: "16px", textAlign: "center",
                background: "#F26522", color: "white", padding: "12px",
                borderRadius: 20, fontSize: 13, fontWeight: 600, textDecoration: "none",
                border: "none", cursor: "pointer",
              }}
            >
              Espace Technicien
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block", marginTop: "16px", textAlign: "center",
                background: "#F26522", color: "white", padding: "12px",
                borderRadius: 20, fontSize: 13, fontWeight: 600, textDecoration: "none",
                border: "none", cursor: "pointer",
              }}
            >
              Accès Client
            </Link>
          )}
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
