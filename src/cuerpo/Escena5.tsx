import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Humano, POSES } from "./Humano";
import { C, FUENTE_TITULO, clampI, prog, rebote } from "./tema";
import { useEscena } from "./timeline";
import { Dato, EtiquetaEscena, Expediente, Panel, Tic, TicsContador, Titular } from "./ui";

const Habitacion: React.FC<{ horas: number; parpadea: boolean }> = ({ horas, parpadea }) => {
  const f = useCurrentFrame();
  const hh = String(Math.min(24, Math.floor(horas))).padStart(2, "0");
  const mm = horas >= 24 ? "00" : String(Math.floor((horas % 1) * 60)).padStart(2, "0");
  const visible = !parpadea || Math.floor(f / 12) % 2 === 0;
  return (
    <AbsoluteFill style={{ background: "#13233A" }}>
      {/* ventana */}
      <div style={{ position: "absolute", left: 130, top: 170, width: 360, height: 300, borderRadius: 20, border: `12px solid #2C4466`, background: "linear-gradient(#0A1322, #14284A)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 220, top: 40, width: 80, height: 80, borderRadius: "50%", background: C.ambar, boxShadow: `0 0 50px ${C.ambar}` }} />
        <div style={{ position: "absolute", left: 238, top: 30, width: 80, height: 80, borderRadius: "50%", background: "#0D1A30" }} />
        {new Array(12).fill(0).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: (i * 97) % 330, top: (i * 61) % 260, width: 4, height: 4, borderRadius: 2, background: C.blanco, opacity: 0.4 + 0.6 * Math.abs(Math.sin(f / 15 + i)) }} />
        ))}
        <div style={{ position: "absolute", left: 168, top: 0, width: 12, height: 300, background: "#2C4466" }} />
      </div>
      {/* reloj digital */}
      <div style={{ position: "absolute", right: 120, top: 150, padding: "20px 40px", borderRadius: 24, background: "#05090F", border: `6px solid ${C.nocheBorde}`, fontFamily: FUENTE_TITULO, fontWeight: 900, fontSize: 120, color: horas >= 24 ? C.coral : C.cian, letterSpacing: 6, textShadow: `0 0 30px ${horas >= 24 ? C.coral : C.cian}88`, opacity: visible ? 1 : 0.25 }}>
        {hh}:{mm}
      </div>
      {/* piso */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, bottom: 0, background: "#0B1626" }} />
      {/* luz de lámpara */}
      <div style={{ position: "absolute", left: 1150, top: 560, width: 0, height: 0, borderLeft: "180px solid transparent", borderRight: "180px solid transparent", borderBottom: `180px solid rgba(255,182,39,0.12)`, transform: "translateX(-180px)" }} />
    </AbsoluteFill>
  );
};

const Escritorio: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 1150, top: 520, width: 14, height: 160, background: C.gris, transform: "rotate(-18deg)", transformOrigin: "bottom" }} />
    <div style={{ position: "absolute", left: 1110, top: 505, width: 120, height: 60, borderRadius: "60px 60px 10px 10px", background: C.ambar }} />
    {/* laptop (vista trasera) */}
    <div style={{ position: "absolute", left: 830, top: 560, width: 240, height: 150, borderRadius: 14, background: "#C9D3DF", boxShadow: `0 0 80px ${C.cian}55` }}>
      <div style={{ position: "absolute", left: 100, top: 60, width: 40, height: 30, borderRadius: 8, background: C.gris }} />
    </div>
    <div style={{ position: "absolute", left: 640, top: 700, width: 720, height: 26, borderRadius: 10, background: "#5A6F8C" }} />
    <div style={{ position: "absolute", left: 670, top: 726, width: 660, height: 150, background: "#425674" }} />
  </>
);

const Fantasmas: React.FC<{ p: number }> = ({ p }) => {
  const f = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
      {new Array(6).fill(0).map((_, i) => {
        const a = f / 50 + (i / 6) * Math.PI * 2;
        const cx = 960 + Math.cos(a) * 420;
        const cy = 470 + Math.sin(a) * 200;
        const w = (k: number) => Math.sin(f / 6 + i + k) * 8;
        const d = `M${cx - 50} ${cy + 60} Q${cx - 60} ${cy - 70} ${cx} ${cy - 80} Q${cx + 60} ${cy - 70} ${cx + 50} ${cy + 60} Q${cx + 30} ${cy + 40 + w(1)} ${cx + 15} ${cy + 64} Q${cx} ${cy + 40 + w(2)} ${cx - 15} ${cy + 64} Q${cx - 30} ${cy + 40 + w(3)} ${cx - 50} ${cy + 60} Z`;
        return (
          <g key={i} opacity={p * (0.25 + 0.15 * Math.sin(f / 9 + i))}>
            <path d={d} fill={i % 2 ? C.cian : C.ambar} />
            <circle cx={cx - 16} cy={cy - 20} r={7} fill={C.noche} />
            <circle cx={cx + 16} cy={cy - 20} r={7} fill={C.noche} />
          </g>
        );
      })}
    </svg>
  );
};

export const Escena5: React.FC = () => {
  const f = useCurrentFrame();
  const { cue, dur } = useEscena("s5");
  const c = {
    despues: cue("después"),
    horas: cue("horas"),
    reflejos: cue("reflejos"),
    cerebro: cue("cerebro"),
    apagarse: cue("apagarse"),
    micro: cue("microsueños"),
    caso: cue("caso"),
    aguanto: cue("aguantó"),
    final: cue("final"),
    hablar: cue("hablar"),
    veia: cue("veía"),
  };

  const relojFin = Math.max(c.horas + 4, 70);
  const horas = interpolate(f, [8, relojFin], [0, 24], clampI);
  const cansancio = horas > 14 || f > c.cerebro;
  const destellos = [c.apagarse, c.micro];
  const negro = destellos.some((d) => f >= d && f < d + 9);
  const cabeceo = f >= c.cerebro && f < c.caso ? Math.max(0, Math.sin((f - c.cerebro) / 14)) * 10 : 0;
  const fantasmas = prog(f, c.veia - 4, 20);

  // tics del reloj: uno por hora
  const cadaHora = (relojFin - 8) / 24;
  const dias = (f - c.aguanto + 6) / 5;

  return (
    <AbsoluteFill>
      <Habitacion horas={horas} parpadea={horas >= 24 && f < c.reflejos} />
      <EtiquetaEscena num={4} titulo="Sin dormir" />
      <TicsContador desde={8 + cadaHora} pasos={24} cada={cadaHora} volumen={0.22} />
      {/* humano en el escritorio */}
      <div style={{ position: "absolute", left: 960 - 170, top: 250, transform: `rotate(${cabeceo}deg)`, transformOrigin: "50% 80%" }}>
        <Humano
          altura={540}
          ropa="sudadera"
          expresion={cansancio ? "cansado" : "normal"}
          ojeras={horas > 10}
          brazoIzq={POSES.escritorio.izq}
          brazoDer={POSES.escritorio.der}
          sinPiernas
          semilla={6}
        />
      </div>
      <Escritorio />
      <Fantasmas p={fantasmas} />
      {f >= c.hablar ? (
        <div style={{ position: "absolute", left: 1180, top: 300, opacity: prog(f, c.hablar, 10), transform: `scale(${rebote(f, c.hablar)})`, transformOrigin: "0 100%" }}>
          <div style={{ background: C.blanco, color: C.noche, borderRadius: 30, padding: "18px 34px", fontFamily: FUENTE_TITULO, fontWeight: 900, fontSize: 48 }}>
            ¿q-qué… dec…?
          </div>
        </div>
      ) : null}
      {f >= c.micro ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 920, textAlign: "center", opacity: Math.min(prog(f, c.micro + 9, 10), 1 - prog(f, c.caso - 12, 12)) }}>
          <Titular tam={72} color={C.ambar} desde={c.micro + 9}>
            MICROSUEÑOS
          </Titular>
        </div>
      ) : null}

      {/* pantalla dividida */}
      <Panel desde={c.reflejos - 4} hasta={c.cerebro} style={{ left: 0, top: 0, width: 1920, height: 1080 }}>
        <AbsoluteFill style={{ display: "flex", flexDirection: "row" }}>
          {[
            { t: "24 H SIN DORMIR", col: C.cian, copa: false },
            { t: "≈ 0.10 % DE ALCOHOL", col: C.coral, copa: true },
          ].map((m, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: i === 0 ? "#132640" : "#1E1830",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 30,
                transform: `translateX(${(1 - prog(f, c.reflejos - 4 + i * 6, 16)) * (i ? 960 : -960)}px)`,
              }}
            >
              <Humano altura={520} ropa="sudadera" expresion="cansado" ojeras copa={m.copa} brazoIzq={POSES.reposo.izq} brazoDer={m.copa ? POSES.copa.der : POSES.reposo.der} semilla={i} />
              <Titular tam={56} color={m.col} desde={c.reflejos + 6 + i * 10}>
                {m.t}
              </Titular>
            </div>
          ))}
          <div style={{ position: "absolute", left: 960 - 80, top: 360, width: 160, height: 160, borderRadius: "50%", background: C.blanco, color: C.noche, display: "grid", placeItems: "center", fontFamily: FUENTE_TITULO, fontWeight: 900, fontSize: 120, transform: `scale(${rebote(f, c.reflejos + 20)})` }}>
            =
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 160, textAlign: "center", opacity: prog(f, c.reflejos + 30, 12) }}>
            <Dato tam={30} color={C.gris}>
              Reflejos y juicio comparables (Dawson y Reid, Nature, 1997)
            </Dato>
          </div>
        </AbsoluteFill>
      </Panel>

      {/* expediente Randy Gardner */}
      <Panel desde={c.caso - 4} hasta={c.final} style={{ left: 0, top: 0, width: 1920, height: 1080, background: "rgba(10,18,30,0.72)" }}>
        <div style={{ position: "absolute", left: 960 - 470, top: 140 }}>
        <Expediente titulo="RANDY GARDNER · 1964 · 11 DÍAS" ancho={940}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 14 }}>
            {new Array(14).fill(0).map((_, i) => {
              const tachado = i < 11 && dias > i;
              const p = i < 11 ? Math.min(1, Math.max(0, dias - i)) : 0;
              return (
                <div key={i} style={{ position: "relative", height: 92, borderRadius: 14, background: i < 11 ? "#FFFFFF" : "#D9E1EA", border: `3px solid #B9C5D3`, display: "grid", placeItems: "center", fontFamily: FUENTE_TITULO, fontWeight: 800, fontSize: 34, color: C.noche }}>
                  {i + 1}
                  {tachado ? (
                    <svg width={90} height={90} style={{ position: "absolute" }}>
                      <path d="M18 18 L72 72 M72 18 L18 72" stroke={C.coral} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
                    </svg>
                  ) : null}
                </div>
              );
            })}
          </div>
          <Dato tam={32} color={C.noche} style={{ marginTop: 22 }}>
            <b>264 horas</b> despierto · estudiante de preparatoria en San Diego
          </Dato>
        </Expediente>
        </div>
      </Panel>
      <TicsContador desde={c.aguanto - 6 + 5} pasos={11} cada={5} volumen={0.35} />
      {destellos.map((d, i) => (
        <Tic key={i} en={d} volumen={0.15} />
      ))}

      {negro ? <AbsoluteFill style={{ background: "#000" }} /> : null}
    </AbsoluteFill>
  );
};
