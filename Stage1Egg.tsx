import { motion } from "motion/react";

import type { FoxStageProps } from "../FoxEvolution"; // We'll assume types are passed

// Base modification template for Stages 1 to 4 & 6,7
export function Stage1Egg({ progress = 0 }: FoxStageProps) {
  const glowOpacity = 0.4 + (progress / 100) * 0.5;
  const glowStyle = { filter: `drop-shadow(0 0 ${10 + progress/2}px rgba(56, 189, 248, ${glowOpacity}))` };

  const numStars = Math.floor(10 + (progress / 100) * 25);
  const pulseSpeed = 3.5 - (progress / 100) * 1.5; // pulses faster as progress increases

  const stars = Array.from({ length: numStars }).map((_, i) => ({
    x: 200 + Math.random() * 400,
    y: 150 + Math.random() * 300,
    size: 2 + Math.random() * 3,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
  }));

  return (
    <motion.svg style={glowStyle} width="100%" height="100%" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="soft-shadow">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#3B0764" floodOpacity="0.15" />
        </filter>
        <filter id="glow-light">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Floating Magic Dust / Stars */}
      {stars.map((s, i) => (
        <motion.circle
          key={`star-${i}`}
          cx={s.x}
          cy={s.y}
          r={s.size}
          fill="#FEF08A"
          filter="url(#glow-light)"
          animate={{ y: [0, -20, 0], opacity: [0, 0.8, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Soft Pastel Cloud / Nest Base */}
      <motion.g animate={{ y: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }} opacity="0.95" filter="url(#soft-shadow)">
        <ellipse cx="400" cy="630" rx="150" ry="35" fill="#E9D5FF" opacity="0.8" />
        <ellipse cx="400" cy="620" rx="110" ry="25" fill="#F3E8FF" opacity="0.9" />
        <ellipse cx="400" cy="610" rx="70" ry="15" fill="#FAF5FF" />
      </motion.g>

      <g filter="url(#soft-shadow)">
        {/* Magic Egg Wrapper - Gentle bouncing */}
        <motion.g
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: pulseSpeed, repeat: Infinity, ease: "easeInOut" }}
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

          {/* Sparkle/Gloss Top Left */}
          <ellipse cx="320" cy="330" rx="18" ry="40" transform="rotate(-35 320 330)" fill="#FFFFFF" opacity="0.75" />
          <circle cx="365" cy="275" r="9" fill="#FFFFFF" opacity="0.75" />
        </motion.g>
      </g>
    </motion.svg>
  );
}
