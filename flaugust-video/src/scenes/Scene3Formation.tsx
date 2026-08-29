import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Poppins';
import {ColorBlock} from '../components/ColorBlock';

const {fontFamily} = loadFont();

// Scène 3, Présentation de la formation (28s à 42s)
// Fond blanc, trois blocs colorés qui apparaissent en séquence, animation de
// bas en haut.
export const Scene3Formation: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div style={{display: 'flex', flexDirection: 'column', gap: 44, width: 1420}}>
        <ColorBlock color="#A84800" delay={0} fontFamily={fontFamily}>
          24 sessions, 8 semaines
        </ColorBlock>
        <ColorBlock color="#F09C3C" delay={30} fontFamily={fontFamily}>
          48 heures de formation pratique
        </ColorBlock>
        <ColorBlock color="#00843C" delay={60} fontFamily={fontFamily}>
          Votre dossier d&apos;importation complet
        </ColorBlock>
      </div>
    </AbsoluteFill>
  );
};
