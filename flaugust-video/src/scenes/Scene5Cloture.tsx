import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Poppins';
import {Logo} from '../components/Logo';

const {fontFamily} = loadFont();

// Scène 5, Clôture (54s à 60s)
// Logo Flaugust Business centré, devise en dessous, fond terracotta qui
// s'assombrit progressivement.
export const Scene5Cloture: React.FC = () => {
  const frame = useCurrentFrame();

  // Assombrissement progressif sur les 6 secondes (180 frames) de la scène.
  const darken = interpolate(frame, [0, 180], [0, 0.6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#A84800',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <Logo delay={0} width={380} />
      <div
        style={{
          marginTop: 46,
          fontFamily,
          fontWeight: 600,
          fontSize: 44,
          color: '#FFFFFF',
          letterSpacing: 2,
          opacity: interpolate(frame, [10, 36], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        Réflexion, Action, Impact
      </div>
      <AbsoluteFill style={{backgroundColor: '#000000', opacity: darken}} />
    </AbsoluteFill>
  );
};
