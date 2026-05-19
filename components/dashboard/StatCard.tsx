import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}

export function StatCard({ icon: Icon, label, value, sub, accent = false }: StatCardProps) {
  return (
    <div
      style={{
        background: accent ? "#1B3A2D" : "white",
        borderRadius: "12px",
        padding: "20px 24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "flex-start",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: accent ? "rgba(255,255,255,0.12)" : "#F5F0E8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={18} style={{ color: accent ? "#F5F0E8" : "#1B3A2D" }} />
      </div>
      <div>
        <p
          style={{
            fontSize: "12px",
            color: accent ? "rgba(255,255,255,0.6)" : "#6B7280",
            margin: 0,
            marginBottom: "4px",
            fontWeight: 500,
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: accent ? "white" : "#1B3A2D",
            margin: 0,
            lineHeight: 1,
          }}
        >
          {value}
        </p>
        {sub && (
          <p
            style={{
              fontSize: "11px",
              color: accent ? "rgba(255,255,255,0.45)" : "#9CA3AF",
              margin: 0,
              marginTop: "4px",
            }}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}
