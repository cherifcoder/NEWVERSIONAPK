package com.cherifcoder.method.focus;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/**
 * FocusBootReceiver — relance le verrouillage après un redémarrage ou une mise
 * à jour de l'app, si une session était encore en cours.
 *
 * Filet de sécurité : le service d'accessibilité redémarre aussi tout seul et
 * appelle FocusManager.reconcile() à la connexion.
 */
public class FocusBootReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent == null ? null : intent.getAction();
        if (Intent.ACTION_BOOT_COMPLETED.equals(action)
                || Intent.ACTION_LOCKED_BOOT_COMPLETED.equals(action)
                || Intent.ACTION_MY_PACKAGE_REPLACED.equals(action)) {
            FocusManager.reconcile(context.getApplicationContext());
        }
    }
}
