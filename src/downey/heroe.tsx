import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { prog } from "./estilo";
import { Robert, topDePie } from "./Personajes";

/* Pseudoaleatorio estable (mismo resultado en cada render). */
const azar = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const ROJO = "#B3202A";
const ROJO_OSC = "#8A1720";
const ROJO_CLARO = "#C8303A";
const ORO = "#E0B048";
const ORO_OSC = "#B88A2A";

/** Gemas: azul, roja, morada, verde, amarilla y naranja (centro). */
const GEMAS = ["#9B4DFF", "#3FA7FF", "#FF3B3B", "#3BFF8A", "#FFE23B", "#FF9A2E"];

const Gema: React.FC<{ x: number; y: number; r: number; color: string; luz: number }> = ({ x, y, r, color, luz }) => (
  <g>
    <circle cx={x} cy={y} r={r + 5} fill={ORO} stroke={ORO_OSC} strokeWidth={2} />
    <circle cx={x} cy={y} r={r + 14 * luz} fill={color} opacity={0.25 * luz} />
    <circle cx={x} cy={y} r={r} fill={color} />
    <ellipse cx={x - r * 0.35} cy={y - r * 0.35} rx={r * 0.35} ry={r * 0.22} fill="rgba(255,255,255,0.75)" />
  </g>
);

/** Dedo de dos falanges como trazos gruesos con articulación dorada. */
const Dedo: React.FC<{ p: [number, number][]; ancho: number }> = ({ p, ancho }) => (
  <g>
    <polyline points={p.map((q) => q.join(",")).join(" ")} fill="none" stroke={ROJO_OSC} strokeWidth={ancho + 6} strokeLinecap="round" strokeLinejoin="round" />
    <polyline points={p.map((q) => q.join(",")).join(" ")} fill="none" stroke={ROJO} strokeWidth={ancho} strokeLinecap="round" strokeLinejoin="round" />
    <polyline points={p.map((q) => `${q[0] - ancho * 0.18},${q[1]}`).join(" ")} fill="none" stroke={ROJO_CLARO} strokeWidth={ancho * 0.3} strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
    {p.slice(1, -1).map((q, i) => (
      <circle key={i} cx={q[0]} cy={q[1]} r={ancho * 0.42} fill={ORO} stroke={ORO_OSC} strokeWidth={2} />
    ))}
  </g>
);

const mezclaP = (a: [number, number][], b: [number, number][], t: number): [number, number][] => a.map((q, i) => [q[0] + (b[i][0] - q[0]) * t, q[1] + (b[i][1] - q[1]) * t]);

/**
 * Guantelete con seis gemas visto por el dorso, dedos hacia arriba.
 * chasquido 0 = pulgar y corazón juntos; 1 = el corazón golpea la palma y el pulgar sale.
 * Lienzo 400×560 (el antebrazo sale por abajo del encuadre).
 */
export const Guantelete: React.FC<{ alto?: number; chasquido?: number; carga?: number; semilla?: number }> = ({ alto = 900, chasquido = 0, carga = 1, semilla = 0 }) => {
  const f = useCurrentFrame();
  const t = chasquido;
  // antes: el corazón se dobla hacia el pulgar y las yemas se tocan sobre los nudillos;
  // después: el corazón baja de golpe contra la palma y el pulgar sale disparado hacia arriba.
  const corazon = mezclaP(
    [[182, 236], [176, 196], [160, 182]],
    [[182, 236], [182, 246], [182, 252]],
    t,
  );
  const pulgar = mezclaP(
    [[130, 330], [104, 262], [150, 190]],
    [[130, 330], [96, 250], [96, 168]],
    t,
  );
  const contacto: [number, number] = [155, 186];
  // arcos de energía que recorren el guantelete
  const arcos = carga > 0
    ? new Array(5).fill(0).map((_, i) => {
        const s = Math.floor(f / 2) * 13 + i * 71 + semilla;
        const x0 = 150 + azar(s) * 100;
        const y0 = 560 - azar(s + 1) * 140;
        const pts: string[] = [];
        let x = x0;
        let y = y0;
        for (let k = 0; k < 7; k++) {
          pts.push(`${x},${y}`);
          x += (azar(s + k * 3) - 0.5) * 60;
          y -= 20 + azar(s + k * 5) * 40;
        }
        return <polyline key={i} points={pts.join(" ")} fill="none" stroke={GEMAS[i % 6]} strokeWidth={3} opacity={0.9 * carga} style={{ filter: `drop-shadow(0 0 6px ${GEMAS[i % 6]})` }} />;
      })
    : null;
  return (
    <svg viewBox="0 0 400 560" width={(alto * 400) / 560} height={alto} style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="auraGuante" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="rgba(255,240,210,0.9)" />
          <stop offset="0.4" stopColor="rgba(255,170,90,0.35)" />
          <stop offset="1" stopColor="rgba(255,120,60,0)" />
        </radialGradient>
      </defs>
      <circle cx={200} cy={280} r={260 + 30 * Math.sin(f / 4)} fill="url(#auraGuante)" opacity={0.55 * carga} />
      {/* antebrazo */}
      <path d="M140 400 L260 400 L270 560 L130 560 Z" fill={ROJO} />
      <path d="M200 400 L260 400 L270 560 L200 560 Z" fill={ROJO_OSC} />
      <path d="M134 440 L266 440 L268 462 L132 462 Z" fill={ORO} />
      <path d="M200 440 L266 440 L268 462 L200 462 Z" fill={ORO_OSC} />
      <path d="M152 480 L170 540 M248 480 L232 540" stroke="#5A1015" strokeWidth={3} />
      {/* muñeca */}
      <rect x={134} y={388} width={132} height={20} rx={6} fill={ORO} />
      {/* dedos (detrás del dorso) */}
      <Dedo p={[[146, 240], [140, 158], [136, 86]]} ancho={34} />
      {t < 0.5 ? <Dedo p={corazon} ancho={36} /> : null}
      <Dedo p={[[220, 240], [226, 152], [230, 90]]} ancho={34} />
      <Dedo p={[[256, 248], [266, 180], [272, 128]]} ancho={28} />
      <Dedo p={pulgar} ancho={38} />
      {/* dorso */}
      <path d="M128 392 L272 392 L282 262 Q282 236 258 232 L142 232 Q118 236 118 262 Z" fill={ROJO} />
      <path d="M200 232 L258 232 Q282 236 282 262 L272 392 L200 392 Z" fill={ROJO_OSC} />
      <path d="M150 262 L250 262 L244 370 L156 370 Z" fill={ORO} />
      <path d="M200 262 L250 262 L244 370 L200 370 Z" fill={ORO_OSC} />
      <path d="M128 300 L150 300 M250 300 L272 300" stroke="#5A1015" strokeWidth={3} />
      {/* rasguños de batalla */}
      <path d="M160 384 L188 350 M232 248 L252 276 M168 420 L180 410" stroke="rgba(30,10,10,0.55)" strokeWidth={3} strokeLinecap="round" />
      {/* corazón ya doblado: se ve el nudillo sobre el dorso */}
      {t >= 0.5 ? (
        <g>
          <ellipse cx={182} cy={236} rx={22} ry={18} fill={ROJO_OSC} />
          <ellipse cx={182} cy={232} rx={18} ry={14} fill={ROJO} />
        </g>
      ) : null}
      {/* chispa del chasquido y trazos de movimiento */}
      {t > 0 && t < 1.01 ? (
        <g opacity={Math.min(1, t * 3)}>
          <path d="M150 184 Q172 214 184 246" stroke="rgba(255,255,255,0.9)" strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M140 196 Q160 226 172 252" stroke="rgba(255,255,255,0.6)" strokeWidth={4} fill="none" strokeLinecap="round" />
          <path d="M112 236 Q100 200 98 170" stroke="rgba(255,255,255,0.7)" strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      ) : null}
      {t > 0.3 ? (
        <g transform={`translate(${contacto[0]} ${contacto[1]}) scale(${0.6 + 0.8 * t})`}>
          {new Array(8).fill(0).map((_, i) => (
            <path key={i} d="M0 -8 L4 -40 L0 -70 L-4 -40 Z" fill="#FFF6D8" transform={`rotate(${i * 45})`} opacity={0.9} />
          ))}
          <circle r={14} fill="#FFFFFF" />
        </g>
      ) : t === 0 ? (
        <circle cx={contacto[0]} cy={contacto[1]} r={10 + 3 * Math.sin(f / 2)} fill="rgba(255,240,200,0.8)" />
      ) : null}
      {/* gemas */}
      <Gema x={146} y={236} r={11} color={GEMAS[0]} luz={carga} />
      <Gema x={184} y={236} r={11} color={GEMAS[1]} luz={carga} />
      <Gema x={220} y={236} r={11} color={GEMAS[2]} luz={carga} />
      <Gema x={256} y={242} r={10} color={GEMAS[3]} luz={carga} />
      <Gema x={pulgar[1][0] + 4} y={pulgar[1][1] + 4} r={11} color={GEMAS[4]} luz={carga} />
      <Gema x={200} y={316} r={22} color={GEMAS[5]} luz={carga} />
      {arcos}
    </svg>
  );
};

/** Campo de batalla en ruinas: cielo de humo naranja, escombros, fuegos y brasas que suben. */
export const CampoBatalla: React.FC<{ suelo?: number }> = ({ suelo = 900 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(#2A1A1A 0%, #6A3A24 45%, #C26A2E 70%, #3A2218 100%)" }} />
      {/* nubes de humo que se desplazan */}
      {new Array(8).fill(0).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: ((i * 290 + f * (0.6 + (i % 3) * 0.3)) % 2600) - 500, top: 60 + (i % 4) * 90, width: 760, height: 260, borderRadius: "50%", background: "rgba(40,24,20,0.45)", filter: "blur(18px)" }} />
      ))}
      {/* ruinas a lo lejos */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path d={`M0 ${suelo - 170} L120 ${suelo - 260} L180 ${suelo - 200} L260 ${suelo - 330} L330 ${suelo - 240} L460 ${suelo - 280} L520 ${suelo - 190} L1380 ${suelo - 200} L1460 ${suelo - 300} L1540 ${suelo - 230} L1650 ${suelo - 350} L1720 ${suelo - 240} L1920 ${suelo - 290} L1920 ${suelo} L0 ${suelo} Z`} fill="#2A1C18" />
        <path d={`M0 ${suelo - 90} L300 ${suelo - 130} L700 ${suelo - 100} L1200 ${suelo - 140} L1600 ${suelo - 110} L1920 ${suelo - 150} L1920 ${suelo} L0 ${suelo} Z`} fill="#1E1412" />
      </svg>
      {/* fuegos en el horizonte */}
      {[260, 640, 1340, 1700].map((x, i) => (
        <div key={x} style={{ position: "absolute", left: x - 90, top: suelo - 220 + (i % 2) * 40, width: 180, height: 140, borderRadius: "50%", background: "radial-gradient(ellipse at 50% 70%, rgba(255,200,90,0.9), rgba(255,110,40,0.45) 45%, transparent 70%)", transform: `scaleY(${1 + 0.12 * Math.sin(f / 3 + i)})`, transformOrigin: "50% 100%" }} />
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: suelo, bottom: 0, background: "linear-gradient(#3A2620, #1C120E)" }} />
      {/* escombros apoyados en el suelo */}
      {[[120, 70, 40], [420, 120, 60], [1500, 140, 50], [1780, 90, 46], [900, 60, 30]].map(([x, w, h], i) => (
        <div key={i} style={{ position: "absolute", left: x, top: suelo - h + 4, width: w, height: h, background: i % 2 ? "#2E2420" : "#3A2C26", clipPath: "polygon(0 100%, 10% 20%, 45% 0, 80% 30%, 100% 100%)" }} />
      ))}
      {/* brasas que suben con el calor */}
      {new Array(40).fill(0).map((_, i) => {
        const vida = 120 + (i % 5) * 20;
        const tt = ((f + i * 37) % vida) / vida;
        return <div key={`b${i}`} style={{ position: "absolute", left: (i * 149) % 1920 + Math.sin(f / 15 + i) * 30, top: suelo - tt * 900, width: 5, height: 5, borderRadius: 3, background: "#FFC060", boxShadow: "0 0 8px #FF8A30", opacity: Math.sin(tt * Math.PI) }} />;
      })}
    </AbsoluteFill>
  );
};

/**
 * Desierto con montañas nevadas; Robert de traje y gafas, brazos abiertos,
 * y detrás estallan dos grandes columnas de polvo y fuego.
 */
export const DesiertoExplosion: React.FC<{ estalla: number; alto?: number }> = ({ estalla, alto = 600 }) => {
  const f = useCurrentFrame();
  const SUELO = 960;
  const k = alto / 460;
  const t = f - estalla;
  const abre = prog(f, estalla - 14, 12);
  const brazos = { hombro: 8 + 52 * abre, codo: 4 + 6 * abre };
  const temblor = t >= 0 && t < 14 ? Math.sin(t * 2.4) * (14 - t) * 0.7 : 0;
  const columna = (cx: number, retraso: number, escala: number) => {
    const tt = t - retraso;
    if (tt < 0) return null;
    const crece = Math.min(1, tt / 20);
    const altura = 620 * escala * (1 - Math.pow(1 - crece, 3));
    return (
      <g key={cx}>
        {new Array(34).fill(0).map((_, i) => {
          const a = (azar(i * 7 + cx) - 0.5) * 70 * (Math.PI / 180);
          const d = (0.15 + 0.85 * azar(i * 11 + cx)) * altura;
          const r = (50 + 90 * (d / (620 * escala))) * escala * (0.5 + 0.5 * crece);
          const y = SUELO - 130 - Math.cos(a) * d;
          const x = cx + Math.sin(a) * d * 1.1;
          const tono = azar(i * 5 + cx);
          return <circle key={i} cx={x} cy={y} r={r} fill={tono < 0.3 ? "#6E6052" : tono < 0.7 ? "#8E806E" : "#B0A28E"} opacity={0.85} filter="url(#difuso)" />;
        })}
        <ellipse cx={cx} cy={SUELO - 140} rx={200 * escala * crece} ry={90 * escala * crece} fill="rgba(255,160,60,0.85)" style={{ filter: "blur(10px)" }} opacity={Math.max(0, 1 - tt / 40)} />
        {new Array(10).fill(0).map((_, i) => {
          const vx = (azar(i + cx) - 0.5) * 22;
          const vy = 14 + azar(i * 3 + cx) * 10;
          const y = SUELO - 140 - vy * tt + 0.45 * tt * tt;
          if (y > SUELO - 120) return null;
          return <rect key={`r${i}`} x={cx + vx * tt} y={y} width={12} height={9} fill="#3A2E26" transform={`rotate(${tt * 9 + i * 30} ${cx + vx * tt + 6} ${y + 4})`} />;
        })}
      </g>
    );
  };
  return (
    <AbsoluteFill style={{ transform: `translate(${temblor * 0.6}px, ${temblor}px) scale(${1.02 + Math.max(0, f - estalla + 30) * 0.0004})` }}>
      <AbsoluteFill style={{ background: "linear-gradient(#5E9AD6 0%, #A9CDEB 55%, #E8DCC4 80%)" }} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="difuso" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="11" />
          </filter>
        </defs>
        {/* montañas nevadas */}
        <path d="M0 720 L220 430 L360 560 L560 360 L780 600 L980 470 L1180 620 L1420 380 L1640 560 L1920 440 L1920 820 L0 820 Z" fill="#7C8CA0" />
        <path d="M220 430 L270 500 L240 495 L200 520 L180 485 Z M560 360 L620 440 L580 430 L540 455 L510 420 Z M1420 380 L1480 450 L1440 445 L1400 470 L1370 430 Z" fill="#F4F6FA" />
        <path d="M0 800 L400 700 L900 760 L1400 690 L1920 760 L1920 880 L0 880 Z" fill="#B7A68A" />
        {columna(560, 0, 1.15)}
        {columna(1360, 4, 1.05)}
        {columna(960, 9, 0.8)}
      </svg>
      {/* suelo rocoso */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, bottom: 0, background: "linear-gradient(#CDB892, #A88E68)" }} />
      {[[80, 70], [300, 50], [1500, 80], [1760, 60]].map(([x, h], i) => (
        <div key={i} style={{ position: "absolute", left: x, top: 1080 - h - 10, width: h * 2.4, height: h, background: i % 2 ? "#9A7A58" : "#8A6A4A", borderRadius: "40% 50% 6px 6px" }} />
      ))}
      {/* polvo que avanza por el suelo tras la explosión */}
      {t > 6 ? <div style={{ position: "absolute", left: 960 - (t - 6) * 40, top: 780, width: (t - 6) * 80, height: 160, borderRadius: "50%", background: "rgba(200,180,150,0.55)", filter: "blur(14px)", opacity: Math.max(0, 1 - (t - 6) / 60) }} /> : null}
      <div style={{ position: "absolute", left: 960 - 100 * k, top: topDePie(SUELO, alto) }}>
        <Robert alto={alto} ropa="traje" expresion="decidido" gafas brazoIzq={brazos} brazoDer={brazos} />
      </div>
    </AbsoluteFill>
  );
};
