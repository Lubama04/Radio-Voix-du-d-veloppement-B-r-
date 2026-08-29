import React from 'react';
import {Img, interpolate, useCurrentFrame} from 'remotion';
// eslint-disable-next-line import/extensions
import logoSrc from '../assets/logo.png';

interface LogoProps {
  delay?: number;
  width?: number;
}

/** Logo Flaugust Business (badge + wordmark), avec une légère apparition en fondu + zoom. */
export const Logo: React.FC<LogoProps> = ({delay = 0, width = 380}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - delay;

  const opacity = interpolate(localFrame, [0, 26], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(localFrame, [0, 26], [0.85, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <Img
      src={logoSrc}
      style={{
        width,
        opacity,
        transform: `scale(${scale})`,
      }}
    />
  );
};
