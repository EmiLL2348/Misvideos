import { Easing, interpolate, spring } from "remotion";

const eo = Easing.out(Easing.cubic);
export const clampI = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 con ease-out empezando en `desde`. */
export const prog = (f: number, desde: number, dur = 15) =>
  interpolate(f, [desde, desde + dur], [0, 1], { ...clampI, easing: eo });

/** Entra en `desde`, sale en `hasta`. */
export const ventana = (f: number, desde: number, hasta: number, dur = 12) =>
  Math.min(
    prog(f, desde, dur),
    1 - interpolate(f, [hasta - dur, hasta], [0, 1], { ...clampI, easing: Easing.in(Easing.cubic) })
  );

export const rebote = (f: number, desde: number, fps = 30, damping = 12) =>
  spring({ frame: f - desde, fps, config: { damping, stiffness: 140 } });

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Suavizado in-out entre a y b. */
export const suave = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], { ...clampI, easing: Easing.inOut(Easing.cubic) });

/** interpolate() que nunca falla: fuerza que el rango de entrada sea creciente. */
export const interp = (
  f: number,
  entrada: number[],
  salida: number[],
  opciones: Parameters<typeof interpolate>[3] = clampI
) => {
  const e = [...entrada];
  for (let i = 1; i < e.length; i++) if (!(e[i] > e[i - 1])) e[i] = e[i - 1] + 1;
  return interpolate(f, e, salida, opciones);
};
