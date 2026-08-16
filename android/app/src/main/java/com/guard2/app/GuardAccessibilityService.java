package com.guard2.app;

import android.accessibilityservice.AccessibilityService;
import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;

import java.util.HashSet;
import java.util.Set;

/**
 * Runs in the background (managed by the system) to detect when the user
 * switches to a locked app and show the lock screen.
 */
public class GuardAccessibilityService extends AccessibilityService {
    private static final String TAG = "GuardAccessibility";
    private static final String PREFS = "guardshield_prefs";
    private static final String KEY_LOCKED_APPS = "locked_apps";

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event.getEventType() != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return;
        if (event.getPackageName() == null) return;

        String foregroundPkg = event.getPackageName().toString();
        // Never lock our own app
        if (foregroundPkg.equals(getPackageName())) return;

        SharedPreferences prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        Set<String> locked = prefs.getStringSet(KEY_LOCKED_APPS, new HashSet<String>());
        if (locked.contains(foregroundPkg)) {
            Log.d(TAG, "Locking app: " + foregroundPkg);
            Intent intent = new Intent(this, LockActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(intent);
        }
    }

    @Override
    public void onInterrupt() {
        Log.e(TAG, "Accessibility Service Interrupted");
    }
}
