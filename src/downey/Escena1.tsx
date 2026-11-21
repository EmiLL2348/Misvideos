import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useEscena } from "../comun/timeline";
import { Destello, Plano } from "../stallone/escenario";
import { D, F_CIFRA, interp, prog } from "./estilo";
import { HOMBRO_DER, HOMBRO_IZQ, Robert, resolverBrazo, topDePie } from "./Personajes";
import { Look } from "./props";
import { Efecto } from "./ui";
import { CampoBatalla, DesiertoExplosion, Guantelete } from "./heroe";

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
  const c = { universo: cue("universo"), hombre: cue("hombre"), chasquido: cue("chasquido"), antes: cue("antes"), recluso: cue("recluso"), celda: cue("celda"), california: cue("california"), heroe: cue("héroe"), cine: cue("cine"), historia: cue("historia") };

  // A · el guantelete en primer plano: el chasquido
  const chasq = prog(f, c.chasquido - 2, 3);
  const empuje = 1 + Math.min(f, c.chasquido) * 0.0012;
  const GA = 1150;
  const gk = GA / 560;

  // B · ficha policial: sostiene el cartel por los bordes
  const ALTO = 640;
  const k = ALTO / 460;
  const corte = c.antes - 2;
  const bIzq = resolverBrazo(HOMBRO_IZQ[0], HOMBRO_IZQ[1], -1, 31, 232);
  const bDer = resolverBrazo(HOMBRO_DER[0], HOMBRO_DER[1], 1, 169, 232);
  const flashes = [c.recluso + 4, c.california];
  const cierre = interp(f, [c.celda - 6, c.celda + 10], [1920, REJA_X], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2) });
  const finB = c.heroe - 4;

  const cartel = (
    <g>
      <rect x={-75} y={-34} width={150} height={108} rx={4} fill="#14171C" stroke="#C9CDD2" strokeWidth={2} />
      <text x={0} y={-14} textAnchor="middle" fontFamily={F_CIFRA} fontWeight={500} fontSize={14} fill="#C9CDD2" letterSpacing={1}>
        DOWNEY JR., ROBERT
      </text>
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
      {/* A · gancho: el guantelete de las seis gemas y el chasquido */}
      <Plano desde={0} hasta={corte}>
        <CampoBatalla suelo={980} />
        <AbsoluteFill style={{ transform: `scale(${empuje})` }}>
          <div style={{ position: "absolute", left: 960 - 200 * gk, top: 520 - 300 * gk }}>
            <Guantelete prepara={prog(f, c.chasquido - 16, 10)} alto={GA} chasquido={chasq} relaja={prog(f, c.chasquido + 3, 9)} carga={0.6 + 0.4 * prog(f, c.universo - 6, 20)} />
          </div>
        </AbsoluteFill>
        {f >= c.chasquido ? (
          <div style={{ position: "absolute", left: 960 - (f - c.chasquido) * 70, top: 420 - (f - c.chasquido) * 70, width: (f - c.chasquido) * 140, height: (f - c.chasquido) * 140, borderRadius: "50%", border: "14px solid rgba(255,240,210,0.9)", boxShadow: "0 0 80px 20px rgba(255,200,120,0.6)", opacity: Math.max(0, 1 - (f - c.chasquido) / 18) }} />
        ) : null}
        <Destello en={c.chasquido + 1} dur={16} color="#FFF6E6" />
      </Plano>
      <Efecto archivo="chispas" en={0} vol={0.25} dur={60} />
      <Efecto archivo="clac" en={c.chasquido} vol={0.6} dur={10} />
      <Efecto archivo="flash" en={c.chasquido + 1} vol={0.5} dur={25} />
      <Glitch en={corte} />

      {/* B · ficha policial con regla de estatura */}
      <Plano desde={corte} hasta={finB} fundido={2}>
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
        <Efecto archivo="reja" en={c.celda + 10} vol={0.5} dur={50} />
      </Plano>

      {/* C · el héroe: brazos abiertos y explosiones detrás */}
      <Plano desde={finB} hasta={dur + 10} fundido={3}>
        <DesiertoExplosion estalla={c.heroe + 8} />
        <Efecto archivo="mazo" en={c.heroe + 8} vol={0.6} dur={30} />
        <Efecto archivo="chispas" en={c.heroe + 10} vol={0.3} dur={40} />
        {f >= c.historia - 6 ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 36, textAlign: "center", opacity: prog(f, c.historia - 6, 16), transform: `scale(${0.92 + 0.08 * prog(f, c.historia - 6, 20)})` }}>
            <span
              style={{
                fontFamily: F_CIFRA,
                fontWeight: 700,
                fontSize: 130,
                letterSpacing: 10,
                backgroundImage: `linear-gradient(100deg, #AEB8C2 0%, #DDE3E8 ${30 + ((f - c.historia) * 3) % 80}%, #FFFFFF ${36 + ((f - c.historia) * 3) % 80}%, #DDE3E8 ${42 + ((f - c.historia) * 3) % 80}%, #AEB8C2 100%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                filter: "drop-shadow(0 4px 2px rgba(0,0,0,0.9)) drop-shadow(0 8px 22px rgba(0,0,0,0.7))",
              }}
            >
              ROBERT DOWNEY JR.
            </span>
            <div style={{ fontFamily: F_CIFRA, fontWeight: 700, fontSize: 64, color: "#F2D27A", letterSpacing: 12, marginTop: 6, textShadow: "0 4px 12px rgba(0,0,0,0.8)" }}>RECLUSO P50522</div>
          </div>
        ) : null}
      </Plano>
      <Look />
    </AbsoluteFill>
  );
};
