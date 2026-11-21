import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useEscena } from "../comun/timeline";
import { Plano } from "../stallone/escenario";
import { D, interp, prog } from "./estilo";
import { AVANCE_POR_RADIAN, HOMBRO_IZQ, Robert, SiluetaD, topDePie } from "./Personajes";
import { COCHE_BASE, CocheDeportivo, Look } from "./props";
import { Efecto, Rotulo } from "./ui";

const SUELO_PLATO = 900;
const SUELO_PLAYA = 920;
const ORILLA = 1240; // x donde empieza el agua

export const Escena7: React.FC = () => {
  const f = useCurrentFrame();
  const { cue, dur } = useEscena("s7");
  const c = { gibson: cue("gibson"), y2003: cue("2003"), susan: cue("susan"), clara: cue("clara"), julio: cue("julio"), tiro: cue("tiró"), oceano: cue("océano") };

  // A · mano en el hombro
  const ALTO = 600;
  const k = ALTO / 460;
  const rx = 900;
  const rTop = topDePie(SUELO_PLATO, ALTO);
  const hombro: [number, number] = [rx + HOMBRO_IZQ[0] * k + 6, rTop + (HOMBRO_IZQ[1] - 10) * k];
  const sx = 560;
  const sTop = topDePie(SUELO_PLATO - 30, 620);
  const sk = 620 / 460;
  const sHombro: [number, number] = [sx + 132 * sk, sTop + 112 * sk];
  const apoyo = prog(f, c.gibson - 10, 16);
  const mano: [number, number] = [sHombro[0] + (hombro[0] - sHombro[0]) * apoyo, sHombro[1] + 120 + (hombro[1] - sHombro[1] - 120) * apoyo];
  const codo: [number, number] = [(sHombro[0] + mano[0]) / 2 + 10, Math.max(sHombro[1], mano[1]) + 40];

  // C · playa: camina hasta la orilla sin resbalar y lanza la bolsa
  const ALTO_P = 520;
  const kp = ALTO_P / 460;
  const velFase = 0.13;
  const finCaminar = c.tiro - 10;
  const inicioCaminar = c.julio + 6;
  const metaX = ORILLA - 170 * kp;
  const fase = Math.max(0, Math.min(f, finCaminar) - inicioCaminar) * velFase;
  const recorrido = (finCaminar - inicioCaminar) * velFase * AVANCE_POR_RADIAN * kp;
  const x0 = metaX - recorrido;
  const xRobert = x0 + fase * AVANCE_POR_RADIAN * kp;
  const caminando = f > inicioCaminar && f < finCaminar;
  const pasoLargo = Math.PI * AVANCE_POR_RADIAN * kp;
  const nHuellas = Math.max(0, Math.floor((xRobert - x0) / (pasoLargo / 1)));
  // bolsa en parábola con gravedad
  const tLanz = f - c.tiro;
  const mano0: [number, number] = [xRobert + 150 * kp, topDePie(SUELO_PLAYA, ALTO_P) + 150 * kp];
  const destino = ORILLA + 420;
  const tVuelo = 26;
  const g = 1.1;
  const vy = ((SUELO_PLAYA - 6 - mano0[1]) - 0.5 * g * tVuelo * tVuelo) / tVuelo;
  const bolsa = tLanz >= 0 && tLanz <= tVuelo ? [mano0[0] + ((destino - mano0[0]) * tLanz) / tVuelo, mano0[1] + vy * tLanz + 0.5 * g * tLanz * tLanz] : null;
  const tSalp = tLanz - tVuelo;

  return (
    <AbsoluteFill style={{ background: D.negro }}>
      {/* A · plató vacío de noche: una mano se apoya SOBRE el hombro */}
      <Plano desde={0} hasta={c.y2003}>
        <AbsoluteFill style={{ background: "linear-gradient(#34405A, #222B3E)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: SUELO_PLATO, bottom: 0, background: "linear-gradient(#3A4458, #2A3244)" }} />
        <div style={{ position: "absolute", left: 640, top: 0, width: 760, height: SUELO_PLATO, background: "linear-gradient(rgba(220,230,255,0.28), rgba(220,230,255,0.06))", clipPath: "polygon(40% 0, 60% 0, 100% 100%, 0 100%)" }} />
        <div style={{ position: "absolute", left: sx, top: sTop }}>
          <SiluetaD alto={620} color="#121722" borde="#AFC4E8" brazoDer={{ hombro: -10, codo: 0 }} />
        </div>
        <div style={{ position: "absolute", left: rx, top: rTop }}>
          <Robert alto={ALTO} vista="espalda" ropa="casual" luz="#CFE0FF" />
        </div>
        {/* brazo y mano de la silueta (delante de Robert, apoyada en su hombro) */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <path d={`M${sHombro[0]} ${sHombro[1]} Q${codo[0]} ${codo[1]} ${mano[0]} ${mano[1]}`} stroke="#121722" strokeWidth={26} fill="none" strokeLinecap="round" />
          <ellipse cx={mano[0]} cy={mano[1] + 4} rx={16} ry={12} fill="#121722" />
        </svg>
      </Plano>

      {/* B · Susan a contraluz y Robert decide */}
      <Plano desde={c.y2003} hasta={c.julio - 34}>
        {f < c.clara ? (
          <>
            <AbsoluteFill style={{ background: "radial-gradient(circle at 62% 40%, #FFE2B0, #C88E5A 40%, #4A3A40 75%)" }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: SUELO_PLATO, bottom: 0, background: "#3A2E34" }} />
            <div style={{ position: "absolute", left: 1060, top: topDePie(SUELO_PLATO, 600), opacity: prog(f, c.susan - 12, 16) }}>
              <SiluetaD alto={600} tipo="mujer" carpeta color="#1E1A22" borde={D.amanecer} brazoDer={{ hombro: 18, codo: -96 }} />
            </div>
          </>
        ) : (
          <AbsoluteFill style={{ background: "linear-gradient(#4A5670, #2E3648)" }}>
            <div style={{ position: "absolute", left: 960 - 100 * (1800 / 460), top: 170, transform: `scale(${1 + (f - c.clara) * 0.0006})`, transformOrigin: "50% 20%" }}>
              <Robert alto={1800} ropa="casual" expresion="decidido" luz="#FFE2B0" sombra={false} />
            </div>
          </AbsoluteFill>
        )}
      </Plano>

      {/* C · amanecer en la costa del Pacífico */}
      <Plano desde={c.julio - 34} hasta={dur + 10} fundido={20}>
        <AbsoluteFill style={{ background: `linear-gradient(${D.cielo}, #F7D3A0 55%, ${D.amanecer} 62%)` }} />
        <div style={{ position: "absolute", left: 1500, top: 470, width: 200, height: 200, borderRadius: "50%", background: "#FFF2C8", boxShadow: "0 0 120px 50px rgba(255,220,150,0.6)" }} />
        {/* mar: del horizonte a la orilla, a la derecha */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, height: 300, background: "linear-gradient(#5F9CCB, #4A86B8)" }} />
        <div style={{ position: "absolute", left: 1420, top: 640, width: 360, height: 220, borderRadius: "50%", background: "radial-gradient(ellipse at 50% 0%, rgba(255,236,190,0.55), transparent 70%)" }} />
        {/* arena seca a la izquierda, mojada junto al agua */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <path d={`M0 760 L${ORILLA - 60} 760 Q${ORILLA} 800 ${ORILLA + 40 + Math.sin(f / 20) * 30} ${SUELO_PLAYA} L1920 ${SUELO_PLAYA + 20} L1920 1080 L0 1080 Z`} fill="#E3C894" />
          <path d={`M${ORILLA - 80} 840 Q${ORILLA + 20} 870 ${ORILLA + 60 + Math.sin(f / 20) * 30} ${SUELO_PLAYA} L${ORILLA - 120} ${SUELO_PLAYA} Z`} fill="#CDAF7A" />
          {[0, 1, 2].map((i) => {
            const t = ((f + i * 40) % 120) / 120;
            return <path key={i} d={`M${ORILLA + 20 + t * 40} ${780 + t * 60} Q${ORILLA + 300} ${770 + t * 60} 1920 ${770 + t * 70}`} stroke="rgba(255,255,255,0.7)" strokeWidth={5} fill="none" opacity={1 - t} />;
          })}
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: SUELO_PLAYA, bottom: 0, background: "linear-gradient(#D9BC86, #C7A872)" }} />
        {/* coche aparcado sobre la arena compacta */}
        <div style={{ position: "absolute", left: 40, top: SUELO_PLAYA - COCHE_BASE * (560 / 600) }}>
          <CocheDeportivo ancho={560} color="#6E7E92" />
        </div>
        {/* huellas que quedan marcadas en la arena */}
        {new Array(nHuellas).fill(0).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: x0 + 100 * kp + i * pasoLargo + (i % 2 ? 26 : 0), top: SUELO_PLAYA - 4 + (i % 2 ? 6 : 0), width: 30, height: 9, borderRadius: "50%", background: "rgba(140,104,60,0.55)" }} />
        ))}
        <div style={{ position: "absolute", left: xRobert, top: topDePie(SUELO_PLAYA, ALTO_P) }}>
          <Robert alto={ALTO_P} vista="perfil" ropa="casual" paso={caminando ? fase : undefined} luz="#FFE6B8" />
        </div>
        {bolsa ? <div style={{ position: "absolute", left: bolsa[0] - 18, top: bolsa[1] - 18, width: 36, height: 30, borderRadius: 8, background: "#EDEFF2", border: "3px solid #BFC5CC", transform: `rotate(${tLanz * 20}deg)` }} /> : null}
        {tSalp >= 0 && tSalp < 60 ? (
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            {[0, 1, 2].map((i) => {
              const r = (tSalp - i * 8) * 3;
              return r > 0 ? <ellipse key={i} cx={destino} cy={SUELO_PLAYA - 6} rx={r * 2} ry={r * 0.4} stroke="rgba(255,255,255,0.8)" strokeWidth={4} fill="none" opacity={Math.max(0, 1 - r / 90)} /> : null;
            })}
            {tSalp < 18
              ? new Array(10).fill(0).map((_, i) => {
                  const a = Math.PI * (0.15 + (i / 9) * 0.7);
                  const v = 7 + (i % 3) * 2;
                  const px = destino - Math.cos(a) * v * tSalp;
                  const py = SUELO_PLAYA - 10 - Math.sin(a) * v * tSalp + 0.6 * tSalp * tSalp;
                  return <circle key={i} cx={px} cy={Math.min(py, SUELO_PLAYA - 6)} r={5} fill="#FFFFFF" opacity={1 - tSalp / 18} />;
                })
              : null}
          </svg>
        ) : null}
        <Rotulo texto="JULIO · 2003" desde={c.julio + 4} />
        <Efecto archivo="olas" en={c.julio - 30} vol={0.3} dur={dur - c.julio + 40} />
        <Efecto archivo="sello" en={c.tiro + tVuelo} vol={0.2} dur={12} />
      </Plano>
      <Look />
    </AbsoluteFill>
  );
};
export { interp };
