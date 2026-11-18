package com.cherifcoder.method.focus;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.cherifcoder.method.MainActivity;

/**
 * FocusOverlay — la surimpression plein écran affichée par-dessus toute
 * application interdite pendant la session.
 *
 * Elle est ajoutée par le service d'accessibilité avec le type
 * TYPE_ACCESSIBILITY_OVERLAY : aucun permission système requise, et elle
 * passe au-dessus de toutes les apps (mais sous la barre d'état).
 *
 * Elle consomme les touches (elle n'est pas FLAG_NOT_TOUCHABLE), donc l'app
 * bloquée en dessous ne reçoit rien. Le seul bouton actif ramène sur METHOD.
 */
public final class FocusOverlay {

    private static View sView = null;
    private static TextView sTime = null;
    private static TextView sCount = null;

    private FocusOverlay() {
    }

    @SuppressWarnings("deprecation") // TYPE_SYSTEM_ALERT : repli pour Android < 5.1
    public static synchronized void show(Context ctx) {
        if (sView != null) {
            update(FocusManager.remainingSeconds(ctx), FocusManager.blockedCount(ctx));
            return;
        }
        try {
            WindowManager wm = (WindowManager) ctx.getSystemService(Context.WINDOW_SERVICE);
            if (wm == null) return;

            sView = build(ctx);
            update(FocusManager.remainingSeconds(ctx), FocusManager.blockedCount(ctx));

            WindowManager.LayoutParams lp = new WindowManager.LayoutParams(
                    WindowManager.LayoutParams.MATCH_PARENT,
                    WindowManager.LayoutParams.MATCH_PARENT,
                    Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP_MR1
                            ? WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY
                            : WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                            | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
                            | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
                    android.graphics.PixelFormat.OPAQUE);
            lp.gravity = Gravity.TOP | Gravity.START;

            wm.addView(sView, lp);
        } catch (Exception e) {
            sView = null;
        }
    }

    public static synchronized void hide() {
        if (sView == null) return;
        try {
            View v = sView;
            sView = null;
            sTime = null;
            sCount = null;
            WindowManager wm = (WindowManager) v.getContext().getSystemService(Context.WINDOW_SERVICE);
            if (wm != null) wm.removeViewImmediate(v);
        } catch (Exception ignored) {
            sView = null;
            sTime = null;
            sCount = null;
        }
    }

    public static synchronized void update(int remainingSeconds, int blocked) {
        if (sTime != null) sTime.setText(format(remainingSeconds));
        if (sCount != null) sCount.setText(blockedLabel(blocked));
    }

    /* ------------------------------- Rendu ------------------------------- */

    private static View build(final Context ctx) {
        FrameLayout root = new FrameLayout(ctx);
        GradientDrawable bg = new GradientDrawable(GradientDrawable.Orientation.TOP_BOTTOM,
                new int[]{0xFF0B0E16, 0xFF05060A});
        root.setBackground(bg);
        root.setClickable(true);
        root.setFocusable(false);

        LinearLayout col = new LinearLayout(ctx);
        col.setOrientation(LinearLayout.VERTICAL);
        col.setGravity(Gravity.CENTER);
        int pad = dp(ctx, 34);
        col.setPadding(pad, pad, pad, pad);
        FrameLayout.LayoutParams colLp = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT);
        col.setLayoutParams(colLp);

        TextView eyebrow = text(ctx, "METHOD  ·  VERROUILLAGE STRICT", 12f, 0xFFCFA851);
        eyebrow.setLetterSpacing(0.22f);
        eyebrow.setTypeface(Typeface.DEFAULT_BOLD);
        col.addView(eyebrow);

        TextView title = text(ctx, "Session en cours", 30f, 0xFFF3E4C0);
        title.setTypeface(Typeface.create("sans-serif-light", Typeface.NORMAL));
        LinearLayout.LayoutParams titleLp = wrap();
        titleLp.topMargin = dp(ctx, 10);
        col.addView(title, titleLp);

        sTime = text(ctx, "90:00", 58f, 0xFFE0C07C);
        sTime.setTypeface(Typeface.MONOSPACE);
        LinearLayout.LayoutParams timeLp = wrap();
        timeLp.topMargin = dp(ctx, 18);
        col.addView(sTime, timeLp);

        TextView sub = text(ctx, "Cette application est bloquée pendant ton Deep Work.", 14f, 0xFF9AA0B5);
        sub.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams subLp = wrap();
        subLp.topMargin = dp(ctx, 20);
        col.addView(sub, subLp);

        sCount = text(ctx, "Aucune tentative", 13f, 0xFFB4323C);
        sCount.setTypeface(Typeface.DEFAULT_BOLD);
        LinearLayout.LayoutParams countLp = wrap();
        countLp.topMargin = dp(ctx, 12);
        col.addView(sCount, countLp);

        TextView button = text(ctx, "Revenir à METHOD", 15f, 0xFF05060A);
        button.setTypeface(Typeface.DEFAULT_BOLD);
        button.setGravity(Gravity.CENTER);
        button.setPadding(dp(ctx, 26), dp(ctx, 15), dp(ctx, 26), dp(ctx, 15));
        GradientDrawable btnBg = new GradientDrawable();
        btnBg.setColor(0xFFE0C07C);
        btnBg.setCornerRadius(dp(ctx, 14));
        button.setBackground(btnBg);
        button.setClickable(true);
        button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                openApp(ctx);
            }
        });
        LinearLayout.LayoutParams btnLp = wrap();
        btnLp.topMargin = dp(ctx, 30);
        col.addView(button, btnLp);

        TextView foot = text(ctx, "Les appels téléphoniques restent autorisés.", 12f, 0xFF6B7280);
        LinearLayout.LayoutParams footLp = wrap();
        footLp.topMargin = dp(ctx, 26);
        col.addView(foot, footLp);

        root.addView(col);
        return root;
    }

    private static void openApp(Context ctx) {
        try {
            Intent i = new Intent(ctx, MainActivity.class);
            i.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK
                    | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
                    | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            ctx.startActivity(i);
            hide();
        } catch (Exception ignored) {
            /* si le lancement échoue, la surimpression reste : mieux que rien */
        }
    }

    /* ------------------------------ Utilitaires ------------------------------ */

    private static TextView text(Context ctx, String value, float sp, int color) {
        TextView t = new TextView(ctx);
        t.setText(value);
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp);
        t.setTextColor(color);
        return t;
    }

    private static LinearLayout.LayoutParams wrap() {
        return new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
    }

    private static int dp(Context ctx, int value) {
        return (int) (value * ctx.getResources().getDisplayMetrics().density + 0.5f);
    }

    private static String format(int totalSeconds) {
        int s = Math.max(0, totalSeconds);
        int h = s / 3600;
        int m = (s % 3600) / 60;
        int sec = s % 60;
        if (h > 0) return String.format(java.util.Locale.FRANCE, "%d:%02d:%02d", h, m, sec);
        return String.format(java.util.Locale.FRANCE, "%02d:%02d", m, sec);
    }

    private static String blockedLabel(int blocked) {
        if (blocked <= 0) return "Aucune tentative de contournement";
        if (blocked == 1) return "1 tentative bloquée";
        return blocked + " tentatives bloquées";
    }

    /** Couleur utilitaire (réservée à un usage futur de thème dynamique). */
    @SuppressWarnings("unused")
    private static int alpha(int color, float ratio) {
        return Color.argb((int) (255 * ratio), Color.red(color), Color.green(color), Color.blue(color));
    }
}
