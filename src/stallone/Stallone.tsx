import React, { useMemo } from "react";
import { AbsoluteFill, Audio, CalculateMetadataFunction, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Subtitulos } from "../comun/Subtitulos";
import { FPS, Guion, Manifiesto, Timeline, TimelineContext, calcularTimeline, leerManifiesto, normalizar } from "../comun/timeline";
import { Escena1 } from "./Escena1";
import { Escena2 } from "./Escena2";
import { Escena3 } from "./Escena3";
import { Escena4 } from "./Escena4";
import { Escena5 } from "./Escena5";
import { Escena6 } from "./Escena6";
import { Escena7 } from "./Escena7";
import { Escena8 } from "./Escena8";
import { F_CIFRA, P, clampI, interp } from "./estilo";
import guionJson from "./guion.json";

const guion = guionJson as Guion;
const CARPETA = guion.carpeta ?? "audio";

export type StalloneProps = { manifiesto: Manifiesto | null; subtitulos: boolean; volumenMusica: number };

const ESCENAS: Record<string, React.FC> = { s1: Escena1, s2: Escena2, s3: Escena3, s4: Escena4, s5: Escena5, s6: Escena6, s7: Escena7, s8: Escena8 };

export const timelineStallone = (m: Manifiesto | null) => calcularTimeline(guion, m);

export const metadatosStallone: CalculateMetadataFunction<StalloneProps> = async ({ props }) => {
  const manifiesto = await leerManifiesto(staticFile(`${CARPETA}/voz.json`));
  return { durationInFrames: timelineStallone(manifiesto).totalF, props: { ...props, manifiesto } };
};

/** Frame ABSOLUTO en que se dice una palabra. */
const cueAbs = (tl: Timeline, id: string, pal: string) => {
  const e = tl.escenas.find((x) => x.id === id)!;
  const w = e.tokens.find((t) => t.norm.startsWith(normalizar(pal)))!;
  return e.inicioF + Math.round(w.t * FPS);
};
const finVozAbs = (tl: Timeline, id: string) => {
  const e = tl.escenas.find((x) => x.id === id)!;
  return e.inicioF + Math.round(e.tokens[e.tokens.length - 1].fin * FPS);
};

/** Fundido a negro breve entre escenas (corte cinematográfico). */
const Fundidos: React.FC<{ tl: Timeline }> = ({ tl }) => {
  const f = useCurrentFrame();
  let o = 0;
  for (const e of tl.escenas.slice(1)) {
    const d = Math.abs(f - e.inicioF);
    if (d < 9) o = Math.max(o, 1 - d / 9);
  }
  return o > 0 ? <AbsoluteFill style={{ background: "#000", opacity: o, zIndex: 60 }} /> : null;
};

export const Stallone: React.FC<StalloneProps> = ({ manifiesto, subtitulos, volumenMusica }) => {
  const tl = useMemo(() => timelineStallone(manifiesto), [manifiesto]);
  const { durationInFrames } = useVideoConfig();
  const esc = (id: string) => tl.escenas.find((x) => x.id === id)!;
  const s5 = esc("s5");
  const s6 = esc("s6");
  const s8 = esc("s8");
  const puerta = Math.max(cueAbs(tl, "s5", "película") + 4, finVozAbs(tl, "s5") - 4);
  const epicaIni = cueAbs(tl, "s6", "recuperar") - 12;
  const pianoFinal = cueAbs(tl, "s8", "todo") - 10;
  const V = volumenMusica;
  const ci = clampI;

  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ background: "#000" }}>
        {tl.escenas.map((e) => {
          const Comp = ESCENAS[e.id];
          return (
            <Sequence key={e.id} from={e.inicioF} durationInFrames={e.durF} name={`${e.id} · ${e.titulo}`}>
              <Comp />
              {e.archivo ? (
                <Sequence from={e.vozF} durationInFrames={e.vozDurF + 2} name="voz" layout="none">
                  <Audio src={staticFile(e.archivo)} />
                </Sequence>
              ) : null}
            </Sequence>
          );
        })}
        <Fundidos tl={tl} />

        {/* Música: piano (1–4) → cuerdas que crecen (5–6) → metales épicos (6–7) → piano (8) */}
        <Sequence from={0} durationInFrames={s5.inicioF + 90} name="música · piano" layout="none">
          <Audio src={staticFile(`${CARPETA}/piano.mp3`)} loop volume={(f) => V * interp(f, [0, 30, s5.inicioF, s5.inicioF + 80], [0, 1, 1, 0], ci)} />
        </Sequence>
        <Sequence from={s5.inicioF} durationInFrames={epicaIni - s5.inicioF + 90} name="música · cuerdas" layout="none">
          <Audio
            src={staticFile(`${CARPETA}/cuerdas.mp3`)}
            loop
            volume={(fl) => {
              const f = fl + s5.inicioF;
              const tension = interp(f, [s5.inicioF, s5.inicioF + 60, puerta - 6, puerta], [0, 0.45, 0.45, 0], ci);
              const crece = interp(f, [puerta + 15, epicaIni, epicaIni + 60], [0, 1.1, 0], ci);
              return V * Math.max(tension, crece);
            }}
          />
        </Sequence>
        <Sequence from={epicaIni} durationInFrames={s8.inicioF + 120 - epicaIni} name="música · épica" layout="none">
          <Audio src={staticFile(`${CARPETA}/epica.mp3`)} loop volume={(fl) => V * 1.15 * interp(fl + epicaIni, [epicaIni, epicaIni + 45, s8.inicioF, s8.inicioF + 110], [0, 1, 1, 0], ci)} />
        </Sequence>
        <Sequence from={pianoFinal} name="música · piano final" layout="none">
          <Audio src={staticFile(`${CARPETA}/piano.mp3`)} loop volume={(fl) => V * 0.9 * interp(fl + pianoFinal, [pianoFinal, pianoFinal + 45, durationInFrames - 40, durationInFrames], [0, 1, 1, 0], ci)} />
        </Sequence>
        {/* zumbido del neón en la licorería */}
        <Sequence from={cueAbs(tl, "s3", "invierno")} durationInFrames={cueAbs(tl, "s3", "40") - cueAbs(tl, "s3", "invierno")} layout="none">
          <Audio src={staticFile(`${CARPETA}/zumbido.mp3`)} loop volume={0.25} />
        </Sequence>

        {subtitulos ? <Subtitulos tl={tl} fuente={F_CIFRA} fondo="rgba(13,11,10,0.72)" color={P.crema} tam={38} /> : null}
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
