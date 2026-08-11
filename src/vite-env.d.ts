/// <reference types="vite/client" />

interface Window {
  showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
}

declare module '@capacitor/core' {
  export interface DeviceScannerPlugin {
    requestStoragePermission(): Promise<void>;
    scanAllFiles(): Promise<{ files: string[] }>;
    getJunkSize(): Promise<{ sizeBytes: number; sizeMB: number }>;
    cleanJunk(): Promise<void>;
  }

  export interface AppLockerPlugin {
    requestUsagePermission(): Promise<void>;
    setLockedApps(options: { apps: string[] }): Promise<void>;
    startMonitoring(): Promise<void>;
    stopMonitoring(): Promise<void>;
  }

  export interface NetworkAuditPlugin {
    performAudit(): Promise<{ encryption: string; dnsSecure: boolean; portsSecure: boolean }>;
  }
}
