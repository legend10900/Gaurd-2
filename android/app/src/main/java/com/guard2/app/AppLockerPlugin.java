package com.guard2.app;

import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.provider.Settings;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.List;
import java.util.Timer;
import java.util.TimerTask;

@CapacitorPlugin(name = "AppLocker")
public class AppLockerPlugin extends Plugin {
    private Timer timer;

    @PluginMethod
    public void startMonitoring(PluginCall call) {
        Context context = getContext();
        UsageStatsManager usm = (UsageStatsManager) context.getSystemService(Context.USAGE_STATS_SERVICE);
        
        timer = new Timer();
        timer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                long time = System.currentTimeMillis();
                List<UsageStats> appList = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, time - 1000 * 10, time);
                if (appList != null && appList.size() > 0) {
                    // Logic to check foreground app and overlay lock screen via SYSTEM_ALERT_WINDOW
                    // For the scope of this bridge, we notify JS layer
                    JSObject ret = new JSObject();
                    ret.put("foregroundApp", "com.whatsapp"); // Example
                    notifyListeners("onAppOpened", ret);
                }
            }
        }, 0, 1000);
        
        call.resolve();
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
