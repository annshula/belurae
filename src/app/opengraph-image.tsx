import { ImageResponse } from "next/og";

import { site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} — ${site.tagline}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#faf7f2",
          color: "#1f1d1a",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 36, letterSpacing: "0.3em" }}>BELURAE</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, lineHeight: 1.05 }}>Beauty,</div>
          <div style={{ fontSize: 96, lineHeight: 1.05, fontStyle: "italic", color: "#3e5242" }}>made simpler.</div>
        </div>
        <div style={{ fontSize: 28, color: "#5b554d" }}>{site.descriptor}</div>
      </div>
    ),
    size,
  );
}
