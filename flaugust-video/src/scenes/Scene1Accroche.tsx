import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Poppins';
import {AnimatedText} from '../components/AnimatedText';

const {fontFamily} = loadFont();

// Scène 1, Accroche (0s à 12s)
// Fond terracotta, texte centré blanc, fade-in sur 20 frames.
export const Scene1Accroche: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#A84800',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 170px',
      }}
    >
      <AnimatedText delay={0} durationInFrames={20} type="fade">
        <h1
          style={{
            fontFamily,
            fontWeight: 700,
            fontSize: 92,
            lineHeight: 1.22,
            color: '#FFFFFF',
            textAlign: 'center',
            margin: 0,
          }}
        >
          Vous voulez importer depuis la Chine sans perdre votre argent ?
        </h1>
      </AnimatedText>
    </AbsoluteFill>
  );
};
