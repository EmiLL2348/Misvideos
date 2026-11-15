import { Composition } from "remotion";
import { AuraVideo } from "./AuraVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AuraVideo"
      component={AuraVideo}
      durationInFrames={15 * 30}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
