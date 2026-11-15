import React from "react";
import { useCurrentFrame } from "remotion";
import { P, lerp } from "./estilo";

/* ============================================================
 * SLY · personaje original (joven alto y fornido, chaqueta de
 * cuero marrón y vaqueros). No reproduce el parecido de nadie.
 * ============================================================ */
export type ExpresionSly = "neutral" | "decidido" | "cansado" | "triste" | "euforico";
export type Brazo = { hombro: number; codo: number };

export const POSE = {
  reposo: { izq: { hombro: 8, codo: 6 }, der: { hombro: 8, codo: 6 } },
  arriba: { izq: { hombro: 160, codo: 10 }, der: { hombro: 160, codo: 10 } },
  escribir: { izq: { hombro: 18, codo: -88 }, der: { hombro: 22, codo: -100 } },
  mesa: { izq: { hombro: 22, codo: -78 }, der: { hombro: 22, codo: -78 } },
  entregar: { izq: { hombro: 8, codo: 6 }, der: { hombro: 70, codo: -10 } },
  abrazo: { izq: { hombro: 60, codo: -50 }, der: { hombro: 60, codo: -50 } },
};

export const mezclar = (a: Brazo, b: Brazo, p: number): Brazo => ({ hombro: lerp(a.hombro, b.hombro, p), codo: lerp(a.codo, b.codo, p) });

const dir = (lado: number, ang: number) => {
  const r = (ang * Math.PI) / 180;
  return [lado * Math.sin(r), Math.cos(r)];
};

const Brazo2: React.FC<{ sx: number; sy: number; lado: number; b: Brazo; manga: string; mano: string; ancho?: number; objeto?: React.ReactNode }> = ({
  sx,
  sy,
  lado,
  b,
  manga,
  mano,
  ancho = 26,
  objeto,
}) => {
  const [a1, b1] = dir(lado, b.hombro);
  const ex = sx + a1 * 64;
  const ey = sy + b1 * 64;
  const [a2, b2] = dir(lado, b.hombro + b.codo);
  const hx = ex + a2 * 58;
  const hy = ey + b2 * 58;
  return (
    <g>
      <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={manga} strokeWidth={ancho + 2} strokeLinecap="round" />
      <line x1={ex} y1={ey} x2={hx} y2={hy} stroke={manga} strokeWidth={ancho} strokeLinecap="round" />
      <circle cx={hx} cy={hy} r={13} fill={mano} />
      {objeto ? <g transform={`translate(${hx} ${hy})`}>{objeto}</g> : null}
    </g>
  );
};

type PropsSly = {
  vista?: "frente" | "espalda" | "perfil";
  expresion?: ExpresionSly;
  brazoIzq?: Brazo;
  brazoDer?: Brazo;
  correr?: number; // fase (perfil)
  giroCabeza?: number; // px (espalda: gesto de "no")
  edad?: number; // 0..1 canas
  sinPiernas?: boolean;
  altura?: number;
  objetoDer?: React.ReactNode;
  luz?: string; // color del borde iluminado
  semilla?: number;
  style?: React.CSSProperties;
};

export const Sly: React.FC<PropsSly> = ({
  vista = "frente",
  expresion = "neutral",
  brazoIzq = POSE.reposo.izq,
  brazoDer = POSE.reposo.der,
  correr,
  giroCabeza = 0,
  edad = 0,
  sinPiernas = false,
  altura = 460,
  objetoDer,
  luz,
  semilla = 0,
  style,
}) => {
  const f = useCurrentFrame();
  const pelo = edad > 0 ? mezclarColor(P.pelo, "#B9B4AE", edad) : P.pelo;
  const respira = 1 + Math.sin(f / 14 + semilla) * 0.01;
  const parpadeo = (f + semilla * 41) % 120 < 4;
  const ancho = (altura * 200) / 420;

  if (vista === "perfil") {
    const s = correr === undefined ? 0 : Math.sin(correr);
    const pierna = (fase: number, color: string) => {
      const a = fase * 34;
      const [dx, dy] = dir(1, a);
      const kx = 100 + dx * 70;
      const ky = 250 + dy * 70;
      const [ex, ey] = dir(1, a - Math.max(0, -fase) * 50 - 12);
      return (
        <g>
          <line x1={100} y1={250} x2={kx} y2={ky} stroke={color} strokeWidth={32} strokeLinecap="round" />
          <line x1={kx} y1={ky} x2={kx + ex * 66} y2={ky + ey * 66} stroke={color} strokeWidth={28} strokeLinecap="round" />
          <ellipse cx={kx + ex * 66 + 12} cy={ky + ey * 66 + 10} rx={22} ry={11} fill={P.tinta} />
        </g>
      );
    };
    const brazoAtras = correr === undefined ? 10 : -s * 50;
    return (
      <svg viewBox="0 0 200 420" width={ancho} height={altura} style={{ overflow: "visible", ...style }}>
        {!sinPiernas ? pierna(-s, "#2E3F63") : null}
        <Brazo2 sx={104} sy={136} lado={1} b={{ hombro: brazoAtras, codo: -50 }} manga="#4E2E18" mano={P.pielSombra} />
        {!sinPiernas ? pierna(s, P.vaquero) : null}
        <path d="M74 132 Q100 112 130 128 L136 252 L72 252 Z" fill={P.cuero} />
        <path d="M120 126 L134 140 L134 250 L124 250 Z" fill={P.cueroLuz} opacity={0.6} />
        <rect x={92} y={96} width={22} height={28} rx={8} fill={P.pielSombra} />
        <g transform={`translate(0 ${correr === undefined ? 0 : Math.abs(s) * -3})`}>
          <ellipse cx={104} cy={62} rx={34} ry={40} fill={P.piel} />
          <path d="M134 60 L146 70 L134 76 Z" fill={P.piel} />
          <path d="M70 58 Q66 20 104 18 Q134 18 138 42 Q124 32 104 36 Q92 40 92 62 Q80 62 70 58 Z" fill={pelo} />
          <ellipse cx={94} cy={66} rx={7} ry={10} fill={P.pielSombra} />
          <ellipse cx={122} cy={56} rx={3.5} ry={parpadeo ? 0.6 : 4.5} fill={P.tinta} />
          <path d={expresion === "euforico" ? "M118 84 Q128 92 136 82" : "M122 86 L134 84"} stroke={P.tinta} strokeWidth={3.5} fill="none" strokeLinecap="round" />
          <path d={expresion === "decidido" ? "M114 46 L130 48" : expresion === "triste" ? "M114 46 L128 42" : "M114 44 L130 44"} stroke={pelo} strokeWidth={4} strokeLinecap="round" />
        </g>
        <Brazo2 sx={104} sy={136} lado={1} b={{ hombro: correr === undefined ? 14 : s * 50, codo: correr === undefined ? 0 : -70 }} manga={P.cueroLuz} mano={P.piel} />
        {luz ? <path d="M74 132 Q70 190 72 252" stroke={luz} strokeWidth={4} fill="none" opacity={0.7} /> : null}
      </svg>
    );
  }

  const espalda = vista === "espalda";
  const cara = () => {
    const ojos = (() => {
      switch (expresion) {
        case "cansado":
          return (
            <>
              <path d="M78 64 Q86 69 94 64" stroke={P.tinta} strokeWidth={4} fill="none" strokeLinecap="round" />
              <path d="M106 64 Q114 69 122 64" stroke={P.tinta} strokeWidth={4} fill="none" strokeLinecap="round" />
            </>
          );
        case "euforico":
          return (
            <>
              <path d="M78 64 Q86 56 94 64" stroke={P.tinta} strokeWidth={4} fill="none" strokeLinecap="round" />
              <path d="M106 64 Q114 56 122 64" stroke={P.tinta} strokeWidth={4} fill="none" strokeLinecap="round" />
            </>
          );
        default:
          return (
            <>
              <ellipse cx={86} cy={63} rx={4.5} ry={parpadeo ? 0.6 : 5} fill={P.tinta} />
              <ellipse cx={114} cy={63} rx={4.5} ry={parpadeo ? 0.6 : 5} fill={P.tinta} />
            </>
          );
      }
    })();
    const cejas =
      expresion === "decidido"
        ? "M76 50 L94 55 M106 55 L124 50"
        : expresion === "triste"
        ? "M76 54 L94 49 M106 49 L124 54"
        : expresion === "euforico"
        ? "M76 46 Q86 42 94 47 M106 47 Q114 42 124 46"
        : "M76 52 L94 51 M106 51 L124 52";
    const boca =
      expresion === "euforico" ? (
        <path d="M86 84 Q100 102 114 84 Z" fill={P.tinta} />
      ) : expresion === "triste" ? (
        <path d="M88 90 Q100 83 112 90" stroke={P.tinta} strokeWidth={4} fill="none" strokeLinecap="round" />
      ) : expresion === "decidido" ? (
        <path d="M88 87 L112 86" stroke={P.tinta} strokeWidth={4.5} strokeLinecap="round" />
      ) : (
        <path d="M89 86 Q100 90 111 86" stroke={P.tinta} strokeWidth={4} fill="none" strokeLinecap="round" />
      );
    return (
      <>
        {ojos}
        <path d={cejas} stroke={pelo} strokeWidth={5} strokeLinecap="round" fill="none" />
        <path d="M100 66 L97 78 L103 79" stroke={P.pielSombra} strokeWidth={3} fill="none" strokeLinecap="round" />
        {boca}
        {edad > 0.4 ? <path d="M76 74 Q80 78 78 82 M124 74 Q120 78 122 82" stroke={P.pielSombra} strokeWidth={2} fill="none" opacity={edad} /> : null}
      </>
    );
  };

  return (
    <svg viewBox="0 0 200 420" width={ancho} height={altura} style={{ overflow: "visible", ...style }}>
      {!sinPiernas ? (
        <>
          <path d="M62 246 L138 246 L136 300 L104 300 L102 384 L70 384 L64 300 Z" fill={P.vaquero} />
          <path d="M104 300 L136 300 L132 384 L100 384 Z" fill="#33466D" />
          <path d="M100 252 L100 300" stroke="#2C3C5E" strokeWidth={3} />
          <ellipse cx={84} cy={390} rx={22} ry={10} fill={P.tinta} />
          <ellipse cx={118} cy={390} rx={22} ry={10} fill={P.tinta} />
        </>
      ) : null}
      <g transform={`translate(100 250) scale(1 ${respira}) translate(-100 -250)`}>
        <path d="M52 140 Q54 118 100 112 Q146 118 148 140 L144 254 L56 254 Z" fill={P.cuero} />
        {espalda ? (
          <>
            <path d="M100 116 L100 254" stroke="#5A3319" strokeWidth={3} />
            <path d="M58 200 L142 200" stroke="#5A3319" strokeWidth={3} />
          </>
        ) : (
          <>
            <path d="M86 116 L100 170 L114 116 Z" fill="#E7DCC8" />
            <path d="M84 116 L74 150 L92 156 L100 172 Z" fill={P.cueroLuz} />
            <path d="M116 116 L126 150 L108 156 L100 172 Z" fill={P.cueroLuz} />
            <path d="M100 172 L100 254" stroke="#4E2E18" strokeWidth={3} />
          </>
        )}
        {luz ? <path d="M54 140 Q52 200 56 254" stroke={luz} strokeWidth={5} fill="none" opacity={0.8} /> : null}
      </g>
      <Brazo2 sx={60} sy={136} lado={-1} b={brazoIzq} manga={P.cuero} mano={P.piel} />
      <Brazo2 sx={140} sy={136} lado={1} b={brazoDer} manga={P.cuero} mano={P.piel} objeto={objetoDer} />
      <rect x={88} y={92} width={24} height={26} rx={8} fill={P.pielSombra} />
      <g transform={`translate(${giroCabeza} 0)`}>
        <ellipse cx={100} cy={60} rx={34} ry={40} fill={P.piel} />
        <ellipse cx={66} cy={64} rx={6} ry={10} fill={P.pielSombra} />
        <ellipse cx={134} cy={64} rx={6} ry={10} fill={P.pielSombra} />
        {espalda ? (
          <>
            <path d="M65 64 Q60 18 100 16 Q140 18 135 64 Q132 92 100 96 Q68 92 65 64 Z" fill={pelo} />
            <path d="M78 34 Q100 22 122 34" stroke="rgba(255,235,210,0.28)" strokeWidth={5} fill="none" strokeLinecap="round" />
            <path d="M72 58 Q78 80 100 88 Q122 80 128 58" stroke="rgba(0,0,0,0.25)" strokeWidth={3} fill="none" />
          </>
        ) : (
          <>
            <path d="M66 56 Q62 16 102 16 Q140 18 136 56 Q128 34 106 36 Q88 40 74 48 Q70 52 66 56 Z" fill={pelo} />
            {cara()}
          </>
        )}
      </g>
    </svg>
  );
};

const mezclarColor = (a: string, b: string, p: number) => {
  const h = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const [r1, g1, b1] = h(a);
  const [r2, g2, b2] = h(b);
  const m = (x: number, y: number) => Math.round(x + (y - x) * p);
  return `rgb(${m(r1, r2)},${m(g1, g2)},${m(b1, b2)})`;
};

/* ============================================================
 * SASHA · pelo largo castaño, ropa de los 70 y cámara colgada.
 * ============================================================ */
export const Sasha: React.FC<{
  altura?: number;
  expresion?: "neutral" | "triste" | "sonrisa";
  foto?: number; // 0..1 sube la cámara a la cara
  taza?: boolean;
  sinPiernas?: boolean;
  style?: React.CSSProperties;
}> = ({ altura = 430, expresion = "neutral", foto = 0, taza = false, sinPiernas = false, style }) => {
  const f = useCurrentFrame();
  const parpadeo = (f + 23) % 130 < 4;
  const brazo = mezclar({ hombro: 10, codo: 8 }, { hombro: 100, codo: -227 }, foto);
  const brazoT = taza ? { hombro: 40, codo: -80 } : brazo;
  const camara = (
    <g transform={`translate(${-24} ${-14})`}>
      <rect x={0} y={0} width={48} height={30} rx={5} fill="#1A1A1A" />
      <circle cx={24} cy={16} r={10} fill="#3A3A3A" stroke="#777" strokeWidth={3} />
      <rect x={6} y={-6} width={12} height={6} fill="#1A1A1A" />
    </g>
  );
  const tazaEl = (
    <g transform="translate(-14 -22)">
      <rect x={0} y={0} width={26} height={28} rx={4} fill={P.crema} />
      <path d="M26 6 Q36 12 26 20" stroke={P.crema} strokeWidth={4} fill="none" />
      {[0, 1].map((i) => (
        <path key={i} d={`M${8 + i * 9} -4 q4 -8 0 -16`} stroke="rgba(255,255,255,0.6)" strokeWidth={2.5} fill="none" opacity={0.5 + 0.5 * Math.sin(f / 6 + i)} />
      ))}
    </g>
  );
  return (
    <svg viewBox="0 0 200 420" width={(altura * 200) / 420} height={altura} style={{ overflow: "visible", ...style }}>
      <path d="M58 60 Q56 10 100 12 Q144 10 142 60 L150 190 Q100 200 50 190 Z" fill="#6B4226" />
      {!sinPiernas ? (
        <>
          <path d="M68 250 L132 250 L148 390 L110 390 L100 300 L90 390 L52 390 Z" fill="#7A4B2A" />
          <ellipse cx={72} cy={392} rx={22} ry={9} fill={P.tinta} />
          <ellipse cx={128} cy={392} rx={22} ry={9} fill={P.tinta} />
        </>
      ) : null}
      <path d="M60 138 Q62 112 100 108 Q138 112 140 138 L136 256 L64 256 Z" fill={P.ocre} />
      <path d="M86 108 L114 108 L112 124 L88 124 Z" fill="#B47530" />
      {foto < 0.5 && !taza ? (
        <>
          <path d="M70 120 L118 210" stroke="#3A2A1E" strokeWidth={4} />
          <g transform="translate(118 212)">{camara}</g>
        </>
      ) : null}
      <rect x={90} y={90} width={20} height={22} rx={7} fill={P.pielSombra} />
      <ellipse cx={100} cy={58} rx={32} ry={38} fill={P.piel} />
      <path d="M66 62 Q62 14 100 14 Q138 14 134 62 Q126 34 100 32 Q84 34 66 62 Z" fill="#6B4226" />
      {foto < 0.7 ? (
        <>
          {expresion === "sonrisa" ? (
            <>
              <path d="M80 60 Q87 54 94 60" stroke={P.tinta} strokeWidth={3.5} fill="none" strokeLinecap="round" />
              <path d="M106 60 Q113 54 120 60" stroke={P.tinta} strokeWidth={3.5} fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <ellipse cx={87} cy={60} rx={4} ry={parpadeo ? 0.6 : 4.5} fill={P.tinta} />
              <ellipse cx={113} cy={60} rx={4} ry={parpadeo ? 0.6 : 4.5} fill={P.tinta} />
            </>
          )}
          <path
            d={expresion === "triste" ? "M90 84 Q100 78 110 84" : expresion === "sonrisa" ? "M88 78 Q100 90 112 78" : "M91 81 Q100 85 109 81"}
            stroke={P.ladrillo}
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
          />
        </>
      ) : null}
      <Brazo2 sx={64} sy={132} lado={-1} b={foto > 0 ? brazo : { hombro: 10, codo: 8 }} manga={P.ocre} mano={P.piel} ancho={22} />
      <Brazo2 sx={136} sy={132} lado={1} b={brazoT} manga={P.ocre} mano={P.piel} ancho={22} objeto={taza ? tazaEl : undefined} />
      {foto >= 0.5 ? (
        <g transform="translate(100 66) scale(1.5)">
          <rect x={-26} y={-16} width={52} height={32} rx={5} fill="#1A1A1A" />
          <circle cx={0} cy={2} r={12} fill="#3A3A3A" stroke="#888" strokeWidth={3} />
          <rect x={-20} y={-22} width={12} height={6} fill="#1A1A1A" />
        </g>
      ) : null}
    </svg>
  );
};

/* ============================================================
 * BUTKUS · bullmastiff enorme, canela con hocico oscuro.
 * Vista lateral mirando a la derecha.
 * ============================================================ */
export const Butkus: React.FC<{
  ancho?: number;
  andar?: number; // fase de las patas
  sentado?: boolean;
  mirarAtras?: boolean;
  cabeza?: number; // inclinación de la cabeza (grados)
  saltar?: number; // 0..1
  style?: React.CSSProperties;
}> = ({ ancho = 360, andar, sentado = false, mirarAtras = false, cabeza = 0, saltar = 0, style }) => {
  const f = useCurrentFrame();
  const canela = "#C99059";
  const sombra = "#A9733F";
  const hocico = "#3A2A22";
  const s = andar === undefined ? 0 : Math.sin(andar);
  const pata = (x: number, fase: number, color: string) => {
    const a = fase * 26;
    return (
      <g transform={`rotate(${a} ${x} 118)`}>
        <rect x={x - 12} y={110} width={26} height={74} rx={12} fill={color} />
        <ellipse cx={x + 4} cy={184} rx={17} ry={9} fill={color} />
      </g>
    );
  };
  const cola = Math.sin(f / 4) * (andar === undefined ? 8 : 16);
  const cabezaEl = (
    <g transform={`rotate(${cabeza} 222 84)`}>
      <path d="M200 70 Q206 34 244 36 Q272 40 276 64 L290 70 Q296 92 284 102 Q268 112 252 104 L234 108 Q206 104 200 70 Z" fill={canela} />
      <path d="M262 62 Q284 60 292 72 Q296 94 284 102 Q270 110 256 102 Q252 80 262 62 Z" fill={hocico} />
      <ellipse cx={288} cy={70} rx={7} ry={5} fill="#1A110D" />
      <path d="M216 44 Q206 40 202 58 Q206 74 218 66 Z" fill={hocico} />
      <circle cx={250} cy={58} r={4.5} fill="#1A110D" />
      <path d="M242 50 Q250 46 258 50" stroke={sombra} strokeWidth={3} fill="none" />
      <path d="M262 104 Q258 116 246 114" stroke={hocico} strokeWidth={6} fill="none" strokeLinecap="round" />
    </g>
  );
  return (
    <svg viewBox="0 0 320 200" width={ancho} height={(ancho * 200) / 320} style={{ overflow: "visible", ...style }}>
      <g transform={`translate(0 ${-saltar * 40}) rotate(${-saltar * 12} 160 120)`}>
        <path d={`M44 96 Q${20 - cola} ${70 - cola / 2} ${14 - cola} 52`} stroke={canela} strokeWidth={11} fill="none" strokeLinecap="round" />
        {sentado ? (
          <>
            <ellipse cx={80} cy={150} rx={56} ry={40} fill={sombra} />
            <ellipse cx={92} cy={184} rx={30} ry={10} fill={sombra} />
          </>
        ) : (
          <>
            {pata(76, -s, sombra)}
            {pata(196, s, sombra)}
          </>
        )}
        <path
          d={sentado ? "M44 138 Q46 82 120 74 Q190 64 222 90 L222 150 Q160 170 60 168 Z" : "M40 104 Q40 62 120 64 Q196 60 226 86 L224 134 Q160 150 56 140 Z"}
          fill={canela}
        />
        <path d={sentado ? "M190 96 Q216 110 214 150" : "M196 92 Q222 104 220 134"} stroke={sombra} strokeWidth={10} fill="none" opacity={0.6} />
        {!sentado ? (
          <>
            {pata(96, s, canela)}
            {pata(210, -s, canela)}
          </>
        ) : (
          <>
            {pata(196, 0, canela)}
            {pata(214, 0, sombra)}
          </>
        )}
        {mirarAtras ? (
          <g transform="translate(-34 -6) rotate(-14 222 84)">
            <g transform="translate(436 0) scale(-1 1)">{cabezaEl}</g>
          </g>
        ) : (
          cabezaEl
        )}
        <rect x={190} y={78} width={22} height={40} rx={8} fill="#7A4A2E" transform="rotate(-20 200 98)" />
      </g>
    </svg>
  );
};

/* ============================================================
 * Siluetas (productores, desconocidos, público, boxeadores)
 * ============================================================ */
export const Silueta: React.FC<{
  altura?: number;
  color?: string;
  traje?: boolean;
  sombrero?: boolean;
  puro?: boolean;
  borde?: string;
  brazoDer?: number; // ángulo del brazo derecho
  style?: React.CSSProperties;
}> = ({ altura = 420, color = "#120D0B", traje = false, sombrero = false, puro = false, borde, brazoDer = 8, style }) => {
  const f = useCurrentFrame();
  const [dx, dy] = dir(1, brazoDer);
  return (
    <svg viewBox="0 0 200 420" width={(altura * 200) / 420} height={altura} style={{ overflow: "visible", ...style }}>
      <path d="M62 250 L138 250 L132 392 L104 392 L100 300 L96 392 L68 392 Z" fill={color} />
      <path d={traje ? "M44 146 Q48 114 100 108 Q152 114 156 146 L148 262 L52 262 Z" : "M56 146 Q58 116 100 110 Q142 116 144 146 L140 262 L60 262 Z"} fill={color} />
      {traje ? <path d="M90 112 L100 150 L110 112" stroke={borde ?? "#2A2A2A"} strokeWidth={4} fill="none" opacity={0.6} /> : null}
      <line x1={50} y1={140} x2={42} y2={250} stroke={color} strokeWidth={26} strokeLinecap="round" />
      <line x1={150} y1={140} x2={150 + dx * 110} y2={140 + dy * 110} stroke={color} strokeWidth={26} strokeLinecap="round" />
      <rect x={88} y={88} width={24} height={26} fill={color} />
      <ellipse cx={100} cy={60} rx={32} ry={38} fill={color} />
      {sombrero ? (
        <>
          <ellipse cx={100} cy={34} rx={56} ry={10} fill={color} />
          <path d="M68 34 Q70 4 100 4 Q130 4 132 34 Z" fill={color} />
        </>
      ) : null}
      {borde ? <path d="M132 40 Q140 70 128 96 M150 146 L146 262" stroke={borde} strokeWidth={4} fill="none" opacity={0.85} /> : null}
      {puro ? (
        <g>
          <rect x={124} y={76} width={34} height={8} rx={3} fill="#5A3825" />
          <circle cx={158} cy={80} r={4} fill="#FF7A3A" opacity={0.7 + 0.3 * Math.sin(f / 5)} />
          {[0, 1, 2].map((i) => {
            const t = ((f + i * 25) % 75) / 75;
            return <circle key={i} cx={160 + Math.sin(t * 6 + i) * 10 + t * 20} cy={72 - t * 90} r={8 + t * 22} fill="rgba(220,210,200,0.18)" opacity={1 - t} />;
          })}
        </g>
      ) : null}
    </svg>
  );
};

export const Boxeador: React.FC<{ altura?: number; color?: string; borde?: string; espejo?: boolean; golpe?: number; caer?: number; style?: React.CSSProperties }> = ({
  altura = 380,
  color = "#0B0807",
  borde = P.dorado,
  espejo = false,
  golpe = 0,
  caer = 0,
  style,
}) => {
  const f = useCurrentFrame();
  const bob = Math.sin(f / 7) * 4 * (1 - caer);
  const ext = golpe * 46;
  return (
    <svg viewBox="0 0 240 420" width={(altura * 240) / 420} height={altura} style={{ overflow: "visible", ...style }}>
      <g transform={`${espejo ? "translate(240 0) scale(-1 1)" : ""} rotate(${caer * -80} 120 400) translate(0 ${bob})`}>
        <path d="M84 250 L156 250 L176 396 L146 396 L120 300 L100 396 L64 396 Z" fill={color} />
        <rect x={80} y={236} width={82} height={40} rx={8} fill={color} />
        <path d="M70 140 Q76 112 122 108 Q166 112 172 140 L160 246 L84 246 Z" fill={color} />
        <rect x={108} y={86} width={26} height={28} fill={color} />
        <circle cx={122} cy={62} r={32} fill={color} />
        <line x1={160} y1={136} x2={190 + ext} y2={150} stroke={color} strokeWidth={24} strokeLinecap="round" />
        <circle cx={200 + ext} cy={140} r={24} fill={color} />
        <line x1={78} y1={136} x2={120} y2={168} stroke={color} strokeWidth={24} strokeLinecap="round" />
        <circle cx={136} cy={150} r={24} fill={color} />
        <path d="M150 40 Q160 70 150 92 M172 140 L162 246 M224 140 Q226 152 216 160" stroke={borde} strokeWidth={4} fill="none" opacity={0.9} />
      </g>
    </svg>
  );
};
