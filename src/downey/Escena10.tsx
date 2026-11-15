import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useEscena } from "../comun/timeline";
import { Plano } from "../stallone/escenario";
import { D, F_CIFRA, interp, prog } from "./estilo";
import { HOMBRO_DER, HOMBRO_IZQ, Robert, resolverBrazo, topDePie } from "./Personajes";
import { Look, Mascara } from "./props";
import { Cita, PantallaFinal } from "./ui";

const SUELO = 920;
const MESA = 700;

export const Escena10: React.FC = () => {
  const f = useCurrentFrame();
  const { cue, dur } = useEscena("s10");
  const c = { giro: cue("giro"), villano: cue("villano"), anunciarlo: cue("anunciarlo"), nueva: cue("nueva"), creeis: cue("creéis"), contadnoslo: cue("contádnoslo") };
  const finalIni = dur - 150;
  const ALTO = 640;
  const k = ALTO / 460;
  const rx = 820;
  const rTop = topDePie(SUELO + 40, ALTO);
  // máscara: reposa en la mesa y luego sube entre sus manos
  const MW = 240;
  const mk = MW / 220;
  const reposo: [number, number] = [1040, MESA - 120 * mk];
  const alto: [number, number] = [rx + 100 * k - MW / 2, rTop - 150 * mk];
  const sube = interp(f, [c.villano - 6, c.villano + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2) });
  const coger = prog(f, c.villano - 26, 20);
  const mPos: [number, number] = [reposo[0] + (alto[0] - reposo[0]) * sube, reposo[1] + (alto[1] - reposo[1]) * sube];
  const bordeIzq: [number, number] = [mPos[0] + 26 * mk, mPos[1] + 80 * mk];
  const bordeDer: [number, number] = [mPos[0] + 194 * mk, mPos[1] + 80 * mk];
  const local = (p: [number, number]): [number, number] => [(p[0] - rx) / k, (p[1] - rTop) / k];
  const bIzq = coger > 0 ? resolverBrazo(HOMBRO_IZQ[0], HOMBRO_IZQ[1], -1, ...local(bordeIzq)) : { hombro: 6, codo: 4 };
  const bDer = coger > 0 ? resolverBrazo(HOMBRO_DER[0], HOMBRO_DER[1], 1, ...local(bordeDer)) : { hombro: 6, codo: 4 };
  const orbita = Math.sin((f / dur) * Math.PI) * 40;

  return (
    <AbsoluteFill style={{ background: D.negro }}>
      <Plano desde={0} hasta={c.creeis}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at 55% 45%, #2E5A40, ${D.verde} 70%)` }} />
        <AbsoluteFill style={{ transform: `translateX(${-orbita}px) scale(${1.02 + f * 0.00015})` }}>
          {/* muro de piedra */}
          <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 3px, transparent 3px 90px), repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0 3px, transparent 3px 180px)", opacity: 0.8 }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: SUELO, bottom: 0, background: "linear-gradient(#24392C, #142219)" }} />
          {/* mesa de piedra (patas en el suelo) */}
          <div style={{ position: "absolute", left: 860, top: MESA, width: 640, height: 40, background: "linear-gradient(#8A948E, #6A746E)", borderRadius: 6 }} />
          {[900, 1400].map((x) => (
            <div key={x} style={{ position: "absolute", left: x, top: MESA + 40, width: 60, height: SUELO - MESA - 40, background: "#5E6862" }} />
          ))}
          <div style={{ position: "absolute", left: 860, top: SUELO - 10, width: 640, height: 20, borderRadius: "50%", background: "rgba(0,0,0,0.35)" }} />
          {/* sombra de la máscara sobre la mesa mientras reposa */}
          <div style={{ position: "absolute", left: reposo[0] + 20, top: MESA - 8, width: MW - 40, height: 16, borderRadius: "50%", background: "rgba(0,0,0,0.4)", opacity: 1 - sube }} />
          <div style={{ position: "absolute", left: rx, top: rTop }}>
            <Robert alto={ALTO} vista="espalda" ropa="traje" brazoIzq={bIzq} brazoDer={bDer} luz="#9FD6B0" />
          </div>
          {/* máscara metálica lisa y genérica, con las manos delante */}
          <div style={{ position: "absolute", left: mPos[0], top: mPos[1] }}>
            <Mascara ancho={MW} inclinacion={(1 - sube) * 70} />
          </div>
          {coger > 0 ? (
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <circle cx={bordeIzq[0]} cy={bordeIzq[1]} r={9 * k} fill={D.piel} />
              <circle cx={bordeDer[0]} cy={bordeDer[1]} r={9 * k} fill={D.piel} />
            </svg>
          ) : null}
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at 60% 40%, rgba(120,220,160,0.18), transparent 60%)" }} />
        </AbsoluteFill>
        <Cita texto="Nueva máscara, misma misión" desde={c.nueva - 4} y={70} color="#E6F4EA" />
      </Plano>

      <Plano desde={c.creeis} hasta={dur + 10}>
        <AbsoluteFill style={{ background: D.negro }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: f >= finalIni ? 160 : 420, textAlign: "center", opacity: prog(f, c.creeis + 2, 16), transition: "none" }}>
          <span style={{ fontFamily: F_CIFRA, fontWeight: 700, fontSize: 150, color: D.acero, letterSpacing: 18, textShadow: "0 0 30px rgba(154,164,173,0.35)" }}>18 · 12 · 2026</span>
        </div>
        <PantallaFinal desde={finalIni} boton={Math.min(c.contadnoslo, finalIni)} />
      </Plano>
      <Look />
    </AbsoluteFill>
  );
};
