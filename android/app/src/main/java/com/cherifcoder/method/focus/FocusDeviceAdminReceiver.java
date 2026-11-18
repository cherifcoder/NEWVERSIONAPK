package com.cherifcoder.method.focus;

import android.app.admin.DeviceAdminReceiver;
import android.content.Context;
import android.content.Intent;

import com.cherifcoder.method.R;

/**
 * FocusDeviceAdminReceiver — administrateur de l'appareil.
 *
 * Sans lui, Android laisse désinstaller METHOD à tout moment. Dès qu'il est
 * activé, le système refuse la désinstallation tant que l'utilisateur n'a pas
 * désactivé cet administrateur — et pendant une session, l'accès aux
 * Paramètres est bloqué par le service d'accessibilité.
 *
 * Si METHOD est (en plus) propriétaire de l'appareil, le verrouillage devient
 * absolu : voir FocusManager.applyDeviceOwnerLock.
 */
public class FocusDeviceAdminReceiver extends DeviceAdminReceiver {

    @Override
    public void onEnabled(Context context, Intent intent) {
        super.onEnabled(context, intent);
    }

    @Override
    public void onDisabled(Context context, Intent intent) {
        super.onDisabled(context, intent);
    }

    @Override
    public CharSequence onDisableRequested(Context context, Intent intent) {
        return context.getString(R.string.focus_admin_disable_warning);
    }
}
