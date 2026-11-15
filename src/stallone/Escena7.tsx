import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useEscena } from "../comun/timeline";
import { F_CIFRA, F_TITULO, P, clampI, miles, prog, rebote, interp } from "./estilo";
import { Edificios, Pelicula, Plano, Tics, Trofeo } from "./escenario";
import { Silueta } from "./Personajes";

const Marquesina: React.FC<{ f: number }> = ({ f }) => {
  const n = 46;
  const encendidas = Math.min(n, Math.floor(f / 1.5));
  return (
    <div style={{ position: "absolute", left: 360, top: 160, width: 1200, height: 300 }}>
      <div style={{ position: "absolute", inset: 0, background: "#2A1A12", borderRadius: 14, border: `10px solid ${P.ladrillo}` }} />
      {new Array(n).fill(0).map((_, i) => {
        const per = 2 * (1180 + 280);
        let d = (i / n) * per;
        let x = 0;
        let y = 0;
        if (d < 1180) [x, y] = [d, 0];
        else if ((d -= 1180) < 280) [x, y] = [1180, d];
        else if ((d -= 280) < 1180) [x, y] = [1180 - d, 280];
        else [x, y] = [0, 280 - (d - 1180)];
        const on = i < encendidas && !((f + i) % 40 === 0);
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 18, height: 18, borderRadius: 9, background: on ? "#FFF1C2" : "#5A4A3A", boxShadow: on ? "0 0 14px 4px rgba(255,220,150,0.8)" : "none" }} />;
      })}
      <div style={{ position: "absolute", left: 50, right: 50, top: 46, bottom: 46, background: "#F2EAD6", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: F_TITULO, fontWeight: 900, fontSize: 96, color: P.tinta, letterSpacing: 10 }}>ESTRENO</div>
        <div style={{ fontFamily: F_CIFRA, fontWeight: 800, fontSize: 40, color: P.ladrillo, letterSpacing: 8 }}>NOVIEMBRE · 1976</div>
      </div>
    </div>
  );
};

export const Escena7: React.FC = () => {
  const f = useCurrentFrame();
  const { cue, dur } = useEscena("s7");
  const c = { taquillera: cue("taquillera"), mundo: cue("mundo"), gano: cue("ganó"), tres: cue("tres"), mejor: cue("mejor"), nominado: cue("nominado"), charlie: cue("charlie"), orson: cue("orson"), welles: cue("welles") };
  const caja = interp(f, [c.taquillera, c.mundo + 10], [0, 225000000], clampI);
  const trofeos = ["MEJOR PELÍCULA", "DIRECCIÓN", "MONTAJE"];
  const galeria = [
    { n: "CHAPLIN", en: c.charlie },
    { n: "WELLES", en: c.orson },
    { n: "STALLONE", en: c.welles + 14 },
  ];
  return (
    <AbsoluteFill style={{ background: P.negro }}>
      <Plano desde={0} hasta={c.gano}>
        <AbsoluteFill style={{ background: "linear-gradient(#0E1424, #1C2A44)", transform: `scale(${1.05 - f * 0.0003})` }}>
          <div style={{ position: "absolute", left: 0, top: 0 }}>
            <Edificios semilla={3} base={1000} altoMin={500} altoMax={900} color="#141C30" encendidas={0.3} />
          </div>
          <div style={{ position: "absolute", left: 300, top: 120, width: 1320, height: 900, background: "#3A2218" }} />
          <Marquesina f={f} />
          <div style={{ position: "absolute", left: 760, top: 520, width: 400, height: 500, background: "linear-gradient(#FFE7B0, #C8873A)" }} />
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(255,220,150,0.25), transparent 60%)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 960, bottom: 0, background: "#141014" }} />
          {/* cola que dobla la esquina */}
          {new Array(16).fill(0).map((_, i) => {
            const x = 1180 + i * 70;
            return (
              <div key={i} style={{ position: "absolute", left: x, top: 650 + (i > 9 ? (i - 9) * 6 : 0) + Math.abs(Math.sin(f / 12 + i)) * -6 }}>
                <Silueta altura={340 - (i > 9 ? (i - 9) * 16 : 0)} color="#0A0709" sombrero={i % 3 === 0} borde="rgba(255,220,150,0.6)" />
              </div>
            );
          })}
        </AbsoluteFill>
        {f >= c.taquillera - 6 ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 40, textAlign: "center", opacity: prog(f, c.taquillera - 6, 12) }}>
            <div style={{ display: "inline-block", padding: "16px 40px", background: "rgba(13,11,10,0.85)", borderRadius: 20, border: `4px solid ${P.dorado}` }}>
              <div style={{ fontFamily: F_TITULO, fontWeight: 900, fontSize: 30, color: P.dorado, letterSpacing: 5 }}>TAQUILLA MUNDIAL</div>
              <div style={{ fontFamily: F_CIFRA, fontWeight: 800, fontSize: 110, color: P.dorado, fontVariantNumeric: "tabular-nums", textShadow: `0 0 30px ${P.dorado}88` }}>${miles(caja)}</div>
            </div>
          </div>
        ) : null}
        <Tics desde={c.taquillera} pasos={10} cada={Math.max(3, (c.mundo + 10 - c.taquillera) / 10)} vol={0.25} />
      </Plano>

      <Plano desde={c.gano} hasta={c.nominado}>
        <AbsoluteFill style={{ background: "repeating-linear-gradient(90deg, #6A0E14 0 60px, #8A1A20 60px 100px, #5A0A10 100px 140px)" }} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(255,230,180,0.35), rgba(0,0,0,0.65) 70%)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 860, height: 220, background: "linear-gradient(#3A2010, #1A0E08)" }} />
        {trofeos.map((t, i) => {
          const en = c.tres + i * 10;
          const p = rebote(f, en, 30, 12);
          if (f < en) return null;
          const resalta = i === 0 && f >= c.mejor;
          return (
            <div key={t} style={{ position: "absolute", left: 300 + i * 520, top: 260 + (1 - p) * 200, width: 420, textAlign: "center", opacity: Math.min(1, p * 1.4) }}>
              <div style={{ display: "inline-block", transform: `scale(${resalta ? 1.12 : 1})` }}>
                <Trofeo alto={420} brillo={resalta ? 1.6 : 1} />
              </div>
              <div style={{ marginTop: 20, fontFamily: F_TITULO, fontWeight: 900, fontSize: 40, color: resalta ? P.dorado : P.crema, letterSpacing: 2 }}>{t}</div>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 0, right: 0, top: 90, textAlign: "center", fontFamily: F_TITULO, fontWeight: 900, fontSize: 64, color: P.crema, opacity: prog(f, c.tres - 6, 12) }}>3 PREMIOS</div>
      </Plano>

      <Plano desde={c.nominado} hasta={dur + 10}>
        <AbsoluteFill style={{ background: "linear-gradient(#3A2C22, #24180F)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", fontFamily: F_TITULO, fontWeight: 900, fontSize: 58, color: P.crema, letterSpacing: 4, opacity: prog(f, c.nominado, 14) }}>
          ACTOR <span style={{ color: P.dorado }}>+</span> GUIONISTA
        </div>
        {galeria.map((g, i) => {
          const lit = f >= g.en;
          const p = prog(f, g.en, 14);
          const ultimo = i === 2;
          return (
            <div key={g.n} style={{ position: "absolute", left: 250 + i * 520, top: 220, width: 380, opacity: prog(f, c.nominado + i * 6, 12) }}>
              <div
                style={{
                  height: 470,
                  background: lit ? (ultimo ? "linear-gradient(#F6D27A, #C8873A)" : "linear-gradient(#E9DCC0, #B9A47E)") : "#2A2018",
                  border: `16px solid ${lit && ultimo ? P.dorado : "#6B4630"}`,
                  boxShadow: lit && ultimo ? `0 0 ${60 * p}px ${P.dorado}` : "0 20px 40px rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <Silueta altura={520} color={lit ? "#1A120D" : "#120C08"} />
              </div>
              <div style={{ marginTop: 20, textAlign: "center", fontFamily: F_TITULO, fontWeight: 900, fontSize: 48, color: lit ? (ultimo ? P.dorado : P.crema) : "#5A4A3A", letterSpacing: 4 }}>{g.n}</div>
            </div>
          );
        })}
      </Plano>
      <Pelicula vineta={0.75} />
    </AbsoluteFill>
  );
};
