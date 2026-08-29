import React from 'react';
import {Easing, Img, interpolate, useCurrentFrame} from 'remotion';
// eslint-disable-next-line import/extensions
import avatarSrc from '../assets/avatar.jpg';

interface AvatarCircleProps {
  /** Frame de départ (relative à la scène) de l'animation de glissement. */
  delay?: number;
  size?: number;
  shape?: 'circle' | 'rounded';
  /** Distance, en pixels, depuis laquelle la photo glisse (vient de la droite). */
  slideDistance?: number;
}

/**
 * Avatar du formateur : glisse depuis la droite puis se stabilise dans un
 * cadre circulaire ou rectangle arrondi, avec un léger effet d'ombre pour le
 * détacher du fond bibliothèque en bokeh.
 */
export const AvatarCircle: React.FC<AvatarCircleProps> = ({
  delay = 0,
  size = 600,
  shape = 'rounded',
  slideDistance = 480,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - delay;

  const progress = interpolate(localFrame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const translateX = interpolate(progress, [0, 1], [slideDistance, 0]);
  const opacity = interpolate(localFrame, [0, 22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        transform: `translateX(${translateX}px)`,
        opacity,
        width: size,
        height: size,
        borderRadius: shape === 'circle' ? '50%' : 56,
        overflow: 'hidden',
        border: '10px solid #F09C3C',
        boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
        flexShrink: 0,
      }}
    >
      <Img
        src={avatarSrc}
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
      />
    </div>
  );
};
