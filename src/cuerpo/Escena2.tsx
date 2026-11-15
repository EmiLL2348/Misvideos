import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Expresion, Humano, POSES } from "./Humano";
import { C, FUENTE_TITULO, clampI, prog, rebote } from "./tema";
import { useEscena } from "./timeline";
import {
  Advertencia,
  BarraOxigeno,
  Check,
  Cronometro,
  Dato,
  EtiquetaEscena,
  Estrellas,
  Expediente,
  Panel,
  Pulmones,
  Sello,
  Tachadura,
  TicsContador,
  Titular,
} from "./ui";

const PX = 1000; // inicio del panel derecho

const Explosion: React.FC = () => {
  const f = useCurrentFrame();
  const pts = new Array(24)
    .fill(0)
    .map((_, i) => {
      const r = i % 2 ? 150 : 230 + Math.sin(f / 4 + i) * 10;
      const a = (i / 24) * Math.PI * 2;
      return `${250 + Math.cos(a) * r},${200 + Math.sin(a) * r * 0.8}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 500 400" width={500} height={400}>
      <polygon points={pts} fill={C.ambar} stroke={C.blanco} strokeWidth={8} strokeLinejoin="round" />
      <text x={250} y={232} textAnchor="middle" fontFamily={FUENTE_TITULO} fontWeight={900} fontSize={92} fill={C.coral} stroke={C.noche} strokeWidth={4}>
        ¡BOOM!
      </text>
    </svg>
  );
};

export const Escena2: React.FC = () => {
  const f = useCurrentFrame();
  const { cue, dur } = useEscena("s2");
  const c = {
    peliculas: cue("películas"),
    explotas: cue("explotas"),
    hervir: cue("hervir"),
    agua: cue("agua"),
    piel: cue("piel"),
    peor: cue("peor"),
    quince: cue("15"),
    pulmones: cue("pulmones"),
    nunca: cue("nunca"),
    anio: cue("1966"),
    saliva: cue("saliva"),
    sobrevivio: cue("sobrevivió"),
  };

  // cuenta regresiva 15 → 0
  const cuentaIni = c.quince - 4;
  const cuentaDur = Math.max(60, c.pulmones - 12 - cuentaIni);
  const cada = cuentaDur / 15;
  const restante = Math.max(0, 15 - Math.floor(Math.max(0, f - cuentaIni) / cada));
  const nivelO2 = interpolate(f, [cuentaIni, cuentaIni + cuentaDur], [1, 0], clampI);

  const inflar = interpolate(f, [c.piel, c.piel + 18, c.piel + 45], [0, 1, 0.55], clampI);
  const burbujas = interpolate(f, [c.agua, c.hervir, c.peor + 40, c.peor + 60], [0, 1, 1, 0.25], clampI);

  let expresion: Expresion = "normal";
  if (f >= c.peliculas && f < c.hervir + 50) expresion = "sorprendido";
  if (f >= c.peor && nivelO2 < 0.45 && f < c.anio) expresion = "cansado";
  if (f >= c.pulmones - 10 && f < c.anio) expresion = "sorprendido";
  if (f >= c.sobrevivio) expresion = "feliz";

  const tachar = prog(f, c.explotas - 6, 10);

  return (
    <AbsoluteFill>
      <Estrellas />
      <EtiquetaEscena num={1} titulo="El espacio sin traje" />
      {/* humano flotando */}
      <div
        style={{
          position: "absolute",
          left: 300,
          top: 240 + Math.sin(f / 22) * 22,
          transform: `rotate(${Math.sin(f / 40) * 7}deg)`,
          opacity: prog(f, 2, 14),
        }}
      >
        <Humano
          altura={560}
          expresion={expresion}
          brazoIzq={POSES.flotar.izq}
          brazoDer={POSES.flotar.der}
          caminar={f / 18}
          inflar={inflar}
          burbujas={burbujas}
          semilla={2}
        />
      </div>
      {f >= c.piel && f < c.peor ? (
        <div style={{ position: "absolute", left: 300, top: 160, width: 350, textAlign: "center", opacity: prog(f, c.piel + 10, 10) }}>
          <Titular tam={60} color={C.ambar} desde={c.piel + 10}>
            +{Math.round(15 * prog(f, c.piel + 10, 20))}%
          </Titular>
        </div>
      ) : null}

      {/* A · no explotas */}
      <Panel desde={c.peliculas - 4} hasta={c.agua} style={{ left: PX + 110, top: 200 }}>
        <div style={{ position: "relative", width: 500, height: 400 }}>
          <Explosion />
          <Tachadura p={tachar} ancho={500} alto={400} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 30, opacity: prog(f, c.explotas, 10) }}>
          <Titular tam={84} desde={c.explotas}>
            NO EXPLOTAS
          </Titular>
          <Check tam={84} p={prog(f, c.explotas + 4, 12)} />
        </div>
      </Panel>

      {/* B · el agua hierve */}
      <Panel desde={c.agua} hasta={c.piel} style={{ left: PX + 40, top: 280, width: 780 }}>
        <Titular tam={50} color={C.gris} desde={c.agua}>
          SIN PRESIÓN…
        </Titular>
        <Titular tam={96} color={C.cian} desde={c.hervir - 6} style={{ marginTop: 12 }}>
          EL AGUA HIERVE
        </Titular>
        <Dato tam={46} style={{ marginTop: 20 }}>
          ¡aunque esté a <b style={{ color: C.ambar }}>37 °C</b>!
        </Dato>
      </Panel>

      {/* C · piel se hincha */}
      <Panel desde={c.piel} hasta={c.peor} style={{ left: PX + 40, top: 300, width: 780 }}>
        <Titular tam={84} color={C.ambar} desde={c.piel}>
          LA PIEL SE HINCHA
        </Titular>
        <Dato tam={46} style={{ marginTop: 20 }}>
          …pero te mantiene <b style={{ color: C.cian }}>entero</b>
        </Dato>
      </Panel>

      {/* D · cronómetro + oxígeno */}
      <Panel desde={c.peor} hasta={c.pulmones - 8} style={{ left: PX + 40, top: 150, width: 820 }}>
        <Titular tam={56} color={C.coral} desde={c.peor}>
          FALTA DE OXÍGENO
        </Titular>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <Cronometro
            valor={String(restante)}
            progreso={restante / 15}
            color={restante <= 5 ? C.coral : C.cian}
            tam={330}
            etiqueta="SEGUNDOS"
          />
        </div>
        <div style={{ marginTop: 20 }}>
          <BarraOxigeno nivel={nivelO2} />
        </div>
      </Panel>
      <TicsContador desde={cuentaIni + cada} pasos={15} cada={cada} />

      {/* E · pulmones */}
      <Panel desde={c.pulmones - 8} hasta={c.anio} style={{ left: PX + 80, top: 170, width: 720, textAlign: "center" }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <Pulmones tam={420} puntos={18} color={C.coral} />
          <div
            style={{
              position: "absolute",
              right: -40,
              top: -10,
              transform: `scale(${rebote(f, c.pulmones) * (1 + 0.08 * Math.sin(f / 4))})`,
            }}
          >
            <Advertencia tam={150} />
          </div>
        </div>
        <Titular tam={54} color={C.ambar} desde={c.pulmones + 4} style={{ marginTop: 20 }}>
          ¡NUNCA CONTENGAS
          <br />
          LA RESPIRACIÓN!
        </Titular>
      </Panel>

      {/* F · expediente NASA 1966 */}
      <Panel desde={c.anio - 4} hasta={dur + 20} style={{ left: PX - 60, top: 150 }}>
        <Expediente titulo="NASA · 1966 · Cámara de vacío" ancho={860}>
          <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
            <div style={{ width: 230, height: 300, borderRadius: 20, background: "#C9D3DF", display: "grid", placeItems: "center", overflow: "hidden" }}>
              <Humano altura={280} ropa="traje" expresion={f >= c.saliva ? "sorprendido" : "normal"} burbujas={f >= c.saliva ? 0.8 : 0} semilla={5} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Dato tam={32} color={C.noche}>
                <b>Técnico:</b> Jim LeBlanc
              </Dato>
              <Dato tam={32} color={C.noche}>
                <b>Lugar:</b> Houston, Texas
              </Dato>
              <Dato tam={32} color={C.noche} style={{ opacity: prog(f, c.saliva, 12) }}>
                <b>Último recuerdo:</b>
                <br />
                la saliva burbujeando en la lengua
              </Dato>
            </div>
          </div>
        </Expediente>
        <div style={{ position: "absolute", right: 30, bottom: -40 }}>
          <Sello texto="SOBREVIVIÓ" desde={c.sobrevivio} />
        </div>
      </Panel>
    </AbsoluteFill>
  );
};
