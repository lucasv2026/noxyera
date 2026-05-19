"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";

const dropdownItems = [
  {
    col: "Par secteur",
    items: [
      {
        emoji: "🍽",
        title: "Restauration & Brasseries",
        desc: "Conformité HACCP pour restaurants",
        href: "/suivi-sanitaire#restauration",
      },
      {
        emoji: "🏨",
        title: "Hôtellerie",
        desc: "Gestion nuisibles pour hôtels",
        href: "/suivi-sanitaire#hotellerie",
      },
      {
        emoji: "🏭",
        title: "Entrepôts & Logistique",
        desc: "Protection zones de stockage",
        href: "/suivi-sanitaire#entrepots",
      },
      {
        emoji: "🌾",
        title: "Industrie agroalimentaire",
        desc: "Conformité sites de production",
        href: "/suivi-sanitaire#agroalimentaire",
      },
    ],
  },
  {
    col: "Nos services",
    items: [
      {
        emoji: "📄",
        title: "Rapport HACCP automatique",
        desc: "PDF horodaté après chaque passage",
        href: "/suivi-sanitaire#rapport",
        badge: null,
      },
      {
        emoji: "🔔",
        title: "Pest Alert Score",
        desc: "Score de risque en temps réel",
        href: "/suivi-sanitaire#pest-alert",
        badge: null,
      },
      {
        emoji: "👨‍🔧",
        title: "Techniciens certifiés",
        desc: "Certibiocide & HACCP",
        href: "/suivi-sanitaire#techniciens",
        badge: null,
      },
      {
        emoji: "🔍",
        title: "Audit à distance",
        desc: "Diagnostic visioconférence",
        href: "/audit-distance",
        badge: "Bêta",
      },
    ],
  },
];

export function MegaMenu() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

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
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
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
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: "0",
                  background: "white",
                  borderRadius: "16px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  padding: "24px",
                  width: "480px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "24px",
                  zIndex: 100,
                }}
              >
                {dropdownItems.map((col) => (
                  <div key={col.col}>
                    <p
                      style={{
                        fontSize: "12px",
                        textTransform: "uppercase",
                        color: "#6B7280",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        marginBottom: "12px",
                      }}
                    >
                      {col.col}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {col.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "flex-start",
                            padding: "8px 10px",
                            borderRadius: "10px",
                            textDecoration: "none",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.background = "#F5F0E8";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                          }}
                        >
                          <span style={{ fontSize: "18px", lineHeight: "1.2", flexShrink: 0 }}>
                            {item.emoji}
                          </span>
                          <div>
                            <p
                              style={{
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#1B3A2D",
                                margin: 0,
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              {item.title}
                              {"badge" in item && item.badge && (
                                <span
                                  style={{
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    background: "#F26522",
                                    color: "white",
                                    padding: "1px 6px",
                                    borderRadius: "6px",
                                  }}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </p>
                            <p style={{ fontSize: "12px", color: "#6B7280", margin: "2px 0 0" }}>
                              {item.desc}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/tarifs"
            style={{ fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.85)", textDecoration: "none" }}
          >
            Tarifs
          </Link>
          <Link
            href="/blog"
            style={{ fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.85)", textDecoration: "none" }}
          >
            Blog
          </Link>
        </nav>

        {/* Desktop — boutons droits */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
          className="hide-mobile"
        >
          <Link
            href="/espace-technicien"
            style={{
              border: "1px solid rgba(255,255,255,0.3)",
              color: "white",
              padding: "8px 16px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Techniciens
          </Link>
          <Link
            href="/login"
            style={{
              background: "#F26522",
              color: "white",
              padding: "8px 16px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Accès Client
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "white",
            fontSize: "22px",
            padding: "4px 8px",
            display: "none",
          }}
          className="show-mobile"
          aria-label="Menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div
          style={{
            position: "absolute",
            top: "64px",
            left: 0,
            right: 0,
            background: "#1B3A2D",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            padding: "16px 24px",
            zIndex: 99,
          }}
        >
          {/* Suivi sanitaire accordion */}
          <button
            onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              width: "100%",
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              color: "rgba(255,255,255,0.85)",
              fontSize: "15px",
              fontWeight: 500,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Suivi sanitaire
            <span style={{ fontSize: "12px" }}>{mobileServicesOpen ? "▲" : "▼"}</span>
          </button>

          {mobileServicesOpen && (
            <div style={{ padding: "8px 0 8px 8px" }}>
              {dropdownItems.map((col) => (
                <div key={col.col} style={{ marginBottom: "12px" }}>
                  <p
                    style={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.4)",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      margin: "8px 0 6px",
                    }}
                  >
                    {col.col}
                  </p>
                  {col.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: "block",
                        padding: "8px 0",
                        color: "rgba(255,255,255,0.75)",
                        fontSize: "14px",
                        textDecoration: "none",
                      }}
                    >
                      {item.emoji} {item.title}
                      {"badge" in item && item.badge && (
                        <span
                          style={{
                            marginLeft: "6px",
                            fontSize: "10px",
                            fontWeight: 700,
                            background: "#F26522",
                            color: "white",
                            padding: "1px 6px",
                            borderRadius: "6px",
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}

          {[
            { label: "Tarifs", href: "/tarifs" },
            { label: "Blog", href: "/blog" },
            { label: "Techniciens", href: "/espace-technicien" },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block",
                padding: "12px 0",
                color: "rgba(255,255,255,0.85)",
                fontSize: "15px",
                fontWeight: 500,
                textDecoration: "none",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {label}
            </Link>
          ))}

          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            style={{
              display: "block",
              marginTop: "16px",
              textAlign: "center",
              background: "#F26522",
              color: "white",
              padding: "12px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
            }}
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
