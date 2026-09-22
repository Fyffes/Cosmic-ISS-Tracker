import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Expanded Interactive ISS Modules Hotspot Data
const ISS_MODULES = [
  {
    id: 'port-solar-arrays',
    name: 'Port Solar Array Wings',
    agency: 'NASA / International',
    flag: '🇺🇸 / 🇪🇺',
    x: 22, 
    y: 34,
    shortDesc: 'Generates electrical power from solar radiation.',
    details: 'Located on the left (port) side of the main truss, these massive photovoltaic arrays continuously rotate to track the Sun. They convert solar energy into usable electricity, producing enough power to run the station\'s critical life support and science experiments.',
    specs: {
      'Total Span': '73 Meters',
      'Power Output': 'Up to 120 kW total',
      'Solar Cells': '~262,400',
      'Rotation': '360° Alpha/Beta Joints'
    }
  },
  {
    id: 'starboard-solar-arrays',
    name: 'Starboard Solar Arrays',
    agency: 'NASA / International',
    flag: '🇺🇸 / 🇪🇺',
    x: 78, 
    y: 34,
    shortDesc: 'The right-side power generation arrays.',
    details: 'Mirroring the port side, the starboard arrays complete the station\'s power grid. Upgrades are ongoing to install new iROSA (ISS Roll-Out Solar Arrays) over the existing panels to boost power output.',
    specs: {
      'Array Width': '12 Meters',
      'Material': 'Silicon & Kapton',
      'Voltage': '160 Volts DC',
      'Key Upgrade': 'iROSA Installation'
    }
  },
  {
    id: 'truss-structure',
    name: 'Integrated Truss Structure',
    agency: 'NASA / CSA',
    flag: '🇺🇸 / 🇨🇦',
    x: 50,
    y: 38,
    shortDesc: 'The 108-meter metallic backbone of the station.',
    details: 'The ITS is the central framework that holds the entire station together. It houses unpressurized logistics, external payloads, the Mobile Transporter rail system, and routes all cooling fluids and electrical power.',
    specs: {
      'Total Length': '108.4 Meters',
      'Material': 'Aluminum & Steel',
      'Mass': '~14,000 kg',
      'Assembly': '11 Shuttle Flights'
    }
  },
  {
    id: 'radiators',
    name: 'Thermal Control Radiators',
    agency: 'NASA',
    flag: '🇺🇸',
    x: 40,
    y: 50,
    shortDesc: 'Giant white panels designed to reject waste heat.',
    details: 'Without radiators, the ISS would rapidly overheat. Ammonia fluid is pumped through these massive white panels, absorbing heat from the modules and radiating it out into the freezing vacuum of space.',
    specs: {
      'Coolant': 'Anhydrous Ammonia',
      'Panel Count': '14 Main Panels',
      'Heat Rejection': 'Up to 70 kW',
      'Operating Temp': 'About minus 270 degrees Celsius (approx. 2.7 Kelvin)'
    }
  },
  {
    id: 'kibo-lab',
    name: 'Kibō Experiment Module',
    agency: 'JAXA',
    flag: '🇯🇵',
    x: 58,
    y: 22,
    shortDesc: 'Japan’s largest single space station module.',
    details: 'Kibō (meaning "Hope") is JAXA’s human space facility. It consists of a pressurized hab module, a dedicated airlock, an external exposed facility ("porch") for experiments, and its own robotic arm.',
    specs: {
      'Launched': '2008',
      'Length': '11.2 Meters',
      'Volume': '148 m³',
      'Key Feature': 'Exposed Porch'
    }
  },
  {
    id: 'destiny-lab',
    name: 'Destiny U.S. Laboratory',
    agency: 'NASA',
    flag: '🇺🇸',
    x: 50,
    y: 28,
    shortDesc: 'The primary research facility for U.S. payloads.',
    details: 'Destiny is the centerpiece of American commercial and scientific research in LEO. Scientists conduct groundbreaking experiments in microgravity human biology, fluid dynamics, and materials engineering.',
    specs: {
      'Launched': '2001',
      'Length': '8.5 Meters',
      'Payload Racks': '24 Standard Racks',
      'Material': 'Insulated Aluminum'
    }
  },
  {
    id: 'columbus-lab',
    name: 'Columbus Laboratory',
    agency: 'ESA',
    flag: '🇪🇺',
    x: 42,
    y: 22,
    shortDesc: 'Europe’s primary flagship science laboratory.',
    details: 'Built in Europe, Columbus provides a state-of-the-art facility for European scientists to study space medicine, plant biology, astrobiology, and fundamental physics in long-duration microgravity.',
    specs: {
      'Launched': '2008',
      'Mass': '10,300 kg',
      'Internal Volume': '75 m³',
      'Operating Agency': 'ESA'
    }
  },
  {
    id: 'canadarm2',
    name: 'Canadarm2 (MSS)',
    agency: 'CSA',
    flag: '🇨🇦',
    x: 47,
    y: 42,
    shortDesc: 'Advanced 17-meter robotic arm for station assembly.',
    details: 'Canadarm2 is a routine workhorse on the ISS. Equipped with 7 motorized joints, it can move heavy modules weighing over 110,000 kg and "walk" end-over-end across the exterior truss structure.',
    specs: {
      'Length': '17.6 Meters',
      'Freedom Degrees': '7 Joints',
      'Max Payload': '116,000 kg',
      'Control': 'Cupola / Ground'
    }
  },
  {
    id: 'zarya',
    name: 'Zarya Cargo Block (FGB)',
    agency: 'Roscosmos / NASA',
    flag: '🇷🇺 / 🇺🇸',
    x: 50,
    y: 65,
    shortDesc: 'The very first module of the ISS.',
    details: 'Launched in 1998, Zarya (meaning "Sunrise") was the foundational module of the ISS. Funded by the US but built by Russia, it provided initial power, storage, and propulsion.',
    specs: {
      'Launched': '1998 (Proton-K)',
      'Length': '12.6 Meters',
      'Mass': '19,323 kg',
      'Current Use': 'Storage'
    }
  },
  {
    id: 'zvezda',
    name: 'Zvezda Service Module',
    agency: 'Roscosmos',
    flag: '🇷🇺',
    x: 50,
    y: 78,
    shortDesc: 'Provides primary living quarters and reboost engines.',
    details: 'Zvezda ("Star") supplies the structural backbone for the Russian segment. It houses crew sleep quarters, oxygen generators, and the primary engines used for station orbit maintenance.',
    specs: {
      'Launched': '2000',
      'Length': '13.1 Meters',
      'Main Engines': '2 x 300 kgf',
      'Dry Mass': '19,050 kg'
    }
  }
];

export default function ISSLearn({ imagePath = '/assets/ISS Dark Transparent.jpg' }) {
  const [selectedModule, setSelectedModule] = useState(null);
  const [hoveredModule, setHoveredModule] = useState(null);

  return (
    <section id="iss-learn" className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20 text-white font-sans z-30">
      
      {/* SECTION HEADER */}
      <div className="text-center mb-8 md:mb-14">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-2"
        >
          <span className="text-[#00ffcc]/70 uppercase text-[9px] md:text-[10px] font-mono font-bold tracking-[0.5em]">
            Interactive Module Explorer
          </span>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl md:text-4xl font-extrabold tracking-tight text-white"
        >
          Anatomy of the Station
        </motion.h2>
      </div>

      {/* INTERACTIVE ISS DISPLAY CONTAINER */}
      <div className="relative w-full max-w-5xl mx-auto aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center bg-transparent">
        
        <img 
          src={imagePath} 
          alt="ISS Structural Diagram" 
          className="w-full h-full object-contain select-none pointer-events-none drop-shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all duration-700"
          style={{ mixBlendMode: 'screen' }}
        />

        {/* HOTSPOT BUTTONS (Yellow Points) */}
        {ISS_MODULES.map((mod) => {
          const isHovered = hoveredModule?.id === mod.id;

          return (
            <div
              key={mod.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ${
                isHovered ? 'z-40' : 'z-20'
              }`}
              style={{ left: `${mod.x}%`, top: `${mod.y}%` }}
            >
              <button
                onClick={() => setSelectedModule(mod)}
                onMouseEnter={() => setHoveredModule(mod)}
                onMouseLeave={() => setHoveredModule(null)}
                className="relative group flex items-center justify-center w-5 h-5 focus:outline-none cursor-pointer"
                aria-label={`Inspect ${mod.name}`}
              >
                {/* Heartbeat Pulse (Yellow) */}
                <motion.span 
                  animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.4, 0.15] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-full h-full rounded-full bg-[#ffd700] pointer-events-none" 
                />
                
                {/* Inner Dot (Yellow) */}
                <span className="relative w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#ffd700] shadow-[0_0_8px_rgba(255,215,0,0.6)] group-hover:scale-150 group-hover:bg-white transition-all duration-300" />

                {/* Hover Tooltip Preview Positioned Strictly Above Point */}
                <AnimatePresence>
                  {isHovered && !selectedModule && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.9, x: "-50%" }}
                      animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                      exit={{ opacity: 0, y: 6, scale: 0.9, x: "-50%" }}
                      transition={{ duration: 0.15 }}
                      className="absolute bottom-full left-1/2 mb-3 z-50 whitespace-nowrap bg-slate-900/95 border border-[#ffd700]/50 backdrop-blur-xl px-3 py-1.5 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.5)] pointer-events-none flex items-center gap-2"
                    >
                      <span className="text-sm">{mod.flag}</span>
                      <span className="text-slate-100 font-mono text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase">
                        {mod.name}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          );
        })}
      </div>

      {/* MODAL POPUP WINDOW */}
      <AnimatePresence>
        {selectedModule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedModule(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-slate-900/95 border border-[#00ffcc]/30 rounded-3xl w-full max-w-xl overflow-hidden shadow-[0_0_50px_rgba(0,255,204,0.15)] flex flex-col backdrop-blur-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-5 bg-[#00ffcc]/5 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-3xl drop-shadow-md">{selectedModule.flag}</span>
                  <div>
                    <h3 className="text-slate-100 font-light text-lg sm:text-xl tracking-wide">
                      {selectedModule.name}
                    </h3>
                    <p className="text-[#00ffcc] font-mono text-[10px] uppercase tracking-widest font-semibold mt-0.5">
                      {selectedModule.agency}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedModule(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors font-mono"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-8">
                <div>
                  <h4 className="text-slate-500 font-mono text-[9px] uppercase tracking-[0.3em] mb-3 font-bold">
                    Mission Overview
                  </h4>
                  <p className="text-slate-300 text-sm leading-relaxed font-light">
                    {selectedModule.details}
                  </p>
                </div>

                {/* Specs Grid */}
                <div>
                  <h4 className="text-slate-500 font-mono text-[9px] uppercase tracking-[0.3em] mb-4 font-bold">
                    Technical Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedModule.specs).map(([label, val], idx) => (
                      <div key={idx} className="bg-black/30 border border-white/5 p-4 rounded-2xl">
                        <p className="text-[#00ffcc]/60 font-mono text-[9px] uppercase tracking-widest mb-1">{label}</p>
                        <p className="text-slate-200 text-xs sm:text-sm font-medium tracking-wide">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-black/40 border-t border-white/5 flex justify-between items-center">
                <span className="text-slate-500/50 text-[9px] font-mono uppercase tracking-[0.2em]">Orbital Spec Sheet</span>
                <button
                  onClick={() => setSelectedModule(null)}
                  className="bg-[#00ffcc]/10 hover:bg-[#00ffcc]/20 text-[#00ffcc] border border-[#00ffcc]/30 px-5 py-2.5 rounded-xl text-[10px] font-mono uppercase font-bold tracking-widest transition-all hover:shadow-[0_0_15px_rgba(0,255,204,0.2)]"
                >
                  Close Telemetry
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}