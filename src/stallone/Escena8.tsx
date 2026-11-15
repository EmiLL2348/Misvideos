import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useEscena } from "../comun/timeline";
import { F_CIFRA, F_TITULO, P, clampI, prog, rebote, interp } from "./estilo";
import { Edificios, Libreta, Pelicula, Plano, Trofeo } from "./escenario";
import { Butkus, Sly, topButkus, topPersona } from "./Personajes";

const Guante: React.FC = () => (
  <svg viewBox="0 0 120 120" width={110} height={110}>
    <path d="M30 70 Q20 30 50 20 Q90 10 98 44 Q104 74 84 86 L44 92 Q32 90 30 70 Z" fill={P.ladrillo} stroke={P.crema} strokeWidth={6} />
    <path d="M30 62 Q14 58 18 42 Q24 32 36 38" fill={P.ladrillo} stroke={P.crema} strokeWidth={6} />
    <rect x={40} y={90} width={48} height={22} rx={6} fill={P.crema} />
  </svg>
);
const Cinta: React.FC = () => (
  <svg viewBox="0 0 120 120" width={110} height={110}>
    <path d="M10 50 Q60 34 110 50 L110 66 Q60 50 10 66 Z" fill={P.ladrillo} stroke={P.crema} strokeWidth={5} />
    <path d="M100 56 L118 96 M100 56 L96 100" stroke={P.ladrillo} strokeWidth={10} strokeLinecap="round" />
  </svg>
);

export const Escena8: React.FC = () => {
  const f = useCurrentFrame();
  const { cue, dur } = useEscena("s8");
  const c = { rambo: cue("rambo"), cuarenta: cue("cuarenta"), todo: cue("todo"), vosotros: cue("vosotros"), suscribios: cue("suscribíos") };
  const finalIni = dur - 150;
  const hitos = [
    { a: "1976", t: "EL DEBUT", en: 4, edad: 0, Ico: Guante },
    { a: "1982", t: "RAMBO", en: c.rambo - 4, edad: 0.2, Ico: Cinta },
    { a: "2015", t: "OTRA NOMINACIÓN", en: c.cuarenta, edad: 0.85, Ico: () => <Trofeo alto={110} /> },
  ];
  const linea = interp(f, [4, c.cuarenta + 10], [0, 1], clampI);
  const cerrar = prog(f, c.todo + 20, 24);
  const boton = Math.min(c.suscribios - 6, finalIni);

  return (
    <AbsoluteFill style={{ background: P.negro }}>
      <Plano desde={0} hasta={c.todo}>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #4A3424, #1A120D 75%)" }} />
        <div style={{ position: "absolute", left: 220, top: 680, width: 1480 * linea, height: 8, background: P.ocre, borderRadius: 4 }} />
        {hitos.map((h, i) => {
          if (f < h.en) return null;
          const p = rebote(f, h.en, 30, 12);
          const x = 300 + i * 660;
          return (
            <div key={h.a} style={{ position: "absolute", left: x - 200, top: 40, width: 400, textAlign: "center", opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 40}px)` }}>
              <div style={{ height: 520, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                <Sly altura={480} expresion={i === 2 ? "neutral" : "decidido"} edad={h.edad} />
              </div>
              <div style={{ position: "absolute", left: 140, top: 600, width: 120, height: 120, display: "grid", placeItems: "center", borderRadius: 60, background: "#2A1C12", border: `5px solid ${P.ocre}` }}>
                <h.Ico />
              </div>
              <div style={{ marginTop: 230, fontFamily: F_CIFRA, fontWeight: 800, fontSize: 64, color: P.crema }}>{h.a}</div>
              <div style={{ fontFamily: F_TITULO, fontWeight: 900, fontSize: 32, color: P.ocre, letterSpacing: 2 }}>{h.t}</div>
            </div>
          );
        })}
      </Plano>

      <Plano desde={c.todo} hasta={c.vosotros}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #3A2A1E 0%, ${P.negro} 65%)`, alignItems: "center", justifyContent: "center" }}>
          <div style={{ transform: `translateX(${-225 * cerrar}px) scale(${1 + (f - c.todo) * 0.001})` }}>
            <Libreta abrir={1 - cerrar} ancho={900} titulo="LA APUESTA" />
          </div>
        </AbsoluteFill>
      </Plano>

      <Plano desde={c.vosotros} hasta={dur + 10}>
        <AbsoluteFill style={{ background: "linear-gradient(#3A2A4A, #C8603A 60%, #F2A040)" }} />
        <div style={{ position: "absolute", left: 1100, top: 470, width: 260, height: 260, borderRadius: "50%", background: "#FFD08A", boxShadow: "0 0 160px 60px rgba(255,190,110,0.6)" }} />
        <div style={{ position: "absolute", left: 0, top: 0 }}>
          <Edificios semilla={41} base={780} altoMin={180} altoMax={520} color="#2A1A24" colorVentana="#F2C779" encendidas={0.15} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 760, bottom: 0, background: "#1A0E10" }} />
        <div style={{ position: "absolute", left: 640, top: 360, transform: `translateX(${f >= finalIni ? -prog(f, finalIni, 20) * 0 : 0}px)` }}>
          <Sly vista="espalda" altura={520} luz={P.dorado} />
        </div>
        <div style={{ position: "absolute", left: 860, top: topButkus(topPersona(0, 0) + 360 + (396 / 420) * 520, 300), transform: "scaleX(-1)" }}>
          <Butkus ancho={300} sentado />
        </div>
        {f >= finalIni ? (
          <div style={{ position: "absolute", left: 90, top: 70, fontFamily: F_TITULO, fontWeight: 900, fontSize: 72, color: P.crema, opacity: prog(f, finalIni, 16), textShadow: "0 6px 20px rgba(0,0,0,0.6)" }}>
            ¡GRACIAS POR VER!
          </div>
        ) : null}
        {f >= boton ? (
          <div style={{ position: "absolute", left: 90, top: 860, transform: `scale(${rebote(f, boton, 30, 10) * (1 + 0.04 * Math.sin(f / 6))})`, transformOrigin: "0 50%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "20px 46px", borderRadius: 999, background: P.ladrillo, boxShadow: `0 0 40px ${P.ladrillo}`, fontFamily: F_TITULO, fontWeight: 900, fontSize: 52, color: P.crema, letterSpacing: 3 }}>
              <svg width={50} height={50} viewBox="0 0 56 56" style={{ transform: `rotate(${Math.sin(f / 3) * (f - boton < 40 ? 18 : 4)}deg)` }}>
                <path d="M28 6 C18 6 13 14 13 24 V34 L7 42 H49 L43 34 V24 C43 14 38 6 28 6 Z" fill={P.crema} />
                <circle cx={28} cy={48} r={6} fill={P.crema} />
              </svg>
              SUSCRÍBETE
            </div>
          </div>
        ) : null}
      </Plano>
      <Pelicula vineta={0.75} tinte="rgba(255,200,150,0.1)" />
    </AbsoluteFill>
  );
};
