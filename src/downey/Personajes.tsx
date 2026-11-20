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
/** Brazo (hombro→codo) y antebrazo con mano, en unidades del SVG 200×460. */
export const L_BRAZO = 74;
export const L_ANTEBRAZO = 70;
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
  armadura: { torso: "#B3202A", torsoSombra: "#8A1720", manga: "#B3202A", pantalon: "#A51C26", zapato: "#6E1218" },
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
  repulsorIzq?: number; // 0..1 palma izquierda iluminada

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
  repulsorIzq = 0,
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
    const ex = sx + ax * L_BRAZO;
    const ey = sy + ay * L_BRAZO;
    const [bx, by] = dir(lado, b.hombro + b.codo);
    const hx = ex + bx * L_ANTEBRAZO;
    const hy = ey + by * L_ANTEBRAZO;
    if (ropa === "armadura") {
      const gx = ex + bx * 44;
      const gy = ey + by * 44;
      return { seg: (
        <g>
          <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="#C99A2E" strokeWidth={26} strokeLinecap="round" />
          <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="#F0C860" strokeWidth={8} strokeLinecap="round" opacity={0.7} />
          <line x1={ex} y1={ey} x2={hx} y2={hy} stroke="#B3202A" strokeWidth={23} strokeLinecap="round" />
          {/* guantelete: antebrazo más ancho */}
          <line x1={gx} y1={gy} x2={hx - bx * 6} y2={hy - by * 6} stroke="#9A1A24" strokeWidth={29} strokeLinecap="round" />
          <line x1={gx} y1={gy} x2={hx - bx * 10} y2={hy - by * 10} stroke="#E0B048" strokeWidth={4} strokeLinecap="round" />
          <circle cx={ex} cy={ey} r={13} fill="#5A1015" />
          <circle cx={ex} cy={ey} r={6} fill="#E0B048" />
        </g>
      ), hx, hy };
    }
    return { seg: (
      <g>
        <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={manga} strokeWidth={24} strokeLinecap="round" />
        <line x1={ex} y1={ey} x2={hx} y2={hy} stroke={manga} strokeWidth={21} strokeLinecap="round" />
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
          <path d="M74 54 Q66 20 94 10 Q118 4 128 22 Q132 36 126 52 Q122 34 112 30 Q96 26 86 34 Q78 42 74 54 Z" fill={D.pelo} />
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
        <g transform={`translate(0 ${(1 - casco) * -80})`} opacity={Math.min(1, casco * 2)}>
          {/* casco completo: cubre pelo y barba */}
          <path d="M64 54 Q62 4 100 2 Q138 4 136 54 Q136 92 100 100 Q64 92 64 54 Z" fill="#B3202A" />
          <path d="M100 2 Q138 4 136 54 Q136 92 100 100 Z" fill="#8A1720" />
          {frente ? (
            <>
              {/* placa facial angulosa */}
              <path d="M76 34 Q100 26 124 34 L124 70 L112 92 L88 92 L76 70 Z" fill="#E6B54A" />
              <path d="M100 28 Q114 28 124 34 L124 70 L112 92 L100 92 Z" fill="#C4922E" />
              <path d="M76 34 Q100 26 124 34" stroke="#7A5A1E" strokeWidth={3} fill="none" />
              {/* ojos: rendijas en ángulo */}
              <path d="M80 46 L97 50 L95 56 L82 54 Z M103 50 L120 46 L118 54 L105 56 Z" fill="#0E141A" />
              <path d="M80 46 L97 50 L95 56 L82 54 Z M103 50 L120 46 L118 54 L105 56 Z" fill={`rgba(190,240,255,${brillo})`} />
              <ellipse cx={89} cy={51} rx={14} ry={8} fill={`rgba(140,220,255,${0.35 * brillo})`} />
              <ellipse cx={111} cy={51} rx={14} ry={8} fill={`rgba(140,220,255,${0.35 * brillo})`} />
              {/* juntas de mejillas y mandíbula, rejilla de la boca */}
              <path d="M78 62 L90 72 L88 90 M122 62 L110 72 L112 90" stroke="#8A6420" strokeWidth={2.5} fill="none" />
              <path d="M91 82 L109 82" stroke="#6A4A18" strokeWidth={3} strokeLinecap="round" />
            </>
          ) : null}
          <path d="M72 30 Q84 10 106 8" stroke="rgba(255,255,255,0.55)" strokeWidth={4} fill="none" strokeLinecap="round" />
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
          {/* pectorales y abdomen por placas */}
          <path d="M70 112 Q72 102 98 102 L98 150 Q80 156 70 146 Z" fill="#C8303A" />
          <path d="M130 112 Q128 102 102 102 L102 150 Q120 156 130 146 Z" fill="#9A1A24" />
          {[164, 184, 204].map((y) => (
            <g key={y}>
              <rect x={80} y={y} width={18} height={16} rx={3} fill="#E0B048" />
              <rect x={102} y={y} width={18} height={16} rx={3} fill="#B88A2A" />
            </g>
          ))}
          <rect x={70} y={224} width={60} height={14} rx={3} fill="#6E1218" />
          {!espalda ? (
            <g>
              {/* reactor del pecho */}
              <circle cx={100} cy={128} r={13} fill="#3A3F46" />
              <circle cx={100} cy={128} r={10} fill={`rgba(200,245,255,${0.55 + 0.45 * brillo})`} />
              <circle cx={100} cy={128} r={6} fill="none" stroke="rgba(120,200,240,0.8)" strokeWidth={2} />
              <circle cx={100} cy={128} r={26} fill={`rgba(140,220,255,${0.28 * brillo})`} />
            </g>
          ) : null}
        </g>
      ) : null}
    </g>
  );

  /* ---------- piernas ---------- */
  const piernasDePie = (
    <g>
      <path d="M68 236 L132 236 L131 300 L104 300 L103 440 L76 440 L69 300 Z" fill={R.pantalon} />
      <path d="M104 300 L131 300 L128 440 L102 440 Z" fill={R.pantalon} />
      <path d="M104 300 L131 300 L128 440 L116 440 Z" fill="rgba(0,0,0,0.12)" />
      <path d="M100 244 L100 300" stroke="rgba(0,0,0,0.25)" strokeWidth={2} />
      <path d="M74 438 Q72 452 94 452 L104 452 L104 438 Z" fill={R.zapato} />
      <path d="M100 438 L100 452 L122 452 Q132 452 128 438 Z" fill={R.zapato} />
      {ropa === "armadura" ? (
        <g>
          <path d="M76 250 L98 250 L100 296 L78 296 Z M102 250 L124 250 L124 296 L104 296 Z" fill="#C8303A" opacity={0.8} />
          <ellipse cx={90} cy={318} rx={13} ry={11} fill="#E0B048" />
          <ellipse cx={113} cy={318} rx={13} ry={11} fill="#B88A2A" />
          <path d="M84 340 L96 340 L96 420 L86 420 Z M106 340 L118 340 L117 420 L107 420 Z" fill="#C99A2E" opacity={0.85} />
          <path d="M74 428 L104 428 L104 452 L76 452 Q70 452 72 440 Z M100 428 L128 428 Q130 452 122 452 L100 452 Z" fill="#6E1218" />
        </g>
      ) : null}
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
      {/* piernas cruzadas: muslos hacia las rodillas, espinillas cruzadas delante */}
      <path d="M66 232 Q100 224 134 232 L138 252 Q100 260 62 252 Z" fill={R.pantalon} />
      <line x1={78} y1={240} x2={30} y2={250} stroke={R.pantalon} strokeWidth={30} strokeLinecap="round" />
      <line x1={122} y1={240} x2={170} y2={250} stroke={R.pantalon} strokeWidth={30} strokeLinecap="round" />
      <line x1={30} y1={252} x2={112} y2={258} stroke={R.pantalon} strokeWidth={24} strokeLinecap="round" />
      <line x1={170} y1={252} x2={88} y2={258} stroke={R.pantalon} strokeWidth={24} strokeLinecap="round" />
      <path d="M40 250 L104 256" stroke="rgba(0,0,0,0.2)" strokeWidth={3} />
      <ellipse cx={30} cy={246} rx={12} ry={7} fill="rgba(255,255,255,0.15)" />
      <ellipse cx={170} cy={246} rx={12} ry={7} fill="rgba(255,255,255,0.15)" />
      <ellipse cx={118} cy={258} rx={14} ry={8} fill={R.zapato} />
      <ellipse cx={82} cy={258} rx={14} ry={8} fill={R.zapato} />
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
        <circle cx={bI.hx} cy={bI.hy} r={ropa === "armadura" ? 13 : 9} fill={ropa === "armadura" ? "#9A1A24" : D.piel} />
        <circle cx={bD.hx} cy={bD.hy} r={ropa === "armadura" ? 13 : 9} fill={ropa === "armadura" ? "#9A1A24" : D.piel} />
        {ropa === "armadura" ? (
          <>
            <ellipse cx={68} cy={114} rx={22} ry={16} fill="#C8303A" />
            <ellipse cx={132} cy={114} rx={22} ry={16} fill="#9A1A24" />
            <path d="M50 110 Q68 96 86 110 M114 110 Q132 96 150 110" stroke="#6E1218" strokeWidth={2.5} fill="none" />
          </>
        ) : null}
        {repulsorIzq > 0 ? (
          <g>
            <circle cx={bI.hx} cy={bI.hy} r={60 * repulsorIzq} fill="rgba(140,220,255,0.35)" />
            <circle cx={bI.hx} cy={bI.hy} r={22 * repulsorIzq} fill="rgba(225,250,255,0.95)" />
          </g>
        ) : null}
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
    const ex = sx + ax * L_BRAZO;
    const ey = 112 + ay * L_BRAZO;
    const [bx, by] = dir(lado, b.hombro + b.codo);
    return { d: `M${sx} 112 L${ex} ${ey} L${ex + bx * L_ANTEBRAZO} ${ey + by * L_ANTEBRAZO}`, hx: ex + bx * L_ANTEBRAZO, hy: ey + by * L_ANTEBRAZO };
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
      <path d={bD.d} stroke={color} strokeWidth={24} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={bI.d} stroke={color} strokeWidth={24} fill="none" strokeLinecap="round" strokeLinejoin="round" />
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
    </svg>
  );
};

/**
 * Cinemática inversa de un brazo (antebrazo 84 + 78, como en el SVG de 200×460).
 * Devuelve los ángulos para que la mano llegue a (tx, ty) desde el hombro (sx, sy).
 * lado: -1 brazo izquierdo de la figura (a la izquierda de la pantalla), 1 derecho.
 */
export const resolverBrazo = (sx: number, sy: number, lado: number, tx: number, ty: number, codoAfuera = true): Brazo => {
  const L1 = L_BRAZO;
  const L2 = L_ANTEBRAZO;
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
/** Mano del encapuchado levantada (0..1): punto de la palma en el SVG de 300×460. */
export const manoEncapuchado = (m: number): [number, number] => {
  const codo: [number, number] = [214 + 36 * m, 230 - 130 * m];
  return [codo[0] + 6 + 6 * m, codo[1] + 70 - 140 * m];
};
export const Encapuchado: React.FC<{ alto?: number; ojos?: number; borde?: string; mano?: number }> = ({ alto = 700, ojos = 1, mano = 0 }) => {
  const f = useCurrentFrame();
  const latido = 0.75 + 0.25 * Math.sin(f / 6);
  return (
    <svg viewBox="0 0 300 460" width={(alto * 300) / 460} height={alto} style={{ overflow: "visible" }}>
      <ellipse cx={150} cy={452} rx={110} ry={10} fill="rgba(0,0,0,0.35)" />
      {/* capa abierta (detrás) */}
      <path d="M150 70 Q40 100 22 452 L278 452 Q260 100 150 70 Z" fill="#1E3A22" />
      {/* armadura de acero */}
      {/* túnica verde sobre la armadura, cinturón y piernas de acero */}
      <path d="M96 150 L204 150 L200 330 L100 330 Z" fill="#2E5A34" />
      <path d="M150 150 L204 150 L200 330 L150 330 Z" fill="#24482A" />
      <rect x={98} y={262} width={104} height={18} fill="#2A2E33" />
      <circle cx={150} cy={271} r={14} fill="#B8C0C8" stroke="#5E6670" strokeWidth={3} />
      <path d="M108 330 L192 330 L188 452 L160 452 L150 380 L140 452 L112 452 Z" fill="#8C96A0" />
      <path d="M150 330 L192 330 L188 452 L160 452 L150 380 Z" fill="#6E7882" />
      {/* hombreras */}
      <path d="M60 170 Q66 136 108 146 L104 196 Q74 200 60 170 Z" fill="#9AA4AD" />
      <path d="M240 170 Q234 136 192 146 L196 196 Q226 200 240 170 Z" fill="#7F8892" />
      {[[80, 164], [220, 164], [118, 170], [182, 170]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill="#C6CDD4" />)}
      {/* capa delantera a los lados */}
      <path d="M100 150 Q70 260 60 452 L96 452 Q100 300 110 200 Z" fill="#2A5230" />
      <path d="M200 150 Q230 260 240 452 L204 452 Q200 300 190 200 Z" fill="#1E3E24" />
      {/* gorjal de acero */}
      <path d="M112 140 L188 140 L180 168 L120 168 Z" fill="#8C96A0" />
      {/* capucha */}
      <path d="M150 6 Q86 12 84 92 Q86 150 150 158 Q214 150 216 92 Q214 12 150 6 Z" fill="#2A4E2E" />
      {/* máscara */}
      <path d="M114 58 Q114 36 150 34 Q186 36 186 58 L184 112 Q170 138 150 140 Q130 138 116 112 Z" fill="#9AA4AD" />
      <path d="M150 34 Q186 36 186 58 L184 112 Q170 138 150 140 Z" fill="#7F8892" />
      <path d="M118 62 Q150 54 182 62" stroke="#5E6670" strokeWidth={5} fill="none" />
      <path d="M120 60 Q150 52 180 60 L178 66 Q150 58 122 66 Z" fill="#5E6670" />
      <path d="M126 72 L144 74 L142 80 L126 78 Z M156 74 L174 72 L174 78 L158 80 Z" fill="#0B0D10" />
      <path d="M126 72 L144 74 L142 80 L126 78 Z M156 74 L174 72 L174 78 L158 80 Z" fill={`rgba(150,255,190,${0.85 * ojos * latido})`} />
      <circle cx={135} cy={76} r={10} fill={`rgba(120,255,170,${0.25 * ojos})`} />
      <circle cx={165} cy={76} r={10} fill={`rgba(120,255,170,${0.25 * ojos})`} />
      <path d="M150 76 L144 104 L156 104 Z" fill="#6B747E" />
      <rect x={134} y={114} width={32} height={5} rx={2} fill="#22262A" />
      <path d="M126 88 L128 124 M174 88 L172 124" stroke="#5E6670" strokeWidth={3} strokeLinecap="round" />
      {[[120, 64], [180, 64], [122, 104], [178, 104]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.6} fill="#C6CDD4" />)}
      {mano > 0 ? (() => {
        const codo: [number, number] = [214 + 36 * mano, 230 - 130 * mano];
        const palma = manoEncapuchado(mano);
        return (
          <g>
            <line x1={204} y1={168} x2={codo[0]} y2={codo[1]} stroke="#2A5230" strokeWidth={34} strokeLinecap="round" />
            <line x1={codo[0]} y1={codo[1]} x2={palma[0]} y2={palma[1]} stroke="#7F8892" strokeWidth={26} strokeLinecap="round" />
            <line x1={codo[0]} y1={codo[1]} x2={palma[0]} y2={palma[1]} stroke="#A4AEB8" strokeWidth={8} strokeLinecap="round" opacity={0.6} />
            <circle cx={palma[0]} cy={palma[1]} r={17} fill="#6B747E" />
            <circle cx={palma[0]} cy={palma[1]} r={40 * mano} fill={`rgba(120,255,170,${0.35 * mano * ojos})`} />
            <circle cx={palma[0]} cy={palma[1]} r={14 * mano} fill={`rgba(210,255,225,${0.9 * mano * ojos})`} />
          </g>
        );
      })() : null}
    </svg>
  );
};
