import { useState, useEffect } from 'react';
import { Trash2, HardDrive, Cpu } from 'lucide-react';
import CyberHeader from '../components/CyberHeader';
import { Screen } from '../App';

interface JunkCleanerScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function JunkCleanerScreen({ onNavigate }: JunkCleanerScreenProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [isCleaning, setIsCleaning] = useState(false);
  const [junkFound, setJunkFound] = useState(0); // in MB
  const [cleaned, setCleaned] = useState(false);

  useEffect(() => {
    if (isScanning) {
      const timer = setTimeout(() => {
        setIsScanning(false);
        setJunkFound(Math.floor(Math.random() * 800) + 400); // 400-1200MB
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isScanning]);

  const handleClean = () => {
    setIsCleaning(true);
    setTimeout(() => {
      setIsCleaning(false);
      setCleaned(true);
      setJunkFound(0);
    }, 3000);
  };

  return (
    <div className="flex flex-col p-4 md:p-6 h-screen overflow-y-auto pb-24">
      <CyberHeader 
        title="Cache & Junk Cleaner" 
        subtitle="STORAGE OPTIMIZATION ENGINE" 
        onBack={() => onNavigate('dashboard')}
      />

      <div className="mt-6 bg-cyber-darkCard rounded-3xl p-8 border border-cyber-cyanAccent/30 shadow-lg flex flex-col items-center">
        
        <div className="relative w-48 h-48 flex flex-col items-center justify-center mb-6">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#131b2b" strokeWidth="6" />
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke={cleaned ? "#00e676" : "#00ffff"} 
              strokeWidth="6"
              strokeDasharray="283"
              strokeDashoffset={isScanning ? "283" : isCleaning ? "0" : (cleaned ? "0" : "70")}
              className={`transition-all duration-1000 ${isScanning || isCleaning ? 'animate-pulse' : ''}`}
            />
          </svg>
          
          {isScanning ? (
            <div className="text-center">
              <span className="text-2xl font-mono text-cyber-cyanAccent font-bold">Scanning</span>
              <p className="text-xs text-gray-500 uppercase mt-1">Analyzing Disk</p>
            </div>
          ) : isCleaning ? (
            <div className="text-center">
              <span className="text-2xl font-mono text-cyber-cyanAccent font-bold">Cleaning</span>
              <p className="text-xs text-gray-500 uppercase mt-1">Freeing Space</p>
            </div>
          ) : cleaned ? (
            <div className="text-center">
              <span className="text-3xl font-mono text-cyber-green font-bold">Clean</span>
              <p className="text-xs text-gray-500 uppercase mt-1">Optimized</p>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-4xl font-mono text-cyber-cyanAccent font-bold">{junkFound}</span>
              <span className="text-lg font-mono text-cyber-cyanAccent ml-1">MB</span>
              <p className="text-xs text-gray-500 uppercase mt-1">Junk Found</p>
            </div>
          )}
        </div>

        {cleaned ? (
          <p className="text-cyber-green font-bold text-center mb-8">System Storage Successfully Optimized</p>
        ) : (
          <p className="text-gray-400 text-center text-sm mb-8">
            Removes obsolete files, temporary logs, and residual cache data.
          </p>
        )}

        <button
          onClick={handleClean}
          disabled={isScanning || isCleaning || cleaned}
          className="w-full max-w-sm flex items-center justify-center gap-2 bg-cyber-cyanAccent hover:bg-cyan-400 text-black disabled:opacity-50 disabled:cursor-not-allowed font-bold py-3 rounded-lg transition-colors"
        >
          <Trash2 size={20} />
          {cleaned ? 'Optimization Complete' : 'Deep Clean System'}
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-cyber-navy p-5 rounded-2xl border border-gray-800 flex items-center gap-4">
          <div className="p-3 bg-cyber-darkCard rounded-xl text-cyber-bluePrimary">
            <HardDrive size={24} />
          </div>
          <div>
            <h4 className="text-white font-bold">App Cache</h4>
            <p className="text-gray-400 text-xs">Temporary files created by apps.</p>
          </div>
          <div className="ml-auto text-right">
            <span className="font-mono text-white text-sm">{cleaned ? '0' : Math.floor(junkFound * 0.7)} MB</span>
          </div>
        </div>

        <div className="bg-cyber-navy p-5 rounded-2xl border border-gray-800 flex items-center gap-4">
          <div className="p-3 bg-cyber-darkCard rounded-xl text-cyber-bluePrimary">
            <Cpu size={24} />
          </div>
          <div>
            <h4 className="text-white font-bold">System Logs</h4>
            <p className="text-gray-400 text-xs">Obsolete OS diagnostic logs.</p>
          </div>
          <div className="ml-auto text-right">
            <span className="font-mono text-white text-sm">{cleaned ? '0' : Math.floor(junkFound * 0.3)} MB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
