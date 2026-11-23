import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LL2_MIRRORS = [
  'https://ll.thespacedevs.com/2.2.0/launch',
  'https://lldev.thespacedevs.com/2.2.0/launch',
];
const CACHE_KEY = 'iss_ll2_prog17_v12';
const CACHE_TTL = 30 * 60 * 1000;
const SECTION_LIMIT = 6;

const NASA_ASSETS = {
  crew13: 'https://images-assets.nasa.gov/image/NHQ202610010027/NHQ202610010027~orig.jpg',
  crew12: 'https://images-assets.nasa.gov/image/NHQ202610080024/NHQ202610080024~orig.jpg',
  crew11: 'https://images-assets.nasa.gov/image/NHQ202508010019/NHQ202508010019~orig.jpg',
  crew9: 'https://images-assets.nasa.gov/image/NHQ202409280010/NHQ202409280010~orig.jpg',
  crs35: 'https://images-assets.nasa.gov/image/KSC-20261013-PH-BWW01_0001/KSC-20261013-PH-BWW01_0001~orig.jpg',
  crs34: 'https://images-assets.nasa.gov/image/iss074e0603650/iss074e0603650~orig.jpg',
  dragonPad: 'https://images-assets.nasa.gov/image/KSC-20201202-PH-SPX01_0003/KSC-20201202-PH-SPX01_0003~orig.jpg',
  soyuzPad: 'https://images-assets.nasa.gov/image/NHQ202607110051/NHQ202607110051~orig.jpg',
  soyuzRollout: 'https://images-assets.nasa.gov/image/NHQ202607110033/NHQ202607110033~orig.jpg',
  soyuzOrbit: 'https://images-assets.nasa.gov/image/iss073e1231962/iss073e1231962~orig.jpg',
  progress35: 'https://images-assets.nasa.gov/image/iss075e0120834/iss075e0120834~orig.jpg',
  progressOrbit: 'https://images-assets.nasa.gov/image/iss074e0409137/iss074e0409137~orig.jpg',
  cygnusCapture: 'https://images-assets.nasa.gov/image/iss069e053962/iss069e053962~orig.jpg',
  cygnusBerth: 'https://images-assets.nasa.gov/image/iss069e004825/iss069e004825~orig.jpg',
  htvApproach: 'https://images-assets.nasa.gov/image/iss073e1045697/iss073e1045697~orig.jpg',
  htvCapture: 'https://images-assets.nasa.gov/image/iss074e0365023/iss074e0365023~orig.jpg',
};

const FALLBACK_SVG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 260' fill='none'><rect width='400' height='260' fill='%23090d16'/><circle cx='200' cy='130' r='90' stroke='%2300ffcc' stroke-opacity='0.14' stroke-width='1' stroke-dasharray='4 4'/><path d='M200 45 C218 75 222 120 222 165 L178 165 C178 120 182 75 200 45 Z' stroke='%2300ffcc' stroke-width='2' fill='%2300ffcc' fill-opacity='0.08'/><path d='M178 140 L158 175 L178 165 Z M222 140 L242 175 L222 165 Z' stroke='%2300ffcc' stroke-width='1.5' fill='%2300ffcc' fill-opacity='0.15'/><circle cx='200' cy='100' r='8' stroke='%23ffd700' stroke-width='1.5'/></svg>";

// ordered extractors prevent "CRS-2" contract labels from colliding with SpX-35 or NG-24
const KEY_EXTRACTORS = [
  [/\bcrew-(\d+)\b/i, (m) => `crew-${m[1]}`],
  [/\bspx-(\d+)\b/i, (m) => `crs-${m[1]}`],
  [/\bcrs-(\d{2,})\b/i, (m) => `crs-${m[1]}`],
  [/\bsoyuz\s+ms-(\d+)\b/i, (m) => `soyuz-ms-${m[1]}`],
  [/\bprogress\s+ms-(\d+)\b/i, (m) => `progress-ms-${m[1]}`],
  [/\bng-(\d+)\b/i, (m) => `ng-${m[1]}`],
  [/\bhtv-x(\d+)\b/i, (m) => `htv-x${m[1]}`],
  [/\bax-(\d+)\b/i, (m) => `ax-${m[1]}`],
  [/\bsts-(\d+)\b/i, (m) => `sts-${m[1]}`],
];

const MEDIA_MAP = [
  [/crew-13/i, NASA_ASSETS.crew13, NASA_ASSETS.crew11],
  [/crew-12/i, NASA_ASSETS.crew12, NASA_ASSETS.crew11],
  [/crew-11/i, NASA_ASSETS.crew11, NASA_ASSETS.crew9],
  [/crew|ax-|axiom|starliner/i, NASA_ASSETS.crew11, NASA_ASSETS.crew9],
  [/crs-35|spx-35/i, NASA_ASSETS.crs35, NASA_ASSETS.dragonPad],
  [/crs-34|spx-34/i, NASA_ASSETS.crs34, NASA_ASSETS.dragonPad],
  [/crs|spx-|cargo dragon/i, NASA_ASSETS.dragonPad, NASA_ASSETS.crs35],
  [/soyuz\s+ms-29/i, NASA_ASSETS.soyuzPad, NASA_ASSETS.soyuzRollout],
  [/soyuz\s+ms-28|soyuz\s+ms-27/i, NASA_ASSETS.soyuzOrbit, NASA_ASSETS.soyuzRollout],
  [/soyuz/i, NASA_ASSETS.soyuzRollout, NASA_ASSETS.soyuzPad],
  [/progress\s+ms-35|96p/i, NASA_ASSETS.progress35, NASA_ASSETS.progressOrbit],
  [/progress/i, NASA_ASSETS.progressOrbit, NASA_ASSETS.progress35],
  [/ng-23/i, NASA_ASSETS.cygnusBerth, NASA_ASSETS.cygnusCapture],
  [/cygnus|ng-/i, NASA_ASSETS.cygnusCapture, NASA_ASSETS.cygnusBerth],
  [/htv/i, NASA_ASSETS.htvApproach, NASA_ASSETS.htvCapture],
];

const FLAG_MAP = [
  [/RUS|KAZ|SOV|ROSCOSMOS/i, '🇷🇺'],
  [/JPN|JAXA/i, '🇯🇵'],
  [/FRA|FRENCH/i, '🇫🇷'],
  [/BEL|BELGIAN/i, '🇧🇪'],
  [/EUR|DEU|ITA|ESA|DNK|SWE/i, '🇪🇺'],
  [/CAN|CSA/i, '🇨🇦'],
  [/USA|NASA|SPACEX/i, '🇺🇸'],
];

const STAY_DAYS = [
  [/crew-\d+|soyuz\s+ms-\d+/i, 195],
  [/progress|cygnus|ng-\d+/i, 165],
  [/htv/i, 75],
  [/crs|spx-/i, 36],
  [/ax-\d+|starliner/i, 16],
];

const END_OVERRIDES = [
  ['crew-12', '2026-10-08T15:34:00Z'],
  ['crs-34', '2026-06-16T18:00:00Z'],
  ['soyuz-ms-28', '2026-07-26T11:00:00Z'],
  ['ng-23', '2026-03-20T11:00:00Z'],
  ['crew-11', '2026-02-19T14:20:00Z'],
  ['soyuz-ms-27', '2025-12-09T08:15:00Z'],
];

const CARGO_TEMPLATES = [
  [
    /progress/i,
    [
      { item: 'Zvezda Orbital Reboost Propellant', category: 'Propellant', mass: '750 kg' },
      { item: 'Rodnik Potable Water Supply', category: 'Life Support', mass: '420 kg' },
      { item: 'Compressed Nitrogen & Oxygen Gas', category: 'Atmosphere', mass: '50 kg' },
      { item: 'Crew Rations & Roscosmos Hardware', category: 'Dry Cargo', mass: '1,320 kg' },
    ],
  ],
  [
    /cygnus|ng-/i,
    [
      { item: 'Microgravity Science Rack Payloads', category: 'Research', mass: '1,250 kg' },
      { item: 'Expedition Crew Provisions & Care Packs', category: 'Logistics', mass: '1,100 kg' },
      { item: 'ECLSS & EVA Replacement Hardware', category: 'Station Systems', mass: '980 kg' },
      { item: 'External CubeSat Deployer Array', category: 'Unpressurized', mass: '450 kg' },
    ],
  ],
  [
    /htv/i,
    [
      { item: 'Kibō Pressurized Experiment Racks', category: 'JAXA Science', mass: '1,650 kg' },
      { item: 'Main Truss Li-Ion Battery Racks', category: 'Power Grid', mass: '1,420 kg' },
      { item: 'Potable Water & Nitrogen Resupply', category: 'Life Support', mass: '650 kg' },
      { item: 'Exposed Facility External Payloads', category: 'External Cargo', mass: '1,900 kg' },
    ],
  ],
  [
    /crs|spx-|dragon/i,
    [
      { item: 'National Lab Microgravity Experiments', category: 'Science', mass: '1,180 kg' },
      { item: 'EVA Spacesuit & Life Support Spares', category: 'EVA Hardware', mass: '520 kg' },
      { item: 'Crew Provisions & Fresh Produce', category: 'Logistics', mass: '680 kg' },
      { item: 'Unpressurized Trunk Sensor Payload', category: 'External Trunk', mass: '540 kg' },
    ],
  ],
];

const SEED_ROWS = [
  ['soyuz-ms-29', 'Soyuz MS-29 (Expedition 75)', 'Roscosmos / NASA', 'Soyuz-2.1a • Soyuz MS', '2026-07-14T09:15:00Z', '2027-03-28T11:30:00Z', true, 'Baikonur 31/6', [['Pyotr Dubrov', 'Commander', 'Roscosmos', '🇷🇺'], ['Anna Kikina', 'Flight Engineer 1', 'Roscosmos', '🇷🇺'], ['Anil Menon', 'Flight Engineer 2', 'NASA', '🇺🇸']]],
  ['progress-ms-35', 'Progress MS-35 (ISS 96P)', 'Roscosmos', 'Soyuz-2.1a • Progress MS', '2026-09-16T11:20:00Z', '2027-02-18T14:00:00Z', true, 'Baikonur 31/6', null],
  ['crew-13', 'SpaceX Crew-13 (Expedition 75/76)', 'NASA / SpaceX', 'Falcon 9 Block 5 • Crew Dragon', '2026-10-01T15:10:06Z', '2027-03-15T16:00:00Z', true, 'CCSFS SLC-40', [['Luke Delaney', 'Commander', 'NASA', '🇺🇸'], ['Jessica Watkins', 'Pilot', 'NASA', '🇺🇸'], ['Joshua Kutryk', 'Mission Specialist 1', 'CSA', '🇨🇦'], ['Sergey Korsakov', 'Mission Specialist 2', 'Roscosmos', '🇷🇺']]],
  ['crs-35', 'SpaceX CRS SpX-35', 'NASA / SpaceX', 'Falcon 9 Block 5 • Cargo Dragon 2', '2026-10-13T10:33:00Z', '2026-11-28T15:00:00Z', true, 'KSC LC-39A', null],
  ['progress-ms-36', 'Progress MS-36 (ISS 97P)', 'Roscosmos', 'Soyuz-2.1a • Progress MS', '2026-11-24T16:13:00Z', '2027-05-20T12:00:00Z', true, 'Baikonur 31/6', null],
  ['ng-24', 'Cygnus CRS-2 NG-24', 'Northrop Grumman / NASA', 'Falcon 9 Block 5 • Cygnus PCM', '2026-11-29T15:49:00Z', '2027-05-12T14:00:00Z', true, 'CCSFS SLC-40', null],
  ['htv-x2', 'HTV-X2 Logistics Flight', 'JAXA', 'H3-24W • HTV-X', '2027-02-15T06:00:00Z', '2027-05-01T12:00:00Z', false, 'Tanegashima LA-Y2', null],
  ['crew-14', 'SpaceX Crew-14 (Expedition 76/77)', 'NASA / SpaceX / ESA', 'Falcon 9 Block 5 • Crew Dragon', '2027-03-01T12:00:00Z', '2027-10-10T12:00:00Z', false, 'KSC LC-39A', [['NASA Commander (TBA)', 'Commander', 'NASA', '🇺🇸'], ['NASA Pilot (TBA)', 'Pilot', 'NASA', '🇺🇸'], ['Raphaël Liégeois', 'Mission Specialist 1', 'ESA', '🇧🇪'], ['Oleg Artemyev', 'Mission Specialist 2', 'Roscosmos', '🇷🇺']]],
  ['progress-ms-37', 'Progress MS-37 (ISS 98P)', 'Roscosmos', 'Soyuz-2.1a • Progress MS', '2027-03-03T16:13:00Z', '2027-08-25T12:00:00Z', true, 'Baikonur 31/6', null],
  ['soyuz-ms-30', 'Soyuz MS-30 (Expedition 76)', 'Roscosmos / NASA', 'Soyuz-2.1a • Soyuz MS', '2027-03-24T11:53:00Z', '2027-10-15T10:00:00Z', false, 'Baikonur 31/6', [['Dmitri Petelin', 'Commander', 'Roscosmos', '🇷🇺'], ['Konstantin Borisov', 'Flight Engineer 1', 'Roscosmos', '🇷🇺'], ['Deniz Burnham', 'Flight Engineer 2', 'NASA', '🇺🇸']]],
  ['crs-36', 'SpaceX CRS SpX-36', 'NASA / SpaceX', 'Falcon 9 Block 5 • Cargo Dragon 2', '2027-04-18T14:00:00Z', '2027-05-25T14:00:00Z', false, 'KSC LC-39A', null],
  ['ng-25', 'Cygnus CRS-2 NG-25', 'Northrop Grumman / NASA', 'Falcon 9 Block 5 • Cygnus PCM', '2027-06-15T14:00:00Z', '2027-11-30T14:00:00Z', false, 'CCSFS SLC-40', null],
  ['crew-12', 'SpaceX Crew-12 (Expedition 74/75)', 'NASA / SpaceX / ESA', 'Falcon 9 Block 5 • Crew Dragon Freedom', '2026-02-13T10:15:00Z', '2026-10-08T15:34:00Z', true, 'CCSFS SLC-40', [['Jessica Meir', 'Commander', 'NASA', '🇺🇸'], ['Jack Hathaway', 'Pilot', 'NASA', '🇺🇸'], ['Sophie Adenot', 'Mission Specialist 1', 'ESA', '🇫🇷'], ['Andrey Fedyaev', 'Mission Specialist 2', 'Roscosmos', '🇷🇺']]],
  ['crs-34', 'SpaceX CRS SpX-34', 'NASA / SpaceX', 'Falcon 9 Block 5 • Cargo Dragon 2', '2026-05-15T16:00:00Z', '2026-06-16T18:00:00Z', true, 'KSC LC-39A', null],
  ['soyuz-ms-28', 'Soyuz MS-28 (Expedition 74)', 'Roscosmos / NASA', 'Soyuz-2.1a • Soyuz MS', '2025-11-27T09:27:00Z', '2026-07-26T11:00:00Z', true, 'Baikonur 31/6', [['Sergey Kud-Sverchkov', 'Commander', 'Roscosmos', '🇷🇺'], ['Sergey Mikayev', 'Flight Engineer 1', 'Roscosmos', '🇷🇺'], ['Christopher Williams', 'Flight Engineer 2', 'NASA', '🇺🇸']]],
  ['ng-23', 'Cygnus CRS-2 NG-23', 'Northrop Grumman / NASA', 'Falcon 9 Block 5 • Cygnus PCM', '2025-09-18T14:00:00Z', '2026-03-20T11:00:00Z', true, 'CCSFS SLC-40', null],
  ['crew-11', 'SpaceX Crew-11 (Expedition 73/74)', 'NASA / SpaceX / JAXA', 'Falcon 9 Block 5 • Crew Dragon Endeavour', '2025-08-01T15:43:00Z', '2026-02-19T14:20:00Z', true, 'KSC LC-39A', [['Zena Cardman', 'Commander', 'NASA', '🇺🇸'], ['Mike Fincke', 'Pilot', 'NASA', '🇺🇸'], ['Kimiya Yui', 'Mission Specialist 1', 'JAXA', '🇯🇵'], ['Oleg Platonov', 'Mission Specialist 2', 'Roscosmos', '🇷🇺']]],
  ['soyuz-ms-27', 'Soyuz MS-27 (Expedition 73)', 'Roscosmos / NASA', 'Soyuz-2.1a • Soyuz MS', '2025-04-08T05:47:15Z', '2025-12-09T08:15:00Z', true, 'Baikonur 31/6', [['Sergey Ryzhikov', 'Commander', 'Roscosmos', '🇷🇺'], ['Alexey Zubritsky', 'Flight Engineer 1', 'Roscosmos', '🇷🇺'], ['Jonny Kim', 'Flight Engineer 2', 'NASA', '🇺🇸']]],
];

const PHASE_CFG = {
  active: {
    accent: '#00ffcc',
    badge: () => '● DOCKED AT ISS',
    cardHeader: () => 'Mission Elapsed Time (T+)',
    modalHeader: () => 'Mission Elapsed Time (MET)',
  },
  planned: {
    accent: '#ffd700',
    badge: (m) => (m.exactDate ? '○ SCHEDULED LAUNCH' : `○ TARGET ${(m.approxMonth ?? '').toUpperCase()}`),
    cardHeader: (m) => (m.exactDate ? 'Launch Countdown (T-)' : `Target: Approx. ${m.approxMonth}`),
    modalHeader: (m) => (m.exactDate ? 'Time Remaining Until Liftoff' : 'Target Launch Window (Date TBD)'),
  },
  past: {
    accent: '#94a3b8',
    badge: () => '✓ MISSION COMPLETED',
    cardHeader: () => 'Total Mission Duration',
    modalHeader: () => 'Completed Mission Duration',
  },
};

function getMissionKey(str) {
  const s = String(str ?? '');
  for (let i = 0; i < KEY_EXTRACTORS.length; i++) {
    const [rx, fmt] = KEY_EXTRACTORS[i];
    const match = s.match(rx);
    if (match) return fmt(match).toLowerCase();
  }
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function pickFlag(str) {
  return FLAG_MAP.find(([rx]) => rx.test(String(str ?? '')))?.[1] ?? '🇺🇸';
}

function fmtMonth(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function getMediaChain(key, apiImg = null) {
  const row = MEDIA_MAP.find(([rx]) => rx.test(key));
  const ext = apiImg?.startsWith('http') && !apiImg.includes('placeholder') ? apiImg : null;
  return [...new Set([row?.[1], row?.[2], ext, FALLBACK_SVG].filter(Boolean))];
}

function unpackSeed() {
  return SEED_ROWS.map(([missionKey, name, agency, vehicle, launchDate, endDate, exactDate, pad, rawCrew]) => {
    const searchStr = `${name} ${vehicle}`;
    const approxMonth = exactDate ? null : fmtMonth(launchDate);
    const crew = rawCrew?.map(([n, role, ag, flag]) => ({ name: n, role, agency: ag, flag })) ?? null;
    const payload = !crew ? (CARGO_TEMPLATES.find(([rx]) => rx.test(searchStr))?.[1] ?? CARGO_TEMPLATES[3][1]) : null;
    const desc = crew
      ? `Crewed International Space Station expedition flight (${crew.map((c) => c.name.split(' ').pop()).join(', ')}) launching from ${pad} aboard ${vehicle}.`
      : `Automated ISS logistics and cargo resupply mission launching from ${pad} aboard ${vehicle}.`;

    return {
      id: missionKey,
      missionKey,
      name,
      agency,
      flag: pickFlag(agency),
      vehicle,
      mediaChain: getMediaChain(searchStr),
      launchDate,
      startMs: Date.parse(launchDate),
      endMs: Date.parse(endDate),
      exactDate,
      approxMonth,
      crew,
      payload,
      shortDesc: desc,
      details: desc,
      specs: {
        'Launch Vehicle': vehicle,
        Spacecraft: name.split('(')[0].trim(),
        'Launch Pad': pad,
        'Schedule Status': exactDate ? 'Confirmed Window' : `Approx. ${approxMonth}`,
      },
    };
  });
}

function resolvePhase(item, now) {
  if (now < item.startMs) return 'planned';
  if (now < item.endMs) return 'active';
  return 'past';
}

function computeClock(item, now, phase) {
  const deltaMs =
    phase === 'planned'
      ? item.startMs - now
      : phase === 'active'
      ? now - item.startMs
      : Math.max(0, item.endMs - item.startMs);

  const prefix =
    phase === 'planned' ? (item.exactDate ? 'T-' : '~T-') : phase === 'active' ? 'T+' : 'DUR';

  const sec = Math.max(0, Math.floor(deltaMs / 1000));
  return {
    prefix,
    d: String(Math.floor(sec / 86400)).padStart(3, '0'),
    h: String(Math.floor((sec % 86400) / 3600)).padStart(2, '0'),
    m: String(Math.floor((sec % 3600) / 60)).padStart(2, '0'),
    s: String(sec % 60).padStart(2, '0'),
  };
}

function parseLaunchRecord(raw) {
  const title = (raw.name ?? 'ISS Mission').split('|').pop().trim();
  const vehicle =
    raw.rocket?.configuration?.full_name ??
    raw.rocket?.configuration?.name ??
    'Orbital Launcher';
  const searchStr = `${title} ${raw.mission?.name ?? ''} ${vehicle}`;
  const missionKey = getMissionKey(searchStr);

  const startIso = raw.net ?? new Date().toISOString();
  const startMs = Date.parse(startIso);

  const stage = Array.isArray(raw.rocket?.spacecraft_stage)
    ? raw.rocket.spacecraft_stage[0]
    : raw.rocket?.spacecraft_stage;

  const endOverride = END_OVERRIDES.find(([k]) => k === missionKey)?.[1];
  const landingIso = endOverride ?? stage?.landing?.net ?? stage?.mission_end;
  const stayDays = STAY_DAYS.find(([rx]) => rx.test(searchStr))?.[1] ?? 165;
  const hasExplicitEnd = Boolean(landingIso && !Number.isNaN(Date.parse(landingIso)));
  const endMs = hasExplicitEnd
    ? Date.parse(landingIso)
    : startMs + stayDays * 86400 * 1000;

  const prec = raw.net_precision?.abbrev ?? 'DAY';
  const exactDate = ['SEC', 'MIN', 'HR', 'DAY'].includes(prec);
  const approxMonth = exactDate ? null : fmtMonth(startIso);

  const agency = raw.launch_service_provider?.name ?? 'ISS Partner';
  const pad = raw.pad?.name ?? 'Launch Complex';
  const loc = raw.pad?.location?.name ?? 'Spaceport';

  const rawCrew = stage?.launch_crew ?? stage?.onboard_crew ?? [];
  const crew = rawCrew.length
    ? rawCrew.map((c) => ({
        name: c.astronaut?.name ?? 'Astronaut',
        role: c.role?.role ?? 'Mission Specialist',
        agency: c.astronaut?.agency?.abbrev ?? c.astronaut?.agency?.name ?? 'ISS',
        flag: pickFlag(
          c.astronaut?.nationality?.[0]?.alpha_3_code ??
            c.astronaut?.nationality?.[0]?.name ??
            c.astronaut?.agency?.country_code
        ),
      }))
    : null;

  const isCrewed = /crew-\d+|soyuz\s+ms-\d+|starliner|ax-\d+|sts-\d+/i.test(searchStr);
  const payload =
    !crew && !isCrewed
      ? CARGO_TEMPLATES.find(([rx]) => rx.test(searchStr))?.[1] ?? CARGO_TEMPLATES[3][1]
      : null;

  const desc =
    raw.mission?.description ??
    `Official International Space Station mission operated by ${agency} launching aboard ${vehicle} from ${pad} (${loc}).`;

  return {
    id: String(raw.id),
    missionKey,
    name: title,
    agency,
    flag: pickFlag(raw.launch_service_provider?.country_code ?? agency),
    vehicle,
    mediaChain: getMediaChain(searchStr, raw.image),
    launchDate: startIso,
    startMs,
    endMs,
    hasExplicitEnd,
    stayDays,
    exactDate,
    approxMonth,
    crew,
    payload,
    shortDesc: desc.length > 120 ? `${desc.slice(0, 120)}...` : desc,
    details: desc,
    specs: {
      'Launch Vehicle': vehicle,
      Spacecraft: stage?.spacecraft?.name ?? title,
      'Launch Pad': `${pad} (${loc})`,
      'Schedule Status': exactDate ? 'Confirmed Window' : `Approx. ${approxMonth}`,
    },
  };
}

function reconcileManifest(base, rawApiList) {
  const out = base.map((item) => ({ ...item }));
  const seenKeys = new Set(out.map((item) => item.missionKey));

  rawApiList.forEach((raw) => {
    const incoming = parseLaunchRecord(raw);
    const idx = out.findIndex((m) => m.missionKey === incoming.missionKey);

    if (idx >= 0) {
      const target = out[idx];
      const deltaShift = Math.abs(incoming.startMs - target.startMs);

      target.launchDate = incoming.launchDate;
      target.startMs = incoming.startMs;
      target.exactDate = incoming.exactDate;
      target.approxMonth = incoming.approxMonth;
      target.details = incoming.details;
      target.shortDesc = incoming.shortDesc;
      target.specs = {
        ...target.specs,
        'Launch Pad': incoming.specs['Launch Pad'],
        'Schedule Status': incoming.specs['Schedule Status'],
      };

      // keep endMs aligned if API shifts launch date or supplies explicit landing
      if (incoming.hasExplicitEnd) {
        target.endMs = incoming.endMs;
      } else if (deltaShift > 7 * 86400 * 1000 || target.endMs <= incoming.startMs) {
        target.endMs = incoming.startMs + incoming.stayDays * 86400 * 1000;
      }

      if (incoming.crew?.length) target.crew = incoming.crew;
      return;
    }

    if (!seenKeys.has(incoming.missionKey)) {
      seenKeys.add(incoming.missionKey);
      out.push(incoming);
    }
  });

  return out;
}

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null');
  } catch {
    return null;
  }
}

function writeCache(items) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items }));
  } catch {}
}

async function queryMirror(path) {
  for (let i = 0; i < LL2_MIRRORS.length; i++) {
    const res = await fetch(`${LL2_MIRRORS[i]}${path}`).catch(() => null);
    if (res?.ok) return res.json();
  }
  return null;
}

export default function ISSMissions() {
  const [missions, setMissions] = useState(() => unpackSeed());
  const [synced, setSynced] = useState(0);
  const [activeMission, setActiveMission] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const [tab, setTab] = useState('all');

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadSchedule() {
      const cached = readCache();
      if (cached?.items?.length && Date.now() - cached.ts < CACHE_TTL) {
        setMissions(reconcileManifest(unpackSeed(), cached.items));
        setSynced(cached.items.length);
        return;
      }

      const [upRes, prevRes] = await Promise.all([
        queryMirror('/upcoming/?program=17&mode=detailed&limit=25'),
        queryMirror('/previous/?program=17&mode=detailed&limit=25'),
      ]);

      if (!mounted) return;

      const rawItems = [...(upRes?.results ?? []), ...(prevRes?.results ?? [])];
      if (!rawItems.length) return;

      writeCache(rawItems);
      setSynced(rawItems.length);
      setMissions(reconcileManifest(unpackSeed(), rawItems));
    }

    loadSchedule();
    return () => {
      mounted = false;
    };
  }, []);

  const { activeList, plannedList, pastList } = useMemo(() => {
    const groups = { active: [], planned: [], past: [] };
    missions.forEach((m) => groups[resolvePhase(m, now)].push(m));

    groups.planned.sort((a, b) => a.startMs - b.startMs);
    groups.active.sort((a, b) => b.startMs - a.startMs);
    groups.past.sort((a, b) => b.startMs - a.startMs);

    return {
      activeList: groups.active,
      plannedList: groups.planned.slice(0, SECTION_LIMIT),
      pastList: groups.past.slice(0, SECTION_LIMIT),
    };
  }, [missions, now]);

  const modalPhase = activeMission ? resolvePhase(activeMission, now) : null;
  const modalClock = activeMission ? computeClock(activeMission, now, modalPhase) : null;
  const modalCfg = modalPhase ? PHASE_CFG[modalPhase] : null;

  const sections = [
    {
      id: 'active',
      title: 'Current Missions (Docked at ISS)',
      subtitle: 'Mission Elapsed Time (T+)',
      accent: '#00ffcc',
      ping: true,
      items: activeList,
    },
    {
      id: 'planned',
      title: 'Next 6 Planned Missions',
      subtitle: 'Countdown (T-) • Auto-Promotes at 00:00:00',
      accent: '#ffd700',
      ping: false,
      items: plannedList,
    },
    {
      id: 'past',
      title: 'Last 6 Past ISS Missions',
      subtitle: `Recent Completed Flights (${pastList.length})`,
      accent: '#94a3b8',
      ping: false,
      items: pastList,
    },
  ];

  return (
    <section
      id="iss-missions"
      className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20 text-white z-30"
    >
      <div className="text-center mb-10 md:mb-14">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-2"
        >
          <span className="text-[#00ffcc]/70 uppercase text-[9px] md:text-[10px] font-mono font-bold tracking-[0.5em]">
            ISS Program #17 Live Telemetry
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4"
        >
          Orbital Missions & Launch Schedule
        </motion.h2>
      </div>

      <div className="max-w-5xl mx-auto mb-10 flex flex-wrap items-center justify-between gap-3 bg-slate-900/50 border border-white/10 p-3 rounded-2xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: `All (${activeList.length + plannedList.length + pastList.length})` },
            { id: 'active', label: `Current (${activeList.length})` },
            { id: 'planned', label: `Next 6 Planned (${plannedList.length})` },
            { id: 'past', label: `Last 6 Past (${pastList.length})` },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setTab(btn.id)}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-[10px] uppercase tracking-widest transition-all cursor-pointer ${
                tab === btn.id
                  ? 'bg-[#00ffcc]/15 text-[#00ffcc] border border-[#00ffcc]/40'
                  : 'text-slate-400 hover:text-white bg-white/5 border border-transparent'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest px-2">
          {synced > 0
            ? `API Synced (${activeList.length + plannedList.length + pastList.length} Displayed)`
            : `Manifest Active (${activeList.length + plannedList.length + pastList.length} Displayed)`}
        </span>
      </div>

      <div className="max-w-5xl mx-auto space-y-14">
        {sections
          .filter((sec) => tab === 'all' || tab === sec.id)
          .map((sec) => (
            <div key={sec.id}>
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-6">
                <div className="flex items-center gap-3">
                  {sec.ping ? (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ffcc] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00ffcc]" />
                    </span>
                  ) : (
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: sec.accent,
                        boxShadow: sec.id === 'planned' ? `0 0 8px ${sec.accent}` : 'none',
                      }}
                    />
                  )}
                  <h3 className="font-mono text-xs sm:text-sm uppercase tracking-[0.3em] text-slate-200 font-bold">
                    {sec.title}
                  </h3>
                </div>
                <span
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: sec.accent }}
                >
                  {sec.subtitle}
                </span>
              </div>

              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {sec.items.map((item) => (
                    <MissionCard
                      key={item.id}
                      item={item}
                      now={now}
                      onSelect={setActiveMission}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
      </div>

      <AnimatePresence>
        {activeMission && modalClock && modalCfg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setActiveMission(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-slate-900/95 border border-[#00ffcc]/30 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,255,204,0.15)] flex flex-col backdrop-blur-2xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-64 w-full bg-slate-950 overflow-hidden shrink-0">
                <RocketMedia
                  chain={activeMission.mediaChain}
                  alt={activeMission.name}
                  className="w-full h-full"
                />
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-900 via-slate-900/25 to-transparent pointer-events-none" />

                <button
                  onClick={() => setActiveMission(null)}
                  className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-slate-300 hover:text-white flex items-center justify-center transition-colors font-mono cursor-pointer border border-white/10"
                  aria-label="Close modal"
                >
                  ✕
                </button>

                <div className="absolute bottom-4 left-6 right-6 z-30 flex items-end justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl drop-shadow-md">{activeMission.flag}</span>
                    <div>
                      <h3 className="text-white font-bold text-lg sm:text-xl tracking-wide">
                        {activeMission.name}
                      </h3>
                      <p className="text-[#00ffcc] font-mono text-[10px] uppercase tracking-widest font-semibold mt-0.5">
                        {activeMission.agency} • {activeMission.vehicle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto">
                <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="block text-[9px] font-mono uppercase tracking-[0.25em] text-slate-400">
                      {modalCfg.modalHeader(activeMission)}
                    </span>
                    <span className="text-xs font-mono text-slate-300">
                      {activeMission.exactDate
                        ? `Launch: ${new Date(activeMission.launchDate).toUTCString()}`
                        : `Target: Approx. ${activeMission.approxMonth}`}
                    </span>
                  </div>

                  <div className="font-mono text-base sm:text-lg font-bold tracking-wider text-white">
                    <span className="mr-1.5" style={{ color: modalCfg.accent }}>
                      {modalClock.prefix}
                    </span>
                    {modalClock.d}d : {modalClock.h}h : {modalClock.m}m :{' '}
                    <span style={{ color: modalCfg.accent }}>{modalClock.s}s</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-slate-500 font-mono text-[9px] uppercase tracking-[0.3em] mb-3 font-bold">
                    Mission Overview
                  </h4>
                  <p className="text-slate-300 text-sm leading-relaxed font-light">
                    {activeMission.details}
                  </p>
                </div>

                <ManifestGrid item={activeMission} accent={modalCfg.accent} />

                <div>
                  <h4 className="text-slate-500 font-mono text-[9px] uppercase tracking-[0.3em] mb-4 font-bold">
                    Technical Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(activeMission.specs ?? {}).map(([k, v]) => (
                      <div key={k} className="bg-black/30 border border-white/5 p-4 rounded-2xl">
                        <p className="text-[#00ffcc]/60 font-mono text-[9px] uppercase tracking-widest mb-1">
                          {k}
                        </p>
                        <p className="text-slate-200 text-xs sm:text-sm font-medium tracking-wide">
                          {v}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-black/40 border-t border-white/5 flex justify-between items-center shrink-0">
                <span className="text-slate-500/50 text-[9px] font-mono uppercase tracking-[0.2em]">
                  Orbital Spec Sheet
                </span>
                <span
                  className="text-[9px] font-mono uppercase tracking-widest"
                  style={{ color: modalCfg.accent }}
                >
                  {modalCfg.badge(activeMission)}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ManifestGrid({ item, accent }) {
  if (item.crew?.length) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-slate-500 font-mono text-[9px] uppercase tracking-[0.3em] font-bold">
            Assigned Crew Roster ({item.crew.length} Astronauts)
          </h4>
          <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: accent }}>
            Crewed Flight
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {item.crew.map((member) => (
            <div
              key={member.name}
              className="bg-black/35 border border-white/10 p-3.5 rounded-2xl flex items-center gap-3.5"
            >
              <span className="text-2xl shrink-0">{member.flag}</span>
              <div className="min-w-0">
                <p className="text-slate-100 text-xs sm:text-sm font-semibold truncate">
                  {member.name}
                </p>
                <p className="text-[#00ffcc]/80 font-mono text-[10px] uppercase tracking-wider truncate">
                  {member.role} • {member.agency}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (item.payload?.length) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-slate-500 font-mono text-[9px] uppercase tracking-[0.3em] font-bold">
            Primary Cargo & Payload Manifest
          </h4>
          <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: accent }}>
            Uncrewed Logistics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {item.payload.map((cargo) => (
            <div
              key={cargo.item}
              className="bg-black/35 border border-white/10 p-3.5 rounded-2xl flex flex-col justify-between gap-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#ffd700]/80 font-mono text-[9px] uppercase tracking-widest">
                  {cargo.category}
                </span>
                <span className="text-slate-300 font-mono text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10">
                  {cargo.mass}
                </span>
              </div>
              <p className="text-slate-100 text-xs sm:text-sm font-medium leading-snug">
                {cargo.item}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

function RocketMedia({ chain = [], alt, className = '' }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [chain]);

  const src = chain[idx] ?? FALLBACK_SVG;
  const stepFallback = () => setIdx((prev) => (prev < chain.length - 1 ? prev + 1 : prev));

  return (
    <div className={`relative overflow-hidden bg-slate-950 flex items-center justify-center ${className}`}>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        onError={stepFallback}
        className="absolute inset-0 w-full h-full object-cover opacity-35 blur-md scale-110 pointer-events-none select-none"
      />
      <img
        src={src}
        alt={alt}
        loading="eager"
        decoding="async"
        onError={stepFallback}
        className="relative z-10 w-full h-full object-contain p-1.5 transition-transform duration-500 group-hover:scale-105 drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]"
      />
    </div>
  );
}

function MissionCard({ item, now, onSelect }) {
  const phase = resolvePhase(item, now);
  const clock = computeClock(item, now, phase);
  const cfg = PHASE_CFG[phase];

  const dateBadge = item.exactDate
    ? new Date(item.launchDate).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      })
    : `NET ${item.approxMonth} (Date TBD)`;

  const isCrewed = Boolean(item.crew?.length);
  const tags = isCrewed
    ? item.crew.map((c) => `${c.flag} ${c.name.split(' ').pop()}`)
    : (item.payload ?? []).map((p) => p.item);

  return (
    <motion.div
      layout
      layoutId={`iss-mission-${item.missionKey}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      onClick={() => onSelect(item)}
      className="group relative flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 bg-slate-900/60 hover:bg-slate-900/90 border border-white/10 hover:border-white/25 backdrop-blur-xl p-4 rounded-3xl cursor-pointer transition-colors duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
    >
      <div className="relative w-full sm:w-52 h-48 sm:h-36 rounded-2xl overflow-hidden border border-white/10 shrink-0">
        <RocketMedia chain={item.mediaChain} alt={item.name} className="w-full h-full" />

        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2.5 flex items-end">
          <span className="text-[9px] font-mono uppercase tracking-wider text-slate-200 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 truncate max-w-full">
            {item.flag} {item.vehicle}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row lg:items-center justify-between gap-4 min-w-0 pr-1">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                backgroundColor: cfg.accent,
                boxShadow: `0 0 8px ${cfg.accent}`,
              }}
            />
            <span
              className="font-mono text-[10px] uppercase tracking-[0.25em] font-semibold"
              style={{ color: cfg.accent }}
            >
              {item.agency}
            </span>
            <span className="text-slate-400 font-mono text-[10px] bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
              {dateBadge}
            </span>
          </div>

          <h4 className="text-base sm:text-lg font-bold text-slate-100 group-hover:text-white tracking-tight truncate">
            {item.name}
          </h4>

          <p className="text-slate-400 text-xs sm:text-sm font-light line-clamp-1">
            {item.shortDesc}
          </p>

          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
                {isCrewed ? 'Crew' : 'Payload'}
              </span>
              {tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="font-mono text-[10px] text-slate-300 bg-black/40 border border-white/5 px-2 py-0.5 rounded-lg truncate max-w-[170px]"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-black/45 border border-white/5 rounded-2xl px-4 py-3 shrink-0 flex flex-col items-start lg:items-end justify-center min-w-[235px]">
          <span
            className="text-[9px] font-mono uppercase tracking-[0.2em] mb-1 font-semibold"
            style={{
              color: !item.exactDate && phase === 'planned' ? '#ffd700' : '#64748b',
            }}
          >
            {cfg.cardHeader(item)}
          </span>

          <div className="flex items-baseline gap-1 font-mono text-sm sm:text-base md:text-lg font-bold tracking-wider">
            <span
              className="text-[10px] mr-1.5 px-1.5 py-0.5 rounded bg-white/5"
              style={{ color: cfg.accent }}
            >
              {clock.prefix}
            </span>
            <span className="text-white">{clock.d}</span>
            <span className="text-slate-500 text-[10px] mr-1">D</span>
            <span className="text-white">{clock.h}</span>
            <span className="text-slate-500 text-[10px] mr-1">H</span>
            <span className="text-white">{clock.m}</span>
            <span className="text-slate-500 text-[10px] mr-1">M</span>
            <span style={{ color: cfg.accent }}>{clock.s}</span>
            <span className="text-slate-500 text-[10px]">S</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}