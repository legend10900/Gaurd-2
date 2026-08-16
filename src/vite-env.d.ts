/// <reference types="vite/client" />

interface Window {
  showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
}

declare module '@capacitor/core' {
  export interface DeviceScannerPlugin {
    requestStoragePermission(): Promise<void>;
    scanAllFiles(): Promise<{ files: string[] }>;
    getJunkSize(): Promise<{ sizeBytes: number; sizeMB: number }>;
    getJunkApps(): Promise<{ packages: string[]; sizes: number[]; totalBytes: number }>;
    cleanJunk(): Promise<void>;
  }

  export interface NetworkAuditPlugin {
    performAudit(): Promise<{ encryption: string; dnsSecure: boolean; portsSecure: boolean }>;
  }
}
