package com.cherifcoder.method.focus;

import android.Manifest;
import android.app.admin.DevicePolicyManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.provider.Settings;

import androidx.core.app.NotificationManagerCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.util.Set;
import java.util.TreeSet;

/**
 * FocusGuardPlugin — pont entre l'interface METHOD et le verrouillage natif.
 *
 * Exposé au WebView sous le nom « FocusGuard » :
 *   start({ minutes, intent, startedAt, deviceOwnerLock })
 *   stop({ reason })
 *   status()            → { active, startedAt, endAt, remainingSeconds, blocked, … }
 *   permissions()       → état des autorisations système
 *   requestDeviceAdmin()
 *   requestNotifications()
 *   openSettings({ which })
 *   setWhitelist({ packages })   → paquets supplémentaires autorisés (CSV)
 *   whitelist()         → liste blanche effective
 *
 * Événements poussés vers le WebView : guardState, guardBlocked, guardEnded.
 */
@CapacitorPlugin(
        name = "FocusGuard",
        permissions = @Permission(
                alias = "notifications",
                strings = {Manifest.permission.POST_NOTIFICATIONS}
        )
)
public class FocusGuardPlugin extends Plugin {

    private final Handler main = new Handler(Looper.getMainLooper());

    @Override
    public void load() {
        FocusManager.setListener(new FocusManager.Listener() {
            @Override
            public void onState() {
                main.post(new Runnable() {
                    @Override
                    public void run() {
                        notifyListeners("guardState", statusData());
                    }
                });
            }

            @Override
            public void onBlocked(final String pkg, final int count) {
                main.post(new Runnable() {
                    @Override
                    public void run() {
                        JSObject d = new JSObject();
                        d.put("package", pkg == null ? "" : pkg);
                        d.put("count", count);
                        notifyListeners("guardBlocked", d);
                    }
                });
            }

            @Override
            public void onEnded(final String reason) {
                main.post(new Runnable() {
                    @Override
                    public void run() {
                        JSObject d = new JSObject();
                        d.put("reason", reason == null ? "manual" : reason);
                        d.put("blocked", FocusManager.blockedCount(getContext()));
                        notifyListeners("guardEnded", d);
                    }
                });
            }
        });
    }

    @Override
    protected void handleOnDestroy() {
        FocusManager.setListener(null);
        super.handleOnDestroy();
    }

    /* ------------------------------- Actions ------------------------------- */

    @PluginMethod
    public void start(PluginCall call) {
        Context ctx = getContext();
        Integer minutes = call.getInt("minutes", 90);
        Long startedAt = call.getLong("startedAt", 0L);
        String intent = call.getString("intent", "");
        Boolean deviceOwnerLock = call.getBoolean("deviceOwnerLock", Boolean.TRUE);

        FocusManager.start(
                ctx,
                startedAt == null ? 0L : startedAt,
                minutes == null ? 90 : minutes,
                intent == null ? "" : intent,
                deviceOwnerLock == null || deviceOwnerLock);

        enterLockTaskIfPossible();

        JSObject res = statusData();
        res.put("permissions", permissionsData());
        call.resolve(res);
    }

    @PluginMethod
    public void stop(PluginCall call) {
        String reason = call.getString("reason", "manual");
        FocusManager.stop(getContext(), reason);
        exitLockTask();
        call.resolve(statusData());
    }

    @PluginMethod
    public void status(PluginCall call) {
        call.resolve(statusData());
    }

    @PluginMethod
    public void permissions(PluginCall call) {
        call.resolve(permissionsData());
    }

    @PluginMethod
    public void requestDeviceAdmin(PluginCall call) {
        Context ctx = getContext();
        try {
            Intent i = new Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN);
            i.putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, adminComponent(ctx));
            i.putExtra(DevicePolicyManager.EXTRA_ADD_EXPLANATION, ctx.getString(com.cherifcoder.method.R.string.focus_admin_explanation));
            launch(i);
            call.resolve();
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void requestNotifications(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            call.resolve(permissionsData());
            return;
        }
        if (getPermissionState("notifications") == PermissionState.GRANTED) {
            call.resolve(permissionsData());
            return;
        }
        requestPermissionForAlias("notifications", call, "notificationsCallback");
    }

    @PermissionCallback
    private void notificationsCallback(PluginCall call) {
        call.resolve(permissionsData());
    }

    @PluginMethod
    public void openSettings(PluginCall call) {
        Context ctx = getContext();
        String which = call.getString("which", "accessibility");
        try {
            Intent i;
            if ("overlay".equals(which)) {
                i = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + ctx.getPackageName()));
            } else if ("notifications".equals(which)) {
                i = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
                        .putExtra(Settings.EXTRA_APP_PACKAGE, ctx.getPackageName());
            } else if ("battery".equals(which)) {
                i = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:" + ctx.getPackageName()));
            } else if ("appDetails".equals(which)) {
                i = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + ctx.getPackageName()));
            } else {
                i = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
            }
            launch(i);
            call.resolve();
        } catch (Exception e) {
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void setWhitelist(PluginCall call) {
        String packages = call.getString("packages", "");
        FocusManager.setExtraWhitelist(getContext(), packages);
        call.resolve(whitelistData());
    }

    @PluginMethod
    public void whitelist(PluginCall call) {
        call.resolve(whitelistData());
    }

    /* -------------------------------- Données -------------------------------- */

    private JSObject statusData() {
        Context ctx = getContext();
        JSObject o = new JSObject();
        o.put("active", FocusManager.isActive(ctx));
        o.put("startedAt", FocusManager.startedAt(ctx));
        o.put("endAt", FocusManager.endAt(ctx));
        o.put("remainingSeconds", FocusManager.remainingSeconds(ctx));
        o.put("blocked", FocusManager.blockedCount(ctx));
        o.put("intent", FocusManager.intent(ctx));
        o.put("lastPackage", FocusManager.lastPackage(ctx) == null ? "" : FocusManager.lastPackage(ctx));
        o.put("deviceOwnerLock", FocusManager.isDeviceOwnerLock(ctx));
        return o;
    }

    private JSObject permissionsData() {
        Context ctx = getContext();
        JSObject o = new JSObject();
        o.put("supported", true);
        o.put("accessibility", FocusAccessibilityService.isEnabled(ctx));
        o.put("overlay", canDrawOverlays(ctx));
        o.put("deviceAdmin", isDeviceAdminActive(ctx));
        o.put("deviceOwner", FocusManager.isDeviceOwner(ctx));
        o.put("notifications", notificationsEnabled(ctx));
        o.put("battery", ignoringBatteryOptimizations(ctx));
        o.put("sdk", Build.VERSION.SDK_INT);
        return o;
    }

    private JSObject whitelistData() {
        Context ctx = getContext();
        Set<String> all = new TreeSet<>(FocusManager.baseAllowed());
        all.addAll(FocusManager.extraWhitelist(ctx));
        all.add(ctx.getPackageName());
        StringBuilder csv = new StringBuilder();
        for (String p : FocusManager.extraWhitelist(ctx)) {
            if (csv.length() > 0) csv.append(",");
            csv.append(p);
        }
        JSObject o = new JSObject();
        o.put("base", String.join(",", all));
        o.put("extra", csv.toString());
        return o;
    }

    /* ------------------------------- Utilitaires ------------------------------- */

    private ComponentName adminComponent(Context ctx) {
        return new ComponentName(ctx, FocusDeviceAdminReceiver.class);
    }

    private boolean isDeviceAdminActive(Context ctx) {
        try {
            DevicePolicyManager dpm = (DevicePolicyManager) ctx.getSystemService(Context.DEVICE_POLICY_SERVICE);
            return dpm != null && dpm.isAdminActive(adminComponent(ctx));
        } catch (Exception e) {
            return false;
        }
    }

    private boolean canDrawOverlays(Context ctx) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return true;
        try {
            return Settings.canDrawOverlays(ctx);
        } catch (Exception e) {
            return false;
        }
    }

    private boolean notificationsEnabled(Context ctx) {
        try {
            return NotificationManagerCompat.from(ctx).areNotificationsEnabled();
        } catch (Exception e) {
            return false;
        }
    }

    private boolean ignoringBatteryOptimizations(Context ctx) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return true;
        try {
            PowerManager pm = (PowerManager) ctx.getSystemService(Context.POWER_SERVICE);
            return pm != null && pm.isIgnoringBatteryOptimizations(ctx.getPackageName());
        } catch (Exception e) {
            return false;
        }
    }

    private void launch(Intent intent) {
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        if (getActivity() != null) getActivity().startActivity(intent);
        else getContext().startActivity(intent);
    }

    private void enterLockTaskIfPossible() {
        if (!FocusManager.isDeviceOwner(getContext()) || getActivity() == null) return;
        getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    getActivity().startLockTask();
                } catch (Exception ignored) {
                    /* le mode kiosque n'est pas indispensable : la surimpression suffit */
                }
            }
        });
    }

    private void exitLockTask() {
        if (getActivity() == null) return;
        getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    getActivity().stopLockTask();
                } catch (Exception ignored) {
                }
            }
        });
    }
}
