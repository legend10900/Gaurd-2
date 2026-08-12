package com.guard2.app;

import android.accessibilityservice.AccessibilityService;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.util.Log;

import java.util.List;

public class CacheAccessibilityService extends AccessibilityService {
    private static final String TAG = "CacheClearer";

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event.getEventType() == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            AccessibilityNodeInfo rootNode = getRootInActiveWindow();
            if (rootNode == null) return;

            // Look for "Clear cache" button
            // This is a simplified version, real production would handle multiple languages
            List<AccessibilityNodeInfo> nodes = rootNode.findAccessibilityNodeInfosByText("Clear cache");
            for (AccessibilityNodeInfo node : nodes) {
                if (node.isClickable()) {
                    Log.d(TAG, "Clicking Clear Cache button");
                    node.performAction(AccessibilityNodeInfo.ACTION_CLICK);
                }
            }
        }
    }

    @Override
    public void onInterrupt() {
        Log.e(TAG, "Accessibility Service Interrupted");
    }
}
