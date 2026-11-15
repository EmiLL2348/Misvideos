import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useEscena } from "../comun/timeline";
import { Capa, Cielo, Edificios, Plano, Vapor } from "../stallone/escenario";
import { D, interp, prog } from "./estilo";
import { Robert, SiluetaD, topDePie } from "./Personajes";
import { Copa, Humo, LataPelicula, Look, Mesa, TAXI_BASE, Taxi } from "./props";
import { Rotulo } from "./ui";

const SUELO_CALLE = 930;
const SUELO_PISO = 900;

export const Escena2: React.FC = () => {
  const f = useCurrentFrame();
  const { cue, dur } = useEscena("s2");
  const c = { y1965: cue("1965"), hijo: cue("hijo"), drogas: cue("drogas"), ocho: cue("ocho") };
  const cam = { x: f * 0.9, y: 0, zoom: 1 + Math.min(0.06, f * 0.0004) };
  const frio = interp(f, [c.drogas - 10, c.drogas + 60], [0, 1]);
  const anchoTaxi = 420;
  const kTaxi = anchoTaxi / 520;

  return (
    <AbsoluteFill style={{ background: D.negro }}>
      <Plano desde={0} hasta={c.hijo}>
        <Capa cam={cam} prof={0.05}>
          <Cielo arriba="#5E7FA8" abajo="#F0B97A" />
        </Capa>
        <Capa cam={cam} prof={0.25}>
          <Edificios semilla={8} base={760} altoMin={320} altoMax={620} color="#7C6F7E" colorVentana="#FBE3A8" encendidas={0.2} />
        </Capa>
        <Capa cam={cam} prof={0.55}>
          <Edificios semilla={21} base={SUELO_CALLE - 40} altoMin={380} altoMax={620} color="#9A5640" colorVentana="#FFE6B0" encendidas={0.3} escaleras ladrillo anchoMin={220} anchoMax={340} />
        </Capa>
        <Capa cam={cam} prof={1}>
          <div style={{ position: "absolute", left: -400, width: 3400, top: SUELO_CALLE - 40, height: 40, background: "#9C9488" }} />
          <div style={{ position: "absolute", left: -400, width: 3400, top: SUELO_CALLE, height: 300, background: "linear-gradient(#4E5258, #3A3D42)" }} />
          {new Array(10).fill(0).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: -300 + i * 340, top: SUELO_CALLE + 70, width: 120, height: 8, background: "#E9E2C8" }} />
          ))}
          {[300, 1300, 2300].map((x) => (
            <div key={x} style={{ position: "absolute", left: x - 60, top: SUELO_CALLE + 100, width: 120, height: 18, borderRadius: "50%", background: "#26292E" }} />
          ))}
          <Vapor x={300} y={SUELO_CALLE + 100} color="rgba(255,255,255,0.35)" />
          <Vapor x={1300} y={SUELO_CALLE + 100} escala={1.2} color="rgba(255,255,255,0.35)" />
          {/* taxis genéricos con las ruedas sobre el asfalto */}
          <div style={{ position: "absolute", left: 200 + ((f * 6) % 2800) - 600, top: SUELO_CALLE + 60 - TAXI_BASE * kTaxi }}>
            <Taxi ancho={anchoTaxi} />
          </div>
          <div style={{ position: "absolute", left: 2400 - ((f * 4) % 3000), top: SUELO_CALLE + 120 - TAXI_BASE * kTaxi * 1.1 }}>
            <div style={{ transform: "scaleX(-1)" }}>
              <Taxi ancho={anchoTaxi * 1.1} />
            </div>
          </div>
        </Capa>
        <Rotulo texto="NUEVA YORK · 1965" desde={c.y1965 - 4} hasta={c.hijo} />
      </Plano>

      {/* B · piso bohemio: el padre filma; Robert niño sentado en el suelo entre latas de película */}
      <Plano desde={c.hijo} hasta={dur + 10}>
        <AbsoluteFill style={{ background: "linear-gradient(#B98E6A, #8E6A4E)", transform: `scale(${1 + (f - c.hijo) * 0.0002})` }}>
          {/* ventana con luz */}
          <div style={{ position: "absolute", left: 160, top: 160, width: 360, height: 420, background: "linear-gradient(#CFE3F5, #F6D7A8)", border: "14px solid #6A4A36" }}>
            <div style={{ position: "absolute", left: 166, top: 0, width: 14, height: "100%", background: "#6A4A36" }} />
          </div>
          {/* carteles de películas genéricos */}
          {[[700, 200, "#3A5A7A"], [920, 240, "#7A3A3A"]].map(([x, y, col], i) => (
            <div key={i} style={{ position: "absolute", left: x as number, top: y as number, width: 160, height: 220, background: col as string, border: "8px solid #EDE3D0", boxShadow: "0 8px 16px rgba(0,0,0,0.3)" }} />
          ))}
          {/* suelo de madera */}
          <div style={{ position: "absolute", left: 0, right: 0, top: SUELO_PISO, bottom: 0, background: "repeating-linear-gradient(90deg, #7A5638 0 180px, #6E4C30 180px 184px)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: SUELO_PISO, height: 6, background: "rgba(0,0,0,0.25)" }} />
          {/* lámpara de pie */}
          <div style={{ position: "absolute", left: 1720, top: 420, width: 10, height: SUELO_PISO - 420, background: "#3A2A20" }} />
          <div style={{ position: "absolute", left: 1670, top: 360, width: 110, height: 70, background: "#F2D29A", clipPath: "polygon(20% 0, 80% 0, 100% 100%, 0 100%)", boxShadow: "0 0 60px 20px rgba(255,214,150,0.5)" }} />
          <div style={{ position: "absolute", left: 1690, top: SUELO_PISO - 6, width: 70, height: 12, borderRadius: "50%", background: "rgba(0,0,0,0.3)" }} />
          {/* mesa con copa y cenicero (humo que sube) */}
          <div style={{ position: "absolute", left: 1320, top: SUELO_PISO - 200 }}>
            <Mesa ancho={300} alto={200} />
          </div>
          <div style={{ position: "absolute", left: 1380, top: SUELO_PISO - 200 - 60 }}>
            <Copa />
          </div>
          <div style={{ position: "absolute", left: 1490, top: SUELO_PISO - 212, width: 60, height: 12, borderRadius: "50%", background: "#5A5E66" }} />
          <div style={{ position: "absolute", left: 1500, top: SUELO_PISO - 216, width: 36, height: 4, background: "#EDE6D8" }} />
          <Humo x={1530} y={SUELO_PISO - 222} />
          {/* latas de película en el suelo */}
          {[
            [420, 0],
            [560, 0],
            [490, -18],
            [880, 0],
          ].map(([x, dy], i) => (
            <div key={i} style={{ position: "absolute", left: x, top: SUELO_PISO - 22 + dy }}>
              <LataPelicula />
            </div>
          ))}
          {/* Robert niño, sentado en el suelo */}
          <div style={{ position: "absolute", left: 640, top: topDePie(SUELO_PISO, 520) + (452 - 262) * (520 / 460) }}>
            <Robert alto={520} edad="nino" ropa="nino" vista="suelo" expresion={f > c.ocho ? "triste" : "neutral"} brazoIzq={{ hombro: 18, codo: -30 }} brazoDer={{ hombro: 18, codo: -30 }} />
          </div>
          {/* el padre filma con su cámara al hombro */}
          <div style={{ position: "absolute", left: 1060, top: topDePie(SUELO_PISO, 600), transform: "scaleX(-1)" }}>
            <SiluetaD alto={600} color="#2A2026" camara16 borde="#FFD9A0" brazoDer={{ hombro: 150, codo: -40 }} />
          </div>
          <AbsoluteFill style={{ background: `rgba(255,190,120,${0.12 * (1 - frio)})` }} />
          <AbsoluteFill style={{ background: `rgba(60,90,160,${0.28 * frio})`, mixBlendMode: "multiply" }} />
        </AbsoluteFill>
      </Plano>
      <Look />
    </AbsoluteFill>
  );
};
