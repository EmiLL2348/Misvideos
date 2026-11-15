import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, interpolateColors, staticFile, useCurrentFrame } from "remotion";
import { C, FUENTE_TEXTO, FUENTE_TITULO, clampI, prog, rebote, ventana } from "./tema";

const TRAZO = 7;

/* ---------------- Sonido ---------------- */
export const Tic: React.FC<{ en: number; volumen?: number }> = ({ en, volumen = 0.45 }) => (
  <Sequence from={Math.max(0, Math.round(en))} durationInFrames={8} layout="none">
    <Audio src={staticFile("audio/tic.mp3")} volume={volumen} />
  </Sequence>
);

/** Un tic cada vez que un contador cambia de valor. */
export const TicsContador: React.FC<{ desde: number; pasos: number; cada: number; volumen?: number }> = ({
  desde,
  pasos,
  cada,
  volumen,
}) => (
  <>
    {new Array(pasos).fill(0).map((_, i) => (
      <Tic key={i} en={desde + i * cada} volumen={volumen} />
    ))}
  </>
);

/* ---------------- Fondos ---------------- */
export const FondoBase: React.FC<{ tono?: string }> = ({ tono = C.cian }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.noche, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          width: 1400,
          height: 1400,
          left: 260 + Math.sin(f / 90) * 200,
          top: -300 + Math.cos(f / 110) * 120,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tono}22 0%, transparent 65%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${C.nocheBorde} 2px, transparent 2.5px)`,
          backgroundSize: "48px 48px",
          backgroundPosition: `${f * 0.4}px ${f * 0.25}px`,
          opacity: 0.55,
        }}
      />
    </AbsoluteFill>
  );
};

export const Estrellas: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#0A1322", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 70% 30%, rgba(46,196,230,0.12), transparent 60%)",
        }}
      />
      {new Array(110).fill(0).map((_, i) => {
        const s = (i * 7919) % 1000;
        const x = ((i * 3301) % 1920 + f * (0.15 + (i % 3) * 0.12)) % 1920;
        const y = (i * 1777) % 1080;
        const r = 1 + (s % 3);
        const brillo = 0.35 + 0.65 * Math.abs(Math.sin(f / (20 + (s % 30)) + i));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              background: i % 9 === 0 ? C.ambar : C.blanco,
              opacity: brillo,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ---------------- Textos y contenedores ---------------- */
export const EtiquetaEscena: React.FC<{ num: number; titulo: string }> = ({ num, titulo }) => {
  const f = useCurrentFrame();
  const p = prog(f, 4, 18);
  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        top: 48,
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "12px 30px 12px 12px",
        borderRadius: 999,
        background: "rgba(24,41,63,0.9)",
        border: `3px solid ${C.nocheBorde}`,
        transform: `translateX(${(1 - p) * -500}px)`,
        opacity: p,
        fontFamily: FUENTE_TITULO,
        zIndex: 5,
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          borderRadius: "50%",
          background: C.cian,
          color: C.noche,
          display: "grid",
          placeItems: "center",
          fontSize: 32,
          fontWeight: 900,
        }}
      >
        {num}
      </div>
      <span style={{ color: C.blanco, fontSize: 34, fontWeight: 800, letterSpacing: 1 }}>{titulo.toUpperCase()}</span>
    </div>
  );
};

export const Panel: React.FC<{
  desde: number;
  hasta: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ desde, hasta, style, children }) => {
  const f = useCurrentFrame();
  if (f < desde - 1 || f > hasta + 1) return null;
  const v = ventana(f, desde, hasta, 12);
  return (
    <div
      style={{
        position: "absolute",
        opacity: v,
        transform: `translateY(${(1 - prog(f, desde, 16)) * 50}px) scale(${0.96 + 0.04 * v})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Titular: React.FC<{
  children: React.ReactNode;
  tam?: number;
  color?: string;
  desde?: number;
  style?: React.CSSProperties;
}> = ({ children, tam = 72, color = C.blanco, desde = 0, style }) => {
  const f = useCurrentFrame();
  const p = rebote(f, desde);
  return (
    <div
      style={{
        fontFamily: FUENTE_TITULO,
        fontWeight: 900,
        fontSize: tam,
        lineHeight: 1.05,
        color,
        transform: `translateY(${(1 - p) * 40}px)`,
        opacity: Math.min(1, p * 1.3),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Dato: React.FC<{ children: React.ReactNode; tam?: number; color?: string; style?: React.CSSProperties }> = ({
  children,
  tam = 34,
  color = C.blanco,
  style,
}) => <div style={{ fontFamily: FUENTE_TEXTO, fontWeight: 600, fontSize: tam, color, lineHeight: 1.3, ...style }}>{children}</div>;

export const Tarjeta: React.FC<{ children: React.ReactNode; borde?: string; style?: React.CSSProperties }> = ({
  children,
  borde = C.nocheBorde,
  style,
}) => (
  <div
    style={{
      background: "rgba(24,41,63,0.92)",
      border: `4px solid ${borde}`,
      borderRadius: 32,
      padding: 36,
      boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
      ...style,
    }}
  >
    {children}
  </div>
);

/* ---------------- Íconos de contorno grueso ---------------- */
export const IconoPlaneta: React.FC<{ tam?: number }> = ({ tam = 120 }) => (
  <svg viewBox="0 0 120 120" width={tam} height={tam}>
    <path d="M10 76 Q60 40 110 50" stroke={C.blanco} strokeWidth={TRAZO} fill="none" strokeLinecap="round" opacity={0.6} />
    <circle cx={60} cy={60} r={32} fill={C.coral} stroke={C.blanco} strokeWidth={TRAZO} />
    <path d="M36 52 Q50 46 62 54 M50 74 Q62 68 80 72" stroke="#E04449" strokeWidth={6} fill="none" strokeLinecap="round" />
    <path d="M14 82 Q60 96 108 48" stroke={C.blanco} strokeWidth={TRAZO} fill="none" strokeLinecap="round" />
  </svg>
);

export const IconoMontana: React.FC<{ tam?: number }> = ({ tam = 120 }) => (
  <svg viewBox="0 0 120 120" width={tam} height={tam}>
    <path d="M8 100 L48 26 L70 64 L82 46 L112 100 Z" fill="#4B6A92" stroke={C.blanco} strokeWidth={TRAZO} strokeLinejoin="round" />
    <path d="M36 48 L48 26 L60 48 L53 44 L47 52 L42 44 Z" fill={C.blanco} />
  </svg>
);

export const IconoCopo: React.FC<{ tam?: number; color?: string }> = ({ tam = 120, color = C.cian }) => (
  <svg viewBox="0 0 120 120" width={tam} height={tam}>
    {[0, 60, 120].map((a) => (
      <g key={a} transform={`rotate(${a} 60 60)`} stroke={color} strokeWidth={TRAZO} strokeLinecap="round">
        <line x1={60} y1={12} x2={60} y2={108} />
        <path d="M48 22 L60 34 L72 22 M48 98 L60 86 L72 98" fill="none" />
      </g>
    ))}
    <circle cx={60} cy={60} r={8} fill={C.blanco} />
  </svg>
);

export const IconoLuna: React.FC<{ tam?: number }> = ({ tam = 120 }) => {
  const f = useCurrentFrame();
  return (
    <svg viewBox="0 0 120 120" width={tam} height={tam} style={{ overflow: "visible" }}>
      <path d="M70 18 A44 44 0 1 0 104 82 A36 36 0 1 1 70 18 Z" fill={C.ambar} stroke={C.blanco} strokeWidth={TRAZO} strokeLinejoin="round" />
      {[0, 1, 2].map((i) => (
        <text
          key={i}
          x={74 + i * 14}
          y={40 - i * 16 - Math.sin(f / 10 + i) * 3}
          fontFamily={FUENTE_TITULO}
          fontWeight={900}
          fontSize={22 - i * 3}
          fill={C.blanco}
        >
          Z
        </text>
      ))}
    </svg>
  );
};

export const Advertencia: React.FC<{ tam?: number }> = ({ tam = 120 }) => (
  <svg viewBox="0 0 120 110" width={tam} height={(tam * 110) / 120}>
    <path d="M60 8 L114 100 L6 100 Z" fill={C.ambar} stroke={C.noche} strokeWidth={6} strokeLinejoin="round" />
    <rect x={54} y={38} width={12} height={36} rx={6} fill={C.noche} />
    <circle cx={60} cy={86} r={7} fill={C.noche} />
  </svg>
);

export const Check: React.FC<{ tam?: number; color?: string; p?: number }> = ({ tam = 80, color = C.verde, p = 1 }) => (
  <svg viewBox="0 0 80 80" width={tam} height={tam}>
    <circle cx={40} cy={40} r={36} fill={color} />
    <path d="M22 41 L35 54 L59 28" stroke={C.noche} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
  </svg>
);

export const Corazon: React.FC<{ bpm: number; tam?: number }> = ({ bpm, tam = 110 }) => {
  const f = useCurrentFrame();
  const fase = ((f / 30) * bpm) / 60;
  const latido = 1 + 0.16 * Math.pow(Math.max(0, Math.sin(fase * Math.PI * 2)), 6);
  return (
    <svg viewBox="0 0 120 110" width={tam} height={tam} style={{ transform: `scale(${latido})` }}>
      <path
        d="M60 100 C20 72 6 52 8 34 C10 14 32 4 48 14 C54 18 58 24 60 28 C62 24 66 18 72 14 C88 4 110 14 112 34 C114 52 100 72 60 100 Z"
        fill={C.coral}
        stroke={C.blanco}
        strokeWidth={6}
      />
      <path d="M22 52 L44 52 L52 38 L62 66 L70 50 L98 50" stroke={C.blanco} strokeWidth={5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

/* ---------------- Medidores ---------------- */
export const Cronometro: React.FC<{ valor: string; progreso: number; color?: string; tam?: number; etiqueta?: string }> = ({
  valor,
  progreso,
  color = C.cian,
  tam = 340,
  etiqueta = "SEGUNDOS",
}) => {
  const R = 118;
  const L = 2 * Math.PI * R;
  return (
    <svg viewBox="0 0 300 330" width={tam} height={(tam * 330) / 300}>
      <rect x={128} y={6} width={44} height={26} rx={8} fill={C.gris} />
      <rect x={140} y={26} width={20} height={20} fill={C.gris} />
      <line x1={238} y1={70} x2={256} y2={52} stroke={C.gris} strokeWidth={14} strokeLinecap="round" />
      <circle cx={150} cy={186} r={140} fill={C.nocheClaro} stroke={C.blanco} strokeWidth={8} />
      <circle cx={150} cy={186} r={R} fill="none" stroke={C.nocheBorde} strokeWidth={18} />
      <circle
        cx={150}
        cy={186}
        r={R}
        fill="none"
        stroke={color}
        strokeWidth={18}
        strokeLinecap="round"
        strokeDasharray={L}
        strokeDashoffset={L * (1 - progreso)}
        transform="rotate(-90 150 186)"
      />
      <text x={150} y={210} textAnchor="middle" fontFamily={FUENTE_TITULO} fontWeight={900} fontSize={96} fill={color}>
        {valor}
      </text>
      <text x={150} y={250} textAnchor="middle" fontFamily={FUENTE_TEXTO} fontWeight={700} fontSize={20} fill={C.gris} letterSpacing={3}>
        {etiqueta}
      </text>
    </svg>
  );
};

export const BarraOxigeno: React.FC<{ nivel: number; ancho?: number }> = ({ nivel, ancho = 560 }) => {
  const color = interpolateColors(nivel, [0.15, 0.3, 0.42, 0.5], [C.coral, C.ambar, C.ambar, C.cian]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: FUENTE_TITULO }}>
      <div style={{ fontSize: 44, fontWeight: 900, color: C.blanco, width: 90 }}>
        O<sub style={{ fontSize: 26 }}>2</sub>
      </div>
      <div
        style={{
          width: ancho,
          height: 58,
          borderRadius: 30,
          border: `5px solid ${C.blanco}`,
          padding: 6,
          background: C.nocheClaro,
        }}
      >
        <div style={{ width: `${Math.max(0, nivel) * 100}%`, height: "100%", borderRadius: 22, background: color }} />
      </div>
      <div style={{ fontSize: 40, fontWeight: 900, color, width: 120, textAlign: "right" }}>{Math.round(nivel * 100)}%</div>
    </div>
  );
};

export const Termometro: React.FC<{ temp: number; min?: number; max?: number; alto?: number }> = ({
  temp,
  min = 30,
  max = 40,
  alto = 420,
}) => {
  const p = interpolate(temp, [min, max], [0, 1], clampI);
  const color = interpolateColors(temp, [32, 35, 37], [C.frio, C.ambar, C.coral]);
  const tubo = 250;
  return (
    <svg viewBox="0 0 220 360" width={(alto * 220) / 360} height={alto}>
      <rect x={70} y={20} width={50} height={tubo + 30} rx={25} fill={C.nocheClaro} stroke={C.blanco} strokeWidth={7} />
      <circle cx={95} cy={300} r={44} fill={color} stroke={C.blanco} strokeWidth={7} />
      <rect x={82} y={30 + tubo * (1 - p)} width={26} height={tubo * p + 30} rx={13} fill={color} />
      {[32, 35, 37].map((t) => {
        const y = 30 + tubo * (1 - interpolate(t, [min, max], [0, 1]));
        return (
          <g key={t}>
            <line x1={124} y1={y} x2={142} y2={y} stroke={C.gris} strokeWidth={4} />
            <text x={148} y={y + 9} fontFamily={FUENTE_TEXTO} fontWeight={700} fontSize={26} fill={C.gris}>
              {t}°
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const LOBULO_IZQ = "M138 72 C108 60 40 92 36 190 C33 240 70 256 110 242 C134 232 138 204 138 172 Z";
const LOBULO_DER = "M162 72 C192 60 260 92 264 190 C267 240 230 256 190 242 C166 232 162 204 162 172 Z";

// puntos fijos dentro de cada lóbulo
const PUNTOS: [number, number][] = (() => {
  const out: [number, number][] = [];
  let s = 11;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  while (out.length < 60) {
    const lado = out.length % 2 === 0 ? -1 : 1;
    const cx = 150 + lado * 62;
    const x = cx + (rnd() * 2 - 1) * 46;
    const y = 175 + (rnd() * 2 - 1) * 64;
    if (((x - cx) / 50) ** 2 + ((y - 178) / 70) ** 2 < 1) out.push([x, y]);
  }
  return out;
})();

export const Pulmones: React.FC<{ puntos?: number; tam?: number; agitado?: boolean; color?: string }> = ({
  puntos = 0,
  tam = 320,
  agitado = false,
  color = C.coral,
}) => {
  const f = useCurrentFrame();
  const resp = agitado ? 1 + 0.07 * Math.sin(f / 2.2) : 1 + 0.025 * Math.sin(f / 14);
  const sacude = agitado ? Math.sin(f * 1.9) * 4 : 0;
  return (
    <svg viewBox="0 0 300 280" width={tam} height={(tam * 280) / 300} style={{ overflow: "visible" }}>
      <g transform={`translate(${150 + sacude} 160) scale(${resp}) translate(-150 -160)`}>
        <path d={LOBULO_IZQ} fill={color} opacity={0.85} stroke={C.blanco} strokeWidth={TRAZO} />
        <path d={LOBULO_DER} fill={color} opacity={0.85} stroke={C.blanco} strokeWidth={TRAZO} />
        <path d="M150 8 L150 84 M150 84 L122 116 M150 84 L178 116" stroke={C.blanco} strokeWidth={12} strokeLinecap="round" fill="none" />
        {PUNTOS.slice(0, Math.round(puntos)).map(([x, y], i) => (
          <circle key={i} cx={x + Math.sin(f / 9 + i) * 3} cy={y + Math.cos(f / 11 + i) * 3} r={7} fill={C.cian} stroke={C.noche} strokeWidth={2} />
        ))}
      </g>
      {agitado
        ? [0, 1, 2].map((i) => {
            const t = ((f + i * 8) % 24) / 24;
            return (
              <path
                key={i}
                d={`M${-10 - t * 30} ${110 + i * 40} q-14 -8 -28 0`}
                stroke={C.blanco}
                strokeWidth={5}
                fill="none"
                strokeLinecap="round"
                opacity={1 - t}
              />
            );
          })
        : null}
    </svg>
  );
};

/* ---------------- Expediente ---------------- */
export const Sello: React.FC<{ texto: string; desde: number; color?: string }> = ({ texto, desde, color = C.verde }) => {
  const f = useCurrentFrame();
  if (f < desde) return null;
  const p = rebote(f, desde, 30, 10);
  return (
    <div
      style={{
        border: `8px solid ${color}`,
        color,
        borderRadius: 18,
        padding: "8px 28px",
        fontFamily: FUENTE_TITULO,
        fontWeight: 900,
        fontSize: 64,
        letterSpacing: 4,
        transform: `rotate(-12deg) scale(${2.2 - 1.2 * p})`,
        opacity: Math.min(1, p * 1.5),
        background: "rgba(61,220,151,0.08)",
      }}
    >
      {texto}
    </div>
  );
};

export const Expediente: React.FC<{
  titulo: string;
  children?: React.ReactNode;
  ancho?: number;
}> = ({ titulo, children, ancho = 820 }) => (
  <div style={{ width: ancho, position: "relative", paddingTop: 52 }}>
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 40,
        padding: "10px 30px",
        background: "#D9E1EA",
        borderRadius: "18px 18px 0 0",
        fontFamily: FUENTE_TITULO,
        fontWeight: 800,
        fontSize: 26,
        color: C.noche,
        letterSpacing: 3,
      }}
    >
      EXPEDIENTE
    </div>
    <div
      style={{
        background: "#E9EEF4",
        borderRadius: 24,
        padding: "34px 40px",
        color: C.noche,
        boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ fontFamily: FUENTE_TITULO, fontWeight: 900, fontSize: 46, letterSpacing: 1 }}>{titulo}</div>
      <div style={{ height: 5, background: C.noche, opacity: 0.15, margin: "18px 0 22px", borderRadius: 3 }} />
      {children}
    </div>
  </div>
);

/** Línea que se dibuja sobre algo (tachadura). */
export const Tachadura: React.FC<{ p: number; ancho: number; alto: number }> = ({ p, ancho, alto }) => (
  <svg width={ancho} height={alto} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <line x1={10} y1={alto - 10} x2={10 + (ancho - 20) * p} y2={alto - 10 - (alto - 20) * p} stroke={C.coral} strokeWidth={22} strokeLinecap="round" />
  </svg>
);
