import { Config } from '@remotion/cli/config';

// Cible : MP4 léger (<15 Mo) pour un envoi WhatsApp / Facebook sans
// consommer trop de données mobiles, tout en restant net sur smartphone.
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setCodec('h264');
Config.setCrf(28);
Config.setPixelFormat('yuv420p');
Config.setConcurrency(2);

// L'environnement de build passe par un proxy sortant qui re-signe le TLS ;
// nécessaire pour que Chromium puisse charger les polices Google Fonts.
Config.setChromiumIgnoreCertificateErrors(true);
