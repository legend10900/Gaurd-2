import { useState, useEffect } from 'react';
import { Wifi, ShieldAlert, ShieldCheck, Activity } from 'lucide-react';
import CyberHeader from '../components/CyberHeader';
import { Screen } from '../App';

interface NetworkScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function NetworkScreen({ onNavigate }: NetworkScreenProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [isSecure, setIsSecure] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsScanning(false);
      // Simulate checking if network is secure (e.g. HTTPS, encrypted Wi-Fi)
      setIsSecure(Math.random() > 0.3); // 70% chance it's "secure" for demo
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col p-4 md:p-6 h-screen overflow-y-auto pb-24">
      <CyberHeader 
        title="Wi-Fi & Network Guard" 
        subtitle="NETWORK AUDIT & ARP SPOOFING DEFENSE" 
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
               <p className="text-gray-400 font-mono text-xs">Checking DNSSEC validity...</p>
               <p className="text-gray-400 font-mono text-xs">Scanning for ARP Poisoning...</p>
               <p className="text-gray-400 font-mono text-xs">Verifying SSL/TLS Interception...</p>
            </div>
          </div>
        ) : (
          <div className="text-center w-full">
            <h3 className={`text-xl font-bold mb-4 ${isSecure ? 'text-cyber-green' : 'text-cyber-red'}`}>
              {isSecure ? 'Network is Secure' : 'Insecure Network Detected'}
            </h3>
            
            <div className={`p-4 rounded-xl border flex flex-col gap-2 ${isSecure ? 'border-cyber-green bg-cyber-green/10' : 'border-cyber-red bg-cyber-red/10'}`}>
               <div className="flex justify-between items-center">
                  <span className="text-gray-300">Connection Encryption</span>
                  {isSecure ? <ShieldCheck className="text-cyber-green"/> : <ShieldAlert className="text-cyber-red"/>}
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-gray-300">ARP Integrity</span>
                  {isSecure ? <ShieldCheck className="text-cyber-green"/> : <ShieldAlert className="text-cyber-red"/>}
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-gray-300">DNS Tunneling</span>
                  <ShieldCheck className="text-cyber-green"/>
               </div>
            </div>
            
            {!isSecure && (
              <p className="text-cyber-yellow mt-4 text-sm font-bold bg-cyber-yellow/20 p-2 rounded">
                Warning: Avoid accessing banking apps or sending sensitive data on this network.
              </p>
            )}
            
            <button onClick={() => {setIsScanning(true); setIsSecure(false);}} className="mt-6 w-full bg-cyber-bluePrimary hover:bg-blue-600 text-white font-bold py-3 rounded-lg">
              Rescan Network
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
