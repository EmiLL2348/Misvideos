#!/usr/bin/env python3
"""
Música ORIGINAL (compuesta en MIDI e interpretada con FluidSynth + FluidR3_GM,
licencia MIT) y efectos sintetizados para "Recluso P50522".
Sin bandas sonoras ni canciones comerciales. Cada tema se normaliza a -16 LUFS
con pico real de -1.5 dBTP; la mezcla final la hace Remotion (bajada de -12 dB
bajo la voz).

  misterio.mp3   escenas 1–3  piano y cuerdas suaves (Re menor, bucle)
  tension.mp3    escenas 4–6  pulso grave, pizzicato y percusión mínima (Do menor, bucle)
  esperanza.mp3  escena 7     piano esperanzador (Sol mayor, bucle)
  epica.mp3      escenas 8–9  crecimiento orquestal (Do mayor, bucle)
  oscuro.mp3     escena 10    cuerdas graves, coro y arpa (Mi menor, bucle)
  + efectos: grabado, reja, olas, flash, clac, mazo, chispas, sello, puerta

Requisitos: apt-get install fluidsynth fluid-soundfont-gm ffmpeg
            pip install pretty_midi numpy
"""
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np



import pretty_midi as pm  # noqa: E402
import tempfile  # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "public" / "audio" / "downey"
SF2 = "/usr/share/sounds/sf2/FluidR3_GM.sf2"
SR = 44100
rng = np.random.default_rng(2008)
NOTAS = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def n(nombre):
    b = NOTAS[nombre[0]]
    i = 1
    while i < len(nombre) and nombre[i] in "#b":
        b += 1 if nombre[i] == "#" else -1
        i += 1
    return b + 12 * (int(nombre[i:]) + 1)


def a_mp3(nombre, x, normalizar=True, bitrate="192k"):
    x = np.clip(x, -1, 1)
    tmp = SALIDA / f"_{nombre}.wav"
    with wave.open(str(tmp), "wb") as w:
        w.setnchannels(2 if x.ndim == 2 else 1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype("<i2").tobytes())
    filtro = ["-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", str(SR)] if normalizar else []
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp), *filtro, "-b:a", bitrate, str(SALIDA / f"{nombre}.mp3")], check=True)
    tmp.unlink()


class Pieza:
    def __init__(self, bpm):
        self.midi = pm.PrettyMIDI(initial_tempo=bpm)
        self.beat = 60 / bpm
        self.inst = {}

    def i(self, nombre, programa, drum=False):
        if nombre not in self.inst:
            ins = pm.Instrument(program=programa, is_drum=drum, name=nombre)
            self.inst[nombre] = ins
            self.midi.instruments.append(ins)
        return self.inst[nombre]

    def nota(self, ins, tono, ini, dur, vel=70):
        t0 = ini * self.beat
        ins.notes.append(pm.Note(velocity=int(max(1, min(127, vel))), pitch=int(tono), start=t0, end=t0 + dur * self.beat))

    def acorde(self, ins, tonos, ini, dur, vel=60):
        for t in tonos:
            self.nota(ins, t, ini, dur, vel)

    def render(self, nombre, bucle_beats):
        with tempfile.TemporaryDirectory() as d:
            mid = Path(d) / "p.mid"
            wav = Path(d) / "p.wav"
            self.midi.write(str(mid))
            subprocess.run(["fluidsynth", "-ni", "-q", "-g", "0.8", "-r", str(SR), "-F", str(wav), SF2, str(mid)], check=True, capture_output=True)
            with wave.open(str(wav)) as w:
                x = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2").astype(np.float32).reshape(-1, w.getnchannels()) / 32768
        largo = int(round(bucle_beats * self.beat * SR))
        y = x[:largo].copy()
        cola = x[largo:]
        while len(cola):  # bucle perfecto
            k = min(len(cola), largo)
            y[:k] += cola[:k]
            cola = cola[k:]
        y = y / (np.max(np.abs(y)) + 1e-9) * 0.8
        a_mp3(nombre, y)
        print(f"{nombre}.mp3  {len(y) / SR:.1f} s")


def misterio():
    p = Pieza(64)
    pi = p.i("piano", 0)
    cu = p.i("cuerdas", 49)
    ce = p.i("celesta", 8)
    prog = [("D2", ["D3", "F3", "A3"]), ("A#1", ["D3", "F3", "A#3"]), ("G1", ["D3", "G3", "A#3"]), ("A1", ["C#3", "E3", "A3"])] * 2
    mel = [("A4", 0, 3), ("F4", 3, 1), ("D5", 4, 2), ("C5", 6, 1), ("A#4", 7, 1), ("G4", 8, 3), ("A#4", 11, 1), ("A4", 12, 4),
           ("A4", 16, 2), ("D5", 18, 2), ("F5", 20, 3), ("E5", 23, 1), ("D5", 24, 2), ("A#4", 26, 2), ("C#5", 28, 4)]
    for b, (bajo, tonos) in enumerate(prog):
        t = b * 4
        p.nota(pi, n(bajo), t, 4, 46)
        for k, idx in enumerate([0, 1, 2, 1]):
            p.nota(pi, n(tonos[idx]), t + k, 1.5, 34)
        p.acorde(cu, [n(x) for x in tonos], t, 4, 44)
    for nota, ini, dur in mel:
        p.nota(pi, n(nota), ini, dur, 58)
        if ini >= 16:
            p.nota(ce, n(nota) + 12, ini, min(dur, 1), 30)
    p.render("misterio", 32)


def tension():
    p = Pieza(84)
    pz = p.i("pizzicato", 45)
    cb = p.i("contrabajo", 43)
    cu = p.i("cuerdas graves", 49)
    bt = p.i("percusion", 0, drum=True)
    ti = p.i("timbal", 47)
    raices = ["C2", "C2", "G#1", "G#1", "F1", "F1", "G1", "G1"]
    for b, r in enumerate(raices):
        t = b * 4
        rr = n(r)
        for k in range(8):
            p.nota(pz, rr + (12 if k % 4 == 2 else 0) + 12, t + k * 0.5, 0.4, 70 if k % 2 == 0 else 54)
        p.nota(cb, rr + 12, t, 4, 62)
        tonos = {"C2": ["C3", "D#3", "G3"], "G#1": ["C3", "D#3", "G#3"], "F1": ["C3", "F3", "G#3"], "G1": ["B2", "D3", "G3"]}[r]
        p.acorde(cu, [n(x) for x in tonos], t, 4, 48)
        p.nota(bt, 36, t, 0.5, 70)
        p.nota(bt, 36, t + 2.5, 0.5, 56)
        if b % 2 == 1:
            p.nota(ti, rr + 12, t + 3, 1, 60)
        for k in range(4):
            p.nota(bt, 42, t + k + 0.5, 0.2, 34)
    p.render("tension", 32)


def esperanza():
    p = Pieza(72)
    pi = p.i("piano", 0)
    cu = p.i("cuerdas", 48)
    prog = [("G2", ["G3", "B3", "D4"]), ("D2", ["F#3", "A3", "D4"]), ("E2", ["G3", "B3", "E4"]), ("C2", ["G3", "C4", "E4"])] * 2
    mel = [("D5", 0, 1), ("G5", 1, 2), ("F#5", 3, 1), ("E5", 4, 1), ("D5", 5, 1), ("A4", 6, 2), ("B4", 8, 1), ("E5", 9, 2), ("D5", 11, 1), ("C5", 12, 2), ("B4", 14, 1), ("A4", 15, 1),
           ("B4", 16, 1), ("D5", 17, 1), ("G5", 18, 2), ("A5", 20, 1), ("F#5", 21, 1), ("D5", 22, 2), ("E5", 24, 1), ("G5", 25, 1), ("B5", 26, 2), ("A5", 28, 2), ("G5", 30, 2)]
    for b, (bajo, tonos) in enumerate(prog):
        t = b * 4
        p.nota(pi, n(bajo), t, 4, 50)
        arp = [n(x) for x in tonos] + [n(tonos[0]) + 12]
        for k in range(8):
            p.nota(pi, arp[[0, 1, 2, 3, 2, 1, 2, 1][k]], t + k * 0.5, 0.9, 36)
        if b >= 4:
            p.acorde(cu, [n(x) - 12 for x in tonos], t, 4, 40)
    for nota, ini, dur in mel:
        p.nota(pi, n(nota), ini, dur, 66)
    p.render("esperanza", 32)


def epica():
    p = Pieza(92)
    cs = p.i("cuerdas", 48)
    cb = p.i("contrabajo", 43)
    tr = p.i("trompas", 60)
    br = p.i("metales", 61)
    tp = p.i("trompeta", 56)
    ti = p.i("timbal", 47)
    bt = p.i("platillos", 0, drum=True)
    prog = [("C2", ["C4", "E4", "G4"]), ("A1", ["C4", "E4", "A4"]), ("F1", ["C4", "F4", "A4"]), ("G1", ["B3", "D4", "G4"])] * 4
    for b, (raiz, tonos) in enumerate(prog):
        t = b * 4
        r = n(raiz)
        fuerte = b >= 8
        p.nota(cb, r + 12, t, 4, 70 if not fuerte else 86)
        for k in range(8):
            p.nota(cs, r + 24 + (7 if k % 2 else 0), t + k * 0.5, 0.45, 60 if not fuerte else 78)
        p.acorde(tr, [n(x) for x in tonos[:2]], t, 4, 58 if not fuerte else 74)
        if fuerte:
            p.acorde(br, [n(x) for x in tonos], t, 2, 84)
            p.acorde(br, [n(x) for x in tonos], t + 2.5, 1.3, 72)
            p.nota(ti, r + 24 if r + 24 < 52 else r + 12, t, 1, 96)
            p.nota(ti, r + 24 if r + 24 < 52 else r + 12, t + 2, 1, 74)
        if b in (0, 8, 12):
            p.nota(bt, 49, t, 2, 84 if b else 60)
    melodia = [("E5", 0, 2), ("G5", 2, 2), ("A5", 4, 3), ("G5", 7, 1), ("F5", 8, 2), ("E5", 10, 1), ("D5", 11, 1), ("E5", 12, 4)]
    for vuelta in range(4):
        for nota, ini, dur in melodia:
            ins = tr if vuelta < 2 else tp
            p.nota(ins, n(nota) - (12 if vuelta < 2 else 0), vuelta * 16 + ini, dur, 80 if vuelta < 2 else 96)
    p.render("epica", 64)


def oscuro():
    p = Pieza(60)
    cu = p.i("cuerdas graves", 49)
    cb = p.i("contrabajo", 43)
    co = p.i("coro", 52)
    ar = p.i("arpa", 46)
    ti = p.i("timbal", 47)
    prog = [("E1", ["E3", "G3", "B3"]), ("C2", ["E3", "G3", "C4"]), ("A1", ["E3", "A3", "C4"]), ("B1", ["D#3", "F#3", "B3"])] * 2
    for b, (raiz, tonos) in enumerate(prog):
        t = b * 4
        p.nota(cb, n(raiz) + 12, t, 4, 74)
        p.acorde(cu, [n(x) for x in tonos], t, 4, 56)
        if b >= 2:
            p.acorde(co, [n(x) + 12 for x in tonos[:2]], t, 4, 40)
        arp = [n(x) + 12 for x in tonos]
        for k in range(4):
            p.nota(ar, arp[k % 3] + (12 if k == 3 else 0), t + k, 1.5, 44)
        if b % 2 == 0:
            p.nota(ti, n(raiz) + 24, t, 2, 54)
    p.render("oscuro", 32)


# ---------------- efectos ----------------
def filtro(x, bajo=None, alto=None):
    X = np.fft.rfft(x, axis=0)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.ones_like(f)
    if alto:
        g *= 1 / (1 + (f / alto) ** 4)
    if bajo:
        g *= 1 / (1 + (bajo / np.maximum(f, 1)) ** 4)
    return np.fft.irfft(X * (g[:, None] if X.ndim == 2 else g), n=len(x), axis=0)


def norm(x, pico=0.7):
    return x / (np.max(np.abs(x)) + 1e-9) * pico


def grabado():
    t = np.arange(int(0.18 * SR)) / SR
    y = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, d in [(2350, 30), (3610, 40), (5120, 55)])
    y += 0.4 * filtro(rng.standard_normal(len(t)), 2000, 9000) * np.exp(-t * 90)
    return norm(y, 0.5)


def reja():
    t = np.arange(int(1.4 * SR)) / SR
    y = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, a, d in [(180, 1, 5), (431, 0.7, 6), (733, 0.5, 8), (1210, 0.35, 10), (1873, 0.25, 12)])
    y += 0.8 * filtro(rng.standard_normal(len(t)), 100, 3000) * np.exp(-t * 30)
    return norm(y, 0.8)


def olas(seg=14.0):
    nn = int(seg * SR)
    t = np.arange(nn) / SR
    x = filtro(rng.standard_normal((nn, 2)), 120, 3500)
    env = 0.35 + 0.65 * (0.5 + 0.5 * np.sin(2 * np.pi * t / 7 - 1.5)) ** 2
    x = x * env[:, None]
    k = SR
    w = np.linspace(0, 1, k)[:, None]
    x[:k] = x[:k] * w + x[-k:] * (1 - w)
    return norm(x[:-k], 0.6)


def flash():
    t = np.arange(int(0.35 * SR)) / SR
    y = filtro(rng.standard_normal(len(t)), 1500, 9000) * np.exp(-t * 60) + 0.3 * np.sin(2 * np.pi * (3000 + 4000 * t) * t) * np.exp(-t * 12)
    return norm(y, 0.5)


def clac():
    t = np.arange(int(0.25 * SR)) / SR
    y = filtro(rng.standard_normal(len(t)), 300, 5000) * np.exp(-t * 180) + 0.5 * np.sin(2 * np.pi * 90 * t) * np.exp(-t * 40)
    return norm(y, 0.7)


def mazo():
    t = np.arange(int(0.6 * SR)) / SR
    y = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, a, d in [(110, 1, 14), (260, 0.6, 20), (520, 0.3, 30)])
    y += 0.5 * filtro(rng.standard_normal(len(t)), 200, 4000) * np.exp(-t * 70)
    return norm(y, 0.8)


def chispas():
    nn = int(1.2 * SR)
    y = np.zeros(nn)
    for _ in range(70):
        i = rng.integers(0, nn - 600)
        y[i : i + 600] += rng.standard_normal(600) * np.exp(-np.arange(600) / 60) * rng.uniform(0.2, 1)
    return norm(filtro(y, 2500, 12000), 0.4)


def sello():
    t = np.arange(int(0.4 * SR)) / SR
    y = np.sin(2 * np.pi * 70 * t) * np.exp(-t * 25) + 0.6 * filtro(rng.standard_normal(len(t)), 150, 2000) * np.exp(-t * 50)
    return norm(y, 0.8)


def puerta():
    t = np.arange(int(0.8 * SR)) / SR
    y = 0.9 * np.sin(2 * np.pi * 75 * t) * np.exp(-t * 11) + 0.5 * filtro(rng.standard_normal(len(t)), 100, 1800) * np.exp(-t * 28)
    return norm(y, 0.75)


if __name__ == "__main__":
    SALIDA.mkdir(parents=True, exist_ok=True)
    misterio()
    tension()
    esperanza()
    epica()
    oscuro()
    for nombre, fn in [("grabado", grabado), ("reja", reja), ("olas", olas), ("flash", flash), ("clac", clac), ("mazo", mazo), ("chispas", chispas), ("sello", sello), ("puerta", puerta)]:
        a_mp3(nombre, fn(), normalizar=False, bitrate="128k")
    print("efectos listos")
