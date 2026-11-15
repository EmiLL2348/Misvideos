import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { useEscena } from "../comun/timeline";
import { F_CIFRA, F_TITULO, P, clampI, prog, rebote, interp } from "./estilo";
import { Billete, Edificios, Lluvia, Neon, Pelicula, Plano } from "./escenario";
import { Butkus, POSE, Sasha, Silueta, Sly, escalaPersonaje, manoPerfil, mezclar, topButkus, topPersona } from "./Personajes";

const Piso: React.FC<{ f: number }> = ({ f }) => {
  const fallo = (f % 53 > 47 && f % 2 === 0) || f % 131 === 7;
  const luz = fallo ? 0.25 : 1;
  return (
    <>
      <AbsoluteFill style={{ background: "#22202A" }} />
      {/* manchas de humedad */}
      {[
        [180, 120, 260, 180],
        [1500, 60, 300, 220],
        [1250, 420, 160, 120],
      ].map(([x, y, w, h], i) => (
        <div key={i} style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: "50%", background: "rgba(90,110,70,0.25)", filter: "blur(18px)" }} />
      ))}
      {/* ventana con lluvia y neón */}
      <div style={{ position: "absolute", left: 120, top: 200, width: 380, height: 420, background: "#0E1424", border: "16px solid #3A2C22", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: -200, top: 0 }}>
          <Edificios semilla={5} base={420} altoMin={200} altoMax={380} color="#121A2C" colorVentana="#E9B85A" encendidas={0.25} ancho={900} desde={0} anchoMin={90} anchoMax={160} azotea={false} />
        </div>
        <div style={{ position: "absolute", left: 200, top: 250, fontFamily: F_TITULO, fontWeight: 900, fontSize: 40, color: "#FFE3EE", textShadow: `0 0 12px ${P.neon}, 0 0 30px ${P.neon}`, opacity: fallo ? 0.2 : 1 }}>HOTEL</div>
        <AbsoluteFill style={{ background: `rgba(255,79,139,${0.12 + 0.05 * Math.sin(f / 9)})` }} />
        <div style={{ position: "absolute", left: 174, top: 0, width: 16, height: 420, background: "#3A2C22" }} />
        <div style={{ position: "absolute", left: 0, top: 200, width: 380, height: 16, background: "#3A2C22" }} />
        <svg width={380} height={420} style={{ position: "absolute", inset: 0 }}>
          {new Array(40).fill(0).map((_, i) => {
            const y = ((f * (14 + (i % 4) * 3) + i * 97) % 480) - 40;
            return <line key={i} x1={(i * 37) % 380} y1={y} x2={(i * 37) % 380 - 4} y2={y + 26} stroke="#B9C6DA" strokeWidth={2} opacity={0.5} />;
          })}
        </svg>
      </div>
      {/* bombilla */}
      <div style={{ position: "absolute", left: 958, top: 0, width: 4, height: 150, background: "#111" }} />
      <div style={{ position: "absolute", left: 940, top: 146, width: 40, height: 50, borderRadius: "50% 50% 45% 45%", background: fallo ? "#6A6050" : "#FFF1C2", boxShadow: fallo ? "none" : "0 0 50px 20px rgba(255,220,150,0.6)" }} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 18%, rgba(255,214,140,${0.32 * luz}) 0%, transparent 55%)` }} />
      {/* nevera abierta y vacía */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 870, bottom: 0, background: "linear-gradient(#2E2A30, #1A171C)" }} />
      <div style={{ position: "absolute", left: 1500, top: 320, width: 260, height: 560, background: "#D9D4C6", borderRadius: 16 }}>
        <div style={{ position: "absolute", left: 18, top: 18, right: 18, bottom: 18, background: "#F4F1E4", boxShadow: "inset 0 0 60px rgba(200,230,255,0.9)" }}>
          {[140, 280, 400].map((y) => (
            <div key={y} style={{ position: "absolute", left: 0, right: 0, top: y, height: 6, background: "#B9C2C8" }} />
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 1760, top: 330, width: 120, height: 540, background: "#C9C3B4", borderRadius: "0 16px 16px 0", transform: "skewY(8deg)" }} />
      <div style={{ position: "absolute", left: 1420, top: 330, width: 500, height: 560, background: "radial-gradient(ellipse at 30% 50%, rgba(200,230,255,0.25), transparent 60%)" }} />
    </>
  );
};

export const Escena3: React.FC = () => {
  const f = useCurrentFrame();
  const { cue, dur, finVoz } = useEscena("s3");
  const c = { alquiler: cue("alquiler"), ya: cue("ya"), sasha: cue("sasha"), butkus: cue("butkus"), invierno: cue("invierno"), vendio: cue("vendió"), d40: cue("40") };

  // Plano B: venta en la licorería. Todos pisan la misma línea de suelo.
  const SUELO = 915;
  const altoP = 560;
  const kP = escalaPersonaje(altoP);
  const anchoPerro = 380;
  const kPerro = anchoPerro / 320;
  const entrega = prog(f, c.vendio - 6, 14);
  const marcha = Math.max(0, f - c.vendio - 16);
  const xSly = 470;
  const xDesconocido = 1120 + marcha * 3.2;
  const xPerro = 740 + marcha * 3.2;
  // Sly sujeta la correa con el brazo hacia el perro y luego la tiende al comprador
  const brazoSly = mezclar({ hombro: 38, codo: 22 }, { hombro: 72, codo: 6 }, entrega);
  const [hx, hy] = manoPerfil(brazoSly);
  const manoSly: [number, number] = [xSly + hx * kP, topPersona(SUELO, altoP) + hy * kP];
  const manoDesc: [number, number] = [xDesconocido + 44 * kP, topPersona(SUELO, altoP) + 250 * kP];
  const collar: [number, number] = [xPerro + 202 * kPerro, topButkus(SUELO, anchoPerro) + 104 * kPerro];
  const pasada = interp(f, [c.vendio + 2, c.vendio + 12], [0, 1]);
  const manoCorrea: [number, number] = [manoSly[0] + (manoDesc[0] - manoSly[0]) * pasada, manoSly[1] + (manoDesc[1] - manoSly[1]) * pasada];
  // Plano C
  const cCara = c.d40 + 46;
  const negro = interp(f, [finVoz + 8, finVoz + 14], [0, 1], clampI);
  const volLluvia = (fr: number) => (fr < c.invierno ? 0.12 : fr < cCara ? 0.42 : 0.5) * interp(fr, [dur - 12, dur], [1, 0], clampI);

  return (
    <AbsoluteFill style={{ background: P.negro }}>
      <Audio src={staticFile("audio/stallone/lluvia.mp3")} loop volume={volLluvia} />
      {/* A0 · aviso en la puerta */}
      <Plano desde={0} hasta={c.ya}>
        <AbsoluteFill style={{ background: "linear-gradient(90deg, #3A2A22, #4A3428)" }} />
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${1 + f * 0.0015})` }}>
          <div style={{ width: 900, height: 1200, background: "linear-gradient(90deg, #6B4630, #5A3825)", boxShadow: "inset 0 0 0 20px #4A2C1A", position: "relative" }}>
            <div style={{ position: "absolute", left: 230, top: 200, width: 440, height: 520, background: "#EFE6D2", transform: "rotate(-2deg)", padding: 30, boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>
              <div style={{ fontFamily: F_TITULO, fontWeight: 900, fontSize: 52, color: P.tinta }}>AVISO</div>
              <div style={{ fontFamily: F_CIFRA, fontWeight: 600, fontSize: 28, color: "#5A4A3A", marginTop: 14, lineHeight: 1.4 }}>
                Alquiler impagado.
                <br />
                Desaloje la vivienda.
              </div>
              {f >= c.alquiler ? (
                <div style={{ position: "absolute", left: 60, top: 300, border: `8px solid ${P.ladrillo}`, color: P.ladrillo, fontFamily: F_TITULO, fontWeight: 900, fontSize: 60, padding: "0 20px", transform: `rotate(-14deg) scale(${2 - rebote(f, c.alquiler, 30, 10)})` }}>
                  DESALOJO
                </div>
              ) : null}
            </div>
            <div style={{ position: "absolute", right: 70, top: 640, width: 34, height: 34, borderRadius: 17, background: P.dorado }} />
          </div>
        </AbsoluteFill>
      </Plano>

      {/* A1 · el piso diminuto */}
      <Plano desde={c.ya} hasta={c.invierno}>
        <AbsoluteFill style={{ transform: `scale(${1.04 - (f - c.ya) * 0.0002})` }}>
          <Piso f={f} />
          <div style={{ position: "absolute", left: 600, top: 420 }}>
            <Sly altura={520} expresion="cansado" sinPiernas brazoIzq={POSE.mesa.izq} brazoDer={POSE.mesa.der} />
          </div>
          {f >= c.sasha - 10 ? (
            <div style={{ position: "absolute", left: 1010, top: 432, opacity: prog(f, c.sasha - 10, 14) }}>
              <Sasha altura={500} expresion="triste" sinPiernas />
            </div>
          ) : null}
          {/* mesa con una sola lata */}
          <div style={{ position: "absolute", left: 480, top: 700, width: 860, height: 30, background: "#6B4630", borderRadius: 6 }} />
          <div style={{ position: "absolute", left: 520, top: 730, width: 780, height: 150, background: "#4E3222" }} />
          {[540, 1250].map((x) => (
            <div key={x} style={{ position: "absolute", left: x, top: 880, width: 30, height: 12, background: "rgba(0,0,0,0.35)", borderRadius: "50%" }} />
          ))}
          <div style={{ position: "absolute", left: 880, top: 640, width: 60, height: 66, borderRadius: 8, background: "linear-gradient(90deg, #9AA3A8, #DDE3E6, #8A9398)" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 18, height: 26, background: P.ladrillo }} />
          </div>
          {[830, 970].map((x) => (
            <div key={x} style={{ position: "absolute", left: x, top: 676, width: 16, height: 30, background: "#B9C2C8", borderRadius: 4 }} />
          ))}
          {/* Butkus apoya la cabeza */}
          {f >= c.butkus - 40 ? (
            <div
              style={{
                position: "absolute",
                left: interp(f, [c.butkus - 40, c.butkus + 10], [1900, 80], clampI),
                top: 640,
                // mientras camina hacia la izquierda mira hacia la izquierda; al llegar se gira hacia Sly
                transform: f < c.butkus + 12 ? "scaleX(-1)" : "none",
              }}
            >
              <Butkus ancho={400} andar={f < c.butkus + 10 ? f / 4 : undefined} sentado={f >= c.butkus + 12} cabeza={f > c.butkus + 12 ? -16 + Math.sin(f / 30) * 2 : 0} />
            </div>
          ) : null}
          {f >= c.butkus ? (
            <div style={{ position: "absolute", left: 120, top: 560, fontFamily: F_TITULO, fontWeight: 900, fontSize: 54, color: P.dorado, opacity: Math.min(prog(f, c.butkus + 6, 12), 1 - prog(f, c.butkus + 80, 14)), textShadow: "0 4px 18px rgba(0,0,0,0.8)" }}>
              BUTKUS
            </div>
          ) : null}
        </AbsoluteFill>
      </Plano>

      {/* B · la licorería bajo la lluvia */}
      <Plano desde={c.invierno} hasta={c.d40}>
        <AbsoluteFill style={{ background: "#0C1020", transform: `scale(${1 + (f - c.invierno) * 0.0004})` }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 880, background: "repeating-linear-gradient(#5A2A20 0 22px, #4A221A 22px 26px)" }} />
          <div style={{ position: "absolute", left: 900, top: 340, width: 760, height: 540, background: "#1A1210", border: "14px solid #2A1C12" }}>
            <div style={{ position: "absolute", left: 30, top: 40, width: 420, height: 300, background: "linear-gradient(#E9B85A, #B9783A)", opacity: 0.85 }}>
              {new Array(4).fill(0).map((_, i) => (
                <div key={i} style={{ position: "absolute", left: 30 + i * 96, top: 120, width: 34, height: 140, borderRadius: "14px 14px 4px 4px", background: ["#3A5A3A", "#6A2A1A", "#2A3A5A", "#5A4A1A"][i] }} />
              ))}
            </div>
            <div style={{ position: "absolute", left: 500, top: 40, width: 200, height: 500, background: "#2A1C12" }} />
          </div>
          <div style={{ position: "absolute", left: 960, top: 190 }}>
            <Neon texto="LICORES" tam={110} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 880, bottom: 0, background: "linear-gradient(#1A1418, #0A080A)" }} />
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at 66% 30%, rgba(255,79,139,0.25), transparent 55%)" }} />
          <div style={{ position: "absolute", left: 980, top: 900, width: 600, height: 140, background: "radial-gradient(ellipse, rgba(255,79,139,0.3), transparent 70%)", filter: "blur(10px)" }} />
          {/* correa: de la mano que la sujeta al collar de Butkus */}
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <path
              d={`M${manoCorrea[0]} ${manoCorrea[1]} Q${(manoCorrea[0] + collar[0]) / 2} ${Math.max(manoCorrea[1], collar[1]) + 40} ${collar[0]} ${collar[1]}`}
              stroke="#8A2A1A"
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <div style={{ position: "absolute", left: xSly, top: topPersona(SUELO, altoP) }}>
            <Sly vista="perfil" altura={altoP} expresion="triste" brazoPerfil={f < c.vendio + 14 ? brazoSly : undefined} />
          </div>
          <div style={{ position: "absolute", left: xPerro, top: topButkus(SUELO, anchoPerro) }}>
            <Butkus ancho={anchoPerro} andar={f > c.vendio + 16 ? f / 5 : undefined} cabeza={f > c.vendio + 16 ? 14 : 0} />
          </div>
          <div style={{ position: "absolute", left: xDesconocido, top: topPersona(SUELO, altoP) }}>
            <Silueta altura={altoP} sombrero color="#0A0809" borde={P.neon} />
          </div>
          <Lluvia densidad={190} opacidad={0.5} />
        </AbsoluteFill>
      </Plano>

      {/* C · los 40 dólares y la cara bajo la lluvia */}
      <Plano desde={c.d40} hasta={cCara}>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 60%, #3A2A30, #0A080A 70%)", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "relative", width: 900, height: 600, transform: `scale(${1 + (f - c.d40) * 0.003})` }}>
            <div style={{ position: "absolute", left: 120, top: 300, width: 700, height: 280, borderRadius: "140px 140px 120px 120px", background: P.piel }} />
            <div style={{ position: "absolute", left: 60, top: 330, width: 130, height: 90, borderRadius: 50, background: P.pielSombra, transform: "rotate(-25deg)" }} />
            <Billete valor="$20" ancho={380} rot={-12} style={{ position: "absolute", left: 20, top: 200 }} />
            <Billete valor="$20" ancho={380} rot={8} style={{ position: "absolute", left: 500, top: 215 }} />
            <div style={{ position: "absolute", left: 320, top: 20, fontFamily: F_CIFRA, fontWeight: 800, fontSize: 140, color: P.crema, opacity: prog(f, c.d40 + 4, 12), textShadow: "0 8px 30px rgba(0,0,0,0.8)" }}>$40</div>
          </div>
          <Lluvia densidad={120} opacidad={0.35} />
        </AbsoluteFill>
      </Plano>
      <Plano desde={cCara} hasta={dur + 10}>
        <AbsoluteFill style={{ background: "#0E0C14", alignItems: "center", justifyContent: "flex-start", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 960 - 760 * 1.0, top: -190, transform: `scale(${1 + (f - cCara) * 0.0016})`, transformOrigin: "50% 30%" }}>
            <Sly altura={3200} expresion="triste" luz={P.neon} />
          </div>
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at 70% 30%, rgba(255,79,139,0.22), transparent 60%)" }} />
          <Lluvia densidad={220} opacidad={0.55} viento={0.15} />
        </AbsoluteFill>
      </Plano>
      <Pelicula vineta={0.85} tinte="rgba(150,170,220,0.15)" />
      <AbsoluteFill style={{ background: "#000", opacity: negro, zIndex: 45 }} />
    </AbsoluteFill>
  );
};
