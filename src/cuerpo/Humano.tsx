import React from "react";
import { useCurrentFrame } from "remotion";
import { C, lerp } from "./tema";

export type Expresion = "normal" | "sorprendido" | "cansado" | "frio" | "feliz";
export type Ropa = "camiseta" | "montana" | "sudadera" | "traje";
export type Brazo = { hombro: number; codo: number };

export const POSES = {
  reposo: { izq: { hombro: 10, codo: 4 }, der: { hombro: 10, codo: 4 } },
  heroe: { izq: { hombro: 44, codo: -114 }, der: { hombro: 44, codo: -114 } },
  senalar: { izq: { hombro: 10, codo: 4 }, der: { hombro: 96, codo: -6 } },
  flotar: { izq: { hombro: 70, codo: -20 }, der: { hombro: 64, codo: -26 } },
  nadar: { izq: { hombro: 112, codo: -28 }, der: { hombro: 112, codo: -28 } },
  copa: { izq: { hombro: 10, codo: 4 }, der: { hombro: 22, codo: -118 } },
  escritorio: { izq: { hombro: 26, codo: -70 }, der: { hombro: 26, codo: -70 } },
};

export const mezclarBrazo = (a: Brazo, b: Brazo, p: number): Brazo => ({
  hombro: lerp(a.hombro, b.hombro, p),
  codo: lerp(a.codo, b.codo, p),
});

const ROPA: Record<Ropa, { torso: string; manga: string; pantalon: string; mangaLarga: boolean }> = {
  camiseta: { torso: C.cian, manga: C.cian, pantalon: "#2B4061", mangaLarga: false },
  montana: { torso: C.ambar, manga: C.ambar, pantalon: "#33415C", mangaLarga: true },
  sudadera: { torso: "#3F6290", manga: "#3F6290", pantalon: "#26354D", mangaLarga: true },
  traje: { torso: "#E6EBF1", manga: "#E6EBF1", pantalon: "#C9D2DD", mangaLarga: true },
};

type Props = {
  altura?: number;
  expresion?: Expresion;
  ropa?: Ropa;
  capa?: number; // opacidad de la capa (0 = sin capa)
  brazoIzq?: Brazo;
  brazoDer?: Brazo;
  caminar?: number; // fase en radianes; undefined = quieto
  inflar?: number; // 0..1 → +15 % de ancho
  colorManos?: string;
  burbujas?: number; // 0..1
  copa?: boolean;
  ojeras?: boolean;
  sinPiernas?: boolean;
  semilla?: number;
  style?: React.CSSProperties;
};

const dir = (lado: number, ang: number) => {
  const r = (ang * Math.PI) / 180;
  return [lado * Math.sin(r), Math.cos(r)];
};

export const Humano: React.FC<Props> = ({
  altura = 400,
  expresion = "normal",
  ropa = "camiseta",
  capa = 0,
  brazoIzq = POSES.reposo.izq,
  brazoDer = POSES.reposo.der,
  caminar,
  inflar = 0,
  colorManos,
  burbujas = 0,
  copa = false,
  ojeras = false,
  sinPiernas = false,
  semilla = 0,
  style,
}) => {
  const f = useCurrentFrame();
  const r = ROPA[ropa];
  const manos = colorManos ?? (ropa === "traje" ? "#CBD4DF" : C.piel);
  const respira = 1 + Math.sin(f / 12) * 0.012;
  const parpadeo = (f + semilla * 37) % 110 < 4;

  const brazo = (sx: number, sy: number, lado: number, b: Brazo) => {
    const [d1x, d1y] = dir(lado, b.hombro);
    const ex = sx + d1x * 42;
    const ey = sy + d1y * 42;
    const [d2x, d2y] = dir(lado, b.hombro + b.codo);
    const hx = ex + d2x * 40;
    const hy = ey + d2y * 40;
    return (
      <g>
        <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={r.manga} strokeWidth={24} strokeLinecap="round" />
        <line
          x1={ex}
          y1={ey}
          x2={hx}
          y2={hy}
          stroke={r.mangaLarga ? r.manga : C.piel}
          strokeWidth={r.mangaLarga ? 22 : 18}
          strokeLinecap="round"
        />
        <circle cx={hx} cy={hy} r={12} fill={manos} />
        {copa && lado === 1 ? (
          <g transform={`translate(${hx} ${hy - 6})`}>
            <path d="M-13 -46 L13 -46 Q14 -22 0 -16 Q-14 -22 -13 -46 Z" fill="rgba(244,246,248,0.25)" stroke={C.blanco} strokeWidth={3} />
            <path d="M-11 -34 L11 -34 Q11 -22 0 -18 Q-11 -22 -11 -34 Z" fill={C.coral} />
            <line x1={0} y1={-16} x2={0} y2={2} stroke={C.blanco} strokeWidth={3} />
            <line x1={-9} y1={2} x2={9} y2={2} stroke={C.blanco} strokeWidth={3} strokeLinecap="round" />
          </g>
        ) : null}
      </g>
    );
  };

  const swing = caminar === undefined ? 0 : Math.sin(caminar) * 22;
  const pierna = (hx: number, ang: number) => {
    const [dx, dy] = dir(1, ang);
    const fx = hx + dx * 80;
    const fy = 200 + dy * 80;
    return (
      <g>
        <line x1={hx} y1={200} x2={fx} y2={fy} stroke={r.pantalon} strokeWidth={26} strokeLinecap="round" />
        <ellipse cx={fx + 6} cy={fy + 6} rx={18} ry={10} fill={C.tinta} />
      </g>
    );
  };

  const ojos = () => {
    const ojo = (cx: number) => {
      switch (expresion) {
        case "cansado":
          return (
            <g key={cx}>
              <path d={`M${cx - 9} 58 Q${cx} 66 ${cx + 9} 58`} stroke={C.tinta} strokeWidth={4.5} fill="none" strokeLinecap="round" />
              <path d={`M${cx - 11} 50 L${cx + 9} 47`} stroke={C.tinta} strokeWidth={3.5} strokeLinecap="round" />
            </g>
          );
        case "feliz":
          return <path key={cx} d={`M${cx - 8} 61 Q${cx} 50 ${cx + 8} 61`} stroke={C.tinta} strokeWidth={5} fill="none" strokeLinecap="round" />;
        case "sorprendido":
          return (
            <g key={cx}>
              <ellipse cx={cx} cy={58} rx={7.5} ry={parpadeo ? 1 : 8.5} fill={C.tinta} />
              <path d={`M${cx - 9} 40 Q${cx} 34 ${cx + 9} 40`} stroke={C.tinta} strokeWidth={3.5} fill="none" strokeLinecap="round" />
            </g>
          );
        default:
          return <ellipse key={cx} cx={cx} cy={58} rx={5.5} ry={parpadeo ? 0.8 : 6} fill={C.tinta} />;
      }
    };
    return [ojo(84), ojo(116)];
  };

  const boca = () => {
    switch (expresion) {
      case "sorprendido":
        return <ellipse cx={100} cy={84} rx={7} ry={9} fill={C.tinta} />;
      case "cansado":
        return <path d="M90 84 Q100 80 110 85" stroke={C.tinta} strokeWidth={4} fill="none" strokeLinecap="round" />;
      case "frio": {
        const tr = Math.sin(f * 1.7) * 1.2;
        return (
          <path
            d={`M86 ${84 + tr} l4.6 -4 l4.6 4 l4.6 -4 l4.6 4 l4.6 -4 l4.6 4`}
            stroke={C.tinta}
            strokeWidth={3.5}
            fill="none"
            strokeLinejoin="round"
          />
        );
      }
      case "feliz":
        return <path d="M86 78 Q100 96 114 78 Z" fill={C.tinta} />;
      default:
        return <path d="M89 80 Q100 89 111 80" stroke={C.tinta} strokeWidth={4} fill="none" strokeLinecap="round" />;
    }
  };

  const sx = 1 + 0.15 * inflar;
  const sy = 1 + 0.06 * inflar;

  // burbujas: suben desde ojos y boca
  const listaBurbujas =
    burbujas > 0
      ? new Array(12).fill(0).map((_, i) => {
          const origen = [
            [84, 56],
            [116, 56],
            [100, 86],
          ][i % 3];
          const ciclo = 40 + (i % 4) * 9;
          const t = ((f + i * 13) % ciclo) / ciclo;
          const x = origen[0] + Math.sin(t * 6 + i) * 8 + (i % 2 ? 6 : -6) * t;
          const y = origen[1] - t * 70;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={2.5 + (i % 3) * 1.6 + t * 2}
              fill="rgba(46,196,230,0.15)"
              stroke={C.cian}
              strokeWidth={1.8}
              opacity={burbujas * (1 - t) * 0.95}
            />
          );
        })
      : null;

  return (
    <svg
      viewBox="0 0 200 320"
      width={(altura * 200) / 320}
      height={altura}
      style={{ overflow: "visible", ...style }}
    >
      <g transform={`translate(100 160) scale(${sx} ${sy}) translate(-100 -160)`}>
        {capa > 0 ? (
          <path
            d={`M70 112 Q${30 + Math.sin(f / 7) * 10} 210 ${20 + Math.sin(f / 6) * 14} 268 L${150 + Math.sin(f / 8) * 8} 262 Q140 200 130 112 Z`}
            fill={C.coral}
            opacity={capa}
          />
        ) : null}
        {ropa === "sudadera" ? <circle cx={100} cy={96} r={40} fill="#33527C" /> : null}
        {!sinPiernas ? (
          <>
            {pierna(84, 6 + swing)}
            {pierna(116, -6 - swing)}
          </>
        ) : null}
        <g transform={`translate(100 210) scale(1 ${respira}) translate(-100 -210)`}>
          <path
            d="M62 140 Q62 104 100 104 Q138 104 138 140 L141 196 Q141 212 125 212 L75 212 Q59 212 59 196 Z"
            fill={r.torso}
          />
          {ropa === "camiseta" ? <path d="M86 106 Q100 120 114 106" stroke="#22A6C4" strokeWidth={5} fill="none" /> : null}
          {ropa === "montana"
            ? [138, 162, 186].map((y) => (
                <path key={y} d={`M62 ${y} Q100 ${y + 8} 139 ${y}`} stroke="#E09A10" strokeWidth={4} fill="none" />
              ))
            : null}
          {ropa === "montana" ? <line x1={100} y1={106} x2={100} y2={210} stroke="#E09A10" strokeWidth={4} /> : null}
          {ropa === "sudadera" ? (
            <>
              <path d="M76 176 L124 176 L120 200 L80 200 Z" fill="#35557F" />
              <line x1={92} y1={108} x2={90} y2={140} stroke={C.blanco} strokeWidth={3} strokeLinecap="round" />
              <line x1={108} y1={108} x2={110} y2={140} stroke={C.blanco} strokeWidth={3} strokeLinecap="round" />
            </>
          ) : null}
          {ropa === "traje" ? (
            <>
              <rect x={82} y={140} width={36} height={26} rx={5} fill={C.nocheBorde} />
              <circle cx={92} cy={153} r={4} fill={C.cian} />
              <circle cx={108} cy={153} r={4} fill={C.coral} />
            </>
          ) : null}
        </g>
        {brazo(64, 128, -1, brazoIzq)}
        {brazo(136, 128, 1, brazoDer)}
        {/* cabeza */}
        <circle cx={100} cy={60} r={44} fill={C.piel} />
        <path d="M57 54 Q58 14 100 14 Q142 14 143 54 Q130 34 102 36 Q74 34 57 54 Z" fill={C.pelo} />
        {ropa === "montana" ? (
          <>
            <path d="M56 50 Q58 8 100 8 Q142 8 144 50 Z" fill={C.cian} />
            <rect x={54} y={42} width={92} height={14} rx={7} fill="#22A6C4" />
            <circle cx={100} cy={6} r={10} fill={C.blanco} />
            <rect x={70} y={22} width={60} height={16} rx={8} fill={C.tinta} />
            <rect x={76} y={25} width={20} height={10} rx={5} fill={C.ambar} opacity={0.8} />
            <rect x={104} y={25} width={20} height={10} rx={5} fill={C.ambar} opacity={0.8} />
          </>
        ) : null}
        {ojos()}
        {ojeras ? (
          <>
            <path d="M77 70 Q84 74 91 70" stroke="#9C7A8E" strokeWidth={3} fill="none" opacity={0.7} />
            <path d="M109 70 Q116 74 123 70" stroke="#9C7A8E" strokeWidth={3} fill="none" opacity={0.7} />
          </>
        ) : null}
        <circle cx={74} cy={76} r={7} fill={expresion === "frio" ? C.frio : C.coral} opacity={0.3} />
        <circle cx={126} cy={76} r={7} fill={expresion === "frio" ? C.frio : C.coral} opacity={0.3} />
        {boca()}
        {ropa === "traje" ? (
          <>
            <circle cx={100} cy={64} r={60} fill="rgba(46,196,230,0.14)" stroke={C.blanco} strokeWidth={6} />
            <path d="M58 46 Q66 22 90 12" stroke={C.blanco} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
          </>
        ) : null}
        {listaBurbujas}
      </g>
    </svg>
  );
};
