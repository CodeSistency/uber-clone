import React from "react";
import Svg, {
  Rect,
  Circle,
  Path,
  Defs,
  LinearGradient,
  Stop,
  G,
} from "react-native-svg";

import { IllustrationProps } from "./types";

const ProfileIllustration: React.FC<IllustrationProps> = ({
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
        <LinearGradient id="profileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0286FF" stopOpacity="0.15" />
          <Stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
        </LinearGradient>
      </Defs>

      <Rect
        x="36"
        y="56"
        width="248"
        height="188"
        rx="24"
        fill="url(#profileGrad)"
      />

      <G opacity="0.9">
        <Circle
          cx="160"
          cy="128"
          r="48"
          fill={isComplete ? "#10B981" : "#0286FF"}
          opacity="0.85"
        />
        <Circle cx="160" cy="120" r="24" fill="#FFFFFF" opacity="0.95" />
        <Path
          d="M120 192 C 120 164 200 164 200 192"
          fill="#FFFFFF"
          opacity="0.95"
        />
      </G>

      {isComplete ? (
        <Circle cx="160" cy="120" r="60" fill="#10B981" opacity="0.12" />
      ) : (
        <>
          <Circle cx="120" cy="92" r="10" fill="#0286FF" opacity="0.35" />
          <Circle cx="200" cy="92" r="10" fill="#0286FF" opacity="0.35" />
        </>
      )}

      <Path
        d="M110 150 Q 100 160 110 170"
        stroke="#0286FF"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.5"
      />
      <Path
        d="M210 150 Q 220 160 210 170"
        stroke="#0286FF"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.5"
      />
    </Svg>
  );
};

export default ProfileIllustration;
