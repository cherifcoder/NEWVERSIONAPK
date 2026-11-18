package com.cherifcoder.method.focus;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;

import androidx.core.app.NotificationCompat;

import com.cherifcoder.method.MainActivity;
import com.cherifcoder.method.R;

import java.util.Locale;

/**
 * FocusService — service de premier plan qui tient le décompte de la session
 * verrouillée, affiche la notification persistante et veille à ce que la
 * surimpression disparaisse dès qu'un appel arrive.
 *
 * Il ne bloque rien lui-même : c'est le service d'accessibilité qui observe.
 * Mais il garantit que le verrouillage survit à la mise en arrière-plan de
 * l'app et que l'utilisateur voit toujours l'état de sa session.
 */
public class FocusService extends Service {

    private static final String CHANNEL_ID = "method_focus_guard";
    private static final int NOTIFICATION_ID = 4711;

    private final Handler handler = new Handler(Looper.getMainLooper());

    private final Runnable tick = new Runnable() {
        @Override
        public void run() {
            if (!FocusManager.isActive(FocusService.this)) {
                stopSelf();
                return;
            }
            int remaining = FocusManager.remainingSeconds(FocusService.this);
            if (remaining <= 0) {
                FocusManager.stop(FocusService.this, "timer");
                return;
            }
            // Les appels sont l'exception : on retire la surimpression dès
            // qu'un appel sonne ou est en cours.
            if (FocusManager.isCallActive(FocusService.this)) {
                FocusOverlay.hide();
            } else {
                FocusOverlay.update(remaining, FocusManager.blockedCount(FocusService.this));
            }
            // `notify` doit être qualifié : dans une classe interne anonyme,
            // `Object.notify()` masque notre méthode homonyme.
            FocusService.this.notify(remaining);
            handler.postDelayed(this, 1000L);
        }
    };

    public static void start(Context ctx) {
        try {
            Intent i = new Intent(ctx, FocusService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                ctx.startForegroundService(i);
            } else {
                ctx.startService(i);
            }
        } catch (Exception ignored) {
            /* démarrage refusé par le système : l'accessibilité prend le relais */
        }
    }

    public static void stop(Context ctx) {
        try {
            ctx.stopService(new Intent(ctx, FocusService.class));
        } catch (Exception ignored) {
        }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        createChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Notification notification = buildNotification(FocusManager.remainingSeconds(this));
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
            } else {
                startForeground(NOTIFICATION_ID, notification);
            }
        } catch (Exception ignored) {
        }
        handler.removeCallbacks(tick);
        handler.post(tick);
        return START_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        handler.removeCallbacks(tick);
        super.onDestroy();
    }

    /* ---------------------------- Notification ---------------------------- */

    private void createChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                getString(R.string.focus_channel_name),
                NotificationManager.IMPORTANCE_LOW);
        channel.setDescription(getString(R.string.focus_channel_description));
        channel.setShowBadge(false);
        channel.enableVibration(false);
        channel.setSound(null, null);
        nm.createNotificationChannel(channel);
    }

    private Notification buildNotification(int remaining) {
        PendingIntent open = PendingIntent.getActivity(
                this,
                0,
                new Intent(this, MainActivity.class)
                        .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        String text = getString(R.string.focus_notification_text, format(remaining), FocusManager.blockedCount(this));

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(getString(R.string.focus_notification_title))
                .setContentText(text)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(text))
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setSilent(true)
                .setCategory(NotificationCompat.CATEGORY_SERVICE)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setContentIntent(open)
                .build();
    }

    private void notify(int remaining) {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        try {
            nm.notify(NOTIFICATION_ID, buildNotification(remaining));
        } catch (Exception ignored) {
        }
    }

    private static String format(int totalSeconds) {
        int s = Math.max(0, totalSeconds);
        int h = s / 3600;
        int m = (s % 3600) / 60;
        int sec = s % 60;
        if (h > 0) return String.format(Locale.FRANCE, "%d:%02d:%02d", h, m, sec);
        return String.format(Locale.FRANCE, "%02d:%02d", m, sec);
    }
}
