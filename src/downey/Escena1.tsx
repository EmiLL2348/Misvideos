import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useEscena } from "../comun/timeline";
import { Destello, Plano } from "../stallone/escenario";
import { D, F_CIFRA, interp, prog } from "./estilo";
import { HOMBRO_DER, HOMBRO_IZQ, Robert, resolverBrazo, topDePie } from "./Personajes";
import { Look } from "./props";
import { Efecto, Hud, Particulas } from "./ui";

const SUELO = 900;
const REJA_X = 560;
const REJA_ANCHO = 800;

/** Fallo de señal: franjas desplazadas en rojo/cian y destello. */
const Glitch: React.FC<{ en: number }> = ({ en }) => {
  const f = useCurrentFrame();
  const d = f - en;
  if (d < -6 || d > 6) return null;
  const fuerza = 1 - Math.abs(d) / 6;
  return (
    <AbsoluteFill style={{ zIndex: 50, pointerEvents: "none" }}>
      {new Array(9).fill(0).map((_, i) => {
        const s = (i * 7919 + f * 131) % 1000;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: ((s % 200) - 100) * fuerza,
              top: (s / 1000) * 1080,
              width: 1920,
              height: 20 + (s % 70),
              background: i % 2 ? `rgba(255,60,80,${0.35 * fuerza})` : `rgba(80,230,255,${0.35 * fuerza})`,
              mixBlendMode: "screen",
            }}
          />
        );
      })}
      <AbsoluteFill style={{ background: `rgba(255,255,255,${Math.max(0, 0.8 - Math.abs(d) * 0.25)})` }} />
    </AbsoluteFill>
  );
};

export const Escena1: React.FC = () => {
  const f = useCurrentFrame();
  const { cue, dur } = useEscena("s1");
  const c = { armadura: cue("armadura"), fue: cue("fue"), recluso: cue("recluso"), y1999: cue("1999"), actor: cue("actor"), prision: cue("prisión"), nueve: cue("nueve"), prota: cue("protagonizaba"), saga: cue("saga") };

  // A · el héroe de la armadura
  const ALTO_H = 700;
  const kh = ALTO_H / 460;
  const brillo = prog(f, c.armadura - 4, 14) * (0.85 + 0.15 * Math.sin(f / 5));

  // B · ficha policial: sostiene el cartel por los bordes
  const ALTO = 640;
  const k = ALTO / 460;
  const corte = c.recluso - 2;
  const bIzq = resolverBrazo(HOMBRO_IZQ[0], HOMBRO_IZQ[1], -1, 31, 232);
  const bDer = resolverBrazo(HOMBRO_DER[0], HOMBRO_DER[1], 1, 169, 232);
  const flashes = [c.recluso + 6, c.y1999 + 2];
  const cierre = interp(f, [c.prision - 6, c.prision + 10], [1920, REJA_X], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2) });
  const transforma = prog(f, c.nueve + 4, 24);

  const cartel = (
    <g>
      <rect x={-75} y={-10} width={150} height={84} rx={4} fill="#14171C" stroke="#C9CDD2" strokeWidth={2} />
      <text x={0} y={34} textAnchor="middle" fontFamily={F_CIFRA} fontWeight={700} fontSize={36} fill="#F4F2EC" letterSpacing={2}>
        P50522
      </text>
      <text x={0} y={60} textAnchor="middle" fontFamily={F_CIFRA} fontWeight={500} fontSize={13} fill="#C9CDD2" letterSpacing={1.5}>
        CALIFORNIA · 1999
      </text>
    </g>
  );

  return (
    <AbsoluteFill style={{ background: D.negro }}>
      {/* A · el héroe de la armadura más famosa del cine */}
      <Plano desde={0} hasta={corte}>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #2C4A6E, #0E1622 70%)" }} />
        {[-1, 1].map((s) => (
          <div key={s} style={{ position: "absolute", left: 960 + s * 260 - 200, top: 0, width: 400, height: SUELO, background: "linear-gradient(rgba(140,210,255,0.28), rgba(140,210,255,0.02))", clipPath: s < 0 ? "polygon(0 0, 30% 0, 100% 100%, 60% 100%)" : "polygon(70% 0, 100% 0, 40% 100%, 0 100%)" }} />
        ))}
        <div style={{ position: "absolute", left: 0, right: 0, top: SUELO, bottom: 0, background: "linear-gradient(#2A3A50, #141C28)" }} />
        <div style={{ position: "absolute", left: 960 - 300, top: SUELO - 20, width: 600, height: 40, borderRadius: "50%", background: "radial-gradient(rgba(140,210,255,0.35), transparent 70%)" }} />
        <div style={{ position: "absolute", left: 960 - 100 * kh, top: topDePie(SUELO, ALTO_H) }}>
          <Robert alto={ALTO_H} ropa="armadura" casco={1} brillo={brillo} brazoIzq={{ hombro: 16, codo: 8 }} brazoDer={{ hombro: 16, codo: 8 }} luz="#9FDcff" />
        </div>
        <Hud x={960} y={topDePie(SUELO, ALTO_H) + 52 * kh} r={150} desde={12} etiquetas={["ANALIZANDO…", f > c.fue ? "IDENTIDAD: RECLUSO" : "IDENTIDAD: ???"]} />
      </Plano>
      <Glitch en={corte} />
      <Efecto archivo="clac" en={corte - 2} vol={0.4} dur={10} />

      {/* B · ficha policial con regla de estatura */}
      <Plano desde={corte} hasta={c.nueve} fundido={2}>
        <AbsoluteFill style={{ background: "linear-gradient(#D9DDE2, #BFC5CC)" }} />
        {new Array(9).fill(0).map((_, i) => {
          const y = SUELO - 340 - i * 70;
          return (
            <div key={i}>
              <div style={{ position: "absolute", left: 0, right: 0, top: y, height: i % 2 ? 2 : 4, background: "#5A626C", opacity: 0.6 }} />
              {i % 2 === 0 ? <div style={{ position: "absolute", left: 40, top: y - 56, fontFamily: F_CIFRA, fontWeight: 700, fontSize: 48, color: "#5A626C" }}>{150 + i * 10}</div> : null}
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 0, right: 0, top: SUELO, bottom: 0, background: "linear-gradient(#8C939C, #6C737C)" }} />
        <div style={{ position: "absolute", left: 960 - 100 * k, top: topDePie(SUELO, ALTO) }}>
          <Robert alto={ALTO} ropa="preso" expresion="serio" brazoIzq={bIzq} brazoDer={bDer} objetoCentro={cartel} />
        </div>
        {flashes.map((t, i) => (
          <React.Fragment key={i}>
            <Destello en={t} dur={8} />
            <Efecto archivo="flash" en={t} vol={0.35} dur={15} />
          </React.Fragment>
        ))}
        {/* la reja se cierra delante (capa delantera) */}
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
        <Efecto archivo="reja" en={c.prision + 10} vol={0.5} dur={50} />
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
        {new Array(9).fill(0).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: 40 + i * 215, top: 900, width: 180, height: 180, borderRadius: "40px 40px 0 0", background: "#141922", boxShadow: "inset 0 6px 0 rgba(255,255,255,0.08)" }} />
        ))}
        <Destello en={c.prota} />
        <Efecto archivo="flash" en={c.prota} vol={0.35} dur={20} />
        <Particulas desde={c.prota} x={REJA_X} y={140} ancho={REJA_ANCHO} suelo={900} n={30} colores={["#FFFFFF", "#CFE4FF"]} tam={6} apagar />
        {f >= c.saga - 6 ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", opacity: prog(f, c.saga - 6, 16), transform: `scale(${0.92 + 0.08 * prog(f, c.saga - 6, 20)})` }}>
            <span
              style={{
                fontFamily: F_CIFRA,
                fontWeight: 700,
                fontSize: 160,
                letterSpacing: 10,
                backgroundImage: `linear-gradient(100deg, #AEB8C2 0%, #DDE3E8 ${30 + ((f - c.saga) * 3) % 80}%, #FFFFFF ${36 + ((f - c.saga) * 3) % 80}%, #DDE3E8 ${42 + ((f - c.saga) * 3) % 80}%, #AEB8C2 100%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                filter: "drop-shadow(0 4px 2px rgba(0,0,0,0.9)) drop-shadow(0 8px 22px rgba(0,0,0,0.7))",
              }}
            >
              RECLUSO P50522
            </span>
          </div>
        ) : null}
      </Plano>
      <Look />
    </AbsoluteFill>
  );
};
