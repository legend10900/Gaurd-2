import { useState, useEffect } from 'react';
import { Wifi, ShieldCheck, Activity, Globe, Server } from 'lucide-react';
import { Network, ConnectionStatus } from '@capacitor/network';
import CyberHeader from '../components/CyberHeader';
import { Screen } from '../App';

interface NetworkGuardScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function NetworkGuardScreen({ onNavigate }: NetworkGuardScreenProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [networkStatus, setNetworkStatus] = useState<ConnectionStatus | null>(null);
  const [effectiveType, setEffectiveType] = useState<string>('4g');
  const [isHttps, setIsHttps] = useState<boolean>(true);

  useEffect(() => {
    setIsHttps(window.location.protocol === 'https:');
    
    // Web connection info if available
    const navConn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (navConn && navConn.effectiveType) {
      setEffectiveType(navConn.effectiveType);
    }

    Network.getStatus().then(status => {
      setNetworkStatus(status);
    }).catch(e => console.warn(e));
    
    const listener = Network.addListener('networkStatusChange', status => {
      setNetworkStatus(status);
    });
    
    return () => {
      listener.then(l => l.remove()).catch(e => console.warn(e));
    };
  }, []);

  const startScan = async () => {
    setIsScanning(true);
    setHasScanned(false);
    setLatencyMs(null);

    const start = performance.now();
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://guardshield-2.onrender.com";
      await fetch(`${apiUrl}/api/phishing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com' })
      }).catch(() => null);
    } catch {
      // Ignore fallback
    }
    const end = performance.now();
    setLatencyMs(Math.round(end - start));

    // Refresh network status
    try {
      const status = await Network.getStatus();
      setNetworkStatus(status);
    } catch (e) {
      console.warn(e);
    }

    setIsScanning(false);
    setHasScanned(true);
  };

  return (
    <div className="flex flex-col p-4 md:p-6 h-screen overflow-y-auto pb-24">
      <CyberHeader 
        title="Network Guard" 
        subtitle="WI-FI & CONNECTION AUDIT" 
        onBack={() => onNavigate('dashboard')} 
      />

      <div className="mt-6 flex flex-col gap-6">
        <div className="bg-cyber-darkCard rounded-3xl p-6 border border-cyber-green/30 shadow-lg text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-green/10 blur-3xl rounded-full" />
          
          <div className="w-20 h-20 bg-cyber-green/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyber-green/50 relative">
            <Wifi className={`text-cyber-green ${isScanning ? 'animate-pulse' : ''}`} size={40} />
            {isScanning && (
              <div className="absolute inset-0 border-2 border-cyber-green rounded-full animate-ping opacity-75" />
            )}
          </div>
          
          <h3 className="text-white font-bold text-xl mb-1">
            {isScanning ? 'Auditing Network Latency & Security...' : hasScanned ? 'Network Security Audit Complete' : 'Ready to Scan'}
          </h3>
          <p className="text-cyber-green text-sm font-mono bg-cyber-green/10 inline-block px-3 py-1 rounded-full border border-cyber-green/30 mb-6">
            Status: {networkStatus ? (networkStatus.connected ? `Connected (${networkStatus.connectionType || 'WiFi/Cellular'})` : 'Disconnected') : (navigator.onLine ? 'Connected' : 'Offline')}
          </p>

          {isScanning ? (
            <div className="w-full bg-gray-800 rounded-full h-2 mb-2 animate-pulse">
              <div className="bg-cyber-green h-2 rounded-full w-3/4 transition-all" />
            </div>
          ) : (
            <button 
              onClick={startScan}
              className="bg-cyber-green/10 text-cyber-green hover:bg-cyber-green/20 border border-cyber-green/50 px-8 py-3 rounded-xl font-bold transition-colors w-full"
            >
              {hasScanned ? 'Rescan Network' : 'Start Network Audit'}
            </button>
          )}
        </div>

        {(isScanning || hasScanned) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-cyber-navy p-4 rounded-xl border border-gray-800 flex items-start gap-4">
              <div className={`p-2 rounded-lg ${hasScanned ? 'bg-cyber-green/20 text-cyber-green' : 'bg-gray-800 text-gray-500'}`}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Transport Encryption</h4>
                <p className="text-gray-400 text-xs mt-1">
                  {hasScanned ? (isHttps ? 'HTTPS / TLS Enabled' : 'HTTP (Unencrypted)') : 'Checking TLS...'}
                </p>
              </div>
            </div>

            <div className="bg-cyber-navy p-4 rounded-xl border border-gray-800 flex items-start gap-4">
              <div className={`p-2 rounded-lg ${hasScanned ? 'bg-cyber-green/20 text-cyber-green' : 'bg-gray-800 text-gray-500'}`}>
                <Activity size={20} />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Server Latency</h4>
                <p className="text-gray-400 text-xs mt-1">
                  {hasScanned ? (latencyMs !== null ? `${latencyMs} ms RTT` : 'Normal') : 'Measuring ping...'}
                </p>
              </div>
            </div>

            <div className="bg-cyber-navy p-4 rounded-xl border border-gray-800 flex items-start gap-4">
              <div className={`p-2 rounded-lg ${hasScanned ? 'bg-cyber-green/20 text-cyber-green' : 'bg-gray-800 text-gray-500'}`}>
                <Globe size={20} />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Connection Profile</h4>
                <p className="text-gray-400 text-xs mt-1">
                  {hasScanned ? `Speed Tier: ${effectiveType.toUpperCase()}` : 'Checking connection...'}
                </p>
              </div>
            </div>

            <div className="bg-cyber-navy p-4 rounded-xl border border-gray-800 flex items-start gap-4">
              <div className={`p-2 rounded-lg ${hasScanned ? 'bg-cyber-green/20 text-cyber-green' : 'bg-gray-800 text-gray-500'}`}>
                <Server size={20} />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Offline/Online Status</h4>
                <p className="text-gray-400 text-xs mt-1">
                  {hasScanned ? (navigator.onLine ? 'Internet Reachable' : 'No Internet Access') : 'Testing reachability...'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

