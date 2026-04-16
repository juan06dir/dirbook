import { ImageResponse } from "next/og";

export const size        = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#000000",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Círculo amarillo de fondo */}
        <div
          style={{
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: "#facc15",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Letra D */}
          <span
            style={{
              color: "#000000",
              fontSize: 240,
              fontWeight: 900,
              lineHeight: 1,
              fontFamily: "sans-serif",
              letterSpacing: "-8px",
              marginLeft: "-8px",
            }}
          >
            D
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
