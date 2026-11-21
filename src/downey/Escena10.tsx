import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useEscena } from "../comun/timeline";
import { Plano } from "../stallone/escenario";
import { D, F_CIFRA, interp, prog } from "./estilo";
import { Encapuchado, manoEncapuchado, HOMBRO_DER, HOMBRO_IZQ, Robert, resolverBrazo, topDePie, mezclar } from "./Personajes";
import { Look, Mascara } from "./props";
import { Cita, Efecto, PantallaFinal, Particulas } from "./ui";

const SUELO = 920;
const MESA = 700;

export const Escena10: React.FC = () => {
  const f = useCurrentFrame();
  const { cue, dur } = useEscena("s10");
  const c = { saga: cue("saga"), doom: cue("doom"), giro: cue("giro"), villano: cue("villano"), anunciarlo: cue("anunciarlo"), nueva: cue("nueva"), creeis: cue("creéis"), contadnoslo: cue("contádnoslo") };
  const finalIni = dur - 150;
  const ALTO = 640;
  const k = ALTO / 460;
  const rx = 820;
  const rTop = topDePie(SUELO + 40, ALTO);
  // máscara: reposa en la mesa y luego sube entre sus manos
  const MW = 240;
  const mk = MW / 220;
  const reposo: [number, number] = [rx + 100 * k - MW / 2, MESA - 120 * mk];
  const alto: [number, number] = [rx + 100 * k - MW / 2, rTop + 52 * k - 80 * mk];
  const sube = interp(f, [c.saga - 4, c.doom - 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2) });
  const coger = prog(f, c.saga - 28, 20);
  const mPos: [number, number] = [reposo[0] + (alto[0] - reposo[0]) * sube, reposo[1] + (alto[1] - reposo[1]) * sube];
  const bordeIzq: [number, number] = [mPos[0] + 26 * mk, mPos[1] + 80 * mk];
  const bordeDer: [number, number] = [mPos[0] + 194 * mk, mPos[1] + 80 * mk];
  const local = (p: [number, number]): [number, number] => [(p[0] - rx) / k, (p[1] - rTop) / k];
  const bIzq = mezclar({ hombro: 6, codo: 4 }, resolverBrazo(HOMBRO_IZQ[0], HOMBRO_IZQ[1], -1, ...local(bordeIzq)), coger);
  const bDer = mezclar({ hombro: 6, codo: 4 }, resolverBrazo(HOMBRO_DER[0], HOMBRO_DER[1], 1, ...local(bordeDer)), coger);
  const orbita = Math.sin((f / dur) * Math.PI) * 40;
  // trono: levanta la mano y detiene un rayo
  const manoV = prog(f, c.doom + 14, 14);
  const rayoEn = Math.max(c.doom + 30, c.villano - 2);
  const escD = 1 + Math.max(0, f - c.doom) * 0.0008;
  const vTop = SUELO - 452 * (760 / 460);
  const kV = 760 / 460;
  const palmaSvg = manoEncapuchado(1);
  const palmaPx: [number, number] = [960 + (960 - (760 * 300) / 460 / 2 + palmaSvg[0] * kV - 960) * escD, vTop + 760 + (vTop + palmaSvg[1] * kV - vTop - 760) * escD];

  return (
    <AbsoluteFill style={{ background: D.negro }}>
      <Plano desde={0} hasta={c.creeis}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at 55% 45%, #2E5A40, ${D.verde} 70%)` }} />
        <AbsoluteFill style={{ transform: `translateX(${-orbita}px) scale(${1.02 + f * 0.00015})` }}>
          {/* muro de piedra */}
          <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 3px, transparent 3px 90px), repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0 3px, transparent 3px 180px)", opacity: 0.8 }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: SUELO, bottom: 0, background: "linear-gradient(#24392C, #142219)" }} />
          {/* Robert detrás de la mesa, de frente: coge la máscara y se la acerca a la cara */}
          <div style={{ position: "absolute", left: rx, top: rTop }}>
            <Robert alto={ALTO} vista="frente" ropa="traje" expresion="serio" brazoIzq={bIzq} brazoDer={bDer} />
          </div>
          {/* mesa de piedra (patas en el suelo) */}
          <div style={{ position: "absolute", left: 700, top: MESA, width: 640, height: 40, background: "linear-gradient(#8A948E, #6A746E)", borderRadius: 6 }} />
          {[740, 1240].map((x) => (
            <div key={x} style={{ position: "absolute", left: x, top: MESA + 40, width: 60, height: SUELO - MESA - 40, background: "#5E6862" }} />
          ))}
          <div style={{ position: "absolute", left: 700, top: SUELO - 10, width: 640, height: 20, borderRadius: "50%", background: "rgba(0,0,0,0.35)" }} />
          {/* sombra de la máscara sobre la mesa mientras reposa */}
          <div style={{ position: "absolute", left: reposo[0] + 20, top: MESA - 8, width: MW - 40, height: 16, borderRadius: "50%", background: "rgba(0,0,0,0.4)", opacity: 1 - sube }} />
          {/* máscara metálica lisa y genérica, con las manos delante */}
          <div style={{ position: "absolute", left: mPos[0], top: mPos[1] }}>
            <Mascara ancho={MW} inclinacion={(1 - sube) * 70} ojos={sube * 0.8} />
          </div>
          {coger >= 1 ? (
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <circle cx={bordeIzq[0]} cy={bordeIzq[1]} r={9 * k} fill={D.piel} />
              <circle cx={bordeDer[0]} cy={bordeDer[1]} r={9 * k} fill={D.piel} />
            </svg>
          ) : null}
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at 60% 40%, rgba(120,220,160,0.18), transparent 60%)" }} />
        </AbsoluteFill>
        <Cita texto="Nueva máscara, misma misión" desde={c.nueva - 4} y={70} color="#E6F4EA" />
      </Plano>

      {/* niebla baja que se desliza (capa de partículas) */}
      {f < c.creeis ? (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          {new Array(7).fill(0).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: ((i * 330 + f * (1 + (i % 3))) % 2400) - 400, top: 760 + (i % 3) * 60, width: 700, height: 160, borderRadius: "50%", background: "rgba(170,230,195,0.12)" }} />
          ))}
        </AbsoluteFill>
      ) : null}

      {/* revelación: el encapuchado con la máscara puesta, entre relámpagos */}
      <Plano desde={c.doom - 2} hasta={c.creeis}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, #2E5A40, ${D.verde} 65%, #050807)` }} />
        {/* salón del trono: suelo en perspectiva, columnas, ejército de autómatas al fondo */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, bottom: 0, background: "linear-gradient(#1A2C20, #0C1610 60%, #08100B)" }} />
        {[120, 420, 1380, 1680].map((x, i) => (
          <div key={x} style={{ position: "absolute", left: x, top: 0, width: 110, height: 660 + (i === 0 || i === 3 ? 60 : 0), background: "linear-gradient(90deg, #2A3A30, #1A241E 70%)" }} />
        ))}
        {[0, 1].map((fila) =>
          new Array(fila ? 9 : 12).fill(0).map((_, i) => {
            const a = fila ? 250 : 190;
            const piso = fila ? 760 : 700;
            const x = (fila ? 120 : 60) + i * (fila ? 200 : 155);
            if (x > 700 && x < 1180) return null;
            return (
              <div key={`${fila}-${i}`} style={{ position: "absolute", left: x, top: piso - a * (452 / 460) }}>
                <svg viewBox="0 0 200 460" width={(a * 200) / 460} height={a} style={{ overflow: "visible" }}>
                  <ellipse cx={100} cy={452} rx={46} ry={7} fill="rgba(0,0,0,0.4)" />
                  <path d="M66 112 Q68 96 100 94 Q132 96 134 112 L130 240 L70 240 Z M72 236 L128 236 L124 446 L104 446 L100 300 L96 446 L76 446 Z" fill="#202A24" />
                  <path d="M66 112 L48 260 M134 112 L152 260" stroke="#202A24" strokeWidth={22} strokeLinecap="round" />
                  <path d="M74 54 Q74 14 100 12 Q126 14 126 54 L124 84 Q100 96 76 84 Z" fill="#2A3630" />
                  <rect x={84} y={46} width={10} height={5} fill={`rgba(140,255,180,${0.5 + 0.5 * Math.sin(f / 5 + i)})`} />
                  <rect x={106} y={46} width={10} height={5} fill={`rgba(140,255,180,${0.5 + 0.5 * Math.sin(f / 5 + i)})`} />
                </svg>
              </div>
            );
          }),
        )}
        {/* trono de piedra detrás del encapuchado */}
        <div style={{ position: "absolute", left: 960 - 260, top: 120, width: 520, height: SUELO - 120, background: "linear-gradient(90deg, #26342C, #3A4A40 50%, #1E2A23)", clipPath: "polygon(10% 8%, 50% 0, 90% 8%, 92% 100%, 8% 100%)", boxShadow: "0 0 80px rgba(120,255,170,0.2)" }} />
        <div style={{ position: "absolute", left: 960 - 200, top: 150, width: 400, height: 10, background: `rgba(120,255,170,${0.4 + 0.3 * Math.sin(f / 7)})`, boxShadow: "0 0 20px rgba(120,255,170,0.7)" }} />
        <div style={{ position: "absolute", left: 960 - 300, top: SUELO - 20, width: 600, height: 40, borderRadius: "50%", background: "rgba(0,0,0,0.45)" }} />
        <div style={{ position: "absolute", left: 960 - (760 * 300) / 460 / 2, top: SUELO - 452 * (760 / 460), transform: `scale(${escD})`, transformOrigin: "50% 100%" }}>
          <Encapuchado alto={760} ojos={prog(f, c.doom + 4, 14)} mano={manoV} />
        </div>
        {/* el rayo baja del cielo y se detiene en su mano */}
        {f >= rayoEn && f < rayoEn + 16 ? (
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <polyline points={`1760,0 1600,70 1650,110 ${palmaPx[0] + 120},${palmaPx[1] - 120} ${palmaPx[0] + 150},${palmaPx[1] - 70} ${palmaPx[0] + 16},${palmaPx[1] - 10}`} fill="none" stroke="rgba(230,245,255,0.95)" strokeWidth={10} strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 18px #BFE6FF)" }} />
            <circle cx={palmaPx[0]} cy={palmaPx[1]} r={70 + (f - rayoEn) * 6} fill="none" stroke="rgba(150,255,190,0.8)" strokeWidth={6} opacity={1 - (f - rayoEn) / 16} />
          </svg>
        ) : null}
        <Particulas desde={rayoEn} x={palmaPx[0] - 60} y={palmaPx[1]} ancho={120} suelo={SUELO} n={40} colores={["#E8FFF0", "#8CFFB8", "#FFFFFF"]} tam={6} apagar />
        <AbsoluteFill style={{ background: `rgba(225,245,255,${Math.max(0, 1 - Math.abs(f - rayoEn) / 5) * 0.6})` }} />
        <Efecto archivo="flash" en={rayoEn} vol={0.45} dur={20} />
        {new Array(8).fill(0).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: ((i * 300 + f * 2) % 2400) - 400, top: 820 + (i % 3) * 50, width: 700, height: 150, borderRadius: "50%", background: "rgba(170,230,195,0.14)" }} />
        ))}
        <AbsoluteFill style={{ background: `rgba(220,255,235,${Math.max(0, 1 - Math.abs(f - c.doom) / 4) * 0.85 + (Math.abs(f - c.doom - 9) < 2 ? 0.5 : 0)})` }} />
        <Cita texto="Nueva máscara, misma misión" desde={c.nueva - 4} y={70} color="#E6F4EA" />
      </Plano>
      <Efecto archivo="reja" en={c.doom} vol={0.35} dur={40} />

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
