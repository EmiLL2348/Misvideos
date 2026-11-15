#!/usr/bin/env python3
"""
Sintetiza la música ambiental electrónica y los efectos (whoosh y tic) con
numpy. Al ser generados por código, no tienen derechos de autor.

  pip install numpy && python scripts/generar-musica.py   (requiere ffmpeg)
"""
import subprocess
import wave
from pathlib import Path

import numpy as np

SR = 44100
RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "public" / "audio"
rng = np.random.default_rng(7)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def guardar(nombre, x, bitrate="128k"):
    x = np.clip(x, -1, 1)
    tmp = SALIDA / f"_{nombre}.wav"
    with wave.open(str(tmp), "wb") as w:
        w.setnchannels(2 if x.ndim == 2 else 1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp), "-b:a", bitrate, str(SALIDA / f"{nombre}.mp3")],
        check=True,
    )
    tmp.unlink()


def musica(segundos=190, bpm=96):
    n = int(segundos * SR)
    t = np.arange(n) / SR
    L = np.zeros(n)
    R = np.zeros(n)
    beat = 60 / bpm
    compas = 4 * beat
    # Am - F - C - G (2 compases cada uno)
    acordes = [[57, 60, 64], [53, 57, 60], [48, 55, 60], [55, 59, 62]]
    bajos = [45, 41, 36, 43]
    largo = 2 * compas

    # pad: aditivo con desafinación estéreo y envolvente suave
    k = 0
    while k * largo < segundos:
        a = k * largo
        i0, i1 = int(a * SR), min(n, int((a + largo + 1.5) * SR))
        tt = t[i0:i1] - a
        env = np.minimum(1, tt / 1.2) * np.clip((largo + 1.5 - tt) / 1.5, 0, 1)
        for nota in acordes[k % 4]:
            f = midi(nota)
            for h, amp in ((1, 1.0), (2, 0.35), (3, 0.18), (4, 0.08)):
                L[i0:i1] += 0.045 * amp * env * np.sin(2 * np.pi * f * h * 0.998 * tt)
                R[i0:i1] += 0.045 * amp * env * np.sin(2 * np.pi * f * h * 1.002 * tt + 0.5)
        k += 1

    # bajo, bombo, hats y arpegio desde los 8 s
    paso = beat / 2
    j = 0
    while j * paso < segundos:
        a = j * paso
        idx = int(a * SR)
        acorde = int(a // largo) % 4
        seg_tema = a > 8 and a < segundos - 10
        if seg_tema and j % 2 == 0:  # bombo suave cada tiempo
            d = int(0.3 * SR)
            tt = np.arange(min(d, n - idx)) / SR
            fr = 45 + 70 * np.exp(-tt * 30)
            kick = 0.32 * np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-tt * 9)
            L[idx : idx + len(tt)] += kick
            R[idx : idx + len(tt)] += kick
        if seg_tema and j % 2 == 1:  # hat
            d = int(0.06 * SR)
            ruido = rng.standard_normal(min(d, n - idx))
            ruido = np.diff(ruido, prepend=0) * np.exp(-np.arange(len(ruido)) / SR * 70) * 0.03
            L[idx : idx + len(ruido)] += ruido * 0.8
            R[idx : idx + len(ruido)] += ruido
        if a > 4 and j % 4 == 0:  # bajo
            d = int(beat * 1.8 * SR)
            tt = np.arange(min(d, n - idx)) / SR
            b = 0.16 * np.sin(2 * np.pi * midi(bajos[acorde]) * tt) * np.exp(-tt * 1.6) * np.minimum(1, tt * 200)
            L[idx : idx + len(tt)] += b
            R[idx : idx + len(tt)] += b
        if seg_tema:  # arpegio pluck
            notas = acordes[acorde] + [acordes[acorde][0] + 12]
            f = midi(notas[j % 4] + 12)
            d = int(0.35 * SR)
            tt = np.arange(min(d, n - idx)) / SR
            p = 0.05 * (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt * 9)
            pan = 0.5 + 0.4 * np.sin(j * 0.7)
            L[idx : idx + len(tt)] += p * (1 - pan)
            R[idx : idx + len(tt)] += p * pan
        j += 1

    # eco simple estéreo
    dly = int(beat * 0.75 * SR)
    L[dly:] += 0.25 * R[:-dly]
    R[dly:] += 0.25 * L[:-dly]
    x = np.stack([L, R], axis=1)
    fade = np.minimum(1, t / 2.0) * np.clip((segundos - t) / 4.0, 0, 1)
    x *= fade[:, None]
    return x / np.max(np.abs(x)) * 0.7


def whoosh(seg=0.55):
    n = int(seg * SR)
    t = np.arange(n) / SR
    ruido = rng.standard_normal(n)
    env = np.sin(np.pi * t / seg) ** 2
    # barrido de filtro: mezcla de ruido filtrado por suavizado variable
    corte = 0.02 + 0.25 * np.sin(np.pi * t / seg) ** 3
    y = np.zeros(n)
    acc = 0.0
    for i in range(n):
        acc += corte[i] * (ruido[i] - acc)
        y[i] = acc
    y = y * env
    return y / np.max(np.abs(y)) * 0.6


def tic():
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    y = np.sin(2 * np.pi * 2200 * t) * np.exp(-t * 120) + 0.3 * rng.standard_normal(n) * np.exp(-t * 400)
    return y / np.max(np.abs(y)) * 0.5


if __name__ == "__main__":
    SALIDA.mkdir(parents=True, exist_ok=True)
    guardar("musica", musica(), "128k")
    guardar("whoosh", whoosh(), "96k")
    guardar("tic", tic(), "96k")
    print("listo:", sorted(p.name for p in SALIDA.glob("*.mp3")))
