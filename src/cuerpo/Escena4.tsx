import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Humano, POSES } from "./Humano";
import { C, FUENTE_TEXTO, FUENTE_TITULO, clampI, prog, rebote } from "./tema";
import { useEscena } from "./timeline";
import { Dato, EtiquetaEscena, FondoBase, Panel, Pulmones, Termometro, TicsContador, Titular } from "./ui";

const HX = 520; // centro del humano
const SUP = 520; // línea del agua / hielo
const RX = 1080; // panel derecho

const Grietas: React.FC<{ p: number }> = ({ p }) => {
  const ramas = [
    "M0 0 L-60 10 L-110 -4 L-190 14 L-260 6",
    "M0 0 L70 -8 L130 8 L220 -6 L300 10",
    "M0 0 L-30 22 L-80 34 L-120 30",
    "M0 0 L40 24 L100 30 L150 44",
    "M-110 -4 L-140 -22",
    "M130 8 L160 30",
  ];
  return (
    <svg width={800} height={200} style={{ position: "absolute", left: HX - 400, top: SUP - 60, overflow: "visible" }}>
      <g transform="translate(400 70)">
        {ramas.map((d, i) => (
          <path key={i} d={d} stroke={C.blanco} strokeWidth={5} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, p * 1.4 - i * 0.08)} />
        ))}
      </g>
    </svg>
  );
};

const Bloque: React.FC<{ etiqueta: string; texto: string; color: string; desde: number }> = ({ etiqueta, texto, color, desde }) => {
  const f = useCurrentFrame();
  const p = prog(f, desde, 12);
  const pulso = f >= desde ? 1 + 0.05 * Math.max(0, Math.sin(((f - desde) / 20) * Math.PI)) * (f - desde < 20 ? 1 : 0) : 1;
  return (
    <div
      style={{
        flex: 1,
        height: 130,
        borderRadius: 26,
        border: `5px solid ${p > 0 ? color : C.nocheBorde}`,
        background: p > 0 ? `${color}${Math.round(p * 0x33).toString(16).padStart(2, "0")}` : "rgba(24,41,63,0.6)",
        display: "flex",
        alignItems: "center",
        gap: 22,
        padding: "0 30px",
        transform: `scale(${pulso})`,
        opacity: 0.45 + 0.55 * p,
      }}
    >
      <div style={{ fontFamily: FUENTE_TITULO, fontWeight: 900, fontSize: 54, color: p > 0.1 ? color : C.gris, whiteSpace: "nowrap" }}>{etiqueta}</div>
      <div style={{ fontFamily: FUENTE_TEXTO, fontWeight: 700, fontSize: 28, color: C.blanco, lineHeight: 1.15 }}>{texto}</div>
    </div>
  );
};

export const Escena4: React.FC = () => {
  const f = useCurrentFrame();
  const { cue, dur } = useEscena("s4");
  const c = {
    lago: cue("lago"),
    regla: cue("regla"),
    primer: cue("primer"),
    tragar: cue("tragar"),
    despues: cue("después"),
    diez: cue("10"),
    brazos: cue("brazos"),
    hasta: cue("hasta"),
    hora: cue("hora"),
    dato: cue("dato"),
  };

  const grietas = prog(f, c.lago - 16, 22);
  const caida = c.lago + 10;
  const cayo = f >= caida;
  const pc = rebote(f, caida, 30, 14);
  const altura = 360;
  // de pie: pies sobre el hielo; en el agua: hombros a la altura de la superficie
  const topPie = SUP - altura + 6;
  const topAgua = SUP - 34 - altura * 0.5;
  const top = cayo ? topPie + (topAgua - topPie) * pc + Math.sin(f / 14) * 6 : topPie;
  const azul = prog(f, c.brazos, 20);
  const colorManos = azul > 0 ? `rgb(${Math.round(232 - azul * 105)}, ${Math.round(180 - azul * 2)}, ${Math.round(142 + azul * 87)})` : undefined;

  const temp = interpolate(f, [c.hora, c.hora + 50], [37, 32], clampI);
  const salpica = cayo ? prog(f, caida, 24) : 0;

  return (
    <AbsoluteFill>
      <FondoBase tono={C.frio} />
      <EtiquetaEscena num={3} titulo="Agua helada" />

      {/* lago */}
      <div style={{ position: "absolute", left: 60, top: SUP, width: 920, height: 240, borderRadius: "0 0 40px 40px", background: "linear-gradient(#1F5F8B, #123A5A)" }} />
      {/* hielo */}
      <div style={{ position: "absolute", left: 40, top: SUP - 34, width: 960, height: 44, borderRadius: 22, background: "#CFE8F5", boxShadow: "inset 0 -8px 0 #A9D2EA" }} />
      {cayo ? (
        <div style={{ position: "absolute", left: HX - 150, top: SUP - 36, width: 300, height: 52, borderRadius: "50%", background: "#1F5F8B", border: "6px solid #A9D2EA" }} />
      ) : null}
      <Grietas p={grietas} />

      {/* humano (recortado en la superficie cuando está en el agua) */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1000, height: cayo ? SUP - 4 : 1080, overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: HX - (altura * 200) / 640 + (cayo ? Math.sin(f * 1.6) * 2 : 0),
            top,
          }}
        >
          <Humano
            altura={altura}
            expresion={cayo ? "frio" : f > c.lago - 16 ? "sorprendido" : "normal"}
            brazoIzq={cayo ? { hombro: POSES.nadar.izq.hombro + Math.sin(f / 8) * 10, codo: -28 } : POSES.reposo.izq}
            brazoDer={cayo ? { hombro: POSES.nadar.der.hombro + Math.sin(f / 8 + 1) * 10, codo: -28 } : POSES.reposo.der}
            colorManos={colorManos}
            semilla={4}
          />
        </div>
      </div>
      {cayo ? (
        <svg width={400} height={200} style={{ position: "absolute", left: HX - 200, top: SUP - 150, overflow: "visible" }}>
          {new Array(10).fill(0).map((_, i) => {
            const a = Math.PI * (0.1 + (i / 9) * 0.8);
            const r = 40 + salpica * 140;
            return (
              <circle key={i} cx={200 - Math.cos(a) * r} cy={150 - Math.sin(a) * r * 0.9 + salpica * salpica * 120} r={9 - i % 3 * 2} fill={C.blanco} opacity={1 - salpica} />
            );
          })}
          <ellipse cx={200} cy={150} rx={120 + Math.sin(f / 10) * 10} ry={14} fill="none" stroke={C.blanco} strokeWidth={3} opacity={0.4} />
        </svg>
      ) : null}

      {/* panel derecho */}
      <Panel desde={c.regla - 4} hasta={c.primer} style={{ left: RX, top: 220, width: 760, textAlign: "center" }}>
        <Dato tam={36} color={C.gris} style={{ fontWeight: 700, letterSpacing: 4 }}>
          LA REGLA
        </Dato>
        <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 10 }}>
          {[
            ["1", C.ambar],
            ["10", C.coral],
            ["1", C.rojo],
          ].map(([n, col], i) => (
            <React.Fragment key={i}>
              {i > 0 ? (
                <Titular tam={170} color={C.gris} desde={c.regla + i * 5 - 2}>
                  -
                </Titular>
              ) : null}
              <Titular tam={170} color={col} desde={c.regla + i * 5}>
                {n}
              </Titular>
            </React.Fragment>
          ))}
        </div>
      </Panel>
      <Panel desde={c.primer} hasta={c.despues} style={{ left: RX, top: 160, width: 760, textAlign: "center" }}>
        <Pulmones tam={340} puntos={14} agitado color={C.ambar} />
        <Titular tam={56} color={C.ambar} desde={c.primer + 4} style={{ marginTop: 10 }}>
          JADEO SIN CONTROL
        </Titular>
        <Dato tam={34} style={{ marginTop: 12, opacity: prog(f, c.tragar, 12) }}>
          No tragues agua · calma la respiración
        </Dato>
      </Panel>
      <Panel desde={c.despues} hasta={c.hasta} style={{ left: RX, top: 200, width: 760, textAlign: "center" }}>
        <Titular tam={190} color={C.coral} desde={c.diez - 6}>
          {Math.min(10, Math.floor(prog(f, c.diez - 6, 30) * 10 + 0.0001))}
          <span style={{ fontSize: 70 }}> MIN</span>
        </Titular>
        <Titular tam={52} desde={c.brazos} style={{ marginTop: 6 }}>
          BRAZOS Y PIERNAS FALLAN
        </Titular>
      </Panel>
      <TicsContador desde={c.diez - 6 + 3} pasos={10} cada={3} volumen={0.35} />
      <Panel desde={c.hasta} hasta={c.dato} style={{ left: RX + 40, top: 150, width: 720, display: "flex", alignItems: "center", gap: 40 }}>
        <Termometro temp={temp} alto={440} />
        <div>
          <Titular tam={120} color={temp < 34 ? C.frio : C.ambar} desde={c.hasta}>
            {temp.toFixed(0)} °C
          </Titular>
          <Titular tam={56} color={C.rojo} desde={c.hora + 10} style={{ marginTop: 10 }}>
            HIPOTERMIA
          </Titular>
        </div>
      </Panel>
      <TicsContador desde={c.hora + 10} pasos={5} cada={10} volumen={0.35} />
      <Panel desde={c.dato - 4} hasta={dur + 20} style={{ left: RX - 20, top: 140, width: 800 }}>
        <div style={{ background: "rgba(24,41,63,0.95)", border: `4px solid ${C.cian}`, borderRadius: 32, padding: 34 }}>
          <Titular tam={58} color={C.cian} desde={c.dato}>
            ¿SABÍAS QUE…?
          </Titular>
          <div style={{ display: "flex", alignItems: "center", gap: 34, marginTop: 20 }}>
            <Pastel p={prog(f, c.dato + 10, 30)} />
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <Dato tam={30}>
                <span style={{ color: C.coral, fontWeight: 800 }}>■</span> Primeros minutos:
                <br />
                choque y ahogamiento
              </Dato>
              <Dato tam={30} color={C.gris}>
                <span style={{ fontWeight: 800 }}>■</span> Hipotermia
              </Dato>
            </div>
          </div>
        </div>
      </Panel>

      {/* línea de tiempo 1-10-1 */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 790, display: "flex", gap: 30, opacity: prog(f, c.regla, 14) }}>
        <Bloque etiqueta="1 MIN" texto="Controla la respiración" color={C.ambar} desde={c.primer} />
        <Bloque etiqueta="10 MIN" texto="Brazos y piernas fallan" color={C.coral} desde={c.diez} />
        <Bloque etiqueta="1 HORA" texto="Hipotermia" color={C.rojo} desde={c.hora} />
      </div>
    </AbsoluteFill>
  );
};

const Pastel: React.FC<{ p: number }> = ({ p }) => {
  const f = useCurrentFrame();
  const fraccion = 0.68 * p;
  const a = fraccion * Math.PI * 2;
  const r = 140;
  const x = 160 + Math.sin(a) * r;
  const y = 160 - Math.cos(a) * r;
  const grande = fraccion > 0.5 ? 1 : 0;
  const empuje = 10 + Math.sin(f / 10) * 3;
  const mx = Math.sin(a / 2) * empuje;
  const my = -Math.cos(a / 2) * empuje;
  return (
    <svg viewBox="0 0 320 320" width={300} height={300} style={{ overflow: "visible" }}>
      <circle cx={160} cy={160} r={r} fill={C.nocheBorde} stroke={C.blanco} strokeWidth={6} />
      {fraccion > 0.001 ? (
        <path d={`M160 160 L160 ${160 - r} A${r} ${r} 0 ${grande} 1 ${x} ${y} Z`} fill={C.coral} stroke={C.blanco} strokeWidth={6} strokeLinejoin="round" transform={`translate(${mx} ${my})`} />
      ) : null}
    </svg>
  );
};
