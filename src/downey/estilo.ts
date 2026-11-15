import { loadFont as cargarOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as cargarPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as cargarInter } from "@remotion/google-fonts/Inter";

export const F_CIFRA = cargarOswald("normal", { weights: ["500", "700"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const F_CITA = cargarPlayfair("italic", { weights: ["700"], subsets: ["latin", "latin-ext"] }).fontFamily;
export const F_TEXTO = cargarInter("normal", { weights: ["600", "700"], subsets: ["latin", "latin-ext"] }).fontFamily;

/** Paleta del guion. */
export const D = {
  // caída
  azul: "#1E2A3A",
  gris: "#4A5361",
  sodio: "#E08A3C",
  sirena: "#D33A3A",
  sirenaAzul: "#3A6BD3",
  // remontada
  amanecer: "#F2B45A",
  cielo: "#7FB6E0",
  blanco: "#FFF4E2",
  // giro final
  verde: "#0F1F17",
  acero: "#9AA4AD",
  negro: "#0B0D10",
  // personajes
  piel: "#D8A07C",
  pielSombra: "#B47E5E",
  pelo: "#2A1E18",
  tinta: "#1A1412",
  dorado: "#E8B64A",
};

export { prog, ventana, rebote, lerp, clampI, suave, interp } from "../comun/anim";
export { miles } from "../stallone/estilo";
