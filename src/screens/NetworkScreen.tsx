import { useState, useEffect } from 'react';
import { Wifi, ShieldAlert, ShieldCheck, Activity, Globe, Server, Lock } from 'lucide-react';
import CyberHeader from '../components/CyberHeader';
import { Screen } from '../App';

interface NetworkScreenProps {
  onNavigate: (screen: Screen) => void;
}

interface AuditResult {
  connectionType: string;
  effectiveType: string;
  isHttps: boolean;
  publicIp: string | null;
  dnsResolves: boolean | null;
  latencyMs: number | null;
  webrtcLeak: boolean | null;
  localIps: string[];
  online: boolean;
}

export default function NetworkScreen({ onNavigate }: NetworkScreenProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [result, setResult] = useState<AuditResult | null>(null);

  useEffect(() => {
    runAudit();
  }, []);

  const checkWebRtcLeak = async (): Promise<{ leaked: boolean; ips: string[] }> => {
    try {
      const ips = new Set<string>();
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel('leak-probe');
      await pc.createOffer().then(offer => pc.setLocalDescription(offer));
      const result = await new Promise<{ leaked: boolean; ips: string[] }>((resolve) => {
        const timeout = setTimeout(() => resolve({ leaked: false, ips: [...ips] }), 4000);
        pc.onicecandidate = (event) => {
          if (!event.candidate) {
            clearTimeout(timeout);
            pc.close();
            resolve({ leaked: ips.size > 0, ips: [...ips] });
            return;
          }
          const match = /([0-9]{1,3}(\.[0-9]{1,3}){3})/.exec(event.candidate.candidate || '');
          if (match && !match[1].startsWith('192.168.') && !match[1].startsWith('10.') && !match[1].startsWith('172.')) {
            ips.add(match[1]);
          }
        };
      });
      pc.close();
      return result;
    } catch (e) {
      console.warn("WebRTC leak check not available:", e);
      return { leaked: false, ips: [] };
    }
  };

  const runAudit = async () => {
    setIsScanning(true);

    const audit: AuditResult = {
      connectionType: 'unknown',
      effectiveType: '4g',
      isHttps: window.location.protocol === 'https:',
      publicIp: null,
      dnsResolves: null,
      latencyMs: null,
      webrtcLeak: null,
      localIps: [],
      online: navigator.onLine,
    };

    try {
      const navConn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (navConn) {
        audit.connectionType = navConn.type || (navConn.effectiveType ? 'wifi' : 'unknown');
        audit.effectiveType = navConn.effectiveType || '4g';
      }

      const ipPromise = fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(8000) })
        .then(r => r.ok ? r.json() : null)
        .then(d => d?.ip || null)
        .catch(() => null);

      const dnsPromise = fetch('https://dns.google/resolve?name=example.com&type=A', { signal: AbortSignal.timeout(8000) })
        .then(r => r.ok ? r.json() : null)
        .then(d => !!d && Array.isArray(d.Answer) && d.Answer.length > 0)
        .catch(() => null);

      const latencyStart = performance.now();
      const apiUrl = import.meta.env.VITE_API_URL || "https://gaurdshield-2.onrender.com";
      await fetch(`${apiUrl}/health`, { signal: AbortSignal.timeout(10000) })
        .then(() => { audit.latencyMs = Math.round(performance.now() - latencyStart); })
        .catch(() => { audit.latencyMs = null; });

      const [ip, dnsOk, webrtc] = await Promise.all([ipPromise, dnsPromise, checkWebRtcLeak()]);
      audit.publicIp = ip;
      audit.dnsResolves = dnsOk;
      audit.webrtcLeak = webrtc.leaked;
      audit.localIps = webrtc.ips;
    } catch (e) {
      console.warn("Network audit partial failure:", e);
    }

    setResult(audit);
    setIsScanning(false);
  };

  const isSecure = result
    ? result.online && result.isHttps && result.dnsResolves !== false && result.webrtcLeak !== true
    : false;

  return (
    <div className="flex flex-col p-4 md:p-6 h-screen overflow-y-auto pb-24">
      <CyberHeader 
        title="Wi-Fi & Network Guard" 
        subtitle="NETWORK AUDIT & LEAK DETECTION" 
        onBack={() => onNavigate('dashboard')}
      />
      <div className="mt-6 bg-cyber-darkCard rounded-3xl p-6 md:p-8 border border-cyber-green/50 shadow-lg flex flex-col items-center">
        
        <div className="relative mb-6">
           <Wifi size={64} className={`${isScanning ? 'text-cyber-bluePrimary animate-pulse' : (isSecure ? 'text-cyber-green' : 'text-cyber-red')}`} />
           {isScanning && <Activity className="absolute -bottom-2 -right-2 text-cyber-cyanAccent animate-spin" size={24}/>}
        </div>

        {isScanning ? (
          <div className="text-center w-full">
            <h3 className="text-white text-xl font-bold mb-2">Auditing Network...</h3>
            <div className="space-y-2 text-left bg-cyber-navy p-4 rounded border border-gray-800">
               <p className="text-gray-400 font-mono text-xs">Resolving public IP address...</p>
               <p className="text-gray-400 font-mono text-xs">Verifying DNS resolution (DoH)...</p>
               <p className="text-gray-400 font-mono text-xs">Probing WebRTC IP leaks...</p>
               <p className="text-gray-400 font-mono text-xs">Measuring cloud engine latency...</p>
            </div>
          </div>
        ) : result ? (
          <div className="text-center w-full">
            <h3 className={`text-xl font-bold mb-2 ${isSecure ? 'text-cyber-green' : 'text-cyber-red'}`}>
              {isSecure ? 'Network is Secure' : 'Attention Required'}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Connection: {result.connectionType.toUpperCase()} • {result.effectiveType.toUpperCase()}
            </p>
            
            <div className={`p-4 rounded-xl border flex flex-col gap-2 text-left ${isSecure ? 'border-cyber-green bg-cyber-green/10' : 'border-cyber-red bg-cyber-red/10'}`}>
               <div className="flex justify-between items-center">
                  <span className="text-gray-300 flex items-center gap-2"><Lock size={14}/> Transport Encryption</span>
                  {result.isHttps ? <ShieldCheck className="text-cyber-green"/> : <ShieldAlert className="text-cyber-red"/>}
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-gray-300 flex items-center gap-2"><Globe size={14}/> Public IP Detected</span>
                  {result.publicIp ? <ShieldCheck className="text-cyber-green"/> : <ShieldAlert className="text-cyber-red"/>}
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-gray-300 flex items-center gap-2"><Server size={14}/> DNS Resolution</span>
                  {result.dnsResolves === false ? <ShieldAlert className="text-cyber-red"/> : <ShieldCheck className="text-cyber-green"/>}
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-gray-300 flex items-center gap-2"><Activity size={14}/> WebRTC IP Leak</span>
                  {result.webrtcLeak ? <ShieldAlert className="text-cyber-red"/> : <ShieldCheck className="text-cyber-green"/>}
               </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
              <div className="bg-cyber-navy rounded-lg p-3 border border-gray-800">
                <p className="text-gray-500 text-[10px] uppercase font-mono">Public IP</p>
                <p className="text-cyber-cyanAccent font-mono text-sm truncate">{result.publicIp || 'Unavailable'}</p>
              </div>
              <div className="bg-cyber-navy rounded-lg p-3 border border-gray-800">
                <p className="text-gray-500 text-[10px] uppercase font-mono">Engine Latency</p>
                <p className="text-cyber-cyanAccent font-mono text-sm">{result.latencyMs !== null ? `${result.latencyMs} ms` : 'Unavailable'}</p>
              </div>
              <div className="bg-cyber-navy rounded-lg p-3 border border-gray-800">
                <p className="text-gray-500 text-[10px] uppercase font-mono">Network State</p>
                <p className="text-cyber-cyanAccent font-mono text-sm">{result.online ? 'Online' : 'Offline'}</p>
              </div>
            </div>

            {result.localIps.length > 0 && (
              <p className="text-cyber-yellow mt-3 text-xs font-mono bg-cyber-yellow/10 border border-cyber-yellow/30 p-2 rounded break-all">
                Leaked local IPs: {result.localIps.join(', ')}
              </p>
            )}
            
            {!isSecure && (
              <p className="text-cyber-yellow mt-4 text-sm font-bold bg-cyber-yellow/20 p-2 rounded">
                Warning: Avoid accessing banking apps or sending sensitive data while on this network.
              </p>
            )}
            
            <button onClick={runAudit} className="mt-6 w-full bg-cyber-bluePrimary hover:bg-blue-600 text-white font-bold py-3 rounded-lg">
              Rescan Network
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}