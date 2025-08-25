import React from 'react';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

export const Logo = ({ width = 48, height = 48, ...props }) => {
  const { colors } = useTheme();
  
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      {...props}
    >
      {/* Modern concentric circles with gradient */}
      <Defs>
        <LinearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={colors.primary} />
          <Stop offset="100%" stopColor={colors.accent} />
        </LinearGradient>
      </Defs>

      {/* Outer circle with gradient */}
      <Circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="6"
      />

      {/* Abstract C shape formed from circle segment */}
      <Path
        d="M65,35 A15,15 0 0,1 65,65"
        fill="none"
        stroke={colors.text}
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* Central dot */}
      <Circle 
        cx="50" 
        cy="50" 
        r="8" 
        fill={colors.primary} 
      />
    </Svg>
  );
};

export default Logo;