# Misvideos

Videos generados con [Remotion](https://www.remotion.dev/).

## Video: "¿Por qué se volvió tendencia entre jóvenes farmear aura?"

- Composición: `AuraVideo` (1080x1920, 30 fps, 15 s) en `src/AuraVideo.tsx`

## Comandos

```bash
npm install
npm run dev      # abre Remotion Studio para previsualizar
npm run render   # genera out/video.mp4
```

## GitHub Actions

`.github/workflows/render.yml` renderiza el video en cada push (o manualmente desde
la pestaña **Actions → Render video → Run workflow**) y sube `out/video.mp4`
como artifact descargable llamado `video`.
