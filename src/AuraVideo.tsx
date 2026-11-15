import React from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Montserrat";

const { fontFamily } = loadFont("normal", {
  weights: ["600", "900"],
  subsets: ["latin", "latin-ext"],
});

const COLORS = {
  violet: "#8b5cf6",
  pink: "#ec4899",
  cyan: "#22d3ee",
  gold: "#facc15",
  white: "#ffffff",
};

// ---------- Fondo animado ----------
const Blob: React.FC<{
  color: string;
  size: number;
  x: number;
  y: number;
  speed: number;
  phase: number;
}> = ({ color, size, x, y, speed, phase }) => {
  const frame = useCurrentFrame();
  const t = frame * speed + phase;
  return (
    <div
      style={{
        position: "absolute",
        left: x + Math.sin(t) * 160 - size / 2,
        top: y + Math.cos(t * 0.8) * 220 - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        filter: "blur(140px)",
        opacity: 0.55,
      }}
    />
  );
};

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const hue = interpolate(frame, [0, 450], [0, 60]);
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, #0b0418 0%, #160a33 55%, #05010d 100%)`,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill style={{ filter: `hue-rotate(${hue}deg)` }}>
        <Blob color={COLORS.violet} size={900} x={250} y={400} speed={0.02} phase={0} />
        <Blob color={COLORS.pink} size={800} x={850} y={1300} speed={0.025} phase={2} />
        <Blob color={COLORS.cyan} size={600} x={600} y={900} speed={0.018} phase={4} />
      </AbsoluteFill>
      {/* rejilla sutil */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
          backgroundPosition: `0px ${frame * 1.5}px`,
        }}
      />
      <Particles />
    </AbsoluteFill>
  );
};

const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      {new Array(28).fill(0).map((_, i) => {
        const seed = (i * 9301 + 49297) % 233280;
        const x = (seed / 233280) * 1080;
        const speed = 1.5 + (i % 5) * 0.6;
        const y = 1920 - ((frame * speed + i * 137) % 2100);
        const s = 6 + (i % 4) * 4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: "50%",
              background: i % 3 === 0 ? COLORS.gold : COLORS.white,
              opacity: 0.5,
              boxShadow: `0 0 ${s * 3}px ${i % 3 === 0 ? COLORS.gold : COLORS.white}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- Utilidades de animación ----------
const useEnterExit = (duration: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });
  const exit = interpolate(frame, [duration - 10, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  return { enter, exit };
};

const Word: React.FC<{
  children: React.ReactNode;
  delay: number;
  style?: React.CSSProperties;
}> = ({ children, delay, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 120 } });
  return (
    <span
      style={{
        display: "inline-block",
        transform: `translateY(${(1 - p) * 80}px) scale(${0.7 + p * 0.3})`,
        opacity: p,
        filter: `blur(${(1 - p) * 12}px)`,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

const gradientText = (a: string, b: string): React.CSSProperties => ({
  background: `linear-gradient(90deg, ${a}, ${b})`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
});

const SceneWrap: React.FC<{ duration: number; children: React.ReactNode }> = ({
  duration,
  children,
}) => {
  const { enter, exit } = useEnterExit(duration);
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
        textAlign: "center",
        fontFamily,
        color: COLORS.white,
        opacity: Math.min(enter, 1 - exit),
        transform: `scale(${0.9 + enter * 0.1 + exit * 0.15})`,
        filter: `blur(${exit * 20}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ---------- Escenas ----------
const Hook: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const glow = 30 + Math.sin(frame / 6) * 15;
  return (
    <SceneWrap duration={duration}>
      <div style={{ fontSize: 70, fontWeight: 600, opacity: 0.85, marginBottom: 30 }}>
        <Word delay={0}>¿Por qué los jóvenes</Word>
        <br />
        <Word delay={6}>están obsesionados con</Word>
      </div>
      <div
        style={{
          fontSize: 170,
          fontWeight: 900,
          lineHeight: 0.95,
          letterSpacing: -4,
          textShadow: `0 0 ${glow}px rgba(236,72,153,0.8)`,
        }}
      >
        <Word delay={14} style={gradientText(COLORS.gold, COLORS.pink)}>
          FARMEAR
        </Word>
        <br />
        <Word delay={20} style={gradientText(COLORS.cyan, COLORS.violet)}>
          AURA?
        </Word>
      </div>
    </SceneWrap>
  );
};

const WhatIs: React.FC<{ duration: number }> = ({ duration }) => {
  return (
    <SceneWrap duration={duration}>
      <div style={{ fontSize: 80, fontWeight: 900, marginBottom: 50 }}>
        <Word delay={0} style={gradientText(COLORS.cyan, COLORS.gold)}>
          ¿Qué es el aura?
        </Word>
      </div>
      <div style={{ fontSize: 76, fontWeight: 600, lineHeight: 1.25 }}>
        <Word delay={10}>Puntos imaginarios</Word>
        <br />
        <Word delay={16}>de</Word>{" "}
        <Word delay={20} style={{ color: COLORS.gold, fontWeight: 900 }}>
          carisma,
        </Word>
        <br />
        <Word delay={26} style={{ color: COLORS.pink, fontWeight: 900 }}>
          estilo
        </Word>{" "}
        <Word delay={30}>y</Word>{" "}
        <Word delay={34} style={{ color: COLORS.cyan, fontWeight: 900 }}>
          actitud
        </Word>
      </div>
    </SceneWrap>
  );
};

const AuraCounter: React.FC<{ from: number; to: number; delay: number }> = ({
  from,
  to,
  delay,
}) => {
  const frame = useCurrentFrame();
  const value = Math.round(
    interpolate(frame - delay, [0, 30], [from, to], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.exp),
    })
  );
  const positive = to >= 0;
  return (
    <span style={{ color: positive ? COLORS.gold : "#f87171", fontWeight: 900 }}>
      {positive ? "+" : ""}
      {value.toLocaleString("es-MX")} aura
    </span>
  );
};

const reasons = [
  { n: "01", title: "TikTok lo hizo meme", color: COLORS.pink },
  { n: "02", title: "Se juega como un videojuego", color: COLORS.cyan },
  { n: "03", title: "Validación y estatus social", color: COLORS.gold },
];

const Reasons: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <SceneWrap duration={duration}>
      <div style={{ fontSize: 84, fontWeight: 900, marginBottom: 70 }}>
        <Word delay={0}>3 razones</Word>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 40, width: "100%" }}>
        {reasons.map((r, i) => {
          const p = spring({
            frame: frame - 12 - i * 18,
            fps,
            config: { damping: 15 },
          });
          return (
            <div
              key={r.n}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 36,
                padding: "40px 44px",
                borderRadius: 40,
                background: "rgba(255,255,255,0.08)",
                border: `3px solid ${r.color}`,
                boxShadow: `0 0 50px ${r.color}55`,
                backdropFilter: "blur(10px)",
                transform: `translateX(${(1 - p) * (i % 2 ? 900 : -900)}px)`,
                opacity: p,
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 90, fontWeight: 900, color: r.color }}>{r.n}</span>
              <span style={{ fontSize: 58, fontWeight: 900, lineHeight: 1.1 }}>{r.title}</span>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 88, marginTop: 70 }}>
        <Word delay={70}>
          <AuraCounter from={0} to={1000} delay={70} />
        </Word>
      </div>
    </SceneWrap>
  );
};

const Twist: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const shake = frame > 20 && frame < 32 ? Math.sin(frame * 3) * 14 : 0;
  return (
    <SceneWrap duration={duration}>
      <div style={{ fontSize: 76, fontWeight: 600, marginBottom: 40 }}>
        <Word delay={0}>Pero cuidado...</Word>
      </div>
      <div
        style={{
          fontSize: 120,
          transform: `translateX(${shake}px)`,
          marginBottom: 60,
        }}
      >
        <Word delay={14}>
          <AuraCounter from={0} to={-10000} delay={18} />
        </Word>
      </div>
      <div style={{ fontSize: 66, fontWeight: 600, lineHeight: 1.3 }}>
        <Word delay={34}>El aura de verdad</Word>
        <br />
        <Word delay={40}>se gana siendo</Word>{" "}
        <Word delay={46} style={{ ...gradientText(COLORS.gold, COLORS.pink), fontWeight: 900 }}>
          auténtico
        </Word>
      </div>
    </SceneWrap>
  );
};

const Outro: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 5) * 0.04;
  return (
    <SceneWrap duration={duration + 20}>
      <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 1.05, marginBottom: 60 }}>
        <Word delay={0}>¿Cuánta aura</Word>
        <br />
        <Word delay={6} style={gradientText(COLORS.cyan, COLORS.pink)}>
          tienes tú?
        </Word>
      </div>
      <div
        style={{
          transform: `scale(${pulse})`,
          padding: "30px 70px",
          borderRadius: 999,
          background: `linear-gradient(90deg, ${COLORS.violet}, ${COLORS.pink})`,
          fontSize: 56,
          fontWeight: 900,
          boxShadow: `0 0 60px ${COLORS.pink}aa`,
        }}
      >
        <Word delay={14}>Coméntalo abajo</Word>
      </div>
    </SceneWrap>
  );
};

// ---------- Barra de progreso ----------
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        top: 70,
        left: 80,
        right: 80,
        height: 10,
        borderRadius: 10,
        background: "rgba(255,255,255,0.15)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${(frame / durationInFrames) * 100}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.pink}, ${COLORS.gold})`,
        }}
      />
    </div>
  );
};

// ---------- Composición principal (15 s @ 30 fps = 450 frames) ----------
const SCENES: { Comp: React.FC<{ duration: number }>; duration: number }[] = [
  { Comp: Hook, duration: 90 },
  { Comp: WhatIs, duration: 90 },
  { Comp: Reasons, duration: 120 },
  { Comp: Twist, duration: 90 },
  { Comp: Outro, duration: 60 },
];

export const AuraVideo: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill>
      <Background />
      {SCENES.map(({ Comp, duration }, i) => {
        const start = from;
        from += duration;
        return (
          <Sequence key={i} from={start} durationInFrames={duration}>
            <Comp duration={duration} />
          </Sequence>
        );
      })}
      <ProgressBar />
    </AbsoluteFill>
  );
};
