package com.guard2.app;

import android.app.usage.UsageEvents;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.provider.Settings;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;

import java.util.ArrayList;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;

@CapacitorPlugin(name = "AppLocker")
public class AppLockerPlugin extends Plugin {
    private Timer timer;
    private List<String> lockedApps = new ArrayList<>();
    private String lastApp = "";

    @PluginMethod
    public void setLockedApps(PluginCall call) {
        JSArray apps = call.getArray("apps");
        lockedApps.clear();
        if (apps != null) {
            try {
                for (int i = 0; i < apps.length(); i++) {
                    lockedApps.add(apps.getString(i));
                }
            } catch (JSONException e) {
                call.reject("Invalid apps array");
                return;
            }
        }
        call.resolve();
    }

    @PluginMethod
    public void startMonitoring(PluginCall call) {
        Context context = getContext();
        final UsageStatsManager usm = (UsageStatsManager) context.getSystemService(Context.USAGE_STATS_SERVICE);
        
        if (timer != null) timer.cancel();
        
        timer = new Timer();
        timer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                String foregroundApp = getForegroundApp(usm);
                if (foregroundApp != null && !foregroundApp.equals(getContext().getPackageName())) {
                    if (lockedApps.contains(foregroundApp) && !foregroundApp.equals(lastApp)) {
                        Log.d("AppLocker", "Locking app: " + foregroundApp);
                        Intent intent = new Intent(getContext(), LockActivity.class);
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                        getContext().startActivity(intent);
                    }
                    lastApp = foregroundApp;
                } else if (foregroundApp != null && foregroundApp.equals(getContext().getPackageName())) {
                    // Reset lastApp when our app is in foreground to allow re-locking if user switches back
                    lastApp = "";
                }
            }
        }, 0, 500); // Check every 500ms for better responsiveness
        
        call.resolve();
    }
    
    private String getForegroundApp(UsageStatsManager usm) {
        long time = System.currentTimeMillis();
        UsageEvents events = usm.queryEvents(time - 2000, time);
        UsageEvents.Event event = new UsageEvents.Event();
        String lastPackage = null;
        while (events.hasNextEvent()) {
            events.getNextEvent(event);
            if (event.getEventType() == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                lastPackage = event.getPackageName();
            }
        }
        return lastPackage;
    }

    @PluginMethod
    public void stopMonitoring(PluginCall call) {
        if (timer != null) timer.cancel();
        call.resolve();
    }
    
    @PluginMethod
    public void requestUsagePermission(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void requestOverlayPermission(PluginCall call) {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            if (!Settings.canDrawOverlays(getContext())) {
                Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:" + getContext().getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
            }
        }
        call.resolve();
    }

    @PluginMethod
    public void checkPermissions(PluginCall call) {
        JSObject ret = new JSObject();
        boolean usage = false;
        boolean overlay = true;

        UsageStatsManager usm = (UsageStatsManager) getContext().getSystemService(Context.USAGE_STATS_SERVICE);
        long time = System.currentTimeMillis();
        List<UsageStats> stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, time - 1000 * 60, time);
        usage = (stats != null && !stats.isEmpty());

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            overlay = Settings.canDrawOverlays(getContext());
        }

        ret.put("usage", usage);
        ret.put("overlay", overlay);
        call.resolve(ret);
    }
}
