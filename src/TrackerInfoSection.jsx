import React, { useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

// NASA Black Marble Texture
const EARTH_NIGHT_MAP = 'https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/144000/144898/BlackMarble_2016_01deg.jpg';

function Earth() {
  const meshRef = useRef();
  const nightTexture = useLoader(THREE.TextureLoader, EARTH_NIGHT_MAP);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.06;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} scale={[1, 1, 1]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#050505"
          emissive={new THREE.Color('#ffcc77')}
          emissiveMap={nightTexture}
          emissiveIntensity={2.5}
          roughness={0.8}
        />
      </mesh>
      {/* Atmosphere Glow Effect */}
      <mesh scale={[1.02, 1.02, 1.02]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#1e3a8a"
          transparent={true}
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

export default function TrackerInfoSection() {
  return (
    <section id="tracker-info" className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-24 text-white font-sans overflow-hidden">
      
      {/* 1. Header & Intro */}
      <div className="text-center mb-12 md:mb-20">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4"
        >
          <h2 className="text-blue-400/50 uppercase text-[9px] md:text-[10px] font-mono font-bold tracking-[0.6em] md:tracking-[0.8em]">
            Orbital Data
          </h2>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight text-white font-sans"
        >
          The ISS Tracker 🛰️
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="italic text-slate-400 text-sm md:text-base px-4 font-sans tracking-wide"
        >
          "A real-time window to humanity's greatest engineering marvel."
        </motion.p>
      </div>

      {/* 2. Main Content Grid (Earth & Info) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
        
        {/* Rotating Earth */}
        <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] w-full flex justify-center items-center order-1 lg:order-1">
          <div className="absolute w-48 h-48 md:w-72 md:h-72 bg-blue-600/10 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />
          
          <Canvas
            camera={{ position: [0, 0, 2.8], fov: 45 }}
            style={{ width: '100%', height: '100%', background: 'transparent' }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]}
          >
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={0.8} color="#1e3a8a" />
            <Suspense fallback={null}>
              <Earth />
            </Suspense>
          </Canvas>
        </div>

        {/* ISS Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-6 order-2 lg:order-2"
        >
          <div className="flex items-center gap-3 justify-center lg:justify-start">
            <span className="text-xl">📡</span>
            <h3 className="text-xl font-mono font-bold text-white uppercase text-[12px] tracking-[0.3em]">
              Mission Control Data
            </h3>
          </div>
          
          <div className="backdrop-blur-md bg-white/[0.03] border border-white/10 p-5 md:p-8 rounded-3xl shadow-2xl">
            <p className="text-slate-300 leading-relaxed mb-8 text-sm md:text-base text-center lg:text-left font-sans tracking-normal">
              This system intercepts public API telemetry to plot the live coordinates of the International Space Station. Orbiting in the thermosphere, it serves as a microgravity laboratory and the ultimate testament to international cooperation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 pt-6 border-t border-white/5">
              {[
                { icon: '🛰️', text: 'Avg. Altitude:', bold: '~400 km above Earth' },
                { icon: '☄️', text: 'Velocity:', bold: '28,000 km/h (Mach 23)' },
                { icon: '🌍', text: 'Orbital Period:', bold: '~93 Minutes per lap' },
                { icon: '👨‍🚀', text: 'Continuously inhabited since:', bold: 'November 2000' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-xs md:text-sm text-slate-300 font-sans">
                  <span className="w-6 text-center font-mono">{item.icon}</span>
                  <p>{item.text} <span className="text-white font-semibold font-mono tracking-wide">{item.bold}</span></p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

    </section>
  );
}