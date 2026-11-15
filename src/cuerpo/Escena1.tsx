import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { Humano, POSES, mezclarBrazo } from "./Humano";
import { C, FUENTE_TITULO, prog, rebote } from "./tema";
import { useEscena } from "./timeline";
import { FondoBase, IconoCopo, IconoLuna, IconoMontana, IconoPlaneta } from "./ui";

const ICONOS = [IconoPlaneta, IconoMontana, IconoCopo, IconoLuna];
const CX = 960;
const CY = 650;

export const Escena1: React.FC = () => {
  const f = useCurrentFrame();
  const { cue } = useEscena("s1");
  const cLimites = cue("límites");
  const cCuatro = cue("cuatro");

  const aparece = rebote(f, 4);
  const heroe = prog(f, 20, 18);
  const expresion = f >= cLimites && f < cLimites + 75 ? "sorprendido" : "feliz";

  const nivel = 1 - 0.85 * prog(f, cLimites - 4, 40);
  const colorBat = interpolateColors(nivel, [0.15, 0.6, 1], [C.coral, C.ambar, C.cian]);
  const parpadeoBat = nivel < 0.25 ? 0.6 + 0.4 * Math.abs(Math.sin(f / 5)) : 1;

  const orbita = (i: number) => {
    const a = f * 0.014 + (i * Math.PI) / 2;
    const p = rebote(f, 26 + i * 7);
    const pulso = 1 + 0.3 * Math.max(0, Math.sin(Math.min(Math.PI, ((f - cCuatro - i * 6) / 14) * Math.PI)));
    const prof = (Math.sin(a) + 1) / 2;
    return {
      x: CX + Math.cos(a) * 600,
      y: CY + Math.sin(a) * 150,
      s: (0.78 + 0.3 * prof) * p * (f >= cCuatro + i * 6 ? pulso : 1),
      delante: Math.sin(a) > 0,
      o: Math.min(1, p),
    };
  };

  const renderIcono = (i: number) => {
    const o = orbita(i);
    const Ico = ICONOS[i];
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: o.x - 80,
          top: o.y - 80,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: C.nocheClaro,
          border: `5px solid ${C.nocheBorde}`,
          display: "grid",
          placeItems: "center",
          transform: `scale(${o.s})`,
          opacity: o.o,
        }}
      >
        <Ico tam={110} />
      </div>
    );
  };

  return (
    <AbsoluteFill>
      <FondoBase />
      {/* título */}
      <div
        style={{
          position: "absolute",
          top: 70,
          width: "100%",
          textAlign: "center",
          fontFamily: FUENTE_TITULO,
          fontWeight: 900,
          fontSize: 104,
          color: C.blanco,
          lineHeight: 1,
        }}
      >
        {["¿CUÁNTO", "AGUANTA", "TU", "CUERPO?"].map((w, i) => {
          const p = rebote(f, 10 + i * 5);
          return (
            <span
              key={w}
              style={{
                display: "inline-block",
                margin: "0 16px",
                transform: `translateY(${(1 - p) * 60}px) scale(${0.8 + 0.2 * p})`,
                opacity: Math.min(1, p * 1.4),
                color: w === "CUERPO?" ? C.cian : C.blanco,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      {[0, 1, 2, 3].filter((i) => !orbita(i).delante).map(renderIcono)}
      {/* batería */}
      <div
        style={{
          position: "absolute",
          left: CX - 150,
          top: CY - 270,
          width: 300,
          height: 520,
          opacity: prog(f, 8, 20) * 0.95,
        }}
      >
        <div style={{ position: "absolute", left: 105, top: 0, width: 90, height: 30, borderRadius: 10, background: C.gris }} />
        <div
          style={{
            position: "absolute",
            top: 26,
            inset: "26px 0 0 0",
            borderRadius: 40,
            border: `10px solid ${C.gris}`,
            padding: 12,
            display: "flex",
            alignItems: "flex-end",
            background: "rgba(24,41,63,0.7)",
          }}
        >
          <div style={{ width: "100%", height: `${nivel * 100}%`, borderRadius: 24, background: colorBat, opacity: 0.55 * parpadeoBat }} />
        </div>
      </div>
      {/* humano */}
      <div
        style={{
          position: "absolute",
          left: CX - 160,
          top: CY - 240 + Math.sin(f / 15) * 6,
          transform: `scale(${aparece})`,
          transformOrigin: "50% 100%",
        }}
      >
        <Humano
          altura={512}
          expresion={expresion}
          capa={heroe}
          brazoIzq={mezclarBrazo(POSES.reposo.izq, POSES.heroe.izq, heroe)}
          brazoDer={mezclarBrazo(POSES.reposo.der, POSES.heroe.der, heroe)}
        />
      </div>
      {[0, 1, 2, 3].filter((i) => orbita(i).delante).map(renderIcono)}
      {/* etiqueta de límites */}
      <div
        style={{
          position: "absolute",
          left: CX + 190,
          top: CY - 230,
          fontFamily: FUENTE_TITULO,
          fontWeight: 900,
          fontSize: 54,
          color: C.coral,
          opacity: prog(f, cLimites, 12),
          transform: `rotate(-6deg) scale(${interpolate(prog(f, cLimites, 12), [0, 1], [1.6, 1])})`,
        }}
      >
        LÍMITES
      </div>
    </AbsoluteFill>
  );
};
