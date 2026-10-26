import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const MENU_ITEMS = [
  { label: 'About Section', href: '#tracker-info' },
  { label: 'ISS Tracker', href: '#mission-control' },
  { label: 'Anatomy of the Station', href: '#iss-learn' },
  { label: 'Orbital Gallery', href: '#orbital-gallery' },
  { label: 'Contact', href: '#contact' },
];

export default function SelectMenu() {
  return (
    <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-20 z-40">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-slate-900/40 border border-white/5 rounded-3xl p-8 md:p-16 backdrop-blur-sm shadow-2xl">
        
        {/* LEFT SIDE: Floating ISS Image */}
        <div className="relative flex justify-center items-center h-64 md:h-96">
          {/* Subtle background glow */}
          <div className="absolute w-3/4 h-3/4 bg-[#00ffcc]/10 blur-[80px] rounded-full" />
          
          {/* Floating Animation */}
          <motion.img
            src="/assets/ISS White Transparent.jpg"
            alt="ISS Navigational Model"
            animate={{ y: [-15, 15, -15] }}
            transition={{ 
              duration: 6, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            /* screen mode ensures the black background of the jpg becomes fully transparent */
            style={{ mixBlendMode: 'screen' }}
            className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_20px_rgba(0,255,204,0.1)]"
          />
        </div>

        {/* RIGHT SIDE: Navigation Menu */}
        <div className="flex flex-col space-y-2">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <span className="text-[#00ffcc]/70 uppercase text-[10px] font-mono font-bold tracking-[0.4em]">
              Main Systems Menu
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2">
              Select Destination
            </h2>
          </motion.div>

          {/* Navigation Links */}
          <div className="flex flex-col space-y-3 mt-4">
            {MENU_ITEMS.map((item, index) => (
              <motion.a
                key={item.label}
                href={item.href}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/20 hover:bg-[#00ffcc]/10 hover:border-[#00ffcc]/30 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <span className="text-slate-600 font-mono text-xs group-hover:text-[#00ffcc] transition-colors">
                    0{index + 1}
                  </span>
                  <span className="text-slate-300 font-medium tracking-wide group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                </div>
                <ChevronRight 
                  size={18} 
                  className="text-slate-600 group-hover:text-[#00ffcc] group-hover:translate-x-1 transition-all duration-300" 
                />
              </motion.a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}