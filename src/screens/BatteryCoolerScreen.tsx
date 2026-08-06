import { useState, useEffect } from 'react';
import { Thermometer, ThermometerSnowflake, Activity, Battery } from 'lucide-react';
import { Device, BatteryInfo } from '@capacitor/device';
import CyberHeader from '../components/CyberHeader';
import { Screen } from '../App';

interface BatteryCoolerScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function BatteryCoolerScreen({ onNavigate }: BatteryCoolerScreenProps) {
  const [temperature, setTemperature] = useState(38.5);
  const [isCooling, setIsCooling] = useState(false);
  const [cooled, setCooled] = useState(false);
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo | null>(null);

  useEffect(() => {
    Device.getBatteryInfo().then(info => setBatteryInfo(info));
  }, []);

  const startCooling = () => {
    setIsCooling(true);
    let temp = temperature;
    const interval = setInterval(() => {
      temp -= 0.5;
      setTemperature(temp);
      if (temp <= 31.0) {
        clearInterval(interval);
        setIsCooling(false);
        setCooled(true);
      }
    }, 300);
  };

  const isHot = temperature > 35;
  const tempColor = isHot ? '#ffc400' : '#00e676';

  return (
    <div className="flex flex-col p-4 md:p-6 h-screen overflow-y-auto pb-24">
      <CyberHeader 
        title="Battery Monitor" 
        subtitle="THERMAL REGULATION & COOLING" 
        onBack={() => onNavigate('dashboard')}
      />

      <div className="mt-6 bg-cyber-darkCard rounded-3xl p-8 border border-gray-800 shadow-lg flex flex-col items-center relative overflow-hidden">
        
        {isCooling && (
          <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center pointer-events-none">
            <div className="w-full h-full animate-pulse opacity-20 bg-gradient-to-t from-blue-400 to-transparent" />
          </div>
        )}

        <div className="relative w-48 h-48 flex flex-col items-center justify-center mb-6 z-10">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#131b2b" strokeWidth="4" />
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke={tempColor} 
              strokeWidth="6"
              strokeDasharray="283"
              strokeDashoffset={283 - (Math.min(temperature - 20, 30) / 30) * 283}
              className="transition-all duration-300 ease-out"
            />
          </svg>
          
          <Thermometer 
            size={32} 
            className="mb-1"
            style={{ color: tempColor }} 
          />
          <div className="text-center">
            <span className="text-4xl font-mono font-bold" style={{ color: tempColor }}>
              {temperature.toFixed(1)}
            </span>
            <span className="text-xl font-mono ml-1" style={{ color: tempColor }}>°C</span>
          </div>
        </div>

        <h3 className="text-white font-bold text-lg mb-2 z-10">
          {cooled ? "Thermal Load Optimal" : isHot ? "Elevated Thermal Load" : "Temperature Normal"}
        </h3>
        {batteryInfo && (
          <div className="flex items-center gap-2 mb-2 z-10 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700">
            <Battery size={16} className={batteryInfo.isCharging ? 'text-cyber-green' : 'text-gray-400'} />
            <span className="text-sm font-mono text-gray-300">
              {Math.round((batteryInfo.batteryLevel || 0) * 100)}% {batteryInfo.isCharging ? '(Charging)' : ''}
            </span>
          </div>
        )}
        <p className="text-gray-400 text-center text-sm mb-8 max-w-xs z-10">
          Monitor CPU/Battery heat and forcefully sleep background apps to reduce thermal stress.
        </p>

        <button
          onClick={startCooling}
          disabled={isCooling || cooled || !isHot}
          className="w-full max-w-sm flex items-center justify-center gap-2 z-10 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-3 rounded-lg transition-colors"
        >
          <ThermometerSnowflake size={20} />
          {isCooling ? 'Cooling Active...' : cooled ? 'Cooling Complete' : 'Cool Down System'}
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-white uppercase tracking-wide mb-4">Background CPU Usage</h2>
        
        <div className="space-y-3">
          <div className="bg-cyber-navy p-4 rounded-xl border border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="text-cyber-yellow" size={20} />
              <span className="text-white font-medium">SocialMediaApp</span>
            </div>
            <span className="text-cyber-yellow font-mono text-sm">{cooled ? '0%' : '14%'}</span>
          </div>
          <div className="bg-cyber-navy p-4 rounded-xl border border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="text-cyber-bluePrimary" size={20} />
              <span className="text-white font-medium">Maps Service</span>
            </div>
            <span className="text-cyber-bluePrimary font-mono text-sm">{cooled ? '1%' : '8%'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
