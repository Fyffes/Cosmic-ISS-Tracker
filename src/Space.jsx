import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

export default function Space({ lat, lng, isLoaded, pulseKeyframes, pulseTimes, mapTiming }) {
  const [orbitPath, setOrbitPath] = useState([]);

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

  useEffect(() => {
    const fetchOrbit = async () => {
      const now = Math.floor(Date.now() / 1000);
      const timestamps = Array.from({ length: 150 }, (_, i) => now - (45 * 60) + (i * 60));
      const chunks = [];
      for (let i = 0; i < timestamps.length; i += 15) {
        chunks.push(timestamps.slice(i, i + 15));
      }

      try {
        const results = await Promise.all(
          chunks.map(chunk =>
            fetch(`https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=${chunk.join(',')}`)
              .then(r => r.json())
          )
        );
        const flattened = results.flat().map(p => ({
          x: getX(parseFloat(p.longitude)),
          y: getY(parseFloat(p.latitude))
        }));
        setOrbitPath(flattened);
      } catch (e) {
        console.warn("Orbit sync pause");
      }
    };

    fetchOrbit();
    const interval = setInterval(fetchOrbit, 60000);
    return () => clearInterval(interval);
  }, []);

  const segments = useMemo(() => splitSegments(orbitPath), [orbitPath]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black overflow-hidden">
      <div className="relative w-full aspect-[2/1] max-h-full">
        
        {/* NASA Map */}
        <img
          src="https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/144000/144898/BlackMarble_2016_01deg.jpg"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none opacity-80 brightness-110"
          alt="NASA Earth Night"
        />

        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          {segments.map((seg, i) => (
            <polyline key={i} points={seg.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.2" strokeDasharray="0.5,1" />
          ))}
        </svg>

        {/* ISS POSITION */}
        {isLoaded && (
          <div
            className="absolute transition-all duration-[2000ms] ease-linear z-40 flex items-center justify-center"
            style={{
              left: `${getX(lng)}%`,
              top: `${getY(lat)}%`,
              transform: 'translate(-50%, -50%)',
              width: '0px', height: '0px'
            }}
          >
            {/* Pulsing Aura */}
            <motion.div
              animate={pulseKeyframes}
              transition={{ ...mapTiming, times: pulseTimes }}
              className="absolute w-8 h-8 md:w-14 md:h-14 bg-white/30 rounded-full"
            />
            
            {/* Physical Dot */}
            <div className="absolute w-2 h-2 md:w-3 md:h-3 bg-white rounded-full shadow-[0_0_15px_#fff] z-10 border border-black/40" />

            {/* Label */}
            <div className="absolute top-4 md:top-6 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded border border-white/20 text-[6px] md:text-[10px] font-mono text-white whitespace-nowrap uppercase tracking-widest">
              {lat.toFixed(2)}°N {lng.toFixed(2)}°E
            </div>
          </div>
        )}
      </div>
    </div>
  );
}