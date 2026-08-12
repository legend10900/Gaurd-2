# Implementation Plan - Gaurd-2 Security App Enhancements

This plan outlines the fixes and new features requested for the Gaurd-2 application, focusing on backend connectivity, App Lock stability, Phishing detection, and device-wide scanning capabilities.

## User Review Required

> [!IMPORTANT]
> **Accessibility Service**: The cache clearing feature will require an Accessibility Service to automate UI interactions in system settings. The user must manually enable this in Android Settings.
> **All Files Access**: Full device scanning requires the `MANAGE_EXTERNAL_STORAGE` permission, which is a high-risk permission that might need explanation to the end-user.
> **Backend URL**: The backend URL will be updated to `https://gaurdshield-2.onrender.com`. Please ensure the backend is active.

## Open Questions

- **External API Keys**: For the Phishing Link Inspector, would you like to use Google Safe Browsing or another specific provider? If so, an API key will be required. I will add a configuration option for this.
- **App Lock**: Is there a specific behavior that isn't working (e.g., the lock screen doesn't appear, or it crashes)? I suspect it's related to missing permissions or foreground activity detection on newer Android versions.

## Proposed Changes

### 1. Global Backend Configuration
Update all hardcoded URLs and default fallbacks.

#### [MODIFY] [AntivirusScreen.tsx](file:///C:/Users/Admin/StudioProjects/Gaurd-2/src/screens/AntivirusScreen.tsx)
#### [MODIFY] [DataBreachScreen.tsx](file:///C:/Users/Admin/StudioProjects/Gaurd-2/src/screens/DataBreachScreen.tsx)
#### [MODIFY] [NetworkGuardScreen.tsx](file:///C:/Users/Admin/StudioProjects/Gaurd-2/src/screens/NetworkGuardScreen.tsx)
#### [MODIFY] [PhishingScreen.tsx](file:///C:/Users/Admin/StudioProjects/Gaurd-2/src/screens/PhishingScreen.tsx)

---

### 2. App Lock & Permissions
Fix the monitoring logic and ensure permissions are requested.

#### [MODIFY] [AppLockerPlugin.java](file:///C:/Users/Admin/StudioProjects/Gaurd-2/android/app/src/main/java/com/guard2/app/AppLockerPlugin.java)
- Improve foreground app detection for Android 10+.
- Add checks for `SYSTEM_ALERT_WINDOW` permission.

#### [MODIFY] [AppLockScreen.tsx](file:///C:/Users/Admin/StudioProjects/Gaurd-2/src/screens/AppLockScreen.tsx)
- Ensure the UI correctly triggers permission requests before starting monitoring.

---

### 3. Full Device Scan (Antivirus)
Remove demo limits and improve performance.

#### [MODIFY] [ScannerPlugin.java](file:///C:/Users/Admin/StudioProjects/Gaurd-2/android/app/src/main/java/com/guard2/app/ScannerPlugin.java)
- Remove the 100-file limit in `scanDirectory`.
- Implement a more efficient file traversal.

#### [MODIFY] [AntivirusScreen.tsx](file:///C:/Users/Admin/StudioProjects/Gaurd-2/src/screens/AntivirusScreen.tsx)
- Remove the 50-file limit in the React frontend.
- Add a "Scan Whole Device" button that explicitly requests storage permissions.

---

### 4. Cache Clearer & Accessibility Service
Implement the requested Accessibility Service.

#### [NEW] [CacheAccessibilityService.java](file:///C:/Users/Admin/StudioProjects/Gaurd-2/android/app/src/main/java/com/guard2/app/CacheAccessibilityService.java)
- Implement `AccessibilityService` to automate "Clear Cache" button clicks in system settings.

#### [MODIFY] [AndroidManifest.xml](file:///C:/Users/Admin/StudioProjects/Gaurd-2/android/app/src/main/AndroidManifest.xml)
- Declare the new `AccessibilityService`.

#### [MODIFY] [ScannerPlugin.java](file:///C:/Users/Admin/StudioProjects/Gaurd-2/android/app/src/main/java/com/guard2/app/ScannerPlugin.java)
- Add methods to check and request Accessibility Service status.

---

### 5. Thermal Cooldown & WiFi Audit
Replace placeholders with real data.

#### [MODIFY] [BatteryCoolerScreen.tsx](file:///C:/Users/Admin/StudioProjects/Gaurd-2/src/screens/BatteryCoolerScreen.tsx)
- Use `BatteryManager` to get real battery temperature instead of a simulated countdown.

#### [MODIFY] [NetworkPlugin.java](file:///C:/Users/Admin/StudioProjects/Gaurd-2/android/app/src/main/java/com/guard2/app/NetworkPlugin.java)
- Improve WiFi encryption detection using `WifiManager.getScanResults()` (if permissions allowed) or `ConnectivityManager`.

## Verification Plan

### Automated Tests
- I will verify the Java code compiles by checking for syntax errors.
- I will verify the TypeScript code matches the updated plugin signatures.

### Manual Verification
- **App Lock**: Test if launching a "locked" app triggers the PIN screen.
- **Virus Scan**: Run a full scan and verify it processes more than 100 files.
- **Cache Clearer**: Verify the app navigates to settings and requests Accessibility permission.
- **Thermal**: Verify the displayed temperature matches the device's battery temperature.
