import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useEscena } from "../comun/timeline";
import { Plano } from "../stallone/escenario";
import { D, interp, prog } from "./estilo";
import { CADERA, PIE_SENTADO, POSE, Robert, topSentado } from "./Personajes";
import { Barrotes, Calendario, Look } from "./props";
import { Polvo, Rotulo } from "./ui";

const SUELO = 900;
const ALTO = 560;

export const Escena5: React.FC = () => {
  const f = useCurrentFrame();
  const { cue, dur } = useEscena("s5");
  const c = { corcoran: cue("corcoran"), mismo: cue("mismo"), peor: cue("peor") };
  const k = ALTO / 460;
  // el asiento (colchón) queda exactamente a la altura de las rodillas → los pies tocan el suelo
  const asiento = SUELO - (PIE_SENTADO - CADERA) * k;
  const tachados = Math.floor(interp(f, [c.mismo + 10, dur - 10], [6, 24]));

  return (
    <AbsoluteFill style={{ background: D.negro }}>
      {/* A · vista aérea de la prisión en el desierto, al atardecer */}
      <Plano desde={0} hasta={c.mismo}>
        <AbsoluteFill style={{ transform: `scale(${1 + f * 0.0006})`, transformOrigin: "50% 60%" }}>
          <AbsoluteFill style={{ background: "linear-gradient(#E9A86A, #C9895A 30%, #B8865E 31%, #A47A54)" }} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            {/* recinto */}
            <polygon points="360,520 1560,520 1760,960 160,960" fill="#BFA98A" stroke="#7A6A56" strokeWidth={6} />
            <polygon points="330,500 1590,500 1800,980 120,980" fill="none" stroke="#9AA0A6" strokeWidth={4} strokeDasharray="10 6" />
            {/* bloques de celdas en 2.5D: cara superior clara, frontal más oscura */}
            {[
              [520, 600, 300, 110],
              [900, 600, 300, 110],
              [1280, 600, 220, 110],
              [560, 790, 360, 120],
              [1020, 790, 420, 120],
            ].map(([x, y, w, h], i) => (
              <g key={i}>
                <polygon points={`${x},${y} ${x + w},${y} ${x + w + 30},${y + 40} ${x + 30},${y + 40}`} fill="#D9D3C8" />
                <rect x={x + 30} y={y + 40} width={w} height={h - 40} fill="#9E968A" />
                {new Array(Math.floor(w / 40)).fill(0).map((_, j) => (
                  <rect key={j} x={x + 44 + j * 40} y={y + 56} width={16} height={10} fill="#4A4E56" />
                ))}
              </g>
            ))}
            {/* torres de vigilancia */}
            {[
              [360, 500],
              [1560, 500],
              [160, 940],
              [1760, 940],
            ].map(([x, y], i) => (
              <g key={i}>
                <rect x={x - 8} y={y - 120} width={16} height={120} fill="#6A6A6E" />
                <rect x={x - 34} y={y - 160} width={68} height={44} fill="#8A8A90" />
                <polygon points={`${x - 42},${y - 160} ${x + 42},${y - 160} ${x},${y - 190}`} fill="#5A5A60" />
                <ellipse cx={x + 8} cy={y + 2} rx={30} ry={6} fill="rgba(0,0,0,0.25)" />
              </g>
            ))}
          </svg>
          <AbsoluteFill style={{ background: "linear-gradient(rgba(255,180,110,0.2), transparent 50%)" }} />
        </AbsoluteFill>
        <Rotulo texto="CORCORAN · CALIFORNIA" desde={c.corcoran - 6} hasta={c.mismo} />
      </Plano>

      {/* B · la celda: sentado en el borde de la litera, barrotes delante */}
      <Plano desde={c.mismo} hasta={dur + 10}>
        <AbsoluteFill style={{ background: "linear-gradient(#7C8694, #5E6876)" }} />
        <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0 2px, transparent 2px 60px), repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0 2px, transparent 2px 120px)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: SUELO, bottom: 0, background: "linear-gradient(#8C939C, #6C737C)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: SUELO, height: 5, background: "rgba(0,0,0,0.3)" }} />
        {/* ventana alta y haz de luz con polvo */}
        <div style={{ position: "absolute", left: 1240, top: 120, width: 220, height: 120, background: "#FFF1D2", border: "10px solid #5A626E", boxShadow: "0 0 50px 10px rgba(255,236,200,0.6)" }}>
          {[60, 120].map((x) => (
            <div key={x} style={{ position: "absolute", left: x, top: 0, width: 8, height: "100%", background: "#5A626E" }} />
          ))}
        </div>
        <div style={{ position: "absolute", left: 600, top: 240, width: 900, height: SUELO - 240, background: "linear-gradient(rgba(255,240,205,0.35), rgba(255,240,205,0.12))", clipPath: "polygon(70% 0, 95% 0, 62% 100%, 18% 100%)" }} />
        <Polvo x={760} y={260} ancho={520} alto={560} n={44} />
        {/* calendario en la pared */}
        <div style={{ position: "absolute", left: 1500, top: 380, transform: `rotate(2deg)` }}>
          <Calendario tachados={tachados} />
        </div>
        {/* litera: patas en el suelo y colchón a la altura del asiento */}
        <div style={{ position: "absolute", left: 300, top: asiento - 6, width: 640, height: 40, borderRadius: 8, background: "#D3D8DE", boxShadow: "inset 0 -8px 0 #A9B0B8" }} />
        <div style={{ position: "absolute", left: 300, top: asiento + 34, width: 640, height: 14, background: "#6C7580" }} />
        {[300, 924].map((x) => (
          <div key={x} style={{ position: "absolute", left: x, top: asiento - 220, width: 16, height: SUELO - (asiento - 220), background: "#6C7580" }} />
        ))}
        <div style={{ position: "absolute", left: 300, top: asiento - 220, width: 640, height: 14, background: "#7A838E" }} />
        <div style={{ position: "absolute", left: 290, top: SUELO - 8, width: 660, height: 16, borderRadius: "50%", background: "rgba(0,0,0,0.28)" }} />
        <div style={{ position: "absolute", left: 640, top: topSentado(asiento, ALTO) }}>
          <Robert alto={ALTO} vista="sentado" ropa="preso" expresion={f > c.peor ? "triste" : "serio"} brazoIzq={POSE.manosRodillas.izq} brazoDer={POSE.manosRodillas.der} luz="#FFEBC8" />
        </div>
        {/* barrotes en la capa delantera */}
        <Barrotes x={0} ancho={1920} arriba={40} abajo={SUELO + 30} separacion={150} />
      </Plano>
      <Look />
    </AbsoluteFill>
  );
};
export { prog };
