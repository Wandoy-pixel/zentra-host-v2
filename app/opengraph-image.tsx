import { ImageResponse } from "next/og";

export const alt = "Zentra Host - Infrastruktur Web Generasi Baru";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0f766e 0%, #14b8a6 35%, #6366f1 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          padding: "60px",
        }}
      >
        {/* Decorative grid overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 0%, transparent 50%)",
            display: "flex",
          }}
        />

        {/* Logo block */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
            marginBottom: "30px",
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: "140px",
              height: "140px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "white",
              borderRadius: "32px",
              color: "#0f766e",
              fontSize: 100,
              fontWeight: 900,
              letterSpacing: "-4px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
            }}
          >
            Z
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              color: "white",
            }}
          >
            <div
              style={{
                fontSize: 96,
                fontWeight: 900,
                letterSpacing: "-3px",
                lineHeight: 1,
              }}
            >
              Zentra
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 600,
                opacity: 0.85,
                marginTop: "6px",
              }}
            >
              Host
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: "white",
            textAlign: "center",
            marginBottom: "50px",
            letterSpacing: "-1px",
            zIndex: 1,
          }}
        >
          Infrastruktur Web Generasi Baru
        </div>

        {/* Stats badges row */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "16px 32px",
              background: "rgba(255,255,255,0.18)",
              border: "2px solid rgba(255,255,255,0.4)",
              borderRadius: "999px",
              color: "white",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            99.99% Uptime
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "16px 32px",
              background: "rgba(255,255,255,0.18)",
              border: "2px solid rgba(255,255,255,0.4)",
              borderRadius: "999px",
              color: "white",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            SSL Gratis
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "16px 32px",
              background: "rgba(255,255,255,0.18)",
              border: "2px solid rgba(255,255,255,0.4)",
              borderRadius: "999px",
              color: "white",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            24/7 Support
          </div>
        </div>

        {/* Footer URL */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            color: "rgba(255,255,255,0.8)",
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: "1px",
          }}
        >
          zentra-host-v2.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
