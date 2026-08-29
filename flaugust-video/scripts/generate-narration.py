#!/usr/bin/env python3
"""
Génère la voix off (audio/narration.mp3) de la vidéo Formation Import-Export
Chine-Tchad, synchronisée avec les 5 scènes de la composition Remotion.

Ordre de préférence des moteurs vocaux :
  1. ElevenLabs (voix masculine chaleureuse, si ELEVENLABS_API_KEY est défini)
  2. gTTS / Google Translate TTS (voix française standard)
  3. espeak-ng + mbrola (voix masculine française hors-ligne, secours local)

Le texte est découpé exactement selon les 5 scènes ; chaque extrait est
synthétisé séparément puis calé sur le timecode de sa scène (0s, 12s, 28s,
42s, 54s), avec un padding de silence pour obtenir une piste finale de
exactement 60 secondes.

Usage :
    python3 scripts/generate-narration.py
    ELEVENLABS_API_KEY=xxx ELEVENLABS_VOICE_ID=xxx python3 scripts/generate-narration.py
"""

import os
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_MP3 = os.path.join(ROOT, "src", "audio", "narration.mp3")

# (texte, début de la scène en secondes, durée de la scène en secondes)
SCENES = [
    (
        "Vous voulez importer depuis la Chine, mais vous ne savez pas par où "
        "commencer ? Cette formation va tout changer.",
        0,
        12,
    ),
    (
        "Je suis LUBAMA Jean Chrysostome ZACEI, Directeur Général de Flaugust "
        "Business. Depuis des années, j'accompagne les entrepreneurs tchadiens "
        "vers le commerce international.",
        12,
        16,
    ),
    (
        "La Formation Import-Export Chine-Tchad, c'est 24 sessions, 48 heures "
        "de formation pratique, et à la fin, votre propre dossier d'importation "
        "complet et validé.",
        28,
        14,
    ),
    (
        "Rejoignez la Promotion 1 pour seulement 35 000 FCFA en deux tranches. "
        "Contactez-nous sur Airtel Money ou Moov Money.",
        42,
        12,
    ),
    (
        "Flaugust Business. Réflexion, Action, Impact.",
        54,
        6,
    ),
]

TOTAL_DURATION = 60


def have(cmd):
    return shutil.which(cmd) is not None


def try_elevenlabs(text, out_wav):
    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        return False
    voice_id = os.environ.get("ELEVENLABS_VOICE_ID", "pNInz6obpgDQGcFmaJgB")  # Adam
    try:
        import requests
    except ImportError:
        return False
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    try:
        r = requests.post(
            url,
            headers={
                "xi-api-key": api_key,
                "Content-Type": "application/json",
                "Accept": "audio/mpeg",
            },
            json={
                "text": text,
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {
                    "stability": 0.45,
                    "similarity_boost": 0.8,
                    "style": 0.35,
                    "use_speaker_boost": True,
                },
            },
            timeout=60,
        )
        r.raise_for_status()
        mp3_tmp = out_wav.replace(".wav", ".mp3")
        with open(mp3_tmp, "wb") as f:
            f.write(r.content)
        subprocess.run(
            ["ffmpeg", "-y", "-i", mp3_tmp, out_wav],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        return True
    except Exception as exc:  # noqa: BLE001
        print(f"  [ElevenLabs indisponible: {exc}]", file=sys.stderr)
        return False


def try_gtts(text, out_wav):
    try:
        from gtts import gTTS
    except ImportError:
        return False
    try:
        mp3_tmp = out_wav.replace(".wav", ".mp3")
        gTTS(text=text, lang="fr", slow=False).save(mp3_tmp)
        subprocess.run(
            ["ffmpeg", "-y", "-i", mp3_tmp, out_wav],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        return True
    except Exception as exc:  # noqa: BLE001
        print(f"  [gTTS indisponible: {exc}]", file=sys.stderr)
        return False


def try_espeak(text, out_wav):
    if not have("espeak-ng"):
        return False
    # mb-fr1 = voix masculine mbrola française (secours hors-ligne).
    # -s vitesse, -p hauteur (plus bas = voix plus grave et chaleureuse).
    voice = "mb-fr1" if _mbrola_voice_available() else "fr-fr"
    cmd = [
        "espeak-ng",
        "-v",
        voice,
        "-s",
        "158",
        "-p",
        "38",
        "-a",
        "180",
        "-g",
        "6",
        text,
        "-w",
        out_wav,
    ]
    try:
        subprocess.run(cmd, check=True)
        return True
    except Exception as exc:  # noqa: BLE001
        print(f"  [espeak-ng a échoué: {exc}]", file=sys.stderr)
        return False


def _mbrola_voice_available():
    return os.path.exists("/usr/share/mbrola/fr1/fr1")


def synthesize(text, out_wav):
    if try_elevenlabs(text, out_wav):
        print("  -> ElevenLabs")
        return
    if try_gtts(text, out_wav):
        print("  -> gTTS")
        return
    if try_espeak(text, out_wav):
        print("  -> espeak-ng (voix hors-ligne, secours)")
        return
    raise RuntimeError(
        "Aucun moteur TTS disponible (ElevenLabs, gTTS et espeak-ng ont tous échoué)."
    )


def get_duration(path):
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "csv=p=0",
            path,
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    return float(result.stdout.strip())


def main():
    os.makedirs(os.path.dirname(OUT_MP3), exist_ok=True)
    tmp_dir = tempfile.mkdtemp(prefix="flaugust-narration-")
    segment_files = []

    print("Génération de la narration (5 scènes)...")
    for i, (text, start, duration) in enumerate(SCENES, start=1):
        raw_wav = os.path.join(tmp_dir, f"scene{i}_raw.wav")
        padded_wav = os.path.join(tmp_dir, f"scene{i}_padded.wav")
        print(f"Scène {i} (départ {start}s, fenêtre {duration}s): {text[:60]}...")
        synthesize(text, raw_wav)

        spoken = get_duration(raw_wav)
        if spoken > duration:
            print(
                f"  ATTENTION: la voix ({spoken:.1f}s) dépasse la fenêtre de la "
                f"scène ({duration}s) - elle sera tronquée à la scène suivante.",
                file=sys.stderr,
            )

        # Complète chaque segment avec du silence pour occuper exactement la
        # fenêtre de la scène (départ de la scène suivante - départ courant).
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                raw_wav,
                "-af",
                f"apad=whole_dur={duration}",
                "-t",
                str(duration),
                "-ar",
                "44100",
                "-ac",
                "1",
                padded_wav,
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        segment_files.append(padded_wav)

    # Concatène les 5 segments en une seule piste de 60 secondes.
    concat_list = os.path.join(tmp_dir, "concat.txt")
    with open(concat_list, "w") as f:
        for seg in segment_files:
            f.write(f"file '{seg}'\n")

    final_wav = os.path.join(tmp_dir, "narration_final.wav")
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            concat_list,
            final_wav,
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            final_wav,
            "-codec:a",
            "libmp3lame",
            "-b:a",
            "128k",
            OUT_MP3,
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    total = get_duration(OUT_MP3)
    print(f"\nNarration générée: {OUT_MP3} ({total:.1f}s)")
    shutil.rmtree(tmp_dir, ignore_errors=True)


if __name__ == "__main__":
    main()
