import { useState, useEffect } from 'react';
import { Trash2, HardDrive, Cpu, CheckCircle, Info } from 'lucide-react';
import CyberHeader from '../components/CyberHeader';
import { Screen } from '../App';

interface JunkCleanerScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function JunkCleanerScreen({ onNavigate }: JunkCleanerScreenProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [isCleaning, setIsCleaning] = useState(false);
  const [usedBytes, setUsedBytes] = useState<number>(0);
  const [quotaBytes, setQuotaBytes] = useState<number>(0);
  const [cleanedBytes, setCleanedBytes] = useState<number>(0);
  const [cleaned, setCleaned] = useState(false);
  const [cacheCount, setCacheCount] = useState<number>(0);

  useEffect(() => {
    scanStorage();
  }, []);

  const scanStorage = async () => {
    setIsScanning(true);
    setCleaned(false);
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        setUsedBytes(estimate.usage || 0);
        setQuotaBytes(estimate.quota || 0);
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        setCacheCount(keys.length);
      }
    } catch (err) {
      console.warn("Storage estimate error:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleClean = async () => {
    setIsCleaning(true);
    let freed = 0;
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }
      
      sessionStorage.clear();

      const freedFromCaches = cacheCount * 1024 * 1024;
      const estimateBefore = usedBytes;
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        setUsedBytes(estimate.usage || 0);
        freed = estimateBefore > 0 ? Math.max(estimateBefore - (estimate.usage || 0), 0) : freedFromCaches;
      } else {
        freed = freedFromCaches;
      }

      setCleanedBytes(freed);
      setCacheCount(0);
      setCleaned(true);
    } catch (err) {
      console.error("Clean error:", err);
    } finally {
      setIsCleaning(false);
    }
  };

  const formatMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2);

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
              strokeDashoffset={isScanning ? "283" : isCleaning ? "140" : (cleaned ? "0" : "70")}
              className={`transition-all duration-1000 ${isScanning || isCleaning ? 'animate-pulse' : ''}`}
            />
          </svg>
          
          {isScanning ? (
            <div className="text-center">
              <span className="text-2xl font-mono text-cyber-cyanAccent font-bold">Scanning</span>
              <p className="text-xs text-gray-500 uppercase mt-1">Analyzing Storage</p>
            </div>
          ) : isCleaning ? (
            <div className="text-center">
              <span className="text-2xl font-mono text-cyber-cyanAccent font-bold">Cleaning</span>
              <p className="text-xs text-gray-500 uppercase mt-1">Clearing Caches</p>
            </div>
          ) : cleaned ? (
            <div className="text-center">
              <span className="text-3xl font-mono text-cyber-green font-bold">Clean</span>
              <p className="text-xs text-gray-500 uppercase mt-1">Optimized</p>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-3xl font-mono text-cyber-cyanAccent font-bold">{formatMB(usedBytes)}</span>
              <span className="text-sm font-mono text-cyber-cyanAccent ml-1">MB</span>
              <p className="text-xs text-gray-500 uppercase mt-1">Storage Usage</p>
            </div>
          )}
        </div>

        {cleaned ? (
          <p className="text-cyber-green font-bold text-center mb-6 flex items-center gap-2">
            <CheckCircle size={18} /> Freed {formatMB(cleanedBytes)} MB of Browser Cache & Temporary Data
          </p>
        ) : (
          <p className="text-gray-400 text-center text-sm mb-6">
            Scans active browser cache storage, temp keys, and session data.
          </p>
        )}

        <button
          onClick={handleClean}
          disabled={isScanning || isCleaning || cleaned}
          className="w-full max-w-sm flex items-center justify-center gap-2 bg-cyber-cyanAccent hover:bg-cyan-400 text-black disabled:opacity-50 disabled:cursor-not-allowed font-bold py-3 rounded-lg transition-colors"
        >
          <Trash2 size={20} />
          {cleaned ? 'Storage Cleaned' : 'Clear Cache & Temp Files'}
        </button>

        <div className="mt-4 w-full max-w-sm flex items-start gap-2 bg-cyber-navy border border-gray-800 rounded-xl p-3 text-left">
          <Info size={16} className="text-cyber-cyanAccent shrink-0 mt-0.5" />
          <p className="text-gray-400 text-xs leading-relaxed">
            Clears this browser's cache, service worker storage, and session data. Full device junk scanning requires the Android APK build.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-cyber-navy p-5 rounded-2xl border border-gray-800 flex items-center gap-4">
          <div className="p-3 bg-cyber-darkCard rounded-xl text-cyber-bluePrimary">
            <HardDrive size={24} />
          </div>
          <div>
            <h4 className="text-white font-bold">Cache Storage Keys</h4>
            <p className="text-gray-400 text-xs">Active service worker cache buckets.</p>
          </div>
          <div className="ml-auto text-right">
            <span className="font-mono text-white text-sm">{cleaned ? 0 : cacheCount} Buckets</span>
          </div>
        </div>

        <div className="bg-cyber-navy p-5 rounded-2xl border border-gray-800 flex items-center gap-4">
          <div className="p-3 bg-cyber-darkCard rounded-xl text-cyber-bluePrimary">
            <Cpu size={24} />
          </div>
          <div>
            <h4 className="text-white font-bold">Total Storage Quota</h4>
            <p className="text-gray-400 text-xs">Allocated by device browser engine.</p>
          </div>
          <div className="ml-auto text-right">
            <span className="font-mono text-white text-sm">{formatMB(quotaBytes)} MB</span>
          </div>
        </div>
      </div>
    </div>
  );
}