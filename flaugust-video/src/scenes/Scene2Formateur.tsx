import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Poppins';
import {AnimatedText} from '../components/AnimatedText';
import {AvatarCircle} from '../components/AvatarCircle';

const {fontFamily} = loadFont();

// Couleurs de "dos de livres" ton brun, inspirées des couvertures d'ouvrages
// de management / conseil en entreprise.
const BOOK_COLORS = ['#7a4a23', '#5c3a1e', '#8a5a2c', '#4a2f18', '#9c6b34', '#3a260f', '#6b4420', '#8f5f2e'];

interface Book {
  top: number;
  left: number;
  width: number;
  height: number;
  color: string;
}

// Générateur pseudo-aléatoire déterministe (mêmes livres à chaque rendu).
const generateBooks = (): Book[] => {
  const books: Book[] = [];
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const shelfTops = [30, 320, 610, 900];
  const shelfHeight = 250;
  shelfTops.forEach((top) => {
    let left = -60;
    while (left < 1980) {
      const width = 42 + rand() * 54;
      const height = 190 + rand() * 90;
      books.push({
        top: top + (shelfHeight - height),
        left,
        width,
        height,
        color: BOOK_COLORS[Math.floor(rand() * BOOK_COLORS.length)],
      });
      left += width + 6 + rand() * 10;
    }
  });
  return books;
};

const books = generateBooks();

// Scène 2, Présentation du formateur (12s à 28s)
// Fond bibliothèque en bokeh brun foncé (livres flous), formateur net au
// premier plan (photo uploadée), panneau de texte sombre à gauche.
export const Scene2Formateur: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#1a100a', overflow: 'hidden'}}>
      {/* Étagères de livres, floutées pour simuler la profondeur de champ */}
      <AbsoluteFill style={{filter: 'blur(8px)', opacity: 0.85}}>
        {books.map((b, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: b.top,
              left: b.left,
              width: b.width,
              height: b.height,
              backgroundColor: b.color,
              borderRadius: 4,
              boxShadow: 'inset 0 0 0 2px rgba(0,0,0,0.25)',
            }}
          />
        ))}
      </AbsoluteFill>

      {/* Planches d'étagères */}
      {[280, 570, 860].map((y, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: y,
            left: 0,
            width: 1920,
            height: 16,
            backgroundColor: '#0e0905',
            opacity: 0.75,
            filter: 'blur(3px)',
          }}
        />
      ))}

      {/* Vignette sombre pour renforcer la profondeur */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 68% 50%, rgba(0,0,0,0) 0%, rgba(8,5,2,0.8) 78%)',
        }}
      />

      {/* Panneau texte sombre à gauche, dégradé vers transparent */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(90deg, rgba(10,6,3,0.95) 0%, rgba(10,6,3,0.9) 42%, rgba(10,6,3,0) 80%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 130,
          top: 0,
          bottom: 0,
          width: 920,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <AnimatedText delay={8} durationInFrames={26} type="fade">
          <div
            style={{
              fontFamily,
              fontWeight: 700,
              fontSize: 58,
              lineHeight: 1.18,
              color: '#FFFFFF',
              marginBottom: 26,
            }}
          >
            LUBAMA Jean Chrysostome ZACEI
          </div>
        </AnimatedText>
        <AnimatedText delay={18} durationInFrames={26} type="fade">
          <div
            style={{
              fontFamily,
              fontWeight: 600,
              fontSize: 36,
              color: '#F09C3C',
              marginBottom: 18,
            }}
          >
            Directeur Général, Flaugust Business
          </div>
        </AnimatedText>
        <AnimatedText delay={28} durationInFrames={26} type="fade">
          <div
            style={{
              fontFamily,
              fontWeight: 400,
              fontSize: 30,
              color: '#E8D9C8',
            }}
          >
            Expert Import-Export Chine-Afrique
          </div>
        </AnimatedText>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 130,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      >
        <AvatarCircle delay={0} size={620} shape="rounded" />
      </div>
    </AbsoluteFill>
  );
};
