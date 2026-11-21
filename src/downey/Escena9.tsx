import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useEscena } from "../comun/timeline";
import { Edificios, Plano } from "../stallone/escenario";
import { D, F_CIFRA, prog } from "./estilo";
import { L_ANTEBRAZO, L_BRAZO, POSE, Robert, SiluetaD, topDePie, resolverBrazo } from "./Personajes";
import { CampoBatalla, Guantelete } from "./heroe";
import { Destello } from "../stallone/escenario";
import { Carpeta, Look, Mesa, TrofeoSVG } from "./props";
import { Cita, Contador, Efecto, Particulas, Rotulo, Sello } from "./ui";

const SUELO = 900;

const Marquesina: React.FC<{ f: number }> = ({ f }) => {
  const n = 40;
  const on = Math.min(n, Math.floor(f / 1.4));
  return (
    <div style={{ position: "absolute", left: 360, top: 140, width: 1200, height: 280 }}>
      <div style={{ position: "absolute", inset: 0, background: "#3A2A22", borderRadius: 14, border: `10px solid ${D.sirena}` }} />
      {new Array(n).fill(0).map((_, i) => {
        const per = 2 * (1180 + 260);
        let d = (i / n) * per;
        let x = 0;
        let y = 0;
        if (d < 1180) [x, y] = [d, 0];
        else if ((d -= 1180) < 260) [x, y] = [1180, d];
        else if ((d -= 260) < 1180) [x, y] = [1180 - d, 260];
        else [x, y] = [0, 260 - (d - 1180)];
        const lit = i < on;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 18, height: 18, borderRadius: 9, background: lit ? "#FFF3C8" : "#5A4A3A", boxShadow: lit ? "0 0 14px 4px rgba(255,220,150,0.8)" : "none" }} />;
      })}
      <div style={{ position: "absolute", left: 50, right: 50, top: 46, bottom: 46, background: "#F4EEDE", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: F_CIFRA, fontWeight: 700, fontSize: 92, color: "#1C1C1C", letterSpacing: 8 }}>IRON MAN · MAYO 2008</span>
      </div>
    </div>
  );
};

export const Escena9: React.FC = () => {
  const f = useCurrentFrame();
  const { cue, dur } = useEscena("s9");
  const c = { mayo: cue("mayo"), recaudo: cue("recaudó"), m585: cue("585"), cobrar: cue("cobrar"), m50: cue("50"), y2015: cue("2015"), y2019: cue("2019"), chasquido: cue("chasquido"), indulto: cue("indultó"), y2024: cue("2024"), oscar: cue("óscar"), devolviste: cue("devolviste") };
  const ALTO = 620;
  const k = ALTO / 460;
  const MESA = 720;
  // 2019: plano general, levanta el guantelete
  const SUELO_B = 940;
  const AB = 620;
  const kB = AB / 460;
  const RXB = 960 - 100 * kB;
  const sube = prog(f, c.y2019 + 6, 16) * (1 - prog(f, c.chasquido + 30, 30));
  const brazoSnap = { hombro: 6 + 144 * sube, codo: 4 + 16 * sube };
  const rad = (a: number) => (a * Math.PI) / 180;
  const codoB: [number, number] = [132 + Math.sin(rad(brazoSnap.hombro)) * L_BRAZO, 112 + Math.cos(rad(brazoSnap.hombro)) * L_BRAZO];
  const manoLocal: [number, number] = [codoB[0] + Math.sin(rad(brazoSnap.hombro + brazoSnap.codo)) * L_ANTEBRAZO, codoB[1] + Math.cos(rad(brazoSnap.hombro + brazoSnap.codo)) * L_ANTEBRAZO];
  const manoB: [number, number] = [RXB + manoLocal[0] * kB, topDePie(SUELO_B, AB) + manoLocal[1] * kB];

  return (
    <AbsoluteFill style={{ background: D.negro }}>
      {/* A · marquesina del estreno y taquilla */}
      <Plano desde={0} hasta={c.y2015}>
        <AbsoluteFill style={{ background: "linear-gradient(#3A5888, #6A86B4)" }} />
        <div style={{ position: "absolute", left: 0, top: 0 }}>
          <Edificios semilla={12} base={SUELO} altoMin={480} altoMax={820} color="#46587A" colorVentana="#FFE6B0" encendidas={0.35} />
        </div>
        <div style={{ position: "absolute", left: 300, top: 120, width: 1320, height: SUELO - 120, background: "#5A3E30" }} />
        <Marquesina f={f} />
        <div style={{ position: "absolute", left: 780, top: 520, width: 360, height: SUELO - 520, background: "linear-gradient(#FFF0C8, #E8B66A)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: SUELO, bottom: 0, background: "#5A5E66" }} />
        {new Array(10).fill(0).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: 1180 + i * 70, top: topDePie(SUELO + 10, 330 - (i % 3) * 10) + Math.abs(Math.sin(f / 12 + i)) * -4 }}>
            <SiluetaD alto={330 - (i % 3) * 10} color="#1C2230" borde="#FFE6B0" />
          </div>
        ))}
        {f >= c.recaudo - 6 ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 440, display: "flex", justifyContent: "center", opacity: prog(f, c.recaudo - 6, 12) }}>
            <div style={{ padding: "10px 40px", background: "rgba(14,16,22,0.82)", borderRadius: 18, border: `4px solid ${D.dorado}` }}>
              <Contador desde={c.recaudo} hasta={c.m585 + 20} valor={585000000} tam={120} />
            </div>
          </div>
        ) : null}
        <Particulas desde={c.m585 + 14} x={560} y={300} ancho={800} suelo={SUELO} n={70} colores={["#F2D27A", "#E8B64A", "#FFF4C8"]} tam={12} />
        {f >= c.m50 - 6 ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", opacity: prog(f, c.m50 - 6, 12) }}>
            <div style={{ padding: "8px 30px", background: D.dorado, borderRadius: 14, fontFamily: F_CIFRA, fontWeight: 700, fontSize: 56, color: "#1C1C1C", letterSpacing: 2 }}>$50.000.000 · UNA SOLA PELÍCULA</div>
          </div>
        ) : null}
      </Plano>

      {/* B · el indulto: carpeta oficial apoyada en la mesa y sello */}
      <Plano desde={c.y2015} hasta={c.y2019}>
        <AbsoluteFill style={{ background: "linear-gradient(#C7B79C, #A89878)" }} />
        <div style={{ position: "absolute", left: 160, top: 120, width: 340, height: 420, background: "#E9E0CA", border: "10px solid #8A7454" }}>
          <div style={{ position: "absolute", left: 60, top: 70, width: 200, height: 200, borderRadius: "50%", border: "8px solid #8A7454" }} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: SUELO, bottom: 0, background: "#7A6A52" }} />
        <div style={{ position: "absolute", left: 300, top: MESA }}>
          <Mesa ancho={1320} alto={SUELO - MESA} color="#4A3424" tablero="#6A4A34" />
        </div>
        <div style={{ position: "absolute", left: 750, top: MESA - 420 * 0.62 + 6 }}>
          <Carpeta ancho={420} color="#E6DCC4" etiqueta="ESTADO DE CALIFORNIA">
            <Sello texto="INDULTO · 2015" en={c.indulto} color="#2E6A3A" tam={44} />
          </Carpeta>
        </div>
        <Efecto archivo="sello" en={c.indulto} vol={0.5} dur={15} />
        <Rotulo texto="2015" desde={c.y2015} hasta={c.y2019} />
      </Plano>

      {/* C · 2019: el chasquido (plano general → primer plano del guantelete → plano general) */}
      <Plano desde={c.y2019} hasta={c.y2024}>
        <CampoBatalla suelo={SUELO_B} />
        <div style={{ position: "absolute", left: RXB, top: topDePie(SUELO_B, AB) }}>
          <Robert alto={AB} ropa="armadura" brillo={0.7} expresion="serio" brazoDer={brazoSnap} brazoIzq={{ hombro: 10, codo: 6 }} />
        </div>
        {/* gemas en la mano levantada */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <circle cx={manoB[0]} cy={manoB[1]} r={60 + 10 * Math.sin(f / 3)} fill="rgba(255,190,110,0.35)" />
          {["#9B4DFF", "#3FA7FF", "#FF3B3B", "#3BFF8A", "#FFE23B", "#FF9A2E"].map((col, i) => (
            <circle key={col} cx={manoB[0] - 12 + (i % 3) * 12} cy={manoB[1] - 6 + Math.floor(i / 3) * 12} r={5} fill={col} />
          ))}
        </svg>
        <Destello en={c.chasquido + 2} dur={20} color="#FFF6E6" />
        <Particulas desde={c.chasquido + 6} x={300} y={200} ancho={1320} suelo={SUELO_B} n={70} colores={["#C8B8A8", "#E8D8C8", "#FFD8A0"]} tam={6} apagar />
        <Rotulo texto="2019" desde={c.y2019 + 4} hasta={c.chasquido - 10} />
      </Plano>
      <Plano desde={c.chasquido - 10} hasta={c.chasquido + 14} fundido={2}>
        <CampoBatalla suelo={980} />
        <div style={{ position: "absolute", left: 960 - 200 * (1150 / 560), top: 520 - 300 * (1150 / 560), transform: `scale(${1 + (f - c.chasquido + 10) * 0.002})`, transformOrigin: "50% 50%" }}>
          <Guantelete alto={1150} chasquido={prog(f, c.chasquido - 2, 3)} carga={1} semilla={7} />
        </div>
        <Destello en={c.chasquido + 1} dur={14} color="#FFF6E6" />
      </Plano>
      <Efecto archivo="clac" en={c.chasquido} vol={0.6} dur={10} />
      <Efecto archivo="flash" en={c.chasquido + 1} vol={0.5} dur={25} />

      {/* D · gala: trofeo genérico, Susan aplaude en primera fila, confeti que se posa en el suelo */}
      <Plano desde={c.y2024} hasta={dur + 10}>
        <AbsoluteFill style={{ background: "repeating-linear-gradient(90deg, #7A1820 0 60px, #9A242C 60px 100px, #6A141C 100px 140px)" }} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(255,236,200,0.45), rgba(0,0,0,0.25) 75%)" }} />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {[0, 1, 2, 3].map((i) => {
            const a = Math.sin((f - c.y2024) / 25 + i * 1.6) * 0.5;
            const x0 = 200 + i * 500;
            return <polygon key={i} points={`${x0},0 ${x0 + 40},0 ${960 + Math.sin(a) * 900 + 140},${SUELO} ${960 + Math.sin(a) * 900 - 140},${SUELO}`} fill="rgba(255,244,214,0.13)" />;
          })}
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: SUELO - 60, bottom: 0, background: "linear-gradient(#5A3A2A, #3A2618)" }} />
        <div style={{ position: "absolute", left: 960 - 100 * k, top: topDePie(SUELO - 60, ALTO) }}>
          <Robert alto={ALTO} ropa="esmoquin" expresion="sonrisa" gafas brazoIzq={resolverBrazo(68, 112, -1, 84, 222)} brazoDer={resolverBrazo(132, 112, 1, 116, 222)} objetoCentro={<g transform="translate(0 12)"><TrofeoSVG alto={110} /></g>} luz="#FFF4E2" />
        </div>
        <Particulas desde={c.oscar} x={200} y={-40} ancho={1520} suelo={SUELO - 60} n={90} colores={["#F2B45A", "#FFF4E2", "#E8B64A", "#7FB6E0"]} />
        {/* primera fila del público (capa delantera) */}
        {[120, 420, 1300, 1600].map((x, i) => (
          <div key={x} style={{ position: "absolute", left: x, top: 820 }}>
            <SiluetaD alto={460} tipo={i === 1 ? "mujer" : "hombre"} color="#120E12" borde={i === 1 ? D.amanecer : undefined} sombra={false} aplaudir={i === 1 ? 1 : undefined} />
          </div>
        ))}
        <Rotulo texto="2024" desde={c.y2024 + 4} />
        <Cita texto="Me devolviste a la vida" desde={c.devolviste - 4} y={60} />
      </Plano>
      <Look />
    </AbsoluteFill>
  );
};
