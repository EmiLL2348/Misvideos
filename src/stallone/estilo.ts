import { loadFont as cargarFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as cargarInter } from "@remotion/google-fonts/Inter";
import { loadFont as cargarCaveat } from "@remotion/google-fonts/Caveat";

export const F_TITULO = cargarFraunces("normal", { weights: ["700", "900"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const F_CIFRA = cargarInter("normal", { weights: ["600", "700", "800"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const F_MANO = cargarCaveat("normal", { weights: ["700"], subsets: ["latin"] }).fontFamily;

export const P = {
  ocre: "#C8873A",
  marron: "#5A3825",
  crema: "#F2E3C6",
  ladrillo: "#A8402E",
  noche: "#1C2A44",
  neon: "#FF4F8B",
  dorado: "#E8B64A",
  negro: "#0D0B0A",
  tinta: "#24160F",
  piel: "#D9A27A",
  pielSombra: "#B9805B",
  pelo: "#3A271C",
  cuero: "#6B3F22",
  cueroLuz: "#8A5530",
  vaquero: "#3A4F7A",
  billete: "#7E9A6A",
};

/** 350000 → "350.000" (formato de España, siempre con punto). */
export const miles = (n: number) =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export { prog, ventana, rebote, lerp, clampI, suave, interp } from "../comun/anim";
