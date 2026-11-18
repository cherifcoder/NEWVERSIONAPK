/* ------------------------------------------------------------------
   focusGuard.js — pont vers le verrouillage natif « Deep Work »
   ------------------------------------------------------------------
   Sur l'APK Android, le plugin natif « FocusGuard » gère le blocage
   (service d'accessibilité, surimpression, administrateur d'appareil).
   Sur le web, tout est neutralisé : les fonctions renvoient un état
   « non pris en charge » sans jamais lever d'exception, pour que
   l'interface puisse toujours afficher un retour visible.
------------------------------------------------------------------- */

import { Capacitor, registerPlugin } from '@capacitor/core'

const Plugin = registerPlugin('FocusGuard')

/** Le verrouillage strict n'existe que sur l'APK Android. */
export const guardSupported = () => {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
  } catch {
    return false
  }
}

export const WEB_PERMISSIONS = Object.freeze({
  supported: false,
  accessibility: false,
  overlay: false,
  deviceAdmin: false,
  deviceOwner: false,
  notifications: true,
  battery: true,
  sdk: 0,
})

export const WEB_STATUS = Object.freeze({
  active: false,
  startedAt: 0,
  endAt: 0,
  remainingSeconds: 0,
  blocked: 0,
  intent: '',
  lastPackage: '',
  deviceOwnerLock: false,
})

const safe = async (fn, fallback = null) => {
  if (!guardSupported()) return fallback
  try {
    return await fn()
  } catch {
    return fallback
  }
}

export const guardPermissions = () => safe(() => Plugin.permissions(), { ...WEB_PERMISSIONS })
export const guardStatus = () => safe(() => Plugin.status(), { ...WEB_STATUS })

export const guardStart = ({ minutes = 90, intent = '', startedAt = Date.now(), deviceOwnerLock = true } = {}) =>
  safe(() => Plugin.start({ minutes, intent, startedAt, deviceOwnerLock }), null)

export const guardStop = (reason = 'manual') => safe(() => Plugin.stop({ reason }), null)
export const guardRequestDeviceAdmin = () => safe(() => Plugin.requestDeviceAdmin(), null)
export const guardRequestNotifications = () => safe(() => Plugin.requestNotifications(), null)
export const guardOpenSettings = (which = 'accessibility') => safe(() => Plugin.openSettings({ which }), null)
export const guardSetWhitelist = (packages = '') => safe(() => Plugin.setWhitelist({ packages }), null)
export const guardWhitelist = () => safe(() => Plugin.whitelist(), { base: '', extra: '' })

/**
 * Abonne le WebView à un événement natif (« guardState », « guardBlocked »,
 * « guardEnded »). Renvoie un objet { remove() } utilisable directement dans
 * un cleanup d'effet React.
 */
export const guardListen = (event, handler) => {
  if (!guardSupported()) return { remove: () => {} }
  let handle = null
  const promise = Plugin.addListener(event, handler)
  promise.then((h) => {
    handle = h
  }).catch(() => {})
  return {
    remove: () => {
      try {
        if (handle) handle.remove()
        else promise.then((h) => h?.remove?.()).catch(() => {})
      } catch {
        /* rien à détacher */
      }
    },
  }
}
