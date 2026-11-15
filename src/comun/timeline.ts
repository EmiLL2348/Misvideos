/**
 * Línea de tiempo compartida por los videos narrados.
 *
 * La duración de cada escena sale del audio de narración generado con
 * edge-tts (<carpeta>/voz.json, ver scripts/generar-voz.py):
 *   escena = ENTRADA + duración del audio + SALIDA (+ salidaExtra)
 * y la última escena suma la pantalla final.
 *
 * Los visuales se sincronizan con `cue("palabra")`, que usa los tiempos
 * reales de cada palabra (WordBoundary de edge-tts). Sin audio generado se
 * estima la duración a ~150 palabras por minuto.
 */
import { createContext, useContext } from "react";

export const FPS = 30;
export const ENTRADA_SEG = 0.5;
export const SALIDA_SEG = 0.6;
export const PPM_ESTIMADO = 150;

export type EscenaGuion = {
  id: string;
  titulo: string;
  texto: string;
  textoVoz?: string;
  salidaExtra?: number; // segundos extra al final de la escena (pausas dramáticas)
};

export type Guion = {
  voz: string;
  velocidad: string;
  tono?: string;
  carpeta?: string; // dentro de public/, por defecto "audio"
  pantallaFinal?: number; // segundos
  entrada?: number; // silencio antes de la voz en cada escena (s)
  salida?: number; // silencio después de la voz en cada escena (s)
  lufs?: number; // sonoridad objetivo de la voz (scripts/generar-voz.py)
  escenas: EscenaGuion[];
};

export type PalabraVoz = { texto: string; inicio: number; fin: number };
export type VozEscena = { archivo: string; duracion: number; palabras: PalabraVoz[] };
export type Manifiesto = { voz: string; escenas: Record<string, VozEscena | undefined> };

export type Token = { texto: string; norm: string; t: number; fin: number };

export type EscenaTL = {
  id: string;
  titulo: string;
  inicioF: number;
  durF: number;
  vozF: number;
  vozDurF: number;
  archivo: string | null;
  tokens: Token[]; // segundos LOCALES desde el inicio de la escena
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

/** Alinea las palabras del guion con las que reporta edge-tts; interpola las que no coinciden. */
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

export const calcularTimeline = (guion: Guion, m: Manifiesto | null): Timeline => {
  let cursor = 0;
  let conVoz = true;
  const final = guion.pantallaFinal ?? 5;
  const entrada = guion.entrada ?? ENTRADA_SEG;
  const salida = guion.salida ?? SALIDA_SEG;
  const escenas: EscenaTL[] = guion.escenas.map((e, idx) => {
    const toks = e.texto.split(/\s+/).filter(Boolean);
    const voz = m?.escenas?.[e.id] ?? null;
    if (!voz) conVoz = false;
    const durVoz = voz ? voz.duracion : (toks.length / PPM_ESTIMADO) * 60;
    const tiempos = alinear(toks, voz ? voz.palabras : null, durVoz);
    const tokens = toks.map((texto, i) => ({
      texto,
      norm: normalizar(texto),
      t: entrada + tiempos[i].t,
      fin: entrada + tiempos[i].fin,
    }));
    const ultima = idx === guion.escenas.length - 1;
    const seg = entrada + durVoz + salida + (e.salidaExtra ?? 0) + (ultima ? final : 0);
    const durF = Math.ceil(seg * FPS);
    const tl: EscenaTL = {
      id: e.id,
      titulo: e.titulo,
      inicioF: cursor,
      durF,
      vozF: Math.round(entrada * FPS),
      vozDurF: Math.ceil(durVoz * FPS),
      archivo: voz ? voz.archivo : null,
      tokens,
    };
    cursor += durF;
    return tl;
  });
  return { escenas, totalF: cursor, conVoz };
};

/** Lee <carpeta>/voz.json desde public/ (si existe). */
export const leerManifiesto = async (url: string): Promise<Manifiesto | null> => {
  try {
    const r = await fetch(url);
    if (r.ok) return (await r.json()) as Manifiesto;
  } catch {
    // sin voz generada: se usan tiempos estimados
  }
  return null;
};

export const TimelineContext = createContext<Timeline>({ escenas: [], totalF: 1, conVoz: false });

/** Datos de la escena + `cue(palabra, n)` → frame LOCAL en que se dice esa palabra. */
export const useEscena = (id: string) => {
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
  /** frame local en que TERMINA la voz de la escena */
  const finVoz = Math.round((e.tokens[e.tokens.length - 1]?.fin ?? 0) * FPS);
  return { cue, dur: e.durF, finVoz, escena: e };
};
