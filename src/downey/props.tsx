import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { D } from "./estilo";

/*
 * Utilería. Cada objeto apoyado documenta su BASE (y del SVG donde toca la
 * superficie) y dibuja su propia sombra de contacto. Para colocarlo con la
 * base en `suelo`: top = suelo - BASE * escala.
 */
export const sombra = (cx: number, cy: number, rx: number, ry = 7, op = 0.3) => <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`rgba(0,0,0,${op})`} />;
export const topSobre = (suelo: number, base: number, escala: number) => suelo - base * escala;

/** Look limpio: viñeteado mínimo, sin grano (regla 5). */
export const Look: React.FC<{ tinte?: string; vineta?: number }> = ({ tinte, vineta = 0.18 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", zIndex: 40 }}>
    {tinte ? <AbsoluteFill style={{ background: tinte, mixBlendMode: "soft-light" }} /> : null}
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,${vineta}) 100%)` }} />
  </AbsoluteFill>
);

/* ---------------- Vehículos (genéricos, sin marcas) ---------------- */
export const COCHE_BASE = 196;
export const CocheDeportivo: React.FC<{ ancho?: number; color?: string; reflejo?: string; mirarIzq?: boolean }> = ({ ancho = 600, color = "#8C96A3", reflejo, mirarIzq }) => (
  <svg viewBox="0 0 600 200" width={ancho} height={(ancho * 200) / 600} style={{ overflow: "visible", transform: mirarIzq ? "scaleX(-1)" : undefined }}>
    {sombra(300, COCHE_BASE, 270, 9, 0.4)}
    <path d="M40 150 Q42 112 110 104 L200 96 Q250 58 330 58 Q400 60 450 96 L540 108 Q582 116 580 150 L578 168 L42 168 Z" fill={color} />
    <path d="M222 98 Q262 70 330 70 Q382 72 420 98 Z" fill="#2B3644" />
    <line x1={320} y1={70} x2={318} y2={98} stroke={color} strokeWidth={6} />
    <path d="M60 128 L560 128" stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
    <rect x={540} y={120} width={30} height={12} rx={4} fill="#FFE9B0" />
    <rect x={40} y={124} width={22} height={12} rx={4} fill="#C0392B" />
    {reflejo ? <path d="M120 108 L520 112 L520 140 L80 136 Z" fill={reflejo} opacity={0.35} /> : null}
    {[140, 470].map((x) => (
      <g key={x}>
        <circle cx={x} cy={160} r={36} fill="#16191E" />
        <circle cx={x} cy={160} r={18} fill="#A0A8B2" />
      </g>
    ))}
  </svg>
);

export const CochePolicia: React.FC<{ ancho?: number; fase: number }> = ({ ancho = 620, fase }) => {
  const rojo = Math.sin(fase) > 0;
  return (
    <svg viewBox="0 0 620 220" width={ancho} height={(ancho * 220) / 620} style={{ overflow: "visible" }}>
      {sombra(310, 216, 280, 9, 0.4)}
      <path d="M30 170 Q30 128 90 120 L170 116 Q210 74 300 74 Q392 74 440 116 L560 122 Q596 128 596 170 L594 188 L32 188 Z" fill="#E9EDF2" />
      <path d="M30 150 L596 150 L594 188 L32 188 Z" fill="#1F2A38" />
      <path d="M196 116 Q232 86 300 86 Q370 86 410 116 Z" fill="#2B3644" />
      <rect x={250} y={56} width={110} height={18} rx={6} fill="#2A2A2A" />
      <rect x={254} y={58} width={50} height={14} rx={4} fill={rojo ? D.sirena : "#5A1E1E"} />
      <rect x={306} y={58} width={50} height={14} rx={4} fill={!rojo ? D.sirenaAzul : "#1E2A5A"} />
      <circle cx={280} cy={64} r={rojo ? 60 : 0} fill={D.sirena} opacity={0.18} />
      <circle cx={330} cy={64} r={!rojo ? 60 : 0} fill={D.sirenaAzul} opacity={0.18} />
      {[140, 490].map((x) => (
        <g key={x}>
          <circle cx={x} cy={180} r={36} fill="#16191E" />
          <circle cx={x} cy={180} r={18} fill="#A0A8B2" />
        </g>
      ))}
    </svg>
  );
};

export const TAXI_BASE = 206;
export const Taxi: React.FC<{ ancho?: number }> = ({ ancho = 420 }) => (
  <svg viewBox="0 0 520 210" width={ancho} height={(ancho * 210) / 520} style={{ overflow: "visible" }}>
    {sombra(260, TAXI_BASE, 230, 8, 0.35)}
    <path d="M24 160 Q24 120 80 112 L140 108 Q170 60 260 60 Q350 60 380 108 L450 114 Q500 122 498 160 L496 178 L26 178 Z" fill="#F2C230" />
    <path d="M160 108 Q186 72 260 72 Q334 72 360 108 Z" fill="#33414F" />
    <line x1={260} y1={72} x2={260} y2={108} stroke="#F2C230" strokeWidth={6} />
    <path d="M30 140 L494 140" stroke="#2A2A2A" strokeWidth={6} strokeDasharray="14 10" />
    <rect x={232} y={46} width={56} height={14} rx={4} fill="#FFF4C8" />
    {[120, 400].map((x) => (
      <g key={x}>
        <circle cx={x} cy={172} r={32} fill="#16191E" />
        <circle cx={x} cy={172} r={15} fill="#A0A8B2" />
      </g>
    ))}
  </svg>
);

/* ---------------- Muebles y objetos ---------------- */
/** Mesa vista de frente. La superficie superior queda en y=0 y las patas tocan y=alto. */
export const Mesa: React.FC<{ ancho: number; alto: number; color?: string; tablero?: string }> = ({ ancho, alto, color = "#6B4A34", tablero = "#7E5A40" }) => (
  <svg width={ancho} height={alto} style={{ overflow: "visible", position: "absolute" }}>
    {sombra(ancho / 2, alto, ancho * 0.5, 8, 0.3)}
    <rect x={0} y={0} width={ancho} height={18} rx={4} fill={tablero} />
    <rect x={0} y={14} width={ancho} height={6} fill="rgba(0,0,0,0.2)" />
    <rect x={20} y={18} width={16} height={alto - 18} fill={color} />
    <rect x={ancho - 36} y={18} width={16} height={alto - 18} fill={color} />
  </svg>
);

/** Copa: base en y=60. */
export const Copa: React.FC = () => (
  <svg viewBox="0 0 40 62" width={40} height={62} style={{ overflow: "visible" }}>
    <ellipse cx={20} cy={60} rx={14} ry={3} fill="rgba(0,0,0,0.3)" />
    <path d="M6 2 L34 2 Q34 26 20 30 Q6 26 6 2 Z" fill="rgba(240,240,255,0.35)" stroke="#E6E9F0" strokeWidth={2} />
    <path d="M8 14 L32 14 Q30 26 20 28 Q10 26 8 14 Z" fill="#B8742E" opacity={0.85} />
    <line x1={20} y1={30} x2={20} y2={56} stroke="#E6E9F0" strokeWidth={3} />
    <ellipse cx={20} cy={58} rx={11} ry={3} fill="#E6E9F0" />
  </svg>
);

/** Lata de película (tumbada): base en y=22. */
export const LataPelicula: React.FC<{ ancho?: number }> = ({ ancho = 110 }) => (
  <svg viewBox="0 0 110 26" width={ancho} height={(ancho * 26) / 110} style={{ overflow: "visible" }}>
    <ellipse cx={55} cy={22} rx={52} ry={5} fill="rgba(0,0,0,0.3)" />
    <rect x={4} y={8} width={102} height={12} fill="#7C8590" />
    <ellipse cx={55} cy={8} rx={51} ry={7} fill="#A3ACB6" />
    <ellipse cx={55} cy={8} rx={16} ry={2.5} fill="#6A727C" />
  </svg>
);

/** Trípode con cámara de cine. Base en y=300. */
export const CamaraTripode: React.FC<{ alto?: number }> = ({ alto = 300 }) => (
  <svg viewBox="0 0 160 300" width={(alto * 160) / 300} height={alto} style={{ overflow: "visible" }}>
    {sombra(80, 300, 70, 6)}
    <path d="M80 140 L20 300 M80 140 L140 300 M80 140 L80 300" stroke="#2A2A30" strokeWidth={8} strokeLinecap="round" />
    <rect x={30} y={90} width={100} height={52} rx={8} fill="#2E3238" />
    <circle cx={56} cy={74} r={22} fill="#2E3238" />
    <circle cx={104} cy={74} r={22} fill="#2E3238" />
    <rect x={128} y={104} width={30} height={24} rx={4} fill="#3A3F46" />
  </svg>
);

/** Foco de plató sobre pie. Base en y=360. */
export const Foco: React.FC<{ alto?: number; encendido?: boolean; mirarIzq?: boolean }> = ({ alto = 360, encendido = true, mirarIzq }) => (
  <svg viewBox="0 0 160 360" width={(alto * 160) / 360} height={alto} style={{ overflow: "visible", transform: mirarIzq ? "scaleX(-1)" : undefined }}>
    {sombra(80, 360, 60, 6)}
    <path d="M80 120 L30 360 M80 120 L130 360 M80 60 L80 360" stroke="#2A2A30" strokeWidth={7} strokeLinecap="round" />
    <rect x={40} y={20} width={90} height={70} rx={10} fill="#33383F" transform="rotate(-20 85 55)" />
    <ellipse cx={128} cy={44} rx={12} ry={30} fill={encendido ? "#FFF6D8" : "#555B63"} transform="rotate(-20 85 55)" />
  </svg>
);

/** Litera: superficie del colchón en y=MATRESS (120); patas tocan y=200. */
export const LITERA_COLCHON = 120;
export const Litera: React.FC<{ ancho?: number }> = ({ ancho = 520 }) => (
  <svg viewBox="0 0 520 200" width={ancho} height={(ancho * 200) / 520} style={{ overflow: "visible" }}>
    {sombra(260, 200, 250, 8, 0.32)}
    <rect x={0} y={0} width={16} height={200} fill="#6C7580" />
    <rect x={504} y={0} width={16} height={200} fill="#6C7580" />
    <rect x={10} y={120} width={500} height={30} rx={6} fill="#C7CCD2" />
    <rect x={10} y={146} width={500} height={10} fill="#8C949E" />
    <rect x={0} y={20} width={520} height={12} fill="#7A838E" />
    <rect x={30} y={98} width={140} height={26} rx={10} fill="#E9ECEF" />
  </svg>
);

/** Barrotes (capa delantera). */
export const Barrotes: React.FC<{ x: number; ancho: number; arriba: number; abajo: number; separacion?: number; color?: string }> = ({
  x,
  ancho,
  arriba,
  abajo,
  separacion = 70,
  color = "#3E4650",
}) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
    <rect x={x} y={arriba} width={ancho} height={16} fill={color} />
    <rect x={x} y={abajo - 16} width={ancho} height={16} fill={color} />
    {new Array(Math.floor(ancho / separacion) + 1).fill(0).map((_, i) => (
      <g key={i}>
        <rect x={x + i * separacion} y={arriba} width={14} height={abajo - arriba} fill={color} />
        <rect x={x + i * separacion + 2} y={arriba} width={4} height={abajo - arriba} fill="rgba(255,255,255,0.18)" />
      </g>
    ))}
  </svg>
);

/** Calendario de pared con días tachados. */
export const Calendario: React.FC<{ tachados: number; ancho?: number }> = ({ tachados, ancho = 220 }) => (
  <div style={{ width: ancho, background: "#EFEAE0", borderRadius: 6, padding: 10, boxShadow: "0 6px 14px rgba(0,0,0,0.35)" }}>
    <div style={{ height: 22, background: "#A33A30", borderRadius: 4, marginBottom: 8 }} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
      {new Array(28).fill(0).map((_, i) => (
        <div key={i} style={{ height: ancho / 10, background: "#FFF", position: "relative", fontSize: 10, color: "#555", textAlign: "center" }}>
          {i < tachados ? <div style={{ position: "absolute", inset: 0, color: "#A33A30", fontWeight: 900, fontSize: ancho / 10, lineHeight: 1 }}>×</div> : null}
        </div>
      ))}
    </div>
  </div>
);

/** Trofeo dorado GENÉRICO (copa), en SVG, centrado en x=0 con la base en y=0. */
export const TrofeoSVG: React.FC<{ alto?: number }> = ({ alto = 120 }) => {
  const k = alto / 120;
  return (
    <g transform={`scale(${k}) translate(-40 -120)`}>
      <path d="M12 6 L68 6 Q70 50 40 62 Q10 50 12 6 Z" fill="#E8B64A" />
      <path d="M40 6 L68 6 Q70 50 40 62 Z" fill="#C8922E" />
      <path d="M12 14 Q0 16 2 30 Q4 44 20 46" stroke="#E8B64A" strokeWidth={5} fill="none" />
      <path d="M68 14 Q80 16 78 30 Q76 44 60 46" stroke="#C8922E" strokeWidth={5} fill="none" />
      <rect x={34} y={60} width={12} height={30} fill="#D9A43C" />
      <path d="M20 90 L60 90 L64 104 L16 104 Z" fill="#E8B64A" />
      <rect x={12} y={104} width={56} height={16} rx={3} fill="#3A2A1E" />
      <path d="M22 12 L28 12 L26 40 Z" fill="#FFF3C8" opacity={0.7} />
    </g>
  );
};

/** Mazo de juez sobre su bloque. Base del bloque en y=150. golpe: 0 (arriba) → 1 (toca el bloque). */
export const Mazo: React.FC<{ golpe: number; ancho?: number }> = ({ golpe, ancho = 360 }) => {
  const ang = -38 + golpe * 38;
  return (
    <svg viewBox="0 0 360 160" width={ancho} height={(ancho * 160) / 360} style={{ overflow: "visible" }}>
      {sombra(190, 150, 110, 6)}
      <ellipse cx={190} cy={136} rx={96} ry={14} fill="#5A3A26" />
      <rect x={94} y={120} width={192} height={18} fill="#6E4A32" />
      <ellipse cx={190} cy={120} rx={96} ry={14} fill="#8A5E40" />
      <g transform={`rotate(${ang} 330 90)`}>
        <rect x={140} y={86} width={190} height={12} rx={5} fill="#7A4E32" />
        <rect x={150} y={56} width={60} height={64} rx={10} fill="#8A5E40" transform="translate(-10 -6)" />
        <rect x={150} y={70} width={60} height={8} fill="#D9B07A" transform="translate(-10 -6)" />
      </g>
    </svg>
  );
};

/** Armadura GENÉRICA de alta tecnología (acero pulido, luces azules; sin rojo, sin dorado, sin círculo en el pecho). Base en y=520. */
export const ARMADURA_BASE = 520;
export const Armadura: React.FC<{ alto?: number; encendida?: number }> = ({ alto = 520, encendida = 0 }) => {
  const f = useCurrentFrame();
  const g = encendida * (0.85 + 0.15 * Math.sin(f / 5));
  const luz = `rgba(140,220,255,${0.25 + 0.75 * g})`;
  return (
    <svg viewBox="0 0 220 520" width={(alto * 220) / 520} height={alto} style={{ overflow: "visible", filter: encendida > 0 ? `drop-shadow(0 0 ${14 * g}px rgba(120,210,255,0.8))` : undefined }}>
      {sombra(110, 520, 90, 9, 0.35)}
      <rect x={56} y={498} width={108} height={22} rx={5} fill="#3A4048" />
      <rect x={104} y={300} width={12} height={198} fill="#4A5058" />
      {/* piernas */}
      <path d="M80 300 L106 300 L102 470 L82 470 Z" fill="#B3202A" />
      <path d="M114 300 L140 300 L138 470 L118 470 Z" fill="#8A1720" />
      <path d="M84 380 L102 380 M118 380 L136 380" stroke={luz} strokeWidth={3} />
      {/* torso facetado */}
      <path d="M66 120 Q70 94 110 90 Q150 94 154 120 L146 250 L74 250 Z" fill="#C8303A" />
      <path d="M110 90 Q150 94 154 120 L146 250 L110 250 Z" fill="#9A1A24" />
      <path d="M78 120 L110 150 L142 120 M86 180 L110 200 L134 180 M82 230 L138 230" stroke="#6E1218" strokeWidth={4} fill="none" />
      <circle cx={110} cy={142} r={15} fill="#3A3F46" />
      <circle cx={110} cy={142} r={11} fill={luz} />
      <path d="M92 196 L110 210 L128 196" stroke={luz} strokeWidth={3} fill="none" strokeLinecap="round" />
      {/* hombreras y brazos */}
      <path d="M52 116 Q38 104 30 128 L40 150 L68 132 Z" fill="#E0B048" />
      <path d="M168 116 Q182 104 190 128 L180 150 L152 132 Z" fill="#B88A2A" />
      <path d="M40 150 L36 262 L56 264 L64 150 Z" fill="#B3202A" />
      <path d="M180 150 L184 262 L164 264 L156 150 Z" fill="#8A1720" />
      <path d="M42 210 L58 210 M162 210 L178 210" stroke={luz} strokeWidth={3} />
      <path d="M74 250 L146 250 L140 300 L80 300 Z" fill="#B88A2A" />
      {/* casco con visor */}
      <path d="M80 60 Q80 20 110 18 Q140 20 140 60 Q140 88 110 94 Q80 88 80 60 Z" fill="#B3202A" />
      <path d="M110 18 Q140 20 140 60 Q140 88 110 94 Z" fill="#B3202A" />
      <path d="M88 40 Q110 32 132 40 L132 72 L122 90 L98 90 L88 72 Z" fill="#E6B54A" />
      <path d="M110 34 Q122 34 132 40 L132 72 L122 90 L110 90 Z" fill="#C4922E" />
      <path d="M92 54 L107 57 L105 62 L94 61 Z M113 57 L128 54 L126 61 L115 62 Z" fill="#11161C" />
      <path d="M92 54 L107 57 L105 62 L94 61 Z M113 57 L128 54 L126 61 L115 62 Z" fill={luz} />
      <path d="M100 80 L120 80" stroke="#6A4A18" strokeWidth={3} />
      <path d="M84 34 Q96 22 112 22" stroke="rgba(255,255,255,0.6)" strokeWidth={4} fill="none" strokeLinecap="round" />
    </svg>
  );
};

/** Máscara de acero forjado con remaches, tumbada sobre una mesa. Base en y=60. */
export const Mascara: React.FC<{ ancho?: number; inclinacion?: number; ojos?: number }> = ({ ancho = 220, inclinacion = 0, ojos = 0 }) => (
  <svg viewBox="0 0 220 160" width={ancho} height={(ancho * 160) / 220} style={{ overflow: "visible" }}>
    <g transform={`rotate(${inclinacion} 110 90)`}>
      <path d="M34 50 Q34 8 110 6 Q186 8 186 50 L186 108 Q176 142 110 156 Q44 142 34 108 Z" fill="#A2ACB5" />
      <path d="M110 6 Q186 8 186 50 L186 108 Q176 142 110 156 Z" fill="#848E98" />
      {/* frente y cejas marcadas */}
      <path d="M42 58 Q110 44 178 58 L174 66 Q110 54 46 66 Z" fill="#6B747E" />
      <path d="M56 70 L96 72 L94 86 L58 84 Z M124 72 L164 70 L162 84 L126 86 Z" fill="#0B0D10" />
      {ojos > 0 ? <path d="M56 70 L96 72 L94 86 L58 84 Z M124 72 L164 70 L162 84 L126 86 Z" fill={`rgba(140,255,180,${ojos})`} /> : null}
      {/* nariz, boca en rendija y surcos de las mejillas */}
      <path d="M110 72 L102 112 L118 112 Z" fill="#8E98A2" />
      <path d="M110 72 L118 112 L110 112 Z" fill="#6B747E" />
      <rect x={76} y={124} width={68} height={7} rx={3} fill="#2A2E33" />
      <path d="M64 92 L66 140 M156 92 L154 140 M84 134 L86 150 M136 134 L134 150" stroke="#5E6670" strokeWidth={4} strokeLinecap="round" />
      {[[46, 40], [174, 40], [44, 100], [176, 100], [110, 18], [60, 130], [160, 130]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4} fill="#D2D8DE" stroke="#6B747E" strokeWidth={1.5} />)}
      <path d="M52 28 Q82 12 120 12" stroke="rgba(255,255,255,0.5)" strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
  </svg>
);

/** Carpeta oficial vista en perspectiva sobre una mesa. */
export const Carpeta: React.FC<{ ancho?: number; color?: string; etiqueta?: string }> = ({ ancho = 420, color = "#D8C49A", etiqueta }) => (
  <div style={{ width: ancho, height: ancho * 0.62, background: color, borderRadius: 8, transform: "perspective(900px) rotateX(48deg)", transformOrigin: "50% 100%", boxShadow: "0 18px 24px rgba(0,0,0,0.35)", position: "relative" }}>
    <div style={{ position: "absolute", top: -18, left: 30, width: ancho * 0.3, height: 26, background: color, borderRadius: "8px 8px 0 0" }} />
    {etiqueta ? <div style={{ position: "absolute", left: 30, top: 30, fontFamily: "sans-serif", fontWeight: 700, fontSize: ancho * 0.06, color: "#5A4A30" }}>{etiqueta}</div> : null}
  </div>
);

/** Partículas que suben (humo) o flotan (polvo): solo aquí flota algo. */
export const Humo: React.FC<{ x: number; y: number; escala?: number }> = ({ x, y, escala = 1 }) => {
  const f = useCurrentFrame();
  return (
    <>
      {new Array(5).fill(0).map((_, i) => {
        const t = ((f * 0.6 + i * 40) % 200) / 200;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin(t * 6 + i) * 14 * escala - 14 * escala,
              top: y - t * 160 * escala,
              width: (20 + t * 40) * escala,
              height: (14 + t * 26) * escala,
              borderRadius: "50%",
              background: "rgba(230,230,240,0.35)",
              opacity: Math.sin(t * Math.PI) * 0.8,
            }}
          />
        );
      })}
    </>
  );
};
