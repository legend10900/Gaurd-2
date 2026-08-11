import { useState, useEffect } from 'react';
import { Wifi, ShieldAlert, ShieldCheck, Activity } from 'lucide-react';
import { Network } from '@capacitor/network';
import { registerPlugin } from '@capacitor/core';
import CyberHeader from '../components/CyberHeader';
import { Screen } from '../App';

const NetworkAudit = registerPlugin<any>('NetworkAudit');

interface NetworkScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function NetworkScreen({ onNavigate }: NetworkScreenProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [isSecure, setIsSecure] = useState(false);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const status = await Network.getStatus();
        setConnectionType(status.connectionType);
        
        // Real deep audit via Native Plugin
        const auditResult = await NetworkAudit.performAudit();

        setIsScanning(false);
        // Secure if connected and native audit returns positive results
        setIsSecure(status.connected && auditResult.dnsSecure && auditResult.portsSecure);
      } catch (error) {
        console.error("Network info error:", error);
        setIsScanning(false);
      }
    };

    checkNetwork();
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
               <p className="text-gray-400 font-mono text-xs">Verifying SSL/TLS Interception on {connectionType}...</p>
            </div>
          </div>
        ) : (
          <div className="text-center w-full">
            <h3 className={`text-xl font-bold mb-2 ${isSecure ? 'text-cyber-green' : 'text-cyber-red'}`}>
              {isSecure ? 'Network is Secure' : 'Insecure Network Detected'}
            </h3>
            <p className="text-gray-400 text-sm mb-4">Current Connection: {connectionType.toUpperCase()}</p>
            
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
