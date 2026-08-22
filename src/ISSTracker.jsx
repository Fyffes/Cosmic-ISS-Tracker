import React, { useState, useEffect } from 'react';
import Space from './Space';
import { motion } from 'framer-motion';

export default function ISSTracker() {
  const [iss, setIss] = useState({ latitude: 0, longitude: 0, altitude: 0, velocity: 0 });
  const [crew, setCrew] = useState([]);
  const [docked, setDocked] = useState([]);
  const [location, setLocation] = useState('Searching Signal...');
  const [utcTime, setUtcTime] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  const cycleDuration = 3; 
  const pulseKeyframes = {
    scale: [1, 2.2, 2.2],
    opacity: [0, 1, 1, 0] 
  };
  const pulseTimes = [0, 0.05, 0.15, 1]; 

  useEffect(() => {
    const timer = setInterval(() => setUtcTime(new Date().toUTCString()), 1000);

    const fetchData = async () => {
      try {
        const [issRes, crewRes, craftRes] = await Promise.all([
          fetch('https://api.wheretheiss.at/v1/satellites/25544'),
          fetch('https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json'),
          fetch('https://corquaid.github.io/international-space-station-APIs/JSON/iss-docked-spacecraft.json')
        ]);
        
        if (issRes.status === 429) return;

        const data = await issRes.json();
        if (data && data.latitude !== undefined) {
          setIss(data);
          setIsLoaded(true);

          try {
            const geoRes = await fetch(`https://api.wheretheiss.at/v1/coordinates/${data.latitude.toFixed(4)},${data.longitude.toFixed(4)}`);
            const geoData = await geoRes.json();
            const country = geoData?.country_code;
            if (country && country !== 'none' && !country.includes('?')) {
              setLocation(`${country.toUpperCase()} · ${geoData.timezone_id}`);
            } else {
              setLocation('OCEAN');
            }
          } catch (e) { 
            setLocation('OCEAN'); 
          }
        }

        const crewData = await crewRes.json();
        const craftData = await craftRes.json();
        setCrew(crewData?.people || []);
        setDocked(craftData?.spacecraft || []);
      } catch (e) { 
        setLocation('OCEAN');
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); 
    return () => { clearInterval(timer); clearInterval(interval); };
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-4 md:gap-6 relative z-10">
      
      {/* MAP SECTION - Forced 2:1 Ratio to prevent stretching */}
      <div className="relative w-full aspect-[2/1] bg-black/20 rounded-[24px] md:rounded-[32px] border border-white/10 overflow-hidden shadow-2xl">
        <Space 
          lat={iss?.latitude || 0} 
          lng={iss?.longitude || 0} 
          isLoaded={isLoaded} 
          pulseKeyframes={pulseKeyframes}
          pulseTimes={pulseTimes}
          mapTiming={{ duration: cycleDuration, repeat: Infinity, ease: "linear" }} 
        />
        
        <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl px-4 md:px-6 py-2 rounded-full border border-white/10 font-mono text-[9px] md:text-[11px] text-white z-30 tracking-[0.15em] md:tracking-widest shadow-2xl whitespace-nowrap">
          {utcTime || "CONNECTING..."}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatBox label="ALTITUDE" value={`${Math.round(iss?.altitude || 0)} km`} />
        <StatBox label="VELOCITY" value={`${Math.round(iss?.velocity || 0).toLocaleString()} km/h`} />
        <ListBox label="CREW" count={crew.length} items={crew.map(p => p.name)} />
        <ListBox label="DOCKED" count={docked.length} items={docked.map(d => d.name)} />
      </div>

      <div className="w-full flex flex-col md:flex-row justify-between items-center p-4 md:p-5 bg-white/[0.02] border border-white/5 rounded-2xl font-mono text-[9px] gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
          <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
            <motion.div 
              animate={pulseKeyframes}
              transition={{ duration: cycleDuration, repeat: Infinity, ease: "linear", delay: 0.5, times: pulseTimes }}
              className="absolute w-full h-full bg-white/40 rounded-full"
            />
            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_12px_#fff] z-10" />
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-white/30 uppercase tracking-[0.2em]">Ground Track:</span>
            <span className="text-white/90 font-bold tracking-tight text-center md:text-left">{location}</span>
          </div>
        </div>
        
        <div className="text-white/20 tracking-widest uppercase border-t border-white/5 md:border-none pt-3 md:pt-0 w-full md:w-auto text-center">
          LAT: {iss?.latitude?.toFixed(4) || "0.0000"}° <span className="mx-2 text-white/5">//</span> LNG: {iss?.longitude?.toFixed(4) || "0.0000"}°
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="bg-white/[0.01] border border-white/5 p-4 md:p-6 rounded-2xl text-center hover:bg-white/[0.03] transition-colors group">
      <p className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/30 mb-1 md:mb-2 group-hover:text-white/50 transition-colors">
        {label}
      </p>
      <p className="text-lg md:text-2xl font-light text-white truncate">
        {value}
      </p>
    </div>
  );
}

function ListBox({ label, count, items }) {
  return (
    <div className="bg-white/[0.01] border border-white/5 h-24 md:h-32 rounded-2xl group relative overflow-hidden hover:bg-white/[0.03] transition-colors">
      <div className="h-full flex flex-col items-center justify-center group-hover:opacity-0 transition-opacity duration-300">
        <p className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/30 mb-1 md:mb-2">{label}</p>
        <p className="text-lg md:text-2xl font-light text-white">{count}</p>
      </div>
      
      <div className="absolute inset-0 bg-[#05070a]/95 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-3">
        <p className="text-[7px] md:text-[8px] font-bold text-white uppercase tracking-widest text-center border-b border-white/10 pb-1 mb-2">
          {label} DETAILS
        </p>
        <div className="overflow-y-auto scrollbar-hide space-y-1">
          {items.length > 0 ? items.map((item, i) => (
            <p key={i} className="text-[9px] md:text-[10px] text-white/60 uppercase tracking-tighter truncate">• {item}</p>
          )) : <p className="text-[9px] text-white/20 text-center">No Data</p>}
        </div>
      </div>
    </div>
  );
}