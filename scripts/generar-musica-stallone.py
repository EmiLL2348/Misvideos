#!/usr/bin/env python3
"""
Música ORIGINAL de "106 dólares y un sueño", compuesta nota a nota en MIDI
(pretty_midi) e interpretada con FluidSynth y el banco de sonidos FluidR3_GM
(licencia MIT). No usa el tema de la película ni fragmentos de él: la
fanfarria solo comparte el estilo (trompetas heroicas de los 70).

  piano.mp3      piano melancólico en La menor + cuerdas suaves (bucle)
  cuerdas.mp3    cuerdas, chelos y trompas en tensión (bucle)
  fanfarria.mp3  fanfarria de trompetas con bajo y batería (~15 s, una vez)
  epica.mp3      orquesta triunfal en Do mayor (bucle)

Requisitos: apt-get install fluidsynth fluid-soundfont-gm ffmpeg
            pip install pretty_midi numpy
"""
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np
import pretty_midi as pm

RAIZ = Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "public" / "audio" / "stallone"
SF2 = "/usr/share/sounds/sf2/FluidR3_GM.sf2"
SR = 44100

NOTAS = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}


def n(nombre: str) -> int:
    """'F#5' → número MIDI."""
    base = NOTAS[nombre[0]]
    i = 1
    while i < len(nombre) and nombre[i] in "#b":
        base += 1 if nombre[i] == "#" else -1
        i += 1
    return base + 12 * (int(nombre[i:]) + 1)


class Pieza:
    def __init__(self, bpm: float):
        self.midi = pm.PrettyMIDI(initial_tempo=bpm)
        self.beat = 60 / bpm
        self.inst = {}

    def i(self, nombre, programa, drum=False):
        if nombre not in self.inst:
            ins = pm.Instrument(program=programa, is_drum=drum, name=nombre)
            self.inst[nombre] = ins
            self.midi.instruments.append(ins)
        return self.inst[nombre]

    def nota(self, ins, tono, inicio, dur, vel=80):
        t0 = inicio * self.beat
        ins.notes.append(pm.Note(velocity=int(max(1, min(127, vel))), pitch=int(tono), start=t0, end=t0 + dur * self.beat))

    def acorde(self, ins, tonos, inicio, dur, vel=70):
        for t in tonos:
            self.nota(ins, t, inicio, dur, vel)

    def render(self, nombre, bucle_beats=None, ganancia=0.9):
        with tempfile.TemporaryDirectory() as d:
            mid = Path(d) / "p.mid"
            wav = Path(d) / "p.wav"
            self.midi.write(str(mid))
            subprocess.run(["fluidsynth", "-ni", "-q", "-g", str(ganancia), "-r", str(SR), "-F", str(wav), SF2, str(mid)], check=True, capture_output=True)
            with wave.open(str(wav)) as w:
                x = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2").astype(np.float32).reshape(-1, w.getnchannels()) / 32768
        if bucle_beats:
            largo = int(round(bucle_beats * self.beat * SR))
            y = x[:largo].copy()
            cola = x[largo:]
            while len(cola):  # bucle perfecto: la cola se suma al principio
                k = min(len(cola), largo)
                y[:k] += cola[:k]
                cola = cola[k:]
            x = y
        else:
            # recorta silencio final
            fin = len(x)
            while fin > 0 and np.max(np.abs(x[max(0, fin - 2048) : fin])) < 1e-3:
                fin -= 2048
            x = x[: fin + SR // 2]
            x[-SR // 3 :] *= np.linspace(1, 0, len(x[-SR // 3 :]))[:, None]
        x = x / (np.max(np.abs(x)) + 1e-9) * 0.85
        tmp = SALIDA / f"_{nombre}.wav"
        with wave.open(str(tmp), "wb") as w:
            w.setnchannels(2)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes((x * 32767).astype("<i2").tobytes())
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp), "-b:a", "192k", str(SALIDA / f"{nombre}.mp3")], check=True)
        tmp.unlink()
        print(f"{nombre}.mp3  {len(x) / SR:.1f} s")


def piano():
    p = Pieza(70)
    piano = p.i("piano", 0)
    pad = p.i("cuerdas", 49)
    acordes = [
        ("A2", ["A3", "C4", "E4"]),
        ("F2", ["F3", "A3", "C4"]),
        ("C3", ["G3", "C4", "E4"]),
        ("E2", ["G#3", "B3", "E4"]),
        ("A2", ["A3", "C4", "E4"]),
        ("F2", ["F3", "A3", "C4"]),
        ("D2", ["F3", "A3", "D4"]),
        ("E2", ["G#3", "B3", "E4"]),
    ]
    melodia = [
        [("E5", 0, 1.5), ("D5", 1.5, 0.5), ("C5", 2, 2)],
        [("A4", 0, 2), ("C5", 2, 1), ("F5", 3, 1)],
        [("E5", 0, 2), ("G5", 2, 1), ("E5", 3, 1)],
        [("D5", 0, 1), ("B4", 1, 1), ("G#4", 2, 2)],
        [("A4", 0, 1), ("C5", 1, 1), ("E5", 2, 2)],
        [("F5", 0, 1.5), ("E5", 1.5, 0.5), ("D5", 2, 1), ("C5", 3, 1)],
        [("D5", 0, 2), ("F5", 2, 1), ("A5", 3, 1)],
        [("G#5", 0, 2), ("B4", 2, 2)],
    ]
    for vuelta in range(2):
        for b, (bajo, tonos) in enumerate(acordes):
            t = (vuelta * 8 + b) * 4
            p.nota(piano, n(bajo), t, 4, 52)
            p.nota(piano, n(bajo) + 12, t, 4, 40)
            arp = [n(x) for x in tonos]
            for k, idx in enumerate([0, 1, 2, 1, 0, 1, 2, 1]):
                p.nota(piano, arp[idx], t + k * 0.5, 0.9, 34 + (6 if k % 4 == 0 else 0))
            for (nota, ini, dur) in melodia[b]:
                p.nota(piano, n(nota), t + ini, dur, 64 if vuelta == 0 else 70)
                if vuelta == 1:
                    p.nota(piano, n(nota) - 12, t + ini, dur, 38)
            if vuelta == 1 or b >= 4:
                p.acorde(pad, [n(x) - 12 for x in tonos], t, 4, 38 if vuelta == 0 else 46)
    p.render("piano", bucle_beats=64)


def cuerdas():
    p = Pieza(70)
    cs = p.i("cuerdas", 49)
    ch = p.i("chelo", 42)
    cb = p.i("contrabajo", 43)
    tr = p.i("trompas", 60)
    prog = [
        ("A2", ["A3", "C4", "E4", "A4"], ["A3", "C4"]),
        ("F2", ["F3", "A3", "C4", "F4"], ["A3", "G3"]),
        ("D2", ["F3", "A3", "D4", "F4"], ["F3", "E3"]),
        ("E2", ["G#3", "B3", "E4", "G#4"], ["D3", "B2"]),
        ("A2", ["A3", "C4", "E4", "A4"], ["C3", "E3"]),
        ("F2", ["A3", "C4", "F4", "A4"], ["F3", "A3"]),
        ("G2", ["G3", "B3", "D4", "G4"], ["G3", "B3"]),
        ("E2", ["G#3", "B3", "E4", "B4"], ["E3", "G#3"]),
    ]
    for b, (bajo, tonos, linea) in enumerate(prog):
        t = b * 4
        p.acorde(cs, [n(x) for x in tonos], t, 4, 64 + b * 2)
        p.nota(cb, n(bajo), t, 4, 70)
        p.nota(ch, n(linea[0]), t, 2, 66)
        p.nota(ch, n(linea[1]), t + 2, 2, 62)
        if b >= 4:
            p.acorde(tr, [n(tonos[1]), n(tonos[2])], t, 4, 56)
    p.render("cuerdas", bucle_beats=32)


def tercera_abajo(tono: int) -> int:
    """Tercera diatónica por debajo en Re mayor."""
    escala = [n(x) % 12 for x in ["D4", "E4", "F#4", "G4", "A4", "B4", "C#5"]]
    for baja in range(2, 6):
        if (tono - baja) % 12 in escala and baja in (3, 4):
            return tono - baja
    return tono - 3


def fanfarria():
    """Fanfarria ORIGINAL estilo himno deportivo de los 70 (Re mayor)."""
    p = Pieza(108)
    tp1 = p.i("trompeta 1", 56)
    tp2 = p.i("trompeta 2", 56)
    tb = p.i("trombones", 57)
    cs = p.i("cuerdas", 48)
    bj = p.i("bajo", 33)
    ti = p.i("timbales", 47)
    bt = p.i("bateria", 0, drum=True)
    melodia = [
        # compás 1-2: llamada de trompetas sobre redoble
        ("A4", 0, 1), ("D5", 1, 1.5), ("E5", 2.5, 0.5), ("F#5", 3, 1),
        ("A5", 4, 2), ("G5", 6, 0.5), ("F#5", 6.5, 0.5), ("E5", 7, 1),
        # compás 3-5: entra el ritmo
        ("D5", 8, 1), ("E5", 9, 1), ("F#5", 10, 1), ("B5", 11, 1),
        ("A5", 12, 3), ("A5", 15, 0.5), ("B5", 15.5, 0.5),
        ("G5", 16, 1.5), ("F#5", 17.5, 0.5), ("E5", 18, 1), ("C#5", 19, 1),
        # compás 6: final
        ("D5", 20, 3.5),
    ]
    for nota, ini, dur in melodia:
        t = n(nota)
        p.nota(tp1, t, ini, dur * 0.95, 112)
        p.nota(tp2, tercera_abajo(t), ini, dur * 0.95, 96)
    # compases 1-2: acorde sostenido + redoble de timbal en semicorcheas
    p.acorde(cs, [n("D3"), n("A3"), n("D4"), n("F#4")], 0, 8, 70)
    p.acorde(tb, [n("D3"), n("A3")], 0, 8, 70)
    for k in range(32):
        p.nota(ti, n("D2"), k * 0.25, 0.25, 40 + k * 2)
    p.nota(bt, 49, 8, 2, 110)  # platillo al entrar el ritmo
    # compases 3-5: groove con bajo, batería y golpes de cuerda
    armonia = [("G2", ["G3", "B3", "D4"]), ("A2", ["A3", "C#4", "E4"]), ("G2", ["G3", "B3", "D4"])]
    for c, (raiz, tonos) in enumerate(armonia):
        t = 8 + c * 4
        r = n(raiz)
        for k, d in enumerate([0, 12, 0, 12, 0, 12, 7, 12]):
            p.nota(bj, r + d, t + k * 0.5, 0.45, 100 if k % 2 == 0 else 84)
        p.acorde(tb, [n(x) - 12 for x in tonos[:2]], t, 4, 82)
        for k in range(4):
            p.acorde(cs, [n(x) for x in tonos], t + k + 0.5, 0.35, 88)
        for k in range(8):
            p.nota(bt, 42, t + k * 0.5, 0.25, 70 + (14 if k % 2 == 0 else 0))
        for b in (0, 2, 2.5):
            p.nota(bt, 36, t + b, 0.5, 108)
        for b in (1, 3):
            p.nota(bt, 38, t + b, 0.5, 104)
        if c == 2:
            for k in range(4):  # redoble de caja hacia el final
                p.nota(bt, 38, t + 3 + k * 0.25, 0.25, 80 + k * 10)
    # compás 6: gran acorde final
    p.acorde(tb, [n("D3"), n("A3"), n("D4")], 20, 3.5, 100)
    p.acorde(cs, [n("D3"), n("A3"), n("D4"), n("F#4"), n("A4"), n("D5")], 20, 3.5, 100)
    p.nota(bj, n("D2"), 20, 3.5, 110)
    p.nota(ti, n("D2"), 20, 2, 120)
    p.nota(bt, 49, 20, 3, 120)
    p.nota(bt, 36, 20, 1, 120)
    p.render("fanfarria")


def epica():
    p = Pieza(96)
    cs = p.i("cuerdas", 48)
    cb = p.i("contrabajo", 43)
    br = p.i("metales", 61)
    tr = p.i("trompas", 60)
    tp = p.i("trompeta", 56)
    ti = p.i("timbales", 47)
    bt = p.i("percusion", 0, drum=True)
    prog = [
        ("C2", ["C4", "E4", "G4"]),
        ("G1", ["B3", "D4", "G4"]),
        ("A1", ["C4", "E4", "A4"]),
        ("F1", ["C4", "F4", "A4"]),
        ("C2", ["C4", "E4", "G4"]),
        ("G1", ["B3", "D4", "G4"]),
        ("F1", ["C4", "F4", "A4"]),
        ("G1", ["B3", "D4", "G4"]),
    ]
    trompas = [("G4", 0, 1), ("C5", 1, 1), ("D5", 2, 1), ("E5", 3, 1), ("D5", 4, 2), ("B4", 6, 1), ("G4", 7, 1),
               ("A4", 8, 1), ("C5", 9, 1), ("E5", 10, 2), ("F5", 12, 1), ("E5", 13, 1), ("D5", 14, 1), ("C5", 15, 1)]
    trompeta = [("G5", 16, 2), ("E5", 18, 1), ("C5", 19, 1), ("D5", 20, 2), ("G5", 22, 2),
                ("A5", 24, 1), ("G5", 25, 1), ("F5", 26, 1), ("E5", 27, 1), ("D5", 28, 3), ("G4", 31, 1)]
    for b, (raiz, tonos) in enumerate(prog):
        t = b * 4
        r = n(raiz)
        p.nota(cb, r + 12, t, 4, 80)
        for k in range(8):
            p.nota(cs, r + 24 + (7 if k % 2 else 0), t + k * 0.5, 0.45, 72)
        p.acorde(br, [n(x) for x in tonos], t, 2, 86)
        p.acorde(br, [n(x) for x in tonos], t + 2.5, 1.4, 76)
        p.nota(ti, r + 24 if r + 24 < 50 else r + 12, t, 1, 100)
        p.nota(ti, r + 24 if r + 24 < 50 else r + 12, t + 2, 1, 80)
        if b in (0, 4):
            p.nota(bt, 49, t, 2, 100)
    for nota, ini, dur in trompas:
        p.nota(tr, n(nota), ini, dur, 92)
    for nota, ini, dur in trompeta:
        p.nota(tp, n(nota), ini, dur, 100)
        p.nota(tr, n(nota) - 12, ini, dur, 78)
    p.render("epica", bucle_beats=32)


if __name__ == "__main__":
    SALIDA.mkdir(parents=True, exist_ok=True)
    piano()
    cuerdas()
    fanfarria()
    epica()
