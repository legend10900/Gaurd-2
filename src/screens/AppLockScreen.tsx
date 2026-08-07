import { useState } from 'react';
import { Lock, Search, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import CyberHeader from '../components/CyberHeader';
import { Screen } from '../App';

interface AppLockScreenProps {
  onNavigate: (screen: Screen) => void;
}

const apps = [
  { id: '1', name: 'WhatsApp', icon: 'W', locked: true, risk: 'high' },
  { id: '2', name: 'Gallery', icon: 'G', locked: true, risk: 'high' },
  { id: '3', name: 'Banking', icon: 'B', locked: true, risk: 'critical' },
  { id: '4', name: 'Settings', icon: 'S', locked: false, risk: 'medium' },
  { id: '5', name: 'Email', icon: 'E', locked: false, risk: 'high' },
  { id: '6', name: 'Browser', icon: 'O', locked: false, risk: 'medium' },
];

export default function AppLockScreen({ onNavigate }: AppLockScreenProps) {
  const [appList, setAppList] = useState(apps);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleLock = (id: string) => {
    setAppList(prev => prev.map(app => 
      app.id === id ? { ...app, locked: !app.locked } : app
    ));
  };

  const filteredApps = appList.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col p-4 md:p-6 h-screen overflow-y-auto pb-24">
      <CyberHeader 
        title="App Lock" 
        subtitle="SECURE SENSITIVE APPLICATIONS" 
        onBack={() => onNavigate('dashboard')} 
      />

      <div className="mt-6 flex flex-col gap-6">
        <div className="bg-cyber-darkCard rounded-3xl p-6 border border-cyber-bluePrimary/30 shadow-lg text-center">
          <div className="w-16 h-16 bg-cyber-bluePrimary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyber-bluePrimary/50">
            <Lock className="text-cyber-bluePrimary" size={32} />
          </div>
          <h3 className="text-white font-bold text-xl">Privacy Protection Active</h3>
          <p className="text-gray-400 text-sm mt-2">
            {appList.filter(a => a.locked).length} apps secured with PIN/Biometrics
          </p>
          <button className="mt-4 bg-cyber-bluePrimary/10 border border-cyber-bluePrimary/50 text-cyber-bluePrimary px-6 py-2 rounded-lg font-bold text-sm hover:bg-cyber-bluePrimary/20 transition-colors">
            Change Master PIN
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-500" size={18} />
          </div>
          <input
            type="text"
            placeholder="Search installed apps..."
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
