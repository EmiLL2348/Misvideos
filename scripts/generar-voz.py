#!/usr/bin/env python3
"""
Genera la narración de un video con edge-tts.

Lee un guion JSON (por defecto src/cuerpo/guion.json) y crea, por cada escena:
  public/<carpeta>/voz-<id>.mp3
y un manifiesto public/<carpeta>/voz.json con la duración exacta de cada audio
y el tiempo de cada palabra (WordBoundary). Remotion usa ese manifiesto para
ajustar la duración de cada escena y sincronizar las animaciones.

En el guion: "voz", "velocidad" (p. ej. "-4%"), "tono" (p. ej. "-6Hz") y
"carpeta" (p. ej. "audio/stallone"; por defecto "audio").

Uso:
  pip install edge-tts mutagen
  python scripts/generar-voz.py                              # ¿Cuánto aguanta tu cuerpo?
  python scripts/generar-voz.py src/stallone/guion.json      # 106 dólares y un sueño
  VOZ=es-MX-DaliaNeural python scripts/generar-voz.py        # cambiar la voz
"""
import asyncio
import json
import os
import sys
from pathlib import Path

import edge_tts
from mutagen.mp3 import MP3

RAIZ = Path(__file__).resolve().parent.parent
GUION_POR_DEFECTO = RAIZ / "src" / "cuerpo" / "guion.json"
TICKS_POR_SEG = 10_000_000  # edge-tts reporta offsets en unidades de 100 ns


async def sintetizar(texto: str, voz: str, velocidad: str, tono: str, destino: Path):
    palabras = []
    com = edge_tts.Communicate(
        texto,
        voz,
        rate=velocidad,
        pitch=tono,
        boundary="WordBoundary",
        proxy=os.environ.get("EDGE_TTS_PROXY") or None,
    )
    with open(destino, "wb") as f:
        async for chunk in com.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                inicio = chunk["offset"] / TICKS_POR_SEG
                palabras.append(
                    {
                        "texto": chunk["text"],
                        "inicio": round(inicio, 3),
                        "fin": round(inicio + chunk["duration"] / TICKS_POR_SEG, 3),
                    }
                )
    if destino.stat().st_size == 0:
        raise RuntimeError("edge-tts no devolvió audio")
    return palabras


async def con_reintentos(*args, intentos=4):
    for i in range(1, intentos + 1):
        try:
            return await sintetizar(*args)
        except Exception as e:  # red inestable, 403 temporales, etc.
            if i == intentos:
                raise
            espera = 2**i
            print(f"  intento {i} falló ({e}); reintento en {espera}s", file=sys.stderr)
            await asyncio.sleep(espera)


async def generar(ruta_guion: Path):
    guion = json.loads(ruta_guion.read_text(encoding="utf-8"))
    voz = os.environ.get("VOZ") or guion.get("voz", "es-MX-JorgeNeural")
    velocidad = os.environ.get("VOZ_VELOCIDAD") or guion.get("velocidad", "+0%")
    tono = os.environ.get("VOZ_TONO") or guion.get("tono", "+0Hz")
    carpeta = guion.get("carpeta", "audio").strip("/")
    salida = RAIZ / "public" / carpeta
    salida.mkdir(parents=True, exist_ok=True)
    print(f"== {ruta_guion.relative_to(RAIZ)} · {voz} ({velocidad}, {tono})")

    manifiesto = {"voz": voz, "velocidad": velocidad, "tono": tono, "escenas": {}}
    total = 0.0
    for e in guion["escenas"]:
        destino = salida / f"voz-{e['id']}.mp3"
        texto = e.get("textoVoz") or e["texto"]
        print(f"[{e['id']}] {e['titulo']} → {destino.relative_to(RAIZ)}")
        palabras = await con_reintentos(texto, voz, velocidad, tono, destino)
        duracion = round(MP3(destino).info.length, 3)
        total += duracion
        print(f"  {duracion:.2f} s, {len(palabras)} palabras con tiempo")
        manifiesto["escenas"][e["id"]] = {
            "archivo": f"{carpeta}/{destino.name}",
            "duracion": duracion,
            "palabras": palabras,
        }

    (salida / "voz.json").write_text(
        json.dumps(manifiesto, ensure_ascii=False, indent=1), encoding="utf-8"
    )
    print(f"Narración total: {total:.1f} s con la voz {voz}")


async def main():
    rutas = [Path(a).resolve() for a in sys.argv[1:]] or [GUION_POR_DEFECTO]
    for ruta in rutas:
        await generar(ruta)


if __name__ == "__main__":
    asyncio.run(main())
