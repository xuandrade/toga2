import { motion } from "motion/react";
import type { FoxStageProps } from "../FoxEvolution";

export function Stage8Master({ progress = 100, emotion = 'idle', milestones = { hasAura: true, hasBooks: true, hasRunes: true, hasCrown: true, hasCosmic: true } }: FoxStageProps) {
  // Master stage majestic scaling - Progress controls aura width and particle count
  const auraScale = 0.95 + (progress / 100) * 0.2; 
  const glowOpacity = 0.6 + (progress / 100) * 0.4;
  
  // Emotion modifiers
  const isHappy = emotion === 'happy' || emotion === 'excited';
  const isFocused = emotion === 'focused';
  
  const eyeBlink = isHappy ? { scaleY: [1, 0.1, 1], transition: { duration: 0.3, repeat: Infinity, repeatDelay: 3 } } 
                 : isFocused ? { scaleY: 0.9 } // Squinting
                 : { scaleY: [1, 0.1, 1], transition: { duration: 0.2, repeat: Infinity, repeatDelay: 5 } };
                 
  const orbitSpeed = isFocused ? 15 : isHappy ? 25 : 40;

  // Star counts tied to progress
  const numStars = Math.floor(30 + (progress / 100) * 50);
  const stars = Array.from({ length: numStars }).map((_, i) => ({
    cx: Math.random() * 800,
    cy: Math.random() * 800,
    r: Math.random() * 2 + 1,
    duration: Math.random() * 4 + 2,
    delay: Math.random() * 2,
  }));

  const planets = [
    { x: 120, y: 250, r: 25, color: "url(#planet-blue)", delay: 0, duration: 6, ring: true },
    { x: 680, y: 300, r: 35, color: "url(#planet-red)", delay: 1, duration: 7, ring: false },
    { x: 200, y: 700, r: 18, color: "url(#planet-gold)", delay: 2, duration: 5, ring: false },
    { x: 650, y: 700, r: 22, color: "url(#planet-green)", delay: 0.5, duration: 5.5, ring: true },
  ];

  return (
    <motion.svg 
      style={{ filter: `drop-shadow(0 0 ${20 + progress/2}px rgba(217, 70, 239, ${glowOpacity})) drop-shadow(0 0 ${40 + progress/2}px rgba(139, 92, 246, ${glowOpacity - 0.2}))` }} 
      width="100%" height="100%" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="fox-purple" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="50%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#6B21A8" />
        </radialGradient>
        <linearGradient id="fox-cream" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E9D5FF" />
        </linearGradient>
        <linearGradient id="astral-robe" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>
        <radialGradient id="epic-aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#C084FC" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="throne-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        
        {/* Planet Gradients */}
        <radialGradient id="planet-blue" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#0369A1" />
        </radialGradient>
        <radialGradient id="planet-red" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FCA5A5" />
          <stop offset="100%" stopColor="#991B1B" />
        </radialGradient>
        <radialGradient id="planet-gold" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#A16207" />
        </radialGradient>
        <radialGradient id="planet-green" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="100%" stopColor="#047857" />
        </radialGradient>

        <filter id="soft-shadow">
          <feDropShadow dx="0" dy="15" stdDeviation="20" floodColor="#0F172A" floodOpacity="0.6" />
        </filter>
        <filter id="heavy-glow">
          <feGaussianBlur stdDeviation="15" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-gold">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-magic">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Massive Astral Background Aura */}
      <motion.circle cx="400" cy="450" r={380 * auraScale} fill="url(#epic-aura)" animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.7 * glowOpacity, 1 * glowOpacity, 0.7 * glowOpacity] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />

      {/* Galaxy Swirl / Orbit Rings in Background based on Milestones */}
      {milestones.hasCosmic && (
        <motion.g animate={{ rotate: -360 }} transition={{ duration: orbitSpeed, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "400px 450px" }} opacity="0.8">
          <ellipse cx="400" cy="450" rx="350" ry="100" fill="none" stroke="#8B5CF6" strokeWidth="3" strokeDasharray="15 30" filter="url(#glow-magic)" transform="rotate(30 400 450)" />
          <ellipse cx="400" cy="450" rx="350" ry="100" fill="none" stroke="#38BDF8" strokeWidth="3" strokeDasharray="15 30" filter="url(#glow-magic)" transform="rotate(-30 400 450)" />
          <ellipse cx="400" cy="450" rx="200" ry="300" fill="none" stroke="#FBBF24" strokeWidth="2" strokeDasharray="10 20" filter="url(#glow-gold)" transform="rotate(45 400 450)" />
        </motion.g>
      )}

      {/* Starfield Particles */}
      {stars.map((p, i) => (
        <motion.circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="#FFF" filter="url(#glow-magic)" animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }} />
      ))}

      {/* Cloud Base (Throne in the Sky) */}
      <motion.g animate={{ x: [-10, 10, -10] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} opacity="0.4">
        <path d="M100 700 C100 650, 200 650, 250 680 C350 620, 450 620, 550 680 C600 650, 700 650, 700 700 Z" fill="#E2E8F0" filter="url(#heavy-glow)" />
        <path d="M50 750 C50 700, 150 700, 200 730 C300 680, 500 680, 600 730 C650 700, 750 700, 750 750 Z" fill="#CBD5E1" filter="url(#heavy-glow)" />
      </motion.g>

      {/* Floating Planets around the Queen */}
      {milestones.hasCosmic && planets.map((planet, i) => (
        <motion.g key={`planet-${i}`} animate={{ y: [-15, 15, -15], rotate: [0, 360] }} transition={{ duration: planet.duration, repeat: Infinity, delay: planet.delay, ease: "linear" }} transform={`translate(${planet.x}, ${planet.y})`}>
          {planet.ring && <ellipse cx="0" cy="0" rx={planet.r * 2} ry={planet.r * 0.4} fill="none" stroke="#FFF" strokeWidth="2" opacity="0.8" filter="url(#glow-magic)" transform="rotate(25)" />}
          <circle cx="0" cy="0" r={planet.r} fill={planet.color} filter="url(#soft-shadow)" />
          {planet.ring && <path d={`M${-planet.r} 0 A${planet.r} ${planet.r} 0 0 0 ${planet.r} 0`} fill="none" stroke="#000" strokeWidth="4" opacity="0.3" />}
        </motion.g>
      ))}

      <g filter="url(#soft-shadow)">
        {/* Heavenly Throne */}
        <path d="M220 300 C220 150, 580 150, 580 300 L620 500 L650 700 L150 700 L180 500 Z" fill="#1E1B4B" opacity="0.8" stroke="url(#throne-gold)" strokeWidth="6" />
        {/* Throne Ornaments / Backrest details */}
        <path d="M250 280 C320 200, 480 200, 550 280" fill="none" stroke="url(#throne-gold)" strokeWidth="8" />
        <path d="M300 250 L400 150 L500 250" fill="none" stroke="url(#throne-gold)" strokeWidth="4" />
        <circle cx="400" cy="150" r="15" fill="url(#throne-gold)" filter="url(#glow-gold)" />
        <path d="M350 220 L400 150 L450 220" fill="none" stroke="url(#throne-gold)" strokeWidth="2" />

        {/* Majestic Tails mimicking Nebula Clouds, wrapping gracefully */}
        <motion.g animate={{ rotate: [-2, 2, -2] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "400px 600px" }}>
          {/* Outer Left Tail */}
          <path d="M300 650 C50 700, 0 350, 150 250 C250 150, 320 450, 300 650 Z" fill="url(#fox-purple)" opacity="0.9" />
          <path d="M150 250 C200 150, 250 200, 250 300" fill="none" stroke="url(#fox-cream)" strokeWidth="20" strokeLinecap="round" opacity="0.5" />
          
          {/* Outer Right Tail */}
          <path d="M500 650 C750 700, 800 350, 650 250 C550 150, 480 450, 500 650 Z" fill="url(#fox-purple)" opacity="0.9" />
          <path d="M650 250 C600 150, 550 200, 550 300" fill="none" stroke="url(#fox-cream)" strokeWidth="20" strokeLinecap="round" opacity="0.5" />
          
          {/* Main Center Tail draped gracefully */}
          <path d="M400 650 C650 850, 750 400, 600 250 C450 100, 350 450, 400 650 Z" fill="url(#fox-purple)" />
          <path d="M600 250 C500 150, 450 250, 420 350 C480 350, 600 300, 600 250 Z" fill="url(#fox-cream)" />
          
          {/* Nebula Swirl inside Center Tail */}
          <motion.path d="M400 450 C500 350, 600 300, 550 250" fill="none" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" filter="url(#glow-gold)" opacity="0.5" animate={{ strokeDasharray: ["0, 500", "250, 250", "0, 500"], strokeDashoffset: [0, -250, 0] }} transition={{ duration: 6, repeat: Infinity }} />
        </motion.g>

        {/* Epic Cosmic Robe */}
        <path d="M250 450 C150 600, 180 750, 400 750 C620 750, 650 600, 550 450 Z" fill="url(#astral-robe)" />
        {/* Constellation patterns on the robe */}
        <g stroke="#FFF" strokeWidth="1.5" opacity="0.8">
          <circle cx="320" cy="550" r="2.5" /> <circle cx="350" cy="620" r="3" /> <circle cx="280" cy="680" r="2.5" />
          <path d="M320 550 L350 620 L280 680" />
          
          <circle cx="480" cy="550" r="3" /> <circle cx="450" cy="620" r="2.5" /> <circle cx="520" cy="680" r="3" />
          <path d="M480 550 L450 620 L520 680" />
        </g>
        <path d="M330 450 L380 750 M470 450 L420 750" stroke="#38BDF8" strokeWidth="3" filter="url(#glow-magic)" opacity="0.7" />
        
        {/* Body */}
        <path d="M330 380 C280 500, 280 600, 400 600 C520 600, 520 500, 470 380 Z" fill="url(#fox-purple)" />
        <path d="M360 380 C360 500, 440 500, 440 380 Z" fill="url(#fox-cream)" />

        {/* Goddess Cosmic Collar / Shoulder Armor */}
        <path d="M280 380 L400 480 L520 380 L560 410 L400 510 L240 410 Z" fill="#FBBF24" filter="url(#glow-gold)" />
        {milestones.hasRunes && (
          <>
            <circle cx="400" cy="460" r="25" fill="#1E1B4B" stroke="#38BDF8" strokeWidth="4" />
            <circle cx="400" cy="460" r="15" fill="#8B5CF6" filter="url(#heavy-glow)" />
          </>
        )}

        {/* Left Arm channeling a Black Hole or Portal */}
        <g transform="translate(0, 0)">
          <path d="M320 480 C270 520, 230 560, 260 620" stroke="url(#fox-purple)" strokeWidth="26" strokeLinecap="round" />
          <motion.g animate={{ scale: [1, 1.2, 1], rotate: [0, -360] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} transform="translate(250, 590)">
             <circle cx="0" cy="0" r="30" fill="#020617" stroke="#8B5CF6" strokeWidth="4" filter="url(#heavy-glow)" />
             <ellipse cx="0" cy="0" rx="40" ry="12" fill="none" stroke="#C084FC" strokeWidth="3" />
             <ellipse cx="0" cy="0" rx="12" ry="40" fill="none" stroke="#C084FC" strokeWidth="3" />
          </motion.g>
          <path d="M275 615 C300 640, 310 625, 305 615" stroke="url(#fox-purple)" strokeWidth="20" strokeLinecap="round" />
        </g>

        {/* Right Arm holding a Miniature Solar System */}
        <g transform="translate(0, 0)">
          <path d="M480 480 C530 520, 570 560, 540 620" stroke="url(#fox-purple)" strokeWidth="26" strokeLinecap="round" />
          
          <motion.g animate={{ y: [-5, 5, -5] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} transform="translate(550, 570)">
            {/* The Sun / Core */}
            <circle cx="0" cy="0" r="25" fill="#FBBF24" filter="url(#heavy-glow)" />
            <circle cx="0" cy="0" r="10" fill="#FFF" />
            {/* Orbiting Planets in her hand */}
            <motion.g animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
              <ellipse cx="0" cy="0" rx="55" ry="15" fill="none" stroke="#FDE047" strokeWidth="2" opacity="0.8" filter="url(#glow-gold)" />
              <circle cx="55" cy="0" r="6" fill="#38BDF8" filter="url(#glow-magic)" />
            </motion.g>
            <motion.g animate={{ rotate: -360 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }}>
              <ellipse cx="0" cy="0" rx="15" ry="70" fill="none" stroke="#FBBF24" strokeWidth="2" opacity="0.8" filter="url(#glow-gold)" />
              <circle cx="0" cy="70" r="8" fill="#FCA5A5" filter="url(#glow-magic)" />
            </motion.g>
          </motion.g>
          
          <path d="M525 615 C500 640, 490 625, 495 615" stroke="url(#fox-purple)" strokeWidth="20" strokeLinecap="round" />
        </g>

        {/* Head Group (Queen of Planets & Stars) */}
        <motion.g animate={{ y: [-3, 3, -3] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "400px 380px" }}>
          {/* Huge Elegant Majestic Ears */}
          <path d="M280 250 L120 10 C170 30, 340 150, 350 200 Z" fill="url(#fox-purple)" />
          <path d="M280 230 L150 40 C190 60, 330 160, 335 200 Z" fill="#E9D5FF" />
          <path d="M520 250 L680 10 C630 30, 460 150, 450 200 Z" fill="url(#fox-purple)" />
          <path d="M520 230 L650 40 C610 60, 470 160, 465 200 Z" fill="#E9D5FF" />

          {/* Gorgeous Glowing Crown */}
          {milestones.hasCrown && (
            <g transform="translate(400, 160)">
               {/* Crown Base */}
               <path d="M-60 40 L-40 0 L-20 30 L0 -20 L20 30 L40 0 L60 40 Z" fill="#FBBF24" stroke="#B45309" strokeWidth="2" filter="url(#glow-gold)" />
               {/* Crown Jewels */}
               <circle cx="0" cy="-20" r="6" fill="#8B5CF6" filter="url(#glow-magic)" />
               <circle cx="-40" cy="0" r="4" fill="#38BDF8" filter="url(#glow-magic)" />
               <circle cx="40" cy="0" r="4" fill="#38BDF8" filter="url(#glow-magic)" />
               <circle cx="-20" cy="30" r="5" fill="#FCA5A5" />
               <circle cx="20" cy="30" r="5" fill="#FCA5A5" />
               {/* Floating Halo above Crown */}
               <ellipse cx="0" cy="-40" rx="40" ry="10" fill="none" stroke="#FDE047" strokeWidth="3" filter="url(#glow-gold)" />
               <circle cx="0" cy="-40" r="4" fill="#FFF" filter="url(#heavy-glow)" />
            </g>
          )}

          {/* Third Eye Glowing Star (Softened) */}
          <circle cx="400" cy="190" r="8" fill="#FFF" filter="url(#glow-magic)" />
          <path d="M395 190 L405 190 M400 185 L400 195" stroke="#FDE047" strokeWidth="2" filter="url(#glow-gold)" />

          {/* Main Face */}
          <path d="M400 190 C180 190, 140 380, 240 460 C300 510, 500 510, 560 460 C660 380, 620 190, 400 190 Z" fill="url(#fox-purple)" />
          <path d="M240 400 C310 470, 490 470, 560 400 C500 360, 300 360, 240 400 Z" fill="url(#fox-cream)" />

          <ellipse cx="400" cy="435" rx="12" ry="7" fill="#0F172A" />
          <ellipse cx="402" cy="433" rx="3" ry="1.5" fill="#FFF" />

          {/* Divine Eyes (All-seeing, star-filled, no tears) */}
          <motion.g animate={eyeBlink} style={{ transformOrigin: "290px 350px" }}>
            <ellipse cx="290" cy="350" rx="28" ry={isHappy ? 20 : 36} fill="#0F172A" />
            <circle cx="298" cy={isHappy ? 345 : 338} r="14" fill="#38BDF8" filter="url(#heavy-glow)" />
            <circle cx="278" cy={isHappy ? 355 : 362} r="6" fill="#FFF" />
          </motion.g>
          
          <motion.g animate={eyeBlink} style={{ transformOrigin: "510px 350px" }}>
            <ellipse cx="510" cy="350" rx="28" ry={isHappy ? 20 : 36} fill="#0F172A" />
            <circle cx="502" cy={isHappy ? 345 : 338} r="14" fill="#38BDF8" filter="url(#heavy-glow)" />
            <circle cx="522" cy={isHappy ? 355 : 362} r="6" fill="#FFF" />
          </motion.g>

          {/* Graceful Eyelashes / Fur framing the eyes safely without looking like tears */}
          <path d={isHappy ? "M250 330 Q290 300 340 335" : "M255 330 Q290 310 330 335"} stroke="#FBBF24" strokeWidth="6" fill="none" strokeLinecap="round" filter="url(#glow-gold)" opacity="1" />
          <path d={isHappy ? "M550 330 Q510 300 460 335" : "M545 330 Q510 310 470 335"} stroke="#FBBF24" strokeWidth="6" fill="none" strokeLinecap="round" filter="url(#glow-gold)" opacity="1" />
        </motion.g>
      </g>
    </motion.svg>
  );
}

