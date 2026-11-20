import React from "react";
import { useCurrentFrame } from "remotion";
import { D, lerp } from "./estilo";

/*
 * Personajes ORIGINALES con proporciones humanas (cabeza ≈ 1/7 de la altura).
 * Sistema de coordenadas común: SVG de 200 × 460; la planta del pie está en
 * y = PIE (452). Sentado en un asiento: la cadera (superficie del asiento)
 * queda en y = CADERA (236) y los pies en y = PIE_SENTADO (384).
 */
export const PIE = 452;
export const CADERA = 236;
export const PIE_SENTADO = 384;
export const PIE_SUELO = 262; // sentado en el suelo con las piernas cruzadas
const PIERNA = PIE - CADERA - 6; // 210

/** Coloca un personaje de `alto` px con los pies exactamente en `suelo`. */
export const topDePie = (suelo: number, alto: number) => suelo - PIE * (alto / 460);
/** Coloca un personaje sentado con la cadera sobre un asiento a `asiento` px. */
export const topSentado = (asiento: number, alto: number) => asiento - CADERA * (alto / 460);
/** Avance horizontal (en unidades del SVG) por radián de fase al caminar: los pies no resbalan. */
export const AMPLITUD_PASO = 22;
export const AVANCE_POR_RADIAN = (2 * PIERNA * Math.sin((AMPLITUD_PASO * Math.PI) / 180)) / Math.PI;

export type Expresion = "neutral" | "serio" | "triste" | "decidido" | "sonrisa";
export type Ropa = "preso" | "traje" | "esmoquin" | "epoca" | "casual" | "taller" | "nino" | "armadura";
export type Brazo = { hombro: number; codo: number };
export const POSE = {
  reposo: { izq: { hombro: 6, codo: 4 }, der: { hombro: 6, codo: 4 } },
  sostener: { izq: { hombro: 22, codo: -96 }, der: { hombro: 22, codo: -96 } },
  manosRodillas: { izq: { hombro: 12, codo: -40 }, der: { hombro: 12, codo: -40 } },
};
export const mezclar = (a: Brazo, b: Brazo, p: number): Brazo => ({ hombro: lerp(a.hombro, b.hombro, p), codo: lerp(a.codo, b.codo, p) });

const ROPA: Record<Ropa, { torso: string; torsoSombra: string; manga: string; pantalon: string; zapato: string; cuello?: string }> = {
  preso: { torso: "#5C7FA6", torsoSombra: "#47668A", manga: "#5C7FA6", pantalon: "#3D5675", zapato: "#2A2A2E", cuello: "#5C7FA6" },
  traje: { torso: "#2E3440", torsoSombra: "#232832", manga: "#2E3440", pantalon: "#2A2F3A", zapato: "#151518", cuello: "#F2F2F2" },
  esmoquin: { torso: "#15171C", torsoSombra: "#0D0E12", manga: "#15171C", pantalon: "#121318", zapato: "#0A0A0C", cuello: "#F7F7F7" },
  epoca: { torso: "#2B2B30", torsoSombra: "#1F1F24", manga: "#2B2B30", pantalon: "#3A3A40", zapato: "#18181A", cuello: "#EDEDED" },
  casual: { torso: "#3B4A5E", torsoSombra: "#2E3B4C", manga: "#3B4A5E", pantalon: "#2F4A6E", zapato: "#2A2420", cuello: "#E6E1D6" },
  taller: { torso: "#6E7378", torsoSombra: "#5A5F64", manga: "#6E7378", pantalon: "#2F4A6E", zapato: "#2A2420" },
  nino: { torso: "#C8673A", torsoSombra: "#A9552F", manga: "#C8673A", pantalon: "#3E5A7A", zapato: "#2A2420" },
  armadura: { torso: "#9AA4AE", torsoSombra: "#737D88", manga: "#8C96A0", pantalon: "#828C96", zapato: "#56606A" },
};

const rad = (g: number) => (g * Math.PI) / 180;
const dir = (lado: number, ang: number): [number, number] => [lado * Math.sin(rad(ang)), Math.cos(rad(ang))];

type PropsRobert = {
  alto?: number;
  vista?: "frente" | "espalda" | "perfil" | "sentado" | "suelo";
  ropa?: Ropa;
  edad?: "nino" | "joven" | "adulto";
  expresion?: Expresion;
  brazoIzq?: Brazo;
  brazoDer?: Brazo;
  paso?: number; // fase al caminar (perfil)
  objetoDer?: React.ReactNode; // se dibuja DETRÁS de la mano derecha
  objetoCentro?: React.ReactNode; // objeto sujeto con las dos manos (detrás de las manos, delante del torso)
  bombin?: boolean;
  bastonEnSuelo?: boolean;
  gafas?: boolean; // gafas tintadas
  casco?: number; // 0..1 casco de la armadura (baja y se cierra)
  brillo?: number; // 0..1 luces de la armadura (ojos y líneas)
  repulsor?: number; // 0..1 palma derecha iluminada

  luz?: string; // luz de borde
  sombra?: boolean;
  semilla?: number;
  style?: React.CSSProperties;
};

export const Robert: React.FC<PropsRobert> = ({
  alto = 460,
  vista = "frente",
  ropa = "traje",
  edad = "adulto",
  expresion = "neutral",
  brazoIzq = POSE.reposo.izq,
  brazoDer = POSE.reposo.der,
  paso,
  objetoDer,
  objetoCentro,
  bombin = false,
  bastonEnSuelo = false,
  gafas = false,
  casco = 0,
  brillo = 0,
  repulsor = 0,
  luz,
  sombra = true,
  semilla = 0,
  style,
}) => {
  const f = useCurrentFrame();
  const R = ROPA[ropa];
  const parpadeo = (f + semilla * 31) % 140 < 4;
  const respira = Math.sin(f / 16 + semilla) * 0.8;
  const perilla = edad === "adulto";
  const ancho = (alto * 200) / 460;

  /* ---------- brazos (dos segmentos), mano encima del objeto ---------- */
  const brazo = (sx: number, sy: number, lado: number, b: Brazo, manga: string) => {
    const [ax, ay] = dir(lado, b.hombro);
    const ex = sx + ax * 84;
    const ey = sy + ay * 84;
    const [bx, by] = dir(lado, b.hombro + b.codo);
    const hx = ex + bx * 78;
    const hy = ey + by * 78;
    return { seg: (
      <g>
        <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={manga} strokeWidth={21} strokeLinecap="round" />
        <line x1={ex} y1={ey} x2={hx} y2={hy} stroke={manga} strokeWidth={18} strokeLinecap="round" />
      </g>
    ), hx, hy };
  };

  /* ---------- cabeza ---------- */
  const cabeza = (frente: boolean) => (
    <g transform={`translate(0 ${respira * 0.3})`}>
      <rect x={91} y={76} width={18} height={24} rx={6} fill={D.pielSombra} />
      <ellipse cx={100} cy={52} rx={26} ry={31} fill={D.piel} />
      {frente ? <path d="M100 22 Q124 26 126 52 Q124 78 104 84 Q118 60 112 30 Z" fill={D.pielSombra} opacity={0.35} /> : null}
      <ellipse cx={74} cy={56} rx={4} ry={7} fill={D.pielSombra} />
      <ellipse cx={126} cy={56} rx={4} ry={7} fill={D.pielSombra} />
      {frente ? (
        <>
          {/* pelo */}
          <path d="M72 52 Q64 20 94 8 Q120 2 132 22 Q136 36 128 48 Q124 32 112 28 Q96 24 86 32 Q78 40 72 52 Z" fill={D.pelo} />
          <path d="M84 20 Q100 8 122 16" stroke="#5A4234" strokeWidth={3} fill="none" opacity={0.7} />
          <path d="M80 30 Q96 18 118 24" stroke="#5A4234" strokeWidth={2.5} fill="none" opacity={0.6} />
          <path d="M74 44 Q76 34 84 28" stroke="#5A4234" strokeWidth={2.5} fill="none" opacity={0.5} />
          {/* cejas */}
          <path
            d={expresion === "decidido" || expresion === "serio" ? "M83 42 L96 45 M104 45 L117 42" : expresion === "triste" ? "M83 45 L96 41 M104 41 L117 45" : "M83 43 Q90 40 96 43 M104 43 Q110 40 117 43"}
            stroke={D.pelo}
            strokeWidth={3.5}
            strokeLinecap="round"
            fill="none"
          />
          {/* ojos */}
          {expresion === "sonrisa" ? (
            <>
              <path d="M85 52 Q90 48 95 52" stroke={D.tinta} strokeWidth={2.6} fill="none" strokeLinecap="round" />
              <path d="M105 52 Q110 48 115 52" stroke={D.tinta} strokeWidth={2.6} fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <ellipse cx={90} cy={51} rx={5} ry={parpadeo ? 0.6 : 3.2} fill="#FFFFFF" />
              <ellipse cx={110} cy={51} rx={5} ry={parpadeo ? 0.6 : 3.2} fill="#FFFFFF" />
              {!parpadeo ? (
                <>
                  <circle cx={90.5} cy={51} r={2.4} fill="#3A2618" />
                  <circle cx={110.5} cy={51} r={2.4} fill="#3A2618" />
                </>
              ) : null}
            </>
          )}
          {gafas ? (
            <g>
              <rect x={79} y={44} width={19} height={14} rx={5} fill="rgba(150,80,40,0.55)" stroke="#2A2220" strokeWidth={2} />
              <rect x={102} y={44} width={19} height={14} rx={5} fill="rgba(150,80,40,0.55)" stroke="#2A2220" strokeWidth={2} />
              <path d="M98 50 L102 50 M79 49 L74 47 M121 49 L126 47" stroke="#2A2220" strokeWidth={2} />
              <path d="M82 47 L88 46" stroke="rgba(255,255,255,0.6)" strokeWidth={2} strokeLinecap="round" />
            </g>
          ) : null}
          {/* nariz y boca */}
          <path d="M100 54 L97 66 L102 67" stroke={D.pielSombra} strokeWidth={2.4} fill="none" strokeLinecap="round" />
          {perilla ? (
            <g fill={D.pelo}>
              <path d="M85 71 Q100 63 115 71 L113 75 Q100 69 87 75 Z" />
              <path d="M86 73 L89 73 L91 86 L88 86 Z" />
              <path d="M111 73 L114 73 L112 86 L109 86 Z" />
              <path d="M88 85 Q100 97 112 85 L110 91 Q100 101 90 91 Z" />
              <ellipse cx={100} cy={81} rx={3.2} ry={3} />
            </g>
          ) : null}
          <path
            d={expresion === "sonrisa" ? "M92 74 Q100 80 108 74" : expresion === "triste" ? "M93 77 Q100 73 107 77" : "M93 75 L107 75"}
            stroke={perilla ? "#E9C9B4" : "#8A4A3A"}
            strokeWidth={2.4}
            fill="none"
            strokeLinecap="round"
          />
        </>
      ) : (
        <path d="M73 56 Q70 18 100 16 Q130 18 127 56 Q124 78 100 80 Q76 78 73 56 Z" fill={D.pelo} />
      )}
      {bombin ? (
        <>
          <ellipse cx={100} cy={24} rx={36} ry={6} fill="#1A1A1E" />
          <path d="M76 24 Q76 -2 100 -2 Q124 -2 124 24 Z" fill="#1A1A1E" />
        </>
      ) : null}
      {casco > 0 ? (
        <g transform={`translate(0 ${(1 - casco) * -70})`} opacity={Math.min(1, casco * 2)}>
          <path d="M70 52 Q70 14 100 12 Q130 14 130 52 Q130 84 100 90 Q70 84 70 52 Z" fill="#A6B0BA" />
          <path d="M100 12 Q130 14 130 52 Q130 84 100 90 Z" fill="#848E98" />
          {frente ? (
            <>
              <path d="M80 46 L96 50 L94 56 L80 54 Z M104 50 L120 46 L120 54 L106 56 Z" fill="#0E141A" />
              <path d="M80 46 L96 50 L94 56 L80 54 Z M104 50 L120 46 L120 54 L106 56 Z" fill={`rgba(170,235,255,${brillo})`} />
              <circle cx={88} cy={51} r={9} fill={`rgba(140,220,255,${0.3 * brillo})`} />
              <circle cx={112} cy={51} r={9} fill={`rgba(140,220,255,${0.3 * brillo})`} />
              <path d="M100 58 L100 80 M88 76 L112 76" stroke="#5E6670" strokeWidth={2.5} />
            </>
          ) : null}
          <path d="M78 30 Q90 18 106 18" stroke="rgba(255,255,255,0.55)" strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
      ) : null}
    </g>
  );

  /* ---------- niño: el mismo personaje a escala de 8 años ---------- */
  const escalaNino = edad === "nino";

  /* ---------- torso ---------- */
  const torso = (espalda: boolean) => (
    <g>
      <path d="M66 112 Q68 98 100 96 Q132 98 134 112 L130 240 L70 240 Z" fill={R.torso} />
      <path d="M100 98 Q132 98 134 112 L130 240 L104 240 Z" fill={R.torsoSombra} opacity={0.6} />
      {!espalda && R.cuello ? <path d="M90 98 L100 124 L110 98 Z" fill={R.cuello} /> : null}
      {!espalda && ropa === "traje" ? <path d="M100 124 L97 170 L100 176 L103 170 Z" fill="#7A2A2A" /> : null}
      {!espalda && ropa === "esmoquin" ? <path d="M92 104 L100 108 L108 104 L108 112 L100 108 L92 112 Z" fill="#0A0A0A" /> : null}
      {!espalda && (ropa === "traje" || ropa === "esmoquin" || ropa === "epoca") ? (
        <>
          <path d="M88 100 L80 140 L100 160 Z" fill={R.torsoSombra} />
          <path d="M112 100 L120 140 L100 160 Z" fill={R.torsoSombra} />
        </>
      ) : null}
      {!espalda && ropa === "preso" ? (
        <>
          <rect x={108} y={128} width={18} height={12} rx={2} fill="#E9E6DF" />
          <line x1={110} y1={134} x2={124} y2={134} stroke="#3D5675" strokeWidth={2} />
          <path d="M100 124 L100 236" stroke="#47668A" strokeWidth={2} />
        </>
      ) : null}
      {!espalda && ropa === "casual" ? <path d="M86 100 L100 132 L114 100" fill="#E6E1D6" /> : null}
      {!espalda && ropa === "nino" ? [140, 170, 200].map((y) => <rect key={y} x={70} y={y} width={60} height={10} fill="#E9D3A4" opacity={0.7} />) : null}
      {espalda ? <path d="M100 100 L100 236" stroke={R.torsoSombra} strokeWidth={3} /> : null}
      {ropa === "armadura" ? (
        <g>
          <path d="M72 120 L100 140 L128 120 M76 172 L100 188 L124 172 M74 214 L126 214" stroke="#5E6670" strokeWidth={3} fill="none" />
          {!espalda ? <path d="M88 132 L100 142 L112 132 M90 178 L100 186 L110 178" stroke={`rgba(140,220,255,${0.3 + 0.7 * brillo})`} strokeWidth={3.5} fill="none" strokeLinecap="round" /> : null}
          <path d="M78 104 Q100 98 122 104" stroke="#C6CDD4" strokeWidth={3} fill="none" opacity={0.7} />
        </g>
      ) : null}
      {luz ? <path d="M68 116 Q66 180 70 238" stroke={luz} strokeWidth={4} fill="none" opacity={0.85} /> : null}
    </g>
  );

  /* ---------- piernas ---------- */
  const piernasDePie = (
    <g>
      <path d="M72 236 L128 236 L126 300 L104 300 L103 440 L80 440 L74 300 Z" fill={R.pantalon} />
      <path d="M104 300 L126 300 L124 440 L102 440 Z" fill={R.pantalon} />
      <path d="M100 244 L100 300" stroke="rgba(0,0,0,0.25)" strokeWidth={2} />
      <path d="M78 438 Q78 452 96 452 L104 452 L104 438 Z" fill={R.zapato} />
      <path d="M100 438 L100 452 L118 452 Q126 452 124 438 Z" fill={R.zapato} />
    </g>
  );
  const piernasSentado = (
    <g>
      {/* muslos en escorzo hacia la cámara y espinillas verticales hasta el suelo */}
      <path d="M70 230 L130 230 L136 268 L64 268 Z" fill={R.pantalon} />
      <path d="M72 236 L128 236 L130 252 L70 252 Z" fill="rgba(255,255,255,0.12)" />
      <ellipse cx={80} cy={268} rx={20} ry={13} fill={R.pantalon} />
      <ellipse cx={120} cy={268} rx={20} ry={13} fill={R.pantalon} />
      <ellipse cx={80} cy={264} rx={12} ry={6} fill="rgba(255,255,255,0.14)" />
      <ellipse cx={120} cy={264} rx={12} ry={6} fill="rgba(255,255,255,0.14)" />
      <rect x={66} y={276} width={68} height={10} fill="rgba(0,0,0,0.25)" />
      <rect x={70} y={266} width={24} height={110} rx={9} fill={R.pantalon} />
      <rect x={106} y={266} width={24} height={110} rx={9} fill={R.pantalon} />
      <path d="M68 372 Q68 384 84 384 L96 384 L96 372 Z" fill={R.zapato} />
      <path d="M104 372 L104 384 L118 384 Q132 384 132 372 Z" fill={R.zapato} />
    </g>
  );

  const piernasSuelo = (
    <g>
      <path d="M60 236 Q100 226 140 236 L150 256 Q100 266 50 256 Z" fill={R.pantalon} />
      <path d="M40 250 Q70 236 104 252 Q74 266 44 262 Z" fill={R.pantalon} />
      <path d="M160 250 Q130 236 96 252 Q126 266 156 262 Z" fill={R.pantalon} />
      <ellipse cx={46} cy={256} rx={14} ry={7} fill={R.zapato} />
      <ellipse cx={154} cy={256} rx={14} ry={7} fill={R.zapato} />
    </g>
  );

  const contenido = (() => {
    if (vista === "perfil") {
      const s = paso === undefined ? 0 : Math.sin(paso);
      const bob = paso === undefined ? 0 : -Math.abs(Math.cos(paso)) * 4;
      const pierna = (fase: number, color: string) => {
        const a = fase * AMPLITUD_PASO;
        const [dx, dy] = dir(1, a);
        const kx = 100 + dx * 105;
        const ky = CADERA + dy * 105;
        const flex = Math.max(0, -fase) * 30;
        const [ex, ey] = dir(1, a - flex);
        const px = kx + ex * 105;
        const py = Math.min(PIE - 10, ky + ey * 105);
        return (
          <g>
            <line x1={100} y1={CADERA} x2={kx} y2={ky} stroke={color} strokeWidth={24} strokeLinecap="round" />
            <line x1={kx} y1={ky} x2={px} y2={py} stroke={color} strokeWidth={21} strokeLinecap="round" />
            <path d={`M${px - 10} ${py - 6} L${px + 22} ${py - 4} Q${px + 26} ${py + 8} ${px + 14} ${py + 8} L${px - 10} ${py + 8} Z`} fill={R.zapato} />
          </g>
        );
      };
      const lejano = brazo(102, 112, 1, { hombro: paso === undefined ? 4 : s * 26, codo: 26 }, R.torsoSombra);
      const cercano = brazo(102, 112, 1, { hombro: paso === undefined ? 4 : -s * 26, codo: 26 }, R.manga);
      return (
        <g transform={`translate(0 ${bob})`}>
          {pierna(-s, R.pantalon)}
          {lejano.seg}
          <circle cx={lejano.hx} cy={lejano.hy} r={9} fill={D.pielSombra} />
          {pierna(s, R.pantalon)}
          <path d="M80 112 Q86 98 104 96 Q122 98 124 112 L122 240 L80 240 Z" fill={R.torso} />
          {luz ? <path d="M82 116 Q80 180 82 238" stroke={luz} strokeWidth={4} fill="none" opacity={0.85} /> : null}
          <rect x={92} y={76} width={18} height={24} rx={6} fill={D.pielSombra} />
          <ellipse cx={104} cy={52} rx={24} ry={31} fill={D.piel} />
          <path d="M126 50 L134 60 L126 64 Z" fill={D.piel} />
          <path d="M80 50 Q78 18 104 16 Q128 18 128 38 Q116 30 104 34 Q96 36 94 54 Q86 56 80 50 Z" fill={D.pelo} />
          <ellipse cx={96} cy={56} rx={4} ry={7} fill={D.pielSombra} />
          <ellipse cx={117} cy={50} rx={3} ry={parpadeo ? 0.6 : 3} fill={D.tinta} />
          <path d="M110 42 L122 42" stroke={D.pelo} strokeWidth={3} strokeLinecap="round" />
          {perilla ? <path d="M112 72 Q122 70 126 74 L122 86 Q114 88 110 82 Z" fill={D.pelo} /> : null}
          {bombin ? (
            <>
              <ellipse cx={104} cy={22} rx={34} ry={5} fill="#1A1A1E" />
              <path d="M82 22 Q82 -2 104 -2 Q126 -2 126 22 Z" fill="#1A1A1E" />
            </>
          ) : null}
          {cercano.seg}
          <circle cx={cercano.hx} cy={cercano.hy} r={9} fill={D.piel} />
        </g>
      );
    }
    const espalda = vista === "espalda";
    const sentado = vista === "sentado" || vista === "suelo";
    const bI = brazo(68, 112, -1, brazoIzq, R.manga);
    const bD = brazo(132, 112, 1, brazoDer, R.manga);
    return (
      <g>
        {vista === "suelo" ? piernasSuelo : sentado ? piernasSentado : piernasDePie}
        {ropa === "epoca" && bastonEnSuelo ? (
          <g>
            <line x1={bD.hx} y1={bD.hy} x2={bD.hx + 6} y2={sentado ? PIE_SENTADO : PIE} stroke="#3A2A1E" strokeWidth={6} strokeLinecap="round" />
            <path d={`M${bD.hx - 14} ${bD.hy - 2} Q${bD.hx - 14} ${bD.hy - 18} ${bD.hx} ${bD.hy - 16}`} stroke="#3A2A1E" strokeWidth={6} fill="none" />
          </g>
        ) : null}
        <g transform={`translate(0 ${respira * 0.2})`}>{torso(espalda)}</g>
        {bI.seg}
        {bD.seg}
        {objetoCentro ? <g transform="translate(100 196)">{objetoCentro}</g> : null}
        {objetoDer ? <g transform={`translate(${bD.hx} ${bD.hy})`}>{objetoDer}</g> : null}
        <circle cx={bI.hx} cy={bI.hy} r={9} fill={ropa === "armadura" ? "#8C96A0" : D.piel} />
        <circle cx={bD.hx} cy={bD.hy} r={9} fill={ropa === "armadura" ? "#8C96A0" : D.piel} />
        {repulsor > 0 ? (
          <g>
            <circle cx={bD.hx} cy={bD.hy} r={60 * repulsor} fill="rgba(140,220,255,0.35)" />
            <circle cx={bD.hx} cy={bD.hy} r={22 * repulsor} fill="rgba(225,250,255,0.95)" />
          </g>
        ) : null}
        <g transform={escalaNino ? "translate(100 98) scale(1.32) translate(-100 -98)" : undefined}>{cabeza(!espalda)}</g>
      </g>
    );
  })();

  const pieY = vista === "sentado" ? PIE_SENTADO : vista === "suelo" ? PIE_SUELO : PIE;
  return (
    <svg viewBox="0 0 200 460" width={ancho} height={alto} style={{ overflow: "visible", ...style }}>
      {sombra ? <ellipse cx={vista === "perfil" ? 108 : 100} cy={pieY} rx={vista === "perfil" ? 58 : 50} ry={8} fill="rgba(0,0,0,0.3)" /> : null}
      {escalaNino ? (
        <g transform={`translate(100 ${pieY}) scale(0.6) translate(-100 ${-pieY})`}>
          {/* cabeza proporcionalmente más grande en el niño */}
          <g>{contenido}</g>
        </g>
      ) : (
        contenido
      )}
    </svg>
  );
};

/* ============================================================
 * Siluetas de personajes secundarios reales (sin rasgos): padre
 * cineasta, Susan, el director, el actor que le ayudó, agentes,
 * ejecutivos y público. Misma planta del pie (y = 452).
 * ============================================================ */
export const SiluetaD: React.FC<{
  alto?: number;
  color?: string;
  borde?: string;
  tipo?: "hombre" | "mujer" | "corpulento";
  gorra?: boolean;
  policia?: boolean;
  camara16?: boolean;
  carpeta?: boolean;
  brazoDer?: Brazo;
  brazoIzq?: Brazo;
  espalda?: boolean;
  sombra?: boolean;
  aplaudir?: number;
  style?: React.CSSProperties;
}> = ({ alto = 460, color = "#14181E", borde, tipo = "hombre", gorra, policia, camara16, carpeta, brazoDer = { hombro: 6, codo: 4 }, brazoIzq = { hombro: 6, codo: 4 }, sombra = true, aplaudir, style }) => {
  const f = useCurrentFrame();
  const anchoT = tipo === "corpulento" ? 1.22 : tipo === "mujer" ? 0.9 : 1;
  const brazo = (sx: number, lado: number, b: Brazo) => {
    const [ax, ay] = dir(lado, b.hombro);
    const ex = sx + ax * 84;
    const ey = 112 + ay * 84;
    const [bx, by] = dir(lado, b.hombro + b.codo);
    return { d: `M${sx} 112 L${ex} ${ey} L${ex + bx * 78} ${ey + by * 78}`, hx: ex + bx * 78, hy: ey + by * 78 };
  };
  const ap = aplaudir !== undefined ? Math.abs(Math.sin(f / 3)) : 0;
  const bD = brazo(100 + 34 * anchoT, 1, aplaudir !== undefined ? { hombro: 30, codo: -120 + ap * 14 } : brazoDer);
  const bI = brazo(100 - 34 * anchoT, -1, aplaudir !== undefined ? { hombro: 30, codo: -120 + ap * 14 } : brazoIzq);
  return (
    <svg viewBox="0 0 200 460" width={(alto * 200) / 460} height={alto} style={{ overflow: "visible", ...style }}>
      {sombra ? <ellipse cx={100} cy={PIE} rx={50 * anchoT} ry={8} fill="rgba(0,0,0,0.3)" /> : null}
      <g transform={`translate(100 0) scale(${anchoT} 1) translate(-100 0)`}>
        {tipo === "mujer" ? (
          <path d="M72 230 L128 230 L140 440 L60 440 Z" fill={color} />
        ) : (
          <path d="M72 236 L128 236 L126 446 L103 446 L100 300 L97 446 L74 446 Z" fill={color} />
        )}
        <path d="M66 112 Q68 98 100 96 Q132 98 134 112 L130 240 L70 240 Z" fill={color} />
        <rect x={90} y={76} width={20} height={24} fill={color} />
      </g>
      <path d={bD.d} stroke={color} strokeWidth={20} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={bI.d} stroke={color} strokeWidth={20} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx={100} cy={52} rx={26} ry={31} fill={color} />
      {tipo === "mujer" ? <path d="M72 50 Q70 14 100 16 Q130 14 128 50 L134 130 Q100 140 66 130 Z" fill={color} /> : null}
      {gorra ? <path d="M72 38 Q74 16 100 16 Q126 16 128 38 L150 42 Q148 48 128 46 Z" fill={color} /> : null}
      {policia ? (
        <>
          <path d="M70 34 L130 34 L126 18 Q100 8 74 18 Z" fill={color} />
          <rect x={64} y={32} width={72} height={8} rx={3} fill={color} />
        </>
      ) : null}
      {camara16 ? (
        <g transform="translate(118 40)">
          <rect x={0} y={0} width={64} height={40} rx={6} fill={color} />
          <circle cx={18} cy={-10} r={16} fill={color} />
          <circle cx={46} cy={-10} r={16} fill={color} />
          <rect x={60} y={10} width={30} height={20} rx={4} fill={color} />
        </g>
      ) : null}
      {carpeta ? <rect x={bD.hx - 30} y={bD.hy - 50} width={44} height={58} rx={4} fill={color} /> : null}
      {borde ? <path d="M126 30 Q132 60 122 82 M134 112 L130 240" stroke={borde} strokeWidth={4} fill="none" opacity={0.9} /> : null}
    </svg>
  );
};

/**
 * Cinemática inversa de un brazo (antebrazo 84 + 78, como en el SVG de 200×460).
 * Devuelve los ángulos para que la mano llegue a (tx, ty) desde el hombro (sx, sy).
 * lado: -1 brazo izquierdo de la figura (a la izquierda de la pantalla), 1 derecho.
 */
export const resolverBrazo = (sx: number, sy: number, lado: number, tx: number, ty: number, codoAfuera = true): Brazo => {
  const L1 = 84;
  const L2 = 78;
  const dx = (tx - sx) * lado;
  const dy = ty - sy;
  const d = Math.min(L1 + L2 - 0.5, Math.max(Math.abs(L1 - L2) + 0.5, Math.hypot(dx, dy)));
  // ángulo medido desde la vertical hacia abajo, positivo hacia fuera (como `dir`)
  const base = (Math.atan2(dx, dy) * 180) / Math.PI;
  const a = (Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)) * 180) / Math.PI;
  const b = (Math.acos((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2)) * 180) / Math.PI;
  const hombro = codoAfuera ? base + a : base - a;
  const codo = codoAfuera ? -(180 - b) : 180 - b;
  return { hombro, codo };
};
/** Hombros de Robert/SiluetaD en el SVG. */
export const HOMBRO_IZQ: [number, number] = [68, 112];
export const HOMBRO_DER: [number, number] = [132, 112];

/** Figura encapuchada con máscara de acero (original, capucha oscura, sin el diseño del cómic). */
export const Encapuchado: React.FC<{ alto?: number; ojos?: number; borde?: string }> = ({ alto = 700, ojos = 1, borde = "#6BE09A" }) => {
  const f = useCurrentFrame();
  const latido = 0.75 + 0.25 * Math.sin(f / 6);
  return (
    <svg viewBox="0 0 300 460" width={(alto * 300) / 460} height={alto} style={{ overflow: "visible" }}>
      <ellipse cx={150} cy={452} rx={110} ry={10} fill="rgba(0,0,0,0.35)" />
      {/* capa abierta (detrás) */}
      <path d="M150 70 Q40 100 22 452 L278 452 Q260 100 150 70 Z" fill="#141618" />
      <path d="M26 440 Q30 300 56 190" stroke={borde} strokeWidth={4} fill="none" opacity={0.7} />
      {/* armadura de acero */}
      <path d="M96 150 L204 150 L196 300 L104 300 Z" fill="#7F8892" />
      <path d="M150 150 L204 150 L196 300 L150 300 Z" fill="#6B747E" />
      <path d="M108 190 L150 214 L192 190 M112 240 L188 240" stroke="#4E565F" strokeWidth={4} fill="none" />
      <path d="M104 300 L196 300 L188 452 L160 452 L150 360 L140 452 L112 452 Z" fill="#2A2E33" />
      {/* hombreras */}
      <path d="M60 170 Q66 136 108 146 L104 196 Q74 200 60 170 Z" fill="#9AA4AD" />
      <path d="M240 170 Q234 136 192 146 L196 196 Q226 200 240 170 Z" fill="#7F8892" />
      {[[80, 164], [220, 164], [118, 170], [182, 170]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill="#C6CDD4" />)}
      {/* capa delantera a los lados */}
      <path d="M100 150 Q70 260 60 452 L96 452 Q100 300 110 200 Z" fill="#1A1C1F" />
      <path d="M200 150 Q230 260 240 452 L204 452 Q200 300 190 200 Z" fill="#101214" />
      {/* gorjal de acero */}
      <path d="M112 140 L188 140 L180 168 L120 168 Z" fill="#8C96A0" />
      {/* capucha */}
      <path d="M150 6 Q86 12 84 92 Q86 150 150 158 Q214 150 216 92 Q214 12 150 6 Z" fill="#1C1E21" />
      <path d="M92 70 Q100 20 150 16" stroke={borde} strokeWidth={3} fill="none" opacity={0.6} />
      {/* máscara */}
      <path d="M114 58 Q114 36 150 34 Q186 36 186 58 L184 112 Q170 138 150 140 Q130 138 116 112 Z" fill="#9AA4AD" />
      <path d="M150 34 Q186 36 186 58 L184 112 Q170 138 150 140 Z" fill="#7F8892" />
      <path d="M118 62 Q150 54 182 62" stroke="#5E6670" strokeWidth={5} fill="none" />
      <path d="M126 72 L144 74 L142 80 L126 78 Z M156 74 L174 72 L174 78 L158 80 Z" fill="#0B0D10" />
      <path d="M126 72 L144 74 L142 80 L126 78 Z M156 74 L174 72 L174 78 L158 80 Z" fill={`rgba(150,255,190,${0.85 * ojos * latido})`} />
      <circle cx={135} cy={76} r={10} fill={`rgba(120,255,170,${0.25 * ojos})`} />
      <circle cx={165} cy={76} r={10} fill={`rgba(120,255,170,${0.25 * ojos})`} />
      <path d="M150 82 L150 116 M134 122 L166 122" stroke="#4E565F" strokeWidth={3} />
      {[[120, 64], [180, 64], [122, 104], [178, 104]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.6} fill="#C6CDD4" />)}
    </svg>
  );
};
