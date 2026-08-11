package com.guard2.app;

import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
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
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        getContext().startActivity(intent);
                    }
                    lastApp = foregroundApp;
                }
            }
        }, 0, 1000);
        
        call.resolve();
    }
    
    private String getForegroundApp(UsageStatsManager usm) {
        long time = System.currentTimeMillis();
        List<UsageStats> appList = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, time - 1000 * 10, time);
        if (appList != null && appList.size() > 0) {
            UsageStats bestStat = null;
            for (UsageStats stat : appList) {
                if (bestStat == null || stat.getLastTimeUsed() > bestStat.getLastTimeUsed()) {
                    bestStat = stat;
                }
            }
            return bestStat != null ? bestStat.getPackageName() : null;
        }
        return null;
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
}
