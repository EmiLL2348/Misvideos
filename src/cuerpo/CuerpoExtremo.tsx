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
import { EscenaId, FPS, Manifiesto, Timeline, TimelineContext, calcularTimeline } from "./timeline";

export type CuerpoProps = {
  manifiesto: Manifiesto | null;
  subtitulos: boolean;
  volumenMusica: number;
};

const COMPONENTES: Record<EscenaId, React.FC> = {
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
  let manifiesto: Manifiesto | null = null;
  try {
    const r = await fetch(staticFile("audio/voz.json"));
    if (r.ok) manifiesto = (await r.json()) as Manifiesto;
  } catch {
    manifiesto = null;
  }
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

const Subtitulos: React.FC<{ tl: Timeline }> = ({ tl }) => {
  const f = useCurrentFrame();
  const frases = useMemo(() => {
    const out: { palabras: { texto: string; t: number }[]; ini: number; fin: number }[] = [];
    for (const e of tl.escenas) {
      let actual: { texto: string; t: number; fin: number }[] = [];
      const cerrar = () => {
        if (!actual.length) return;
        out.push({
          palabras: actual.map((w) => ({ texto: w.texto, t: e.inicioF + w.t * FPS })),
          ini: e.inicioF + actual[0].t * FPS,
          fin: e.inicioF + actual[actual.length - 1].fin * FPS + 6,
        });
        actual = [];
      };
      for (const w of e.tokens) {
        actual.push(w);
        if (/[.?!…:;]["»”]?$/.test(w.texto) || (/,$/.test(w.texto) && actual.length >= 4) || actual.length >= 9) cerrar();
      }
      cerrar();
    }
    for (let i = 0; i < out.length - 1; i++) if (out[i + 1].ini - out[i].fin < 12) out[i].fin = out[i + 1].ini;
    return out;
  }, [tl]);
  const fr = frases.find((x) => f >= x.ini && f < x.fin);
  if (!fr) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 36, display: "flex", justifyContent: "center", zIndex: 50 }}>
      <div
        style={{
          maxWidth: 1500,
          padding: "10px 26px",
          borderRadius: 16,
          background: "rgba(10,18,30,0.78)",
          fontFamily: FUENTE_TEXTO,
          fontWeight: 600,
          fontSize: 40,
          color: C.blanco,
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        {fr.palabras.map((w, i) => (
          <span key={i} style={{ color: f >= w.t ? C.blanco : "rgba(244,246,248,0.55)" }}>
            {w.texto}{" "}
          </span>
        ))}
      </div>
    </div>
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
        {subtitulos ? <Subtitulos tl={tl} /> : null}
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
