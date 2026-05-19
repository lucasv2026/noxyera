import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  _req: NextRequest,
  { params }: { params: { size: string } }
) {
  const size = parseInt(params.size, 10) || 192;
  const radius = Math.round(size * 0.15);
  const fontSize = Math.round(size * 0.58);
  const subSize = Math.round(size * 0.11);
  const letterSpacing = Math.round(size * 0.02);

  return new ImageResponse(
    (
      <div
        style={{
          background: "#1B3A2D",
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: radius,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span
            style={{
              color: "#F26522",
              fontSize,
              fontWeight: 900,
              fontFamily: "system-ui, sans-serif",
              letterSpacing: -letterSpacing * 2,
              lineHeight: 1,
            }}
          >
            N
          </span>
          <span
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: subSize,
              fontFamily: "system-ui, sans-serif",
              letterSpacing: letterSpacing,
              marginTop: -(size * 0.04),
            }}
          >
            OXYERA
          </span>
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}
