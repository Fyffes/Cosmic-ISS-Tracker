import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ChevronDown, Mail } from 'lucide-react';

// Component Imports
import ShootingStarBackground from './ShootingStarBackground';
import ISSTracker from './ISSTracker';
import TrackerInfoSection from './TrackerInfoSection';
import ISSLearn from './ISSLearn';
import ISSView from './ISSView';
import SelectMenu from './SelectMenu';

// --- MAIN APP COMPONENT ---
export default function App() {
  return (
    /* font-sans entfernt, damit automatisch die Space Meatball aus der index.css greift */
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-blue-500/30 overflow-x-hidden">
      <ShootingStarBackground>
        
        {/* --- HERO SECTION --- */}
        <header className="relative h-screen w-full flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
            className="text-center w-full max-w-7xl"
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[9rem] font-light tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200 leading-none select-none break-words">
              Cosmic ISS Tracker
            </h1>
            <div className="h-[1px] w-12 sm:w-24 bg-blue-400/30 mx-auto mb-6 sm:mb-10 shadow-[0_0_20px_rgba(96,165,250,0.3)]" />
            <p className="text-[10px] sm:text-lg md:text-xl lg:text-2xl font-light tracking-[0.2em] sm:tracking-[0.5em] uppercase text-blue-300/60 px-4">
              Made by Fyffes
            </p>
          </motion.div>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-blue-200/20 hidden sm:block">
            <ChevronDown size={32} className="animate-bounce" />
          </div>
        </header>

        <main className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-32 space-y-32 md:space-y-48 relative z-20">
          
          {/* --- Select Menu --- */}
          <SelectMenu />
          
          {/* --- INFO SECTION --- */}
          <TrackerInfoSection />

          {/* --- MISSION CONTROL (ISS TRACKER & SIGHTING CHECKER) --- */}
          <section id="mission-control" className="w-full">
            <div className="text-center mb-10 sm:mb-20">
              <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-400/30 mb-4">Our Universe</h2>
              <p className="text-3xl sm:text-5xl font-light text-white mb-12">ISS Orbital Telemetry</p>
            </div>
            
            <div className="glass rounded-2xl sm:rounded-3xl overflow-hidden">
              <Suspense fallback={<div className="h-96 flex items-center justify-center text-blue-400/20">Initializing Systems...</div>}>
                <ISSTracker />
              </Suspense>
            </div>
          </section>

          {/* --- INTERACTIVE ISS ANATOMY & MODULE EXPLORER --- */}
          <ISSLearn />

          {/* --- NEW: ORBITAL GALLERY --- */}
          <ISSView />

          {/* --- CONTACT SECTION --- */}
          <section id="contact" className="max-w-4xl mx-auto pt-20 w-full">
             <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-400/30 mb-4">Communications</h2>
                <p className="text-4xl sm:text-6xl font-light text-white mb-6">Open Channels</p>
                <p className="text-slate-400 font-light max-w-md mx-auto text-sm sm:text-base leading-relaxed px-4">
                  Feel free to reach out for collaborations or just to say hello. The signal is always open.
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 px-2">
                <ContactLink 
                  href="mailto:contact@fyffes.me" 
                  icon={<Mail size={20} />} 
                  label="Email" 
                  value="contact@fyffes.me" 
                />
                <ContactLink 
                  href="https://discord.com/users/921739306199027793" 
                  icon={<MessageSquare size={20} />} 
                  label="Discord" 
                  value="Direct Message" 
                />
             </div>
          </section>

        </main>

        {/* --- FOOTER SECTION --- */}
        <footer className="pt-32 pb-16 border-t border-white/5 text-center relative z-20 px-6">
          <div className="flex flex-col items-center gap-6">
            
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-light tracking-[0.3em] text-slate-400 uppercase">
              <span>Made by Fyffes with</span>
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-red-500 inline-block drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
              >
                ❤️
              </motion.span>
            </div>

            <motion.a 
              href="https://fyffes.gitbook.io/fyffes-docs" 
              target="_blank" 
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              className="text-[10px] sm:text-xs font-light tracking-[0.2em] uppercase text-slate-500 hover:text-blue-400 transition-all duration-300 relative group py-1"
            >
              Privacy Policy & Legal
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </motion.a>

            <p className="text-[9px] sm:text-[10px] tracking-[0.4em] uppercase text-slate-500/60">
              © 2026 Cosmic ISS Tracker
            </p>

          </div>
        </footer>

      </ShootingStarBackground>
    </div>
  );
}

// Sub-component for Contact Links
function ContactLink({ href, icon, label, value }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-4 sm:gap-6 p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-950/20 border border-white/5 backdrop-blur-xl transition-colors group w-full"
    >
      <div className="shrink-0 w-12 h-12 rounded-xl sm:rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
        {icon}
      </div>
      <div className="text-left min-w-0">
        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 truncate">{label}</p>
        <p className="text-base sm:text-lg font-light text-slate-200 truncate">{value}</p>
      </div>
    </motion.a>
  );
}