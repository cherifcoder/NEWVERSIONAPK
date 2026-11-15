/* ------------------------------------------------------------------
   figure.js — Moteur d'illustration vectorielle paramétrique
   ------------------------------------------------------------------
   Principe : au lieu d'images bitmap (lourdes, à télécharger) ou d'une
   IA générative (réseau requis), on décrit chaque posture par un petit
   jeu d'angles articulaires. Le rendu SVG est calculé à la volée.

   Conséquences :
     • style garanti cohérent (même squelette, même palette, mêmes
       épaisseurs de trait) → « dessin vectoriel épuré » constant ;
     • poids nul (quelques centaines d'octets par posture) donc
       disponible hors-ligne sans aucun téléchargement ;
     • modifiable à l'infini (une nouvelle posture = 6 nombres) ;
     • réutilisable côté Node (scripts/generate-nonverbal.mjs exporte
       les mêmes postures en fichiers .svg).
------------------------------------------------------------------- */

const D = Math.PI / 180
const r2 = (n) => Math.round(n * 100) / 100
const pt = ([x, y]) => `${r2(x)},${r2(y)}`

/* ==================================================================
   1. CINÉMATIQUE — angles articulaires → points du squelette
   ------------------------------------------------------------------
   Convention : angle 0 = segment dirigé vers le bas (0, +len).
   Angle positif = rotation vers la droite de l'écran (+x).
   Le buste part de la hanche et monte (vers -y).
   ================================================================== */

export const skeleton = (pose = {}) => {
  const {
    hip = [50, 58],
    torso = 0,
    torsoLen = 17,
    headTilt = 0,
    neckLen = 3.4,
    headR = 5.4,
    shoulderW = 5.0,
    upperArm = 9.4,
    foreArm = 8.8,
    thigh = 10.8,
    shin = 10.8,
    armL = [14, 26],
    armR = [-13, -24],
    legL = [8, 4],
    legR = [-8, -4],
  } = pose

  const [hx, hy] = hip
  const neck = [hx + torsoLen * Math.sin(torso * D), hy - torsoLen * Math.cos(torso * D)]
  const headAxis = (torso + headTilt) * D
  const headC = [neck[0] + (neckLen + headR) * Math.sin(headAxis), neck[1] - (neckLen + headR) * Math.cos(headAxis)]

  // Perpendiculaire à l'axe du buste → largeur d'épaules
  const px = Math.cos(torso * D)
  const py = Math.sin(torso * D)
  const shoulderNear = [neck[0] + shoulderW * px, neck[1] + shoulderW * py]
  const shoulderFar = [neck[0] - shoulderW * px, neck[1] - shoulderW * py]

  const hipNear = [hx + 2.2, hy]
  const hipFar = [hx - 2.2, hy]

  const limb = (origin, len1, len2, [a1, a2]) => {
    const mid = [origin[0] + len1 * Math.sin(a1 * D), origin[1] + len1 * Math.cos(a1 * D)]
    const end = [mid[0] + len2 * Math.sin(a2 * D), mid[1] + len2 * Math.cos(a2 * D)]
    return { origin, mid, end }
  }

  return {
    hip: [hx, hy],
    neck,
    headC,
    headR,
    shoulderNear,
    shoulderFar,
    armNear: limb(shoulderNear, upperArm, foreArm, armL),
    armFar: limb(shoulderFar, upperArm, foreArm, armR),
    legNear: limb(hipNear, thigh, shin, legL),
    legFar: limb(hipFar, thigh, shin, legR),
    axisAngle: torso,
  }
}

/* ==================================================================
   2. PALETTES — « cabinet d'élite » (sombre) et « studio » (clair)
   ================================================================== */

const THEMES = {
  dark: {
    bg: 'transparent',
    floor: 'rgba(207,168,81,0.22)',
    body: '#f4f1ea',
    bodyFar: 'rgba(244,241,234,0.42)',
    accent: '#cfa851',
    accentSoft: 'rgba(207,168,81,0.28)',
    prop: 'rgba(154,160,181,0.55)',
    propSoft: 'rgba(154,160,181,0.18)',
    text: '#9aa0b5',
    title: '#f7ecd0',
    halo: 'rgba(207,168,81,0.10)',
  },
  light: {
    bg: 'transparent',
    floor: 'rgba(29,33,54,0.22)',
    body: '#1d2136',
    bodyFar: 'rgba(29,33,54,0.38)',
    accent: '#b98d34',
    accentSoft: 'rgba(185,141,52,0.30)',
    prop: 'rgba(29,33,54,0.5)',
    propSoft: 'rgba(29,33,54,0.14)',
    text: '#5b6178',
    title: '#1d2136',
    halo: 'rgba(185,141,52,0.10)',
  },
}

export const theme = (name) => THEMES[name] || THEMES.dark

/* ==================================================================
   3. PRIMITIVES DE DESSIN
   ================================================================== */

const stroke = (points, width, color, extra = '') =>
  `<polyline points="${points.map(pt).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`

const disc = ([x, y], r, fill, extra = '') => `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="${fill}" ${extra}/>`

/* --- Accessoires --- */

const propDoor = (t) => `
  <g stroke="${t.prop}" fill="none" stroke-width="2.6" stroke-linejoin="round">
    <rect x="66" y="20" width="24" height="66" rx="1.5"/>
    <line x1="78" y1="20" x2="78" y2="86" stroke="${t.propSoft}"/>
    <path d="M66 24 A 20 20 0 0 1 62 60" stroke="${t.accentSoft}" stroke-dasharray="3 3"/>
  </g>
  <circle cx="86" cy="53" r="1.6" fill="${t.accent}"/>`

const propChair = (t) => `
  <g stroke="${t.prop}" fill="none" stroke-width="2.6" stroke-linecap="round">
    <line x1="42" y1="60" x2="66" y2="60"/>
    <line x1="64" y1="60" x2="64" y2="34"/>
    <line x1="42" y1="60" x2="42" y2="82"/>
    <line x1="66" y1="60" x2="66" y2="82"/>
  </g>`

const propTable = (t) => `
  <g stroke="${t.prop}" fill="none" stroke-width="2.6" stroke-linecap="round">
    <line x1="30" y1="52" x2="82" y2="52"/>
    <line x1="36" y1="52" x2="36" y2="82"/>
    <line x1="76" y1="52" x2="76" y2="82"/>
  </g>`

const propMic = (t) => `
  <g stroke="${t.prop}" fill="none" stroke-width="2.6" stroke-linecap="round">
    <line x1="84" y1="86" x2="84" y2="46"/>
    <line x1="78" y1="86" x2="90" y2="86"/>
  </g>
  ${disc([84, 42], 4.2, t.propSoft)}
  ${disc([84, 42], 4.2, 'none', `stroke="${t.prop}" stroke-width="2"`)}`

const propMirror = (t) => `
  <g stroke="${t.prop}" fill="none" stroke-width="2.6">
    <rect x="70" y="16" width="22" height="56" rx="10"/>
    <line x1="81" y1="72" x2="81" y2="86"/>
  </g>`

const silhouette = ([x, y], s, t) => `
  <g opacity="0.5" stroke="${t.prop}" fill="none" stroke-width="${2.2 * s}" stroke-linecap="round">
    <circle cx="${r2(x)}" cy="${r2(y - 10 * s)}" r="${r2(3.4 * s)}"/>
    <path d="M${r2(x)} ${r2(y - 6 * s)} L${r2(x)} ${r2(y)}" stroke-width="${r2(5 * s)}"/>
    <path d="M${r2(x - 4 * s)} ${r2(y - 3 * s)} L${r2(x + 4 * s)} ${r2(y - 3 * s)}"/>
    <path d="M${r2(x)} ${r2(y)} L${r2(x - 3 * s)} ${r2(y + 8 * s)} M${r2(x)} ${r2(y)} L${r2(x + 3 * s)} ${r2(y + 8 * s)}"/>
  </g>`

const propCrowd = (t) => `
  ${silhouette([16, 84], 1.15, t)}
  ${silhouette([30, 84], 0.95, t)}
  ${silhouette([10, 84], 0.85, t)}`

const propPath = (t) => `
  <g stroke="${t.accent}" fill="none" stroke-width="1.8" stroke-dasharray="4 4" opacity="0.75">
    <line x1="14" y1="88" x2="44" y2="88"/>
  </g>
  <path d="M44 88 l-4 -2.6 v5.2 z" fill="${t.accent}" opacity="0.8"/>`

const propGaze = (t) => `
  <g stroke="${t.accent}" fill="none" stroke-width="1.6" stroke-dasharray="3 3" opacity="0.8">
    <line x1="56" y1="30" x2="86" y2="30"/>
  </g>
  ${disc([88, 30], 2.2, t.accent)}`

const propPodium = (t) => `
  <g stroke="${t.prop}" fill="none" stroke-width="2.6" stroke-linejoin="round">
    <path d="M74 50 l12 -6 v42 h-12 z"/>
  </g>`

export const PROPS = {
  door: propDoor,
  chair: propChair,
  table: propTable,
  mic: propMic,
  mirror: propMirror,
  crowd: propCrowd,
  path: propPath,
  gaze: propGaze,
  podium: propPodium,
}

/* ==================================================================
   4. FIGURE — rendu d'une posture
   ================================================================== */

/**
 * Rend une posture en SVG.
 * @param {object} pose   angles articulaires (cf. skeleton)
 * @param {object} opts   { theme, showAxis, props[], width }
 */
export const figureSvg = (pose = {}, opts = {}) => {
  const { theme: themeName = 'dark', showAxis = false, props = [], width = 6.6 } = opts
  const t = theme(themeName)
  const s = skeleton(pose)
  const near = s.armNear
  const far = s.armFar
  const legN = s.legNear
  const legF = s.legFar

  const foot = (l) => stroke([[l.end[0] - 2.6, l.end[1]], [l.end[0] + 3.2, l.end[1]]], 3.2, t.body)
  const footFar = (l) => stroke([[l.end[0] - 2.4, l.end[1]], [l.end[0] + 2.8, l.end[1]]], 3, t.bodyFar)

  const axis = showAxis
    ? `<line x1="${r2(s.headC[0])}" y1="${r2(s.headC[1] - s.headR - 2)}" x2="${r2(s.hip[0])}" y2="88"
         stroke="${t.accent}" stroke-width="1.3" stroke-dasharray="5 4" opacity="0.7"/>
       <line x1="${r2(s.headC[0] - 8)}" y1="${r2(s.headC[1])}" x2="${r2(s.headC[0] + 8)}" y2="${r2(s.headC[1])}"
         stroke="${t.accentSoft}" stroke-width="1.2" opacity="0.9"/>`
    : ''

  return `
  <g>
    ${props.map((p) => (PROPS[p] ? PROPS[p](t) : '')).join('')}
    ${axis}
    <line x1="6" y1="88" x2="94" y2="88" stroke="${t.floor}" stroke-width="1.6"/>
    <!-- membres éloignés (arrière-plan) -->
    ${stroke([legF.origin, legF.mid, legF.end], 5.2, t.bodyFar)}
    ${footFar(legF)}
    ${stroke([far.origin, far.mid, far.end], 4.2, t.bodyFar)}
    ${disc(far.end, 1.7, t.bodyFar)}
    <!-- buste + tête -->
    ${stroke([s.neck, s.hip], width, t.body)}
    ${disc(s.headC, s.headR, 'none', `stroke="${t.body}" stroke-width="${width * 0.52}"`)}
    <!-- membres proches (premier plan) -->
    ${stroke([legN.origin, legN.mid, legN.end], 5.6, t.body)}
    ${foot(legN)}
    ${stroke([near.origin, near.mid, near.end], 4.6, t.body)}
    ${disc(near.end, 1.9, t.accent)}
  </g>`
}

/* ==================================================================
   5. POSTURES — bibliothèque pédagogique
   ------------------------------------------------------------------
   Chaque posture = un identifiant stable (utilisé par les leçons et par
   le script d'export), un libellé, une intention, et les angles.
   ================================================================== */

export const POSES = {
  'stand-neutral': {
    label: 'Debout — axe vertical',
    intent: 'Poids réparti, épaules basses, menton parallèle au sol.',
    props: ['gaze'],
    showAxis: true,
    pose: { hip: [50, 58], torso: -2, headTilt: 0, armL: [10, 16], armR: [-10, -16], legL: [5, 2], legR: [-5, -2] },
  },
  'enter-stop': {
    label: 'Entrer et s\'arrêter',
    intent: 'Franchir le seuil, faire deux pas, s\'arrêter net au centre. On te voit.',
    props: ['door', 'path'],
    showAxis: true,
    pose: { hip: [50, 58], torso: -1, armL: [16, 24], armR: [-8, -14], legL: [9, 3], legR: [-4, -1] },
  },
  'enter-scan': {
    label: 'Balayer la pièce',
    intent: 'Une seconde de scan : tu repères la table, l\'issue, les visages. Puis tu avances.',
    props: ['crowd', 'gaze'],
    pose: { hip: [50, 58], torso: -3, headTilt: -6, armL: [12, 18], armR: [-12, -18], legL: [6, 2], legR: [-6, -2] },
  },
  'seat-upright': {
    label: 'Posture assise',
    intent: 'Dos droit sans raideur, avant-bras sur la table, pieds à plat, mains visibles.',
    props: ['chair', 'table'],
    showAxis: true,
    pose: {
      hip: [52, 62], torso: -6, headTilt: 1, neckLen: 3.2, shoulderW: 4.8,
      armL: [34, 76], armR: [-16, -30], legL: [72, 84], legR: [66, 82], thigh: 9, shin: 9,
    },
  },
  'handshake': {
    label: 'Serrer une main',
    intent: 'Regard direct, deux secousses, pression ferme et brève. Tu relâches le premier.',
    props: ['gaze'],
    pose: { hip: [50, 58], torso: -4, headTilt: 0, armL: [74, 96], armR: [-12, -20], legL: [5, 2], legR: [-5, -2] },
  },
  'present-open': {
    label: 'Se présenter',
    intent: 'Prénom, rôle, une intention. Paumes ouvertes, débit lent, silence après.',
    props: ['mic'],
    pose: { hip: [50, 58], torso: -2, headTilt: 1, armL: [42, 62], armR: [-40, -58], legL: [6, 2], legR: [-6, -2] },
  },
  'listen-active': {
    label: 'Écoute active',
    intent: 'Corps orienté vers l\'autre, tête légèrement inclinée, aucune interruption.',
    pose: { hip: [50, 58], torso: -5, headTilt: 7, armL: [22, 52], armR: [-22, -52], legL: [5, 2], legR: [-5, -2] },
  },
  'speak-gesture': {
    label: 'Prise de parole',
    intent: 'Une idée, un geste. La main ponctue la fin de la phrase, puis retombe.',
    props: ['podium'],
    pose: { hip: [50, 58], torso: -3, headTilt: -2, armL: [58, 78], armR: [-26, -44], legL: [7, 3], legR: [-7, -3] },
  },
  'ask-service': {
    label: 'Demander un service',
    intent: 'Approche frontale, 1,20 m, demande courte + raison + porte de sortie pour l\'autre.',
    props: ['table'],
    pose: { hip: [50, 58], torso: -8, headTilt: 2, armL: [30, 58], armR: [-14, -34], legL: [10, 4], legR: [-8, -2] },
  },
  'exit-turn': {
    label: 'Sortir d\'une pièce',
    intent: 'Se lever, saluer d\'un regard, tourner les épaules en dernier. Pas de fuite.',
    props: ['door'],
    pose: { hip: [50, 58], torso: 2, headTilt: -8, armL: [10, 20], armR: [-16, -30], legL: [12, 6], legR: [-2, -8] },
  },
  'breath-low': {
    label: 'Respiration basse',
    intent: 'Ventre, pas poitrine. Trois cycles avant d\'entrer : le corps calme la tête.',
    pose: { hip: [50, 58], torso: -1, headTilt: 2, armL: [40, 88], armR: [-40, -88], legL: [5, 2], legR: [-5, -2] },
  },
  'walk-slow': {
    label: 'Marcher lentement',
    intent: '20 % plus lentement. Pas posés, regard horizontal, mains calmes.',
    props: ['path'],
    pose: { hip: [50, 58], torso: -3, headTilt: 0, armL: [26, 40], armR: [-30, -46], legL: [22, 8], legR: [-16, -30] },
  },
}

export const POSE_LIST = Object.entries(POSES).map(([id, p]) => ({ id, ...p }))

/* ==================================================================
   6. CLIP — « mini-vidéo » vectorielle animée
   ------------------------------------------------------------------
   Une séquence de postures enchaînées par fondu + barre de progression.
   C'est le substitut hors-ligne parfait d'un MP4 : ~3 Ko, net à toute
   résolution, aucune donnée réseau.
   ================================================================== */

export const clipSvg = ({ frames = [], title = '', subtitle = '', theme: themeName = 'dark', hold = 2.6 } = {}) => {
  const t = theme(themeName)
  const total = frames.length * hold
  const css = frames
    .map(
      (_, i) => `
      .fr${i} { animation: fr${i} ${total}s infinite; }
      @keyframes fr${i} {
        0% { opacity: 0; } ${r2((i * hold * 100) / total)}% { opacity: 0; }
        ${r2(((i * hold + hold * 0.12) * 100) / total)}% { opacity: 1; }
        ${r2(((i * hold + hold * 0.88) * 100) / total)}% { opacity: 1; }
        ${r2(((i + 1) * hold * 100) / total)}% { opacity: 0; } 100% { opacity: 0; }
      }`,
    )
    .join('\n')
  const dots = frames
    .map((_, i) => `<circle class="dt${i}" cx="${r2(22 + i * 7)}" cy="92" r="1.8" fill="${t.accent}"/>`)
    .join('')
  const dotCss = frames
    .map(
      (_, i) => `.dt${i} { opacity: 0.25; animation: dt${i} ${total}s infinite; }
      @keyframes dt${i} { 0%,${r2((i * hold * 100) / total)}% { opacity: 0.25; } ${r2(((i * hold + 0.2) * 100) / total)}% { opacity: 1; } ${r2(((i + 1) * hold * 100) / total)}%,100% { opacity: 0.25; } }`,
    )
    .join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs><style>
    .fig { opacity: 0; }
    ${css}
    ${dotCss}
    .bar { animation: bar ${total}s linear infinite; }
    @keyframes bar { from { width: 0; } to { width: 64px; } }
  </style></defs>
  ${frames
    .map(
      (f, i) => `<g class="fr${i}">${figureSvg(POSES[f]?.pose || {}, { theme: themeName, props: POSES[f]?.props, showAxis: POSES[f]?.showAxis })}</g>`,
    )
    .join('')}
  <text x="22" y="98" font-family="Inter, system-ui, sans-serif" font-size="5" fill="${t.text}">${subtitle || title}</text>
  ${dots}
  <rect x="22" y="86" width="0" height="1.4" fill="${t.accent}" class="bar" rx="0.7"/>
</svg>`
}

/* ==================================================================
   7. EXPORT — SVG autonome (utilisé par le script de génération)
   ================================================================== */

export const standaloneSvg = (poseId, { theme: themeName = 'dark', w = 600, h = 600 } = {}) => {
  const p = POSES[poseId]
  const t = theme(themeName)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${w}" height="${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${themeName === 'dark' ? '#0b0d16' : '#f8f4ea'}"/>
      <stop offset="100%" stop-color="${themeName === 'dark' ? '#05060a' : '#ece5d5'}"/>
    </linearGradient>
    <radialGradient id="halo" cx="0.5" cy="0.1" r="0.7">
      <stop offset="0%" stop-color="${t.accent}" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="${t.accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100" height="100" fill="url(#bg)"/>
  <rect width="100" height="100" fill="url(#halo)"/>
  ${figureSvg(p?.pose || {}, { theme: themeName, props: p?.props, showAxis: p?.showAxis })}
  <text x="50" y="8" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" font-size="6" fill="${t.title}">${p?.label || ''}</text>
  <text x="50" y="13.5" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="3.4" fill="${t.text}">${p?.intent || ''}</text>
</svg>
`
}
