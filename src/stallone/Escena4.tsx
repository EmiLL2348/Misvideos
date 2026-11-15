import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useEscena } from "../comun/timeline";
import { F_CIFRA, F_MANO, F_TITULO, P, clampI, prog, rebote, interp } from "./estilo";
import { Pelicula, Plano, Rotulo, Sfx, Tics } from "./escenario";
import { Boxeador, POSE, Sasha, Sly } from "./Personajes";

const Publico: React.FC<{ fila: number; de_pie: number; f: number }> = ({ fila, de_pie, f }) => {
  const n = 9 - fila;
  const y = 760 + fila * 120;
  const esc = 1 + fila * 0.35;
  return (
    <>
      {new Array(n).fill(0).map((_, i) => {
        const x = (i + 0.5) * (1920 / n) + (fila % 2) * 60 - 30;
        const sube = de_pie * (60 + (i % 3) * 14) * esc;
        const brazos = de_pie > 0.5 && (i + fila) % 2 === 0;
        return (
          <div key={i} style={{ position: "absolute", left: x - 70 * esc, top: y - sube + Math.sin(f / 5 + i) * 4 * de_pie }}>
            <svg width={140 * esc} height={200 * esc} viewBox="0 0 140 200" style={{ overflow: "visible" }}>
              {brazos ? <path d={`M30 110 L${10 + Math.sin(f / 4 + i) * 8} 20 M110 110 L${130 + Math.cos(f / 4 + i) * 8} 20`} stroke="#07060A" strokeWidth={18} strokeLinecap="round" /> : null}
              <path d="M10 200 Q14 110 70 104 Q126 110 130 200 Z" fill="#07060A" />
              <ellipse cx={70} cy={70} rx={34} ry={40} fill="#07060A" />
              <path d="M44 40 Q70 26 96 40" stroke="rgba(230,230,255,0.25)" strokeWidth={4} fill="none" />
            </svg>
          </div>
        );
      })}
    </>
  );
};

export const Escena4: React.FC = () => {
  const f = useCurrentFrame();
  const { cue, dur } = useEscena("s4");
  const c = {
    combate: cue("combate"),
    aguanto: cue("aguantó"),
    tumbar: cue("tumbar"),
    perdio: cue("perdió"),
    publico: cue("público"),
    idea: cue("idea"),
    escribio: cue("escribió"),
    mano: cue("mano"),
  };
  const asalto = Math.round(
    f < c.aguanto ? 1 : f < c.tumbar ? interp(f, [c.aguanto, c.tumbar], [1, 9], clampI) : interp(f, [c.tumbar + 30, c.perdio], [9, 15], clampI)
  );
  const caidaCampeon = f < c.tumbar ? 0 : interp(f, [c.tumbar, c.tumbar + 10, c.tumbar + 50, c.tumbar + 70], [0, 1, 1, 0], clampI);
  const golpe = f >= c.tumbar - 8 && f < c.tumbar + 4 ? prog(f, c.tumbar - 8, 6) : 0;
  const dePie = prog(f, c.publico - 4, 20);

  // Plano B · escribir
  const L = dur - c.escribio;
  const t = (f - c.escribio) / Math.max(1, L);
  const dia = t < 0.33 ? "DÍA 1" : t < 0.66 ? "DÍA 2" : "DÍA 3½";
  const cielo = 0.5 + 0.5 * Math.cos(t * Math.PI * 2 * 2.5);

  return (
    <AbsoluteFill style={{ background: P.negro }}>
      <Plano desde={0} hasta={c.escribio}>
        <AbsoluteFill style={{ background: "#0B0910" }} />
        {/* pantalla */}
        <div style={{ position: "absolute", left: 420, top: 70, width: 1080, height: 560, background: "linear-gradient(#D8D2C4, #A8A294)", boxShadow: "0 0 120px rgba(220,215,200,0.35)", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 380, bottom: 0, background: "#8A8578" }} />
          {[300, 340, 380].map((y) => (
            <div key={y} style={{ position: "absolute", left: 60, right: 60, top: y, height: 5, background: "#5A564C" }} />
          ))}
          {f >= c.combate - 6 ? (
            <>
              <div style={{ position: "absolute", left: 250, top: 70, opacity: prog(f, c.combate - 6, 12) }}>
                <Boxeador altura={360} golpe={0} caer={caidaCampeon} borde={P.dorado} />
              </div>
              <div style={{ position: "absolute", left: 560, top: 70, opacity: prog(f, c.combate, 12) }}>
                <Boxeador altura={360} espejo golpe={golpe} borde={P.ladrillo} caer={f > c.perdio + 10 ? 0.15 : 0} />
              </div>
              <div style={{ position: "absolute", left: 210, top: 26, fontFamily: F_TITULO, fontWeight: 900, fontSize: 30, color: "#2A241C", letterSpacing: 3, opacity: prog(f, c.combate + 4, 12) }}>EL CAMPEÓN</div>
              <div style={{ position: "absolute", left: 640, top: 26, fontFamily: F_TITULO, fontWeight: 900, fontSize: 30, color: "#5A1E14", letterSpacing: 3, opacity: prog(f, c.combate + 10, 12) }}>EL OLVIDADO</div>
              <div style={{ position: "absolute", right: 30, bottom: 24, padding: "6px 18px", background: "#1A1410", color: P.crema, fontFamily: F_CIFRA, fontWeight: 800, fontSize: 34 }}>ASALTO {asalto}</div>
            </>
          ) : null}
          <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${0.06 + 0.05 * Math.sin(f * 2.3)})` }} />
        </div>
        {/* haz del proyector con humo */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="haz" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="rgba(240,235,220,0.28)" />
              <stop offset="1" stopColor="rgba(240,235,220,0.04)" />
            </linearGradient>
          </defs>
          <polygon points="900,1080 1020,1080 1500,630 420,630" fill="url(#haz)" />
        </svg>
        {new Array(7).fill(0).map((_, i) => {
          const tt = ((f + i * 40) % 280) / 280;
          return <div key={i} style={{ position: "absolute", left: 600 + i * 110 + Math.sin(tt * 6 + i) * 60, top: 900 - tt * 380, width: 220, height: 120, borderRadius: "50%", background: "rgba(230,225,210,0.08)", filter: "blur(20px)" }} />;
        })}
        <Publico fila={0} de_pie={dePie} f={f} />
        <div style={{ position: "absolute", left: 760, top: 700 - dePie * 70 }}>
          <Sly vista="espalda" altura={560} luz={f >= c.idea - 4 ? P.dorado : "rgba(240,235,220,0.6)"} />
        </div>
        {f >= c.idea - 4 ? <div style={{ position: "absolute", left: 640, top: 560 - dePie * 70, width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,182,74,0.45), transparent 70%)", opacity: prog(f, c.idea - 4, 16) }} /> : null}
        <Publico fila={1} de_pie={dePie} f={f} />
        <Rotulo texto="24 · MARZO · 1975" desde={6} hasta={c.combate + 30} y={980} tam={46} />
        <Sfx archivo="audio/stallone/multitud.mp3" en={c.publico - 6} vol={0.5} dur={140} />
        <Sfx archivo="audio/stallone/portazo.mp3" en={c.tumbar - 2} vol={0.4} dur={30} />
        <Tics desde={c.aguanto} pasos={8} cada={Math.max(3, (c.tumbar - c.aguanto) / 8)} vol={0.25} />
      </Plano>

      <Plano desde={c.escribio} hasta={dur + 10}>
        <AbsoluteFill style={{ background: "#1A1622" }} />
        <div style={{ position: "absolute", left: 1320, top: 140, width: 420, height: 380, border: "16px solid #3A2C22", background: `linear-gradient(${cielo > 0.5 ? "#0E1424" : "#3A4A6A"}, ${cielo > 0.5 ? "#1C2A44" : "#C8873A"})` }} />
        <div style={{ position: "absolute", left: 640, top: 250 }}>
          <Sly altura={600} expresion="decidido" sinPiernas brazoIzq={POSE.escribir.izq} brazoDer={{ hombro: 22, codo: -100 + Math.sin(f * 1.4) * 8 }} />
        </div>
        <div style={{ position: "absolute", left: 420, top: 690, width: 1100, height: 34, background: "#6B4630", borderRadius: 6 }} />
        <div style={{ position: "absolute", left: 460, top: 724, width: 1020, height: 400, background: "#4E3222" }} />
        <div style={{ position: "absolute", left: 760, top: 640, width: 330, height: 60, background: "#F2EAD6", transform: "skewX(-20deg)", boxShadow: "0 4px 10px rgba(0,0,0,0.4)" }}>
          {[12, 24, 36, 48].map((y) => (
            <div key={y} style={{ position: "absolute", left: 20, right: 30, top: y, height: 2, background: "#7A8AA8" }} />
          ))}
        </div>
        {/* vela que se consume */}
        <div style={{ position: "absolute", left: 1240, top: 690 - 150 * (1 - t * 0.85), width: 40, height: 150 * (1 - t * 0.85), background: "#EFE6D2", borderRadius: 6 }} />
        <div style={{ position: "absolute", left: 1246, top: 640 - 150 * (1 - t * 0.85), width: 28, height: 50, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: "radial-gradient(#FFF6C8, #FFB23A)", transform: `scaleX(${1 + Math.sin(f / 2) * 0.12})` }} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 66% 60%, rgba(255,190,90,0.3), transparent 55%)" }} />
        {/* páginas que vuelan */}
        {new Array(10).fill(0).map((_, i) => {
          const tt = ((f - c.escribio + i * 13) % 60) / 60;
          if (f - c.escribio < i * 6) return null;
          return (
            <div key={i} style={{ position: "absolute", left: 900 - tt * 700 + i * 20, top: 620 - tt * 520 + Math.sin(tt * 8 + i) * 40, width: 120, height: 160, background: "#F2EAD6", transform: `rotate(${tt * 360 + i * 30}deg)`, opacity: 1 - tt, boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>
              {[30, 50, 70, 90, 110].map((y) => (
                <div key={y} style={{ position: "absolute", left: 14, right: 14, top: y, height: 3, background: "#7A8AA8" }} />
              ))}
            </div>
          );
        })}
        {f >= c.mano - 20 ? (
          <div style={{ position: "absolute", left: interp(f, [c.mano - 20, c.mano + 10], [-300, 160], clampI), top: 280 }}>
            <Sasha altura={560} taza expresion="sonrisa" sinPiernas />
          </div>
        ) : null}
        <div key={dia} style={{ position: "absolute", left: 120, top: 90, fontFamily: F_MANO, fontWeight: 700, fontSize: 110, color: P.crema, transform: `rotate(-6deg) scale(${0.8 + 0.2 * rebote(f, c.escribio + Math.floor(Math.min(2, t * 3)) * (L / 3))})`, textShadow: "0 6px 20px rgba(0,0,0,0.8)" }}>
          {dia}
        </div>
      </Plano>
      <Pelicula vineta={0.85} />
    </AbsoluteFill>
  );
};
