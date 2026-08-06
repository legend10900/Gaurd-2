import { useEffect, useRef } from 'react';

interface CyberTerminalConsoleProps {
  logs: string[];
}

export default function CyberTerminalConsole({ logs }: CyberTerminalConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full bg-black/60 border border-cyber-cyanAccent/30 rounded-lg p-3 font-mono text-[10px] md:text-xs h-32 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-cyanAccent/40 to-transparent" />
      <div className="text-cyber-cyanAccent/70 font-bold mb-1 border-b border-cyber-cyanAccent/20 pb-1 flex justify-between">
        <span>sys_log_stream</span>
        <span className="animate-pulse">_</span>
      </div>
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-1 pr-1"
      >
        {logs.map((log, idx) => (
          <div key={idx} className="flex gap-2 text-gray-300 break-all">
            <span className="text-cyber-bluePrimary opacity-70 shrink-0">
              {new Date().toISOString().substring(11, 19)}
            </span>
            <span>{log}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
