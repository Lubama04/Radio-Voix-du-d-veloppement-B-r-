-- ============================================================
-- Migration 003 — Données de démonstration (seed)
-- ============================================================

-- Émissions phares de démonstration
insert into public.emissions (titre, description, categorie_id, animateur, langue, phare, actif) values
  ('Journal de la Tandjilé',
   'Le journal parlé de référence de la province de la Tandjilé. Actualités locales, nationales et internationales.',
   (select id from public.categories_emissions where slug = 'journal'),
   'Équipe Rédaction', 'français', true, true),

  ('Voix des Champs',
   'Émission dédiée aux agriculteurs et éleveurs de la Tandjilé. Conseils pratiques, météo, prix des marchés.',
   (select id from public.categories_emissions where slug = 'agriculture'),
   'Animateur Agriculture', 'français', true, true),

  ('Santé pour Tous',
   'Sensibilisation à la santé communautaire avec des professionnels de santé de la province.',
   (select id from public.categories_emissions where slug = 'sante'),
   'Animatrice Santé', 'français', true, true),

  ('Jeunesse en Action',
   'L émission des jeunes de Béré et de la Tandjilé. Entrepreneuriat, éducation, culture et sport.',
   (select id from public.categories_emissions where slug = 'jeunesse'),
   'Animateur Jeunesse', 'français', true, true),

  ('Femme et Développement',
   'L émission dédiée aux femmes de la Tandjilé. Droits, santé, économie et autonomisation.',
   (select id from public.categories_emissions where slug = 'femme'),
   'Animatrice Femme', 'français', true, true),

  ('Débat Citoyen',
   'Tribune ouverte aux citoyens de Béré pour débattre des enjeux locaux et de développement.',
   (select id from public.categories_emissions where slug = 'debat'),
   'Modérateur', 'français', false, true),

  ('Musique du Monde',
   'Le meilleur de la musique africaine et internationale. Afrobeat, gospel, musique traditionnelle tchadienne.',
   (select id from public.categories_emissions where slug = 'musique'),
   'DJ Radio Béré', 'français', false, true),

  ('Message Religieux du Matin',
   'Méditation matinale et message d espérance pour commencer la journée.',
   (select id from public.categories_emissions where slug = 'religion'),
   'Pasteur / Imam', 'français', false, true)
on conflict do nothing;

-- Grille de programmes (exemple lundi-vendredi)
-- Lundi = 1, Mardi = 2, Mercredi = 3, Jeudi = 4, Vendredi = 5
insert into public.programmes
  (emission_id, titre, animateur, jour_semaine, heure_debut, heure_fin, categorie_id, actif)
select
  e.id,
  e.titre,
  e.animateur,
  s.jour,
  t.debut::time,
  t.fin::time,
  e.categorie_id,
  true
from public.emissions e
cross join (values (1),(2),(3),(4),(5)) as s(jour)
cross join (
  values
    ('06:00','06:05'),
    ('06:05','06:30'),
    ('07:00','07:30'),
    ('08:00','09:00'),
    ('10:00','11:00'),
    ('12:00','12:30'),
    ('14:00','15:00'),
    ('16:00','17:00'),
    ('18:00','18:30'),
    ('20:00','21:00')
) as t(debut, fin)
where e.titre = 'Journal de la Tandjilé' and t.debut in ('06:05','12:00','18:00')
  and s.jour between 1 and 5
on conflict do nothing;

-- Quelques programmes fixes
insert into public.programmes
  (emission_id, titre, animateur, jour_semaine, heure_debut, heure_fin, categorie_id, actif)
values
  (
    (select id from public.emissions where titre = 'Message Religieux du Matin' limit 1),
    'Message Religieux du Matin', 'Pasteur / Imam', 1, '06:00', '06:30',
    (select id from public.categories_emissions where slug = 'religion'), true
  ),
  (
    (select id from public.emissions where titre = 'Voix des Champs' limit 1),
    'Voix des Champs', 'Animateur Agriculture', 1, '08:00', '09:00',
    (select id from public.categories_emissions where slug = 'agriculture'), true
  ),
  (
    (select id from public.emissions where titre = 'Santé pour Tous' limit 1),
    'Santé pour Tous', 'Animatrice Santé', 2, '10:00', '11:00',
    (select id from public.categories_emissions where slug = 'sante'), true
  ),
  (
    (select id from public.emissions where titre = 'Jeunesse en Action' limit 1),
    'Jeunesse en Action', 'Animateur Jeunesse', 3, '16:00', '17:00',
    (select id from public.categories_emissions where slug = 'jeunesse'), true
  ),
  (
    (select id from public.emissions where titre = 'Femme et Développement' limit 1),
    'Femme et Développement', 'Animatrice Femme', 4, '14:00', '15:00',
    (select id from public.categories_emissions where slug = 'femme'), true
  ),
  (
    (select id from public.emissions where titre = 'Débat Citoyen' limit 1),
    'Débat Citoyen', 'Modérateur', 5, '20:00', '21:00',
    (select id from public.categories_emissions where slug = 'debat'), true
  )
on conflict do nothing;

-- Articles de démonstration
insert into public.actualites (titre, contenu, extrait, categorie_id, auteur, a_la_une, ticker, publie) values
  (
    'La Voix du Développement de Béré désormais disponible en ligne',
    'La Radio La Voix du Développement de Béré, émettant sur la fréquence 96.7 FM depuis la ville de Béré dans la province de la Tandjilé, franchit un cap numérique majeur avec le lancement de son site web officiel et de son application web progressive (PWA). Les auditeurs peuvent désormais suivre la radio depuis partout dans le monde grâce au streaming en ligne, réécouter les émissions en podcast et rester informés des actualités locales.',
    'La Radio 96.7 FM lance son site web officiel et son streaming en ligne.',
    (select id from public.categories_actualites where slug = 'local'),
    'Rédaction Voix de Béré', true, true, true
  ),
  (
    'Résultats des campagnes agricoles dans la province de la Tandjilé',
    'La saison agricole 2026 dans la province de la Tandjilé affiche des résultats encourageants selon les données preliminaires communiquées par les services agricoles provinciaux. Les cultures de mil, sorgho et coton montrent des rendements supérieurs aux estimations initiales, grâce notamment aux bonnes pluies enregistrées cette année.',
    'La saison agricole 2026 affiche des résultats encourageants dans la Tandjilé.',
    (select id from public.categories_actualites where slug = 'agriculture'),
    'Correspondant Tandjilé', false, true, true
  ),
  (
    'Campagne de vaccination : objectifs atteints dans le département de la Tandjilé Centre',
    'La campagne de vaccination contre la rougeole et la poliomyélite menée dans le département de la Tandjilé Centre a atteint ses objectifs de couverture avec plus de 85% des enfants de moins de 5 ans vaccinés selon le district sanitaire de Béré.',
    'La campagne de vaccination atteint 85% de couverture dans le département.',
    (select id from public.categories_actualites where slug = 'sante'),
    'Correspondant Santé', false, false, true
  )
on conflict do nothing;

-- Messages ticker
insert into public.ticker_messages (texte, lien_url, priorite, actif) values
  ('🔴 EN DIRECT — Écoutez La Voix du Développement de Béré sur 96.7 FM', '/radio', 5, true),
  ('📻 Nouveau site web lancé — Retrouvez toutes nos émissions en podcast', '/radio', 4, true),
  ('📞 Contactez-nous sur WhatsApp pour participer à nos émissions', '/contact', 3, true)
on conflict do nothing;

-- Partenaires de démonstration
insert into public.partenaires (nom, description, categorie, type_partenariat, actif, ordre_affichage) values
  ('UNICEF Tchad',         'Fonds des Nations Unies pour l enfance — Partenaire santé et éducation',         'onu',           'editorial',     true, 1),
  ('FAO Tchad',            'Organisation des Nations Unies pour l alimentation — Partenaire agriculture',    'onu',           'editorial',     true, 2),
  ('UNESCO',               'Organisation des Nations Unies pour l éducation, la science et la culture',      'onu',           'formation',     true, 3),
  ('Mairie de Béré',       'Commune de Béré — Partenaire institutionnel local',                               'gouvernemental','institutionnel', true, 4),
  ('Gouvernorat Tandjilé', 'Gouvernorat de la Province de la Tandjilé',                                      'gouvernemental','institutionnel', true, 5)
on conflict do nothing;

