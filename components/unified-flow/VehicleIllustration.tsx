import React from "react";
import Svg, {
  G,
  Path,
  Rect,
  Circle,
  LinearGradient,
  Stop,
  Defs,
} from "react-native-svg";

type VehicleIllustrationProps = {
  variant: "transport" | "delivery" | "mandado" | "envio";
  size?: number;
  accent?: string;
  isDark?: boolean;
};

const variantAccent: Record<VehicleIllustrationProps["variant"], string> = {
  transport: "#FFC300",
  delivery: "#FF7A00",
  mandado: "#34D399",
  envio: "#60A5FA",
};

export const VehicleIllustration: React.FC<VehicleIllustrationProps> = ({
  variant,
  size = 64,
  accent,
  isDark = false,
}) => {
  const resolvedAccent = accent ?? variantAccent[variant];
  const bodyColor = isDark ? "#111416" : "#111111";
  const windowColor = isDark ? "#1F2937" : "#F3F4F6";
  const strokeColor = isDark ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.18)";
  const tyreFill = isDark ? "#E5E7EB" : "#1F2937";

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Defs>
        <LinearGradient id="vehicle-shadow" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={resolvedAccent} stopOpacity={0.55} />
          <Stop offset="100%" stopColor={resolvedAccent} stopOpacity={0.05} />
        </LinearGradient>
      </Defs>

      {/* Shadow */}
      <G transform="rotate(-18 32 32)">
        <Rect
          x={12}
          y={42}
          width={40}
          height={8}
          rx={4}
          fill="url(#vehicle-shadow)"
          opacity={0.35}
        />

        {/* Body */}
        <Path
          d="M15 20.5C15 17.46 17.46 15 20.5 15H37.2C38.96 15 40.64 15.7 41.86 16.94L49.5 24.7C50.74 25.94 51.44 27.64 51.44 29.4V38.5C51.44 41.54 48.98 44 45.94 44H20.5C17.46 44 15 41.54 15 38.5V20.5Z"
          fill={bodyColor}
        />

        {/* Accent stripe */}
        <Rect
          x={17}
          y={28}
          width={30}
          height={4.6}
          rx={2.3}
          fill={resolvedAccent}
          opacity={0.92}
        />

        {/* Windows */}
        <Path
          d="M21 20.5C21 19.12 22.12 18 23.5 18H33.2C34.24 18 35.24 18.44 35.96 19.2L40.04 23.42C40.76 24.18 41.2 25.18 41.2 26.22V30H21V20.5Z"
          fill={windowColor}
        />

        {/* Handle */}
        <Rect
          x={33.8}
          y={31.2}
          width={4.6}
          height={1.2}
          rx={0.6}
          fill={windowColor}
          opacity={0.4}
        />

        {/* Tyres */}
        <G stroke={strokeColor} strokeWidth={1.2}>
          <Circle cx={24.8} cy={40.6} r={5.4} fill={tyreFill} />
          <Circle cx={43.2} cy={40.6} r={5.4} fill={tyreFill} />
        </G>

        {/* Headlights */}
        <Circle
          cx={18.6}
          cy={32.6}
          r={2.2}
          fill={resolvedAccent}
          opacity={0.85}
        />
        <Circle
          cx={18.6}
          cy={32.6}
          r={2.2}
          fill="rgba(255,255,255,0.35)"
          opacity={0.65}
        />

        {/* Tail light */}
        <Rect
          x={48}
          y={32}
          width={2.8}
          height={3.6}
          rx={1.2}
          fill="#F87171"
          opacity={0.8}
        />
      </G>
    </Svg>
  );
};

export default VehicleIllustration;
