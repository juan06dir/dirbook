import { ImageResponse } from "next/og";

export const size        = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: 36,
        }}
      >
        <div
          style={{
            width: 130,
            height: 130,
            borderRadius: "50%",
            background: "#facc15",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "#000000",
              fontSize: 84,
              fontWeight: 900,
              fontFamily: "sans-serif",
              lineHeight: 1,
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
