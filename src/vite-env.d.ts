/// <reference types="vite/client" />

interface Window {
  showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
}

declare module '@capacitor/core' {
  export interface DeviceScannerPlugin {
    requestStoragePermission(): Promise<void>;
    scanAllFiles(): Promise<{ files: string[] }>;
  }

  export interface AppLockerPlugin {
    requestUsagePermission(): Promise<void>;
    startMonitoring(): Promise<void>;
    stopMonitoring(): Promise<void>;
  }
}
