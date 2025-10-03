import React from "react";
import Svg, {
  Defs,
  LinearGradient,
  Path,
  Polygon,
  Rect,
  Stop,
} from "react-native-svg";

type MotoTopViewProps = {
  width?: number;
  height?: number;
  primaryColor?: string;
  accentColor?: string;
  lightsOn?: boolean;
};

const MotoTopView: React.FC<MotoTopViewProps> = ({
  width = 64,
  height = 160,
  primaryColor = "#F7C531",
  accentColor = "#1E1F26",
  lightsOn = false,
}) => {
  const headLightColor = lightsOn ? "#FFE27A" : "#3A3B42";
  const tailLightColor = lightsOn ? "#FF6B6B" : "#3B2A2C";

  return (
    <Svg width={width} height={height} viewBox="0 0 64 160" fill="none">
      <Defs>
        <LinearGradient id="motoBody" x1="32" y1="0" x2="32" y2="160">
          <Stop offset="0%" stopColor={primaryColor} stopOpacity="0.95" />
          <Stop offset="100%" stopColor={primaryColor} />
        </LinearGradient>
        <LinearGradient id="motoHeadlightGlow" x1="0" y1="0" x2="0" y2="1">
          <Stop
            offset="0%"
            stopColor="#FFE27A"
            stopOpacity={lightsOn ? 0.75 : 0}
          />
          <Stop offset="100%" stopColor="#FFE27A" stopOpacity={0} />
        </LinearGradient>
      </Defs>

      <Path
        d="M26 12C26 8.68629 28.6863 6 32 6C35.3137 6 38 8.68629 38 12V150C38 153.314 35.3137 156 32 156C28.6863 156 26 153.314 26 150V12Z"
        fill={accentColor}
      />
      <Path
        d="M18 26C18 22.6863 20.6863 20 24 20H40C43.3137 20 46 22.6863 46 26V132C46 135.314 43.3137 138 40 138H24C20.6863 138 18 135.314 18 132V26Z"
        fill="url(#motoBody)"
      />
      <Path d="M22 54H42V106H22V54Z" fill={accentColor} opacity="0.82" />
      <Rect x="28" y="4" width="8" height="10" rx="4" fill={headLightColor} />
      {lightsOn ? (
        <Polygon
          points="32,14 16,-24 48,-24"
          fill="url(#motoHeadlightGlow)"
          opacity={0.6}
        />
      ) : null}
      <Rect x="28" y="146" width="8" height="10" rx="4" fill={tailLightColor} />
      <Path
        d="M12 70L18 54V106L12 90C11.381 88.4524 11.381 86.5476 12 85L12 70Z"
        fill={accentColor}
        opacity="0.74"
      />
      <Path
        d="M52 70L46 54V106L52 90C52.619 88.4524 52.619 86.5476 52 85L52 70Z"
        fill={accentColor}
        opacity="0.74"
      />
      <Rect
        x="26"
        y="42"
        width="12"
        height="32"
        rx="6"
        fill="#000"
        opacity="0.18"
      />
      <Rect
        x="26"
        y="98"
        width="12"
        height="24"
        rx="6"
        fill="#000"
        opacity="0.18"
      />
    </Svg>
  );
};

export default MotoTopView;
