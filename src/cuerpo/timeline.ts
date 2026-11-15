import guion from "./guion.json";
import {
  FPS,
  Guion,
  Manifiesto,
  calcularTimeline as calcularBase,
} from "../comun/timeline";

export { FPS, TimelineContext, useEscena, normalizar } from "../comun/timeline";
export type { Manifiesto, Timeline } from "../comun/timeline";
export type EscenaId = "s1" | "s2" | "s3" | "s4" | "s5" | "s6";
export const PANTALLA_FINAL_SEG = 5;

export const calcularTimeline = (m: Manifiesto | null) => calcularBase(guion as Guion, m);
export { FPS as FPS_CUERPO };
