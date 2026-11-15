/* ------------------------------------------------------------------
   crypto.js — hachage du code PIN (jamais stocké en clair)

   Le PIN ne quitte jamais l'appareil : on stocke un SHA-256 salé,
   itéré 12 000 fois (PBKDF-like artisanal) pour ralentir le bruteforce
   côté appareil. Aucune donnée n'est envoyée sur un serveur.
------------------------------------------------------------------- */

const ITERATIONS = 12000

const toHex = (buffer) =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

const randomSalt = () => {
  const bytes = new Uint8Array(16)
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256)
  }
  return toHex(bytes)
}

const sha256 = async (text) => {
  const enc = new TextEncoder().encode(text)
  if (globalThis.crypto?.subtle) {
    return globalThis.crypto.subtle.digest('SHA-256', enc)
  }
  // Repli (WebView très anciens) : FNV-1a itéré — moins fort mais fonctionnel.
  let h1 = 0x811c9dc5
  let h2 = 0x01000193
  for (let i = 0; i < enc.length; i += 1) {
    h1 = Math.imul(h1 ^ enc[i], 16777619) >>> 0
    h2 = Math.imul(h2 + enc[i], 2246822519) >>> 0
  }
  const fake = new Uint8Array(32)
  for (let i = 0; i < 32; i += 1) fake[i] = (h1 >>> (i % 4)) ^ (h2 >>> (i % 3)) ^ i
  return fake.buffer
}

export const hashPin = async (pin, salt = randomSalt()) => {
  let digest = await sha256(`${salt}:${pin}`)
  for (let i = 1; i < ITERATIONS; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    digest = await sha256(`${salt}:${toHex(digest)}:${i}`)
  }
  return { salt, hash: toHex(digest), iterations: ITERATIONS }
}

export const verifyPin = async (pin, record) => {
  if (!record?.salt || !record?.hash) return false
  const { hash } = await hashPin(pin, record.salt)
  // Comparaison à temps constant
  if (hash.length !== record.hash.length) return false
  let diff = 0
  for (let i = 0; i < hash.length; i += 1) diff |= hash.charCodeAt(i) ^ record.hash.charCodeAt(i)
  return diff === 0
}

export const newSalt = randomSalt
