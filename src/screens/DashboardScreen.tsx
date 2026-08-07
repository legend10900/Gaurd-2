import { useState, useEffect } from 'react';
import { 
  Shield, 
  Wifi, 
  Thermometer, 
  Trash2, 
  Lock, 
  AlertTriangle, 
  Info,
  Fish
} from 'lucide-react';
import CyberHeader from '../components/CyberHeader';
import CyberGaugeArc from '../components/CyberGaugeArc';
import CyberTerminalConsole from '../components/CyberTerminalConsole';
import CyberModuleCard from '../components/CyberModuleCard';
import { Screen } from '../App';

interface DashboardScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function DashboardScreen({ onNavigate }: DashboardScreenProps) {
  const [securityScore, setSecurityScore] = useState(85);
  const [realtimeActive, setRealtimeActive] = useState(true);
  const [logs, setLogs] = useState<string[]>([
    "System boot sequence initialized...",
    "Loading heuristic engine v2.4...",
    "Connecting to threat intel network...",
    "Real-time protection activated."
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(prev => {
        const newLogs = [...prev, `Checking background process [PID: ${Math.floor(Math.random() * 9000) + 1000}] - OK`];
        return newLogs.slice(-20);
      });
      setSecurityScore(prev => Math.min(100, Math.max(0, prev + (Math.random() * 2 - 1))));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col p-4 md:p-6 h-screen overflow-y-auto pb-24">
      <CyberHeader 
        title="GuardShield" 
        subtitle="CYBER THREAT & DEVICE PROTECTION SUITE" 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Arc Card */}
        <div className="bg-cyber-darkCard rounded-3xl p-6 border border-cyber-bluePrimary/30 shadow-lg flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-bluePrimary/10 blur-3xl rounded-full" />
          <CyberGaugeArc score={securityScore} />
          
          <div className="mt-4 text-center">
            <h3 className="text-white font-bold text-lg">Real-Time Antivirus Protection</h3>
            <p className="text-gray-400 text-xs mt-1">
              {realtimeActive 
                ? "Active • Background malware monitoring enabled" 
                : "Disabled • Enable to activate real-time guard"}
            </p>
          </div>

          <div className="mt-6 w-full bg-cyber-navy rounded-xl p-3 flex items-center justify-between border border-gray-800">
            <div className="flex items-center gap-3">
              <Shield className="text-cyber-green" size={20} />
              <span className="text-white font-semibold text-sm">Real-Time Guard Service</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={realtimeActive}
                onChange={(e) => setRealtimeActive(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyber-green"></div>
            </label>
          </div>
        </div>

        {/* Console & Quick actions */}
        <div className="flex flex-col gap-4">
          <CyberTerminalConsole logs={logs} />
          <div className="bg-cyber-darkCard/50 border border-cyber-yellow/30 rounded-xl p-4 flex flex-col justify-center flex-1">
            <div className="flex items-center gap-2 mb-2 text-cyber-yellow">
              <AlertTriangle size={18} />
              <span className="font-bold text-sm uppercase tracking-wide">Action Required</span>
            </div>
            <p className="text-xs text-gray-300 mb-4">
              Your system cache is growing large (1.2GB) and an app is using dangerous permissions.
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => onNavigate('junkcleaner')}
                className="flex-1 bg-cyber-cyanAccent/10 text-cyber-cyanAccent hover:bg-cyber-cyanAccent/20 border border-cyber-cyanAccent/50 py-2 rounded font-bold text-xs transition-colors"
              >
                Clean Junk
              </button>
              <button 
                onClick={() => onNavigate('unimplemented')}
                className="flex-1 bg-cyber-yellow/10 text-cyber-yellow hover:bg-cyber-yellow/20 border border-cyber-yellow/50 py-2 rounded font-bold text-xs transition-colors"
              >
                Fix Privacy
              </button>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mt-8 mb-4 uppercase tracking-wide">Security Suite Modules</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-8">
        <CyberModuleCard
          title="Virus Protection"
          subtitle="Scan apps, downloaded APKs & SHA-256 signatures"
          icon={Shield}
          badgeText="Antivirus"
          accentColor="#0066ff"
          onClick={() => onNavigate('antivirus')}
        />
        <CyberModuleCard
          title="Phishing & Link Inspector"
          subtitle="Inspect URLs & messages for scams & brand spoofing"
          icon={Fish}
          badgeText="Phishing Guard"
          accentColor="#00ffff"
          onClick={() => onNavigate('phishing')}
        />
        <CyberModuleCard
          title="Wi-Fi & Network Guard"
          subtitle="Public WAN IP, DNSSEC & MITM security check"
          icon={Wifi}
          badgeText="Network Audit"
          accentColor="#00e676"
<<<<<<< HEAD
          onClick={() => onNavigate('networkguard')}
=======
          onClick={() => onNavigate('network')}
>>>>>>> 605524d (	new file:   capacitor.config.ts#)
        />
        <CyberModuleCard
          title="Battery & Thermal Monitor"
          subtitle="36.5°C • Cool down CPU & reduce thermal load"
          icon={Thermometer}
          badgeText="Cool"
          accentColor="#00e676"
          onClick={() => onNavigate('batterycooler')}
        />
        <CyberModuleCard
          title="Cache & Junk Cleaner"
          subtitle="Scan obsolete files, temp logs & automated cache cleaning"
          icon={Trash2}
          badgeText="1204 MB Junk"
          accentColor="#00ffff"
          onClick={() => onNavigate('junkcleaner')}
        />
        <CyberModuleCard
          title="App Locker"
          subtitle="Lock sensitive apps with PIN & Biometrics"
          icon={Lock}
          badgeText="Privacy"
          accentColor="#00b3b3"
          onClick={() => onNavigate('applock')}
        />
        <CyberModuleCard
          title="Data Breach Monitor"
          subtitle="Live query across 10B+ leaked dark web records"
          icon={AlertTriangle}
          badgeText="Dark Web API"
          accentColor="#ff1744"
          onClick={() => onNavigate('databreach')}
        />
        <CyberModuleCard
          title="Privacy & Compliance"
          subtitle="Manage localized policies, GDPR/CCPA rights"
          icon={Info}
          badgeText="Global Rights"
          accentColor="#00ffff"
          onClick={() => onNavigate('unimplemented')}
        />
      </div>
    </div>
  );
}
