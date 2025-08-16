import { useEffect, useState } from "react";

const ThreatMap = () => {
  const [threats, setThreats] = useState([
    { id: 1, lat: 40.7128, lng: -74.0060, intensity: 0.8 },
    { id: 2, lat: 51.5074, lng: -0.1278, intensity: 0.6 },
    { id: 3, lat: 35.6762, lng: 139.6503, intensity: 0.9 },
    { id: 4, lat: -33.8688, lng: 151.2093, intensity: 0.7 },
    { id: 5, lat: 37.7749, lng: -122.4194, intensity: 0.5 },
    { id: 6, lat: 55.7558, lng: 37.6176, intensity: 0.8 },
    { id: 7, lat: 28.6139, lng: 77.2090, intensity: 0.6 },
    { id: 8, lat: -23.5505, lng: -46.6333, intensity: 0.7 }
  ]);

  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase(prev => (prev + 1) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const convertToSVG = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 800;
    const y = ((90 - lat) / 180) * 400;
    return { x, y };
  };

  return (
    <div className="relative bg-card border border-border rounded-lg p-6 h-[400px] overflow-hidden">
      <h3 className="text-xl font-semibold text-foreground mb-4">Real-time Threat Map</h3>
      
      <div className="relative w-full h-full">
        <svg
          viewBox="0 0 800 400"
          className="w-full h-full"
          style={{ background: 'radial-gradient(circle at center, hsl(220 25% 8%), hsl(220 30% 5%))' }}
        >
          {/* World map outline (simplified) */}
          <g stroke="hsl(217 91% 60% / 0.3)" strokeWidth="1" fill="none">
            {/* North America */}
            <path d="M150 120 Q180 100 220 120 Q260 110 280 140 Q290 160 280 180 Q270 200 250 210 Q220 220 190 210 Q160 200 150 180 Q140 160 150 140 Z" />
            
            {/* South America */}
            <path d="M200 220 Q220 240 230 280 Q225 320 210 340 Q190 350 180 330 Q175 310 180 290 Q185 270 190 250 Q195 230 200 220 Z" />
            
            {/* Europe */}
            <path d="M350 100 Q380 95 400 110 Q410 120 405 135 Q395 145 380 140 Q365 135 355 125 Q345 115 350 100 Z" />
            
            {/* Africa */}
            <path d="M320 160 Q350 150 370 170 Q380 190 375 220 Q370 250 360 280 Q350 300 340 290 Q330 270 325 250 Q320 230 320 200 Q320 180 320 160 Z" />
            
            {/* Asia */}
            <path d="M420 80 Q480 75 540 90 Q580 100 620 120 Q640 140 630 160 Q620 180 600 170 Q580 160 560 155 Q540 150 520 145 Q500 140 480 135 Q460 130 440 125 Q420 120 420 100 Q420 90 420 80 Z" />
            
            {/* Australia */}
            <path d="M580 280 Q620 275 640 290 Q645 300 640 310 Q630 315 620 310 Q610 305 600 300 Q590 295 585 290 Q580 285 580 280 Z" />
          </g>
          
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(217 91% 60% / 0.1)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="800" height="400" fill="url(#grid)" />
          
          {/* Threat indicators */}
          {threats.map((threat) => {
            const pos = convertToSVG(threat.lat, threat.lng);
            const pulseScale = 1 + (Math.sin(animationPhase * 0.1 + threat.id) * 0.3);
            const opacity = 0.6 + (Math.sin(animationPhase * 0.15 + threat.id) * 0.4);
            
            return (
              <g key={threat.id}>
                {/* Outer glow */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={8 * pulseScale}
                  fill="hsl(0 84% 60% / 0.2)"
                  className="animate-pulse"
                />
                {/* Main threat dot */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={4}
                  fill="hsl(0 84% 60%)"
                  opacity={opacity}
                />
                {/* Center highlight */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={2}
                  fill="hsl(0 84% 80%)"
                />
              </g>
            );
          })}
          
          {/* Connection lines between threats */}
          {threats.map((threat, index) => {
            const nextThreat = threats[(index + 1) % threats.length];
            const pos1 = convertToSVG(threat.lat, threat.lng);
            const pos2 = convertToSVG(nextThreat.lat, nextThreat.lng);
            
            return (
              <line
                key={`line-${threat.id}`}
                x1={pos1.x}
                y1={pos1.y}
                x2={pos2.x}
                y2={pos2.y}
                stroke="hsl(217 91% 60% / 0.2)"
                strokeWidth="1"
                strokeDasharray="4,4"
                className="animate-pulse"
              />
            );
          })}
        </svg>
        
        {/* Scanning effect overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent ${animationPhase}%, hsl(217 91% 60% / 0.1) ${animationPhase + 2}%, transparent ${animationPhase + 4}%)`
          }}
        />
      </div>
    </div>
  );
};

export default ThreatMap;