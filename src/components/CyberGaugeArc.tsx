import { useEffect, useState } from 'react';

interface CyberGaugeArcProps {
  score: number;
}

export default function CyberGaugeArc({ score }: CyberGaugeArcProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  // Map 0-100 to color
  const getColor = () => {
    if (animatedScore >= 80) return '#00e676'; // green
    if (animatedScore >= 50) return '#ffc400'; // yellow
    return '#ff1744'; // red
  };

  const color = getColor();
  const radius = 60;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  // Arc only goes 75% of the way around, centered at top
  const arcLength = circumference * 0.75;
  const dashoffset = arcLength - (animatedScore / 100) * arcLength;

  return (
    <div className="relative flex flex-col items-center justify-center w-48 h-48">
      <svg className="w-full h-full transform -rotate-135" viewBox="0 0 150 150">
        <circle
          cx="75"
          cy="75"
          r={radius}
          fill="none"
          stroke="#1a2436"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
        />
        <circle
          cx="75"
          cy="75"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={dashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-4xl font-bold font-mono tracking-tighter" style={{ color }}>
          {Math.round(animatedScore)}
        </span>
        <span className="text-xs text-gray-400 font-mono tracking-widest uppercase mt-1">
          Security
        </span>
      </div>
    </div>
  );
}
