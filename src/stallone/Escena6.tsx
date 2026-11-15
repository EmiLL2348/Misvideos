import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useEscena } from "../comun/timeline";
import { F_CIFRA, F_TITULO, P, clampI, miles, prog, rebote, interp } from "./estilo";
import { Capa, Cielo, Destello, Edificios, Pelicula, Plano, Sfx, Tics } from "./escenario";
import { Butkus, POSE, Sasha, Sly, topButkus, topPersona } from "./Personajes";

/** La fanfarria empieza 8 frames después de la voz; su acorde final cae 11,1 s después. */
export const FANFARRIA_RETRASO = 8;
export const FANFARRIA_GOLPE = Math.round(20 * (60 / 108) * 30);

const Filadelfia: React.FC<{ f: number; cam: { x: number; y: number; zoom: number }; dorado?: number }> = ({ f, cam, dorado = 0 }) => (
  <>
    <Capa cam={cam} prof={0.03}>
      <Cielo arriba="#2C3A5A" abajo="#F0A070" sol={{ x: 1300, y: 700, r: 90, color: "#FFD08A" }} />
    </Capa>
    <Capa cam={cam} prof={0.2}>
      <Edificios semilla={77} base={700} altoMin={200} altoMax={520} color="#4A4058" encendidas={0.08} />
    </Capa>
    <Capa cam={cam} prof={0.5}>
      {/* vías elevadas con tren */}
      <div style={{ position: "absolute", left: -400, width: 3200, top: 560, height: 30, background: "#2A2430" }} />
      {new Array(18).fill(0).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: -400 + i * 180, top: 590, width: 18, height: 300, background: "#2A2430" }} />
      ))}
      <div style={{ position: "absolute", left: -1200 + ((f * 9) % 4200), top: 488, display: "flex", gap: 8 }}>
        {[0, 1, 2, 3].map((k) => (
          <div key={k} style={{ width: 300, height: 74, background: "#6A5A4A", borderRadius: 8, position: "relative" }}>
            {[0, 1, 2, 3, 4].map((w) => (
              <div key={w} style={{ position: "absolute", left: 20 + w * 56, top: 14, width: 36, height: 26, background: "#F2C779", opacity: 0.8 }} />
            ))}
          </div>
        ))}
      </div>
    </Capa>
    <Capa cam={cam} prof={0.75}>
      {/* casas adosadas */}
      {new Array(14).fill(0).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: -400 + i * 230, top: 620, width: 226, height: 400, background: i % 2 ? "#8A3A2A" : "#7A3224" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 18, background: "#4A2018" }} />
          {[0, 1].map((r) =>
            [0, 1].map((col) => (
              <div key={`${r}${col}`} style={{ position: "absolute", left: 40 + col * 100, top: 50 + r * 120, width: 50, height: 74, background: "#2A2030", boxShadow: "inset 0 -10px 0 #EFE6D2" }} />
            ))
          )}
          <div style={{ position: "absolute", left: 88, top: 300, width: 50, height: 100, background: "#3A2018" }} />
          <div style={{ position: "absolute", left: 70, top: 380, width: 90, height: 20, background: "#C9C3B4" }} />
        </div>
      ))}
    </Capa>
    <Capa cam={cam} prof={1}>
      <div style={{ position: "absolute", left: -400, width: 3200, top: 960, height: 200, background: "linear-gradient(#3A3440, #24202A)" }} />
      <div style={{ position: "absolute", left: -400, width: 3200, top: 950, height: 16, background: "#E8EEF2" }} />
    </Capa>
    {dorado > 0 ? <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 70%, rgba(232,182,74,${0.55 * dorado}), rgba(232,182,74,${0.15 * dorado}) 60%)`, mixBlendMode: "screen" }} /> : null}
  </>
);

const Aliento: React.FC<{ x: number; y: number; f: number }> = ({ x, y, f }) => {
  const t = (f % 30) / 30;
  return <div style={{ position: "absolute", left: x + t * 70, top: y - t * 20, width: 40 + t * 70, height: 26 + t * 30, borderRadius: "50%", background: "rgba(255,255,255,0.5)", filter: "blur(8px)", opacity: 1 - t }} />;
};

export const Escena6: React.FC = () => {
  const f = useCurrentFrame();
  const { cue, dur, finVoz } = useEscena("s6");
  const c = {
    millon: cue("millón"),
    d28: cue("28"),
    cobro: cue("cobró"),
    ropa: cue("ropa"),
    sasha: cue("sasha"),
    fotos: cue("fotos"),
    recuperar: cue("recuperar"),
    costo: cue("costó"),
    d15000: cue("15.000"),
    pelicula: cue("película"),
  };
  const camA = { x: f * 1.2, y: 0, zoom: 1.02 };
  const diasIni = c.d28 - 6;
  const diasFin = Math.max(diasIni + 45, c.ropa - 10);
  const dias = Math.floor(interp(f, [diasIni, diasFin], [0, 28], clampI));
  const hucha = interp(f, [diasIni, diasFin], [1000000, 0], clampI);

  // reencuentro
  const llega = c.recuperar + 40;
  const xPerro = interp(f, [c.recuperar, llega], [1900, 900], clampI);
  const salta = f >= llega ? prog(f, llega, 10) : 0;
  const tumba = f >= llega + 6 ? prog(f, llega + 6, 14) : 0;

  // escalinata, sincronizada con la fanfarria (empieza al terminar la voz)
  const fan = finVoz + FANFARRIA_RETRASO;
  const golpeFinal = fan + FANFARRIA_GOLPE;
  const subir = interp(f, [fan, golpeFinal - 4], [0, 1]);
  const arriba = f >= golpeFinal - 4;
  const dorado = prog(f, golpeFinal - 2, 30);

  return (
    <AbsoluteFill style={{ background: P.negro }}>
      <Plano desde={0} hasta={c.ropa}>
        <Filadelfia f={f} cam={camA} />
        <div style={{ position: "absolute", left: interp(f, [0, c.ropa], [-200, 1500], clampI), top: 560 }}>
          <Sly vista="perfil" altura={420} correr={f / 4} expresion="decidido" />
        </div>
        <Aliento x={interp(f, [0, c.ropa], [-200, 1500], clampI) + 200} y={590} f={f} />
        {f >= c.millon - 6 ? (
          <div style={{ position: "absolute", left: 120, top: 110, display: "flex", gap: 40, alignItems: "flex-start", opacity: prog(f, c.millon - 6, 12) }}>
            <div style={{ background: "rgba(13,11,10,0.8)", padding: "24px 34px", borderRadius: 24, border: `4px solid ${P.ocre}` }}>
              <div style={{ fontFamily: F_TITULO, fontWeight: 900, fontSize: 34, color: P.ocre, letterSpacing: 3 }}>PRESUPUESTO</div>
              <div style={{ fontFamily: F_CIFRA, fontWeight: 800, fontSize: 84, color: hucha < 250000 ? P.ladrillo : P.crema }}>${miles(hucha)}</div>
              <div style={{ height: 22, borderRadius: 11, background: "#3A2A1E", marginTop: 8 }}>
                <div style={{ width: `${(hucha / 1000000) * 100}%`, height: "100%", borderRadius: 11, background: P.dorado }} />
              </div>
            </div>
            {f >= diasIni ? (
              <div style={{ background: "#F2EAD6", padding: 18, borderRadius: 18, boxShadow: "0 16px 30px rgba(0,0,0,0.5)", opacity: prog(f, diasIni, 10) }}>
                <div style={{ fontFamily: F_TITULO, fontWeight: 900, fontSize: 30, color: P.ladrillo, textAlign: "center", marginBottom: 8 }}>28 DÍAS DE RODAJE</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 54px)", gap: 6 }}>
                  {new Array(28).fill(0).map((_, i) => (
                    <div key={i} style={{ height: 50, background: "#FFF", border: "2px solid #C9B88F", fontFamily: F_CIFRA, fontWeight: 700, fontSize: 22, color: P.tinta, display: "grid", placeItems: "center", position: "relative" }}>
                      {i + 1}
                      {i < dias ? <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: P.ladrillo, fontSize: 44, fontWeight: 900 }}>✕</div> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
        <Tics desde={diasIni} pasos={28} cada={(diasFin - diasIni) / 28} vol={0.18} />
        {f >= c.cobro ? (
          <div style={{ position: "absolute", right: 120, top: 120, padding: "16px 30px", background: P.dorado, color: P.tinta, fontFamily: F_TITULO, fontWeight: 900, fontSize: 40, borderRadius: 14, transform: `rotate(4deg) scale(${rebote(f, c.cobro)})` }}>
            SUELDO BAJO + % DE TAQUILLA
          </div>
        ) : null}
      </Plano>

      {/* B · montaje: ropa y fotos */}
      <Plano desde={c.ropa} hasta={c.recuperar}>
        <AbsoluteFill style={{ flexDirection: "row" }}>
          <div style={{ flex: 1, background: "linear-gradient(#4A3428, #2A1C14)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 60, top: 40, fontFamily: F_TITULO, fontWeight: 900, fontSize: 44, color: P.crema }}>SU PROPIA ROPA</div>
            <div style={{ position: "absolute", left: 90, top: 200, width: 280, height: 640, background: "#6B4630", border: "10px solid #4A2C1A" }}>
              <div style={{ position: "absolute", left: 20, right: 20, top: 40, height: 8, background: "#9A9A9A" }} />
            </div>
            <div style={{ position: "absolute", left: 560, top: 200, width: 300, height: 620 }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 30, height: 10, background: "#9A9A9A" }} />
              <div style={{ position: "absolute", left: 0, top: 0, padding: "4px 12px", background: P.crema, fontFamily: F_CIFRA, fontWeight: 800, fontSize: 24, color: P.tinta }}>VESTUARIO</div>
              {[0, 1].map((k) => (
                <div key={k} style={{ position: "absolute", left: 20 + k * 30, top: 140, width: 6, height: 500, background: "#5A5A5A" }} />
              ))}
            </div>
            {(() => {
              const p = prog(f, c.ropa + 6, 30);
              const x = interp(p, [0, 1], [130, 610]);
              const y = 250 - Math.sin(p * Math.PI) * 120;
              return (
                <svg viewBox="0 0 200 260" width={200} height={260} style={{ position: "absolute", left: x, top: y }}>
                  <path d="M60 10 Q100 0 140 10 L180 40 L170 250 L30 250 L20 40 Z" fill={P.cuero} />
                  <path d="M80 10 L100 80 L120 10" fill="#E7DCC8" />
                  <path d="M100 0 L100 -20 Q100 -34 112 -30" stroke="#9A9A9A" strokeWidth={6} fill="none" />
                </svg>
              );
            })()}
          </div>
          <div style={{ width: 8, background: P.crema }} />
          <div style={{ flex: 1, background: "linear-gradient(#3A4A62, #1C2A44)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 60, top: 40, fontFamily: F_TITULO, fontWeight: 900, fontSize: 44, color: P.crema }}>SASHA, LA FOTÓGRAFA</div>
            <div style={{ position: "absolute", left: 300, top: 220 }}>
              <Sasha altura={620} foto={prog(f, c.sasha - 10, 12)} />
            </div>
            {f >= c.fotos ? (
              <div style={{ position: "absolute", left: 60, top: 640, width: 220, height: 260, background: "#F2EEE6", padding: 12, transform: `rotate(-8deg) translateY(${(1 - prog(f, c.fotos + 4, 16)) * 200}px)`, boxShadow: "0 12px 26px rgba(0,0,0,0.5)" }}>
                <div style={{ width: "100%", height: 190, background: "#C8B494", overflow: "hidden", position: "relative" }}>
                  <div style={{ position: "absolute", left: 30, top: 14 }}>
                    <Sly altura={360} expresion="decidido" />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </AbsoluteFill>
        <Destello en={c.fotos} />
        <Sfx archivo="audio/stallone/clic.mp3" en={c.fotos - 1} vol={0.8} dur={12} />
      </Plano>

      {/* C · reencuentro con Butkus */}
      <Plano desde={c.recuperar} hasta={c.pelicula}>
        <Filadelfia f={f} cam={{ x: 300, y: 0, zoom: 1.08 }} />
        <div style={{ position: "absolute", left: 620, top: topPersona(960, 520), transform: `rotate(${-tumba * 28}deg)`, transformOrigin: "40% 94%" }}>
          <Sly altura={520} expresion="euforico" brazoIzq={POSE.abrazo.izq} brazoDer={POSE.abrazo.der} />
        </div>
        <div style={{ position: "absolute", left: xPerro - 150, top: topButkus(960, 460) - salta * 120, transform: "scaleX(-1)" }}>
          <Butkus ancho={460} andar={f < llega ? f / 6 : undefined} saltar={salta} />
        </div>
        {f >= c.costo - 4 ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 90, textAlign: "center", fontFamily: F_CIFRA, fontWeight: 800, fontSize: 120, color: P.crema, textShadow: "0 8px 30px rgba(0,0,0,0.7)", transform: `scale(${0.7 + 0.3 * rebote(f, c.costo - 4)})` }}>
            $40 <span style={{ color: P.ocre }}>→</span> <span style={{ color: P.dorado }}>${miles(interp(f, [c.costo, c.d15000 + 10], [40, 15000], clampI))}</span>
          </div>
        ) : null}
        <Tics desde={c.costo} pasos={6} cada={Math.max(3, (c.d15000 + 10 - c.costo) / 6)} vol={0.25} />
      </Plano>

      {/* D · la escalinata al amanecer */}
      <Plano desde={c.pelicula} hasta={dur + 10}>
        <AbsoluteFill style={{ background: "linear-gradient(#2C3A5A, #F2A86A 70%, #FFD08A)" }} />
        <div style={{ position: "absolute", left: 1300 - 110, top: 160, width: 220, height: 220, borderRadius: "50%", background: "#FFE2A0", boxShadow: "0 0 140px 60px rgba(255,210,140,0.6)", opacity: 0.6 + 0.4 * dorado }} />
        {/* edificio del museo */}
        <div style={{ position: "absolute", left: 360, top: 120, width: 1200, height: 340 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 0, borderLeft: "600px solid transparent", borderRight: "600px solid transparent", borderBottom: "90px solid #8A7A6A" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 90, height: 30, background: "#9A8A7A" }} />
          {new Array(9).fill(0).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: 40 + i * 136, top: 120, width: 50, height: 220, background: "#A8988A" }} />
          ))}
        </div>
        {/* plaza a los lados de la escalinata */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 460, bottom: 0, background: "linear-gradient(#A89480, #6E5E4E)" }} />
        {/* escalinata con proporción natural y muros laterales */}
        {new Array(16).fill(0).map((_, i) => {
          const y = 460 + i * 40;
          const w = 1080 + i * 30;
          return (
            <div key={i}>
              <div style={{ position: "absolute", left: 960 - w / 2, top: y, width: w, height: 40, background: i % 2 ? "#B4A493" : "#C4B4A2", borderTop: "3px solid #D8C8B4" }} />
              <div style={{ position: "absolute", left: 960 - w / 2 - 60, top: y, width: 60, height: 40, background: "#8E7C68" }} />
              <div style={{ position: "absolute", left: 960 + w / 2, top: y, width: 60, height: 40, background: "#8E7C68" }} />
            </div>
          );
        })}
        <AbsoluteFill style={{ background: `rgba(232,182,74,${0.35 * dorado})`, mixBlendMode: "screen" }} />
        {f >= golpeFinal - 2 ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 60, textAlign: "center", fontFamily: F_TITULO, fontWeight: 900, fontSize: 64, color: P.crema, letterSpacing: 8, opacity: prog(f, golpeFinal + 6, 20), textShadow: `0 0 40px ${P.dorado}` }}>
            FILADELFIA · 1976
          </div>
        ) : null}
        {(() => {
          // los pies van siempre sobre un escalón: de la base (y≈1040) al rellano superior (y≈470)
          const pies = interp(subir, [0, 1], [1040, 470]);
          const esc = interp(subir, [0, 1], [1, 0.46]);
          const y = pies - (390 / 420) * 460 * esc;
          return (
            <>
              <div style={{ position: "absolute", left: 960 - 120 * esc, top: y, transform: `scale(${esc})`, transformOrigin: "50% 0%" }}>
                <Sly vista="espalda" altura={460} brazoIzq={arriba ? POSE.arriba.izq : { hombro: 9 + Math.sin(f / 3) * 6, codo: -22 }} brazoDer={arriba ? POSE.arriba.der : { hombro: 9 - Math.sin(f / 3) * 6, codo: -22 }} luz={P.dorado} style={{ transform: `translateY(${arriba ? 0 : Math.abs(Math.sin(f / 3)) * -10}px)` }} />
              </div>
              <div style={{ position: "absolute", left: 960 + 70 * esc, top: pies - 181 * esc, transform: `scale(${esc})`, transformOrigin: "0 0" }}>
                <Butkus ancho={300} andar={arriba ? undefined : f / 3} sentado={arriba} />
              </div>
            </>
          );
        })()}
      </Plano>
      <Pelicula vineta={0.75} tinte="rgba(255,220,180,0.12)" />
    </AbsoluteFill>
  );
};
