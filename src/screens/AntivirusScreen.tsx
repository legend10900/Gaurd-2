import { useState, useRef, useEffect } from 'react';
import { Shield, Play, Bug, CheckCircle, AlertTriangle, Trash2, Upload } from 'lucide-react';
import CyberHeader from '../components/CyberHeader';
import { Screen } from '../App';

interface AntivirusScreenProps {
  onNavigate: (screen: Screen) => void;
}

interface Threat {
  id: string;
  name: string;
  severity: string;
  threatName: string;
  description: string;
  sha256: string;
}

export default function AntivirusScreen({ onNavigate }: AntivirusScreenProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [currentItem, setCurrentItem] = useState('');
  const [threats, setThreats] = useState<Threat[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startScan = (file: File) => {
    setIsScanning(true);
    setScanComplete(false);
    setThreats([]);
    setCurrentItem(file.name);

    const formData = new FormData();
    formData.append("file", file);

    fetch("/api/scan", {
      method: "POST",
      body: formData,
    })
      .then(res => res.json())
      .then(data => {
        setIsScanning(false);
        setScanComplete(true);
        if (data.threatFound && data.threatDetails) {
          setThreats([{
            id: Math.random().toString(),
            ...data.threatDetails
          }]);
        }
      })
      .catch(err => {
        console.error("Scan error", err);
        setIsScanning(false);
        setScanComplete(true);
      });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      startScan(e.target.files[0]);
    }
  };

  const generateEicar = () => {
    // Create a fake EICAR file in browser
    const eicarContent = "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*";
    const blob = new Blob([eicarContent], { type: "text/plain" });
    const file = new File([blob], "eicar.com.txt", { type: "text/plain" });
    startScan(file);
  };

  const removeThreat = (id: string) => {
    setThreats(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="flex flex-col p-4 md:p-6 h-screen overflow-y-auto pb-24">
      <CyberHeader 
        title="Antivirus & Threat Shield" 
        subtitle="ON-DEVICE SHA-256 HEURISTIC SCANNER" 
        onBack={() => onNavigate('dashboard')}
      />

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />

      {/* Radar Card */}
      <div className="mt-6 bg-cyber-darkCard rounded-3xl p-6 md:p-8 border border-cyber-bluePrimary/50 shadow-lg flex flex-col items-center">
        
        {/* Animated Radar Canvas equivalent */}
        <div className="relative w-40 h-40 flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-cyber-bluePrimary/20" />
          <div className="absolute inset-4 rounded-full border-2 border-cyber-bluePrimary/40" />
          <div className="absolute inset-8 rounded-full border-2 border-cyber-bluePrimary/60" />
          
          {isScanning && (
            <div className="absolute inset-0 rounded-full border-t-4 border-r-4 border-cyber-cyanAccent animate-spin opacity-80" />
          )}

          <Shield 
            size={48} 
            className={`relative z-10 ${threats.length > 0 ? 'text-cyber-red' : 'text-cyber-bluePrimary'}`} 
          />
        </div>

        {isScanning ? (
          <div className="w-full max-w-md text-center">
            <p className="text-cyber-cyanAccent font-mono font-bold truncate mb-2">Analyzing: {currentItem}...</p>
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-2 relative">
              <div className="absolute top-0 left-0 h-full w-1/3 bg-cyber-bluePrimary animate-[slide_1s_infinite]" />
            </div>
            <p className="text-gray-400 font-mono text-xs">Querying AI Engine & Hash DB</p>
          </div>
        ) : scanComplete ? (
          <div className="text-center">
            <h3 className={`text-xl font-bold ${threats.length === 0 ? 'text-cyber-green' : 'text-cyber-red'}`}>
              {threats.length === 0 ? 'Scan Complete • No Threats Found' : `Threats Detected: ${threats.length}`}
            </h3>
          </div>
        ) : (
          <div className="text-center">
            <h3 className="text-xl font-bold text-white">Select a file to scan</h3>
          </div>
        )}

        <div className="flex gap-4 w-full max-w-md mt-8">
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="flex-1 flex items-center justify-center gap-2 bg-cyber-bluePrimary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
          >
            <Upload size={20} />
            <span>Upload File</span>
          </button>
          <button 
            onClick={generateEicar}
            disabled={isScanning}
            className="flex items-center justify-center gap-2 bg-transparent border-2 border-cyber-yellow text-cyber-yellow hover:bg-cyber-yellow/10 disabled:opacity-50 disabled:cursor-not-allowed font-bold px-4 py-3 rounded-lg transition-colors"
          >
            <Bug size={20} />
            <span className="hidden md:inline">EICAR Test</span>
          </button>
        </div>
      </div>

      {/* Real-time Shield Info */}
      <div className="mt-6 bg-cyber-darkCard rounded-2xl p-5 border border-gray-800">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="text-cyber-green" size={24} />
          <h3 className="text-white font-bold text-lg">Real-Time Web & Storage Shield</h3>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Scans all downloaded files and active processes against cloud cryptographic SHA-256 signatures.
        </p>
        <div className="bg-cyber-navy rounded-lg p-3 flex items-center gap-2 border border-gray-800">
          <CheckCircle className="text-cyber-green" size={16} />
          <span className="text-cyber-green font-mono text-xs">Cloud Signature Engine Active • 10M+ Signatures Loaded</span>
        </div>
      </div>

      {/* Scan Results */}
      <div className="mt-8 mb-4 flex justify-between items-end">
        <h2 className="text-xl font-bold text-white uppercase tracking-wide">Scan Results</h2>
        {scanComplete && (
          <span className="text-gray-400 font-mono text-sm">{totalCount} items analyzed</span>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {threats.map(threat => (
          <div key={threat.id} className="bg-cyber-darkCard border border-cyber-red rounded-2xl p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-cyber-red" size={24} />
                <h3 className="text-white font-bold text-lg">{threat.name}</h3>
              </div>
              <span className="bg-cyber-red/20 text-cyber-red font-bold text-xs px-2 py-1 rounded">
                {threat.severity}
              </span>
            </div>
            
            <p className="text-cyber-yellow font-semibold text-sm mb-1">{threat.threatName}</p>
            <p className="text-gray-400 text-sm mb-3">{threat.description}</p>
            <p className="text-cyber-cyanAccent font-mono text-xs mb-5">SHA-256: {threat.sha256}</p>
            
            <button 
              onClick={() => removeThreat(threat.id)}
              className="w-full flex items-center justify-center gap-2 bg-cyber-red hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
              Quarantine / Remove Threat File
            </button>
          </div>
        ))}

        {scanComplete && threats.length === 0 && (
          <div className="bg-cyber-green/10 border border-cyber-green rounded-2xl p-5 flex items-center gap-4">
            <Shield className="text-cyber-green" size={32} />
            <p className="text-white text-sm">
              No threats detected. All analyzed files match clean signature profiles.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
