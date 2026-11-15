import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [, , out, id, pasoS, escalaS] = process.argv;
const paso = Number(pasoS || 60);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const opts = { browserExecutable: "/opt/pw-browsers/chromium" };
const composition = await selectComposition({ serveUrl, id, ...opts });
let errores = 0;
for (let fr = 10; fr < composition.durationInFrames; fr += paso) {
  try {
    await renderStill({ composition, serveUrl, frame: fr, output: `${out}/${String(fr).padStart(5, "0")}.png`, scale: Number(escalaS || 0.25), ...opts });
  } catch (e) {
    errores++;
    console.log("ERROR", fr, String(e).slice(0, 300));
  }
}
console.log("listo", composition.durationInFrames, "errores", errores);
