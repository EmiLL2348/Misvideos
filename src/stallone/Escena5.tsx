import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useEscena } from "../comun/timeline";
import { F_CIFRA, F_TITULO, P, clampI, prog, rebote, interp } from "./estilo";
import { Cifra, Libreta, Maletin, Pelicula, Plano, Sfx } from "./escenario";
import { Silueta, Sly } from "./Personajes";

const Despacho: React.FC<{ f: number }> = ({ f }) => (
  <>
    <AbsoluteFill style={{ background: "linear-gradient(#3A2618, #24170F)" }} />
    <div style={{ position: "absolute", left: 460, top: 60, width: 1000, height: 560, background: "linear-gradient(#FFE2A8, #E8B064)", boxShadow: "0 0 160px rgba(255,210,140,0.5)" }} />
    {new Array(14).fill(0).map((_, i) => (
      <div key={i} style={{ position: "absolute", left: 460, top: 60 + i * 40, width: 1000, height: 18, background: "#2A1A10", opacity: 0.85 }} />
    ))}
    {/* rayas de luz de las persianas */}
    <AbsoluteFill style={{ background: "repeating-linear-gradient(-28deg, rgba(255,215,150,0.14) 0 26px, transparent 26px 64px)", transform: `translateX(${Math.sin(f / 80) * 10}px)` }} />
  </>
);

const Ficha: React.FC<{ nombre: string; desde: number; x: number; rot: number }> = ({ nombre, desde, x, rot }) => {
  const f = useCurrentFrame();
  if (f < desde) return null;
  const p = rebote(f, desde, 30, 13);
  return (
    <div style={{ position: "absolute", left: x, top: 640 - (1 - p) * 500, transform: `rotate(${rot * p}deg)`, width: 240, height: 300, background: "#F2EAD6", padding: 12, boxShadow: "0 16px 30px rgba(0,0,0,0.5)" }}>
      <div style={{ width: "100%", height: 200, background: "linear-gradient(#2A2A3A, #4A4A5A)", border: `5px solid ${P.dorado}`, display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>
        <Silueta altura={260} color="#121218" borde={P.dorado} />
      </div>
      <div style={{ fontFamily: F_TITULO, fontWeight: 900, fontSize: 26, color: P.tinta, textAlign: "center", marginTop: 12, lineHeight: 1 }}>{nombre}</div>
    </div>
  );
};

export const Escena5: React.FC = () => {
  const f = useCurrentFrame();
  const { cue, dur, finVoz } = useEscena("s5");
  const c = {
    stallone: cue("stallone"),
    burt: cue("burt"),
    ryan: cue("ryan"),
    james: cue("james"),
    ofrecieron: cue("ofrecieron"),
    dinero: cue("dinero"),
    hasta: cue("hasta"),
    t350: cue("350"),
    c106: cue("106"),
    dijo: cue("dijo"),
    pelicula: cue("película"),
  };
  const cifras = [
    { v: 25000, en: c.ofrecieron },
    { v: 100000, en: c.dinero },
    { v: 250000, en: c.hasta },
    { v: 350000, en: c.t350 },
  ];
  const actual = cifras.filter((x) => f >= x.en).length;
  // Plano C: se levanta y se va
  const levanta = prog(f, c.dijo + 4, 16);
  const sale = prog(f, c.dijo + 30, Math.max(20, c.pelicula - c.dijo - 20));
  const portazo = Math.max(c.pelicula + 4, finVoz - 4);
  const cierre = interp(f, [portazo - 4, portazo], [0, 1], clampI);

  return (
    <AbsoluteFill style={{ background: P.negro }}>
      <Plano desde={0} hasta={c.c106}>
        <AbsoluteFill style={{ transform: `scale(${1.02 + f * 0.0001})` }}>
          <Despacho f={f} />
          <div style={{ position: "absolute", left: 480, top: 150 }}>
            <Silueta altura={620} traje puro color="#100A07" borde="#FFD48A" />
          </div>
          <div style={{ position: "absolute", left: 1080, top: 140 }}>
            <Silueta altura={640} traje puro color="#100A07" borde="#FFD48A" brazoDer={40} />
          </div>
          <div style={{ position: "absolute", left: 200, top: 600, width: 1520, height: 60, background: "linear-gradient(#5A3420, #3A2010)", borderRadius: 10 }} />
          <div style={{ position: "absolute", left: 240, top: 660, width: 1440, height: 440, background: "#2A170C" }} />
          <div style={{ position: "absolute", left: 860, top: 580, width: 200, height: 36, background: "#F2EAD6", transform: "skewX(-24deg)", boxShadow: "0 4px 8px rgba(0,0,0,0.4)" }} />
          <Ficha nombre="BURT REYNOLDS" desde={c.burt - 4} x={300} rot={-8} />
          <Ficha nombre="RYAN O'NEAL" desde={c.ryan - 4} x={1130} rot={6} />
          <Ficha nombre="JAMES CAAN" desde={c.james - 4} x={1400} rot={-4} />
          {/* pizarra */}
          {f >= c.ofrecieron - 8 ? (
            <div style={{ position: "absolute", left: 1440, top: 90, width: 420, height: 480, background: "#24302A", border: "14px solid #6B4630", padding: "26px 20px", opacity: prog(f, c.ofrecieron - 8, 12), boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
              {cifras.map((x, i) =>
                f >= x.en ? (
                  <div key={x.v} style={{ position: "relative", fontFamily: F_CIFRA, fontWeight: 800, fontSize: i === actual - 1 ? 64 : 42, color: i === actual - 1 ? "#F4F0E2" : "rgba(244,240,226,0.45)", marginBottom: 14, transform: `scale(${i === actual - 1 ? 0.8 + 0.2 * rebote(f, x.en) : 1})`, transformOrigin: "0 50%" }}>
                    ${x.v.toLocaleString("es-ES").replace(/\s/g, ".")}
                    {i < actual - 1 ? <div style={{ position: "absolute", left: 0, right: 40, top: "50%", height: 4, background: P.ladrillo }} /> : null}
                  </div>
                ) : null
              )}
            </div>
          ) : null}
          {/* Sly, pequeño, de espaldas */}
          <div style={{ position: "absolute", left: 820, top: 690 }}>
            <Sly vista="espalda" altura={480} sinPiernas luz="#FFD48A" />
          </div>
        </AbsoluteFill>
        {cifras.map((x) => (
          <Sfx key={x.v} archivo="audio/tic.mp3" en={x.en} vol={0.4} dur={8} />
        ))}
      </Plano>

      {/* B · pantalla dividida */}
      <Plano desde={c.c106 - 6} hasta={c.dijo}>
        <AbsoluteFill style={{ flexDirection: "row" }}>
          <div style={{ flex: 1, background: "radial-gradient(circle, #4A3424, #1A120D)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30 }}>
            <Maletin ancho={520} />
            <Cifra valor={350000} tam={90} color={P.billete} />
          </div>
          <div style={{ width: 8, background: P.crema }} />
          <div style={{ flex: 1, background: "radial-gradient(circle, #2A3A4A, #0E141C)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30 }}>
            <Libreta abrir={1} ancho={620} />
            <Cifra valor={106} tam={90} color={P.crema} />
          </div>
        </AbsoluteFill>
        <div style={{ position: "absolute", left: 960 - 60, top: 470, width: 120, height: 120, borderRadius: 60, background: P.ladrillo, color: P.crema, fontFamily: F_TITULO, fontWeight: 900, fontSize: 56, display: "grid", placeItems: "center", transform: `scale(${rebote(f, c.c106 + 6)})` }}>VS</div>
      </Plano>

      {/* C · se levanta, cierra el guion y se va */}
      <Plano desde={c.dijo} hasta={dur + 10}>
        <Despacho f={f} />
        <div style={{ position: "absolute", left: 480, top: 150 }}>
          <Silueta altura={620} traje puro color="#100A07" borde="#FFD48A" />
        </div>
        <div style={{ position: "absolute", left: 1080, top: 140 }}>
          <Silueta altura={640} traje puro color="#100A07" borde="#FFD48A" />
        </div>
        <div style={{ position: "absolute", left: 200, top: 600, width: 1520, height: 60, background: "linear-gradient(#5A3420, #3A2010)", borderRadius: 10 }} />
        <div style={{ position: "absolute", left: 240, top: 660, width: 1440, height: 440, background: "#2A170C" }} />
        {/* puerta a la izquierda */}
        <div style={{ position: "absolute", left: 0, top: 120, width: 200, height: 960, background: "#FFE7B0" }} />
        <div style={{ position: "absolute", left: 0, top: 120, width: 200 * (0.15 + 0.85 * cierre), height: 960, background: "linear-gradient(90deg, #4A2C1A, #6B4630)", boxShadow: "inset 0 0 0 12px #3A2010" }} />
        {sale < 1 ? (
          <div style={{ position: "absolute", left: interp(sale, [0, 1], [820, -260]), top: 690 - levanta * 230 }}>
            {sale > 0 ? (
              <div style={{ transform: "scaleX(-1)" }}>
                <Sly vista="perfil" altura={720} correr={f / 6} expresion="decidido" />
              </div>
            ) : (
              <Sly vista="espalda" altura={480 + levanta * 240} sinPiernas={levanta < 0.5} luz="#FFD48A" />
            )}
          </div>
        ) : null}
        {/* el guion se cierra */}
        <div style={{ position: "absolute", left: 860, top: 560, width: 200, height: 40, background: "#F2EAD6", transformOrigin: "0 100%", transform: `skewX(-24deg) scaleY(${1 - prog(f, c.dijo, 10) * 0.6})`, opacity: 1 - sale }} />
        <Sfx archivo="audio/stallone/portazo.mp3" en={portazo - 1} vol={0.9} dur={30} />
      </Plano>
      <Pelicula vineta={0.8} />
    </AbsoluteFill>
  );
};
