import { useState } from 'react';
import { Fish, Shield, AlertTriangle, ShieldCheck, Search } from 'lucide-react';
import CyberHeader from '../components/CyberHeader';
import { Screen } from '../App';

interface PhishingScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function PhishingScreen({ onNavigate }: PhishingScreenProps) {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<'none' | 'safe' | 'unsafe'>('none');
  const [scannedUrl, setScannedUrl] = useState('');

  const [reason, setReason] = useState('');

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setIsScanning(true);
    setResult('none');
    setReason('');
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://gaurdshield-2.onrender.com";
      const response = await fetch(`${apiUrl}/api/phishing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url })
      });
      
      const data = await response.json();
      setScannedUrl(data.url);
      setResult(data.phishing ? 'unsafe' : 'safe');
      setReason(data.reason || '');
    } catch (error) {
      console.error("Phishing scan failed", error);
      setResult('unsafe');
      setReason("Failed to contact security servers. Proceed with extreme caution.");
    } finally {
      setIsScanning(false);
      setUrl('');
    }
  };

  return (
    <div className="flex flex-col p-4 md:p-6 h-screen overflow-y-auto pb-24">
      <CyberHeader 
        title="Phishing Guard" 
        subtitle="INSPECT URLS & WEBSITES" 
        onBack={() => onNavigate('dashboard')} 
      />

      <div className="mt-6 flex flex-col gap-6">
        <div className="bg-cyber-darkCard rounded-3xl p-6 border border-cyber-cyanAccent/30 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-cyanAccent/10 blur-3xl rounded-full" />
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-cyber-cyanAccent/20 rounded-xl flex items-center justify-center border border-cyber-cyanAccent/50">
              <Fish className="text-cyber-cyanAccent" size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">URL Inspector</h3>
              <p className="text-gray-400 text-sm">Check links before opening them</p>
            </div>
          </div>

          <form onSubmit={handleScan} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-cyber-navy border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyanAccent transition-all"
            />
            <button
              type="submit"
              disabled={!url || isScanning}
              className="w-full bg-cyber-cyanAccent/10 text-cyber-cyanAccent hover:bg-cyber-cyanAccent/20 border border-cyber-cyanAccent/50 py-3 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isScanning ? (
                <>
                  <div className="w-5 h-5 border-2 border-cyber-cyanAccent border-t-transparent rounded-full animate-spin" />
                  Scanning URL...
                </>
              ) : (
                <>
                  <Search size={18} />
                  Analyze Link
                </>
              )}
            </button>
          </form>
        </div>

        {result !== 'none' && (
          <div className={`rounded-3xl p-6 border shadow-lg ${
            result === 'safe' 
              ? 'bg-cyber-green/5 border-cyber-green/30' 
              : 'bg-cyber-red/5 border-cyber-red/30'
          }`}>
            <div className="flex items-center gap-4 mb-4">
              {result === 'safe' ? (
                <div className="w-12 h-12 bg-cyber-green/20 rounded-full flex items-center justify-center border border-cyber-green/50 shrink-0">
                  <ShieldCheck className="text-cyber-green" size={24} />
                </div>
              ) : (
                <div className="w-12 h-12 bg-cyber-red/20 rounded-full flex items-center justify-center border border-cyber-red/50 shrink-0 animate-pulse">
                  <AlertTriangle className="text-cyber-red" size={24} />
                </div>
              )}
              <div className="break-all">
                <h3 className={`font-bold text-lg ${result === 'safe' ? 'text-cyber-green' : 'text-cyber-red'}`}>
                  {result === 'safe' ? 'Safe Website' : 'Phishing Threat Detected!'}
                </h3>
                <p className="text-gray-300 text-sm mt-1">{scannedUrl}</p>
              </div>
            </div>
            
            <p className="text-gray-400 text-sm">
              {result === 'safe' 
                ? (reason || 'No threats were found on this domain. It appears safe to visit, but always remain vigilant and check the address bar for HTTPS.')
                : (reason || 'This website has been flagged as a deceptive site designed to steal your information. Do not enter passwords or personal data.')}
            </p>
          </div>
        )}

        <div className="bg-cyber-navy p-5 rounded-2xl border border-gray-800">
          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
            <Shield className="text-cyber-bluePrimary" size={18} />
            Real-Time SMS & Chat Guard
          </h4>
          <p className="text-gray-400 text-sm mb-4">
            Automatically scans links received in SMS, WhatsApp, and Telegram for phishing attempts.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-300">Background Scanner</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyber-cyanAccent"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
