package com.cherifcoder.method.focus;

import android.accessibilityservice.AccessibilityService;
import android.content.Context;
import android.provider.Settings;
import android.text.TextUtils;
import android.view.accessibility.AccessibilityEvent;

/**
 * FocusAccessibilityService — le poste d'observation du verrouillage.
 *
 * Il surveille les changements de fenêtre. Dès qu'une application non
 * autorisée passe au premier plan pendant une session, il :
 *   1. incrémente le compteur de contournements,
 *   2. affiche la surimpression de blocage par-dessus l'app fautive.
 *
 * C'est ce mécanisme qui intercepte Paramètres, Play Store, navigateurs,
 * réseaux sociaux… et donc aussi la page « infos de l'application » par
 * laquelle on désinstallerait METHOD.
 *
 * Les appels téléphoniques sont explicitement épargnés (voir
 * FocusManager.isCallActive / isAllowed).
 */
public class FocusAccessibilityService extends AccessibilityService {

    @Override
    public void onServiceConnected() {
        super.onServiceConnected();
        // Reprise après redémarrage : si une session courait encore, on la
        // ré-attache (le décompte repart là où il en était).
        FocusManager.reconcile(getApplicationContext());
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null) return;
        int type = event.getEventType();
        if (type != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
                && type != AccessibilityEvent.TYPE_WINDOWS_CHANGED) {
            return;
        }

        Context ctx = getApplicationContext();
        if (!FocusManager.isActive(ctx)) {
            FocusOverlay.hide();
            return;
        }

        CharSequence pkgSeq = event.getPackageName();
        String pkg = pkgSeq == null ? null : pkgSeq.toString();
        if (pkg == null || pkg.isEmpty()) return;

        // Appel en cours ou application autorisée → rien à faire, on libère l'écran.
        if (FocusManager.isCallActive(ctx) || FocusManager.isAllowed(ctx, pkg)) {
            FocusOverlay.hide();
            return;
        }

        FocusManager.onBlocked(ctx, pkg);
        // Le contexte du service est requis pour TYPE_ACCESSIBILITY_OVERLAY.
        FocusOverlay.show(this);
    }

    @Override
    public void onInterrupt() {
        FocusOverlay.hide();
    }

    @Override
    public void onDestroy() {
        FocusOverlay.hide();
        super.onDestroy();
    }

    /* ------------------------------ Diagnostic ------------------------------ */

    /** Le service d'accessibilité METHOD est-il activé dans les réglages ? */
    public static boolean isEnabled(Context ctx) {
        try {
            String flat = Settings.Secure.getString(ctx.getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
            if (flat == null || flat.isEmpty()) return false;
            String full = ctx.getPackageName() + "/" + FocusAccessibilityService.class.getName();
            String shortForm = ctx.getPackageName() + "/.focus.FocusAccessibilityService";
            TextUtils.SimpleStringSplitter splitter = new TextUtils.SimpleStringSplitter(':');
            splitter.setString(flat);
            while (splitter.hasNext()) {
                String entry = splitter.next();
                if (entry == null) continue;
                if (entry.equalsIgnoreCase(full) || entry.equalsIgnoreCase(shortForm)) return true;
            }
        } catch (Exception ignored) {
        }
        return false;
    }
}
