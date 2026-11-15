import React, { createContext, useContext } from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { D, F_CIFRA, F_CITA, clampI, miles, prog, rebote } from "./estilo";

/** Pista que se está exportando (mezcla completa o una sola pista para separarlas). */
export type Pista = "mezcla" | "voz" | "musica" | "efectos";
export const PistaContext = createContext<Pista>("mezcla");
export const usarPista = (tipo: "voz" | "musica" | "efectos") => {
  const p = useContext(PistaContext);
  return p === "mezcla" || p === tipo;
};

/** Efecto de sonido sincronizado con un fotograma, a volumen discreto. */
export const Efecto: React.FC<{ archivo: string; en: number; vol?: number; dur?: number }> = ({ archivo, en, vol = 0.45, dur = 45 }) => {
  const on = usarPista("efectos");
  if (!on) return null;
  return (
    <Sequence from={Math.max(0, Math.round(en))} durationInFrames={dur} layout="none">
      <Audio src={staticFile(`audio/downey/${archivo}.mp3`)} volume={vol} />
    </Sequence>
  );
};

/** Caída con gravedad: acelera, rebota una vez (pequeño) y queda en reposo. */
export const caida = (f: number, inicio: number, desde: number, hasta: number, dur = 16) => {
  if (f <= inicio) return desde;
  const t = (f - inicio) / dur;
  if (t < 1) return desde + (hasta - desde) * t * t;
  const u = (f - inicio - dur) / 7;
  if (u < 1) return hasta - Math.abs(hasta - desde) * 0.05 * Math.sin(Math.PI * u);
  return hasta;
};

/** Rótulo de fecha/lugar: sans condensada gruesa, ≥ 48 px, con sombra. */
export const Rotulo: React.FC<{ texto: string; desde: number; hasta?: number; x?: number; y?: number; tam?: number; color?: string; centro?: boolean }> = ({
  texto,
  desde,
  hasta = 1e9,
  x = 90,
  y = 80,
  tam = 56,
  color = D.blanco,
  centro = false,
}) => {
  const f = useCurrentFrame();
  if (f < desde) return null;
  const p = Math.min(prog(f, desde, 18), 1 - prog(f, hasta - 14, 14));
  return (
    <div
      style={{
        position: "absolute",
        left: centro ? 0 : x,
        right: centro ? 0 : undefined,
        top: y,
        textAlign: centro ? "center" : "left",
        opacity: p,
        transform: `translateY(${(1 - p) * 16}px)`,
        fontFamily: F_CIFRA,
        fontWeight: 700,
        fontSize: tam,
        letterSpacing: 4,
        color,
        textShadow: "0 3px 10px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.6)",
        zIndex: 30,
      }}
    >
      {texto}
    </div>
  );
};

/** Cita en serif elegante. */
export const Cita: React.FC<{ texto: string; desde: number; y?: number; tam?: number; color?: string }> = ({ texto, desde, y = 120, tam = 64, color = D.blanco }) => {
  const f = useCurrentFrame();
  if (f < desde) return null;
  const p = prog(f, desde, 22);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", opacity: p, zIndex: 30 }}>
      <span style={{ fontFamily: F_CITA, fontStyle: "italic", fontWeight: 700, fontSize: tam, color, textShadow: "0 3px 14px rgba(0,0,0,0.6)" }}>«{texto}»</span>
    </div>
  );
};

/** Contador animado (cifras en Oswald). */
export const Contador: React.FC<{ desde: number; hasta: number; valor: number; prefijo?: string; tam?: number; color?: string }> = ({ desde, hasta, valor, prefijo = "$", tam = 120, color = D.dorado }) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [desde, Math.max(desde + 1, hasta)], [0, valor], { ...clampI, easing: (t) => 1 - Math.pow(1 - t, 3) });
  return (
    <div style={{ fontFamily: F_CIFRA, fontWeight: 700, fontSize: tam, color, letterSpacing: 2, fontVariantNumeric: "tabular-nums", textShadow: "0 4px 16px rgba(0,0,0,0.5)" }}>
      {prefijo}
      {miles(v)}
    </div>
  );
};

/** Sello que cae y se estampa (con rebote mínimo) sobre una superficie. */
export const Sello: React.FC<{ texto: string; en: number; color?: string; tam?: number; rot?: number }> = ({ texto, en, color = "#C8302C", tam = 72, rot = -10 }) => {
  const f = useCurrentFrame();
  if (f < en - 10) return null;
  const s = interpolate(f, [en - 10, en], [2.2, 1], { ...clampI, easing: (t) => t * t });
  const o = interpolate(f, [en - 10, en - 6], [0, 1], clampI);
  return (
    <div
      style={{
        border: `8px solid ${color}`,
        color,
        fontFamily: F_CIFRA,
        fontWeight: 700,
        fontSize: tam,
        letterSpacing: 4,
        padding: "4px 26px",
        transform: `rotate(${rot}deg) scale(${s})`,
        opacity: o,
        background: "rgba(255,255,255,0.08)",
        whiteSpace: "nowrap",
      }}
    >
      {texto}
    </div>
  );
};

/** Partículas de polvo en un haz de luz (flotan despacio: lo único que flota). */
export const Polvo: React.FC<{ x: number; y: number; ancho: number; alto: number; n?: number }> = ({ x, y, ancho, alto, n = 40 }) => {
  const f = useCurrentFrame();
  return (
    <>
      {new Array(n).fill(0).map((_, i) => {
        const px = x + ((i * 97) % ancho) + Math.sin(f / 50 + i) * 12;
        const py = y + (((i * 53) % alto) + f * 0.25 * (i % 3 ? 1 : -0.6) + alto * 2) % alto;
        return <div key={i} style={{ position: "absolute", left: px, top: py, width: 3 + (i % 3), height: 3 + (i % 3), borderRadius: "50%", background: "#FFF2D0", opacity: 0.35 + 0.35 * Math.abs(Math.sin(f / 30 + i)) }} />;
      })}
    </>
  );
};

/** Partículas con gravedad que caen y se posan en `suelo` (confeti o chispas). */
export const Particulas: React.FC<{ desde: number; x: number; y: number; ancho: number; suelo: number; n?: number; colores: string[]; tam?: number; vida?: number; apagar?: boolean }> = ({
  desde,
  x,
  y,
  ancho,
  suelo,
  n = 60,
  colores,
  tam = 10,
  vida = 9999,
  apagar = false,
}) => {
  const f = useCurrentFrame();
  if (f < desde) return null;
  return (
    <>
      {new Array(n).fill(0).map((_, i) => {
        const t0 = desde + ((i * 7) % 60);
        const t = f - t0;
        if (t < 0) return null;
        const px = x + ((i * 131) % ancho) + Math.sin(i) * 20 + (apagar ? (i % 2 ? 1 : -1) * t * 2 : 0);
        const caidaY = y + 0.5 * 0.9 * t * t;
        const enSuelo = caidaY >= suelo;
        const py = Math.min(suelo - tam / 2, caidaY);
        const edad = enSuelo ? t - Math.sqrt((2 * (suelo - y)) / 0.9) : 0;
        const op = apagar ? Math.max(0, 1 - edad / 10) : enSuelo && edad > vida ? 0 : 1;
        if (op <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: apagar ? tam / 2 : tam,
              height: apagar ? tam / 2 : tam * 0.6,
              background: colores[i % colores.length],
              borderRadius: apagar ? "50%" : 2,
              transform: enSuelo ? "rotate(0deg)" : `rotate(${t * 12 + i * 30}deg)`,
              opacity: op,
              boxShadow: apagar ? `0 0 8px ${colores[i % colores.length]}` : undefined,
            }}
          />
        );
      })}
    </>
  );
};

/** Pantalla final con espacio para las tarjetas de YouTube. */
export const PantallaFinal: React.FC<{ desde: number; boton: number }> = ({ desde, boton }) => {
  const f = useCurrentFrame();
  if (f < Math.min(desde, boton)) return null;
  return (
    <AbsoluteFill style={{ zIndex: 35 }}>
      {f >= boton ? (
        <div style={{ position: "absolute", left: 90, bottom: 150, transform: `scale(${rebote(f, boton, 30, 10) * (1 + 0.035 * Math.sin(f / 6))})`, transformOrigin: "0 50%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "20px 46px", borderRadius: 999, background: D.sirena, boxShadow: `0 0 40px ${D.sirena}88`, fontFamily: F_CIFRA, fontWeight: 700, fontSize: 56, color: "#FFF", letterSpacing: 4 }}>
            <svg width={50} height={50} viewBox="0 0 56 56" style={{ transform: `rotate(${Math.sin(f / 3) * (f - boton < 40 ? 18 : 4)}deg)` }}>
              <path d="M28 6 C18 6 13 14 13 24 V34 L7 42 H49 L43 34 V24 C43 14 38 6 28 6 Z" fill="#FFF" />
              <circle cx={28} cy={48} r={6} fill="#FFF" />
            </svg>
            SUSCRÍBETE
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
