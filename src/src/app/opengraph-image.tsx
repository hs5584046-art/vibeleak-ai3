import { ImageResponse } from "next/og";

export const alt = "VibeLytix — Understand the pattern behind who you are";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg,#09070f,#24153f 55%,#51204c)",
          color: "white",
          fontFamily: "Arial"
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 800, color: "#c8adff" }}>VibeLytix</div>
        <div style={{ fontSize: 76, lineHeight: 1.02, fontWeight: 900, marginTop: 28, maxWidth: 1000 }}>
          Understand the pattern behind who you are.
        </div>
        <div style={{ fontSize: 28, color: "#c7bfd3", marginTop: 30 }}>
          Personality · Relationships · Career · Growth
        </div>
      </div>
    ),
    size
  );
}
