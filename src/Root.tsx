import { Composition } from "remotion";
import { AuraVideo } from "./AuraVideo";
import { CuerpoExtremo, CuerpoProps, calcularMetadatosCuerpo } from "./cuerpo/CuerpoExtremo";
import { calcularTimeline } from "./cuerpo/timeline";
import { Downey, DowneyProps, metadatosDowney, timelineDowney } from "./downey/Downey";
import { Stallone, StalloneProps, metadatosStallone, timelineStallone } from "./stallone/Stallone";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AuraVideo"
        component={AuraVideo}
        durationInFrames={15 * 30}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="CuerpoExtremo"
        component={CuerpoExtremo}
        // la duración real se calcula con el audio de narración (calculateMetadata)
        durationInFrames={calcularTimeline(null).totalF}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ manifiesto: null, subtitulos: true, volumenMusica: 0.14 } satisfies CuerpoProps}
        calculateMetadata={calcularMetadatosCuerpo}
      />
      <Composition
        id="Stallone"
        component={Stallone}
        durationInFrames={timelineStallone(null).totalF}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ manifiesto: null, subtitulos: true, volumenMusica: 0.2 } satisfies StalloneProps}
        calculateMetadata={metadatosStallone}
      />
      <Composition
        id="Downey"
        component={Downey}
        durationInFrames={timelineDowney(null).totalF}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ manifiesto: null, subtitulos: true, pista: "mezcla" } satisfies DowneyProps}
        calculateMetadata={metadatosDowney}
      />
    </>
  );
};
