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

const TravelIllustration: React.FC<IllustrationProps> = ({
  className,
  style,
  variant,
}) => {
  const highlightPremium = variant === "premium";

  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 320 320"
      className={className}
      style={style}
    >
      <Defs>
        <LinearGradient id="travelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0286FF" stopOpacity="0.18" />
          <Stop offset="100%" stopColor="#6A85E6" stopOpacity="0.22" />
        </LinearGradient>
      </Defs>

      <Rect
        x="24"
        y="48"
        width="272"
        height="200"
        rx="26"
        fill="url(#travelGrad)"
      />

      <G opacity="0.8">
        <Path
          d="M70 180 H250"
          stroke={highlightPremium ? "#FACC15" : "#0286FF"}
          strokeWidth={highlightPremium ? 6 : 4}
          strokeLinecap="round"
          strokeDasharray="16 12"
        />

        <Circle cx="100" cy="180" r="14" fill="#0286FF" opacity="0.4" />
        <Circle cx="160" cy="180" r="14" fill="#0286FF" opacity="0.4" />
        <Circle
          cx="220"
          cy="180"
          r="14"
          fill={highlightPremium ? "#FACC15" : "#0286FF"}
          opacity="0.6"
        />
      </G>

      <G opacity="0.9">
        <Rect
          x="98"
          y="110"
          width="124"
          height="62"
          rx="18"
          fill="#0286FF"
          opacity="0.85"
        />
        <Rect
          x="118"
          y="122"
          width="84"
          height="40"
          rx="12"
          fill="#FFFFFF"
          opacity="0.9"
        />
        <Circle cx="136" cy="142" r="6" fill="#0286FF" />
        <Circle cx="160" cy="142" r="6" fill="#0286FF" />
        <Circle
          cx="184"
          cy="142"
          r="6"
          fill={highlightPremium ? "#FACC15" : "#0286FF"}
        />
      </G>

      <Path
        d="M90 230 C 120 210 200 210 230 230"
        stroke="#0286FF"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.35"
      />

      <Circle cx="110" cy="120" r="20" fill="#0286FF" opacity="0.18" />
      <Circle
        cx="210"
        cy="120"
        r="20"
        fill={highlightPremium ? "#FACC15" : "#0286FF"}
        opacity="0.25"
      />

      <Path
        d="M112 96 L132 86"
        stroke="#0286FF"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.5"
      />
      <Path
        d="M208 96 L188 86"
        stroke="#0286FF"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.5"
      />
    </Svg>
  );
};

export default TravelIllustration;
