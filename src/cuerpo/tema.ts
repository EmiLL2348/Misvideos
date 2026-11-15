import { Easing, interpolate, spring } from "remotion";
import { loadFont as cargarMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as cargarInter } from "@remotion/google-fonts/Inter";

export const FUENTE_TITULO = cargarMontserrat("normal", {
  weights: ["800", "900"],
  subsets: ["latin", "latin-ext"],
}).fontFamily;

export const FUENTE_TEXTO = cargarInter("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin", "latin-ext", "greek"],
}).fontFamily;

export const C = {
  noche: "#0F1B2D",
  nocheClaro: "#18293F",
  nocheBorde: "#263B57",
  cian: "#2EC4E6",
  coral: "#FF5A5F",
  rojo: "#E5383B",
  ambar: "#FFB627",
  blanco: "#F4F6F8",
  gris: "#8A99AD",
  verde: "#3DDC97",
  piel: "#E8B48E",
  pielSombra: "#D29B74",
  pelo: "#2A2D3E",
  tinta: "#1B2433",
  frio: "#7FB2E5",
};

const eo = Easing.out(Easing.cubic);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 con ease-out empezando en `desde`. */
export const prog = (f: number, desde: number, dur = 15) =>
  interpolate(f, [desde, desde + dur], [0, 1], { ...clamp, easing: eo });

/** Entra en `desde`, sale en `hasta` (ambos con ease). */
export const ventana = (f: number, desde: number, hasta: number, dur = 12) =>
  Math.min(
    prog(f, desde, dur),
    1 - interpolate(f, [hasta - dur, hasta], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) })
  );

export const rebote = (f: number, desde: number, fps = 30, damping = 12) =>
  spring({ frame: f - desde, fps, config: { damping, stiffness: 140 } });

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export const numero = (n: number) => Math.round(n).toLocaleString("es-MX");

export const clampI = clamp;
