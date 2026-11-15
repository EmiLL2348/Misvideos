import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useEscena } from "../comun/timeline";
import { F_TITULO, P, clampI, prog, rebote, interp } from "./estilo";
import { Cifra, Libreta, Maletin, Pelicula, Plano, Tics } from "./escenario";
import { Sly } from "./Personajes";

export const Escena1: React.FC = () => {
  const f = useCurrentFrame();
  const { cue, dur } = useEscena("s1");
  const c = { c106: cue("106"), rech: cue("rechazó"), guion: cue("guion"), parecia: cue("parecía"), locura: cue("locura"), mejor: cue("mejor") };

  // Plano B: maletín y cifra
  const valor = interp(f, [c.rech + 4, c.guion + 6], [0, 350000], clampI);
  const empuje = prog(f, c.rech - 4, 22);
  const no = c.locura - 6;
  // gesto de "no": la cabeza gira sobre el cuello, suave, tres veces
  const tNo = (f - no) / 40;
  const giro = tNo > 0 && tNo < 1 ? Math.sin(tNo * Math.PI * 3) * Math.sin(tNo * Math.PI) * 7 : 0;
  const aleja = prog(f, no + 22, 30);

  return (
    <AbsoluteFill style={{ background: P.negro }}>
      {/* A · libreta con $106 */}
      <Plano desde={0} hasta={c.rech}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #3A2A1E 0%, ${P.negro} 60%)` }} />
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${1 + f * 0.0012})` }}>
          <div style={{ opacity: prog(f, 4, 24), transform: `translateY(${(1 - prog(f, 4, 30)) * 60}px)` }}>
            <Libreta abrir={prog(f, c.c106 - 24, 20)} escribir={prog(f, c.c106 - 2, 26)} ancho={880} />
          </div>
        </AbsoluteFill>
      </Plano>

      {/* B · el maletín y el "no" */}
      <Plano desde={c.rech} hasta={c.mejor}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at 60% 30%, #4A3424 0%, #1A120D 70%)` }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, bottom: 0, background: "linear-gradient(#5A3825, #3A2414)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 636, height: 8, background: "#7A5236" }} />
        <div
          style={{
            position: "absolute",
            left: interp(empuje, [0, 1], [1500, 820]) + aleja * 700,
            top: 330 - aleja * 40,
            transform: `scale(${1 - aleja * 0.45})`,
            opacity: 1 - aleja * 0.6,
          }}
        >
          <Maletin ancho={560} />
          {/* mano con puño de traje que empuja */}
          <div style={{ position: "absolute", left: 540, top: 150, width: 420, height: 70, background: "#23232B", borderRadius: 30 }} />
          <div style={{ position: "absolute", left: 528, top: 148, width: 70, height: 74, background: "#F2EEE6", borderRadius: 10 }} />
          <div style={{ position: "absolute", left: 506, top: 156, width: 64, height: 58, background: P.piel, borderRadius: 26 }} />
        </div>
        <div style={{ position: "absolute", left: 760, top: 110, opacity: prog(f, c.rech + 2, 10) * (1 - aleja * 0.5) }}>
          <Cifra valor={valor} tam={150} color={P.billete} />
        </div>
        <Tics desde={c.rech + 6} pasos={7} cada={Math.max(4, (c.guion - c.rech) / 7)} />
        {f >= c.parecia - 6 ? (
          <div style={{ position: "absolute", left: 40, top: 300 + (1 - prog(f, c.parecia - 6, 18)) * 200 }}>
            <Sly vista="espalda" altura={1250} giroCabeza={giro} luz={P.ocre} />
          </div>
        ) : null}
      </Plano>

      {/* C · título */}
      <Plano desde={c.mejor} hasta={dur + 10} fundido={10}>
        <Cartel f={f - c.mejor} />
      </Plano>
      <Pelicula vineta={0.8} />
    </AbsoluteFill>
  );
};

/** Cartel de título estilo años 70. */
export const Cartel: React.FC<{ f: number; sub?: string }> = ({ f, sub = "Cómo Stallone creó Rocky" }) => {
  const rayos = new Array(18).fill(0);
  return (
    <AbsoluteFill style={{ background: P.crema, overflow: "hidden" }}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `rotate(${f * 0.08}deg) scale(1.6)` }}>
        <svg width={1920} height={1920} viewBox="-960 -960 1920 1920">
          {rayos.map((_, i) => (
            <path key={i} d={`M0 0 L${Math.cos((i / 18) * 2 * Math.PI) * 1400} ${Math.sin((i / 18) * 2 * Math.PI) * 1400} L${Math.cos(((i + 0.5) / 18) * 2 * Math.PI) * 1400} ${Math.sin(((i + 0.5) / 18) * 2 * Math.PI) * 1400} Z`} fill={i % 2 ? P.ocre : "#E2B577"} opacity={0.55} />
          ))}
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(242,227,198,0.9) 0%, rgba(242,227,198,0.2) 45%, transparent 70%)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 0 }}>
        {[
          { t: "106 DÓLARES", c: P.ladrillo, s: 190 },
          { t: "Y UN SUEÑO", c: P.marron, s: 150 },
        ].map((l, i) => {
          const p = rebote(f, 4 + i * 10, 30, 11);
          return (
            <div
              key={l.t}
              style={{
                fontFamily: F_TITULO,
                fontWeight: 900,
                fontSize: l.s,
                lineHeight: 0.95,
                color: l.c,
                letterSpacing: -2,
                textShadow: `6px 6px 0 ${P.ocre}`,
                transform: `translateY(${(1 - p) * -120}px) scale(${0.9 + 0.1 * p})`,
                opacity: Math.min(1, p * 1.5),
              }}
            >
              {l.t}
            </div>
          );
        })}
        <div style={{ marginTop: 30, fontFamily: F_TITULO, fontWeight: 700, fontStyle: "italic", fontSize: 50, color: P.marron, opacity: prog(f, 26, 16) }}>{sub}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
