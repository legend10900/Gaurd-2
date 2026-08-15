import { useState, useEffect } from 'react';
import { Thermometer, Battery, Activity, Info } from 'lucide-react';
import CyberHeader from '../components/CyberHeader';
import { Screen } from '../App';

interface BatteryCoolerScreenProps {
  onNavigate: (screen: Screen) => void;
}

interface WebBattery {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

export default function BatteryCoolerScreen({ onNavigate }: BatteryCoolerScreenProps) {
  const [batteryInfo, setBatteryInfo] = useState<WebBattery | null>(null);
  const [batterySupported, setBatterySupported] = useState(true);

  useEffect(() => {
    let battery: any = null;
    const update = (b: any) => {
      setBatteryInfo({
        level: b.level ?? 0,
        charging: b.charging ?? false,
        chargingTime: b.chargingTime ?? 0,
        dischargingTime: b.dischargingTime ?? 0,
      });
    };

    const nav = navigator as any;
    if (nav.getBattery) {
      nav.getBattery().then((b: any) => {
        battery = b;
        update(b);
        b.addEventListener('levelchange', () => update(b));
        b.addEventListener('chargingchange', () => update(b));
      }).catch(() => setBatterySupported(false));
    } else {
      setBatterySupported(false);
    }

    return () => {
      if (battery) {
        battery.removeEventListener('levelchange', () => update(battery));
        battery.removeEventListener('chargingchange', () => update(battery));
      }
    };
  }, []);

  const batteryPercent = batteryInfo ? Math.round(batteryInfo.level * 100) : null;
  const isCharging = batteryInfo?.charging ?? false;
  const isLow = batteryPercent !== null && batteryPercent <= 20;

  return (
    <div className="flex flex-col p-4 md:p-6 h-screen overflow-y-auto pb-24">
      <CyberHeader 
        title="Battery Monitor" 
        subtitle="POWER & THERMAL HEALTH" 
        onBack={() => onNavigate('dashboard')}
      />

      <div className="mt-6 bg-cyber-darkCard rounded-3xl p-8 border border-gray-800 shadow-lg flex flex-col items-center relative overflow-hidden">
        
        <div className="relative w-48 h-48 flex flex-col items-center justify-center mb-6 z-10">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#131b2b" strokeWidth="4" />
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke={batteryPercent !== null ? (isLow ? '#ffc400' : '#00e676') : '#1a2436'} 
              strokeWidth="6"
              strokeDasharray="283"
              strokeDashoffset={batteryPercent !== null ? 283 - (batteryPercent / 100) * 283 : 283}
              className="transition-all duration-300 ease-out"
            />
          </svg>
          
          <Battery 
            size={32} 
            className="mb-1"
            style={{ color: batteryPercent !== null ? (isLow ? '#ffc400' : '#00e676') : '#4b5563' }} 
          />
          <div className="text-center">
            <span className="text-4xl font-mono font-bold" style={{ color: batteryPercent !== null ? (isLow ? '#ffc400' : '#00e676') : '#4b5563' }}>
              {batteryPercent !== null ? batteryPercent : '--'}
            </span>
            <span className="text-xl font-mono ml-1" style={{ color: batteryPercent !== null ? (isLow ? '#ffc400' : '#00e676') : '#4b5563' }}>%</span>
          </div>
        </div>

        <h3 className="text-white font-bold text-lg mb-2 z-10">
          {batteryPercent === null
            ? "Battery Sensor Unavailable"
            : isLow
            ? "Battery Level Low"
            : isCharging
            ? "Battery Charging"
            : "Battery Level Normal"}
        </h3>
        {batteryInfo && (
          <div className="flex items-center gap-2 mb-2 z-10 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700">
            <Battery size={16} className={isCharging ? 'text-cyber-green' : 'text-gray-400'} />
            <span className="text-sm font-mono text-gray-300">
              {batteryPercent}% {isCharging ? '(Charging)' : '(On Battery)'}
            </span>
          </div>
        )}

        {batterySupported ? (
          <p className="text-gray-400 text-center text-sm mb-8 max-w-xs z-10">
            Live battery level read directly from your device. Enable power saving when below 20% to extend battery life.
          </p>
        ) : (
          <div className="z-10 mb-8 max-w-xs">
            <div className="flex items-start gap-2 bg-cyber-navy border border-gray-800 rounded-xl p-3 text-left">
              <Info size={16} className="text-cyber-cyanAccent shrink-0 mt-0.5" />
              <p className="text-gray-400 text-xs leading-relaxed">
                This browser does not expose battery telemetry. Thermal regulation, CPU cooling, and battery sensors are available in the native Android APK build.
              </p>
            </div>
          </div>
        )}

        {batteryInfo && isCharging && batteryInfo.chargingTime > 0 && (
          <p className="text-gray-500 text-xs z-10 mb-4">
            Full charge in ~{Math.ceil(batteryInfo.chargingTime / 60)} min
          </p>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-white uppercase tracking-wide mb-4">Power Recommendations</h2>
        
        <div className="space-y-3">
          <div className="bg-cyber-navy p-4 rounded-xl border border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className={batteryPercent !== null && batteryPercent <= 20 ? 'text-cyber-yellow' : 'text-cyber-green'} size={20} />
              <span className="text-white font-medium">Enable Low Power Mode</span>
            </div>
            <span className={`font-mono text-sm ${batteryPercent !== null && batteryPercent <= 20 ? 'text-cyber-yellow' : 'text-cyber-green'}`}>
              {batteryPercent !== null && batteryPercent <= 20 ? 'Recommended' : 'Optional'}
            </span>
          </div>
          <div className="bg-cyber-navy p-4 rounded-xl border border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Thermometer className="text-cyber-bluePrimary" size={20} />
              <span className="text-white font-medium">Reduce Screen Brightness</span>
            </div>
            <span className="text-cyber-bluePrimary font-mono text-sm">-15% Usage</span>
          </div>
        </div>
      </div>
    </div>
  );
}