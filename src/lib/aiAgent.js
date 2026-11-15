/* ------------------------------------------------------------------
   aiAgent.js — « Le Metteur en Scène & Coach Stratège »

   Deux moteurs :
   1. MOTEUR LOCAL (par défaut, 100 % hors-ligne) : analyse froide,
      déterministe et personnalisée du rapport de l'acteur.
   2. MOTEUR IA (optionnel) : appelle une API LLM compatible OpenAI
      (Groq, Gemini, OpenRouter, OpenAI…) si l'utilisateur saisit
      une clé dans Réglages. La clé reste stockée localement.
------------------------------------------------------------------- */

import { formatMinutes, pct } from './utils'

/* ------------------------------------------------------------------ */
/*  1. Analyse factuelle du rapport                                     */
/* ------------------------------------------------------------------ */

const NEGATIVE_MARKERS = [
  'procrastin', 'abandonn', 'pas fini', 'pas terminé', 'flemme', 'distrait',
  'scroller', 'scrollé', 'tiktok', 'instagram', 'youtube', 'jeu', 'joué',
  'fume', 'café', 'dormi', 'tard', 'fatigué', 'excuse', 'je n’ai pas', "je n'ai pas",
  'lâché', 'remis à demain', 'demain', 'au lieu de',
]

const RESOLVE_MARKERS = [
  'terminé', 'fini', 'livré', 'déployé', 'publié', 'push', 'commit', 'mergé',
  'conclu', 'achevé', 'résolu', 'abouti', 'complété',
]

const SOCIAL_MARKERS = [
  'parlé', 'négoci', 'présenté', 'convaincu', 'argumenté', 'pitché', 'discuté',
  'appelé', 'rencontré', 'proposé', 'vendu', 'recruté', 'réseau',
]

const containsAny = (text, list) => list.some((m) => text.includes(m))

export const analyseEntry = (entry = {}, context = {}) => {
  const blob = Object.values(entry.answers || {}).join(' \n ').toLowerCase()
  const words = blob.split(/\s+/).filter(Boolean).length
  const { openLoops = 0, todayMinutes = 0, incarnRate = 0, streak = 0, brokenPillars = [] } = context

  const signals = {
    abandon: /(?:abandonn|pas fini|pas terminé|lâché|remis à demain|laissé en (?:plan|cours))/i.test(blob),
    mentionOpenLoops: /(?:open loop|boucle ouverte|projet en cours|entamé|commencé)/i.test(blob),
    procrastination: containsAny(blob, NEGATIVE_MARKERS),
    resolve: containsAny(blob, RESOLVE_MARKERS),
    social: containsAny(blob, SOCIAL_MARKERS),
    noBreak: /(?:aucun|pas de|zéro) (?:fausse route|abandon|procrastination|distraction)/i.test(blob),
    deepWorkLow: todayMinutes < 90,
    incarnLow: incarnRate < 60,
    loopy: openLoops >= 2,
    thin: words < 25,
  }

  /* --- Score de discipline (0-100) ------------------------------- */
  let score = 55
  score += Math.round(incarnRate * 0.25) // le rôle tenu pèse lourd
  score += Math.min(20, Math.round(todayMinutes / 9))
  score += Math.min(10, streak)
  if (signals.resolve) score += 8
  if (signals.social) score += 5
  if (signals.noBreak) score += 4
  if (signals.abandon) score -= 16
  if (signals.procrastination) score -= 10
  if (signals.loopy) score -= 8
  if (signals.deepWorkLow) score -= 7
  if (signals.thin) score -= 6
  score -= brokenPillars.length * 3
  score = Math.max(4, Math.min(99, score))

  /* --- Failles ------------------------------------------------ */
  const failles = []
  if (signals.abandon)
    failles.push({
      titre: 'Rupture du personnage : abandon détecté',
      detail:
        "Tu as laissé une boucle ouverte derrière toi. Ce n'est pas la tâche qui t'a vaincu, c'est ta parole donnée. Chaque abandon enseigne au cerveau que ta propre signature est négociable.",
      loi: 'Les 48 lois du pouvoir, Loi 9 — Gagne par tes actions, jamais par tes arguments.',
      correctif: "Avant 20h : choisis LA boucle ouverte la plus ancienne et livre un incrément visible (commit, message, fichier).",
    })
  if (signals.procrastination && !signals.resolve)
    failles.push({
      titre: 'Fuite dans le confort',
      detail:
        "Tu as payé le confort d'aujourd'hui avec le destin de demain. Le « futur toi » ne te remerciera pas : il paiera la facture avec intérêts.",
      loi: 'Napoleon Hill — Réfléchissez et devenez riche : « La procrastination est le contraire de la décision. »',
      correctif: 'Demain, avale le crapaud : la tâche la plus dure entre 5h30 et 8h00, sans négociation, sans téléphone.',
    })
  if (signals.deepWorkLow)
    failles.push({
      titre: 'Profondeur insuffisante',
      detail:
        `Seulement ${formatMinutes(todayMinutes)} de concentration réelle. Le talent ne se négocie pas : il se paie en blocs de 90 minutes non interruptibles.`,
      loi: 'Tim Ferriss — La semaine de 4 heures : élimine le superflu, ne garde que les 20 % qui produisent 80 % du résultat.',
      correctif: 'Pose 2 blocs de 90 min demain, téléphone en mode avion, porte fermée, notification coupée.',
    })
  if (signals.loopy)
    failles.push({
      titre: `${openLoops} boucles ouvertes non purgées`,
      detail:
        "Chaque projet inachevé consomme de la bande passante mentale même quand tu ne le regardes pas. Ton esprit n'est pas un cimetière de promesses.",
      loi: 'Le Dispatcher « Zéro Abandon » — Interdiction absolue de commencer tant que le précédent n\'est pas déployé.',
      correctif: 'Bloque 45 min pour fermer la boucle la plus ancienne. Rien de nouveau ne démarre avant.',
    })
  if (brokenPillars.length)
    failles.push({
      titre: `Piliers négligés : ${brokenPillars.join(', ')}`,
      detail:
        "Un roi qui abandonne une province finit par perdre le royaume. Ces piliers ne sont pas des options : ils sont la structure de ton personnage.",
      loi: 'Ryan Holiday — L\'obstacle est le chemin : la discipline manquante est précisément le chemin.',
      correctif: 'Réintègre le pilier manquant en version minimale (15 min) dès demain matin.',
    })
  if (signals.thin)
    failles.push({
      titre: 'Débriefing bâclé',
      detail:
        "Un rapport pauvre produit une progression pauvre. Un stratège documente ses batailles : sinon il répète ses défaites sans le savoir.",
      loi: 'Les 48 lois du pouvoir, Loi 4 — Dis toujours moins que nécessaire (mais écris toujours assez pour t\'analyser).',
      correctif: 'Demain, écris au minimum 4 phrases par question. Précision = pouvoir.',
    })

  /* --- Forces ------------------------------------------------- */
  const forces = []
  if (signals.resolve)
    forces.push('Tu as fini ce que tu avais commencé. C\'est le muscle le plus rare et le plus rentable.')
  if (signals.social)
    forces.push('Tu as exercé l\'entregent et la parole : le capital relationnel compose comme les intérêts.')
  if (signals.noBreak)
    forces.push('Journée tenue sans rupture de personnage déclarée. L\'identité se solidifie par répétition.')
  if (todayMinutes >= 180)
    forces.push(`${formatMinutes(todayMinutes)} de travail profond : tu es entré dans le territoire des 1 %.`)
  if (streak >= 7) forces.push(`Série de ${streak} jours : tu n'es plus motivé, tu es structuré.`)
  if (!forces.length)
    forces.push('Tu as ouvert le rapport au lieu de fuir. Le courage de se regarder est le premier acte d\'élite.')

  return { score, signals, failles, forces }
}

/* ------------------------------------------------------------------ */
/*  2. Rendu textuel du « compte-rendu chirurgical »                    */
/* ------------------------------------------------------------------ */

const VERDICTS = [
  { min: 90, label: 'MAÎTRISE', mot: "Tu n'as pas joué le rôle. Tu l'as été. Ne relâche rien : la grandeur se perd en une semaine d'arrogance." },
  { min: 75, label: 'CONQUÉRANT', mot: "Journée solide. L'ennemi n'est plus dehors, il est dans les 25 % de confort qu'il te reste à brûler." },
  { min: 60, label: 'EN PROGRESSION', mot: "Tu avances, mais avec le frein à main. Le personnage est esquissé, pas incarné." },
  { min: 40, label: 'DÉCOR', mot: "Tu as porté le costume sans jouer la scène. Le costume ne convainc personne, surtout pas toi." },
  { min: 0, label: 'FIGURATION', mot: "Aujourd'hui, tu as laissé le rôle à quelqu'un d'autre. Ça ne se reproduira pas demain." },
]

export const verdictFor = (score) => VERDICTS.find((v) => score >= v.min) || VERDICTS.at(-1)

const OPENINGS = [
  'Assieds-toi. On ne va pas se mentir.',
  'Rapport reçu. J\'ai lu entre les lignes, pas seulement les mots.',
  'Coupez. On reprend depuis la réalité, pas depuis ton intention.',
  'Très bien. Voici la vérité, sans maquillage.',
]

const CLOSINGS = [
  'Demain, tu ne me dois pas une intention. Tu me dois une preuve.',
  'Je ne veux pas d\'effort. Je veux un résultat visible avant 21h.',
  'Le personnage ne se déclare pas. Il se démontre. À demain, sur scène.',
  'Rappel : ce que tu commences, tu le termines. Sinon tu n\'es qu\'un amateur bien habillé.',
]

export const buildLocalReport = (entry = {}, context = {}, analysis = null) => {
  const a = analysis || analyseEntry(entry, context)
  const v = verdictFor(a.score)
  const rnd = (arr, i) => arr[(i + a.score) % arr.length]

  const lines = []
  lines.push(`## COMPTE-RENDU D'ÉVALUATION — ${v.label} (${a.score}/100)`)
  lines.push('')
  lines.push(`*${rnd(OPENINGS, context.daySeed || 0)}*`)
  lines.push('')
  lines.push(v.mot)
  lines.push('')
  lines.push(`**Taux d'incarnation du jour : ${context.incarnRate ?? 0} %** · Travail profond : ${formatMinutes(context.todayMinutes || 0)} · Boucles ouvertes : ${context.openLoops ?? 0}`)
  lines.push('')

  lines.push('### CE QUI A TENU')
  a.forces.forEach((f) => lines.push(`- ${f}`))
  lines.push('')

  lines.push('### FAILLES DÉTECTÉES')
  if (!a.failles.length) {
    lines.push("- Aucune faille structurelle. C'est suspect — vérifie que tu n'es pas complaisant avec toi-même.")
  } else {
    a.failles.forEach((f) => {
      lines.push(`**${f.titre}**`)
      lines.push(f.detail)
      lines.push(`> ${f.loi}`)
      lines.push('')
    })
  }

  lines.push('### PLAN D\'ACTION — DEMAIN, 06H00')
  const ordres = a.failles.length
    ? a.failles.map((f) => f.correctif)
    : [
        'Passe à l\'échelle : augmente un pilier de 20 % et coupe une source de bruit définitivement.',
        'Prends une décision que tu repousses depuis 7 jours. Aujourd\'hui elle est gratuite, demain elle sera chère.',
      ]
  ordres.slice(0, 4).forEach((o, i) => lines.push(`${i + 1}. ${o}`))

  lines.push('')
  lines.push('### ORDRE DU METTEUR EN SCÈNE')
  lines.push(`*${rnd(CLOSINGS, context.daySeed || 3)}*`)

  return lines.join('\n')
}

/* ------------------------------------------------------------------ */
/*  3. Prompt pour un LLM réel (Groq / Gemini / OpenAI / OpenRouter)     */
/* ------------------------------------------------------------------ */

export const buildPrompt = (entry = {}, context = {}, analysis = null) => {
  const a = analysis || analyseEntry(entry, context)
  const qa = Object.entries(entry.answers || {})
    .map(([q, ans]) => `Q: ${q}\nR: ${ans || '(vide)'}`)
    .join('\n\n')

  return `Tu es « Le Metteur en Scène » : un réalisateur exigeant, un mentor machiavélique et un stratège impitoyable.
Tu coache un acteur qui incarne son « Futur Toi » : un hybride de bourreau de travail polymath (code, lecture, échecs, Coran),
de négociateur d'élite à la Harvey Specter, et de polyglotte orateur. Sa règle absolue : TOUT CE QUI EST COMMENCÉ EST TERMINÉ (zéro abandon).

STYLE : direct, froid, chirurgical, élégant. Tutoie. Aucune flatterie gratuite. Aucune morale générique.
Mobilise explicitement les principes de : Napoleon Hill, Machiavel, Robert Greene (48 lois du pouvoir), Joe Dispenza,
Tony Robbins, Tim Ferriss, Ryan Holiday, Brian Tracy, George Clason. Cite la loi ou le principe quand tu frappes.

DONNÉES MESURÉES (objectives) :
- Taux d'incarnation du jour : ${context.incarnRate ?? 0} %
- Travail profond : ${context.todayMinutes || 0} minutes
- Boucles ouvertes (tâches non finies) : ${context.openLoops ?? 0}
- Série de jours consécutifs : ${context.streak ?? 0}
- Piliers en défaut : ${(context.brokenPillars || []).join(', ') || 'aucun'}
- Score de discipline calculé : ${a.score}/100 (verdict : ${verdictFor(a.score).label})

DÉBRIEFING DE L'ACTEUR :
${qa || '(aucune réponse fournie)'}

PRODUIS EXACTEMENT CE FORMAT EN MARKDOWN :
## COMPTE-RENDU D'ÉVALUATION — <verdict> (<score>/100)
<2 lignes de diagnostic sans complaisance>
### CE QUI A TENU
- ...
### FAILLES DÉTECTÉES
**<titre>** <analyse froide + loi du livre mobilisée>
### PLAN D'ACTION — DEMAIN
1. ... (3 à 5 actions concrètes, horodatées, mesurables)
### ORDRE DU METTEUR EN SCÈNE
<une phrase qui claque, mémorable>

Maximum 450 mots. Pas de préambule, pas de conclusion hors format.`
}

/* ------------------------------------------------------------------ */
/*  4. Appels API LLM (compatibles OpenAI + Gemini)                      */
/* ------------------------------------------------------------------ */

export const PROVIDERS = {
  groq: {
    label: 'Groq (gratuit, ultra-rapide)',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    docs: 'https://console.groq.com/keys',
  },
  gemini: {
    label: 'Google Gemini (gratuit)',
    endpoint:
      'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent',
    model: 'gemini-2.0-flash',
    docs: 'https://aistudio.google.com/app/apikey',
  },
  openrouter: {
    label: 'OpenRouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    docs: 'https://openrouter.ai/keys',
  },
  openai: {
    label: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    docs: 'https://platform.openai.com/api-keys',
  },
  custom: {
    label: 'Endpoint personnalisé (compatible OpenAI)',
    endpoint: '',
    model: '',
    docs: '',
  },
}

export const callLLM = async ({ prompt, settings, signal }) => {
  const { aiProvider = 'groq', aiApiKey = '', aiModel = '', aiEndpoint = '' } = settings || {}
  if (!aiApiKey) throw new Error('Aucune clé API configurée')

  const preset = PROVIDERS[aiProvider] || PROVIDERS.custom
  const model = aiModel || preset.model

  if (aiProvider === 'gemini') {
    const url = preset.endpoint.replace('{model}', model) + `?key=${encodeURIComponent(aiApiKey)}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 1200 },
      }),
    })
    if (!res.ok) throw new Error(`Gemini : ${res.status} ${await safeText(res)}`)
    const json = await res.json()
    const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || ''
    if (!text) throw new Error('Réponse vide du modèle')
    return text
  }

  const endpoint = aiEndpoint || preset.endpoint
  if (!endpoint) throw new Error('Endpoint manquant')

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${aiApiKey}`,
    },
    signal,
    body: JSON.stringify({
      model,
      temperature: 0.85,
      max_tokens: 1200,
      messages: [
        {
          role: 'system',
          content:
            "Tu es un mentor d'élite francophone : froid, précis, exigeant, élégant. Tu réponds en Markdown, sans préambule.",
        },
        { role: 'user', content: prompt },
      ],
    }),
  })
  if (!res.ok) throw new Error(`API : ${res.status} ${await safeText(res)}`)
  const json = await res.json()
  const text = json?.choices?.[0]?.message?.content || ''
  if (!text) throw new Error('Réponse vide du modèle')
  return text
}

const safeText = async (res) => {
  try {
    return (await res.text()).slice(0, 200)
  } catch {
    return ''
  }
}

/* ------------------------------------------------------------------ */
/*  5. Orchestrateur : tente l'IA, retombe toujours sur le moteur local  */
/* ------------------------------------------------------------------ */

export const generateReport = async ({ entry, context, settings, signal }) => {
  const analysis = analyseEntry(entry, context)
  const local = buildLocalReport(entry, context, analysis)
  const hasKey = Boolean(settings?.aiApiKey)

  if (hasKey && settings?.aiEnabled !== false) {
    try {
      const text = await callLLM({
        prompt: buildPrompt(entry, context, analysis),
        settings,
        signal,
      })
      return { text, analysis, source: 'ia', provider: settings.aiProvider }
    } catch (err) {
      return {
        text: local,
        analysis,
        source: 'local',
        error: err?.message || 'Erreur inconnue',
      }
    }
  }

  return { text: local, analysis, source: 'local' }
}

/** Petit « effet machine à écrire » pour la restitution dans l'UI. */
export const typewriter = async (fullText, onChunk, { speed = 6, signal } = {}) => {
  const tokens = fullText.match(/\S+\s*/g) || []
  let acc = ''
  for (let i = 0; i < tokens.length; i += 1) {
    if (signal?.aborted) break
    acc += tokens[i]
    onChunk(acc)
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, speed))
  }
  onChunk(fullText)
  return fullText
}

export const disciplineScoreLabel = (score) => `${pct(score, 100)}/100`
