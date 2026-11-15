import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Audio,
  CalculateMetadataFunction,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Escena1 } from "./Escena1";
import { Escena2 } from "./Escena2";
import { Escena3 } from "./Escena3";
import { Escena4 } from "./Escena4";
import { Escena5 } from "./Escena5";
import { Escena6 } from "./Escena6";
import { C, FUENTE_TEXTO } from "./tema";
import { Subtitulos } from "../comun/Subtitulos";
import { leerManifiesto } from "../comun/timeline";
import { Manifiesto, TimelineContext, calcularTimeline } from "./timeline";

export type CuerpoProps = {
  manifiesto: Manifiesto | null;
  subtitulos: boolean;
  volumenMusica: number;
};

const COMPONENTES: Record<string, React.FC> = {
  s1: Escena1,
  s2: Escena2,
  s3: Escena3,
  s4: Escena4,
  s5: Escena5,
  s6: Escena6,
};

const BARRIDO = 12; // 0.4 s

/** Lee public/audio/voz.json (si existe) y fija la duración total del video. */
export const calcularMetadatosCuerpo: CalculateMetadataFunction<CuerpoProps> = async ({ props }) => {
  const manifiesto = await leerManifiesto(staticFile("audio/voz.json"));
  const tl = calcularTimeline(manifiesto);
  return { durationInFrames: tl.totalF, props: { ...props, manifiesto } };
};

const Barrido: React.FC = () => {
  const f = useCurrentFrame();
  const S = 700; // inclinación
  const W = 1920 + S;
  const x0 = interpolate(f, [0, BARRIDO], [-W, 1920 + S]);
  const banda = (dx: number, color: string) => (
    <polygon
      points={`${x0 + dx},0 ${x0 + dx + W},0 ${x0 + dx + W - S},1080 ${x0 + dx - S},1080`}
      fill={color}
    />
  );
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {banda(0, C.cian)}
      {banda(-140, C.noche)}
    </svg>
  );
};

export const CuerpoExtremo: React.FC<CuerpoProps> = ({ manifiesto, subtitulos, volumenMusica }) => {
  const tl = useMemo(() => calcularTimeline(manifiesto), [manifiesto]);
  const { durationInFrames } = useVideoConfig();
  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ background: C.noche }}>
        {tl.escenas.map((e) => {
          const Comp = COMPONENTES[e.id];
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
        {tl.escenas.slice(1).map((e) => (
          <Sequence key={`b-${e.id}`} from={e.inicioF - BARRIDO / 2} durationInFrames={BARRIDO} name="barrido">
            <Barrido />
          </Sequence>
        ))}
        {tl.escenas.slice(1).map((e) => (
          <Sequence key={`w-${e.id}`} from={e.inicioF - 9} durationInFrames={20} name="whoosh" layout="none">
            <Audio src={staticFile("audio/whoosh.mp3")} volume={0.5} />
          </Sequence>
        ))}
        <Audio
          src={staticFile("audio/musica.mp3")}
          loop
          volume={(f) =>
            volumenMusica *
            interpolate(f, [0, 30, durationInFrames - 75, durationInFrames - 1], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
        {subtitulos ? <Subtitulos tl={tl} fuente={FUENTE_TEXTO} /> : null}
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
