import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { F_CIFRA, F_MANO, F_TITULO, P, clampI, miles, prog, rebote } from "./estilo";

/* ---------------- Cámara y parallax ---------------- */
export type Cam = { x: number; y: number; zoom: number };

/** Capa de parallax: profundidad 0 (cielo, casi fija) … 1 (primer plano). */
export const Capa: React.FC<{ cam: Cam; prof: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ cam, prof, children, style }) => {
  const z = 1 + (cam.zoom - 1) * (0.3 + 0.7 * prof);
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${-cam.x * prof}px, ${-cam.y * prof}px) scale(${z})`,
        transformOrigin: "50% 55%",
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Sacudida de cámara (portazos, golpes). */
export const sacudida = (f: number, momentos: number[], fuerza = 14) => {
  let x = 0;
  let y = 0;
  for (const m of momentos) {
    const d = f - m;
    if (d >= 0 && d < 12) {
      const a = fuerza * Math.exp(-d / 3.5);
      x += Math.sin(d * 7.3) * a;
      y += Math.cos(d * 5.1) * a * 0.6;
    }
  }
  return { x, y };
};

/* ---------------- Ciudad por capas ---------------- */
const rnd = (seed: number) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

export const Edificios: React.FC<{
  semilla: number;
  base: number; // y del suelo
  altoMin: number;
  altoMax: number;
  color: string;
  colorVentana?: string;
  encendidas?: number; // 0..1
  ancho?: number;
  desde?: number;
  escaleras?: boolean;
  ladrillo?: boolean;
  anchoMin?: number;
  anchoMax?: number;
  azotea?: boolean;
}> = ({
  semilla,
  base,
  altoMin,
  altoMax,
  color,
  colorVentana = P.dorado,
  encendidas = 0.3,
  ancho = 2800,
  desde = -440,
  escaleras = false,
  ladrillo = false,
  anchoMin = 140,
  anchoMax = 300,
  azotea = true,
}) => {
  const f = useCurrentFrame();
  const r = rnd(semilla);
  const edificios: React.ReactNode[] = [];
  let x = desde;
  let i = 0;
  while (x < desde + ancho) {
    const w = anchoMin + r() * (anchoMax - anchoMin);
    const h = altoMin + r() * (altoMax - altoMin);
    const y = base - h;
    const vent: React.ReactNode[] = [];
    const cols = Math.max(2, Math.floor(w / 46));
    const filas = Math.max(2, Math.floor(h / 62));
    const vw = (w - 24) / cols;
    for (let c = 0; c < cols; c++)
      for (let fl = 0; fl < filas - 1; fl++) {
        const on = r() < encendidas;
        const parpadea = on && r() < 0.05 && Math.sin(f / 7 + c + fl) > 0.85;
        vent.push(
          <rect
            key={`${c}-${fl}`}
            x={x + 14 + c * vw + vw * 0.18}
            y={y + 22 + fl * 62}
            width={vw * 0.64}
            height={34}
            fill={on && !parpadea ? colorVentana : "rgba(0,0,0,0.28)"}
            opacity={on ? 0.85 : 1}
          />
        );
      }
    edificios.push(
      <g key={i}>
        <rect x={x} y={y} width={w} height={h + 400} fill={color} />
        {ladrillo
          ? new Array(Math.floor(h / 18)).fill(0).map((_, k) => (
              <line key={k} x1={x} y1={y + k * 18} x2={x + w} y2={y + k * 18} stroke="rgba(0,0,0,0.12)" strokeWidth={2} />
            ))
          : null}
        {vent}
        {azotea ? <rect x={x - 4} y={y - 10} width={w + 8} height={12} fill="rgba(0,0,0,0.25)" /> : null}
        {azotea && r() < 0.4 ? (
          <g>
            <rect x={x + w * 0.6} y={y - 60} width={40} height={50} fill={color} />
            <path d={`M${x + w * 0.6 - 6} ${y - 60} L${x + w * 0.6 + 20} ${y - 80} L${x + w * 0.6 + 46} ${y - 60} Z`} fill={color} />
            <line x1={x + w * 0.6 + 6} y1={y - 10} x2={x + w * 0.6 + 6} y2={y} stroke={color} strokeWidth={6} />
          </g>
        ) : null}
        {escaleras
          ? new Array(Math.max(1, filas - 2)).fill(0).map((_, k) => {
              const ey = y + 70 + k * 62;
              const ex = x + w * 0.2;
              const ew = w * 0.6;
              return (
                <g key={`e${k}`} stroke="#140C08" strokeWidth={4} fill="none">
                  <line x1={ex} y1={ey} x2={ex + ew} y2={ey} strokeWidth={7} />
                  <line x1={ex} y1={ey - 22} x2={ex + ew} y2={ey - 22} />
                  {new Array(6).fill(0).map((__, q) => (
                    <line key={q} x1={ex + (q * ew) / 5} y1={ey - 22} x2={ex + (q * ew) / 5} y2={ey} />
                  ))}
                  <line x1={k % 2 ? ex + 10 : ex + ew - 10} y1={ey} x2={k % 2 ? ex + ew - 10 : ex + 10} y2={ey + 60} strokeWidth={5} />
                </g>
              );
            })
          : null}
      </g>
    );
    x += w + 6 + r() * 14;
    i++;
  }
  return (
    <svg width={ancho + 200} height={1600} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {edificios}
    </svg>
  );
};

export const Cielo: React.FC<{ arriba: string; abajo: string; sol?: { x: number; y: number; r: number; color: string } }> = ({ arriba, abajo, sol }) => (
  <AbsoluteFill style={{ background: `linear-gradient(${arriba}, ${abajo})` }}>
    {sol ? (
      <div
        style={{
          position: "absolute",
          left: sol.x - sol.r,
          top: sol.y - sol.r,
          width: sol.r * 2,
          height: sol.r * 2,
          borderRadius: "50%",
          background: sol.color,
          boxShadow: `0 0 ${sol.r * 1.5}px ${sol.r * 0.6}px ${sol.color}88`,
        }}
      />
    ) : null}
  </AbsoluteFill>
);

/* ---------------- Atmósfera ---------------- */
export const Lluvia: React.FC<{ densidad?: number; opacidad?: number; viento?: number }> = ({ densidad = 160, opacidad = 0.45, viento = 0.25 }) => {
  const f = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {new Array(densidad).fill(0).map((_, i) => {
        const v = 38 + (i % 7) * 6;
        const x0 = (i * 977) % 2200;
        const y = ((f * v + i * 431) % 1300) - 120;
        const x = x0 - y * viento - 100;
        const l = 26 + (i % 5) * 8;
        return <line key={i} x1={x} y1={y} x2={x - l * viento} y2={y + l} stroke="#C9D6E8" strokeWidth={i % 3 ? 1.6 : 2.4} opacity={opacidad * (0.5 + (i % 4) / 6)} />;
      })}
    </svg>
  );
};

export const Vapor: React.FC<{ x: number; y: number; escala?: number; color?: string }> = ({ x, y, escala = 1, color = "rgba(240,230,215,0.22)" }) => {
  const f = useCurrentFrame();
  return (
    <>
      {new Array(6).fill(0).map((_, i) => {
        const t = ((f + i * 22) % 130) / 130;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin(t * 5 + i) * 30 * escala - 60 * escala,
              top: y - t * 320 * escala - 40 * escala,
              width: (120 + t * 160) * escala,
              height: (70 + t * 90) * escala,
              borderRadius: "50%",
              background: color,
              filter: `blur(${14 * escala}px)`,
              opacity: Math.sin(t * Math.PI),
            }}
          />
        );
      })}
    </>
  );
};

/** Grano de película + viñeteado + parpadeo de exposición. */
export const Pelicula: React.FC<{ vineta?: number; tinte?: string }> = ({ vineta = 0.75, tinte }) => {
  const f = useCurrentFrame();
  // el grano cambia cada 2 fotogramas: conserva la textura y comprime mucho mejor
  const g = Math.floor(f / 2);
  const n = g % 4;
  const ox = (g * 73) % 256;
  const oy = (g * 151) % 256;
  const flicker = 0.03 * Math.sin(f * 1.7) * Math.sin(f * 0.37);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 40 }}>
      {tinte ? <AbsoluteFill style={{ background: tinte, mixBlendMode: "multiply" }} /> : null}
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile(`stallone/grano-${n}.png`)})`,
          backgroundPosition: `${ox}px ${oy}px`,
          mixBlendMode: "overlay",
          opacity: 0.6,
        }}
      />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,${vineta}) 100%)` }} />
      <AbsoluteFill style={{ background: `rgba(255,240,210,${Math.max(0, flicker)})` }} />
    </AbsoluteFill>
  );
};

/* ---------------- Tipografía ---------------- */
export const Rotulo: React.FC<{ texto: string; desde: number; hasta?: number; y?: number; tam?: number; color?: string }> = ({
  texto,
  desde,
  hasta = 99999,
  y = 120,
  tam = 64,
  color = P.crema,
}) => {
  const f = useCurrentFrame();
  if (f < desde) return null;
  const p = Math.min(prog(f, desde, 20), 1 - prog(f, hasta - 15, 15));
  const esp = interpolate(p, [0, 1], [26, 10]);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", opacity: p, zIndex: 30 }}>
      <span
        style={{
          fontFamily: F_TITULO,
          fontWeight: 900,
          fontSize: tam,
          color,
          letterSpacing: esp,
          textShadow: "0 4px 24px rgba(0,0,0,0.7)",
          padding: "10px 40px",
          borderTop: `3px solid ${color}88`,
          borderBottom: `3px solid ${color}88`,
        }}
      >
        {texto}
      </span>
    </div>
  );
};

export const Cifra: React.FC<{ valor: number; prefijo?: string; sufijo?: string; tam?: number; color?: string; style?: React.CSSProperties }> = ({
  valor,
  prefijo = "$",
  sufijo = "",
  tam = 120,
  color = P.crema,
  style,
}) => (
  <div style={{ fontFamily: F_CIFRA, fontWeight: 800, fontSize: tam, color, letterSpacing: -2, fontVariantNumeric: "tabular-nums", textShadow: "0 6px 30px rgba(0,0,0,0.6)", ...style }}>
    {prefijo}
    {miles(valor)}
    {sufijo}
  </div>
);

export const Neon: React.FC<{ texto: string; color?: string; tam?: number; zumbido?: boolean; style?: React.CSSProperties }> = ({ texto, color = P.neon, tam = 90, style }) => {
  const f = useCurrentFrame();
  const fallo = Math.sin(f * 0.9) > 0.97 || (f % 97 > 90 && f % 3 === 0);
  return (
    <div
      style={{
        fontFamily: F_TITULO,
        fontWeight: 900,
        fontSize: tam,
        color: fallo ? "#5A2A3A" : "#FFE3EE",
        textShadow: fallo ? "none" : `0 0 8px ${color}, 0 0 22px ${color}, 0 0 60px ${color}`,
        letterSpacing: 6,
        padding: "6px 26px",
        border: `5px solid ${fallo ? "#5A2A3A" : color}`,
        borderRadius: 18,
        boxShadow: fallo ? "none" : `0 0 30px ${color}, inset 0 0 20px ${color}`,
        ...style,
      }}
    >
      {texto}
    </div>
  );
};

/* ---------------- Objetos ---------------- */
/** Libreta bancaria antigua: abierta (abrir 0..1), cifra escrita a mano. */
export const Libreta: React.FC<{ abrir: number; escribir?: number; cifra?: string; titulo?: string; ancho?: number }> = ({
  abrir,
  escribir = 1,
  cifra = "$106.00",
  titulo,
  ancho = 760,
}) => {
  const h = ancho * 0.62;
  const portada = (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        width: ancho / 2,
        height: h,
        background: `linear-gradient(135deg, #3E5A3A, #2A3F28)`,
        borderRadius: "4px 14px 14px 4px",
        boxShadow: "inset 0 0 0 6px #23351F",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        transformOrigin: "0% 50%",
        transform: `perspective(1600px) rotateY(${-180 * abrir}deg)`,
        backfaceVisibility: "hidden",
      }}
    >
      <div style={{ fontFamily: F_TITULO, fontWeight: 700, fontSize: ancho * 0.035, color: "#D9C48A", letterSpacing: 4 }}>SAVINGS · AHORROS</div>
      <div style={{ width: ancho * 0.22, height: 3, background: "#D9C48A" }} />
      {titulo ? (
        <div style={{ fontFamily: F_TITULO, fontWeight: 900, fontSize: ancho * 0.07, color: P.dorado, textShadow: `0 0 20px ${P.dorado}88` }}>{titulo}</div>
      ) : (
        <div style={{ fontFamily: F_TITULO, fontWeight: 700, fontSize: ancho * 0.03, color: "#D9C48A" }}>N.º 1975</div>
      )}
    </div>
  );
  const lineas = new Array(8).fill(0);
  return (
    <div style={{ position: "relative", width: ancho, height: h }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#EFE2C2",
          borderRadius: 10,
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
          opacity: Math.min(1, abrir * 3),
          display: "flex",
        }}
      >
        {[0, 1].map((pg) => (
          <div key={pg} style={{ flex: 1, padding: "34px 30px", borderRight: pg === 0 ? "3px solid #CDBB93" : undefined, position: "relative" }}>
            {lineas.map((_, i) => (
              <div key={i} style={{ height: h / 10, borderBottom: "2px solid #C9B88F" }} />
            ))}
            {pg === 0 ? (
              <div style={{ position: "absolute", top: 30, left: 30, fontFamily: F_CIFRA, fontWeight: 700, fontSize: ancho * 0.022, color: "#8A7A58", letterSpacing: 2 }}>
                FECHA · DEPÓSITO · SALDO
              </div>
            ) : null}
            {pg === 0 ? (
              <div style={{ position: "absolute", top: h * 0.32, left: 34, fontFamily: F_MANO, fontSize: ancho * 0.045, color: "#4A5A7A" }}>3 · 1975</div>
            ) : null}
            {pg === 1 ? (
              <div
                style={{
                  position: "absolute",
                  top: h * 0.27,
                  left: 30,
                  fontFamily: F_MANO,
                  fontWeight: 700,
                  fontSize: ancho * 0.1,
                  color: "#1F2F5A",
                  clipPath: `inset(0 ${100 - escribir * 100}% 0 0)`,
                  transform: "rotate(-4deg)",
                }}
              >
                {cifra}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {portada}
    </div>
  );
};

export const Billete: React.FC<{ valor: string; ancho?: number; rot?: number; style?: React.CSSProperties }> = ({ valor, ancho = 300, rot = 0, style }) => (
  <div
    style={{
      width: ancho,
      height: ancho * 0.43,
      background: "linear-gradient(135deg, #A7BF92, #7E9A6A)",
      border: "5px solid #5E7A4E",
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 18px",
      transform: `rotate(${rot}deg)`,
      boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
      fontFamily: F_TITULO,
      fontWeight: 900,
      color: "#36502A",
      fontSize: ancho * 0.16,
      ...style,
    }}
  >
    <span>{valor}</span>
    <div style={{ width: ancho * 0.24, height: ancho * 0.24, borderRadius: "50%", border: "4px solid #5E7A4E", background: "#93AD80" }} />
    <span>{valor}</span>
  </div>
);

export const Maletin: React.FC<{ ancho?: number }> = ({ ancho = 620 }) => (
  <div style={{ position: "relative", width: ancho, height: ancho * 0.62 }}>
    <div style={{ position: "absolute", left: ancho * 0.38, top: -ancho * 0.07, width: ancho * 0.24, height: ancho * 0.1, border: `${ancho * 0.022}px solid #2A1A10`, borderBottom: "none", borderRadius: "14px 14px 0 0" }} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#4A2F1C, #3A2414)", borderRadius: 18, boxShadow: "0 30px 70px rgba(0,0,0,0.6)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: "6%", right: "6%", top: "10%", bottom: "8%", background: "#2A1A10", borderRadius: 10, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, padding: 12 }}>
        {new Array(12).fill(0).map((_, i) => (
          <div key={i} style={{ background: "linear-gradient(#A7BF92, #7E9A6A)", border: "3px solid #5E7A4E", borderRadius: 4, position: "relative" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: "40%", height: "18%", background: P.crema, opacity: 0.85 }} />
          </div>
        ))}
      </div>
    </div>
    {[0.25, 0.75].map((x) => (
      <div key={x} style={{ position: "absolute", left: ancho * x - 16, top: -6, width: 32, height: 18, background: P.dorado, borderRadius: 4 }} />
    ))}
  </div>
);

/** Trofeo dorado GENÉRICO (copa con asas): no es la estatuilla oficial. */
export const Trofeo: React.FC<{ alto?: number; brillo?: number }> = ({ alto = 300, brillo = 1 }) => {
  const f = useCurrentFrame();
  const destello = ((f * 3) % 200) / 200;
  return (
    <svg viewBox="0 0 160 260" width={(alto * 160) / 260} height={alto} style={{ overflow: "visible", filter: `drop-shadow(0 0 ${20 * brillo}px ${P.dorado}99)` }}>
      <defs>
        <linearGradient id="oro" x1="0" x2="1">
          <stop offset="0" stopColor="#9A6E1E" />
          <stop offset="0.45" stopColor="#F6D27A" />
          <stop offset="0.55" stopColor="#FFF0B8" />
          <stop offset="1" stopColor="#A87A22" />
        </linearGradient>
      </defs>
      <path d="M30 20 L130 20 Q132 96 80 120 Q28 96 30 20 Z" fill="url(#oro)" />
      <path d="M30 34 Q2 36 6 62 Q10 88 40 90" stroke="url(#oro)" strokeWidth={10} fill="none" />
      <path d="M130 34 Q158 36 154 62 Q150 88 120 90" stroke="url(#oro)" strokeWidth={10} fill="none" />
      <rect x={70} y={118} width={20} height={60} fill="url(#oro)" />
      <path d="M44 178 L116 178 L124 204 L36 204 Z" fill="url(#oro)" />
      <rect x={26} y={204} width={108} height={40} rx={4} fill="#3A2414" />
      <path d="M80 44 l7 14 15 2 -11 11 3 15 -14 -7 -14 7 3 -15 -11 -11 15 -2 Z" fill="#FFF3C8" opacity={0.85} />
      <rect x={30 + destello * 140} y={20} width={10} height={100} fill="rgba(255,255,255,0.35)" transform="skewX(-20)" />
    </svg>
  );
};

/* ---------------- Sonido ---------------- */
export const Sfx: React.FC<{ archivo: string; en: number; vol?: number; dur?: number }> = ({ archivo, en, vol = 0.6, dur = 60 }) => (
  <Sequence from={Math.max(0, Math.round(en))} durationInFrames={dur} layout="none">
    <Audio src={staticFile(archivo)} volume={vol} />
  </Sequence>
);

export const Tics: React.FC<{ desde: number; pasos: number; cada: number; vol?: number }> = ({ desde, pasos, cada, vol = 0.35 }) => (
  <>
    {new Array(Math.max(0, pasos)).fill(0).map((_, i) => (
      <Sfx key={i} archivo="audio/tic.mp3" en={desde + i * cada} vol={vol} dur={8} />
    ))}
  </>
);

export const Destello: React.FC<{ en: number; color?: string; dur?: number }> = ({ en, color = "#FFFFFF", dur = 10 }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [en, en + 2, en + dur], [0, 1, 0], clampI);
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: color, opacity: o, zIndex: 35 }} />;
};

export const Aparece: React.FC<{ desde: number; children: React.ReactNode; style?: React.CSSProperties; escala?: boolean }> = ({ desde, children, style, escala = true }) => {
  const f = useCurrentFrame();
  if (f < desde) return null;
  const p = rebote(f, desde, 30, 14);
  return <div style={{ position: "absolute", opacity: Math.min(1, p * 1.4), transform: escala ? `scale(${0.7 + 0.3 * p})` : `translateY(${(1 - p) * 40}px)`, ...style }}>{children}</div>;
};

export { Img };

/** Plano: se muestra entre `desde` y `hasta` con un fundido corto de entrada. */
export const Plano: React.FC<{ desde: number; hasta: number; children: React.ReactNode; fundido?: number }> = ({ desde, hasta, children, fundido = 8 }) => {
  const f = useCurrentFrame();
  if (f < desde || f >= hasta + fundido) return null;
  const o = Math.min(interpolate(f, [desde, desde + fundido], [desde === 0 ? 1 : 0, 1], clampI), interpolate(f, [hasta, hasta + fundido], [1, 0], clampI));
  return <AbsoluteFill style={{ opacity: f >= hasta ? o : Math.min(1, o), overflow: "hidden" }}>{children}</AbsoluteFill>;
};
