import { ChevronLeft } from 'lucide-react';

interface CyberHeaderProps {
  title: string;
  subtitle: string;
  onBack?: () => void;
}

export default function CyberHeader({ title, subtitle, onBack }: CyberHeaderProps) {
  return (
    <div className="flex flex-col py-6 relative">
      <div className="flex items-center gap-3">
        {onBack && (
          <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg hover:bg-cyber-darkCard text-cyber-cyanAccent transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white uppercase drop-shadow-[0_0_10px_rgba(0,102,255,0.5)]">
          {title}
        </h1>
      </div>
      <h2 className="text-sm md:text-base text-cyber-cyanAccent font-mono tracking-widest mt-1 opacity-80 uppercase pl-1">
        {subtitle}
      </h2>
      
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyber-bluePrimary via-cyber-cyanAccent to-transparent opacity-50" />
    </div>
  );
}
