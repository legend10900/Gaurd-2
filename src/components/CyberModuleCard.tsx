import { LucideIcon } from 'lucide-react';

interface CyberModuleCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  badgeText: string;
  accentColor: string; // Tailwind hex color
  onClick: () => void;
}

export default function CyberModuleCard({
  title,
  subtitle,
  icon: Icon,
  badgeText,
  accentColor,
  onClick
}: CyberModuleCardProps) {
  return (
    <div 
      onClick={onClick}
      className="w-full relative overflow-hidden group cursor-pointer bg-cyber-darkCard border border-gray-800 rounded-xl p-4 transition-all duration-300 hover:border-gray-600 hover:shadow-[0_0_15px_rgba(0,0,0,0.5)]"
      style={{ '--accent': accentColor } as React.CSSProperties}
    >
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 opacity-70 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: accentColor }}
      />
      
      <div className="flex items-start gap-4">
        <div 
          className="p-3 rounded-lg flex items-center justify-center bg-cyber-navy shrink-0"
        >
          <Icon size={24} style={{ color: accentColor }} />
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-white font-bold truncate">{title}</h3>
            <span 
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase shrink-0"
              style={{ color: accentColor, backgroundColor: `${accentColor}20` }}
            >
              {badgeText}
            </span>
          </div>
          <p className="text-xs text-gray-400 line-clamp-2">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
