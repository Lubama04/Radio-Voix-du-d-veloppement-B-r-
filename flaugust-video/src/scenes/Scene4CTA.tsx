import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Poppins';
import {AnimatedText} from '../components/AnimatedText';

const {fontFamily} = loadFont();

// Scène 4, Appel à l'action (42s à 54s)
// Fond terracotta, texte principal blanc grand, sous-texte, contact en bas.
export const Scene4CTA: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#A84800',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        padding: '0 140px',
      }}
    >
      <AnimatedText delay={0} durationInFrames={22} type="slide-up" distance={50}>
        <div
          style={{
            fontFamily,
            fontWeight: 800,
            fontSize: 104,
            color: '#FFFFFF',
            textAlign: 'center',
          }}
        >
          Rejoignez la Promotion 1
        </div>
      </AnimatedText>

      <AnimatedText delay={16} durationInFrames={22} type="fade">
        <div
          style={{
            fontFamily,
            fontWeight: 600,
            fontSize: 54,
            color: '#FBE2C4',
            textAlign: 'center',
            marginTop: 34,
          }}
        >
          35 000 FCFA en 2 tranches
        </div>
      </AnimatedText>

      <div style={{position: 'absolute', bottom: 92, left: 0, right: 0}}>
        <AnimatedText delay={40} durationInFrames={20} type="fade">
          <div
            style={{
              fontFamily,
              fontWeight: 500,
              fontSize: 32,
              color: '#FFFFFF',
              textAlign: 'center',
            }}
          >
            Airtel Money +235 63 73 17 87 ou Moov Money +235 95 50 17 64
          </div>
        </AnimatedText>
      </div>
    </AbsoluteFill>
  );
};
