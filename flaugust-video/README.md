# Vidéo de présentation, Formation Import-Export Chine-Tchad

Vidéo de présentation Remotion (60 secondes, 1920x1080, 30 im/s) pour la
Formation Import-Export Chine-Tchad de Flaugust Business, dispensée par
LUBAMA Jean Chrysostome ZACEI.

## Aperçu

- **Durée** : exactement 60 secondes (1800 frames à 30 im/s)
- **Format** : 1920x1080, 16/9, H.264, piste audio AAC
- **Taille du rendu final** : environ 3,3 Mo (cible : moins de 15 Mo, pour un
  envoi WhatsApp / une publication Facebook sans consommer trop de données)
- **5 scènes enchaînées** : accroche, présentation du formateur, présentation
  de la formation, appel à l'action, clôture

## Installation

```bash
cd flaugust-video
npm install
```

## Aperçu en direct (Remotion Studio)

```bash
npm start
```

## Rendu de la vidéo finale

```bash
npm run build
# équivalent à :
npx remotion render src/index.tsx FormationFlaugust out/formation_flaugust_60s.mp4 --codec h264
```

Le fichier est généré dans `out/formation_flaugust_60s.mp4`.

## Structure du projet

```
flaugust-video/
  src/
    index.tsx               point d'entrée Remotion (registerRoot)
    Root.tsx                composition principale (60s, 30fps, 1920x1080)
    global.d.ts              déclarations TypeScript pour les imports d'assets
    scenes/
      Scene1Accroche.tsx      0s -> 12s
      Scene2Formateur.tsx     12s -> 28s
      Scene3Formation.tsx     28s -> 42s
      Scene4CTA.tsx           42s -> 54s
      Scene5Cloture.tsx       54s -> 60s
    components/
      AnimatedText.tsx        fade / slide, piloté par useCurrentFrame + interpolate
      AvatarCircle.tsx        photo du formateur, cadre arrondi, glissement depuis la droite
      ColorBlock.tsx          bloc coloré animé (scène 3)
      Logo.tsx                logo Flaugust Business (scène 5)
    audio/
      narration.mp3           voix off, synchronisée scène par scène
    assets/
      avatar.jpg               photo du formateur (recadrage centré visage)
      logo.png / logo-source.svg   logo Flaugust Business (badge + wordmark)
  scripts/
    generate-narration.py     génération de la voix off (voir ci-dessous)
  package.json
  remotion.config.ts
  tsconfig.json
```

Toutes les animations sont réalisées uniquement avec React + les hooks
`useCurrentFrame` / `interpolate` de Remotion (aucune bibliothèque de vidéo ou
d'animation externe).

## Voix off : moteur utilisé et limite de cet environnement

`scripts/generate-narration.py` essaie, dans l'ordre :

1. **ElevenLabs** (si `ELEVENLABS_API_KEY` est défini) - voix la plus naturelle.
2. **gTTS** (Google Translate TTS, `slow=False`) - bonne voix française standard.
3. **espeak-ng + mbrola (`mb-fr1`)** - voix masculine française hors-ligne, en secours.

Dans l'environnement d'exécution où cette vidéo a été générée, l'accès réseau
sortant vers `translate.google.com` et vers l'API ElevenLabs est bloqué par la
politique du bac à sable (aucune clé ElevenLabs n'était fournie non plus). Le
script est donc automatiquement retombé sur **espeak-ng**, une synthèse
vocale hors-ligne : la narration livrée dans `src/audio/narration.mp3` est
fonctionnelle et correctement synchronisée scène par scène, mais elle a un
timbre plus robotique qu'une vraie voix ElevenLabs ou gTTS.

### Régénérer une narration de meilleure qualité

Sur une machine avec accès Internet complet :

```bash
# Option recommandée : ElevenLabs (voix masculine chaleureuse)
export ELEVENLABS_API_KEY="votre_clé"
export ELEVENLABS_VOICE_ID="un_id_de_voix_masculine_fr"   # optionnel
python3 scripts/generate-narration.py

# Option de repli : gTTS
pip install gTTS
python3 scripts/generate-narration.py
```

Le script régénère `src/audio/narration.mp3` avec le texte exact des 5
scènes, calé sur les timecodes 0s / 12s / 28s / 42s / 54s. Il suffit ensuite
de relancer `npm run build` pour obtenir un nouveau rendu avec la voix
choisie.

## Couleurs officielles

| Couleur    | Code      |
|------------|-----------|
| Terracotta | `#A84800` |
| Orange     | `#F09C3C` |
| Vert       | `#00843C` |

## Police

Poppins (Google Fonts, chargée via `@remotion/google-fonts`).
