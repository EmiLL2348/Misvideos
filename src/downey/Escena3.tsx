import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useEscena } from "../comun/timeline";
import { Destello, Plano } from "../stallone/escenario";
import { D, interp, prog } from "./estilo";
import { AVANCE_POR_RADIAN, Robert, SiluetaD, topDePie } from "./Personajes";
import { CamaraTripode, Foco, Look } from "./props";
import { Efecto, Rotulo } from "./ui";

const SUELO_PLATO = 920;
const SUELO_ALFOMBRA = 880;

export const Escena3: React.FC = () => {
  const f = useCurrentFrame();
  const { cue, dur } = useEscena("s3");
  const c = { chaplin: cue("chaplin"), nominacion: cue("nominación"), primera: cue("primera") };
  const color = prog(f, c.nominacion - 20, 30);
  const flashes = [c.nominacion - 16, c.nominacion - 6, c.nominacion + 4];

  // alfombra: Robert camina en el sitio y el fondo avanza a la velocidad del paso (los pies no resbalan)
  const ALTO = 560;
  const k = ALTO / 460;
  const fase = Math.max(0, f - c.nominacion) * 0.16;
  const avance = fase * AVANCE_POR_RADIAN * k;

  return (
    <AbsoluteFill style={{ background: D.negro }}>
      {/* A · plató en blanco y negro que pasa a color */}
      <Plano desde={0} hasta={c.nominacion + 20}>
        <AbsoluteFill style={{ filter: `grayscale(${1 - color}) contrast(${1.05})` }}>
          <AbsoluteFill style={{ background: "linear-gradient(#5A5F6A, #3A3E46)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: SUELO_PLATO, bottom: 0, background: "linear-gradient(#8A8270, #6E6858)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: SUELO_PLATO, height: 5, background: "rgba(0,0,0,0.3)" }} />
          {/* decorado: fachada de época */}
          <div style={{ position: "absolute", left: 1100, top: 260, width: 640, height: SUELO_PLATO - 260, background: "#B9A890", border: "10px solid #8A7A62" }}>
            <div style={{ position: "absolute", left: 60, top: 80, width: 180, height: 220, background: "#4A5868" }} />
            <div style={{ position: "absolute", left: 360, top: 160, width: 160, height: SUELO_PLATO - 260 - 170, background: "#5A3E2E" }} />
          </div>
          {/* haz del foco */}
          <div style={{ position: "absolute", left: 520, top: 0, width: 760, height: SUELO_PLATO, background: "linear-gradient(rgba(255,250,235,0.45), rgba(255,250,235,0.1))", clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)" }} />
          <div style={{ position: "absolute", left: 640, top: SUELO_PLATO - 30, width: 520, height: 60, borderRadius: "50%", background: "rgba(255,250,235,0.35)" }} />
          <div style={{ position: "absolute", left: 160, top: SUELO_PLATO - 300 }}>
            <CamaraTripode />
          </div>
          <div style={{ position: "absolute", left: 1560, top: SUELO_PLATO - 360 }}>
            <Foco mirarIzq />
          </div>
          <div style={{ position: "absolute", left: 900 - 100 * (600 / 460), top: topDePie(SUELO_PLATO, 600) }}>
            <Robert alto={600} edad="joven" ropa="epoca" bombin bastonEnSuelo expresion="sonrisa" brazoDer={{ hombro: 16, codo: -14 }} luz="#FFFFFF" />
          </div>
        </AbsoluteFill>
        {flashes.map((t, i) => (
          <React.Fragment key={i}>
            <Destello en={t} dur={7} />
            <Efecto archivo="flash" en={t} vol={0.3} dur={15} />
          </React.Fragment>
        ))}
      </Plano>

      {/* B · alfombra roja */}
      <Plano desde={c.nominacion + 20} hasta={dur + 10}>
        <AbsoluteFill style={{ background: "linear-gradient(#2B3346, #3E2E3A)" }} />
        {/* fondo de photocall que avanza con el paso */}
        <div style={{ position: "absolute", left: -((avance * 0.6) % 240), top: 160, width: 2400, height: SUELO_ALFOMBRA - 160, backgroundImage: "repeating-linear-gradient(90deg, #E9E2D0 0 220px, #D8CFB8 220px 240px)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: SUELO_ALFOMBRA - 10, bottom: 0, background: "linear-gradient(#B8262E, #8E1C24)" }} />
        {/* fotógrafos al fondo */}
        {new Array(7).fill(0).map((_, i) => {
          const x = ((i * 380 - avance * 0.6) % 2660 + 2660) % 2660 - 380;
          const flash = (f + i * 17) % 40 < 3;
          return (
            <div key={i} style={{ position: "absolute", left: x, top: topDePie(SUELO_ALFOMBRA + 4, 400) }}>
              <SiluetaD alto={400} color="#1C2230" brazoDer={{ hombro: 150, codo: -50 }} />
              {flash ? <div style={{ position: "absolute", left: 90, top: 20, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(#FFFFFF, rgba(255,255,255,0))" }} /> : null}
            </div>
          );
        })}
        {/* postes y cordón (se mueven con el suelo) */}
        {new Array(8).fill(0).map((_, i) => {
          const x = ((i * 320 - avance) % 2560 + 2560) % 2560 - 320;
          return (
            <div key={i}>
              <div style={{ position: "absolute", left: x, top: SUELO_ALFOMBRA - 150, width: 14, height: 150, background: D.dorado }} />
              <div style={{ position: "absolute", left: x - 16, top: SUELO_ALFOMBRA - 8, width: 46, height: 10, borderRadius: "50%", background: "rgba(0,0,0,0.35)" }} />
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 0, right: 0, top: SUELO_ALFOMBRA - 110, height: 6, background: D.dorado, opacity: 0.8 }} />
        <div style={{ position: "absolute", left: 860, top: topDePie(SUELO_ALFOMBRA + 60, ALTO) }}>
          <Robert alto={ALTO} vista="perfil" edad="joven" ropa="esmoquin" paso={fase} luz="#FFE9C8" />
        </div>
        <Rotulo texto="1993 · NOMINADO AL ÓSCAR" desde={c.nominacion + 24} />
      </Plano>
      <Look />
    </AbsoluteFill>
  );
};
