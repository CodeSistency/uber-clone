import React from "react";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Circle,
  Path,
  Rect,
} from "react-native-svg";

import { IllustrationProps } from "./types";

const LocationIllustration: React.FC<IllustrationProps> = ({
  className,
  style,
  variant,
}) => {
  const isComplete = variant === "complete";

  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 320 320"
      className={className}
      style={style}
    >
      <Defs>
        <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0286FF" stopOpacity="0.15" />
          <Stop offset="100%" stopColor="#FFE014" stopOpacity="0.25" />
        </LinearGradient>
      </Defs>

      <Rect x="20" y="40" width="280" height="200" rx="24" fill="url(#grad)" />

      <Path
        d="M80 150 Q 120 120 160 150 T 240 150"
        stroke={isComplete ? "#0CC25F" : "#0286FF"}
        strokeWidth={isComplete ? 6 : 4}
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      <Circle cx="160" cy="120" r="60" fill="#0286FF" opacity="0.08" />
      <Circle cx="100" cy="180" r="30" fill="#0286FF" opacity="0.06" />
      <Circle cx="220" cy="180" r="30" fill="#0286FF" opacity="0.06" />

      <Path
        d="M160 90 C 140 90 124 106 124 126 C 124 157 160 210 160 210 C 160 210 196 157 196 126 C 196 106 180 90 160 90 Z"
        fill={isComplete ? "#0CC25F" : "#0286FF"}
        opacity="0.85"
      />
      <Circle cx="160" cy="128" r="16" fill="#FFFFFF" />
      <Circle
        cx="160"
        cy="128"
        r="8"
        fill={isComplete ? "#0CC25F" : "#0286FF"}
      />

      {isComplete && (
        <Path
          d="M152 128 L158 134 L168 120"
          stroke="#FFFFFF"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      <Circle
        cx="100"
        cy="180"
        r="6"
        fill={isComplete ? "#0CC25F" : "#0286FF"}
      />
      <Circle
        cx="220"
        cy="180"
        r="6"
        fill={isComplete ? "#0CC25F" : "#0286FF"}
      />

      <Path
        d="M80 220 H240"
        stroke="#0286FF"
        strokeWidth="3"
        strokeDasharray="6 6"
        opacity="0.35"
      />
    </Svg>
  );
};

export default LocationIllustration;
