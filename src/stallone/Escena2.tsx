import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useEscena } from "../comun/timeline";
import { F_TITULO, P, clampI, prog, rebote, interp } from "./estilo";
import { Capa, Cielo, Edificios, Pelicula, Plano, Rotulo, Sfx, Vapor, sacudida } from "./escenario";
import { Silueta, Sly } from "./Personajes";

const Calle: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: -400, width: 3200, top: 880, height: 300, background: "linear-gradient(#2A2220, #151010)" }} />
    <div style={{ position: "absolute", left: -400, width: 3200, top: 870, height: 22, background: "#4A3A30" }} />
    {[200, 900, 1600, 2300].map((x) => (
      <div key={x} style={{ position: "absolute", left: x, top: 560, width: 12, height: 320, background: "#1A1210" }}>
        <div style={{ position: "absolute", left: -26, top: -20, width: 64, height: 26, borderRadius: 12, background: "#1A1210" }} />
        <div style={{ position: "absolute", left: -90, top: 0, width: 190, height: 300, background: "radial-gradient(ellipse at 50% 0%, rgba(255,200,120,0.35), transparent 70%)" }} />
      </div>
    ))}
    {[560, 1380, 2100].map((x) => (
      <div key={x} style={{ position: "absolute", left: x - 60, top: 960, width: 120, height: 24, borderRadius: "50%", background: "#0A0807" }} />
    ))}
  </>
);

const Recuerdo: React.FC<{ p: number }> = ({ p }) => (
  <div style={{ position: "absolute", left: 1200, top: 230, width: 520, height: 520, borderRadius: "50%", overflow: "hidden", opacity: p, transform: `scale(${0.8 + 0.2 * p})`, boxShadow: "0 0 0 10px rgba(242,227,198,0.6), 0 30px 80px rgba(0,0,0,0.6)", background: "radial-gradient(circle, #E9D2A6, #B98A55)" }}>
    <svg viewBox="0 0 520 520" width={520} height={520}>
      {/* cuna */}
      <path d="M80 330 Q260 300 440 330 L420 420 Q260 460 100 420 Z" fill="#7A5236" />
      <path d="M80 330 Q260 300 440 330" stroke="#5A3825" strokeWidth={10} fill="none" />
      {/* manta */}
      <path d="M150 300 Q260 250 400 290 Q420 330 390 360 Q260 380 160 360 Q130 330 150 300 Z" fill="#DCE8F2" />
      <path d="M170 315 Q260 290 380 310" stroke="#B9CDE0" strokeWidth={6} fill="none" />
      <path d="M175 340 Q260 318 375 335" stroke="#B9CDE0" strokeWidth={6} fill="none" />
      {/* gorrito */}
      <circle cx={210} cy={250} r={74} fill="#F2E3C6" />
      {/* carita */}
      <circle cx={214} cy={258} r={58} fill="#F1C7A4" />
      <path d="M186 254 Q194 260 202 254" stroke={P.tinta} strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M224 254 Q232 260 240 254" stroke={P.tinta} strokeWidth={4} fill="none" strokeLinecap="round" />
      <circle cx={213} cy={268} r={4} fill="#D9997A" />
      <path d="M205 282 Q213 288 221 282" stroke="#B4645A" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <circle cx={186} cy={274} r={9} fill="#F2A0A0" opacity={0.55} />
      <circle cx={242} cy={274} r={9} fill="#F2A0A0" opacity={0.55} />
      {/* manita */}
      <circle cx={276} cy={300} r={15} fill="#F1C7A4" />
      <path d="M150 200 Q210 160 270 200" stroke="#E2CFA8" strokeWidth={8} fill="none" />
    </svg>
    <div style={{ position: "absolute", left: 0, right: 0, top: 40, textAlign: "center", fontFamily: F_TITULO, fontWeight: 900, fontSize: 56, color: P.marron }}>1946</div>
  </div>
);

const PUERTAS = [620, 1320, 2020];
const SELLOS = ["NO", "NO", "SIGUIENTE"];

export const Escena2: React.FC = () => {
  const f = useCurrentFrame();
  const { cue, dur } = useEscena("s2");
  const c = { y1946: cue("1946"), parto: cue("parto"), durante: cue("durante"), castings: cue("castings") };
  const golpes = [cue("cerraran"), cue("puerta"), cue("vez")];

  // Plano A
  const camA = { x: interp(f, [0, c.durante], [0, 520], clampI), y: 0, zoom: interp(f, [0, c.durante], [1, 1.1], clampI) };

  // Plano B: Sly avanza por el pasillo y se detiene en cada puerta
  const llegadas = golpes.map((g, i) => Math.max(i === 0 ? c.durante + 10 : golpes[i - 1] + 8, g - 26));
  let slyX = interp(f, [c.durante, llegadas[0]], [80, PUERTAS[0] - 230], clampI);
  for (let i = 1; i < 3; i++) slyX = f > golpes[i - 1] + 4 ? interp(f, [golpes[i - 1] + 4, llegadas[i]], [PUERTAS[i - 1] - 230, PUERTAS[i] - 230], clampI) : slyX;
  const andando = golpes.some((g, i) => f > (i === 0 ? c.durante : golpes[i - 1] + 4) && f < llegadas[i]);
  const sk = sacudida(f, golpes, 16);
  const camBx = Math.max(0, Math.min(2600 - 1920, slyX - 600));

  return (
    <AbsoluteFill style={{ background: P.negro }}>
      <Plano desde={0} hasta={c.durante}>
        <Capa cam={camA} prof={0.05}>
          <Cielo arriba="#2A2236" abajo="#B97A45" />
        </Capa>
        <Capa cam={camA} prof={0.25}>
          <Edificios semilla={11} base={800} altoMin={320} altoMax={660} color="#3A2C34" encendidas={0.12} />
        </Capa>
        <Capa cam={camA} prof={0.55}>
          <Edificios semilla={29} base={880} altoMin={380} altoMax={600} color="#6A3626" colorVentana="#F2C779" encendidas={0.35} escaleras ladrillo anchoMin={220} anchoMax={360} />
        </Capa>
        <Capa cam={camA} prof={1}>
          <Calle />
          <Vapor x={560} y={960} />
          <Vapor x={1380} y={960} escala={1.2} />
          <Vapor x={2100} y={960} />
          <div style={{ position: "absolute", left: 1100, top: 700 }}>
            <Silueta altura={190} sombrero color="#120C0A" />
          </div>
        </Capa>
        <Rotulo texto="NUEVA YORK · 1946" desde={c.y1946 - 4} y={110} />
        {f >= c.parto - 6 ? <Recuerdo p={Math.min(prog(f, c.parto - 6, 20), 1 - prog(f, c.durante - 16, 14))} /> : null}
      </Plano>

      <Plano desde={c.durante} hasta={dur + 10}>
        <AbsoluteFill style={{ transform: `translate(${-camBx + sk.x}px, ${sk.y}px)` }}>
          {/* pared y suelo */}
          <div style={{ position: "absolute", left: 0, top: 0, width: 2600, height: 760, background: "linear-gradient(#6B5A45, #4E4032)" }} />
          <div style={{ position: "absolute", left: 0, top: 540, width: 2600, height: 220, background: "#3E3226" }} />
          <div style={{ position: "absolute", left: 0, top: 760, width: 2600, height: 340, background: "linear-gradient(#2A221C, #1A1410)" }} />
          {new Array(9).fill(0).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: i * 300 + 80, top: 110, width: 70, height: 20, borderRadius: 10, background: "#F7E1A8", boxShadow: "0 0 60px 30px rgba(247,225,168,0.25)" }} />
          ))}
          {PUERTAS.map((x, i) => {
            const g = golpes[i];
            const cierre = interp(f, [g - 3, g], [0, 1], clampI);
            const abierta = 1 - cierre;
            return (
              <div key={x}>
                <div style={{ position: "absolute", left: x - 130, top: 230, width: 260, height: 530, background: "#2A1C12", borderRadius: "6px 6px 0 0" }} />
                <div style={{ position: "absolute", left: x - 116, top: 244, width: 232, height: 516, background: `linear-gradient(90deg, #FFE7B0, #F2C779)`, opacity: abierta }} />
                <div
                  style={{
                    position: "absolute",
                    left: x - 116,
                    top: 244,
                    width: 232 * (0.18 + 0.82 * cierre),
                    height: 516,
                    background: "linear-gradient(90deg, #7A5236, #5A3825)",
                    boxShadow: "inset 0 0 0 10px #4A2C1A",
                  }}
                >
                  <div style={{ position: "absolute", right: 20, top: 260, width: 18, height: 18, borderRadius: 9, background: P.dorado, opacity: cierre }} />
                </div>
                <div style={{ position: "absolute", left: x - 90, top: 186, width: 180, height: 40, background: "#1A120D", color: P.crema, fontFamily: F_TITULO, fontWeight: 900, fontSize: 26, letterSpacing: 4, textAlign: "center", lineHeight: "40px" }}>CASTING</div>
                {/* foto de casting con sello */}
                <div style={{ position: "absolute", left: x + 170, top: 300, width: 190, height: 240, background: "#F2EEE6", padding: 12, transform: `rotate(${i % 2 ? 4 : -3}deg)`, boxShadow: "0 10px 20px rgba(0,0,0,0.4)" }}>
                  <div style={{ width: "100%", height: 170, background: "#BFB3A0", overflow: "hidden", position: "relative" }}>
                    <div style={{ position: "absolute", left: 18, top: 10 }}>
                      <Sly altura={330} expresion="decidido" />
                    </div>
                  </div>
                  {f >= g + 4 ? (
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "42%",
                        transform: `translate(-50%,-50%) rotate(-16deg) scale(${2 - rebote(f, g + 4, 30, 10)})`,
                        border: `7px solid ${P.ladrillo}`,
                        color: P.ladrillo,
                        fontFamily: F_TITULO,
                        fontWeight: 900,
                        fontSize: SELLOS[i].length > 3 ? 34 : 64,
                        padding: "2px 14px",
                        background: "rgba(242,238,230,0.5)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {SELLOS[i]}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
          {/* sillas con aspirantes */}
          {new Array(8).fill(0).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: 180 + i * 300, top: 600, transform: "scale(0.8)", transformOrigin: "50% 100%", opacity: 0.75 }}>
              <div style={{ position: "absolute", left: 0, top: 70, width: 110, height: 16, background: "#2A1C12" }} />
              <div style={{ position: "absolute", left: 6, top: 86, width: 10, height: 80, background: "#2A1C12" }} />
              <div style={{ position: "absolute", left: 94, top: 86, width: 10, height: 80, background: "#2A1C12" }} />
              {i % 3 !== 1 ? (
                <div style={{ position: "absolute", left: 4, top: -150 }}>
                  <Silueta altura={260} color="#2E241C" sombrero={i % 2 === 0} />
                </div>
              ) : null}
            </div>
          ))}
          <div style={{ position: "absolute", left: slyX, top: 470 }}>
            <Sly vista="perfil" altura={460} correr={andando ? f / 5 : undefined} expresion={f > golpes[1] ? "triste" : "decidido"} />
          </div>
        </AbsoluteFill>
        {golpes.map((g, i) => (
          <Sfx key={i} archivo="audio/stallone/portazo.mp3" en={g - 1} vol={0.8} dur={30} />
        ))}
      </Plano>
      <Pelicula tinte={f < c.durante ? "rgba(214,170,110,0.35)" : "rgba(214,170,110,0.2)"} />
    </AbsoluteFill>
  );
};
