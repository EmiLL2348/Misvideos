import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useEscena } from "../comun/timeline";
import { Plano } from "../stallone/escenario";
import { D, F_CIFRA, interp, prog } from "./estilo";
import { SiluetaD, topDePie } from "./Personajes";
import { COCHE_BASE, CocheDeportivo, CochePolicia, Look, Mazo } from "./props";
import { Efecto, Rotulo, caida } from "./ui";

const SUELO_CARRETERA = 880;
const MESA_Y = 760; // superficie de la mesa en el plano de titulares

const Titular: React.FC<{ texto: string; ancho?: number }> = ({ texto, ancho = 760 }) => (
  <div style={{ width: ancho, height: 150, background: "#F1ECE0", boxShadow: "0 6px 12px rgba(0,0,0,0.35)", padding: "14px 26px", position: "relative" }}>
    <div style={{ fontFamily: F_CIFRA, fontWeight: 700, fontSize: 64, color: "#1C1C1C", lineHeight: 1, letterSpacing: 1 }}>{texto}</div>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{ position: "absolute", left: 26 + i * 240, bottom: 16, width: 210, height: 34, background: "repeating-linear-gradient(#9A9488 0 4px, transparent 4px 9px)" }} />
    ))}
  </div>
);

export const Escena4: React.FC = () => {
  const f = useCurrentFrame();
  const { cue, dur } = useEscena("s4");
  const c = {
    junio: cue("junio"),
    cocaina: cue("sustancias"),
    espiral: cue("espiral"),
    controles: cue("controles"),
    meses: cue("meses"),
    y1999: cue("1999"),
    juez: cue("juez"),
    tres: cue("tres"),
  };
  const fase = f / 4;
  const rojo = Math.sin(fase) > 0;
  const anchoCoche = 700;
  const kC = anchoCoche / 600;

  // titulares: caen con gravedad y se apilan (cada uno 10 px más alto que el anterior)
  const titulares = [
    { t: "DETENIDO", en: c.controles - 6, x: 560, rot: -3 },
    { t: "VIOLA LA CONDICIONAL", en: c.meses - 6, x: 600, rot: 2 },
    { t: "OTRA VEZ", en: c.y1999 - 6, x: 580, rot: -1 },
  ];
  // mazo: baja acelerando y toca el bloque
  const golpeEn = c.juez + 6;
  const golpe = f < golpeEn - 8 ? 0 : f < golpeEn ? Math.pow((f - (golpeEn - 8)) / 8, 2) : f < golpeEn + 10 ? 1 - prog(f, golpeEn + 4, 6) * 0.15 : 0.85;
  const vibra = f >= golpeEn && f < golpeEn + 8 ? Math.sin((f - golpeEn) * 3) * (8 - (f - golpeEn)) : 0;

  return (
    <AbsoluteFill style={{ background: D.negro }}>
      {/* A · control en la carretera de la costa */}
      <Plano desde={0} hasta={c.cocaina}>
        <AbsoluteFill style={{ background: "linear-gradient(#2A3E5E, #4B6688 60%, #6B7FA0)" }} />
        <div style={{ position: "absolute", left: 1450, top: 120, width: 90, height: 90, borderRadius: "50%", background: "#F4F1E6", boxShadow: "0 0 60px 20px rgba(244,241,230,0.35)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, height: 200, background: "linear-gradient(#35537A, #2A4466)" }} />
        <div style={{ position: "absolute", left: 1380, top: 560, width: 230, height: 200, background: "linear-gradient(rgba(244,241,230,0.35), transparent)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 740, height: 30, background: "#8A9098" }} />
        {new Array(16).fill(0).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: i * 130, top: 720, width: 8, height: 40, background: "#B9BEC6" }} />
        ))}
        <div style={{ position: "absolute", left: 0, right: 0, top: 770, bottom: 0, background: "linear-gradient(#4A4F58, #33373E)" }} />
        {new Array(8).fill(0).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: i * 260 + 40, top: 960, width: 140, height: 10, background: "#E9E2C8" }} />
        ))}
        {/* reflejos de la sirena sobre el asfalto */}
        <div style={{ position: "absolute", left: 300, top: 790, width: 1500, height: 160, borderRadius: "50%", background: rojo ? "rgba(211,58,58,0.18)" : "rgba(58,107,211,0.18)" }} />
        <div style={{ position: "absolute", left: 260, top: SUELO_CARRETERA - COCHE_BASE * kC }}>
          <CocheDeportivo ancho={anchoCoche} color="#8C96A3" reflejo={rojo ? D.sirena : D.sirenaAzul} />
        </div>
        <div style={{ position: "absolute", left: 1180, top: SUELO_CARRETERA + 10 - 216 * (620 / 620) }}>
          <CochePolicia ancho={620} fase={fase} />
        </div>
        {/* agente junto a la ventanilla, de pie sobre el asfalto */}
        <div style={{ position: "absolute", left: 640, top: topDePie(SUELO_CARRETERA + 24, 420) }}>
          <SiluetaD alto={420} color="#1B2230" policia borde={rojo ? D.sirena : D.sirenaAzul} brazoIzq={{ hombro: 40, codo: -60 }} />
        </div>
        {/* las luces de la sirena bañan toda la escena */}
        <AbsoluteFill style={{ background: rojo ? "rgba(211,58,58,0.16)" : "rgba(58,107,211,0.18)", mixBlendMode: "screen" }} />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {[0, 1].map((i) => {
            const ang = (f * 9 + i * 180) % 360;
            return (
              <polygon
                key={i}
                points={`1490,${SUELO_CARRETERA - 170} ${1490 + Math.cos((ang * Math.PI) / 180) * 1600},${SUELO_CARRETERA - 170 + Math.sin((ang * Math.PI) / 180) * 500 - 120} ${1490 + Math.cos(((ang + 12) * Math.PI) / 180) * 1600},${SUELO_CARRETERA - 170 + Math.sin(((ang + 12) * Math.PI) / 180) * 500 + 120}`}
                fill={i ? "rgba(58,107,211,0.16)" : "rgba(211,58,58,0.16)"}
              />
            );
          })}
        </svg>
        <Rotulo texto="JUNIO · 1996" desde={c.junio - 4} hasta={c.cocaina} />
      </Plano>

      {/* B · la bolsa de pruebas reposa sobre el asiento */}
      <Plano desde={c.cocaina} hasta={c.espiral}>
        <AbsoluteFill style={{ background: "linear-gradient(#3A3036, #2A2228)" }} />
        <div style={{ position: "absolute", left: 160, top: 260, width: 1600, height: 300, borderRadius: "60px 60px 20px 20px", background: "linear-gradient(#6E4E44, #5A3E36)" }} />
        <div style={{ position: "absolute", left: 120, top: 560, width: 1680, height: 420, borderRadius: 40, background: "linear-gradient(#7A5A4E, #5E4238)" }} />
        {[480, 960, 1440].map((x) => (
          <div key={x} style={{ position: "absolute", left: x, top: 300, width: 6, height: 640, background: "rgba(0,0,0,0.18)" }} />
        ))}
        <div style={{ position: "absolute", left: 610, top: 600 - 16, width: 700, height: 30, borderRadius: "50%", background: "rgba(0,0,0,0.35)" }} />
        <div style={{ position: "absolute", left: 620, top: 300, width: 680, height: 300, borderRadius: 18, background: "rgba(235,240,245,0.55)", border: "4px solid rgba(255,255,255,0.8)", transform: `translateY(${(1 - prog(f, c.cocaina, 10)) * -6}px)` }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 36, background: "#C8302C", borderRadius: "14px 14px 0 0", color: "#FFF", fontFamily: F_CIFRA, fontWeight: 700, fontSize: 26, letterSpacing: 6, textAlign: "center", lineHeight: "36px" }}>EVIDENCIA</div>
          <svg width={680} height={260} style={{ position: "absolute", left: 0, top: 36 }}>
            {/* bolsitas selladas genéricas (sin mostrar sustancias ni utensilios) */}
            {[[90, 130], [200, 150], [320, 128]].map(([x, y], i) => (
              <g key={i} opacity={prog(f, c.cocaina + i * 5, 10)}>
                <rect x={x} y={y} width={90} height={64} rx={6} fill="rgba(255,255,255,0.55)" stroke="#C8CED6" strokeWidth={3} />
                <rect x={x} y={y + 8} width={90} height={6} fill="#C8302C" />
              </g>
            ))}
            <g opacity={prog(f, cue("pistola") - 4, 10)}>
              <path d="M490 140 L620 140 L620 166 L540 166 L530 210 L500 210 L508 166 L490 166 Z" fill="#2E3238" />
            </g>
          </svg>
        </div>
      </Plano>

      {/* C · titulares que caen y se apilan sobre la mesa */}
      <Plano desde={c.espiral} hasta={c.juez}>
        <AbsoluteFill style={{ background: "linear-gradient(#5A6270, #3E4552)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: MESA_Y, bottom: 0, background: "linear-gradient(#7A5A40, #5E4430)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: MESA_Y, height: 8, background: "rgba(0,0,0,0.25)" }} />
        {titulares.map((tt, i) => {
          const reposo = MESA_Y - 150 - i * 12;
          const y = caida(f, tt.en, -260, reposo, 14);
          if (f < tt.en) return null;
          return (
            <div key={tt.t} style={{ position: "absolute", left: tt.x, top: y, transform: `rotate(${tt.rot}deg)`, zIndex: i }}>
              <Titular texto={tt.t} />
            </div>
          );
        })}
        {titulares.map((tt, i) => (
          <Efecto key={i} archivo="sello" en={tt.en + 14} vol={0.25} dur={12} />
        ))}
      </Plano>

      {/* D · el mazo golpea la mesa (contacto real y vibración) */}
      <Plano desde={c.juez} hasta={dur + 10}>
        <AbsoluteFill style={{ background: "linear-gradient(#4A3A30, #2E241E)", transform: `translate(${vibra * 0.6}px, ${vibra}px)` }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 820, bottom: 0, background: "linear-gradient(#6E4A32, #4E3424)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 820, height: 8, background: "rgba(0,0,0,0.3)" }} />
          <div style={{ position: "absolute", left: 600, top: 820 - 150 * (720 / 360) }}>
            <Mazo golpe={golpe} ancho={720} />
          </div>
        </AbsoluteFill>
        <Efecto archivo="mazo" en={golpeEn} vol={0.6} dur={25} />
        {f >= c.tres - 4 ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", opacity: prog(f, c.tres - 4, 12) }}>
            <span style={{ fontFamily: F_CIFRA, fontWeight: 700, fontSize: 120, color: D.blanco, letterSpacing: 8, textShadow: "0 4px 18px rgba(0,0,0,0.7)" }}>3 AÑOS DE PRISIÓN</span>
          </div>
        ) : null}
      </Plano>
      <Look />
    </AbsoluteFill>
  );
};
export { interp };
