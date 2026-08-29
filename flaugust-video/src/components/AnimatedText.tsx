import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';

export type AnimationType = 'fade' | 'slide-up' | 'slide-left' | 'slide-right';

interface AnimatedTextProps {
  children: React.ReactNode;
  /** Nombre de frames à attendre, depuis le début de la scène, avant de démarrer l'animation. */
  delay?: number;
  /** Durée de l'animation d'entrée, en frames. */
  durationInFrames?: number;
  type?: AnimationType;
  /** Distance de glissement en pixels (pour slide-up / slide-left / slide-right). */
  distance?: number;
  style?: React.CSSProperties;
}

/**
 * Enveloppe de texte animée : fade-in et/ou glissement, pilotés uniquement
 * par useCurrentFrame() + interpolate() (aucune bibliothèque d'animation externe).
 */
export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  delay = 0,
  durationInFrames = 20,
  type = 'fade',
  distance = 40,
  style,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - delay;

  const opacity = interpolate(localFrame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const progress = interpolate(localFrame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  let transform = 'none';
  if (type === 'slide-up') {
    const y = interpolate(progress, [0, 1], [distance, 0]);
    transform = `translateY(${y}px)`;
  } else if (type === 'slide-left') {
    const x = interpolate(progress, [0, 1], [distance, 0]);
    transform = `translateX(${x}px)`;
  } else if (type === 'slide-right') {
    const x = interpolate(progress, [0, 1], [-distance, 0]);
    transform = `translateX(${x}px)`;
  }

  return (
    <div style={{opacity, transform, ...style}}>
      {children}
    </div>
  );
};
