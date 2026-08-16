package com.guard2.app;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.provider.Settings;
import android.text.TextUtils;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;

import java.util.HashSet;
import java.util.Set;

@CapacitorPlugin(name = "AppLocker")
public class AppLockerPlugin extends Plugin {
    private static final String TAG = "AppLockerPlugin";
    private static final String PREFS = "guardshield_prefs";
    private static final String KEY_LOCKED_APPS = "locked_apps";

    @PluginMethod
    public void setLockedApps(PluginCall call) {
        JSArray apps = call.getArray("apps");
        Set<String> locked = new HashSet<String>();
        if (apps != null) {
            try {
                for (int i = 0; i < apps.length(); i++) {
                    locked.add(apps.getString(i));
                }
            } catch (JSONException e) {
                call.reject("Invalid apps array");
                return;
            }
        }
        SharedPreferences prefs = getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        prefs.edit().putStringSet(KEY_LOCKED_APPS, locked).apply();
        Log.d(TAG, "Locked apps persisted: " + locked);
        call.resolve();
    }

    @PluginMethod
    public void startMonitoring(PluginCall call) {
        boolean enabled = isAccessibilityServiceEnabled();
        call.resolve(makeStatus(enabled, true, false));
    }

    @PluginMethod
    public void stopMonitoring(PluginCall call) {
        SharedPreferences prefs = getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        prefs.edit().putStringSet(KEY_LOCKED_APPS, new HashSet<String>()).apply();
        call.resolve();
    }

    @PluginMethod
    public void requestAccessibilityPermission(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        call.resolve(makeStatus(isAccessibilityServiceEnabled(), true, false));
    }

    private JSObject makeStatus(boolean accessibility, boolean usage, boolean overlay) {
        JSObject ret = new JSObject();
        ret.put("accessibility", accessibility);
        ret.put("usage", usage);
        ret.put("overlay", overlay);
        return ret;
    }

    private boolean isAccessibilityServiceEnabled() {
        final String service = getContext().getPackageName() + "/" + GuardAccessibilityService.class.getName();
        int accessibilityEnabled = 0;
        try {
            accessibilityEnabled = Settings.Secure.getInt(
                    getContext().getContentResolver(),
                    Settings.Secure.ACCESSIBILITY_ENABLED);
        } catch (Settings.SettingNotFoundException e) {
            return false;
        }
        if (accessibilityEnabled != 1) return false;

        String settingValue = Settings.Secure.getString(
                getContext().getContentResolver(),
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
        if (settingValue == null) return false;

        TextUtils.SimpleStringSplitter splitter = new TextUtils.SimpleStringSplitter(':');
        splitter.setString(settingValue);
        while (splitter.hasNext()) {
            if (splitter.next().equalsIgnoreCase(service)) {
                return true;
            }
        }
        return false;
    }
}
