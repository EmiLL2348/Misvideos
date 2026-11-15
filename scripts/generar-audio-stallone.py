#!/usr/bin/env python3
"""
Banda sonora original y efectos de "106 dólares y un sueño", sintetizados con
numpy (sin derechos de autor y sin usar el tema de la película):

  piano.mp3   piano melancólico en La menor (bucle)        escenas 1–4
  cuerdas.mp3 cuerdas sostenidas que crecen (bucle)          escenas 5–6
  epica.mp3   metales, timbales y cuerdas en Do mayor (bucle) escenas 6–7
  lluvia, portazo, zumbido (neón), clic (cámara), multitud
  y texturas de grano de película (public/stallone/grano-*.png)

  pip install numpy pillow && python scripts/generar-audio-stallone.py   (requiere ffmpeg)
"""
import subprocess
import wave
from pathlib import Path

import numpy as np
from PIL import Image

SR = 44100
RAIZ = Path(__file__).resolve().parent.parent
AUDIO = RAIZ / "public" / "audio" / "stallone"
IMG = RAIZ / "public" / "stallone"
rng = np.random.default_rng(1975)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def guardar(nombre, x, bitrate="160k"):
    x = np.clip(x, -1, 1)
    tmp = AUDIO / f"_{nombre}.wav"
    with wave.open(str(tmp), "wb") as w:
        w.setnchannels(2 if x.ndim == 2 else 1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp), "-b:a", bitrate, str(AUDIO / f"{nombre}.mp3")], check=True)
    tmp.unlink()


def filtro(x, bajo=None, alto=None):
    """Filtro pasa banda por FFT (suave)."""
    X = np.fft.rfft(x, axis=0)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.ones_like(f)
    if alto:
        g *= 1 / (1 + (f / alto) ** 4)
    if bajo:
        g *= 1 / (1 + (bajo / np.maximum(f, 1)) ** 4)
    if X.ndim == 2:
        g = g[:, None]
    return np.fft.irfft(X * g, n=len(x), axis=0)


def reverb(x, seg=2.4, mezcla=0.3):
    n = int(seg * SR)
    t = np.arange(n) / SR
    ir = rng.standard_normal((n, 2)) * np.exp(-t * 3.2)[:, None]
    ir[0] = 0
    out = np.zeros((len(x) + n, 2))
    L = len(x) + n
    nfft = 1 << (L - 1).bit_length()
    for c in range(2):
        out[:, c] = np.fft.irfft(np.fft.rfft(x[:, c], nfft) * np.fft.rfft(ir[:, c], nfft), nfft)[:L]
    out /= np.max(np.abs(out)) + 1e-9
    seco = np.zeros_like(out)
    seco[: len(x)] = x / (np.max(np.abs(x)) + 1e-9)
    return seco * (1 - mezcla) + out * mezcla


def plegar(x, largo):
    """Hace un bucle perfecto sumando la cola al principio."""
    y = x[:largo].copy()
    cola = x[largo:]
    while len(cola):
        k = min(len(cola), largo)
        y[:k] += cola[:k]
        cola = cola[k:]
    return y


def nota_piano(f, dur, vel=1.0):
    n = int((dur + 2.5) * SR)
    t = np.arange(n) / SR
    y = np.zeros(n)
    B = 0.0004
    for k in range(1, 9):
        fk = k * f * np.sqrt(1 + B * k * k)
        if fk > 9000:
            break
        y += (1 / k**1.3) * np.sin(2 * np.pi * fk * t) * np.exp(-t * (0.9 + k * 0.7))
    y *= np.minimum(1, t / 0.004)
    # apagado al soltar la tecla
    y *= np.where(t < dur, 1, np.exp(-(t - dur) * 6))
    return y * vel


def piano():
    bpm = 66
    beat = 60 / bpm
    acordes = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [55, 60, 64]), (52, [56, 59, 64])]  # Am F C E
    compas = 4 * beat
    ciclo = len(acordes) * 2 * compas
    largo = int(2 * ciclo * SR)
    x = np.zeros((largo + int(6 * SR), 2))

    def poner(f, t0, dur, vel, pan=0.5):
        y = nota_piano(f, dur, vel)
        i = int(t0 * SR)
        x[i : i + len(y), 0] += y * (1 - pan)
        x[i : i + len(y), 1] += y * pan

    melodia = [76, 74, 72, 71, 72, 69, 71, 68]
    for vuelta in range(2):
        for a, (raiz, notas) in enumerate(acordes):
            t0 = vuelta * ciclo + a * 2 * compas
            poner(midi(raiz - 12), t0, 2 * compas, 0.55, 0.4)
            poner(midi(raiz - 24), t0, 2 * compas, 0.35, 0.4)
            patron = [notas[0], notas[1], notas[2], notas[1] + 12 if notas[1] + 12 < 80 else notas[1], notas[2], notas[1]]
            for k in range(12):
                poner(midi(patron[k % 6]), t0 + k * beat * 0.666, beat, 0.22 + 0.04 * (k % 3 == 0), 0.6)
            if vuelta == 1:
                poner(midi(melodia[a * 2]), t0, compas, 0.38, 0.55)
                poner(midi(melodia[a * 2 + 1]), t0 + compas, compas, 0.34, 0.55)
    x = reverb(x, 2.6, 0.32)
    x = plegar(x, largo)
    return x / np.max(np.abs(x)) * 0.8


def voz_cuerda(f, dur, n_voces=3):
    n = int((dur + 1.5) * SR)
    t = np.arange(n) / SR
    y = np.zeros(n)
    for v in range(n_voces):
        det = 1 + (v - 1) * 0.004
        vib = 1 + 0.004 * np.sin(2 * np.pi * (5 + v * 0.3) * t + v)
        fase = 2 * np.pi * f * det * np.cumsum(vib) / SR
        for k in range(1, 11):
            if k * f > 7000:
                break
            y += (1 / k) * np.sin(k * fase)
    env = np.minimum(1, t / 1.2) * np.where(t < dur, 1, np.exp(-(t - dur) * 3))
    return y * env / n_voces


def cuerdas():
    bpm = 66
    compas = 4 * 60 / bpm
    prog = [[45, 57, 60, 64], [41, 53, 57, 60], [48, 55, 60, 64], [43, 55, 59, 62]]  # Am F C G
    largo = int(len(prog) * 2 * compas * SR)
    x = np.zeros((largo + int(4 * SR), 2))
    for a, notas in enumerate(prog):
        t0 = a * 2 * compas
        for j, nn in enumerate(notas):
            y = voz_cuerda(midi(nn), 2 * compas + 0.4) * (0.5 if j == 0 else 0.32)
            i = int(t0 * SR)
            pan = 0.3 + 0.13 * j
            x[i : i + len(y), 0] += y * (1 - pan)
            x[i : i + len(y), 1] += y * pan
    x = filtro(x, 60, 5000)
    x = reverb(x, 3.0, 0.38)
    x = plegar(x, largo)
    return x / np.max(np.abs(x)) * 0.8


def metal(f, dur, brillo=1.0):
    n = int((dur + 0.8) * SR)
    t = np.arange(n) / SR
    env = np.minimum(1, t / 0.06) * np.where(t < dur, 1 - 0.2 * np.minimum(1, t / 0.4), 0.8 * np.exp(-(t - dur) * 7))
    y = np.zeros(n)
    for k in range(1, 14):
        if k * f > 8000:
            break
        amp = (1 / k) * np.exp(-k / (4 + 5 * brillo))
        y += amp * np.sin(2 * np.pi * k * f * t * (1 + 0.002 * np.sin(2 * np.pi * 5.5 * t)))
    return y * env


def timbal(f=73.4):
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    y = np.sin(2 * np.pi * f * t * (1 + 0.15 * np.exp(-t * 12))) * np.exp(-t * 2.8)
    y += 0.25 * rng.standard_normal(n) * np.exp(-t * 40)
    return y


def epica():
    bpm = 90
    beat = 60 / bpm
    compas = 4 * beat
    prog = [(48, [60, 64, 67]), (43, [59, 62, 67]), (45, [60, 64, 69]), (41, [60, 65, 69])]  # C G Am F
    fanfarria = [(72, 1.5), (76, 0.5), (79, 2), (77, 1), (76, 1), (74, 2), (72, 2), (76, 1.5), (79, 0.5), (84, 4), (81, 2), (79, 2)]
    vueltas = 3
    largo = int(vueltas * len(prog) * compas * SR)
    x = np.zeros((largo + int(4 * SR), 2))

    def poner(y, t0, pan=0.5, vol=1.0):
        i = int(t0 * SR)
        k = min(len(y), len(x) - i)
        x[i : i + k, 0] += y[:k] * (1 - pan) * vol
        x[i : i + k, 1] += y[:k] * pan * vol

    for v in range(vueltas):
        for a, (raiz, notas) in enumerate(prog):
            t0 = (v * len(prog) + a) * compas
            for nn in notas:
                poner(metal(midi(nn), compas * 0.95, 0.8), t0, 0.35 + 0.1 * (nn % 3), 0.28)
            poner(metal(midi(raiz), compas, 0.5), t0, 0.5, 0.45)
            for b in range(8):  # cuerdas en corcheas
                poner(voz_cuerda(midi(raiz + 12), beat * 0.45, 2), t0 + b * beat / 2, 0.6, 0.18)
            poner(timbal(midi(raiz - 12) if raiz > 44 else 73.4), t0, 0.5, 0.7)
            poner(timbal(98), t0 + 2 * beat, 0.5, 0.45)
        # fanfarria en las vueltas 2 y 3
        if v >= 1:
            t = v * len(prog) * compas
            for nn, d in fanfarria:
                poner(metal(midi(nn), d * beat * 0.92, 1.2), t, 0.55, 0.35)
                t += d * beat
                if t >= (v + 1) * len(prog) * compas:
                    break
        # platillo al empezar cada vuelta
        n = int(2.5 * SR)
        tt = np.arange(n) / SR
        plat = filtro(rng.standard_normal(n), 3000, 12000) * np.exp(-tt * 1.6) * 0.5
        poner(plat, v * len(prog) * compas, 0.5, 1)
    x = reverb(x, 2.2, 0.28)
    x = plegar(x, largo)
    return x / np.max(np.abs(x)) * 0.85


def lluvia(seg=12.0):
    n = int(seg * SR)
    x = rng.standard_normal((n, 2))
    x = filtro(x, 400, 7000) * 0.5
    # gotas
    for _ in range(int(seg * 40)):
        i = rng.integers(0, n - 2000)
        d = np.exp(-np.arange(2000) / SR * 300) * rng.standard_normal(2000) * rng.uniform(0.2, 0.8)
        x[i : i + 2000, rng.integers(0, 2)] += d
    # bucle suave: fundido cruzado del final con el principio
    k = int(1.0 * SR)
    w = np.linspace(0, 1, k)[:, None]
    x[:k] = x[:k] * w + x[-k:] * (1 - w)
    x = x[:-k]
    return x / np.max(np.abs(x)) * 0.6


def portazo():
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    y = 0.9 * np.sin(2 * np.pi * 62 * t) * np.exp(-t * 9)
    y += 0.6 * filtro(rng.standard_normal(n), 80, 1500) * np.exp(-t * 25)
    y += 0.2 * filtro(rng.standard_normal(n), 2000, 6000) * np.exp(-((t - 0.05) ** 2) * 4000)
    return y / np.max(np.abs(y)) * 0.9


def zumbido(seg=4.0):
    n = int(seg * SR)
    t = np.arange(n) / SR
    y = sum((1 / k) * np.sin(2 * np.pi * 120 * k * t) for k in range(1, 8))
    y *= 0.8 + 0.2 * np.sin(2 * np.pi * 0.5 * t)
    return y / np.max(np.abs(y)) * 0.35


def clic():
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    y = filtro(rng.standard_normal(n), 1500, 9000) * (np.exp(-t * 300) + 0.7 * np.exp(-np.maximum(0, t - 0.09) * 260) * (t > 0.09))
    return y / np.max(np.abs(y)) * 0.8


def multitud(seg=4.5):
    n = int(seg * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal((n, 2))
    x = filtro(x, 250, 3200)
    mod = 1 + 0.25 * np.sin(2 * np.pi * 0.7 * t)[:, None] + 0.15 * np.sin(2 * np.pi * 3.1 * t + 1)[:, None]
    env = np.minimum(1, t / 0.6) * np.clip((seg - t) / 1.5, 0, 1)
    x = x * mod * env[:, None]
    return x / np.max(np.abs(x)) * 0.7


def granos():
    IMG.mkdir(parents=True, exist_ok=True)
    for i in range(4):
        v = rng.integers(0, 256, (256, 256), dtype=np.uint8)
        a = np.full((256, 256), 34, dtype=np.uint8)
        Image.fromarray(np.stack([v, v, v, a], axis=2), "RGBA").save(IMG / f"grano-{i}.png", optimize=True)


if __name__ == "__main__":
    AUDIO.mkdir(parents=True, exist_ok=True)
    guardar("piano", piano())
    guardar("cuerdas", cuerdas())
    guardar("epica", epica())
    guardar("lluvia", lluvia(), "128k")
    guardar("portazo", portazo(), "128k")
    guardar("zumbido", zumbido(), "96k")
    guardar("clic", clic(), "96k")
    guardar("multitud", multitud(), "128k")
    granos()
    print("listo:", sorted(p.name for p in AUDIO.glob("*.mp3")), sorted(p.name for p in IMG.glob("*.png")))
