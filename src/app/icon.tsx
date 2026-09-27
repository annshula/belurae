import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/** Monogram icon until the final logo artwork is delivered. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#3e5242",
          color: "#faf7f2",
          fontSize: 300,
          fontFamily: "serif",
          letterSpacing: "-0.02em",
        }}
      >
        B
      </div>
    ),
    size,
  );
}
