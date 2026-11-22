import { ImageResponse } from "next/og";

export const alt =
  "RutaSalud: compara opciones con claridad; los perfiles de demostración son simulados.";
export const size = {
  width: 1200,
  height: 630,
};
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
          justifyContent: "space-between",
          background: "#f3f6f9",
          color: "#1b2f49",
          padding: "64px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            color: "#066863",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 14,
              background: "#087c78",
              color: "#ffffff",
              fontSize: 36,
            }}
          >
            +
          </div>
          RutaSalud
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              maxWidth: 1010,
              fontSize: 60,
              lineHeight: 1.08,
              fontWeight: 750,
              letterSpacing: "-2px",
            }}
          >
            Compara opciones. Entiende la información. Tú decides qué sigue.
          </div>
          <div style={{ color: "#52657b", fontSize: 25 }}>
            Perfiles de demostración · datos simulados · sin reservas
          </div>
        </div>
        <div
          style={{
            alignSelf: "flex-start",
            borderRadius: 999,
            background: "#805c0a",
            color: "#ffffff",
            padding: "10px 18px",
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          Para pacientes en Ciudad de México
        </div>
      </div>
    ),
    size,
  );
}
