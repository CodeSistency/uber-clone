import React from "react";
import Svg, {
  Rect,
  Path,
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";

import { IllustrationProps } from "./types";

const PhoneIllustration: React.FC<IllustrationProps> = ({
  className,
  style,
  variant,
}) => {
  const showCheck = variant === "verified";

  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 320 320"
      className={className}
      style={style}
    >
      <Defs>
        <LinearGradient id="phoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#6A85E6" stopOpacity="0.2" />
          <Stop offset="100%" stopColor="#0286FF" stopOpacity="0.25" />
        </LinearGradient>
      </Defs>

      <Rect
        x="92"
        y="52"
        width="136"
        height="216"
        rx="28"
        fill="url(#phoneGrad)"
      />
      <Rect
        x="110"
        y="72"
        width="100"
        height="176"
        rx="20"
        fill="#FFFFFF"
        opacity="0.95"
      />

      <Circle cx="160" cy="264" r="8" fill="#0286FF" opacity="0.8" />

      <Rect
        x="126"
        y="100"
        width="68"
        height="16"
        rx="8"
        fill="#0286FF"
        opacity="0.85"
      />
      <Rect
        x="126"
        y="128"
        width="68"
        height="16"
        rx="8"
        fill="#0286FF"
        opacity="0.65"
      />
      <Rect
        x="126"
        y="156"
        width="68"
        height="16"
        rx="8"
        fill="#0286FF"
        opacity="0.5"
      />

      <Circle cx="160" cy="184" r="28" fill="#0286FF" opacity="0.12" />
      <Circle cx="160" cy="184" r="18" fill="#0286FF" opacity="0.3" />
      <Circle
        cx="160"
        cy="184"
        r="10"
        fill={showCheck ? "#10B981" : "#0286FF"}
      />

      {showCheck ? (
        <Path
          d="M153 185 L158 190 L167 178"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <Path
            d="M198 90 C 220 108 220 140 198 158"
            stroke="#0286FF"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.4"
          />
          <Path
            d="M122 90 C 100 108 100 140 122 158"
            stroke="#0286FF"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.4"
          />
        </>
      )}
    </Svg>
  );
};

export default PhoneIllustration;
