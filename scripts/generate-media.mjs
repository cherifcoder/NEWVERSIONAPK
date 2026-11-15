/* ------------------------------------------------------------------
   generate-media.mjs
   Génère les ressources hors-ligne embarquées dans public/media :
   • 4 posters SVG (visuels d'étude)
   • 1 animation SVG (drill de séquence)
   • 2 pistes audio WAV réelles (respiration 4-7-8, métronome 90 BPM)
   • 2 briefs texte
   Lancer : node scripts/generate-media.mjs
------------------------------------------------------------------- */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const media = join(root, 'public', 'media')

const write = (rel, content, encoding = 'utf8') => {
  const full = join(media, rel)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, content, encoding)
  const size = Buffer.isBuffer(content) ? content.length : Buffer.byteLength(content)
  console.log(`  ✓ ${rel} (${(size / 1024).toFixed(1)} Ko)`)
}

/* ================================================================== */
/*  STYLE PARTAGÉ DES POSTERS                                          */
/* ================================================================== */

const FONT = `font-family="Inter, Segoe UI, system-ui, sans-serif"`
const SERIF = `font-family="Cormorant Garamond, Georgia, serif"`

const poster = (title, subtitle, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 900" width="1400" height="900">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b0d16"/>
      <stop offset="100%" stop-color="#05060a"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f7ecd0"/>
      <stop offset="50%" stop-color="#cfa851"/>
      <stop offset="100%" stop-color="#946d24"/>
    </linearGradient>
    <radialGradient id="halo" cx="0.5" cy="0" r="0.8">
      <stop offset="0%" stop-color="#cfa851" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#cfa851" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1400" height="900" fill="url(#bg)"/>
  <rect width="1400" height="900" fill="url(#halo)"/>
  <g opacity="0.07" stroke="#cfa851" stroke-width="1">
    ${Array.from({ length: 14 }, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="900"/>`).join('')}
    ${Array.from({ length: 9 }, (_, i) => `<line x1="0" y1="${i * 100}" x2="1400" y2="${i * 100}"/>`).join('')}
  </g>
  <rect x="40" y="40" width="1320" height="820" fill="none" stroke="#cfa851" stroke-opacity="0.28" rx="18"/>
  <text x="80" y="112" ${SERIF} font-size="52" fill="url(#gold)" letter-spacing="1">${title}</text>
  <text x="80" y="148" ${FONT} font-size="19" fill="#9aa0b5" letter-spacing="3" text-transform="uppercase">${subtitle}</text>
  <line x1="80" y1="172" x2="1320" y2="172" stroke="url(#gold)" stroke-opacity="0.4"/>
  ${body}
  <text x="1320" y="820" ${FONT} font-size="14" fill="#6b7189" text-anchor="end">METHOD — Incarne ton Futur Toi</text>
</svg>
`

const card = (x, y, w, h, accent = '#cfa851') => `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="#ffffff" fill-opacity="0.03" stroke="${accent}" stroke-opacity="0.26"/>`

const cardTitle = (x, y, text, size = 21) =>
  `<text x="${x}" y="${y}" ${SERIF} font-size="${size}" fill="#f7ecd0">${text}</text>`

const lines = (x, y, arr, size = 15, lh = 24, fill = '#b9bfd0') =>
  arr.map((l, i) => `<text x="${x}" y="${y + i * lh}" ${FONT} font-size="${size}" fill="${fill}">${l}</text>`).join('')

/* ================================================================== */
/*  1. POSTER — POSTURE                                                */
/* ================================================================== */
const postureBody = `
  ${card(80, 210, 620, 290)}
  ${cardTitle(112, 258, 'Le corps qui commande')}
  ${lines(112, 296, [
    'S\'asseoir — dos droit, épaules basses, pieds au sol,',
    'mains visibles. Aucun affalement, jamais.',
    'Marcher — 20 % plus lentement. Pas posés, regard',
    'horizontal, mains calmes le long du corps.',
    'Ouvrir une porte — main ferme, un seul mouvement,',
    'aucune hésitation. Tu entres, tu ne te glisses pas.',
    'Tenir un verre — à la base, coude bas, jamais devant',
    'le visage. Les mains libres pour parler.',
  ], 15.5, 26)}

  ${card(80, 520, 620, 290)}
  ${cardTitle(112, 568, 'Serrer une main & écouter')}
  ${lines(112, 606, [
    'Regard dans les yeux, deux secousses, pression ferme',
    'mais brève. Tu relâches le premier — c\'est toi qui',
    'contrôles le tempo.',
    'Écouter — corps orienté vers l\'autre, tête légèrement',
    'inclinée, aucune interruption. Silence actif : tu ne',
    'prépares pas ta réponse, tu absorbes la donnée.',
  ], 15.5, 26)}

  ${card(730, 210, 590, 600, '#4a7fd4')}
  <text x="762" y="258" ${SERIF} font-size="21" fill="#f7ecd0">Schéma de présence</text>
  <!-- silhouette schématique -->
  <g transform="translate(880, 320)">
    <circle cx="145" cy="52" r="40" fill="none" stroke="#e0c07c" stroke-width="3"/>
    <line x1="145" y1="92" x2="145" y2="300" stroke="#e0c07c" stroke-width="3"/>
    <line x1="60" y1="150" x2="230" y2="150" stroke="#e0c07c" stroke-width="3"/>
    <line x1="145" y1="300" x2="85" y2="440" stroke="#e0c07c" stroke-width="3"/>
    <line x1="145" y1="300" x2="205" y2="440" stroke="#e0c07c" stroke-width="3"/>
    <line x1="60" y1="150" x2="40" y2="250" stroke="#e0c07c" stroke-width="3"/>
    <line x1="230" y1="150" x2="250" y2="250" stroke="#e0c07c" stroke-width="3"/>
    <line x1="60" y1="150" x2="40" y2="250" stroke="#cfa851" stroke-width="1" opacity="0.4"/>
    <line x1="105" y1="44" x2="105" y2="10" stroke="#4a7fd4" stroke-width="2"/>
    <line x1="185" y1="44" x2="185" y2="10" stroke="#4a7fd4" stroke-width="2"/>
    <text x="145" y="480" ${FONT} font-size="14" fill="#9aa0b5" text-anchor="middle">Axe vertical · menton parallèle au sol</text>
  </g>
  <text x="762" y="740" ${FONT} font-size="15" fill="#9aa0b5">Le personnage s'installe par le corps</text>
  <text x="762" y="764" ${FONT} font-size="15" fill="#9aa0b5">avant de s'installer dans la tête.</text>
`

/* ================================================================== */
/*  2. POSTER — PANTHÉON                                               */
/* ================================================================== */
const pantheonData = [
  ['Le Futur Toi', '#e0c07c', ['Zéro abandon', 'Décision rapide', 'Présence calme', 'Verbe élégant']],
  ['Harvey Specter', '#4a7fd4', ['Levier informationnel', 'Sang-froid total', 'Le silence', 'Loyauté sélective']],
  ['Le Stratège de Cour', '#b4323c', ['Intérêts > émotions', 'Patience d\'arme', 'Jamais de vanité', 'Caméléon social']],
  ['Le Neuro-Architecte', '#2f9e78', ['Émotion avant fait', 'Myélinisation', 'Réécrire l\'habitude', 'Cohérence cardiaque']],
  ['Le Polymath', '#cfa851', ['Travail long', 'Transfert', 'Preuve > opinion', 'Livré, pas presque']],
  ['Le Sage de Babylone', '#946d24', ['Paye-toi d\'abord', 'Budget strict', 'Effet composé', 'Protège la réputation']],
]
const pantheonBody = pantheonData
  .map(([name, color, traits], i) => {
    const x = 80 + (i % 3) * 420
    const y = 210 + Math.floor(i / 3) * 300
    return `${card(x, y, 390, 275, color)}
    <rect x="${x}" y="${y}" width="4" height="275" rx="2" fill="${color}"/>
    <text x="${x + 26}" y="${y + 48}" ${SERIF} font-size="25" fill="#f7ecd0">${name}</text>
    ${lines(x + 26, y + 90, traits.map((t) => `· ${t}`), 16, 32, '#b9bfd0')}`
  })
  .join('')

/* ================================================================== */
/*  3. POSTER — RHÉTORIQUE                                             */
/* ================================================================== */
const rhetoricBody = `
  ${card(80, 210, 400, 600, '#b4323c')}
  <text x="112" y="258" ${SERIF} font-size="24" fill="#f7ecd0">Structure PREP</text>
  ${[
    ['P', 'Point', 'Ton affirmation en une phrase.'],
    ['R', 'Raison', 'Pourquoi, en une phrase.'],
    ['E', 'Exemple', 'Un fait, un chiffre, une histoire.'],
    ['P', 'Point', 'Répète, formulé autrement.'],
  ]
    .map(
      ([k, t, d], i) => `
    <circle cx="145" cy="${330 + i * 120}" r="24" fill="none" stroke="#e0c07c" stroke-width="2"/>
    <text x="145" y="${338 + i * 120}" ${SERIF} font-size="22" fill="#e0c07c" text-anchor="middle">${k}</text>
    <text x="190" y="${322 + i * 120}" ${FONT} font-size="17" fill="#f4f1ea" font-weight="600">${t}</text>
    <text x="190" y="${348 + i * 120}" ${FONT} font-size="14" fill="#9aa0b5">${d}</text>`,
    )
    .join('')}

  ${card(510, 210, 810, 290, '#cfa851')}
  <text x="542" y="258" ${SERIF} font-size="24" fill="#f7ecd0">Les 6 outils de persuasion</text>
  ${[
    'Contraste — présente l\'option excessive, puis la tienne.',
    'Recadrage de valeur — parle du coût de l\'absence de résultat.',
    'Pied dans la porte — micro-accord, puis élargis.',
    'Question qui déplace — ne réponds pas à l\'attaque, questionne.',
    'Triple alternative — trois options dont tu acceptes les trois.',
    'Étiquetage émotionnel — nomme l\'émotion, elle perd sa force.',
  ]
    .map((l, i) => `<text x="542" y="${300 + i * 30}" ${FONT} font-size="15" fill="#b9bfd0">${l}</text>`)
    .join('')}

  ${card(510, 520, 810, 290, '#4a7fd4')}
  <text x="542" y="568" ${SERIF} font-size="24" fill="#f7ecd0">Voix & silence</text>
  ${[
    'Voix grave — main sur le sternum, descends le ton jusqu\'au grave confortable.',
    'Une idée = une phrase. Puis arrête-toi net.',
    'Après chaque question : 3 secondes de silence. Laisse l\'autre se livrer.',
    'Zéro mot de remplissage : « euh », « en fait », « genre » → silence.',
    'Le premier qui parle après une offre perd souvent l\'avantage.',
  ]
    .map((l, i) => `<text x="542" y="${610 + i * 32}" ${FONT} font-size="15" fill="#b9bfd0">${l}</text>`)
    .join('')}
`

/* ================================================================== */
/*  4. POSTER — ANGLAIS                                                */
/* ================================================================== */
const idioms = [
  ['to move the needle', 'faire bouger les choses'],
  ['to cut to the chase', 'aller droit au but'],
  ['a ballpark figure', 'un ordre de grandeur'],
  ['to touch base', 'faire un point'],
  ['on the same page', 'être alignés'],
  ['to circle back', 'revenir sur le sujet'],
  ['low-hanging fruit', 'le gain facile'],
  ['to pull the trigger', 'se décider'],
  ['a game changer', 'un tournant décisif'],
  ['to own it', 'assumer pleinement'],
  ['no strings attached', 'sans contrepartie'],
  ['to play hardball', 'jouer dur'],
  ['keep me in the loop', 'tiens-moi informé'],
  ['a long shot', 'peu probable mais tentable'],
  ['to take it offline', 'en discuter en privé'],
  ['skin in the game', 'personnellement engagé'],
  ['to make a killing', 'faire fortune'],
  ['to drop the ball', 'rater son coup'],
  ['back to square one', 'retour à la case départ'],
  ['to be swamped', 'être débordé'],
]
const englishBody = idioms
  .map(([en, fr], i) => {
    const col = Math.floor(i / 10)
    const row = i % 10
    const x = 80 + col * 630
    const y = 215 + row * 62
    return `
    <rect x="${x}" y="${y}" width="600" height="52" rx="10" fill="#ffffff" fill-opacity="0.03" stroke="#cfa851" stroke-opacity="0.18"/>
    <text x="${x + 18}" y="${y + 22}" ${FONT} font-size="16" fill="#f7ecd0" font-weight="600">${en}</text>
    <text x="${x + 18}" y="${y + 42}" ${FONT} font-size="13.5" fill="#9aa0b5">${fr}</text>`
  })
  .join('')

/* ================================================================== */
/*  5. ANIMATION — DRILL ZÉRO ABANDON                                  */
/* ================================================================== */
const drillSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" width="900" height="600">
  <defs>
    <linearGradient id="dbg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0b0d16"/>
      <stop offset="100%" stop-color="#05060a"/>
    </linearGradient>
    <linearGradient id="dg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f7ecd0"/>
      <stop offset="100%" stop-color="#946d24"/>
    </linearGradient>
    <style>
      .step { opacity: 0; animation: pop 6s infinite; }
      .s1 { animation-delay: 0s; }
      .s2 { animation-delay: 2s; }
      .s3 { animation-delay: 4s; }
      .ring { animation: ring 6s infinite; transform-origin: center; }
      @keyframes pop { 0%,6% {opacity:0; transform: translateY(10px);} 12%,30% {opacity:1; transform: translateY(0);} 36%,100% {opacity:0;} }
      @keyframes ring { 0%,100% {stroke-opacity:0.25;} 50% {stroke-opacity:0.85;} }
      .dot { animation: travel 6s infinite linear; }
      @keyframes travel { 0% {offset-distance:0%;} 100% {offset-distance:100%;} }
      .flow { stroke-dasharray: 8 10; animation: dash 1.2s linear infinite; }
      @keyframes dash { to { stroke-dashoffset: -36; } }
    </style>
  </defs>
  <rect width="900" height="600" fill="url(#dbg)"/>
  <text x="450" y="66" font-family="Cormorant Garamond, Georgia, serif" font-size="38" fill="url(#dg)" text-anchor="middle">Zéro Abandon</text>
  <text x="450" y="98" font-family="Inter, system-ui, sans-serif" font-size="15" fill="#9aa0b5" text-anchor="middle" letter-spacing="3">UNE BOUCLE OUVERTE À LA FOIS</text>
  <line x1="450" y1="330" x2="450" y2="330" />
  <g stroke="#cfa851" stroke-opacity="0.3" fill="none">
    <circle class="ring" cx="180" cy="330" r="66" stroke-width="2"/>
    <circle class="ring" cx="450" cy="330" r="66" stroke-width="2" style="animation-delay:0.4s"/>
    <circle class="ring" cx="720" cy="330" r="66" stroke-width="2" style="animation-delay:0.8s"/>
  </g>
  <line class="flow" x1="246" y1="330" x2="384" y2="330" stroke="#cfa851" stroke-width="2" stroke-opacity="0.6"/>
  <line class="flow" x1="516" y1="330" x2="654" y2="330" stroke="#cfa851" stroke-width="2" stroke-opacity="0.6"/>

  <g class="step s1">
    <circle cx="180" cy="330" r="52" fill="#cfa851" fill-opacity="0.14" stroke="#e0c07c" stroke-width="2.5"/>
    <text x="180" y="326" font-family="Inter, system-ui, sans-serif" font-size="15" fill="#f7ecd0" text-anchor="middle">COMMENCER</text>
    <text x="180" y="348" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#9aa0b5" text-anchor="middle">1 seul projet</text>
    <text x="180" y="432" font-family="Inter, system-ui, sans-serif" font-size="14" fill="#b9bfd0" text-anchor="middle">Décision prise,</text>
    <text x="180" y="452" font-family="Inter, system-ui, sans-serif" font-size="14" fill="#b9bfd0" text-anchor="middle">pas d'annonce.</text>
  </g>

  <g class="step s2">
    <circle cx="450" cy="330" r="52" fill="#cfa851" fill-opacity="0.14" stroke="#e0c07c" stroke-width="2.5"/>
    <text x="450" y="326" font-family="Inter, system-ui, sans-serif" font-size="15" fill="#f7ecd0" text-anchor="middle">TENIR</text>
    <text x="450" y="348" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#9aa0b5" text-anchor="middle">blocs de 90 min</text>
    <text x="450" y="432" font-family="Inter, system-ui, sans-serif" font-size="14" fill="#b9bfd0" text-anchor="middle">Aucun nouveau projet.</text>
    <text x="450" y="452" font-family="Inter, system-ui, sans-serif" font-size="14" fill="#b9bfd0" text-anchor="middle">La distraction est l'ennemi.</text>
  </g>

  <g class="step s3">
    <circle cx="720" cy="330" r="52" fill="#2f9e78" fill-opacity="0.16" stroke="#2f9e78" stroke-width="2.5"/>
    <text x="720" y="326" font-family="Inter, system-ui, sans-serif" font-size="15" fill="#d6fff0" text-anchor="middle">LIVRER</text>
    <text x="720" y="348" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#9aa0b5" text-anchor="middle">preuve exigée</text>
    <text x="720" y="432" font-family="Inter, system-ui, sans-serif" font-size="14" fill="#b9bfd0" text-anchor="middle">Déployé, publié, commité.</text>
    <text x="720" y="452" font-family="Inter, system-ui, sans-serif" font-size="14" fill="#b9bfd0" text-anchor="middle">Puis seulement : recommencer.</text>
  </g>

  <text x="450" y="540" font-family="Cormorant Garamond, Georgia, serif" font-size="22" fill="#e0c07c" text-anchor="middle" font-style="italic">« Tout ce qui est commencé est mené jusqu'au bout. »</text>
</svg>
`

/* ================================================================== */
/*  AUDIO — encodeur WAV minimal                                       */
/* ================================================================== */
const SAMPLE_RATE = 8000

const wavFromSamples = (samples, sampleRate = SAMPLE_RATE) => {
  const n = samples.length
  const buf = Buffer.alloc(44 + n)
  buf.write('RIFF', 0)
  buf.writeUInt32LE(36 + n, 4)
  buf.write('WAVE', 8)
  buf.write('fmt ', 12)
  buf.writeUInt32LE(16, 16)
  buf.writeUInt16LE(1, 20) // PCM
  buf.writeUInt16LE(1, 22) // mono
  buf.writeUInt32LE(sampleRate, 24)
  buf.writeUInt32LE(sampleRate, 28) // byte rate (8-bit mono)
  buf.writeUInt16LE(1, 32) // block align
  buf.writeUInt16LE(8, 34) // bits per sample
  buf.write('data', 36)
  buf.writeUInt32LE(n, 40)
  for (let i = 0; i < n; i += 1) {
    const v = Math.max(-1, Math.min(1, samples[i]))
    buf[44 + i] = Math.round((v * 0.5 + 0.5) * 255)
  }
  return buf
}

const envelope = (t, dur, attack = 0.02, release = 0.05) => {
  if (t < attack) return t / attack
  if (t > dur - release) return Math.max(0, (dur - t) / release)
  return 1
}

/* --- 1. Respiration 4-7-8 (4 cycles) --- */
const buildBreathing = () => {
  const cycle = 19 // 4 + 7 + 8
  const cycles = 4
  const total = cycle * cycles + 1.5
  const n = Math.floor(total * SAMPLE_RATE)
  const out = new Float32Array(n)

  for (let c = 0; c < cycles; c += 1) {
    const base = c * cycle
    // Inspiratoire : 4 s, ton qui monte de 220 à 330 Hz
    for (let t = 0; t < 4; t += 1 / SAMPLE_RATE) {
      const f = 220 + (110 * t) / 4
      const i = Math.floor((base + t) * SAMPLE_RATE)
      if (i < n) out[i] += 0.34 * Math.sin(2 * Math.PI * f * t) * envelope(t, 4, 0.25, 0.35)
    }
    // Rétention : 7 s, pulsation douce toutes les secondes
    for (let t = 0; t < 7; t += 1 / SAMPLE_RATE) {
      const pulse = Math.pow(Math.max(0, 1 - (t % 1) / 0.22), 2)
      const i = Math.floor((base + 4 + t) * SAMPLE_RATE)
      if (i < n) out[i] += 0.13 * Math.sin(2 * Math.PI * 440 * t) * pulse
    }
    // Expiratoire : 8 s, ton qui descend de 300 à 160 Hz
    for (let t = 0; t < 8; t += 1 / SAMPLE_RATE) {
      const f = 300 - (140 * t) / 8
      const i = Math.floor((base + 11 + t) * SAMPLE_RATE)
      if (i < n) out[i] += 0.32 * Math.sin(2 * Math.PI * f * t) * envelope(t, 8, 0.2, 0.6)
    }
  }
  return wavFromSamples(out)
}

/* --- 2. Métronome 90 BPM --- */
const buildMetronome = () => {
  const bpm = 90
  const beat = 60 / bpm
  const bars = Math.floor(120 / (beat * 4))
  const total = bars * beat * 4 + 0.5
  const n = Math.floor(total * SAMPLE_RATE)
  const out = new Float32Array(n)

  for (let b = 0; b < bars * 4; b += 1) {
    const start = b * beat
    const accent = b % 4 === 0
    const freq = accent ? 1320 : 880
    const dur = 0.05
    const gain = accent ? 0.55 : 0.3
    for (let t = 0; t < dur; t += 1 / SAMPLE_RATE) {
      const i = Math.floor((start + t) * SAMPLE_RATE)
      if (i < n) {
        const env = Math.exp(-t * 70)
        out[i] += gain * Math.sin(2 * Math.PI * freq * t) * env
      }
    }
  }
  return wavFromSamples(out)
}

/* ================================================================== */
/*  TEXTES                                                             */
/* ================================================================== */
const battlePlan = `METHOD — BATTLE PLAN
Incarne ton Futur Toi · Protocole opérationnel
================================================

PRINCIPE FONDATEUR
------------------
Ce n'est pas une application de suivi d'habitudes. C'est un système
d'incarnation. Tu ne "prends pas de bonnes habitudes" : tu joues le
rôle de ta version définitive jusqu'à ce qu'il devienne ta biologie.

Un acteur ne se motive pas. Il entre en scène.


LES 6 PILIERS (LE CHARBON)
---------------------------
1. CODE & DEEP WORK ......... 4h30 / jour, en blocs de 90 minutes
2. SAVOIR & STRATÉGIE ....... 30 pages / jour (20 matin, 10 soir)
3. ÉCHECS & TACTIQUE ........ 1 partie longue analysée + puzzles
4. ÉTUDE ISLAMIQUE .......... 45 min (lecture + mémorisation + réflexion)
5. ÉLOQUENCE & NÉGOCIATION .. 30 min (diction + persuasion)
6. ANGLAIS BUSINESS & RUE ... 45 min (shadowing + idiomes + pitch)

Aucun pilier n'est optionnel. Un roi qui abandonne une province
finit par perdre le royaume.


LA RÈGLE D'OR — ZÉRO ABANDON
----------------------------
Tout ce qui est commencé est mené jusqu'au bout, avec une exécution
chirurgicale.

· Une seule boucle ouverte à la fois.
· Aucun nouveau projet tant que le précédent n'est pas livré.
· Un projet sans "prochain pas" écrit est un projet mort.
· "Presque fini" = pas fini.
· Une livraison sans preuve est une illusion.


PROTOCOLE MATINAL (LA PREMIÈRE HEURE)
-------------------------------------
05:30  Réveil. Aucun écran.
05:35  Eau. Lecture spirituelle 5 min.
05:45  Intention écrite en UNE phrase.
05:50  LE CRAPAUD : la tâche la plus dure, en premier.
07:20  Pause. Mouvement. Puis bloc de deep work n°2.


PROTOCOLE DE FIN DE JOURNÉE
---------------------------
· Débrief de l'acteur (Journal) : où ai-je brisé le personnage ?
· Ai-je fini tout ce que j'ai commencé ?
· Le crapaud de demain, écrit avant de dormir.
· Envoi au Metteur en Scène pour évaluation froide.


LES LOIS DE RÉFÉRENCE
---------------------
Napoleon Hill ... Le désir brûlant + la persistance.
Machiavel ........ Paraître et être. La réputation est un actif.
Robert Greene .... Loi 4 : dis toujours moins que nécessaire.
Joe Dispenza ..... L'émotion précède l'expérience. Répète.
Tony Robbins ..... L'état précède la stratégie.
Tim Ferriss ...... 80/20 : élimine le superflu.
Brian Tracy ...... Avale le crapaud le matin.
Ryan Holiday ..... L'obstacle EST le chemin.
George Clason .... Paye-toi d'abord (10 % intouchables).


CE QUE TU DEVIENS
-----------------
Un bourreau de travail polymath. Un négociateur d'élite.
Un polyglotte orateur. Une exécution chirurgicale, sans abandon.

METHOD — Incarne ton Futur Toi.
`

const deepWorkBrief = `DEEP WORK — PROTOCOLE 90 MINUTES
=================================

PRINCIPE
--------
Le talent ne se négocie pas : il se paie en blocs non interruptibles.
Une heure fragmentée vaut moins que 20 minutes de concentration réelle.

90 minutes = un cycle ultradien naturel. C'est la durée optimale.


AVANT LE BLOC (5 MINUTES)
-------------------------
1. Écris UNE phrase :
   "À la fin de ce bloc, ceci existera : _______________"
2. Téléphone en MODE AVION, hors de la pièce. Pas "retourné" : sorti.
3. Ferme tous les onglets sauf un. Une seule fenêtre.
4. Prépare ton eau. Va aux toilettes. Règle l'éclairage.
5. Déclare l'heure de fin à voix haute.

Règle : si ce n'est pas écrit, ce n'est pas un objectif.
C'est une intention, et les intentions ne produisent rien.


PENDANT LE BLOC (90 MINUTES)
----------------------------
· Une seule tâche. Toute pensée parasite → note-la sur un papier, reviens.
· Aucune notification. Aucun message. Aucun "je vérifie juste".
· Si tu bloques : 15 minutes maximum sur le problème, puis note la
  question et passe à la sous-tâche suivante.
· Position assise droite, écran à hauteur des yeux.
· Toutes les 45 minutes : 60 secondes debout, respiration 4-7-8.


APRÈS LE BLOC (10 MINUTES)
--------------------------
1. Note ce qui a été LIVRÉ (pas ce que tu as ressenti).
2. Note le point de friction principal : qu'est-ce qui t'a ralenti ?
3. Note la première action du prochain bloc.
4. Crédite le pilier dans le tracker. La preuve doit être visible.
5. 5 minutes de marche, sans écran, avant le bloc suivant.


LES 4 NIVEAUX DE PROFONDEUR
---------------------------
Niveau 1 — Monastique : isolement total, aucun outil de communication.
Niveau 2 — Bimodal : blocs définis à l'avance, jours dédiés.
Niveau 3 — Rythmique : même créneau chaque jour (recommandé pour toi).
Niveau 4 — Journalistique : à la volée (le moins efficace).

Vise le niveau 3 : un bloc de 90 min, tous les jours, même heure.
La régularité bat l'intensité.


ERREURS FATALES
---------------
· Commencer par les messages (tu ouvres la journée au rythme des autres).
· "Je travaille mieux sous pression" (faux : tu travailles plus vite, moins bien).
· Confondre être occupé et produire.
· Ne pas écrire le livrable attendu.
· Enchaîner deux blocs sans coupure : le second vaut 50 % du premier.

METHOD — Incarne ton Futur Toi.
`

/* ================================================================== */
/*  ÉCRITURE                                                           */
/* ================================================================== */
console.log('\nGénération des ressources hors-ligne METHOD\n')

write('posters/posture.svg', poster('Le corps qui commande', 'Présence physique · micro-gestes', postureBody))
write('posters/pantheon.svg', poster('Panthéon des modèles', 'Character Bible · 6 archétypes', pantheonBody))
write('posters/rhetoric.svg', poster('Carte de rhétorique', 'PREP · persuasion · voix', rhetoricBody))
write('posters/english.svg', poster('Business & Street Board', '20 idiomes en contexte', englishBody))
write('motion/drill-loop.svg', drillSvg)
write('audio/breathing-478.wav', buildBreathing(), null)
write('audio/metronome-90.wav', buildMetronome(), null)
write('texts/battle-plan.txt', battlePlan)
write('texts/deep-work.txt', deepWorkBrief)

console.log('\nTerminé.\n')
