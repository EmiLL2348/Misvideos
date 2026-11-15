import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useEscena } from "../comun/timeline";
import { Plano } from "../stallone/escenario";
import { D, interp, prog } from "./estilo";
import { POSE, Robert, topDePie } from "./Personajes";
import { Carpeta, Foco, Look, Mesa, TrofeoSVG } from "./props";
import { Efecto, Sello } from "./ui";

const SUELO = 920;

export const Escena6: React.FC = () => {
  const f = useCurrentFrame();
  const { cue, dur } = useEscena("s6");
  const c = { salio: cue("salió"), globo: cue("globo"), abril: cue("abril"), despidieron: cue("despidieron"), ninguna: cue("ninguna"), contratarle: cue("contratarle") };
  const focos = [220, 560, 1360, 1700];
  const apagado = (i: number) => f >= c.abril + i * 9;
  const nApagados = focos.filter((_, i) => apagado(i)).length;
  const oscuridad = nApagados / focos.length;
  const ALTO = 600;
  const k = ALTO / 460;
  const puertas = [260, 760, 1260];
  const cierre = (i: number) => prog(f, c.ninguna + i * 10, 8);

  return (
    <AbsoluteFill style={{ background: D.negro }}>
      {/* A · plató de televisión: sostiene un trofeo genérico; luego se apagan las luces */}
      <Plano desde={0} hasta={c.ninguna}>
        <AbsoluteFill style={{ background: "linear-gradient(#4A6A9A, #2E4468)" }} />
        <div style={{ position: "absolute", left: 160, top: 120, width: 1600, height: SUELO - 120, background: "linear-gradient(#6A8AC0, #4A6A9A)", borderRadius: 20 }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: SUELO, bottom: 0, background: "linear-gradient(#3A4A66, #2A3650)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: SUELO, height: 5, background: "rgba(0,0,0,0.3)" }} />
        {focos.map((x, i) => (
          <div key={x} style={{ position: "absolute", left: x, top: SUELO - 360 }}>
            <Foco encendido={!apagado(i)} mirarIzq={i >= 2} />
          </div>
        ))}
        <div style={{ position: "absolute", left: 560, top: 0, width: 800, height: SUELO, background: "linear-gradient(rgba(255,250,230,0.4), rgba(255,250,230,0.08))", clipPath: "polygon(40% 0, 60% 0, 100% 100%, 0 100%)", opacity: 1 - oscuridad }} />
        <div style={{ position: "absolute", left: 960 - 100 * k, top: topDePie(SUELO, ALTO) }}>
          <Robert
            alto={ALTO}
            ropa="traje"
            expresion={f > c.despidieron ? "triste" : "sonrisa"}
            brazoIzq={POSE.sostener.izq}
            brazoDer={POSE.sostener.der}
            objetoCentro={<g transform="translate(0 12)"><TrofeoSVG alto={110} /></g>}
            luz="#FFF4E2"
          />
        </div>
        <AbsoluteFill style={{ background: `rgba(10,14,22,${oscuridad * 0.62})` }} />
        {focos.map((_, i) => (
          <Efecto key={i} archivo="clac" en={c.abril + i * 9} vol={0.35} dur={10} />
        ))}
      </Plano>

      {/* B · despacho: las puertas se cierran y el sello cae sobre la carpeta apoyada en la mesa */}
      <Plano desde={c.ninguna} hasta={dur + 10}>
        <AbsoluteFill style={{ background: "linear-gradient(#8E8678, #6E675C)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: SUELO, bottom: 0, background: "#5A5248" }} />
        {puertas.map((x, i) => (
          <div key={x}>
            <div style={{ position: "absolute", left: x, top: 220, width: 360, height: SUELO - 220, background: "#F3E7C8" }} />
            <div style={{ position: "absolute", left: x, top: 220, width: 360 * (0.12 + 0.88 * cierre(i)), height: SUELO - 220, background: "linear-gradient(90deg, #6A4A32, #7E5A40)", boxShadow: "inset 0 0 0 12px #5A3E2A" }} />
            <div style={{ position: "absolute", left: x - 14, top: 206, width: 388, height: SUELO - 206, border: "14px solid #4E3626", borderBottom: "none" }} />
          </div>
        ))}
        {/* mesa en primer plano con la carpeta apoyada */}
        <div style={{ position: "absolute", left: 360, top: 760 }}>
          <Mesa ancho={1200} alto={320} color="#3E2E22" tablero="#5A4232" />
        </div>
        <div style={{ position: "absolute", left: 750, top: 760 - 260 * 0.62 + 6 }}>
          <Carpeta ancho={420} etiqueta="SEGURO DE RODAJE" />
        </div>
        <div style={{ position: "absolute", left: 790, top: 640 }}>
          <Sello texto="NO ASEGURABLE" en={c.contratarle} />
        </div>
        {puertas.map((_, i) => (
          <Efecto key={i} archivo="puerta" en={c.ninguna + i * 10 + 7} vol={0.4} dur={20} />
        ))}
        <Efecto archivo="sello" en={c.contratarle} vol={0.5} dur={15} />
      </Plano>
      <Look />
    </AbsoluteFill>
  );
};
export { interp };
