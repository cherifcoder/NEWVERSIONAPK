/* ------------------------------------------------------------------
   presets.js — Battements binauraux & ambiances du laboratoire
   ------------------------------------------------------------------
   Un battement binaural naît de la différence de fréquence entre les deux
   oreilles (ex. 200 Hz à gauche, 207,83 Hz à droite → battement 7,83 Hz).
   Il faut un casque : sans casque, les deux sons se mélangent dans l'air.

   ⚠️ Ces fréquences sont un outil de détente et de concentration, pas un
   dispositif médical. À éviter si tu es épileptique, enceinte, ou si tu
   conduis. En cas de doute, consulte un professionnel de santé.
------------------------------------------------------------------- */

export const BINAURAL_PRESETS = [
  {
    id: 'delta-sommeil',
    label: 'Delta — sommeil profond',
    beat: 2.5,
    carrier: 110,
    icon: 'MoonStar',
    color: '#4a7fd4',
    usage: 'Endormissement, récupération. À utiliser allongé.',
  },
  {
    id: 'theta-meditation',
    label: 'Thêta — méditation',
    beat: 5.5,
    carrier: 140,
    icon: 'Eye',
    color: '#8b7fd4',
    usage: 'Détente profonde, imagerie mentale, hypnose.',
  },
  {
    id: 'schumann-detente',
    label: 'Schumann — 7,83 Hz',
    beat: 7.83,
    carrier: 200,
    icon: 'Radio',
    color: '#2f9e78',
    usage: 'Résonance terrestre : apaisement, régulation du stress.',
  },
  {
    id: 'alpha-calme',
    label: 'Alpha — calme éveillé',
    beat: 10,
    carrier: 220,
    icon: 'Waves',
    color: '#cfa851',
    usage: 'Relaxation les yeux ouverts, préparation à parler.',
  },
  {
    id: 'beta-focus',
    label: 'Bêta — concentration',
    beat: 14,
    carrier: 200,
    icon: 'BrainCircuit',
    color: '#e0c07c',
    usage: 'Travail profond, lecture, code. Le plus « actif ».',
  },
  {
    id: 'gamma-eveil',
    label: 'Gamma — éveil',
    beat: 40,
    carrier: 240,
    icon: 'Zap',
    color: '#b4323c',
    usage: 'Vigilance, réveil. Peut être stimulant — à éviter le soir.',
  },
]

export const binauralFor = (id) => BINAURAL_PRESETS.find((p) => p.id === id) || null

export const HYPNOSIS_SAFETY =
  "Séance à faire assis ou allongé, jamais en conduisant. Les battements binauraux nécessitent un casque et ne remplacent aucun soin médical."
