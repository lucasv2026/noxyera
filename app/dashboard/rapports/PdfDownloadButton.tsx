"use client"

import { Download } from "lucide-react"

interface Props {
  pdfUrl: string | null
}

export function PdfDownloadButton({ pdfUrl }: Props) {
  return (
    <a
      href={pdfUrl ?? "#"}
      onClick={
        !pdfUrl
          ? (e) => {
              e.preventDefault()
              alert("PDF disponible en production")
            }
          : undefined
      }
      target="_blank"
      rel="noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "#1B3A2D",
        color: "white",
        padding: "8px 16px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        textDecoration: "none",
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
    >
      <Download size={14} /> Télécharger PDF
    </a>
  )
}
