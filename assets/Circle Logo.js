import * as React from "react";
import Svg, { Circle, Path } from "react-native-svg";

const Logo = ({ size = 40, ...props }) => (
  <Svg
    viewBox="0 0 40 40"
    width={size}
    height={size}
    {...props}
  >
    {/* Purple circle */}
    <Circle cx={12} cy={20} r={4} fill="#a78bfa" />
    
    {/* White arc */}
    <Path
      d="M30 10 A10 10 0 0 1 30 30"
      stroke="white"
      strokeWidth={6}
      fill="none"
      strokeLinecap="round"
    />
  </Svg>
);

export default Logo;
