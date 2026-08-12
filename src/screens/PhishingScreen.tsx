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

  const inspectUrlHeuristics = (targetUrl: string) => {
    const warnings: string[] = [];
    try {
      const parsed = new URL(targetUrl.startsWith('http') ? targetUrl : `http://${targetUrl}`);
      
      if (parsed.protocol === 'http:') {
        warnings.push("Unencrypted Connection: Site uses HTTP instead of HTTPS.");
      }
      
      const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
      if (ipRegex.test(parsed.hostname)) {
        warnings.push("Raw IP Hostname: Legitimate services rarely use raw IP addresses in links.");
      }

      const hostParts = parsed.hostname.split('.');
      if (hostParts.length > 3) {
        warnings.push("High Subdomain Depth: Excessive subdomains detected, common in phishing traps.");
      }

      const suspiciousKeywords = ['login', 'verify', 'update', 'secure', 'account', 'banking', 'paypal', 'apple-id', 'support-fix'];
      const matched = suspiciousKeywords.filter(k => parsed.hostname.toLowerCase().includes(k));
      if (matched.length > 0 && !['google.com', 'apple.com', 'paypal.com'].some(d => parsed.hostname.endsWith(d))) {
        warnings.push(`Deceptive Keyword: Domain contains security keywords (${matched.join(', ')}) on an unverified domain.`);
      }

      const suspiciousTlds = ['.zip', '.mov', '.top', '.xyz', '.work', '.click', '.gq', '.cf', '.tk'];
      if (suspiciousTlds.some(tld => parsed.hostname.endsWith(tld))) {
        warnings.push("High-Risk TLD: Domain extension frequently associated with malicious campaigns.");
      }
    } catch {
      warnings.push("Invalid URL Structure: Could not parse standard URL format.");
    }
    return warnings;
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setIsScanning(true);
    setResult('none');
    setReason('');
    
    const formattedUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
    setScannedUrl(formattedUrl);

    // 1. Run local heuristics inspection
    const heuristicWarnings = inspectUrlHeuristics(formattedUrl);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "https://gaurdshield-2.onrender.com";
      const response = await fetch(`${apiUrl}/api/phishing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formattedUrl })
      });

      if (response.ok) {
        const data = await response.json();
        if (!data.safe) {
          setResult('unsafe');
          setReason(data.threatType ? `Cloud Threat Match: ${data.threatType}` : 'Flagged as unsafe by threat intelligence database.');
          setIsScanning(false);
          setUrl('');
          return;
        }
      }
    } catch (error) {
      console.warn("Backend phishing API unavailable, utilizing heuristic inspector.", error);
    }

    if (heuristicWarnings.length > 0) {
      setResult('unsafe');
      setReason(heuristicWarnings.join(' '));
    } else {
      setResult('safe');
      setReason("Domain passed protocol checks, IP analysis, and heuristic phishing pattern filters.");
    }

    setIsScanning(false);
    setUrl('');
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
                  Analyzing Link & Heuristics...
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
              {reason}
            </p>
          </div>
        )}

        <div className="bg-cyber-navy p-5 rounded-2xl border border-gray-800">
          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
            <Shield className="text-cyber-bluePrimary" size={18} />
            Real-Time SMS & Link Inspector
          </h4>
          <p className="text-gray-400 text-sm mb-4">
            Scans links against threat feeds and pattern recognition algorithms.
          </p>
        </div>
      </div>
    </div>
  );
}

