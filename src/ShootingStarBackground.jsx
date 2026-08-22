import React, { useRef, useEffect, useState } from 'react';

export default function ShootingStarBackground({ children }) {
  const canvasRef = useRef(null);
  
  const [polarStarUnlocked, setPolarStarUnlocked] = useState(false);
  const [moonUnlocked, setMoonUnlocked] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const dpr = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Star density logic
    const starCount = Math.floor((window.innerWidth * window.innerHeight) / 10000);
    const normalStars = Array.from({ length: Math.min(starCount, 200) }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 1.2,
      opacity: Math.random(),
      blinkSpeed: 0.003 + Math.random() * 0.005
    }));

    let shootingStars = [];
    const createShootingStar = () => {
      if (document.hidden) return;
      const angle = Math.PI * 1 + (Math.random() - 0.5) * 0.8; 
      shootingStars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 0.6,
        len: 80 + Math.random() * 100,
        speed: 2 + Math.random() * 5,
        size: 0.8 + Math.random() * 0.7,
        opacity: 0,
        fadeIn: true,
        fadeSpeed: 0.02 + Math.random() * 0.05,
        angle
      });
    };

    const spawnInterval = setInterval(() => {
      if (Math.random() > 0.5) createShootingStar();
    }, 3000);

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      
      // Draw static background stars
      normalStars.forEach(s => {
        s.opacity += s.blinkSpeed;
        if (s.opacity > 1 || s.opacity < 0.2) s.blinkSpeed *= -1;
        ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
        ctx.beginPath(); 
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); 
        ctx.fill();
      });

      // Draw active shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        const tx = s.x - Math.cos(s.angle) * s.len;
        const ty = s.y - Math.sin(s.angle) * s.len;
        
        const sGrad = ctx.createLinearGradient(s.x, s.y, tx, ty);
        sGrad.addColorStop(0, `rgba(255, 255, 255, ${s.opacity})`);
        sGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        
        ctx.strokeStyle = sGrad; 
        ctx.lineWidth = s.size;
        ctx.lineCap = 'round';
        ctx.beginPath(); 
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        s.x += Math.cos(s.angle) * s.speed; 
        s.y += Math.sin(s.angle) * s.speed;

        if (s.fadeIn) {
          s.opacity += s.fadeSpeed;
          if (s.opacity >= 1) { s.opacity = 1; s.fadeIn = false; }
        } else { 
          s.opacity -= 0.015; 
        }

        if ((s.opacity <= 0 && !s.fadeIn) || s.x < -200 || s.x > window.innerWidth + 200 || s.y > window.innerHeight + 200) {
          shootingStars.splice(i, 1);
        }
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => { 
      cancelAnimationFrame(animationFrameId); 
      clearInterval(spawnInterval); 
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Big Dipper coordinates
  const bigDipperStars = [
    { x: '5vw', y: '20vh', delay: '0s' }, 
    { x: '12vw', y: '18vh', delay: '0.5s' }, 
    { x: '18vw', y: '22vh', delay: '1.2s' }, 
    { x: '22vw', y: '30vh', delay: '0.8s' }, 
    { x: '23vw', y: '40vh', delay: '2.1s' }, 
    { x: '32vw', y: '41vh', delay: '1.5s' }, 
    { x: '33vw', y: '31vh', delay: '0.3s' }, 
  ];

  const OrionBriefing = ({ isUnlocked }) => {
    if (!isUnlocked) return null;
    return (
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 px-5 py-4 bg-[#020617]/90 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[100] border border-white/20 backdrop-blur-md translate-y-2 group-hover:translate-y-0 min-w-[260px] sm:min-w-[280px] pointer-events-none">
        <div className="absolute top-[98%] left-1/2 -translate-x-1/2 w-4 h-4 bg-[#020617] rotate-45 border-r border-b border-white/20" />
        <div className="flex flex-col gap-3">
          <div className="border-b border-white/10 pb-2">
            <h4 className="text-[11px] sm:text-[12px] font-black uppercase tracking-widest text-blue-400 text-center">Orion Capsule "Integrity"</h4>
            <p className="text-[8px] sm:text-[9px] text-white/40 font-mono mt-0.5 uppercase tracking-tighter italic text-center">Mission: Journey around the Moon</p>
          </div>
          <div className="space-y-1.5">
            <span className="text-[9px] sm:text-[10px] text-white/60 uppercase font-bold tracking-tighter text-center block">Flight Crew:</span>
            <ul className="text-[10px] sm:text-[11px] space-y-1 font-medium italic">
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-blue-400 rounded-full" /> Reid Wiseman</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-blue-400 rounded-full" /> Victor Glover</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-blue-400 rounded-full" /> Christina Koch</li>
              <li className="flex items-center gap-2"><span className="w-1 h-1 bg-blue-400 rounded-full" /> Jeremy Hansen</li>
            </ul>
          </div>
          <div className="pt-3 border-t border-white/10 flex flex-col items-center gap-1">
             <span className="text-yellow-400 text-[11px] sm:text-[12px] font-black uppercase tracking-wider">Rise (ZGI)</span>
             <span className="text-white/80 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] mt-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                Godspeed Artemis II
             </span>
          </div>
        </div>
      </div>
    );
  };

  const CraterTooltip = ({ name, isUnlocked }) => {
    if (!isUnlocked) return null;
    return (
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-3 py-2 bg-[#020617] text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] whitespace-nowrap text-[9px] sm:text-[10px] font-black uppercase border border-white/10 pointer-events-none translate-y-2 group-hover:translate-y-0">
        <div className="absolute top-[95%] left-1/2 -translate-x-1/2 w-3 h-3 bg-[#020617] rotate-45 border-r border-b border-white/10" />
        {name}
      </div>
    );
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-[#020617]">
      <style>{`
        @keyframes starBlink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        .animate-star-blink { animation: starBlink 4s infinite ease-in-out; }
        @keyframes coronaPulse {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.5; transform: translate(-50%, -50%) scale(1.1); }
        }
        .animate-corona { animation: coronaPulse 8s infinite ease-in-out; }
        @keyframes orionFloat {
          0%, 100% { transform: translate(0, 0) rotate(-15deg); }
          50% { transform: translate(-5px, -10px) rotate(-12deg); }
        }
        .animate-orion { animation: orionFloat 10s infinite ease-in-out; }
      `}</style>

      {/* BACKGROUND CANVAS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* NORTH STAR (POLARIS) */}
      <div className="absolute top-[2.6%] left-[25%] md:left-[66%] z-[66] -translate-x-1/2 -translate-y-1/2">
        <div 
          className="relative group cursor-pointer pointer-events-auto"
          onClick={() => setPolarStarUnlocked(!polarStarUnlocked)}
        >
          <div className="absolute inset-0 w-8 h-8 sm:w-10 sm:h-10 -translate-x-1/2 -translate-y-1/2 bg-white/10 blur-2xl rounded-full" />
          <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white rounded-full shadow-[0_0_15px_4px_rgba(255,255,255,1)]" />
          <CraterTooltip name="Polaris (The North Star)" isUnlocked={true} />
        </div>
      </div>

      {/* BIG DIPPER CONSTELLATION */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {bigDipperStars.map((star, index) => (
          <div 
            key={index}
            className="absolute bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-star-blink"
            style={{ 
              left: star.x, 
              top: star.y, 
              width: 'clamp(2px, 0.4vw, 4px)', 
              height: 'clamp(2px, 0.4vw, 4px)', 
              animationDelay: star.delay 
            }}
          />
        ))}
      </div>

      {/* ORION CAPSULE */}
      <div className={`absolute top-[5%] right-[10%] md:top-[13%] md:right-[19%] z-40 animate-orion transition-all duration-1000 ease-in-out scale-75 sm:scale-90 md:scale-100
        ${moonUnlocked ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="relative group">
          <OrionBriefing isUnlocked={true} />
          <svg width="100" height="80" viewBox="0 0 120 100" fill="none" className="cursor-pointer">
            <g opacity="0.9">
              <rect x="10" y="45" width="40" height="8" rx="1" fill="#1e293b" stroke="#334155" />
              <rect x="70" y="45" width="40" height="8" rx="1" fill="#1e293b" stroke="#334155" />
              <rect x="56" y="10" width="8" height="35" rx="1" fill="#1e293b" stroke="#334155" />
              <rect x="56" y="55" width="8" height="35" rx="1" fill="#1e293b" stroke="#334155" />
            </g>
            <rect x="48" y="42" width="24" height="16" fill="#94a3b8" />
            <path d="M50 42L60 28L70 42H50Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5" />
            <rect x="58" y="34" width="4" height="3" rx="0.5" fill="#fbbf24" className="animate-pulse" />
          </svg>
        </div>
      </div>

      {/* MOON SYSTEM */}
      <div className="absolute top-6 right-6 sm:top-12 sm:right-12 md:top-20 md:right-28 z-30 scale-60 sm:scale-85 md:scale-100">
        <div 
          className="relative w-24 h-24 cursor-pointer pointer-events-auto"
          onClick={() => setMoonUnlocked(!moonUnlocked)}
        >
          <div className="absolute top-1/2 left-1/2 w-40 h-40 rounded-full bg-blue-100/20 blur-3xl animate-corona pointer-events-none" />
          <div className="relative w-full h-full">
            <div className="absolute inset-0 rounded-full bg-[#f1f5f9] shadow-[inset_-5px_0_15px_rgba(255,255,255,1),0_0_30px_rgba(255,255,255,0.15)] overflow-hidden pointer-events-none">
                <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/pollen.png')]" />
                <div 
                  className="absolute w-[120%] h-[120%] rounded-full -top-[10%] -left-[95%] shadow-[15px_0_25px_rgba(0,0,0,0.8)]"
                  style={{
                    background: 'radial-gradient(circle at 75% 50%, rgba(2,6,23,0) 0%, #020617 50%, #020617 100%)',
                    backgroundColor: '#020617' 
                  }}
                />
            </div>

            <div className="absolute top-6 right-6 w-3 h-3 group z-50" onClick={(e) => e.stopPropagation()}>
              <CraterTooltip name="In memory of Carroll Taylor Wiseman 🕊️" isUnlocked={moonUnlocked} />
              <div className="w-full h-full rounded-full bg-white shadow-[0_0_12px_4px_white,inset_0_0_4px_rgba(0,0,0,0.3)] opacity-90" />
            </div>
            
            <div className="absolute top-14 right-8 w-4 h-4 group z-50" onClick={(e) => e.stopPropagation()}>
              <CraterTooltip name="Integrity 🚀" isUnlocked={moonUnlocked} />
              <div className="w-full h-full rounded-full bg-slate-400/40 blur-[1px] shadow-[inset_0_0_6px_rgba(0,0,0,0.5)]" />
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT LAYER */}
      <div className="relative z-20 w-full min-h-screen">
        {children}
      </div>
    </div>
  );
}