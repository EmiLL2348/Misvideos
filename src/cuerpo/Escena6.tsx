import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Humano, POSES, mezclarBrazo } from "./Humano";
import { C, FUENTE_TITULO, clampI, prog, rebote } from "./tema";
import { PANTALLA_FINAL_SEG, FPS, useEscena } from "./timeline";
import { Dato, FondoBase, IconoCopo, IconoLuna, IconoMontana, IconoPlaneta } from "./ui";

const CELDAS = [
  { Ico: IconoPlaneta, n: "15 s", t: "Espacio", col: C.cian },
  { Ico: IconoMontana, n: "1/3 O₂", t: "Everest", col: C.ambar },
  { Ico: IconoCopo, n: "1-10-1", t: "Agua helada", col: C.frio },
  { Ico: IconoLuna, n: "11 días", t: "Sin dormir", col: C.coral },
];

export const Escena6: React.FC = () => {
  const f = useCurrentFrame();
  const { cue, dur } = useEscena("s6");
  const finalIni = dur - PANTALLA_FINAL_SEG * FPS;
  const cCual = cue("cuál");
  const cComent = cue("comentarios");
  const cSuscr = Math.min(cue("suscríbete") - 6, finalIni);

  const senalar = prog(f, 24, 16);
  const salidaGrid = prog(f, finalIni, 18);
  const enFinal = f >= finalIni;
  const boton = rebote(f, cSuscr, 30, 10);
  const pulso = 1 + 0.05 * Math.sin(f / 6);
  const click = interpolate(f, [cSuscr + 22, cSuscr + 28, cSuscr + 34], [1, 0.9, 1], clampI);

  return (
    <AbsoluteFill>
      <FondoBase />
      {/* humano */}
      <div style={{ position: "absolute", left: 210 + (enFinal ? 0 : 0), top: 230 + Math.sin(f / 16) * 6 }}>
        <Humano
          altura={500}
          expresion={f > cCual && f < cComent ? "sorprendido" : "feliz"}
          brazoIzq={POSES.reposo.izq}
          brazoDer={mezclarBrazo(POSES.reposo.der, POSES.senalar.der, senalar)}
          semilla={1}
        />
      </div>
      {f >= cComent ? (
        <div style={{ position: "absolute", left: 560, top: 170, transform: `scale(${rebote(f, cComent)})`, transformOrigin: "0 100%" }}>
          <svg width={150} height={130} viewBox="0 0 150 130">
            <path d="M14 14 H136 V92 H64 L34 120 V92 H14 Z" fill={C.cian} stroke={C.blanco} strokeWidth={7} strokeLinejoin="round" />
            {[50, 75, 100].map((x, i) => (
              <circle key={x} cx={x} cy={53} r={8} fill={C.noche} opacity={0.4 + 0.6 * Math.abs(Math.sin(f / 6 + i))} />
            ))}
          </svg>
        </div>
      ) : null}
      {/* botón suscríbete */}
      {f >= cSuscr ? (
        <div style={{ position: "absolute", left: 140, top: 790, transform: `scale(${boton * pulso * click})` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "22px 48px", borderRadius: 999, background: C.coral, boxShadow: `0 0 50px ${C.coral}88`, fontFamily: FUENTE_TITULO, fontWeight: 900, fontSize: 52, color: C.blanco }}>
            <svg width={56} height={56} viewBox="0 0 56 56" style={{ transform: `rotate(${Math.sin(f / 3) * (f - cSuscr < 40 ? 18 : 4)}deg)` }}>
              <path d="M28 6 C18 6 13 14 13 24 V34 L7 42 H49 L43 34 V24 C43 14 38 6 28 6 Z" fill={C.blanco} />
              <circle cx={28} cy={48} r={6} fill={C.blanco} />
            </svg>
            SUSCRÍBETE
          </div>
          {/* cursor */}
          <svg width={70} height={80} viewBox="0 0 70 80" style={{ position: "absolute", right: -10, bottom: -50, opacity: prog(f, cSuscr + 10, 8), transform: `translate(${(1 - prog(f, cSuscr + 10, 12)) * 120}px, ${(1 - prog(f, cSuscr + 10, 12)) * 80}px)` }}>
            <path d="M8 4 L8 62 L24 48 L34 72 L44 68 L34 44 L56 44 Z" fill={C.blanco} stroke={C.noche} strokeWidth={4} strokeLinejoin="round" />
          </svg>
        </div>
      ) : null}
      {/* cuadrícula 2×2 */}
      <div
        style={{
          position: "absolute",
          left: 820,
          top: 130,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 36,
          opacity: 1 - salidaGrid,
          transform: `scale(${1 - 0.15 * salidaGrid})`,
        }}
      >
        {CELDAS.map(({ Ico, n, t, col }, i) => {
          const p = rebote(f, 6 + i * 6);
          const resalta = f >= cCual ? Math.max(0, Math.sin(((f - cCual - i * 10) / 14) * Math.PI)) * (f - cCual - i * 10 < 14 && f - cCual - i * 10 > 0 ? 1 : 0) : 0;
          return (
            <div
              key={t}
              style={{
                width: 460,
                height: 340,
                borderRadius: 32,
                background: C.nocheClaro,
                border: `5px solid ${col}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transform: `scale(${p * (1 + 0.08 * resalta)}) rotate(${resalta * 2}deg)`,
                boxShadow: `0 0 ${20 + resalta * 50}px ${col}44`,
              }}
            >
              <Ico tam={120} />
              <div style={{ fontFamily: FUENTE_TITULO, fontWeight: 900, fontSize: 70, color: col }}>{n}</div>
              <Dato tam={30} color={C.gris} style={{ fontWeight: 700 }}>
                {t.toUpperCase()}
              </Dato>
            </div>
          );
        })}
      </div>
      {/* pantalla final */}
      {enFinal ? (
        <div style={{ position: "absolute", left: 120, top: 80, opacity: prog(f, finalIni + 6, 14) }}>
          <div style={{ fontFamily: FUENTE_TITULO, fontWeight: 900, fontSize: 70, color: C.blanco }}>
            ¡GRACIAS POR VER!
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
