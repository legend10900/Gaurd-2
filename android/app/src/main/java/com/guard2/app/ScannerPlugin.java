package com.guard2.app;

import android.content.Context;
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
import java.io.FileInputStream;
import java.security.MessageDigest;
import java.util.ArrayList;

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
    public void getFileHash(PluginCall call) {
        String path = call.getString("path");
        if (path == null) {
            call.reject("Path is required");
            return;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            File file = new File(path);
            if (!file.exists()) {
                call.reject("File does not exist");
                return;
            }
            FileInputStream fis = new FileInputStream(file);
            byte[] buffer = new byte[8192];
            int count;
            while ((count = fis.read(buffer)) > 0) {
                digest.update(buffer, 0, count);
            }
            fis.close();
            byte[] hash = digest.digest();
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            JSObject ret = new JSObject();
            ret.put("hash", hexString.toString());
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Hash calculation failed: " + e.getMessage());
        }
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
        new Thread(() -> {
            try {
                File root = Environment.getExternalStorageDirectory();
                ArrayList<String> list = new ArrayList<>();
                java.util.Stack<File> stack = new java.util.Stack<>();
                stack.push(root);

                while (!stack.isEmpty()) {
                    File current = stack.pop();
                    File[] files = current.listFiles();
                    if (files != null) {
                        for (File file : files) {
                            if (file.isDirectory()) {
                                stack.push(file);
                            } else {
                                list.add(file.getAbsolutePath());
                                if (list.size() >= 500) break;
                            }
                        }
                    }
                    if (list.size() >= 500) break;
                }
                
                JSObject ret = new JSObject();
                JSArray jsArray = new JSArray(list);
                ret.put("files", jsArray);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Scan failed: " + e.getMessage());
            }
        }).start();
    }

    @PluginMethod
    public void getJunkSize(PluginCall call) {
        long totalSize = 0;
        File cacheDir = getContext().getCacheDir();
        File extCacheDir = getContext().getExternalCacheDir();
        File codeCacheDir = getContext().getCodeCacheDir();

        totalSize += getDirSize(cacheDir);
        totalSize += getDirSize(codeCacheDir);
        if (extCacheDir != null) {
            totalSize += getDirSize(extCacheDir);
        }
        // Other apps' cache dirs under shared external storage (requires All Files Access on Android 11+)
        totalSize += getExternalDataCacheSize();

        JSObject ret = new JSObject();
        ret.put("sizeBytes", totalSize);
        ret.put("sizeMB", totalSize / (1024 * 1024));
        call.resolve(ret);
    }

    @PluginMethod
    public void getJunkApps(PluginCall call) {
        ArrayList<String> packages = new ArrayList<>();
        ArrayList<Long> sizes = new ArrayList<>();
        long totalSize = 0;

        try {
            File androidData = new File(Environment.getExternalStorageDirectory(), "Android/data");
            File[] dirs = androidData.listFiles();
            if (dirs != null) {
                for (File pkg : dirs) {
                    File cache = new File(pkg, "cache");
                    long size = getDirSize(cache);
                    if (size > 0) {
                        packages.add(pkg.getName());
                        sizes.add(size);
                        totalSize += size;
                    }
                }
            }
        } catch (Exception e) {
            Log.w("ScannerPlugin", "Cannot list external data caches: " + e.getMessage());
        }

        // Include our own app cache
        long ownSize = getDirSize(getContext().getCacheDir());
        if (ownSize > 0) {
            packages.add(getContext().getPackageName());
            sizes.add(ownSize);
            totalSize += ownSize;
        }

        JSObject ret = new JSObject();
        ret.put("packages", new JSArray(packages));
        ret.put("sizes", new JSArray(sizes));
        ret.put("totalBytes", totalSize);
        call.resolve(ret);
    }

    private long getExternalDataCacheSize() {
        long size = 0;
        try {
            File androidData = new File(Environment.getExternalStorageDirectory(), "Android/data");
            File[] packages = androidData.listFiles();
            if (packages != null) {
                for (File pkg : packages) {
                    File cache = new File(pkg, "cache");
                    size += getDirSize(cache);
                }
            }
        } catch (Exception e) {
            Log.w("ScannerPlugin", "Cannot access external data caches: " + e.getMessage());
        }
        return size;
    }

    @PluginMethod
    public void cleanJunk(PluginCall call) {
        File cacheDir = getContext().getCacheDir();
        File extCacheDir = getContext().getExternalCacheDir();
        File codeCacheDir = getContext().getCodeCacheDir();

        deleteDir(cacheDir);
        deleteDir(codeCacheDir);
        if (extCacheDir != null) {
            deleteDir(extCacheDir);
        }
        deleteExternalDataCaches();
        deleteWebViewCaches();

        call.resolve();
    }

    private void deleteExternalDataCaches() {
        try {
            File androidData = new File(Environment.getExternalStorageDirectory(), "Android/data");
            File[] packages = androidData.listFiles();
            if (packages != null) {
                for (File pkg : packages) {
                    File cache = new File(pkg, "cache");
                    deleteDir(cache);
                }
            }
        } catch (Exception e) {
            Log.w("ScannerPlugin", "Cannot clear external data caches: " + e.getMessage());
        }
    }

    private void deleteWebViewCaches() {
        try {
            getContext().getApplicationContext()
                    .getDir("webview", Context.MODE_PRIVATE);
            File webview = new File(getContext().getApplicationContext().getFilesDir(), "webview");
            deleteDir(webview);
        } catch (Exception e) {
            Log.w("ScannerPlugin", "Cannot clear webview caches: " + e.getMessage());
        }
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
