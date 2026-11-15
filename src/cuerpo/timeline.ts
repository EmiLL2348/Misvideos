/**
 * Línea de tiempo del video "¿Cuánto aguanta tu cuerpo?".
 *
 * La duración de cada escena sale del audio de narración generado con
 * edge-tts (public/audio/voz.json, ver scripts/generar-voz.py):
 *   escena = ENTRADA + duración del audio + SALIDA
 * y la última escena suma la pantalla final de 5 s.
 *
 * Los visuales se sincronizan con `cue("palabra")`, que usa los tiempos
 * reales de cada palabra que devuelve edge-tts (WordBoundary). Si no hay
 * audio generado (por ejemplo en Remotion Studio sin correr el script),
 * se estima la duración a ~150 palabras por minuto.
 */
import { createContext, useContext } from "react";
import guion from "./guion.json";

export const FPS = 30;
export const ENTRADA_SEG = 0.5; // silencio antes de la voz (deja pasar el barrido)
export const SALIDA_SEG = 0.6; // respiro después de la voz
export const PANTALLA_FINAL_SEG = 5;
export const PPM_ESTIMADO = 150;

export type EscenaId = "s1" | "s2" | "s3" | "s4" | "s5" | "s6";

export type PalabraVoz = { texto: string; inicio: number; fin: number };
export type VozEscena = { archivo: string; duracion: number; palabras: PalabraVoz[] };
export type Manifiesto = { voz: string; escenas: Partial<Record<EscenaId, VozEscena>> };

export type Token = { texto: string; norm: string; t: number; fin: number };

export type EscenaTL = {
  id: EscenaId;
  titulo: string;
  inicioF: number; // frame absoluto donde empieza la escena
  durF: number; // duración en frames
  vozF: number; // frame LOCAL donde arranca la voz
  vozDurF: number;
  archivo: string | null;
  tokens: Token[]; // tiempos LOCALES en segundos desde el inicio de la escena
};

export type Timeline = { escenas: EscenaTL[]; totalF: number; conVoz: boolean };

export const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9-]/g, "");

const peso = (w: string) => {
  let p = normalizar(w).length + 2;
  if (/[.?!…:]["»”]?$/.test(w)) p += 9;
  else if (/[,;]["»”]?$/.test(w)) p += 4;
  return p;
};

/** Reparte tokens en [a, b] según su peso. */
const repartir = (toks: string[], a: number, b: number) => {
  const ps = toks.map(peso);
  const total = ps.reduce((x, y) => x + y, 0) || 1;
  let acc = 0;
  return toks.map((_, i) => {
    const t = a + (acc / total) * (b - a);
    acc += ps[i];
    return { t, fin: a + (acc / total) * (b - a) };
  });
};

const coincide = (a: string, b: string) =>
  a === b || (a.length >= 3 && b.length >= 3 && (a.startsWith(b) || b.startsWith(a)));

/**
 * Alinea las palabras del guion (con puntuación) con las palabras que
 * reporta edge-tts. Las que no coinciden (p. ej. "1-10-1" leído como
 * "uno, diez, uno") se interpolan entre sus vecinas.
 */
export const alinear = (toks: string[], voz: PalabraVoz[] | null, dur: number) => {
  if (!voz || voz.length === 0) return repartir(toks, 0, dur);
  const res: ({ t: number; fin: number } | null)[] = toks.map(() => null);
  let j = 0;
  toks.forEach((tok, i) => {
    const n = normalizar(tok);
    if (!n) return;
    for (let k = j; k < Math.min(j + 6, voz.length); k++) {
      if (coincide(n, normalizar(voz[k].texto))) {
        res[i] = { t: voz[k].inicio, fin: voz[k].fin };
        j = k + 1;
        return;
      }
    }
  });
  // rellenar huecos
  let i = 0;
  while (i < toks.length) {
    if (res[i]) {
      i++;
      continue;
    }
    let k = i;
    while (k < toks.length && !res[k]) k++;
    const a = i > 0 ? res[i - 1]!.fin : 0;
    const b = k < toks.length ? res[k]!.t : dur;
    repartir(toks.slice(i, k), a, Math.max(a, b)).forEach((x, m) => (res[i + m] = x));
    i = k;
  }
  return res as { t: number; fin: number }[];
};

export const calcularTimeline = (m: Manifiesto | null): Timeline => {
  let cursor = 0;
  let conVoz = true;
  const escenas: EscenaTL[] = guion.escenas.map((e, idx) => {
    const id = e.id as EscenaId;
    const toks = e.texto.split(/\s+/).filter(Boolean);
    const voz = m?.escenas?.[id] ?? null;
    if (!voz) conVoz = false;
    const durVoz = voz ? voz.duracion : (toks.length / PPM_ESTIMADO) * 60;
    const tiempos = alinear(toks, voz ? voz.palabras : null, durVoz);
    const tokens = toks.map((texto, i) => ({
      texto,
      norm: normalizar(texto),
      t: ENTRADA_SEG + tiempos[i].t,
      fin: ENTRADA_SEG + tiempos[i].fin,
    }));
    const ultima = idx === guion.escenas.length - 1;
    const seg = ENTRADA_SEG + durVoz + SALIDA_SEG + (ultima ? PANTALLA_FINAL_SEG : 0);
    const durF = Math.ceil(seg * FPS);
    const tl: EscenaTL = {
      id,
      titulo: e.titulo,
      inicioF: cursor,
      durF,
      vozF: Math.round(ENTRADA_SEG * FPS),
      vozDurF: Math.ceil(durVoz * FPS),
      archivo: voz ? voz.archivo : null,
      tokens,
    };
    cursor += durF;
    return tl;
  });
  return { escenas, totalF: cursor, conVoz };
};

export const TimelineContext = createContext<Timeline>(calcularTimeline(null));

/** Datos de la escena actual + `cue(palabra, n)` → frame LOCAL de esa palabra. */
export const useEscena = (id: EscenaId) => {
  const tl = useContext(TimelineContext);
  const e = tl.escenas.find((x) => x.id === id)!;
  const cue = (pal: string, n = 1) => {
    const key = normalizar(pal);
    let k = 0;
    for (const w of e.tokens) {
      if (w.norm.startsWith(key) && ++k === n) return Math.round(w.t * FPS);
    }
    throw new Error(`cue no encontrado en ${id}: "${pal}" #${n}`);
  };
  return { cue, dur: e.durF, escena: e };
};
