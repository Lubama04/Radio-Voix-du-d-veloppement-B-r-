import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';

interface ColorBlockProps {
  color: string;
  /** Frame de départ (relative à la scène) de l'animation d'entrée. */
  delay: number;
  children: React.ReactNode;
  fontFamily?: string;
}

/**
 * Bloc coloré qui apparaît avec une légère animation de bas en haut,
 * combinée à un fade-in.
 */
export const ColorBlock: React.FC<ColorBlockProps> = ({color, delay, children, fontFamily}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - delay;

  const progress = interpolate(localFrame, [0, 24], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const translateY = interpolate(progress, [0, 1], [70, 0]);
  const opacity = interpolate(localFrame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        transform: `translateY(${translateY}px)`,
        opacity,
        backgroundColor: color,
        borderRadius: 32,
        padding: '52px 64px',
        boxShadow: '0 24px 48px rgba(0,0,0,0.16)',
      }}
    >
      <span
        style={{
          fontFamily,
          fontWeight: 700,
          fontSize: 48,
          color: '#FFFFFF',
          textAlign: 'center',
          display: 'block',
        }}
      >
        {children}
      </span>
    </div>
  );
};
