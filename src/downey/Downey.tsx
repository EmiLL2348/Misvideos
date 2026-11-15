import React, { useMemo } from "react";
import { AbsoluteFill, Audio, CalculateMetadataFunction, Sequence, staticFile, useCurrentFrame } from "remotion";
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
import { Escena9 } from "./Escena9";
import { Escena10 } from "./Escena10";
import { D, F_TEXTO, interp } from "./estilo";
import guionJson from "./guion.json";
import { Pista, PistaContext } from "./ui";

const guion = guionJson as Guion;
const CARPETA = guion.carpeta ?? "audio";

export type DowneyProps = { manifiesto: Manifiesto | null; subtitulos: boolean; pista: Pista };

const ESCENAS: Record<string, React.FC> = { s1: Escena1, s2: Escena2, s3: Escena3, s4: Escena4, s5: Escena5, s6: Escena6, s7: Escena7, s8: Escena8, s9: Escena9, s10: Escena10 };

export const timelineDowney = (m: Manifiesto | null) => calcularTimeline(guion, m);

export const metadatosDowney: CalculateMetadataFunction<DowneyProps> = async ({ props }) => {
  const manifiesto = await leerManifiesto(staticFile(`${CARPETA}/voz.json`));
  return { durationInFrames: timelineDowney(manifiesto).totalF, props: { ...props, manifiesto } };
};

const cueAbs = (tl: Timeline, id: string, pal: string) => {
  const e = tl.escenas.find((x) => x.id === id)!;
  const w = e.tokens.find((t) => t.norm.startsWith(normalizar(pal)))!;
  return e.inicioF + Math.round(w.t * FPS);
};

/** Ganancias de la música (normalizada a −16 LUFS): sin voz 0 dB; bajo la voz −12 dB (≈ −28 LUFS). */
const SIN_VOZ = 1;
const BAJO_VOZ = 0.25;

const Fundidos: React.FC<{ tl: Timeline }> = ({ tl }) => {
  const f = useCurrentFrame();
  let o = 0;
  for (const e of tl.escenas.slice(1)) {
    const d = Math.abs(f - e.inicioF);
    if (d < 7) o = Math.max(o, 1 - d / 7);
  }
  return o > 0 ? <AbsoluteFill style={{ background: "#000", opacity: o * 0.85, zIndex: 60 }} /> : null;
};

export const Downey: React.FC<DowneyProps> = ({ manifiesto, subtitulos, pista }) => {
  const tl = useMemo(() => timelineDowney(manifiesto), [manifiesto]);
  const ini = (id: string) => tl.escenas.find((x) => x.id === id)!.inicioF;
  const fin = (id: string) => {
    const e = tl.escenas.find((x) => x.id === id)!;
    return e.inicioF + e.durF;
  };
  const total = tl.totalF;
  const conVoz = pista === "mezcla" || pista === "voz";
  const conMusica = pista === "mezcla" || pista === "musica";
  const X = 15; // medio fundido cruzado (1 s en total) centrado en el corte

  // tramos con narración para la bajada automática
  const tramos = tl.escenas.map((e) => [e.inicioF + e.vozF - 6, e.inicioF + e.vozF + e.vozDurF + 4]);
  const ducking = (f: number) => {
    let g = SIN_VOZ;
    for (const [a, b] of tramos) {
      if (f >= a - 8 && f <= b + 8) {
        const p = Math.min(interp(f, [a - 8, a], [0, 1]), interp(f, [b, b + 8], [1, 0]));
        g = Math.min(g, SIN_VOZ + (BAJO_VOZ - SIN_VOZ) * p);
      }
    }
    return g;
  };

  const julio = cueAbs(tl, "s7", "julio");
  const s7 = ini("s7");
  const bloques: { archivo: string; desde: number; hasta: number; extra?: (f: number) => number }[] = [
    { archivo: "misterio", desde: 0, hasta: ini("s4") },
    { archivo: "tension", desde: ini("s4"), hasta: s7 },
    {
      archivo: "esperanza",
      desde: s7 + 30, // 1 s de silencio al empezar la escena 7
      hasta: ini("s8"),
      // silencio de 1 s justo antes del amanecer en la playa y luego el piano crece
      extra: (f) => Math.min(interp(f, [julio - 40, julio - 30], [1, 0]) + interp(f, [julio, julio + 45], [0, 1]), 1) * interp(f, [s7 + 30, s7 + 60], [0.5, 1]),
    },
    { archivo: "epica", desde: ini("s8"), hasta: ini("s10"), extra: (f) => interp(f, [ini("s8"), ini("s9")], [0.75, 1.15]) },
    { archivo: "oscuro", desde: ini("s10"), hasta: total },
  ];

  return (
    <PistaContext.Provider value={pista}>
      <TimelineContext.Provider value={tl}>
        <AbsoluteFill style={{ background: "#000" }}>
          {tl.escenas.map((e) => {
            const Comp = ESCENAS[e.id];
            return (
              <Sequence key={e.id} from={e.inicioF} durationInFrames={e.durF} name={`${e.id} · ${e.titulo}`}>
                <Comp />
                {e.archivo && conVoz ? (
                  <Sequence from={e.vozF} durationInFrames={e.vozDurF + 2} name="voz" layout="none">
                    <Audio src={staticFile(e.archivo)} />
                  </Sequence>
                ) : null}
              </Sequence>
            );
          })}
          <Fundidos tl={tl} />
          {conMusica
            ? bloques.map((b) => {
                const desde = Math.max(0, b.desde - X);
                const hasta = Math.min(total, b.hasta + X);
                return (
                  <Sequence key={b.archivo} from={desde} durationInFrames={Math.max(1, hasta - desde)} name={`música · ${b.archivo}`} layout="none">
                    <Audio
                      src={staticFile(`${CARPETA}/${b.archivo}.mp3`)}
                      loop
                      volume={(fl) => {
                        const f = fl + desde;
                        const env = Math.min(
                          b.desde === 0 ? interp(f, [0, 20], [0, 1]) : interp(f, [b.desde - X, b.desde + X], [0, 1]),
                          b.hasta >= total ? interp(f, [total - 60, total], [1, 0]) : interp(f, [b.hasta - X, b.hasta + X], [1, 0])
                        );
                        return Math.min(1, env * ducking(f) * (b.extra ? b.extra(f) : 1));
                      }}
                    />
                  </Sequence>
                );
              })
            : null}
          {subtitulos ? <Subtitulos tl={tl} fuente={F_TEXTO} fondo="rgba(10,14,20,0.72)" color={D.blanco} tam={44} /> : null}
        </AbsoluteFill>
      </TimelineContext.Provider>
    </PistaContext.Provider>
  );
};
