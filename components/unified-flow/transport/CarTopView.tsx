import React from "react";
import Svg, {
  Defs,
  LinearGradient,
  Path,
  Polygon,
  Rect,
  Stop,
} from "react-native-svg";

type CarTopViewProps = {
  width?: number;
  height?: number;
  primaryColor?: string;
  accentColor?: string;
  lightsOn?: boolean;
};

const CarTopView: React.FC<CarTopViewProps> = ({
  width = 96,
  height = 168,
  primaryColor = "#F7C531",
  accentColor = "#2F3036",
  lightsOn = false,
}) => {
  const headLightColor = lightsOn ? "#FFED9D" : "#3B3C42";
  const tailLightColor = lightsOn ? "#FF7A7A" : "#433134";

  return (
    <Svg width={width} height={height} viewBox="0 0 96 168" fill="none">
      <Defs>
        <LinearGradient id="carBody" x1="48" y1="0" x2="48" y2="168">
          <Stop offset="0%" stopColor={primaryColor} stopOpacity="0.9" />
          <Stop offset="100%" stopColor={primaryColor} />
        </LinearGradient>
        <LinearGradient id="headlightGlow" x1="0" y1="0" x2="0" y2="1">
          <Stop
            offset="0%"
            stopColor="#FFE27A"
            stopOpacity={lightsOn ? 0.75 : 0}
          />
          <Stop offset="100%" stopColor="#FFE27A" stopOpacity={0} />
        </LinearGradient>
      </Defs>

      <Rect x="16" y="6" width="64" height="156" rx="22" fill="url(#carBody)" />
      <Rect
        x="22"
        y="18"
        width="52"
        height="64"
        rx="14"
        fill={accentColor}
        opacity="0.82"
      />
      <Rect
        x="22"
        y="96"
        width="52"
        height="46"
        rx="12"
        fill={accentColor}
        opacity="0.86"
      />
      <Path
        d="M16 42H10C8.34315 42 7 43.3431 7 45V84C7 85.6569 8.34315 87 10 87H16V42Z"
        fill={accentColor}
      />
      <Path
        d="M80 42H86C87.6569 42 89 43.3431 89 45V84C89 85.6569 87.6569 87 86 87H80V42Z"
        fill={accentColor}
      />
      <Rect
        x="20"
        y="150"
        width="16"
        height="10"
        rx="4"
        fill={tailLightColor}
      />
      <Rect
        x="60"
        y="150"
        width="16"
        height="10"
        rx="4"
        fill={tailLightColor}
      />
      <Rect x="22" y="8" width="16" height="10" rx="4" fill={headLightColor} />
      <Rect x="58" y="8" width="16" height="10" rx="4" fill={headLightColor} />
      {lightsOn ? (
        <>
          <Polygon
            points="24,18 8,-24 40,-24"
            fill="url(#headlightGlow)"
            opacity={0.55}
          />
          <Polygon
            points="72,18 88,-24 56,-24"
            fill="url(#headlightGlow)"
            opacity={0.55}
          />
        </>
      ) : null}
      <Rect
        x="32"
        y="70"
        width="8"
        height="32"
        rx="4"
        fill="#000"
        opacity="0.18"
      />
      <Rect
        x="56"
        y="70"
        width="8"
        height="32"
        rx="4"
        fill="#000"
        opacity="0.18"
      />
    </Svg>
  );
};

export default CarTopView;
