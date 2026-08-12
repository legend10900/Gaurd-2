package com.guard2.app;

import android.content.Intent;
import android.os.Environment;
import android.provider.Settings;
import android.net.Uri;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.util.ArrayList;

import android.text.TextUtils;
import android.util.Log;

import android.content.IntentFilter;
import android.os.BatteryManager;

@CapacitorPlugin(name = "DeviceScanner")
public class ScannerPlugin extends Plugin {

    @PluginMethod
    public void getBatteryTemperature(PluginCall call) {
        Intent intent = getContext().registerReceiver(null, new IntentFilter(Intent.ACTION_BATTERY_CHANGED));
        float temp = ((float) intent.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, 0)) / 10;
        JSObject ret = new JSObject();
        ret.put("temperature", temp);
        call.resolve(ret);
    }

    @PluginMethod
    public void isAccessibilityServiceEnabled(PluginCall call) {
        boolean enabled = false;
        int accessibilityEnabled = 0;
        final String service = getContext().getPackageName() + "/" + CacheAccessibilityService.class.getName();
        try {
            accessibilityEnabled = Settings.Secure.getInt(
                    getContext().getApplicationContext().getContentResolver(),
                    android.provider.Settings.Secure.ACCESSIBILITY_ENABLED);
        } catch (Settings.SettingNotFoundException e) {
            Log.e("ScannerPlugin", "Error finding setting, default is off", e);
        }
        TextUtils.SimpleStringSplitter mStringColonSplitter = new TextUtils.SimpleStringSplitter(':');

        if (accessibilityEnabled == 1) {
            String settingValue = Settings.Secure.getString(
                    getContext().getApplicationContext().getContentResolver(),
                    Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
            if (settingValue != null) {
                mStringColonSplitter.setString(settingValue);
                while (mStringColonSplitter.hasNext()) {
                    String accessibilityService = mStringColonSplitter.next();
                    if (accessibilityService.equalsIgnoreCase(service)) {
                        enabled = true;
                    }
                }
            }
        }
        JSObject ret = new JSObject();
        ret.put("enabled", enabled);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestAccessibilityPermission(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void requestStoragePermission(PluginCall call) {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
            try {
                Intent intent = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION);
                intent.addCategory("android.intent.category.DEFAULT");
                intent.setData(Uri.parse(String.format("package:%s", getContext().getPackageName())));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
            } catch (Exception e) {
                Intent intent = new Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
            }
        }
        call.resolve();
    }

    @PluginMethod
    public void scanAllFiles(PluginCall call) {
        File root = Environment.getExternalStorageDirectory();
        ArrayList<String> filesFound = new ArrayList<>();
        
        scanDirectory(root, filesFound);
        
        JSObject ret = new JSObject();
        JSArray jsArray = new JSArray(filesFound);
        ret.put("files", jsArray);
        call.resolve(ret);
    }

    @PluginMethod
    public void getJunkSize(PluginCall call) {
        long totalSize = 0;
        File cacheDir = getContext().getCacheDir();
        File extCacheDir = getContext().getExternalCacheDir();
        
        totalSize += getDirSize(cacheDir);
        if (extCacheDir != null) {
            totalSize += getDirSize(extCacheDir);
        }
        
        JSObject ret = new JSObject();
        ret.put("sizeBytes", totalSize);
        ret.put("sizeMB", totalSize / (1024 * 1024));
        call.resolve(ret);
    }

    @PluginMethod
    public void cleanJunk(PluginCall call) {
        File cacheDir = getContext().getCacheDir();
        File extCacheDir = getContext().getExternalCacheDir();
        
        deleteDir(cacheDir);
        if (extCacheDir != null) {
            deleteDir(extCacheDir);
        }
        
        call.resolve();
    }

    private long getDirSize(File dir) {
        long size = 0;
        File[] files = dir.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    size += getDirSize(file);
                } else {
                    size += file.length();
                }
            }
        }
        return size;
    }

    private void deleteDir(File dir) {
        File[] files = dir.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    deleteDir(file);
                } else {
                    file.delete();
                }
            }
        }
    }
    
    private void scanDirectory(File dir, ArrayList<String> list) {
        File[] files = dir.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    scanDirectory(file, list);
                } else {
                    list.add(file.getAbsolutePath());
                }
            }
        }
    }
}
