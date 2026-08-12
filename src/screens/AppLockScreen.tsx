import { useState } from 'react';
import { Lock, Search, ShieldAlert, ShieldCheck, Info } from 'lucide-react';
import { registerPlugin } from '@capacitor/core';
import CyberHeader from '../components/CyberHeader';
import { Screen } from '../App';

const AppLocker = registerPlugin<any>('AppLocker');

interface AppLockScreenProps {
  onNavigate: (screen: Screen) => void;
}

const initialApps = [
  { id: '1', name: 'WhatsApp', icon: 'W', locked: true, risk: 'high' },
  { id: '2', name: 'Gallery', icon: 'G', locked: true, risk: 'high' },
  { id: '3', name: 'Banking', icon: 'B', locked: true, risk: 'critical' },
  { id: '4', name: 'Settings', icon: 'S', locked: false, risk: 'medium' },
  { id: '5', name: 'Email', icon: 'E', locked: false, risk: 'high' },
  { id: '6', name: 'Browser', icon: 'O', locked: false, risk: 'medium' },
];

export default function AppLockScreen({ onNavigate }: AppLockScreenProps) {
  const [appList, setAppList] = useState(initialApps);
  const [searchTerm, setSearchTerm] = useState('');
  const [isServiceRunning, setIsServiceRunning] = useState(false);
  const [permissions, setPermissions] = useState({ usage: false, overlay: false });

  useEffect(() => {
    checkPermissions();
    // Check again when window gains focus (user returns from settings)
    const handleFocus = () => checkPermissions();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const checkPermissions = async () => {
    try {
      const status = await AppLocker.checkPermissions();
      setPermissions(status);
      return status;
    } catch (e) {
      console.warn("Native check failed - Browser mode detected.", e);
      return { usage: false, overlay: false };
    }
  };

  const toggleLock = (id: string) => {
    const newList = appList.map(app =>
      app.id === id ? { ...app, locked: !app.locked } : app
    );
    setAppList(newList);

    // Sync with native plugin
    const lockedPackageNames = newList
      .filter(a => a.locked)
      .map(a => {
        // Map friendly names to actual package names for testing
        // In a real app, we'd list actual installed packages
        if (a.name === 'WhatsApp') return 'com.whatsapp';
        if (a.name === 'Gallery') return 'com.android.gallery3d';
        if (a.name === 'Banking') return 'com.bank.app';
        if (a.name === 'Settings') return 'com.android.settings';
        return `com.example.${a.name.toLowerCase()}`;
      });

    AppLocker.setLockedApps({ apps: lockedPackageNames }).catch(console.error);
  };

  const toggleNativeService = async () => {
    try {
      if (!isServiceRunning) {
        const status = await checkPermissions();
        if (!status.usage) {
          await AppLocker.requestUsagePermission();
          return;
        }
        if (!status.overlay) {
          await AppLocker.requestOverlayPermission();
          return;
        }

        // Sync locked apps before starting
        const lockedPackageNames = appList
          .filter(a => a.locked)
          .map(a => {
            if (a.name === 'WhatsApp') return 'com.whatsapp';
            if (a.name === 'Gallery') return 'com.android.gallery3d';
            if (a.name === 'Banking') return 'com.bank.app';
            if (a.name === 'Settings') return 'com.android.settings';
            return `com.example.${a.name.toLowerCase()}`;
          });
        await AppLocker.setLockedApps({ apps: lockedPackageNames });

        await AppLocker.startMonitoring();
        setIsServiceRunning(true);
      } else {
        await AppLocker.stopMonitoring();
        setIsServiceRunning(false);
      }
    } catch (e) {
      console.warn("Native AppLocker system service is only available when compiled in an Android APK container.", e);
      setIsServiceRunning(!isServiceRunning);
    }
  };

  const filteredApps = appList.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col p-4 md:p-6 h-screen overflow-y-auto pb-24">
      <CyberHeader 
        title="App Lock Guard" 
        subtitle="SENSITIVE APPLICATION PROTECTION" 
        onBack={() => onNavigate('dashboard')} 
      />

      <div className="mt-6 flex flex-col gap-6">
        <div className="bg-cyber-darkCard rounded-3xl p-6 border border-cyber-bluePrimary/30 shadow-lg text-center">
          <div className="w-16 h-16 bg-cyber-bluePrimary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyber-bluePrimary/50">
            <Lock className="text-cyber-bluePrimary" size={32} />
          </div>
          <h3 className="text-white font-bold text-xl">App Locking & Security Vault</h3>
          <p className="text-gray-400 text-sm mt-2 mb-4">
            {appList.filter(a => a.locked).length} apps marked for PIN protection.
          </p>

          <div className="bg-cyber-navy border border-gray-800 rounded-xl p-4 mb-4 text-left">
            <div className="flex items-center gap-2 text-cyber-yellow font-semibold text-sm mb-1">
              <Info size={16} /> Web vs Native Android Security
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              Standard web browsers cannot draw overlay pin screens over third-party system apps due to browser sandbox rules. Full system App Lock requires compiling the app into an Android APK with Accessibility/Usage Access permissions.
            </p>
          </div>

          <button 
            onClick={toggleNativeService}
            className={`w-full py-3 rounded-lg font-bold transition-colors ${isServiceRunning ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red/50 hover:bg-cyber-red/30' : 'bg-cyber-bluePrimary hover:bg-blue-600 text-white'}`}
          >
            {isServiceRunning ? 'Disable Overlay Protection' :
             !permissions.usage ? 'Grant Usage Access' :
             !permissions.overlay ? 'Grant Overlay Access' :
             'Enable Native Overlay Service'}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-500" size={18} />
          </div>
          <input
            type="text"
            placeholder="Search apps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-cyber-navy border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyanAccent focus:ring-1 focus:ring-cyber-cyanAccent transition-all"
          />
        </div>

        <div className="flex flex-col gap-3">
          {filteredApps.map(app => (
            <div key={app.id} className="bg-cyber-navy border border-gray-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${
                  app.locked ? 'bg-cyber-bluePrimary/20 text-cyber-bluePrimary' : 'bg-gray-800 text-gray-400'
                }`}>
                  {app.icon}
                </div>
                <div>
                  <h4 className="text-white font-bold">{app.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">Risk level:</span>
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                      app.risk === 'critical' ? 'bg-cyber-red/20 text-cyber-red' :
                      app.risk === 'high' ? 'bg-cyber-yellow/20 text-cyber-yellow' :
                      'bg-cyber-green/20 text-cyber-green'
                    }`}>
                      {app.risk}
                    </span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => toggleLock(app.id)}
                className="focus:outline-none"
              >
                {app.locked ? (
                  <ShieldCheck className="text-cyber-green" size={28} />
                ) : (
                  <ShieldAlert className="text-gray-600" size={28} />
                )}
              </button>
            </div>
          ))}
          {filteredApps.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No apps found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
