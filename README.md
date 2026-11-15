# Misvideos

Videos generados con [Remotion](https://www.remotion.dev/).

| Composición | Formato | Archivo |
|---|---|---|
| `AuraVideo` | 1080×1920 · 30 fps · 15 s | `src/AuraVideo.tsx` |
| `CuerpoExtremo` | 1920×1080 · 30 fps · ~2:30 (según la narración) | `src/cuerpo/` |

## ¿Cuánto aguanta tu cuerpo? (`CuerpoExtremo`)

- Guion completo: [`guion-cuerpo-extremo.md`](guion-cuerpo-extremo.md)
- Texto narrado por escena: `src/cuerpo/guion.json` (fuente única para la voz y los subtítulos)
- Personaje reutilizable "el humano": `src/cuerpo/Humano.tsx` (expresiones `normal`, `sorprendido`, `cansado`, `frio`, `feliz`)
- Escenas: `src/cuerpo/Escena1.tsx` … `Escena6.tsx`

### Narración con edge-tts

`scripts/generar-voz.py` usa [edge-tts](https://github.com/rany2/edge-tts) (gratis) con la voz
**es-MX-JorgeNeural** y genera en `public/audio/`:

- `voz-s1.mp3` … `voz-s6.mp3`: un audio por escena
- `voz.json`: la duración exacta de cada audio y el tiempo de cada palabra

Remotion lee `voz.json` (`calculateMetadata`) y:

1. ajusta la duración de cada escena al largo de su audio (0.5 s de entrada + audio + 0.6 s de salida; la última suma 5 s de pantalla final),
2. reproduce cada audio con `<Audio />` dentro de su escena,
3. sincroniza las animaciones con las palabras ("al decir *límites*…") y los subtítulos.

Para cambiar la voz o la velocidad, edita `voz`/`velocidad` en `src/cuerpo/guion.json`
(por ejemplo `es-MX-DaliaNeural`, `+8%`) o usa las variables `VOZ` y `VOZ_VELOCIDAD`.

La música ambiental y los efectos (`whoosh`, `tic`) se sintetizan con
`scripts/generar-musica.py`, así que no tienen derechos de autor.

## Comandos

```bash
npm install
pip install edge-tts mutagen
npm run voz            # genera la narración (requiere internet)
npm run dev            # Remotion Studio
npm run render         # out/video.mp4 (AuraVideo)
npm run render:cuerpo  # out/cuerpo-extremo.mp4
```

Sin `voz.json`, el video se puede previsualizar igual: los tiempos se estiman a ~150 palabras por minuto.

## GitHub Actions

`.github/workflows/render.yml` corre en cada push (o manualmente desde
**Actions → Render video → Run workflow**), renderiza ambas composiciones en paralelo y
sube los artifacts `video` (AuraVideo) y `cuerpo-extremo` (con la narración incluida).
