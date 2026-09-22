import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function Space({ lat, lng, isLoaded, pulseKeyframes, pulseTimes, mapTiming, orbitData, userLoc }) {
  const getX = (lon) => ((lon + 180) / 360) * 100;
  const getY = (lati) => ((90 - lati) / 180) * 100;

  const splitSegments = (points) => {
    if (points.length === 0) return [];
    const segments = [];
    let current = [points[0]];
    for (let i = 1; i < points.length; i++) {
      if (Math.abs(points[i].x - points[i - 1].x) > 50) {
        segments.push(current);
        current = [];
      }
      current.push(points[i]);
    }
    segments.push(current);
    return segments;
  };

  const segments = useMemo(() => splitSegments(orbitData), [orbitData]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black overflow-hidden font-sans">
      <div className="relative w-full aspect-[2/1] max-h-full">
        <img
          src="https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/144000/144898/BlackMarble_2016_01deg.jpg"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none opacity-80 brightness-110"
          alt="NASA Earth Night"
        />

        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          {segments.map((seg, i) => (
            <polyline 
              key={i} 
              points={seg.map(p => `${p.x},${p.y}`).join(' ')} 
              fill="none" 
              stroke="rgba(255, 255, 255, 0.4)" 
              strokeWidth="0.2" 
              strokeDasharray="0.5,1" 
            />
          ))}
        </svg>

        {userLoc && userLoc.lat !== null && (
          <div
            className="absolute z-20 flex items-center justify-center pointer-events-none transition-all duration-500"
            style={{
              left: `${getX(userLoc.lng)}%`,
              top: `${getY(userLoc.lat)}%`,
              transform: 'translate(-50%, -50%)',
              width: '0px', height: '0px'
            }}
          >
            <div className="absolute w-2 h-2 md:w-2.5 md:h-2.5 bg-[#00ffcc] rounded-full shadow-[0_0_12px_#00ffcc] z-10 border border-black/40" />
            <div className="absolute top-3 md:top-4 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded border border-[#00ffcc]/30 text-[6px] md:text-[8px] font-mono text-[#00ffcc] whitespace-nowrap uppercase tracking-widest font-semibold">
              YOU
            </div>
          </div>
        )}

        {isLoaded && (
          <div
            className="absolute transition-all duration-[2000ms] ease-linear z-40 flex items-center justify-center pointer-events-none"
            style={{
              left: `${getX(lng)}%`,
              top: `${getY(lat)}%`,
              transform: 'translate(-50%, -50%)',
              width: '0px', height: '0px'
            }}
          >
            <motion.div
              animate={pulseKeyframes}
              transition={{ ...mapTiming, times: pulseTimes }}
              className="absolute w-8 h-8 md:w-14 md:h-14 bg-white/30 rounded-full"
            />
            <div className="absolute w-2 h-2 md:w-3 md:h-3 bg-white rounded-full shadow-[0_0_15px_#fff] z-10 border border-black/40" />
            <div className="absolute top-4 md:top-6 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded border border-white/20 text-[6px] md:text-[10px] font-mono text-white whitespace-nowrap uppercase tracking-widest font-medium">
              {lat.toFixed(2)}°N {lng.toFixed(2)}°E
            </div>
          </div>
        )}
      </div>
    </div>
  );
}