import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useEscena } from "../comun/timeline";
import { Plano } from "../stallone/escenario";
import { D, interp, prog } from "./estilo";
import { HOMBRO_DER, Robert, SiluetaD, mezclar, resolverBrazo, topDePie } from "./Personajes";
import { ARMADURA_BASE, Armadura, CamaraTripode, Look } from "./props";
import { Efecto, Hud, Particulas } from "./ui";

const SUELO = 920;
const MESA_Y = 640;

export const Escena8: React.FC = () => {
  const f = useCurrentFrame();
  const { cue, dur } = useEscena("s8");
  const c = { problematico: cue("problemático"), favreau: cue("favreau"), nego: cue("negó"), insistio: cue("insistió"), prueba: cue("prueba"), bordo: cue("bordó"), anos: cue("años"), riesgo: cue("riesgo"), salio: cue("salió") };

  // A · el director golpea la mesa con la palma: la mano llega exactamente a la superficie
  const DA = 640;
  const dk = DA / 460;
  const dx = 1380;
  const dTop = topDePie(SUELO, DA);
  const objetivo: [number, number] = [(1250 - dx) / dk, (MESA_Y - 4 - dTop) / dk];
  const golpe = interp(f, [c.insistio - 10, c.insistio], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t });
  const brazoGolpe = mezclar({ hombro: 130, codo: -60 }, resolverBrazo(HOMBRO_DER[0], HOMBRO_DER[1], 1, objetivo[0], objetivo[1], false), golpe);
  const niega = f > c.nego - 6 && f < c.nego + 30 ? Math.sin(((f - c.nego + 6) / 36) * Math.PI * 4) * 5 : 0;

  // C · taller: Robert pone la mano en el pecho de la armadura
  const AA = 560;
  const ak = AA / 520;
  const ax = 1080;
  const aTop = SUELO - ARMADURA_BASE * ak;
  const RA = 600;
  const rk = RA / 460;
  const rx = 700;
  const rTop = topDePie(SUELO, RA);
  const pecho: [number, number] = [ax + 110 * ak, aTop + 170 * ak];
  const alcanza = prog(f, c.anos + 6, 20);
  const brazoPecho = mezclar({ hombro: 6, codo: 4 }, resolverBrazo(HOMBRO_DER[0], HOMBRO_DER[1], 1, (pecho[0] - rx) / rk, (pecho[1] - rTop) / rk, false), alcanza);
  // se pone la armadura: se deshace en luz, escaneo de pies a cabeza, casco y palma iluminada
  const T = c.salio - 6;
  const disolver = prog(f, T - 14, 18);
  const escaneo = prog(f, T, 36);
  const casco = prog(f, T + 34, 12);
  const brilloTraje = prog(f, T + 44, 10);
  const reposo = { hombro: 6, codo: 4 };
  const brazoFinal = f < T - 14 ? brazoPecho : f < T + 50 ? mezclar(brazoPecho, reposo, prog(f, T - 14, 14)) : mezclar(reposo, { hombro: 92, codo: -8 }, prog(f, T + 50, 14));
  const repulsor = prog(f, T + 60, 10);

  return (
    <AbsoluteFill style={{ background: D.negro }}>
      {/* A · sala de juntas */}
      <Plano desde={0} hasta={c.prueba}>
        <AbsoluteFill style={{ background: "linear-gradient(#9AA6B4, #74808E)" }} />
        <div style={{ position: "absolute", left: 160, top: 80, width: 1600, height: 420, background: "linear-gradient(#CFE2F2, #A8C4DE)", border: "12px solid #5A6470" }}>
          {[400, 800, 1200].map((x) => (
            <div key={x} style={{ position: "absolute", left: x, top: 0, width: 10, height: "100%", background: "#5A6470" }} />
          ))}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: SUELO, bottom: 0, background: "#4E5662" }} />
        {/* ejecutivos sentados tras la mesa (la mesa los tapa de cintura para abajo) */}
        {[360, 620, 880, 1140].map((x, i) => (
          <div key={x} style={{ position: "absolute", left: x, top: MESA_Y - 330 }}>
            <div style={{ transform: i === 1 ? `rotate(${niega}deg)` : undefined, transformOrigin: "50% 30%" }}>
              <SiluetaD alto={560} color="#1C222C" borde="#E6EEF8" sombra={false} />
            </div>
          </div>
        ))}
        {/* mesa larga */}
        <div style={{ position: "absolute", left: 200, top: MESA_Y, width: 1300, height: 26, background: "#3A2C24", borderRadius: 6 }} />
        <div style={{ position: "absolute", left: 220, top: MESA_Y + 26, width: 1260, height: SUELO - MESA_Y - 26, background: "linear-gradient(#4E3A2E, #3A2C22)" }} />
        <div style={{ position: "absolute", left: 210, top: SUELO - 8, width: 1280, height: 16, borderRadius: "50%", background: "rgba(0,0,0,0.3)" }} />
        {/* el director, de pie junto a la mesa */}
        <div style={{ position: "absolute", left: dx, top: dTop }}>
          <SiluetaD alto={DA} tipo="corpulento" gorra color="#161A22" borde="#F0D6A8" brazoDer={brazoGolpe} />
        </div>
        <Efecto archivo="mazo" en={c.insistio} vol={0.3} dur={20} />
      </Plano>

      {/* B · la prueba de cámara */}
      <Plano desde={c.prueba} hasta={c.anos}>
        <AbsoluteFill style={{ background: "linear-gradient(#5A6A80, #3E4A5C)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: SUELO, bottom: 0, background: "#33404E" }} />
        {/* ventana de control con ejecutivos que se inclinan */}
        <div style={{ position: "absolute", left: 1180, top: 90, width: 640, height: 300, background: "linear-gradient(#2A3444, #1E2632)", border: "10px solid #6A7684", overflow: "hidden" }}>
          {[60, 260, 460].map((x) => (
            <div key={x} style={{ position: "absolute", left: x, top: 60, transform: `rotate(${prog(f, c.bordo - 6, 18) * 10}deg)`, transformOrigin: "50% 100%" }}>
              <SiluetaD alto={400} color="#0E131A" borde="#9FB6D6" sombra={false} />
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 120, top: SUELO - 300 }}>
          <CamaraTripode />
        </div>
        <div style={{ position: "absolute", left: 640, top: topDePie(SUELO, 600) }}>
          <Robert alto={600} ropa="casual" expresion={f > c.bordo ? "sonrisa" : "decidido"} luz="#FFFFFF" />
        </div>
        {/* monitor de rodaje con su cara */}
        <div style={{ position: "absolute", left: 1300, top: 520, width: 360, height: 220, background: "#0E1218", border: "10px solid #2E3440", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 180 - 100 * (900 / 460), top: -20 }}>
            <Robert alto={900} ropa="casual" expresion={f > c.bordo ? "sonrisa" : "decidido"} sombra={false} />
          </div>
        </div>
        <div style={{ position: "absolute", left: 1470, top: 740, width: 20, height: SUELO - 740, background: "#2E3440" }} />
        <div style={{ position: "absolute", left: 1400, top: SUELO - 8, width: 160, height: 14, borderRadius: "50%", background: "rgba(0,0,0,0.3)" }} />
      </Plano>

      {/* C · taller: armadura GENÉRICA de acero gris; mano sobre el pecho; chispas con gravedad */}
      <Plano desde={c.anos} hasta={dur + 10}>
        <AbsoluteFill style={{ background: "linear-gradient(#6E7480, #4E545E)" }} />
        {/* estanterías y herramientas */}
        {[180, 360, 540].map((y) => (
          <div key={y} style={{ position: "absolute", left: 1500, top: y, width: 360, height: 16, background: "#3A3E46" }} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ position: "absolute", left: 1520 + i * 80, top: 120, width: 40, height: 60, background: ["#9A6A3A", "#5A7A9A", "#7A7A7A", "#A04A3A"][i] }} />
        ))}
        <div style={{ position: "absolute", left: 0, right: 0, top: SUELO, bottom: 0, background: "linear-gradient(#5E646E, #474C55)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: SUELO, height: 5, background: "rgba(0,0,0,0.3)" }} />
        <div style={{ position: "absolute", left: 600, top: 0, width: 900, height: SUELO, background: "linear-gradient(rgba(255,245,220,0.25), rgba(255,245,220,0.05))", clipPath: "polygon(40% 0, 60% 0, 100% 100%, 0 100%)" }} />
        <div style={{ position: "absolute", left: ax, top: aTop, opacity: 1 - disolver }}>
          <Armadura alto={AA} encendida={prog(f, c.riesgo - 4, 18)} />
        </div>
        <div style={{ position: "absolute", left: rx, top: rTop, opacity: escaneo >= 1 ? 0 : 1 }}>
          <Robert alto={RA} ropa="taller" expresion="decidido" brazoDer={brazoFinal} luz="#FFF4E2" />
        </div>
        {escaneo > 0 ? (
          <>
            <div style={{ position: "absolute", left: rx, top: rTop, clipPath: `inset(${(1 - escaneo) * 100}% -200% -5% -200%)` }}>
              <Robert alto={RA} ropa="armadura" casco={casco} brillo={brilloTraje} repulsor={repulsor} brazoDer={brazoFinal} luz="#9FDCFF" />
            </div>
            {escaneo < 1 ? <div style={{ position: "absolute", left: rx - 60, top: rTop + (1 - escaneo) * RA * 0.98, width: (200 * RA) / 460 + 120, height: 6, background: "#BFF0FF", boxShadow: "0 0 30px 10px rgba(140,220,255,0.8)" }} /> : null}
          </>
        ) : null}
        {/* partículas de luz que van del soporte a Robert */}
        {disolver > 0 && escaneo < 1
          ? new Array(26).fill(0).map((_, i) => {
              const t = Math.min(1, Math.max(0, (f - (T - 14) - i * 0.8) / 24));
              const sx = ax + 110 * ak + Math.sin(i) * 60;
              const sy = aTop + (i / 26) * AA;
              const ex = rx + 100 * rk;
              const ey = rTop + (0.2 + (i / 26) * 0.75) * RA;
              return <div key={i} style={{ position: "absolute", left: sx + (ex - sx) * t, top: sy + (ey - sy) * t - Math.sin(t * Math.PI) * 60, width: 8, height: 8, borderRadius: 4, background: "#CFF4FF", boxShadow: "0 0 10px #8CDCFF", opacity: t > 0 && t < 1 ? 1 : 0 }} />;
            })
          : null}
        <Hud x={rx + 100 * rk} y={rTop + 60 * rk} r={130} desde={T + 46} etiquetas={["SISTEMAS: OK", "ENERGÍA 100%"]} />
        <AbsoluteFill style={{ background: `rgba(200,240,255,${Math.max(0, 1 - Math.abs(f - (T + 62)) / 8) * 0.7})` }} />
        <Efecto archivo="chispas" en={T} vol={0.3} dur={40} />
        <Efecto archivo="flash" en={T + 60} vol={0.4} dur={20} />
        {/* haz de luz que barre la armadura y fogonazo al encenderse */}
        <div style={{ position: "absolute", left: ax - 120 + ((f - c.anos) * 6) % 600, top: aTop - 40, width: 60, height: AA + 40, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)", transform: "skewX(-14deg)" }} />
        <AbsoluteFill style={{ background: `radial-gradient(circle at ${(ax + 110 * ak) / 19.2}% ${(aTop + 60 * ak) / 10.8}%, rgba(160,220,255,${0.55 * Math.max(0, 1 - Math.abs(f - c.riesgo) / 12)}), transparent 45%)` }} />
        <Efecto archivo="flash" en={c.riesgo} vol={0.3} dur={20} />
        <Particulas desde={c.anos + 4} x={ax + 150} y={aTop + 300 * ak} ancho={60} suelo={SUELO} n={50} colores={["#FFE08A", "#FFB43A", "#FFF6D0"]} tam={8} apagar />
        <Efecto archivo="chispas" en={c.anos + 4} vol={0.25} dur={40} />
      </Plano>
      <Look />
    </AbsoluteFill>
  );
};
