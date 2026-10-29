import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as satellite from 'satellite.js';
import Space from './Space';

const sunEl = (d, lat, lon) => {
  const days =
    (d.getTime() - new Date(Date.UTC(2000, 0, 1, 12, 0, 0)).getTime()) /
    86400000.0;
  const r = Math.PI / 180;
  const g = (357.528 + 0.9856003 * days) % 360;
  const L = (280.46 + 0.9856474 * days) % 360;
  const eps = 23.439 - 0.0000004 * days;
  const lam = L + 1.915 * Math.sin(g * r) + 0.02 * Math.sin(2 * g * r);

  const dec = Math.asin(Math.sin(eps * r) * Math.sin(lam * r));
  const ra = Math.atan2(
    Math.cos(eps * r) * Math.sin(lam * r),
    Math.cos(lam * r)
  );
  const gmst = (18.697374558 + 24.06570982441908 * days) % 24;
  const ha = (gmst * 15 + lon) * r - ra;

  return (
    Math.asin(
      Math.sin(lat * r) * Math.sin(dec) +
        Math.cos(lat * r) * Math.cos(dec) * Math.cos(ha)
    ) / r
  );
};

const getSea = (lat, lon) => {
  if (
    lat >= 30 &&
    lat <= 46 &&
    lon >= -6 &&
    lon <= 36 &&
    !(lat >= 40.5 && lon >= 27)
  )
    return 'MEDITERRANEAN SEA';
  if (lat >= 40.5 && lat <= 47.5 && lon >= 27 && lon <= 42) return 'BLACK SEA';
  if (lat >= 36.5 && lat <= 47.2 && lon >= 46.5 && lon <= 54.5)
    return 'CASPIAN SEA';
  if (lat >= 12.5 && lat <= 30 && lon >= 32 && lon <= 44) return 'RED SEA';
  if (lat >= 23.5 && lat <= 30.5 && lon >= 47.5 && lon <= 56.5)
    return 'PERSIAN GULF';
  if (lat >= 18 && lat <= 30.5 && lon >= -98 && lon <= -81)
    return 'GULF OF MEXICO';
  if (lat >= 9 && lat <= 22 && lon >= -88 && lon <= -60) return 'CARIBBEAN SEA';
  if (lat >= 51 && lat <= 64 && lon >= -95 && lon <= -77) return 'HUDSON BAY';
  if (lat >= 51 && lat <= 62 && lon >= -4 && lon <= 9) return 'NORTH SEA';
  if (lat >= 53.5 && lat <= 66 && lon >= 9.5 && lon <= 30) return 'BALTIC SEA';
  if (lat >= 62 && lat <= 71 && lon >= -10 && lon <= 16) return 'NORWEGIAN SEA';
  if (lat >= 51.5 && lat <= 66 && (lon >= 162 || lon <= -157))
    return 'BERING SEA';
  if (lat >= 44 && lat <= 62 && lon >= 135 && lon <= 160)
    return 'SEA OF OKHOTSK';
  if (lat >= 33 && lat <= 52 && lon >= 127 && lon <= 142) return 'SEA OF JAPAN';
  if (lat >= 24 && lat <= 34 && lon >= 120 && lon <= 130)
    return 'EAST CHINA SEA';
  if (lat >= 0 && lat <= 24 && lon >= 105 && lon <= 121)
    return 'SOUTH CHINA SEA';
  if (lat >= 5 && lat <= 31 && lon >= 122 && lon <= 145)
    return 'PHILIPPINE SEA';
  if (lat >= -9 && lat <= 0 && lon >= 106 && lon <= 132) return 'JAVA SEA';
  if (lat >= -30 && lat <= -10 && lon >= 142 && lon <= 170) return 'CORAL SEA';
  if (lat >= -47 && lat <= -30 && lon >= 147 && lon <= 175) return 'TASMAN SEA';
  if (lat >= 5 && lat <= 25 && lon >= 50 && lon <= 77) return 'ARABIAN SEA';
  if (lat >= 5 && lat <= 22 && lon >= 78 && lon <= 99) return 'BAY OF BENGAL';
  if (lat >= -5 && lat <= 6 && lon >= -10 && lon <= 10) return 'GULF OF GUINEA';
  if (lat >= -63 && lat <= -52 && lon >= -70 && lon <= -25) return 'SCOTIA SEA';

  if (lat > 66.5) return 'ARCTIC OCEAN';
  if (lat < -60) return 'SOUTHERN OCEAN';
  if (lon >= 20 && lon <= 146.5 && lat <= 30) return 'INDIAN OCEAN';

  const nAtl =
    lat >= 0 &&
    ((lat < 9 && lon >= -75 && lon < 20) ||
      (lat >= 9 && lat < 18 && lon >= -85 && lon < 20) ||
      (lat >= 18 && lon >= -98 && lon < 20));
  if (nAtl) return 'NORTH ATLANTIC OCEAN';
  if (lat < 0 && lon >= -67.5 && lon < 20) return 'SOUTH ATLANTIC OCEAN';

  return lat >= 0 ? 'NORTH PACIFIC OCEAN' : 'SOUTH PACIFIC OCEAN';
};

export default function ISSTracker() {
  const [iss, setIss] = useState({
    latitude: 0,
    longitude: 0,
    altitude: 0,
    velocity: 0,
  });
  const [docked, setDocked] = useState([]);
  const [crew, setCrew] = useState([]);
  const [track, setTrack] = useState({
    country: 'SEARCHING SIGNAL...',
    city: 'LOCATING',
  });
  const [loaded, setLoaded] = useState(false);
  const [orbit, setOrbit] = useState([]);

  const [tz, setTz] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [timeStr, setTimeStr] = useState('');
  const [q, setQ] = useState('');
  const [loc, setLoc] = useState({
    name: '',
    lat: null,
    lng: null,
    loading: false,
    error: '',
  });
  const [passes, setPasses] = useState([]);
  const [status, setStatus] = useState('');
  const [selPass, setSelPass] = useState(null);

  const pTimes = [0, 0.05, 0.15, 1];
  const pKeys = { scale: [1, 2.2, 2.2], opacity: [0, 1, 1, 0] };
  const dur = 3;

  useEffect(() => {
    const t = setInterval(() => {
      try {
        const s = new Date().toLocaleString('en-US', {
          timeZone: tz,
          weekday: 'short',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short',
        });
        setTimeStr(s.toUpperCase());
      } catch (e) {
        setTimeStr('TIME SYNC ERROR');
      }
    }, 1000);
    return () => clearInterval(t);
  }, [tz]);

  const getOrbit = async () => {
    try {
      const res = await fetch(
        'https://api.wheretheiss.at/v1/satellites/25544/tles'
      );
      const d = await res.json();
      const sat = satellite.twoline2satrec(d.line1, d.line2);
      const now = new Date();
      const pts = [];

      for (let i = -46; i <= 138; i += 0.25) {
        const t = new Date(now.getTime() + i * 60000);
        const pv = satellite.propagate(sat, t);
        if (!pv.position) continue;

        const gd = satellite.eciToGeodetic(pv.position, satellite.gstime(t));
        const lat = satellite.radiansToDegrees(gd.latitude);
        const lng = satellite.radiansToDegrees(gd.longitude);

        pts.push({
          lat,
          lng,
          x: ((lng + 180) / 360) * 100,
          y: ((90 - lat) / 180) * 100,
        });
      }

      // wrap around map edge
      const out = [];
      for (let idx = 0; idx < pts.length; idx = idx + 1) {
        const cur = pts[idx];
        if (idx > 0) {
          const prev = pts[idx - 1];
          if (prev.x > 90 && cur.x < 10) {
            const iy = prev.y + (cur.y - prev.y) / 2;
            out.push({ ...prev, x: 100, y: iy }, { ...cur, x: 0, y: iy });
          } else if (prev.x < 10 && cur.x > 90) {
            const iy = prev.y + (cur.y - prev.y) / 2;
            out.push({ ...prev, x: 0, y: iy }, { ...cur, x: 100, y: iy });
          }
        }
        out.push(cur);
      }
      setOrbit(out);
    } catch (e) {
      console.error('Failed to calculate orbit trajectory:', e);
    }
  };

  useEffect(() => {
    getOrbit();
    const poll = async () => {
      try {
        const res = await fetch(
          'https://api.wheretheiss.at/v1/satellites/25544'
        );
        if (!res.ok) return;
        const val = await res.json();

        if (val && !(val.latitude === undefined)) {
          setIss(val);
          setLoaded(true);

          try {
            const gRes = await fetch(
              `https://api.wheretheiss.at/v1/coordinates/${val.latitude.toFixed(4)},${val.longitude.toFixed(4)}`
            );
            const gd = await gRes.json();
            const cc = gd?.country_code;

            if (cc && cc !== 'none' && !cc.includes('?')) {
              let cName = cc;
              try {
                cName =
                  new Intl.DisplayNames(['en'], { type: 'region' }).of(
                    cc.toUpperCase()
                  ) || cc;
              } catch (e) {}

              let city = 'OVERLAND';
              try {
                const cRes = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${val.latitude.toFixed(4)}&lon=${val.longitude.toFixed(4)}&zoom=8`
                );
                const cd = await cRes.json();
                if (cd?.address) {
                  city =
                    cd.address.city ||
                    cd.address.town ||
                    cd.address.village ||
                    cd.address.county ||
                    cd.address.state ||
                    'OVERLAND';
                }
              } catch (e) {}

              setTrack({
                country: cName.toUpperCase(),
                city: city.toUpperCase(),
              });
            } else {
              let sea = null;
              try {
                const mRes = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${val.latitude.toFixed(4)}&longitude=${val.longitude.toFixed(4)}&localityLanguage=en`
                );
                const md = await mRes.json();
                const info = md?.localityInfo?.informative || [];
                const rx =
                  /ocean|sea|gulf|bay|strait|channel|bight|sound|passage|basin/i;
                for (let i = info.length - 1; i >= 0; i--) {
                  if (
                    rx.test(info[i].name || '') ||
                    rx.test(info[i].description || '')
                  ) {
                    sea = info[i].name.toUpperCase();
                    break;
                  }
                }
              } catch (e) {}
              setTrack({
                country: 'OCEAN',
                city: sea || getSea(val.latitude, val.longitude),
              });
            }
          } catch (e) {
            setTrack({
              country: 'OCEAN',
              city: getSea(val.latitude, val.longitude),
            });
          }
        }

        fetch(
          'https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json'
        )
          .then((r) => r.json())
          .then((d) => setCrew(d?.people || []))
          .catch(() => {});
        fetch(
          'https://corquaid.github.io/international-space-station-APIs/JSON/iss-docked-spacecraft.json'
        )
          .then((r) => r.json())
          .then((d) => setDocked(d?.spacecraft || []))
          .catch(() => {});
      } catch (e) {
        setTrack({ country: 'CONNECTION LOST', city: 'OFFLINE' });
      }
    };

    poll();
    const t1 = setInterval(poll, 5000);
    const t2 = setInterval(getOrbit, 120000);
    return () => {
      clearInterval(t1);
      clearInterval(t2);
    };
  }, []);

  const onSearch = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setLoc((p) => ({ ...p, loading: true, error: '' }));
    setPasses([]);

    try {
      setStatus('Resolving location coordinates...');
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`
      );
      const arr = await res.json();

      if (!arr || arr.length === 0) {
        setLoc((p) => ({ ...p, loading: false, error: 'Location not found' }));
        setStatus('');
        return;
      }

      const uLat = parseFloat(arr[0].lat);
      const uLng = parseFloat(arr[0].lon);
      const obs = {
        longitude: satellite.degreesToRadians(uLng),
        latitude: satellite.degreesToRadians(uLat),
        height: 0,
      };

      let nextTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      try {
        const tzRes = await fetch(
          `https://api.wheretheiss.at/v1/coordinates/${uLat.toFixed(4)},${uLng.toFixed(4)}`
        );
        const tzData = await tzRes.json();
        if (tzData && tzData.timezone_id) nextTz = tzData.timezone_id;
      } catch (err) {}

      setTz(nextTz);
      setLoc({
        lat: uLat,
        lng: uLng,
        name: arr[0].display_name.split(',')[0],
        loading: true,
        error: '',
      });
      setStatus('Computing 5-day visible orbital trajectories...');

      const tleRes = await fetch(
        'https://api.wheretheiss.at/v1/satellites/25544/tles'
      );
      const tle = await tleRes.json();
      const sat = satellite.twoline2satrec(tle.line1, tle.line2);

      const raw = [];
      let cur = null;
      const now = new Date();

      for (let i = 0; i < 5 * 24 * 60; i = i + 1) {
        const d = new Date(now.getTime() + i * 60000);
        const pv = satellite.propagate(sat, d);
        if (!pv.position) continue;

        const gmst = satellite.gstime(d);
        const gd = satellite.eciToGeodetic(pv.position, gmst);
        const look = satellite.ecfToLookAngles(
          obs,
          satellite.eciToEcf(pv.position, gmst)
        );

        const el = satellite.radiansToDegrees(look.elevation);
        const az = satellite.radiansToDegrees(look.azimuth);
        const oSun = sunEl(d, uLat, uLng);
        const iSun = sunEl(
          d,
          satellite.radiansToDegrees(gd.latitude),
          satellite.radiansToDegrees(gd.longitude)
        );

        if (el >= 10 && oSun <= -6 && iSun >= -21) {
          if (!cur) {
            cur = {
              startTime: d,
              startAz: az,
              maxElevation: el,
              maxAz: az,
              points: 1,
            };
          }
          if (el > cur.maxElevation) cur.maxElevation = el;
          cur.endTime = d;
          cur.endAz = az;
          cur.points = cur.points + 1;
        } else if (cur) {
          if (cur.points >= 2 && cur.maxElevation >= 10) raw.push(cur);
          cur = null;
        }
      }

      if (cur && cur.points >= 2 && cur.maxElevation >= 10) raw.push(cur);

      const dirs = [
        'N',
        'NNE',
        'NE',
        'ENE',
        'E',
        'ESE',
        'SE',
        'SSE',
        'S',
        'SSW',
        'SW',
        'WSW',
        'W',
        'WNW',
        'NW',
        'NNW',
      ];

      const out = raw
        .filter((p) => p.maxElevation >= 10)
        .map((p) => {
          const sec = Math.round(
            (p.endTime.getTime() - p.startTime.getTime()) / 1000
          );
          const m = Math.floor(sec / 60);
          const s = sec % 60;

          let qStr = 'Low Horizon Pass';
          if (p.maxElevation >= 50) qStr = 'Excellent (Very Bright)';
          else if (p.maxElevation >= 25) qStr = 'Good Visibility';

          const traj = [];
          const ux = (uLng + 180) / 3.6;

          for (
            let t = p.startTime.getTime();
            t <= p.endTime.getTime();
            t += 10000
          ) {
            const d = new Date(t);
            const pv = satellite.propagate(sat, d);
            if (pv.position) {
              const gd = satellite.eciToGeodetic(
                pv.position,
                satellite.gstime(d)
              );
              const tLat = satellite.radiansToDegrees(gd.latitude);
              const tLng = satellite.radiansToDegrees(gd.longitude);

              let x = (tLng + 180) / 3.6;
              const y = (90 - tLat) / 1.8;
              if (x - ux > 50) x -= 100;
              if (x - ux < -50) x += 100;

              traj.push({ x, y, lat: tLat, lng: tLng });
            }
          }

          return {
            date: p.startTime.toLocaleDateString('en-US', {
              timeZone: nextTz,
              month: 'short',
              day: 'numeric',
              weekday: 'short',
            }),
            startTime: p.startTime.toLocaleTimeString('en-US', {
              timeZone: nextTz,
              hour: '2-digit',
              minute: '2-digit',
            }),
            endTime: p.endTime.toLocaleTimeString('en-US', {
              timeZone: nextTz,
              hour: '2-digit',
              minute: '2-digit',
            }),
            durationText: m > 0 ? `${m}m ${s}s` : `${s}s`,
            quality: qStr,
            startDir: dirs[Math.round(p.startAz / 22.5) % 16],
            endDir: dirs[Math.round(p.endAz / 22.5) % 16],
            maxElevation: Math.round(p.maxElevation),
            trajectory: traj,
          };
        });

      setPasses(out);
      setLoc((p) => ({ ...p, loading: false }));
      setStatus('');
    } catch (err) {
      setLoc((p) => ({
        ...p,
        loading: false,
        error: 'Pass calculations failed',
      }));
      setStatus('');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-4 md:gap-6 relative z-10 font-sans">
      <div className="relative w-full aspect-[2/1] bg-black/20 rounded-[24px] md:rounded-[32px] border border-white/10 overflow-hidden shadow-2xl">
        <Space
          lat={iss?.latitude || 0}
          lng={iss?.longitude || 0}
          isLoaded={loaded}
          pulseKeyframes={pKeys}
          pulseTimes={pTimes}
          mapTiming={{ duration: dur, repeat: Infinity, ease: 'linear' }}
          orbitData={orbit}
          userLoc={loc}
        />
        <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl px-4 md:px-6 py-2 rounded-full border border-white/10 font-mono font-semibold text-[9px] md:text-[11px] text-white z-30 tracking-[0.15em] md:tracking-widest shadow-2xl whitespace-nowrap">
          {timeStr || 'CONNECTING...'}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatBox
          label="ALTITUDE"
          value={`${Math.round(iss?.altitude || 0)} km`}
        />
        <StatBox
          label="VELOCITY"
          value={`${Math.round(iss?.velocity || 0).toLocaleString('en-US')} km/h`}
        />
        <ListBox
          label="CREW"
          count={crew.length}
          items={crew.map((p) => p.name)}
        />
        <ListBox
          label="DOCKED"
          count={docked.length}
          items={docked.map((d) => d.name)}
        />
      </div>

      <HistoricalStats />

      <div className="w-full flex flex-col md:flex-row justify-between items-center p-4 md:p-5 bg-white/[0.02] border border-white/5 rounded-2xl font-mono text-[9px] md:text-[10px] gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
          <div className="relative flex items-center justify-center w-5 h-5 flex-shrink-0">
            <motion.div
              animate={pKeys}
              transition={{
                duration: dur,
                repeat: Infinity,
                ease: 'linear',
                delay: 0.5,
                times: pTimes,
              }}
              className="absolute w-full h-full bg-white/40 rounded-full"
            />
            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_12px_#fff] z-10" />
          </div>

          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-white/40 uppercase tracking-[0.2em] flex-shrink-0 font-bold">
              Ground Track:
            </span>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${track.country}-${track.city}`}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="flex items-center gap-1.5 truncate"
              >
                <span className="text-white font-bold tracking-tight">
                  {track.country}
                </span>
                <span className="text-[#00ffcc] font-bold mx-0.5">/</span>
                <span className="text-white/80 font-semibold tracking-tight">
                  {track.city}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="text-white/30 tracking-widest uppercase border-t border-white/5 md:border-none pt-3 md:pt-0 w-full md:w-auto text-center font-medium">
          LAT: {iss?.latitude?.toFixed(4) || '0.0000'}°{' '}
          <span className="mx-2 text-white/10">//</span> LNG:{' '}
          {iss?.longitude?.toFixed(4) || '0.0000'}°
        </div>
      </div>

      <div className="w-full flex flex-col gap-4 p-4 md:p-6 bg-white/[0.02] border border-white/5 rounded-2xl backdrop-blur-md">
        <form onSubmit={onSearch} className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter a city to compute exact visibility times..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/30 font-sans"
          />
          <button
            type="submit"
            disabled={loc.loading || !q.trim()}
            className="bg-[#00ffcc]/10 hover:bg-[#00ffcc]/20 border border-[#00ffcc]/30 disabled:opacity-50 text-[#00ffcc] px-6 py-3 rounded-lg text-xs md:text-sm font-bold uppercase tracking-wider transition-colors h-full flex-shrink-0 font-mono"
          >
            {loc.loading ? 'Calculating...' : 'Find Passes'}
          </button>
        </form>

        <div className="flex flex-col mt-2 min-h-[60px] justify-center">
          {loc.error ? (
            <span className="text-red-400 text-xs font-mono uppercase tracking-widest">
              {loc.error}
            </span>
          ) : status ? (
            <span className="text-white/60 text-xs font-mono uppercase tracking-widest animate-pulse">
              {status}
            </span>
          ) : !(loc.lat === null) ? (
            <div className="flex flex-col animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 bg-[#00ffcc]/5 border border-[#00ffcc]/20 p-3 rounded-xl">
                <span className="text-[#00ffcc] font-mono text-[11px] uppercase tracking-widest font-bold">
                  Naked-Eye Sightings for{' '}
                  <span className="underline">{loc.name}</span> (Next 5 Days)
                </span>
                <span className="text-white/80 font-sans text-[10px] md:text-[11px] tracking-wider flex items-center gap-1.5 font-medium">
                  <span className="animate-bounce">👆</span> Click any pass
                  below to open interactive sky trajectory
                </span>
              </div>

              {passes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                  {passes.map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelPass(p)}
                      className="bg-black/50 p-4 rounded-xl border border-white/10 hover:border-[#00ffcc] hover:bg-[#00ffcc]/10 transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:scale-[1.02] active:scale-95 shadow-lg"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[#00ffcc] text-sm font-mono font-bold tracking-tight group-hover:text-white transition-colors">
                            {p.startTime} - {p.endTime}
                          </span>
                          <span className="text-white/40 text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10">
                            {p.durationText}
                          </span>
                        </div>
                        <div className="text-white/80 text-[10px] uppercase tracking-wider mb-3 font-mono font-bold">
                          {p.date}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 font-mono pt-2 border-t border-white/10 text-[10px]">
                        <div className="flex justify-between text-white/60">
                          <span>Quality:</span>
                          <strong className="text-[#00ffcc]">
                            {p.quality}
                          </strong>
                        </div>
                        <div className="flex justify-between text-white/60">
                          <span>Path:</span>
                          <strong className="text-white">
                            {p.startDir} ➔ {p.endDir}
                          </strong>
                        </div>
                        <div className="flex justify-between text-white/60">
                          <span>Peak Elevation:</span>
                          <strong className="text-white">
                            {p.maxElevation}°
                          </strong>
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
                    No naked-eye visible passes detected over {loc.name} in the
                    next 5 days.
                  </span>
                  <span className="text-white/30 font-sans text-[10px]">
                    (ISS passes occurring during daylight or low horizon
                    elevation under 10° are hidden)
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

      <AnimatePresence>
        {selPass && (
          <PassMapModal
            pass={selPass}
            userLoc={loc}
            onClose={() => setSelPass(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PassMapModal({ pass, userLoc, onClose }) {
  if (!pass || !pass.trajectory || pass.trajectory.length === 0) return null;

  const V = 12;
  const ux = ((userLoc.lng + 180) / 360) * 100;
  const uy = ((90 - userLoc.lat) / 180) * 100;
  const p0 = pass.trajectory[0];
  const p1 = pass.trajectory[pass.trajectory.length - 1];
  const img =
    'https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/144000/144898/BlackMarble_2016_01deg.jpg';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-sans"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, scale: 0.95 }}
        className="bg-[#05070a] border border-[#00ffcc]/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 flex justify-between items-center border-b border-white/10 bg-black/50">
          <div className="flex flex-col">
            <h3 className="text-[#00ffcc] font-mono text-sm uppercase tracking-widest font-bold">
              Local Orbit Sighting Breakdown
            </h3>
            <span className="text-white/50 text-[10px] font-mono uppercase tracking-widest">
              {userLoc.name} — {pass.date}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="relative w-full h-64 md:h-80 bg-black overflow-hidden flex-shrink-0">
          <svg
            viewBox={`${ux - V / 2} ${uy - V / 2} ${V} ${V}`}
            className="w-full h-full object-cover select-none pointer-events-none opacity-90"
          >
            <image
              href={img}
              x="-100"
              y="0"
              width="100"
              height="100"
              preserveAspectRatio="none"
              opacity="0.7"
            />
            <image
              href={img}
              x="0"
              y="0"
              width="100"
              height="100"
              preserveAspectRatio="none"
              opacity="0.7"
            />
            <image
              href={img}
              x="100"
              y="0"
              width="100"
              height="100"
              preserveAspectRatio="none"
              opacity="0.7"
            />

            <polyline
              points={pass.trajectory.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="#00ffcc"
              strokeWidth={V * 0.008}
              strokeDasharray={`${V * 0.03},${V * 0.03}`}
              opacity="0.8"
            />

            <circle
              cx={p0.x}
              cy={p0.y}
              r={V * 0.03}
              fill="#10b981"
              stroke="#05070a"
              strokeWidth={V * 0.005}
            />
            <circle
              cx={p1.x}
              cy={p1.y}
              r={V * 0.03}
              fill="#ef4444"
              stroke="#05070a"
              strokeWidth={V * 0.005}
            />
            <circle cx={ux} cy={uy} r={V * 0.02} fill="#fff" />
            <circle
              cx={ux}
              cy={uy}
              r={V * 0.08}
              fill="none"
              stroke="#fff"
              strokeWidth={V * 0.003}
              opacity="0.5"
              strokeDasharray={`${V * 0.02},${V * 0.02}`}
            />
          </svg>

          <div className="absolute bottom-3 right-3 bg-black/90 p-2.5 rounded-lg border border-white/10 text-[9px] md:text-[10px] font-mono text-white flex flex-col gap-1.5 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-white rounded-full"></div> Observer
              Location
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#10b981] rounded-full"></div> AOS
              (Appears Above Horizon)
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#ef4444] rounded-full"></div> LOS
              (Disappears Below Horizon)
            </div>
          </div>
        </div>

        <div className="p-4 md:p-5 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 bg-black font-mono">
          <div className="flex flex-col gap-1 border-l-2 border-[#00ffcc] pl-3">
            <span className="text-white/40 text-[9px] uppercase tracking-widest font-bold">
              Visibility Window
            </span>
            <span className="text-[#00ffcc] text-xs md:text-sm font-bold">
              {pass.startTime} - {pass.endTime}
            </span>
            <span className="text-white/50 text-[9px]">
              Duration: {pass.durationText}
            </span>
          </div>
          <div className="flex flex-col gap-1 border-l-2 border-white/20 pl-3">
            <span className="text-white/40 text-[9px] uppercase tracking-widest font-bold">
              Trajectory Direction
            </span>
            <span className="text-white text-xs md:text-sm font-bold">
              {pass.startDir} ➔ {pass.endDir}
            </span>
            <span className="text-white/50 text-[9px]">
              Appears to Disappears
            </span>
          </div>
          <div className="flex flex-col gap-1 border-l-2 border-white/20 pl-3">
            <span className="text-white/40 text-[9px] uppercase tracking-widest font-bold">
              Peak Elevation
            </span>
            <span className="text-white text-xs md:text-sm font-bold">
              {pass.maxElevation}° Altitude
            </span>
            <span className="text-white/50 text-[9px]">Max Sky Height</span>
          </div>
          <div className="flex flex-col gap-1 border-l-2 border-white/20 pl-3">
            <span className="text-white/40 text-[9px] uppercase tracking-widest font-bold">
              Sighting Grade
            </span>
            <span className="text-[#00ffcc] text-xs md:text-sm font-bold">
              {pass.quality}
            </span>
            <span className="text-white/50 text-[9px]">Eye Visibility</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function HistoricalStats() {
  const [st, setSt] = useState({ orbits: 0, days: 0 });

  useEffect(() => {
    const calc = () => {
      const now = Date.now();
      const t0 = new Date('1998-11-20T06:40:00Z').getTime();
      const t1 = new Date('2000-11-02T09:21:00Z').getTime();
      setSt({
        orbits: Math.floor((now - t0) / (92.68 * 60 * 1000)),
        days: Math.floor((now - t1) / 86400000),
      });
    };
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
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
        <StatBox
          label="TOTAL ORBITS"
          value={st.orbits.toLocaleString('en-US')}
        />
        <StatBox
          label="DAYS INHABITED"
          value={st.days.toLocaleString('en-US')}
        />
        <StatBox label="TOTAL VISITORS" value="280+" />
        <StatBox label="EXPEDITIONS" value="76" />
      </div>
    </div>
  );
}

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
        <p className="text-[8px] md:text-[9px] font-mono uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/40 mb-1 md:mb-2 font-bold">
          {label}
        </p>
        <p className="text-lg md:text-2xl font-mono font-light text-white">
          {count}
        </p>
      </div>

      <div className="absolute inset-0 bg-[#05070a]/95 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col p-3">
        <p className="text-[7px] md:text-[8px] font-mono font-bold text-white uppercase tracking-widest text-center border-b border-white/10 pb-1 mb-2">
          {label} DETAILS
        </p>
        <div className="overflow-y-auto scrollbar-hide space-y-1">
          {items.length > 0 ? (
            items.map((val, i) => (
              <p
                key={i}
                className="text-[9px] md:text-[10px] font-sans text-white/70 uppercase tracking-tight truncate"
              >
                • {val}
              </p>
            ))
          ) : (
            <p className="text-[9px] font-mono text-white/20 text-center">
              No Data
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
