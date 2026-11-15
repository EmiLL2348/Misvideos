import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Humano } from "./Humano";
import { C, FUENTE_TEXTO, FUENTE_TITULO, clampI, numero, prog, rebote } from "./tema";
import { useEscena } from "./timeline";
import { Corazon, Dato, EtiquetaEscena, FondoBase, Panel, Pulmones, Tic, Titular } from "./ui";

const BASE_Y = 930;
const CIMA_Y = 200;
const CIMA = 8849;
const altY = (a: number) => BASE_Y - (a / CIMA) * (BASE_Y - CIMA_Y);
const altX = (a: number) => 380 + (a / CIMA) * 400;

export const Escena3: React.FC = () => {
  const f = useCurrentFrame();
  const { cue, dur } = useEscena("s3");
  const c = {
    aire: cue("aire"),
    tercio: cue("tercio"),
    golpe: cue("golpe"),
    ocho: cue("8"),
    zona: cue("zona"),
    resiste: cue("resiste"),
  };

  // subida: rápida hasta 8,000 m, luego muy lenta
  const tramo1Fin = c.ocho;
  const alt =
    f < tramo1Fin
      ? interpolate(f, [12, tramo1Fin], [0, 8000], clampI)
      : interpolate(f, [tramo1Fin, Math.max(tramo1Fin + 30, dur - 20)], [8000, CIMA], clampI);
  const enZona = alt >= 8000;
  const fase = f < tramo1Fin ? f * 0.32 : tramo1Fin * 0.32 + (f - tramo1Fin) * 0.1;
  const zonaP = prog(f, c.ocho, 18);
  const bpm = interpolate(f, [c.ocho, c.ocho + 60], [80, 150], clampI);

  // tics cada 1,000 m
  const tics: number[] = [];
  for (let m = 1000; m <= 8000; m += 1000) tics.push(interpolate(m, [0, 8000], [12, tramo1Fin]));

  const lineas = [
    { a: 0, t: "0 m · PLAYA" },
    { a: 5000, t: "5,000 m" },
    { a: 8000, t: "8,000 m" },
    { a: CIMA, t: "8,849 m · CIMA" },
  ];

  return (
    <AbsoluteFill>
      <FondoBase tono={C.cian} />
      {/* montañas lejanas */}
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <path
          d={`M${-100 + ((f * 0.3) % 50)} 1080 L300 760 L520 880 L780 640 L1040 860 L1300 700 L1600 900 L2000 720 L2000 1080 Z`}
          fill="#14243A"
        />
      </svg>
      <EtiquetaEscena num={2} titulo="La cima del Everest" />

      {/* gráfica de altitud */}
      <svg width={1000} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {/* franja zona de la muerte */}
        <rect x={340} y={altY(CIMA) - 40} width={600} height={altY(8000) - altY(CIMA) + 40} fill={C.coral} opacity={0.12 + zonaP * 0.4} />
        <path d={`M370 ${BASE_Y} L${altX(CIMA)} ${altY(CIMA)} L900 560 L960 ${BASE_Y} Z`} fill="#27405F" stroke={C.gris} strokeWidth={5} />
        <path d={`M${altX(6600)} ${altY(6600)} L${altX(CIMA)} ${altY(CIMA)} L838 360 L812 350 L790 380 L770 340 Z`} fill={C.blanco} opacity={0.9} />
        <line x1={330} y1={BASE_Y} x2={330} y2={CIMA_Y - 30} stroke={C.blanco} strokeWidth={6} strokeLinecap="round" />
        {lineas.map((l, i) => {
          const p = prog(f, 6 + i * 6, 14);
          return (
            <g key={l.a} opacity={p}>
              <line x1={316} y1={altY(l.a)} x2={altX(l.a) + 10} y2={altY(l.a)} stroke={C.gris} strokeWidth={3} strokeDasharray="10 10" />
              <text x={300} y={altY(l.a) + 10} textAnchor="end" fontFamily={FUENTE_TEXTO} fontWeight={700} fontSize={28} fill={l.a === 8000 && zonaP > 0 ? C.coral : C.blanco}>
                {l.t}
              </text>
            </g>
          );
        })}
        <polygon points={`${altX(CIMA) - 4},${altY(CIMA) - 4} ${altX(CIMA) - 4},${altY(CIMA) - 60} ${altX(CIMA) + 40},${altY(CIMA) - 46} ${altX(CIMA) - 4},${altY(CIMA) - 32}`} fill={C.coral} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 350,
          top: altY(CIMA) - 34,
          fontFamily: FUENTE_TITULO,
          fontWeight: 900,
          fontSize: 30,
          color: C.blanco,
          background: C.coral,
          padding: "4px 14px",
          borderRadius: 10,
          opacity: prog(f, c.zona, 12),
          transform: `scale(${0.6 + 0.4 * rebote(f, c.zona)})`,
          transformOrigin: "0 50%",
        }}
      >
        ZONA DE LA MUERTE
      </div>
      {/* humano escalando */}
      <div
        style={{
          position: "absolute",
          left: altX(alt) - 62,
          top: altY(alt) - 198,
          transform: `rotate(${enZona ? 4 : 10}deg)`,
          transformOrigin: "50% 100%",
        }}
      >
        <Humano altura={200} ropa="montana" expresion={enZona ? "cansado" : "normal"} caminar={fase} brazoIzq={{ hombro: 20 + Math.sin(fase) * 14, codo: -20 }} brazoDer={{ hombro: 20 - Math.sin(fase) * 14, codo: -20 }} semilla={3} />
      </div>
      {tics.map((t, i) => (
        <Tic key={i} en={t} volumen={0.3} />
      ))}

      {/* comparación de pulmones */}
      <Panel desde={6} hasta={dur + 20} style={{ left: 1040, top: 140, width: 820 }}>
        <div style={{ display: "flex", justifyContent: "space-between", textAlign: "center", opacity: prog(f, c.aire - 6, 14), transform: `translateY(${(1 - prog(f, c.aire - 6, 16)) * 40}px)` }}>
          <div>
            <Pulmones tam={330} puntos={30} color="#3D5A80" />
            <Dato tam={28} color={C.gris} style={{ fontWeight: 700 }}>
              NIVEL DEL MAR
            </Dato>
          </div>
          <div>
            <Pulmones tam={330} puntos={interpolate(f, [c.tercio - 4, c.tercio + 20], [30, 10], clampI)} color="#3D5A80" agitado={enZona} />
            <Dato tam={28} color={C.gris} style={{ fontWeight: 700 }}>
              CIMA · 8,849 m
            </Dato>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 16, height: 82 }}>
          {f >= c.tercio ? (
            <Titular tam={78} color={C.cian} desde={c.tercio}>
              1/3 DEL OXÍGENO
            </Titular>
          ) : null}
        </div>
        <div
          style={{
            marginTop: 22,
            padding: "14px 24px",
            borderRadius: 20,
            border: `4px solid ${C.ambar}`,
            opacity: prog(f, c.golpe, 12),
            textAlign: "center",
          }}
        >
          <Dato tam={30}>
            Sin aclimatarte: <b style={{ color: C.ambar }}>desmayo en minutos</b>
          </Dato>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24 }}>
          <div style={{ fontFamily: FUENTE_TITULO }}>
            <div style={{ fontSize: 22, color: C.gris, fontWeight: 800, letterSpacing: 3 }}>ALTITUD</div>
            <div style={{ fontSize: 60, fontWeight: 900, color: enZona ? C.coral : C.cian }}>{numero(alt)} m</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: prog(f, c.ocho, 12) }}>
            <Corazon bpm={bpm} tam={90} />
            <div style={{ fontFamily: FUENTE_TITULO, fontWeight: 900, fontSize: 44, color: C.coral }}>
              {Math.round(bpm)}
              <span style={{ fontSize: 22, color: C.gris }}> LPM</span>
            </div>
          </div>
        </div>
      </Panel>

    </AbsoluteFill>
  );
};
