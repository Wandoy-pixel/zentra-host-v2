import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

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
          background:
            "linear-gradient(135deg, #14b8a6 0%, #6366f1 100%)",
          borderRadius: "8px",
          color: "white",
          fontSize: 22,
          fontWeight: 900,
          fontFamily: "system-ui, sans-serif",
          letterSpacing: "-1px",
        }}
      >
        Z
      </div>
    ),
    {
      ...size,
    }
  );
}
