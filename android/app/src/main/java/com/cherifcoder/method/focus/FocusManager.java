package com.cherifcoder.method.focus;

import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.media.AudioManager;
import android.os.Build;
import android.os.UserManager;
import android.provider.Settings;
import android.telecom.TelecomManager;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * FocusManager — état partagé du « Deep Work verrouillé » de METHOD.
 *
 * Toute la logique vit ici, en mémoire statique (service, service
 * d'accessibilité et plugin tournent dans le même processus) et dans
 * SharedPreferences (pour survivre à un redémarrage ou à un force-stop).
 *
 * Rôle :
 *   • conserver la session active (début, fin, intention, compteur de blocages) ;
 *   • décider si un paquet est autorisé (liste blanche : METHOD, appels, UI système) ;
 *   • détecter un appel en cours (les appels sont toujours autorisés) ;
 *   • appliquer / relâcher le verrouillage absolu si METHOD est Device Owner.
 *
 * Rien ici ne bloque quoi que ce soit directement : le service
 * d'accessibilité observe, FocusOverlay affiche la surimpression, FocusService
 * tient le décompte et la notification.
 */
public final class FocusManager {

    public static final String PREFS = "method_focus_prefs";

    private static final String KEY_ACTIVE = "active";
    private static final String KEY_STARTED = "started_at";
    private static final String KEY_END = "end_at";
    private static final String KEY_INTENT = "intent";
    private static final String KEY_BLOCKED = "blocked";
    private static final String KEY_LAST_PKG = "last_pkg";
    private static final String KEY_DO_LOCK = "device_owner_lock";

    /**
     * Paquets toujours autorisés, même en verrouillage total :
     * le chemin d'appel téléphonique (exigence : les appels restent 100 %
     * fonctionnels) et l'UI système indispensable (barre d'état, dialogues
     * de permission, composeur d'urgence).
     */
    private static final Set<String> BASE_ALLOWED = new HashSet<>(Arrays.asList(
            "android",
            "com.android.systemui",
            "com.android.permissioncontroller",
            "com.google.android.permissioncontroller",
            // --- Chaîne d'appel téléphonique (entrant + sortant) ---
            "com.android.phone",
            "com.android.server.telecom",
            "com.android.dialer",
            "com.google.android.dialer",
            "com.android.incallui",
            "com.android.emergency",
            "com.samsung.android.dialer",
            "com.samsung.android.incallui",
            "com.oneplus.dialer",
            "com.oplus.dialer",
            "com.coloros.phonemanager"
    ));

    /** Callback vers le plugin Capacitor (remontée d'événements au WebView). */
    public interface Listener {
        void onState();

        void onBlocked(String pkg, int count);

        void onEnded(String reason);
    }

    private static boolean sActive = false;
    private static long sStartedAt = 0L;
    private static long sEndAt = 0L;
    private static String sIntent = "";
    private static int sBlocked = 0;
    private static String sLastPkg = null;
    private static boolean sDeviceOwnerLock = false;
    private static boolean sLoaded = false;
    private static Listener sListener = null;

    private FocusManager() {
    }

    /* ----------------------------- Cycle de vie ----------------------------- */

    public static void setListener(Listener listener) {
        sListener = listener;
    }

    private static SharedPreferences prefs(Context ctx) {
        return ctx.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    private static synchronized void load(Context ctx) {
        if (sLoaded) return;
        SharedPreferences p = prefs(ctx);
        sActive = p.getBoolean(KEY_ACTIVE, false);
        sStartedAt = p.getLong(KEY_STARTED, 0L);
        sEndAt = p.getLong(KEY_END, 0L);
        sIntent = p.getString(KEY_INTENT, "");
        sBlocked = p.getInt(KEY_BLOCKED, 0);
        sLastPkg = p.getString(KEY_LAST_PKG, null);
        sDeviceOwnerLock = p.getBoolean(KEY_DO_LOCK, false);
        sLoaded = true;
        if (sActive && sEndAt <= System.currentTimeMillis()) {
            sActive = false;
        }
    }

    private static void persist(Context ctx) {
        prefs(ctx).edit()
                .putBoolean(KEY_ACTIVE, sActive)
                .putLong(KEY_STARTED, sStartedAt)
                .putLong(KEY_END, sEndAt)
                .putString(KEY_INTENT, sIntent)
                .putInt(KEY_BLOCKED, sBlocked)
                .putString(KEY_LAST_PKG, sLastPkg)
                .putBoolean(KEY_DO_LOCK, sDeviceOwnerLock)
                .apply();
    }

    /* ------------------------------- Session ------------------------------- */

    /**
     * Démarre (ou ré-attache) la session verrouillée.
     *
     * @param startedAt horodatage de départ choisi par l'app (epoch ms), pour
     *                  que le WebView et le natif calculent exactement la même
     *                  fin de session.
     */
    public static synchronized void start(Context ctx, long startedAt, int minutes, String intent, boolean deviceOwnerLock) {
        load(ctx);
        long now = System.currentTimeMillis();
        if (startedAt <= 0 || startedAt > now) startedAt = now;
        long endAt = startedAt + Math.max(1, minutes) * 60000L;

        // Idempotent : si la même session tourne déjà, on ne réinitialise rien.
        if (sActive && sStartedAt == startedAt && Math.abs(sEndAt - endAt) < 1500L) {
            FocusService.start(ctx);
            notifyState();
            return;
        }

        sActive = true;
        sStartedAt = startedAt;
        sEndAt = endAt;
        sIntent = intent == null ? "" : intent;
        sBlocked = 0;
        sLastPkg = null;
        sDeviceOwnerLock = deviceOwnerLock;
        persist(ctx);

        FocusService.start(ctx);
        applyDeviceOwnerLock(ctx);
        notifyState();
    }

    public static synchronized void stop(Context ctx, String reason) {
        load(ctx);
        boolean wasActive = sActive;
        sActive = false;
        sStartedAt = 0L;
        sEndAt = 0L;
        sIntent = "";
        sLastPkg = null;
        sDeviceOwnerLock = false;
        persist(ctx);

        FocusService.stop(ctx);
        FocusOverlay.hide();
        clearDeviceOwnerLock(ctx);

        if (wasActive) notifyEnded(reason == null ? "manual" : reason);
        notifyState();
    }

    /**
     * Filet de sécurité appelé au lancement de l'app : si aucune session
     * active ne subsiste, on relâche tout (verrouillage absolu, service,
     * surimpression) — jamais de blocage fantôme.
     */
    public static synchronized void reconcile(Context ctx) {
        load(ctx);
        boolean expired = sActive && sEndAt <= System.currentTimeMillis();
        if (!sActive || expired) {
            if (expired) {
                stop(ctx, "expired");
            } else {
                clearDeviceOwnerLock(ctx);
                FocusService.stop(ctx);
                FocusOverlay.hide();
            }
        } else {
            FocusService.start(ctx);
        }
    }

    /* ------------------------------ Verdicts ------------------------------ */

    public static synchronized boolean isActive(Context ctx) {
        load(ctx);
        return sActive && sEndAt > System.currentTimeMillis();
    }

    public static synchronized long startedAt(Context ctx) {
        load(ctx);
        return sStartedAt;
    }

    public static synchronized long endAt(Context ctx) {
        load(ctx);
        return sEndAt;
    }

    public static synchronized int remainingSeconds(Context ctx) {
        load(ctx);
        if (!sActive) return 0;
        long left = sEndAt - System.currentTimeMillis();
        return left <= 0 ? 0 : (int) (left / 1000L);
    }

    public static synchronized int blockedCount(Context ctx) {
        load(ctx);
        return sBlocked;
    }

    public static synchronized String lastPackage(Context ctx) {
        load(ctx);
        return sLastPkg;
    }

    public static synchronized String intent(Context ctx) {
        load(ctx);
        return sIntent;
    }

    public static synchronized boolean isDeviceOwnerLock(Context ctx) {
        load(ctx);
        return sDeviceOwnerLock;
    }

    /** Un paquet est-il autorisé pendant la session ? */
    public static boolean isAllowed(Context ctx, String pkg) {
        if (pkg == null || pkg.isEmpty()) return true;
        if (pkg.equals(ctx.getPackageName())) return true;
        if (BASE_ALLOWED.contains(pkg)) return true;
        String ime = defaultImePackage(ctx);
        if (ime != null && ime.equals(pkg)) return true;
        return extraWhitelist(ctx).contains(pkg);
    }

    /**
     * Un appel est-il en cours (sonnerie ou communication) ?
     * Les appels sont l'unique exception : on ne bloque jamais pendant.
     * AudioManager ne demande aucune permission (contrairement à READ_PHONE_STATE).
     */
    public static boolean isCallActive(Context ctx) {
        try {
            AudioManager am = (AudioManager) ctx.getSystemService(Context.AUDIO_SERVICE);
            if (am == null) return false;
            int mode = am.getMode();
            return mode == AudioManager.MODE_IN_CALL
                    || mode == AudioManager.MODE_IN_COMMUNICATION
                    || mode == AudioManager.MODE_RINGTONE;
        } catch (Exception e) {
            return false;
        }
    }

    /** Signalé par le service d'accessibilité : une app interdite vient de passer au premier plan. */
    public static synchronized void onBlocked(Context ctx, String pkg) {
        load(ctx);
        if (!sActive) return;
        sBlocked += 1;
        sLastPkg = pkg;
        persist(ctx);
        Listener l = sListener;
        if (l != null) l.onBlocked(pkg, sBlocked);
    }

    /* --------------------------- Liste blanche --------------------------- */

    public static synchronized Set<String> extraWhitelist(Context ctx) {
        String raw = prefs(ctx).getString("extra_whitelist", "");
        Set<String> set = new HashSet<>();
        if (raw != null) {
            for (String part : raw.split(",")) {
                String p = part.trim();
                if (!p.isEmpty()) set.add(p);
            }
        }
        return set;
    }

    public static synchronized void setExtraWhitelist(Context ctx, String csv) {
        prefs(ctx).edit().putString("extra_whitelist", csv == null ? "" : csv.trim()).apply();
    }

    /** Tous les paquets autorisés d'office (pour l'affichage dans l'app). */
    public static Set<String> baseAllowed() {
        return new HashSet<>(BASE_ALLOWED);
    }

    private static String defaultImePackage(Context ctx) {
        try {
            String ime = Settings.Secure.getString(ctx.getContentResolver(), Settings.Secure.DEFAULT_INPUT_METHOD);
            if (ime != null && ime.contains("/")) return ime.substring(0, ime.indexOf('/'));
        } catch (Exception ignored) {
            /* pas de clavier par défaut lisible */
        }
        return null;
    }

    /* ---------------------- Verrouillage absolu (Device Owner) ---------------------- */

    private static ComponentName adminComponent(Context ctx) {
        return new ComponentName(ctx.getApplicationContext(), FocusDeviceAdminReceiver.class);
    }

    public static boolean isDeviceOwner(Context ctx) {
        try {
            DevicePolicyManager dpm = (DevicePolicyManager) ctx.getSystemService(Context.DEVICE_POLICY_SERVICE);
            return dpm != null && dpm.isDeviceOwnerApp(ctx.getPackageName());
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Verrouillage absolu — uniquement si METHOD est propriétaire de l'appareil.
     * C'est la SEULE voie qui rend la désinstallation réellement impossible.
     */
    private static void applyDeviceOwnerLock(Context ctx) {
        if (!isDeviceOwner(ctx)) return;
        DevicePolicyManager dpm = (DevicePolicyManager) ctx.getSystemService(Context.DEVICE_POLICY_SERVICE);
        if (dpm == null) return;
        ComponentName admin = adminComponent(ctx);
        try {
            dpm.setUninstallBlocked(admin, ctx.getPackageName(), true);
        } catch (Exception ignored) {
        }
        try {
            dpm.addUserRestriction(admin, UserManager.DISALLOW_SAFE_BOOT);
        } catch (Exception ignored) {
        }
        try {
            String dialer = defaultDialerPackage(ctx);
            dpm.setLockTaskPackages(admin, new String[]{
                    ctx.getPackageName(),
                    dialer,
                    "com.android.phone",
                    "com.android.server.telecom",
                    "com.android.systemui"
            });
        } catch (Exception ignored) {
        }
    }

    private static void clearDeviceOwnerLock(Context ctx) {
        if (!isDeviceOwner(ctx)) return;
        DevicePolicyManager dpm = (DevicePolicyManager) ctx.getSystemService(Context.DEVICE_POLICY_SERVICE);
        if (dpm == null) return;
        ComponentName admin = adminComponent(ctx);
        try {
            dpm.setUninstallBlocked(admin, ctx.getPackageName(), false);
        } catch (Exception ignored) {
        }
        try {
            dpm.clearUserRestriction(admin, UserManager.DISALLOW_SAFE_BOOT);
        } catch (Exception ignored) {
        }
        try {
            dpm.setLockTaskPackages(admin, new String[0]);
        } catch (Exception ignored) {
        }
    }

    private static String defaultDialerPackage(Context ctx) {
        try {
            TelecomManager tm = (TelecomManager) ctx.getSystemService(Context.TELECOM_SERVICE);
            if (tm != null) {
                String p = tm.getDefaultDialerPackage();
                if (p != null && !p.isEmpty()) return p;
            }
        } catch (Exception ignored) {
        }
        return "com.android.dialer";
    }

    /* ----------------------------- Événements ----------------------------- */

    private static void notifyState() {
        Listener l = sListener;
        if (l != null) l.onState();
    }

    private static void notifyEnded(String reason) {
        Listener l = sListener;
        if (l != null) l.onEnded(reason);
    }

    /** Compat : certains appels internes n'ont pas besoin du contexte. */
    @SuppressWarnings("unused")
    private static boolean sdkAtLeast(int level) {
        return Build.VERSION.SDK_INT >= level;
    }
}
