import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as satellite from 'satellite.js';
import Space from './Space';

// --- Astronomical Helpers ---
const getSunElevation = (date, lat, lon) => {
  const rad = Math.PI / 180;
  const days = (date.getTime() - new Date(Date.UTC(2000, 0, 1, 12, 0, 0)).getTime()) / 86400000.0;
  const L = (280.460 + 0.9856474 * days) % 360;
  const g = (357.528 + 0.9856003 * days) % 360;
  const lambda = L + 1.915 * Math.sin(g * rad) + 0.020 * Math.sin(2 * g * rad);
  const epsilon = 23.439 - 0.0000004 * days;
  
  const dec = Math.asin(Math.sin(epsilon * rad) * Math.sin(lambda * rad));
  const ra = Math.atan2(Math.cos(epsilon * rad) * Math.sin(lambda * rad), Math.cos(lambda * rad));
  
  const gmst = (18.697374558 + 24.06570982441908 * days) % 24;
  const lmst = (gmst * 15 + lon) * rad;
  const ha = lmst - ra;
  
  const el = Math.asin(Math.sin(lat * rad) * Math.sin(dec) + Math.cos(lat * rad) * Math.cos(dec) * Math.cos(ha));
  return el / rad; 
};

const getCompassDirection = (azimuth) => {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return directions[Math.round(azimuth / 22.5) % 16];
};

export default function ISSTracker() {
  const [iss, setIss] = useState({ latitude: 0, longitude: 0, altitude: 0, velocity: 0 });
  const [crew, setCrew] = useState([]);
  const [docked, setDocked] = useState([]);
  
  // Structured State for smooth transitions
  const [issGroundTrack, setIssGroundTrack] = useState({ country: 'SEARCHING SIGNAL...', city: 'LOCATING' });
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [orbitMapData, setOrbitMapData] = useState([]);

  // Time & Location State
  const [localTimeZone, setLocalTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [currentTimeDisplay, setCurrentTimeDisplay] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [userLoc, setUserLoc] = useState({ name: '', lat: null, lng: null, loading: false, error: '' });
  const [upcomingPasses, setUpcomingPasses] = useState([]);
  const [searchStatus, setSearchStatus] = useState("");
  
  // Interactive Pass Modal State
  const [selectedPass, setSelectedPass] = useState(null);

  const cycleDuration = 3; 
  const pulseKeyframes = { scale: [1, 2.2, 2.2], opacity: [0, 1, 1, 0] };
  const pulseTimes = [0, 0.05, 0.15, 1]; 

  // --- Dynamic Local Clock ---
  useEffect(() => {
    const timer = setInterval(() => {
      try {
        const timeString = new Date().toLocaleString('en-US', {
          timeZone: localTimeZone,
          weekday: 'short', month: 'short', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          timeZoneName: 'short'
        });
        setCurrentTimeDisplay(timeString.toUpperCase());
      } catch (e) {
        setCurrentTimeDisplay("TIME SYNC ERROR");
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [localTimeZone]);

  // --- Map Drawing Data ---
  const fetchMapOrbit = async () => {
    try {
      const tleRes = await fetch('https://api.wheretheiss.at/v1/satellites/25544/tles');
      const tleData = await tleRes.json();
      const satrec = satellite.twoline2satrec(tleData.line1, tleData.line2);

      const now = new Date();
      const startMins = -46;
      const endMins = 138;
      const stepMins = 0.25; 

      const rawPoints = [];
      for (let i = startMins; i <= endMins; i += stepMins) {
        const d = new Date(now.getTime() + i * 60000);
        const positionAndVelocity = satellite.propagate(satrec, d);
        
        if (!positionAndVelocity.position) continue;

        const gmst = satellite.gstime(d);
        const positionGd = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
        
        const lat = satellite.radiansToDegrees(positionGd.latitude);
        const lng = satellite.radiansToDegrees(positionGd.longitude);

        rawPoints.push({
          lat: lat,
          lng: lng,
          x: ((lng + 180) / 360) * 100,
          y: ((90 - lat) / 180) * 100
        });
      }

      const smoothedMapData = [];
      for (let i = 0; i < rawPoints.length; i++) {
        const current = rawPoints[i];
        if (i > 0) {
          const prev = rawPoints[i - 1];
          if (prev.x > 90 && current.x < 10) {
            const intersectY = prev.y + ((current.y - prev.y) / 2);
            smoothedMapData.push({ ...prev, x: 100, y: intersectY }); 
            smoothedMapData.push({ ...current, x: 0, y: intersectY }); 
          } else if (prev.x < 10 && current.x > 90) {
            const intersectY = prev.y + ((current.y - prev.y) / 2);
            smoothedMapData.push({ ...prev, x: 0, y: intersectY }); 
            smoothedMapData.push({ ...current, x: 100, y: intersectY }); 
          }
        }
        smoothedMapData.push(current);
      }
      setOrbitMapData(smoothedMapData);
    } catch (e) {
      console.error("Failed to calculate orbit trajectory:", e);
    }
  };

  // --- Live Data Loop ---
  useEffect(() => {
    fetchMapOrbit();
    const fetchData = async () => {
      try {
        const issRes = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
        if (!issRes.ok) return;
        const data = await issRes.json();

        if (data && data.latitude !== undefined) {
          setIss(data);
          setIsLoaded(true);
          
          try {
            const geoRes = await fetch(`https://api.wheretheiss.at/v1/coordinates/${data.latitude.toFixed(4)},${data.longitude.toFixed(4)}`);
            const geoData = await geoRes.json();
            const countryCode = geoData?.country_code;

            if (countryCode && countryCode !== 'none' && !countryCode.includes('?')) {
              let fullCountry = countryCode;
              try {
                fullCountry = new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode.toUpperCase()) || countryCode;
              } catch (e) {}

              let cityLoc = 'OVERLAND';
              try {
                const cityRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${data.latitude.toFixed(4)}&lon=${data.longitude.toFixed(4)}&zoom=8`);
                const cityData = await cityRes.json();
                if (cityData?.address) {
                  cityLoc = cityData.address.city || cityData.address.town || cityData.address.village || cityData.address.county || cityData.address.state || 'OVERLAND';
                }
              } catch (e) {}

              setIssGroundTrack({ country: fullCountry.toUpperCase(), city: cityLoc.toUpperCase() });
            } else {
              setIssGroundTrack({ country: 'OCEAN', city: 'INTERNATIONAL WATERS' });
            }
          } catch (e) { 
            setIssGroundTrack({ country: 'OCEAN', city: 'INTERNATIONAL WATERS' }); 
          }
        }

        fetch('https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json')
          .then(r => r.json()).then(d => setCrew(d?.people || [])).catch(() => {});
        fetch('https://corquaid.github.io/international-space-station-APIs/JSON/iss-docked-spacecraft.json')
          .then(r => r.json()).then(d => setDocked(d?.spacecraft || [])).catch(() => {});
      } catch (e) { 
        setIssGroundTrack({ country: 'CONNECTION LOST', city: 'OFFLINE' }); 
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); 
    const orbitInterval = setInterval(fetchMapOrbit, 120000); 
    return () => { clearInterval(interval); clearInterval(orbitInterval); };
  }, []);

  // --- Naked-Eye Visible Pass Sighting Logic ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setUserLoc(prev => ({ ...prev, loading: true, error: '' }));
    setUpcomingPasses([]);
    
    try {
      setSearchStatus("Resolving location coordinates...");
      
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}`);
      const data = await res.json();
      
      if (!data || data.length === 0) {
        setUserLoc(prev => ({ ...prev, loading: false, error: 'Location not found' }));
        setSearchStatus("");
        return;
      }

      const uLat = parseFloat(data[0].lat);
      const uLng = parseFloat(data[0].lon);
      const observerGd = { longitude: satellite.degreesToRadians(uLng), latitude: satellite.degreesToRadians(uLat), height: 0 };
      
      let tz = Intl.DateTimeFormat().resolvedOptions().timeZone; 
      try {
        const tzRes = await fetch(`https://api.wheretheiss.at/v1/coordinates/${uLat.toFixed(4)},${uLng.toFixed(4)}`);
        const tzData = await tzRes.json();
        if (tzData && tzData.timezone_id) tz = tzData.timezone_id;
      } catch (err) {}

      setLocalTimeZone(tz);
      setUserLoc({ lat: uLat, lng: uLng, name: data[0].display_name.split(',')[0], loading: true, error: '' });
      setSearchStatus("Computing 5-day visible orbital trajectories...");
      
      const tleRes = await fetch('https://api.wheretheiss.at/v1/satellites/25544/tles');
      const tleData = await tleRes.json();
      const satrec = satellite.twoline2satrec(tleData.line1, tleData.line2);

      const passes = [];
      let currentPass = null;
      const now = new Date();

      for (let i = 0; i < 5 * 24 * 60; i++) {
        const d = new Date(now.getTime() + i * 60000);
        const positionAndVelocity = satellite.propagate(satrec, d);
        if (!positionAndVelocity.position) continue;

        const gmst = satellite.gstime(d);
        const positionGd = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
        const issLat = satellite.radiansToDegrees(positionGd.latitude);
        const issLng = satellite.radiansToDegrees(positionGd.longitude);

        const positionEcf = satellite.eciToEcf(positionAndVelocity.position, gmst);
        const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);
        
        const elevation = satellite.radiansToDegrees(lookAngles.elevation);
        const azimuth = satellite.radiansToDegrees(lookAngles.azimuth);

        const observerSun = getSunElevation(d, uLat, uLng);
        const issSun = getSunElevation(d, issLat, issLng);
        
        const isVisible = elevation >= 10 && observerSun <= -6 && issSun >= -21;

        if (isVisible) {
          if (!currentPass) {
            currentPass = { startTime: d, startAz: azimuth, maxElevation: elevation, maxAz: azimuth, points: 1 };
          }
          currentPass.maxElevation = Math.max(currentPass.maxElevation, elevation);
          currentPass.endTime = d;
          currentPass.endAz = azimuth;
          currentPass.points++;
        } else {
          if (currentPass) {
            if (currentPass.points >= 2 && currentPass.maxElevation >= 10) {
              passes.push(currentPass);
            }
            currentPass = null;
          }
        }
      }
      
      if (currentPass && currentPass.points >= 2 && currentPass.maxElevation >= 10) {
        passes.push(currentPass);
      }

      const formattedPasses = passes
        .filter(pass => pass.maxElevation >= 10)
        .map(pass => {
          const durationSec = Math.round((pass.endTime.getTime() - pass.startTime.getTime()) / 1000);
          const durMin = Math.floor(durationSec / 60);
          const durSec = durationSec % 60;
          const durationText = durMin > 0 ? `${durMin}m ${durSec}s` : `${durSec}s`;

          let quality = "Low Horizon Pass";
          if (pass.maxElevation >= 50) quality = "Excellent (Very Bright)";
          else if (pass.maxElevation >= 25) quality = "Good Visibility";

          const trajectory = [];
          const ux = (uLng + 180) / 3.6; 
          
          for(let t = pass.startTime.getTime(); t <= pass.endTime.getTime(); t += 10000) {
            const d = new Date(t);
            const pv = satellite.propagate(satrec, d);
            if(pv.position) {
              const gmst = satellite.gstime(d);
              const gd = satellite.eciToGeodetic(pv.position, gmst);
              const tLat = satellite.radiansToDegrees(gd.latitude);
              const tLng = satellite.radiansToDegrees(gd.longitude);
              
              let x = (tLng + 180) / 3.6;
              const y = (90 - tLat) / 1.8;
              
              if (x - ux > 50) x -= 100;
              if (x - ux < -50) x += 100;
              
              trajectory.push({ x, y, lat: tLat, lng: tLng });
            }
          }

          return {
            date: pass.startTime.toLocaleDateString('en-US', { timeZone: tz, month: 'short', day: 'numeric', weekday: 'short' }),
            startTime: pass.startTime.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit' }),
            endTime: pass.endTime.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit' }),
            durationText,
            quality,
            startDir: getCompassDirection(pass.startAz),
            endDir: getCompassDirection(pass.endAz),
            maxElevation: Math.round(pass.maxElevation),
            trajectory
          };
        });

      setUpcomingPasses(formattedPasses);
      setUserLoc(prev => ({ ...prev, loading: false }));
      setSearchStatus("");

    } catch (err) {
      setUserLoc(prev => ({ ...prev, loading: false, error: 'Pass calculations failed' }));
      setSearchStatus("");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-4 md:gap-6 relative z-10 font-sans">
      
      {/* MAP SECTION */}
      <div className="relative w-full aspect-[2/1] bg-black/20 rounded-[24px] md:rounded-[32px] border border-white/10 overflow-hidden shadow-2xl">
        <Space 
          lat={iss?.latitude || 0} 
          lng={iss?.longitude || 0} 
          isLoaded={isLoaded} 
          pulseKeyframes={pulseKeyframes}
          pulseTimes={pulseTimes}
          mapTiming={{ duration: cycleDuration, repeat: Infinity, ease: "linear" }}
          orbitData={orbitMapData}
          userLoc={userLoc}
        />
        <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl px-4 md:px-6 py-2 rounded-full border border-white/10 font-mono font-semibold text-[9px] md:text-[11px] text-white z-30 tracking-[0.15em] md:tracking-widest shadow-2xl whitespace-nowrap">
          {currentTimeDisplay || "CONNECTING..."}
        </div>
      </div>

      {/* LIVE STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatBox label="ALTITUDE" value={`${Math.round(iss?.altitude || 0)} km`} />
        <StatBox label="VELOCITY" value={`${Math.round(iss?.velocity || 0).toLocaleString('en-US')} km/h`} />
        <ListBox label="CREW" count={crew.length} items={crew.map(p => p.name)} />
        <ListBox label="DOCKED" count={docked.length} items={docked.map(d => d.name)} />
      </div>

      {/* LIFETIME HISTORICAL STATS */}
      <HistoricalStats />

      {/* LIVE LOCATION BAR (Ground Track) */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center p-4 md:p-5 bg-white/[0.02] border border-white/5 rounded-2xl font-mono text-[9px] md:text-[10px] gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
          <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
            <motion.div 
              animate={pulseKeyframes}
              transition={{ duration: cycleDuration, repeat: Infinity, ease: "linear", delay: 0.5, times: pulseTimes }}
              className="absolute w-full h-full bg-white/40 rounded-full"
            />
            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_12px_#fff] z-10" />
          </div>
          
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-white/40 uppercase tracking-[0.2em] flex-shrink-0 font-bold">Ground Track:</span>
            
            {/* Fluid animated container with smooth transitions */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${issGroundTrack.country}-${issGroundTrack.city}`}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="flex items-center gap-1.5 truncate"
              >
                <span className="text-white font-bold tracking-tight">{issGroundTrack.country}</span>
                <span className="text-[#00ffcc] font-bold mx-0.5">/</span>
                <span className="text-white/80 font-semibold tracking-tight">{issGroundTrack.city}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        
        <div className="text-white/30 tracking-widest uppercase border-t border-white/5 md:border-none pt-3 md:pt-0 w-full md:w-auto text-center font-medium">
          LAT: {iss?.latitude?.toFixed(4) || "0.0000"}° <span className="mx-2 text-white/10">//</span> LNG: {iss?.longitude?.toFixed(4) || "0.0000"}°
        </div>
      </div>

      {/* PREDICTION SECTION */}
      <div className="w-full flex flex-col gap-4 p-4 md:p-6 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-md">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter a city to compute exact visibility times..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/30 font-sans"
          />
          <button 
            type="submit" 
            disabled={userLoc.loading || !searchInput.trim()}
            className="bg-[#00ffcc]/10 hover:bg-[#00ffcc]/20 border border-[#00ffcc]/30 disabled:opacity-50 text-[#00ffcc] px-6 py-3 rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider transition-colors h-full flex-shrink-0 font-mono"
          >
            {userLoc.loading ? 'Calculating...' : 'Find Passes'}
          </button>
        </form>

        <div className="flex flex-col mt-2 min-h-[60px] justify-center">
          {userLoc.error ? (
            <span className="text-red-400 text-xs font-mono uppercase tracking-widest">{userLoc.error}</span>
          ) : searchStatus ? (
             <span className="text-white/60 text-xs font-mono uppercase tracking-widest animate-pulse">{searchStatus}</span>
          ) : userLoc.lat !== null ? (
            <div className="flex flex-col animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 bg-[#00ffcc]/5 border border-[#00ffcc]/20 p-3 rounded-xl">
                <span className="text-[#00ffcc] font-mono text-[11px] uppercase tracking-widest font-bold">
                  Naked-Eye Sightings for <span className="underline">{userLoc.name}</span> (Next 5 Days)
                </span>
                <span className="text-white/80 font-sans text-[10px] md:text-[11px] tracking-wider flex items-center gap-1.5 font-medium">
                  <span className="animate-bounce">👆</span> Click any pass below to open interactive sky trajectory
                </span>
              </div>
              
              {upcomingPasses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {upcomingPasses.map((pass, i) => (
                    <div 
                      key={i} 
                      onClick={() => setSelectedPass(pass)}
                      className="bg-black/50 p-4 rounded-xl border border-white/10 hover:border-[#00ffcc] hover:bg-[#00ffcc]/10 transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:scale-[1.02] active:scale-95 shadow-lg"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[#00ffcc] text-sm font-mono font-bold tracking-tight group-hover:text-white transition-colors">
                            {pass.startTime} - {pass.endTime}
                          </span>
                          <span className="text-white/40 text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">
                            {pass.durationText}
                          </span>
                        </div>
                        <div className="text-white/80 text-[10px] uppercase tracking-wider mb-3 font-mono font-bold">
                          {pass.date}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 font-mono pt-2 border-t border-white/10 text-[10px]">
                        <div className="flex justify-between text-white/60">
                          <span>Quality:</span>
                          <strong className="text-[#00ffcc]">{pass.quality}</strong>
                        </div>
                        <div className="flex justify-between text-white/60">
                          <span>Path:</span>
                          <strong className="text-white">{pass.startDir} ➔ {pass.endDir}</strong>
                        </div>
                        <div className="flex justify-between text-white/60">
                          <span>Peak Elevation:</span>
                          <strong className="text-white">{pass.maxElevation}°</strong>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 text-center text-[9px] font-mono uppercase tracking-widest text-[#00ffcc]/70 group-hover:text-[#00ffcc] transition-colors border-t border-white/5">
                        Click to view map & details →
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-1 p-4 bg-black/20 rounded-xl border border-white/5 text-center">
                  <span className="text-white/60 font-mono text-[11px] uppercase tracking-widest">
                    No naked-eye visible passes detected over {userLoc.name} in the next 5 days.
                  </span>
                  <span className="text-white/30 font-sans text-[10px]">
                    (ISS passes occurring during daylight or low horizon elevation under 10° are hidden)
                  </span>
                </div>
              )}
            </div>
          ) : (
            <span className="text-white/30 font-mono text-[10px] uppercase tracking-[0.2em] text-center">
              Enter a location above to compute visible ISS flyovers
            </span>
          )}
        </div>
      </div>
      
      {/* SIGHTING MAP MODAL */}
      <AnimatePresence>
        {selectedPass && (
          <PassMapModal 
            pass={selectedPass} 
            userLoc={userLoc} 
            onClose={() => setSelectedPass(null)} 
          />
        )}
      </AnimatePresence>

    </div>
  );
}

// --- Dynamic Pass Trajectory Modal Component ---
function PassMapModal({ pass, userLoc, onClose }) {
  if (!pass || !pass.trajectory || pass.trajectory.length === 0) return null;

  const ux = ((userLoc.lng + 180) / 360) * 100;
  const uy = ((90 - userLoc.lat) / 180) * 100;
  const V = 12;

  const startPt = pass.trajectory[0];
  const endPt = pass.trajectory[pass.trajectory.length - 1];
  const mapImage = "https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/144000/144898/BlackMarble_2016_01deg.jpg";

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-sans" 
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
        className="bg-[#05070a] border border-[#00ffcc]/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 flex justify-between items-center border-b border-white/10 bg-black/50">
          <div className="flex flex-col">
            <h3 className="text-[#00ffcc] font-mono text-sm uppercase tracking-widest font-bold">Local Orbit Sighting Breakdown</h3>
            <span className="text-white/50 text-[10px] font-mono uppercase tracking-widest">{userLoc.name} • {pass.date}</span>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center">
            ✕
          </button>
        </div>

        <div className="relative w-full h-64 md:h-80 bg-black overflow-hidden flex-shrink-0">
          <svg 
            viewBox={`${ux - V/2} ${uy - V/2} ${V} ${V}`} 
            className="w-full h-full object-cover select-none pointer-events-none opacity-90"
          >
            <image href={mapImage} x="-100" y="0" width="100" height="100" preserveAspectRatio="none" opacity="0.7" />
            <image href={mapImage} x="0" y="0" width="100" height="100" preserveAspectRatio="none" opacity="0.7" />
            <image href={mapImage} x="100" y="0" width="100" height="100" preserveAspectRatio="none" opacity="0.7" />

            <polyline 
              points={pass.trajectory.map(p => `${p.x},${p.y}`).join(' ')} 
              fill="none" stroke="#00ffcc" strokeWidth={V * 0.008} 
              strokeDasharray={`${V * 0.03},${V * 0.03}`} 
              opacity="0.8"
            />

            <circle cx={startPt.x} cy={startPt.y} r={V * 0.03} fill="#10b981" stroke="#05070a" strokeWidth={V * 0.005} />
            <circle cx={endPt.x} cy={endPt.y} r={V * 0.03} fill="#ef4444" stroke="#05070a" strokeWidth={V * 0.005} />

            <circle cx={ux} cy={uy} r={V * 0.02} fill="#fff" />
            <circle cx={ux} cy={uy} r={V * 0.08} fill="none" stroke="#fff" strokeWidth={V * 0.003} opacity="0.5" strokeDasharray={`${V * 0.02},${V * 0.02}`} />
          </svg>
          
          <div className="absolute bottom-3 right-3 bg-black/90 p-2.5 rounded-lg border border-white/10 text-[9px] md:text-[10px] font-mono text-white flex flex-col gap-1.5 backdrop-blur-xl">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-white rounded-full"></div> Observer Location</div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-[#10b981] rounded-full"></div> AOS (Appears Above Horizon)</div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-[#ef4444] rounded-full"></div> LOS (Disappears Below Horizon)</div>
          </div>
        </div>

        <div className="p-4 md:p-5 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 bg-black font-mono">
          <div className="flex flex-col gap-1 border-l-2 border-[#00ffcc] pl-3">
            <span className="text-white/40 text-[9px] uppercase tracking-widest font-bold">Visibility Window</span>
            <span className="text-[#00ffcc] text-xs md:text-sm font-bold">{pass.startTime} - {pass.endTime}</span>
            <span className="text-white/50 text-[9px]">Duration: {pass.durationText}</span>
          </div>
          <div className="flex flex-col gap-1 border-l-2 border-white/20 pl-3">
            <span className="text-white/40 text-[9px] uppercase tracking-widest font-bold">Trajectory Direction</span>
            <span className="text-white text-xs md:text-sm font-bold">{pass.startDir} ➔ {pass.endDir}</span>
            <span className="text-white/50 text-[9px]">Appears to Disappears</span>
          </div>
          <div className="flex flex-col gap-1 border-l-2 border-white/20 pl-3">
            <span className="text-white/40 text-[9px] uppercase tracking-widest font-bold">Peak Elevation</span>
            <span className="text-white text-xs md:text-sm font-bold">{pass.maxElevation}° Altitude</span>
            <span className="text-white/50 text-[9px]">Max Sky Height</span>
          </div>
          <div className="flex flex-col gap-1 border-l-2 border-white/20 pl-3">
            <span className="text-white/40 text-[9px] uppercase tracking-widest font-bold">Sighting Grade</span>
            <span className="text-[#00ffcc] text-xs md:text-sm font-bold">{pass.quality}</span>
            <span className="text-white/50 text-[9px]">Naked Eye Visibility</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Historical Stats Component ---
function HistoricalStats() {
  const [stats, setStats] = useState({ orbits: 0, days: 0 });

  useEffect(() => {
    const calculateStats = () => {
      const now = Date.now();
      const launchDate = new Date('1998-11-20T06:40:00Z').getTime();
      const totalOrbits = Math.floor((now - launchDate) / (92.68 * 60 * 1000));
      const occupancyDate = new Date('2000-11-02T09:21:00Z').getTime();
      const totalDaysInhabited = Math.floor((now - occupancyDate) / (24 * 60 * 60 * 1000));

      setStats({ orbits: totalOrbits, days: totalDaysInhabited });
    };

    calculateStats();
    const interval = setInterval(calculateStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col gap-4 p-4 md:p-6 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-md font-sans">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1.5 h-1.5 bg-[#00ffcc]/50 rounded-full" />
        <span className="text-white/40 font-mono text-[10px] uppercase tracking-[0.2em] font-semibold">
          Lifetime Mission Archive
        </span>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatBox label="TOTAL ORBITS" value={stats.orbits.toLocaleString('en-US')} />
        <StatBox label="DAYS INHABITED" value={stats.days.toLocaleString('en-US')} />
        <StatBox label="TOTAL VISITORS" value="280+" />
        <StatBox label="EXPEDITIONS" value="76" />
      </div>
    </div>
  );
}

// --- Reusable UI Elements ---
function StatBox({ label, value }) {
  return (
    <div className="bg-black/20 border border-white/5 p-4 md:p-6 rounded-2xl text-center hover:bg-white/[0.04] transition-colors group cursor-default">
      <p className="text-[8px] md:text-[9px] font-mono uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/40 mb-1 md:mb-2 group-hover:text-white/60 transition-colors font-bold">
        {label}
      </p>
      <p className="text-lg md:text-2xl font-mono font-light text-white truncate tracking-tight">
        {value}
      </p>
    </div>
  );
}

function ListBox({ label, count, items }) {
  return (
    <div className="bg-white/[0.01] border border-white/5 h-24 md:h-32 rounded-2xl group relative overflow-hidden hover:bg-white/[0.03] transition-colors cursor-default">
      <div className="h-full flex flex-col items-center justify-center group-hover:opacity-0 transition-opacity duration-300">
        <p className="text-[8px] md:text-[9px] font-mono uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/40 mb-1 md:mb-2 font-bold">{label}</p>
        <p className="text-lg md:text-2xl font-mono font-light text-white">{count}</p>
      </div>
      
      <div className="absolute inset-0 bg-[#05070a]/95 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-3">
        <p className="text-[7px] md:text-[8px] font-mono font-bold text-white uppercase tracking-widest text-center border-b border-white/10 pb-1 mb-2">
          {label} DETAILS
        </p>
        <div className="overflow-y-auto scrollbar-hide space-y-1">
          {items.length > 0 ? items.map((item, i) => (
            <p key={i} className="text-[9px] md:text-[10px] font-sans text-white/70 uppercase tracking-tight truncate">• {item}</p>
          )) : <p className="text-[9px] font-mono text-white/20 text-center">No Data</p>}
        </div>
      </div>
    </div>
  );
}