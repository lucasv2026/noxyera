interface StatusBadgeProps {
  status: string
  type?: "contract" | "intervention" | "site"
}

const CONTRACT_MAP: Record<string, { label: string; bg: string; color: string }> = {
  actif:    { label: "Actif",    bg: "#D1FAE5", color: "#065F46" },
  expire:   { label: "Expiré",   bg: "#FEE2E2", color: "#991B1B" },
  suspendu: { label: "Suspendu", bg: "#FEF3C7", color: "#92400E" },
}

const INTERVENTION_MAP: Record<string, { label: string; bg: string; color: string }> = {
  planifie: { label: "Planifié",  bg: "#DBEAFE", color: "#1E40AF" },
  realise:  { label: "Réalisé",   bg: "#D1FAE5", color: "#065F46" },
  annule:   { label: "Annulé",    bg: "#F3F4F6", color: "#6B7280" },
}

const SITE_MAP: Record<string, { label: string; bg: string; color: string }> = {
  actif:   { label: "Actif",   bg: "#D1FAE5", color: "#065F46" },
  inactif: { label: "Inactif", bg: "#F3F4F6", color: "#6B7280" },
}

export function StatusBadge({ status, type = "contract" }: StatusBadgeProps) {
  const map = type === "intervention" ? INTERVENTION_MAP : type === "site" ? SITE_MAP : CONTRACT_MAP
  const config = map[status] ?? { label: status, bg: "#F3F4F6", color: "#6B7280" }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: 600,
        background: config.bg,
        color: config.color,
        whiteSpace: "nowrap",
      }}
    >
      {config.label}
    </span>
  )
}
