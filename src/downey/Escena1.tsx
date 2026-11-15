import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useEscena } from "../comun/timeline";
import { Destello, Plano } from "../stallone/escenario";
import { D, F_CIFRA, interp, prog, rebote } from "./estilo";
import { Robert, topDePie } from "./Personajes";
import { Look } from "./props";
import { Efecto, Rotulo } from "./ui";

const SUELO = 880;
const ROBERT_ALTO = 600;
const REJA_X = 560;
const REJA_ANCHO = 800;

export const Escena1: React.FC = () => {
  const f = useCurrentFrame();
  const { cue, dur } = useEscena("s1");
  const c = { entra: cue("entra"), recluso: cue("recluso"), num: cue("p50522"), nueve: cue("nueve"), prota: cue("protagoniza"), saga: cue("saga") };
  const numero = "P50522";
  const paso = Math.max(5, (c.entra - 22) / numero.length);
  const tGrabado = (i: number) => 10 + i * paso;
  const cierre = interp(f, [c.recluso - 4, c.num + 6], [1920, REJA_X], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2) });
  const k = ROBERT_ALTO / 460;
  const transforma = prog(f, c.nueve + 4, 24);

  const Pasillo = (
    <>
      <AbsoluteFill style={{ background: "linear-gradient(#6A7686, #4E5968)" }} />
      {[260, 960, 1660].map((x) => (
        <div key={x}>
          <div style={{ position: "absolute", left: x - 120, top: 70, width: 240, height: 18, borderRadius: 9, background: "#F4F8FF", boxShadow: "0 0 40px 10px rgba(230,240,255,0.6)" }} />
          <div style={{ position: "absolute", left: x - 260, top: 88, width: 520, height: SUELO - 88, background: "linear-gradient(rgba(235,242,255,0.22), transparent 80%)", clipPath: "polygon(38% 0, 62% 0, 100% 100%, 0 100%)" }} />
        </div>
      ))}
      {/* puertas de otras celdas al fondo */}
      {[70, 1580].map((x) => (
        <div key={x} style={{ position: "absolute", left: x, top: 300, width: 270, height: SUELO - 300, background: "#3E4652", border: "8px solid #59626F" }}>
          {new Array(5).fill(0).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: 20 + i * 52, top: 0, width: 10, height: "100%", background: "#6C7480" }} />
          ))}
        </div>
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: SUELO, bottom: 0, background: "linear-gradient(#7A828E, #5A626D)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: SUELO, height: 4, background: "rgba(0,0,0,0.25)" }} />
    </>
  );

  return (
    <AbsoluteFill style={{ background: D.negro }}>
      {/* A · la placa de recluso se graba */}
      <Plano desde={0} hasta={c.entra}>
        <AbsoluteFill style={{ background: "linear-gradient(135deg, #6C8EB4, #4E6E94)", transform: `scale(${1.06 - prog(f, 0, c.entra) * 0.06})` }}>
          <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 3px, transparent 3px 8px)" }} />
          <div style={{ position: "absolute", left: 1180, top: 0, width: 6, height: 1080, background: "#47668A" }} />
          <div style={{ position: "absolute", left: 360, top: 330, width: 1200, height: 420, borderRadius: 26, background: "linear-gradient(#F4F2EC, #DCD8CE)", boxShadow: "0 24px 50px rgba(0,0,0,0.35), inset 0 0 0 10px #C9C4B8", display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            {numero.split("").map((ch, i) => {
              const t = tGrabado(i);
              const p = rebote(f, t, 30, 14);
              return (
                <span key={i} style={{ fontFamily: F_CIFRA, fontWeight: 700, fontSize: 250, color: "#1D232B", opacity: f >= t ? 1 : 0, transform: `scale(${1.25 - 0.25 * p})`, display: "inline-block", textShadow: "0 2px 0 rgba(255,255,255,0.8), 0 -2px 0 rgba(0,0,0,0.35)" }}>
                  {ch}
                </span>
              );
            })}
          </div>
          {[0, 1].map((i) => (
            <div key={i} style={{ position: "absolute", left: 400 + i * 1080, top: 370, width: 30, height: 30, borderRadius: 15, background: "#9AA4AD", boxShadow: "inset 0 -4px 0 #6B747E" }} />
          ))}
        </AbsoluteFill>
        {numero.split("").map((_, i) => (
          <Efecto key={i} archivo="grabado" en={tGrabado(i)} vol={0.35} dur={10} />
        ))}
      </Plano>

      {/* B · en el pasillo; la reja se cierra DELANTE de él */}
      <Plano desde={c.entra} hasta={c.nueve}>
        {Pasillo}
        <div style={{ position: "absolute", left: 960 - 100 * k, top: topDePie(SUELO, ROBERT_ALTO) }}>
          <Robert alto={ROBERT_ALTO} ropa="preso" expresion="serio" luz="#DDE8FF" />
        </div>
        {/* reja (capa delantera) */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <rect x={cierre - 20} y={150} width={REJA_ANCHO + 40} height={22} fill="#39414C" />
          <rect x={cierre - 20} y={SUELO - 22} width={REJA_ANCHO + 40} height={22} fill="#39414C" />
          {new Array(12).fill(0).map((_, i) => (
            <g key={i}>
              <rect x={cierre + i * 70} y={150} width={16} height={SUELO - 150} fill="#3F4853" />
              <rect x={cierre + i * 70 + 3} y={150} width={4} height={SUELO - 150} fill="rgba(255,255,255,0.25)" />
            </g>
          ))}
        </svg>
        <Rotulo texto="CALIFORNIA · 1999" desde={c.entra + 6} hasta={c.nueve} />
        <Efecto archivo="reja" en={c.num + 4} vol={0.5} dur={50} />
      </Plano>

      {/* C · match cut: los barrotes se convierten en las líneas de una pantalla de cine */}
      <Plano desde={c.nueve} hasta={dur + 10} fundido={2}>
        <AbsoluteFill style={{ background: "linear-gradient(#2E3646, #1C222E)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: SUELO, bottom: 0, background: "#232A36" }} />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {new Array(12).fill(0).map((_, i) => {
            const w = 16 + transforma * 54;
            const color = transforma < 0.5 ? "#3F4853" : `rgba(240,244,255,${0.4 + transforma * 0.6})`;
            return <rect key={i} x={REJA_X + i * 70} y={150 + transforma * 20} width={w} height={SUELO - 150 - transforma * 260} fill={color} />;
          })}
        </svg>
        <div style={{ position: "absolute", left: REJA_X - 60, top: 120, width: REJA_ANCHO + 120, height: SUELO - 230, boxShadow: `0 0 ${200 * transforma}px ${60 * transforma}px rgba(220,230,255,0.35)`, opacity: transforma }} />
        {/* butacas (siluetas apoyadas en el suelo) */}
        {new Array(9).fill(0).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: 40 + i * 215, top: 900, width: 180, height: 180, borderRadius: "40px 40px 0 0", background: "#141922", boxShadow: "inset 0 6px 0 rgba(255,255,255,0.08)" }} />
        ))}
        <Destello en={c.prota} />
        <Efecto archivo="flash" en={c.prota} vol={0.35} dur={20} />
        {f >= c.saga - 6 ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", opacity: prog(f, c.saga - 6, 16), transform: `scale(${0.92 + 0.08 * prog(f, c.saga - 6, 20)})` }}>
            <span style={{ fontFamily: F_CIFRA, fontWeight: 700, fontSize: 150, color: "#1A1F28", letterSpacing: 10, textShadow: "0 0 30px rgba(255,255,255,0.6)" }}>RECLUSO P50522</span>
          </div>
        ) : null}
      </Plano>
      <Look />
    </AbsoluteFill>
  );
};
