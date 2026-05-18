import { motion } from "motion/react";

import type { FoxStageProps } from "../FoxEvolution";

export function Stage2CrackingEgg({ progress = 0 }: FoxStageProps) {
  const glowOpacity = 0.5 + (progress / 100) * 0.4;
  const glowStyle = { filter: `drop-shadow(0 0 ${15 + progress/4}px rgba(168, 85, 247, ${glowOpacity}))` };

  const numRays = Math.floor(6 + (progress / 100) * 10);
  const rays = Array.from({ length: numRays }).map((_, i) => ({
    angle: (i * Math.PI) / (numRays / 2),
    delay: Math.random() * 0.5,
  }));
  
  const shakeIntensity = 1 + (progress / 100) * 4;
  const shakeDuration = 0.2 - (progress / 100) * 0.1; // Gets faster
  
  const crackScale = 1 + (progress / 100) * 0.5;

  return (
    <motion.svg style={glowStyle} width="100%" height="100%" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="soft-shadow">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#3B0764" floodOpacity="0.2" />
        </filter>
        <filter id="glow-light">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-heavy">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Bursting Magical Energy Behind Egg */}
      <motion.circle 
        cx="400" cy="450" r="200" 
        fill="#FEF08A" 
        filter="url(#glow-heavy)" 
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }} 
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} 
      />

      {/* Escaping magic rays */}
      <motion.g animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "400px 450px" }}>
        {rays.map((r, i) => (
          <motion.path 
            key={i} 
            d={`M${400 + Math.cos(r.angle) * 150} ${450 + Math.sin(r.angle) * 150} L${400 + Math.cos(r.angle) * 300} ${450 + Math.sin(r.angle) * 300}`} 
            stroke="#FFF" 
            strokeWidth="6" 
            strokeLinecap="round" 
            filter="url(#glow-light)" 
            animate={{ opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: r.delay }}
          />
        ))}
      </motion.g>

      {/* Soft Pastel Cloud / Nest Base */}
      <motion.g opacity="0.95" filter="url(#soft-shadow)">
        <ellipse cx="400" cy="630" rx="150" ry="35" fill="#E9D5FF" opacity="0.8" />
        <ellipse cx="400" cy="620" rx="110" ry="25" fill="#F3E8FF" opacity="0.9" />
        <ellipse cx="400" cy="610" rx="70" ry="15" fill="#FAF5FF" />
      </motion.g>

      <g filter="url(#soft-shadow)">
        {/* Shaking Cracked Egg */}
        <motion.g
          animate={{ x: [-shakeIntensity, shakeIntensity, -shakeIntensity], rotate: [-shakeIntensity/2, shakeIntensity/2, -shakeIntensity/2] }}
          transition={{ duration: shakeDuration, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "400px 620px" }}
        >
          {/* Egg Body */}
          <path d="M400 240 C310 240, 260 390, 260 490 C260 580, 320 620, 400 620 C480 620, 540 580, 540 490 C540 390, 490 240, 400 240 Z" fill="#FEF9C3" />
          
          {/* Egg Bottom Shadow (2D shading) */}
          <path d="M400 620 C320 620, 260 580, 260 490 C260 450, 270 410, 290 370 C270 450, 310 590, 400 600 C490 610, 520 460, 520 400 C530 430, 540 460, 540 490 C540 580, 480 620, 400 620 Z" fill="#FEF08A" />

          {/* Cute Egg Spots/Patterns */}
          <circle cx="320" cy="490" r="30" fill="#FDE047" opacity="0.8" />
          <circle cx="480" cy="530" r="35" fill="#FDE047" opacity="0.8" />
          <circle cx="440" cy="380" r="45" fill="#FDE047" opacity="0.8" />
          <circle cx="350" cy="580" r="20" fill="#FDE047" opacity="0.8" />

          {/* Main Glowing Crack! */}
          <motion.path 
            d="M390 240 L370 300 L410 360 L375 440 L430 490 L390 560" 
            fill="none" 
            stroke="#FFFFFF" 
            strokeWidth={4 + crackScale * 4} 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            filter="url(#glow-heavy)" 
            animate={{ strokeOpacity: [0.6, 1, 0.6], strokeWidth: [4 + crackScale * 2, 4 + crackScale * 8, 4 + crackScale * 2] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.path 
            d="M375 440 L310 470 L280 450" 
            fill="none" 
            stroke="#FFFFFF" 
            strokeWidth="6" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            filter="url(#glow-heavy)" 
            animate={{ strokeOpacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.path 
            d="M410 360 L460 350 L490 380" 
            fill="none" 
            stroke="#FFFFFF" 
            strokeWidth="5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            filter="url(#glow-heavy)" 
            animate={{ strokeOpacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          />

          {/* Tiny shell pieces breaking off slightly */}
          <motion.path d="M380 250 L395 240 L400 260 Z" fill="#FEF9C3" animate={{ y: [-10, -20, -10], x: [-5, -15, -5], rotate: [0, 45, 0] }} transition={{ duration: 0.8, repeat: Infinity }} />
          <motion.path d="M415 360 L430 355 L425 370 Z" fill="#FEF9C3" animate={{ y: [-5, -15, -5], x: [5, 20, 5], rotate: [0, 90, 0] }} transition={{ duration: 1, repeat: Infinity }} />

          {/* Sparkle/Gloss Top Left (Slightly broken by crack) */}
          <ellipse cx="320" cy="330" rx="18" ry="40" transform="rotate(-35 320 330)" fill="#FFFFFF" opacity="0.75" />
        </motion.g>
      </g>
    </motion.svg>
  );
}
