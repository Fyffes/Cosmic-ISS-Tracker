import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ExternalLink, X, ZoomIn } from 'lucide-react';

const mainImage = {
  id: 'main',
  src: "https://images-assets.nasa.gov/image/iss074e0702651/iss074e0702651~large.jpg?w=1920&h=1280&fit=clip&crop=faces%2Cfocalpoint",
  alt: "The International Space Station at Night with the Northern Lights.",
  label: "Primary Viewport"
};

const pinnedImages = [
  {
    id: 1,
    src: "https://www.nasa.gov/wp-content/uploads/2023/03/493169main_2009-03-11_full.jpg",
    alt: "Space Shuttle Discovery ready to launch on Mission STS-119 to the International Space Station.",
    label: "Space Shuttle Discovery",
    rotation: "rotate-2",
    delay: 0.1
  },
  {
    id: 2,
    src: "https://images-assets.nasa.gov/image/iss074e0225549/iss074e0225549~large.jpg?w=1920&h=1280&fit=clip&crop=faces%2Cfocalpoint",
    alt: "The ISS as it flies over Earth toward nightfall.",
    label: "Orbital Horizon",
    rotation: "-rotate-2",
    delay: 0.2
  },
  {
    id: 3,
    src: "https://images-assets.nasa.gov/image/iss074e0381351/iss074e0381351~large.jpg?w=1920&h=1280&fit=clip&crop=faces%2Cfocalpoint",
    alt: "The ISS over London at Night.",
    label: "Night View",
    rotation: "rotate-1",
    delay: 0.3
  }
];

export default function ISSView() {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <section id="orbital-gallery" className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-32 z-30">
      
      {/* HEADER SECTION */}
      <div className="text-center mb-12 md:mb-20">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-2"
        >
          <span className="text-[#00ffcc]/70 uppercase text-[9px] md:text-[10px] font-mono font-bold tracking-[0.5em]">
            Orbital Gallery
          </span>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4"
        >
          Captured in the Void
        </motion.h2>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto font-light leading-relaxed">
          Glimpses of life, engineering, and the breathtaking views from humanity's outpost in low Earth orbit.
        </p>
      </div>

      {/* GALLERY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 items-center">
        
        {/* LEFT: Main Large Image */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          onClick={() => setSelectedImage(mainImage)}
          className="lg:col-span-3 relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(0,255,204,0.05)] bg-slate-900/50 group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[#00ffcc]/5 to-transparent pointer-events-none z-10" />
          
          <img 
            src={mainImage.src} 
            alt={mainImage.alt} 
            className="w-full h-[400px] md:h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Hover Zoom Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
            <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#00ffcc]/50 text-[#00ffcc] font-mono text-xs tracking-wider uppercase">
              <ZoomIn size={16} />
              <span>Click to Enlarge</span>
            </div>
          </div>
          
          <div className="absolute bottom-6 left-6 z-20 backdrop-blur-md bg-black/40 border border-white/10 px-4 py-2 rounded-xl pointer-events-none">
            <span className="text-slate-200 font-mono text-[10px] uppercase tracking-widest">
              {mainImage.label}
            </span>
          </div>
        </motion.div>

        {/* RIGHT: Column of 3 Pinned Small Images */}
        <div className="lg:col-span-1 flex flex-row lg:flex-col gap-6 md:gap-8 justify-center items-center overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 px-2">
          {pinnedImages.map((img) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: img.delay, duration: 0.6, type: "spring" }}
              whileHover={{ scale: 1.05, zIndex: 10, transition: { duration: 0.15 } }}
              onClick={() => setSelectedImage(img)}
              className={`relative shrink-0 cursor-pointer w-40 h-40 md:w-48 md:h-48 lg:w-full lg:h-44 bg-slate-900 p-2 rounded-xl shadow-2xl border border-white/5 ${img.rotation} transition-all duration-150 group`}
            >
              {/* THE PIN (Yellow Star) */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div className="relative flex items-center justify-center w-6 h-6">
                  <div className="absolute w-4 h-4 bg-[#ffd700] blur-[6px] rounded-full opacity-60" />
                  <Star size={18} fill="#ffd700" className="text-[#ffd700] drop-shadow-md relative z-10" />
                </div>
              </div>

              <div className="relative w-full h-full rounded-lg overflow-hidden border border-white/10">
                <img 
                  src={img.src} 
                  alt={img.alt} 
                  className="w-full h-full object-cover filter brightness-90 group-hover:brightness-110 transition-all duration-300"
                />

                {/* Hover Indicator */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <ZoomIn size={20} className="text-[#00ffcc] drop-shadow-lg" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* BOTTOM CENTERED TEXT BLOCK WITH 3 ACTION LINKS */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative max-w-4xl mx-auto mt-20 md:mt-24 bg-slate-900/60 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl text-center"
      >
        {/* THE PIN (Yellow Star) */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="relative flex items-center justify-center w-6 h-6">
            <div className="absolute w-4 h-4 bg-[#ffd700] blur-[6px] rounded-full opacity-60" />
            <Star size={20} fill="#ffd700" className="text-[#ffd700] drop-shadow-md relative z-10" />
          </div>
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-white mb-3 tracking-wide">
          Continue Your Mission
        </h3>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8 font-light max-w-2xl mx-auto">
          The exploration doesn't stop here. Access the official website from NASA, explore high-resolution imagery archives, or watch the Earth roll by in real-time straight from external cameras.
        </p>

        {/* 3 FUTURISTIC ACTION BUTTON LINKS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          
          {/* NASA Official Link */}
          <a 
            href="https://www.nasa.gov/international-space-station/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center gap-2.5 px-4 py-3.5 bg-slate-950/80 hover:bg-[#00ffcc]/10 border border-[#00ffcc]/30 hover:border-[#00ffcc] text-slate-200 hover:text-white rounded-2xl transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(0,255,204,0.25)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc] group-hover:scale-125 transition-transform duration-300 shadow-[0_0_8px_#00ffcc]" />
            <span className="tracking-wider uppercase text-[10px] md:text-[11px] font-bold">NASA Official</span>
            <ExternalLink size={14} className="text-[#00ffcc] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 ml-auto sm:ml-0" />
          </a>

          {/* Live Earth Feed Link */}
          <a 
            href="https://www.youtube.com/playlist?list=PL2aBZuCeDwlQMf6xMgQAUAY_nbHAgW5jz" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center gap-2.5 px-4 py-3.5 bg-slate-950/80 hover:bg-[#00ffcc]/10 border border-[#00ffcc]/30 hover:border-[#00ffcc] text-slate-200 hover:text-white rounded-2xl transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(0,255,204,0.25)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc] group-hover:scale-125 transition-transform duration-300 shadow-[0_0_8px_#00ffcc]" />
            <span className="tracking-wider uppercase text-[10px] md:text-[11px] font-bold">Live Earth Feed</span>
            <ExternalLink size={14} className="text-[#00ffcc] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 ml-auto sm:ml-0" />
          </a>

          {/* Official NASA ISS Gallery Link */}
          <a 
            href="https://www.nasa.gov/?search=ISS&content_type=gallery" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center gap-2.5 px-4 py-3.5 bg-slate-950/80 hover:bg-[#00ffcc]/10 border border-[#00ffcc]/30 hover:border-[#00ffcc] text-slate-200 hover:text-white rounded-2xl transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(0,255,204,0.25)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc] group-hover:scale-125 transition-transform duration-300 shadow-[0_0_8px_#00ffcc]" />
            <span className="tracking-wider uppercase text-[10px] md:text-[11px] font-bold">NASA ISS Gallery</span>
            <ExternalLink size={14} className="text-[#00ffcc] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 ml-auto sm:ml-0" />
          </a>

        </div>
      </motion.div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center bg-slate-900/90 border border-white/10 p-3 md:p-6 rounded-3xl shadow-[0_0_60px_rgba(0,255,204,0.15)] overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-950/80 hover:bg-[#00ffcc]/20 text-slate-300 hover:text-[#00ffcc] border border-white/10 hover:border-[#00ffcc]/50 transition-all duration-200"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              {/* Full Image */}
              <div className="w-full flex items-center justify-center overflow-hidden rounded-2xl bg-black/40">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className="max-h-[75vh] w-auto object-contain rounded-xl"
                />
              </div>

              {/* Caption */}
              <div className="mt-4 text-center">
                <p className="text-slate-300 font-mono text-xs md:text-sm tracking-wide">
                  {selectedImage.alt}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}