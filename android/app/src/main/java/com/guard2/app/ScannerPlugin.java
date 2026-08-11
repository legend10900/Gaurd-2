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

@CapacitorPlugin(name = "DeviceScanner")
public class ScannerPlugin extends Plugin {

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
        
        // Example recursive scan logic limits to 100 files for demo speed
        int[] count = new int[]{0};
        scanDirectory(root, filesFound, count);
        
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
    
    private void scanDirectory(File dir, ArrayList<String> list, int[] count) {
        if (count[0] > 100) return;
        File[] files = dir.listFiles();
        if (files != null) {
            for (File file : files) {
                if (count[0] > 100) return;
                if (file.isDirectory()) {
                    scanDirectory(file, list, count);
                } else {
                    list.add(file.getAbsolutePath());
                    count[0]++;
                }
            }
        }
    }
}
