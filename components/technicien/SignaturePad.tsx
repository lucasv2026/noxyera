"use client"

import { forwardRef } from "react"
import SignatureCanvas from "react-signature-canvas"

interface SignaturePadProps {
  penColor?: string
  width?: number
  height?: number
}

export const SignaturePad = forwardRef<SignatureCanvas, SignaturePadProps>(
  function SignaturePad({ penColor = "#1B3A2D", width = 540, height = 150 }, ref) {
    return (
      <SignatureCanvas
        ref={ref}
        penColor={penColor}
        canvasProps={{
          width,
          height,
          style: { width: "100%", height: `${height}px` },
        }}
      />
    )
  }
)
