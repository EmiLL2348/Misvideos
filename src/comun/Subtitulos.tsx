import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { FPS, Timeline } from "./timeline";

/** Subtítulos por frase; cada palabra se ilumina al decirse. */
export const Subtitulos: React.FC<{ tl: Timeline; fuente: string; fondo?: string; color?: string; tam?: number }> = ({
  tl,
  fuente,
  fondo = "rgba(10,18,30,0.78)",
  color = "#F4F6F8",
  tam = 40,
}) => {
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
          background: fondo,
          fontFamily: fuente,
          fontWeight: 600,
          fontSize: tam,
          color,
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        {fr.palabras.map((w, i) => (
          <span key={i} style={{ opacity: f >= w.t ? 1 : 0.55 }}>
            {w.texto}{" "}
          </span>
        ))}
      </div>
    </div>
  );
};
