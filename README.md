# GuardShield Security

A comprehensive cyber threat and device protection suite, rewritten from Android to a modern React web application.

## Features

- **Cyber Dashboard**: Centralized hub with real-time security score and live module status.
- **Antivirus Shield**: Integrated with **VirusTotal API** for real-time SHA-256 heuristic scanning and threat intelligence.
- **Data Breach Monitor**: Real-time lookup of email exposures using the **XposedOrNot API**.
- **Phishing Link Inspector**: URL analysis and safety verification powered by **Google Safe Browsing**.
- **Network Guard**: Audit Wi-Fi security, encryption levels, and scan for ARP spoofing or DNS hijacking.
- **Cache & Junk Cleaner**: Deep system analysis and optimization flow to free up storage.
- **Battery & Thermal Monitor**: Real-time battery health monitoring and CPU thermal regulation simulation.
- **App Lock**: Privacy protection module for securing sensitive applications.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, TypeScript
- **Backend**: Express, Multer, Node.js (Vite Middleware)
- **APIs**: VirusTotal, Google Safe Browsing, XposedOrNot
- **Mobile**: Capacitor 8 (Cross-platform support)
- **Icons**: Lucide React

## Getting Started

To run the application locally:

```bash
npm install
npm run dev
```

The server will be running at [http://localhost:3000](http://localhost:3000).
