import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1B3A2D",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span
            style={{
              color: "#F26522",
              fontSize: 110,
              fontWeight: 900,
              fontFamily: "system-ui, sans-serif",
              letterSpacing: "-4px",
              lineHeight: 1,
            }}
          >
            N
          </span>
          <span
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 20,
              fontFamily: "system-ui, sans-serif",
              letterSpacing: "4px",
              marginTop: -8,
            }}
          >
            OXYERA
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
