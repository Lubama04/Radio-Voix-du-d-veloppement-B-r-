import React from 'react';
import {AbsoluteFill, Audio, Composition, Sequence} from 'remotion';
// eslint-disable-next-line import/extensions
import narrationSrc from './audio/narration.mp3';
import {Scene1Accroche} from './scenes/Scene1Accroche';
import {Scene2Formateur} from './scenes/Scene2Formateur';
import {Scene3Formation} from './scenes/Scene3Formation';
import {Scene4CTA} from './scenes/Scene4CTA';
import {Scene5Cloture} from './scenes/Scene5Cloture';

export const FPS = 30;
export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;
export const TOTAL_DURATION_IN_FRAMES = 60 * FPS; // 1800 frames = 60 secondes

// Découpage des 5 scènes enchaînées (en secondes, converti en frames).
const SCENES: {Component: React.FC; from: number; duration: number}[] = [
  {Component: Scene1Accroche, from: 0, duration: 12 * FPS}, // 0s -> 12s
  {Component: Scene2Formateur, from: 12 * FPS, duration: 16 * FPS}, // 12s -> 28s
  {Component: Scene3Formation, from: 28 * FPS, duration: 14 * FPS}, // 28s -> 42s
  {Component: Scene4CTA, from: 42 * FPS, duration: 12 * FPS}, // 42s -> 54s
  {Component: Scene5Cloture, from: 54 * FPS, duration: 6 * FPS}, // 54s -> 60s
];

// Composition principale : les 5 scènes enchaînées dans des <Sequence>,
// avec la narration synchronisée en piste audio unique.
export const FormationFlaugustVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#000000'}}>
      {SCENES.map(({Component, from, duration}, index) => (
        <Sequence key={index} from={from} durationInFrames={duration}>
          <Component />
        </Sequence>
      ))}
      <Audio src={narrationSrc} />
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="FormationFlaugust"
      component={FormationFlaugustVideo}
      durationInFrames={TOTAL_DURATION_IN_FRAMES}
      fps={FPS}
      width={VIDEO_WIDTH}
      height={VIDEO_HEIGHT}
    />
  );
};
