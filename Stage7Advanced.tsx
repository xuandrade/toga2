import { motion } from "motion/react";

import type { FoxStageProps } from "../FoxEvolution";

export function Stage7Advanced({ progress = 0 }: FoxStageProps) {
  const glowOpacity = 0.5 + (progress / 100) * 0.4;
  const glowStyle = { filter: `drop-shadow(0 0 ${15 + progress/4}px rgba(168, 85, 247, ${glowOpacity}))` };

  const numParticles = Math.floor(25 + (progress / 100) * 30);
  const particles = Array.from({ length: numParticles }).map((_, i) => ({
    cx: Math.random() * 800,
    cy: Math.random() * 800,
    r: Math.random() * 3 + 1,
    duration: Math.random() * 4 + 4,
    delay: Math.random() * 2,
  }));
  
  const crownGlowScale = 1 + (progress / 100) * 0.5;

  return (
    <motion.svg style={glowStyle} width="100%" height="100%" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="fox-purple" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="50%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#6B21A8" />
        </radialGradient>
        <linearGradient id="fox-cream" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FAFAF9" />
          <stop offset="100%" stopColor="#E9D5FF" />
        </linearGradient>
        <linearGradient id="royal-robe" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4C1D95" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>
        <filter id="soft-shadow">
          <feDropShadow dx="0" dy="15" stdDeviation="15" floodColor="#3B0764" floodOpacity="0.6" />
        </filter>
        <filter id="glow-gold">
          <feGaussianBlur stdDeviation="8" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
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

      {/* Floating Particles */}
      {particles.map((p, i) => (
        <motion.circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="#FDE68A" filter="url(#glow-magic)" animate={{ y: [0, -50, 0], opacity: [0, 0.8, 0] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }} />
      ))}

      {/* Royal Throne backrest */}
      <path d="M250 200 C300 100, 500 100, 550 200 L600 600 L200 600 Z" fill="#2E1065" stroke="#F59E0B" strokeWidth="8" opacity="0.8" />
      <path d="M280 200 C320 130, 480 130, 520 200" fill="none" stroke="#FBBF24" strokeWidth="6" />
      
      {/* Candles flickering naturally */}
      <motion.g animate={{ opacity: [0.7, 1, 0.8, 1, 0.7] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
        <rect x="180" y="450" width="15" height="40" fill="#FEF3C7" />
        <ellipse cx="187.5" cy="450" rx="7.5" ry="3" fill="#D97706" />
        <motion.path d="M187.5 450 Q187.5 435 195 430 Q180 440 187.5 450" fill="#FBBF24" filter="url(#glow-gold)" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
      </motion.g>
      <motion.g animate={{ opacity: [0.6, 0.9, 0.7, 0.9, 0.6] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}>
        <rect x="620" y="430" width="15" height="60" fill="#FEF3C7" />
        <ellipse cx="627.5" cy="430" rx="7.5" ry="3" fill="#D97706" />
        <motion.path d="M627.5 430 Q627.5 415 635 410 Q620 420 627.5 430" fill="#FBBF24" filter="url(#glow-gold)" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 0.6, repeat: Infinity }} />
      </motion.g>

      <g filter="url(#soft-shadow)">
        {/* Tail (Wrapped majestically around the front base) */}
        <motion.g animate={{ scaleY: [1, 1.02, 1] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "400px 700px" }}>
          <path d="M150 680 C200 780, 500 800, 650 720 C700 680, 650 550, 500 600 C350 650, 200 620, 150 680 Z" fill="url(#fox-purple)" />
          <path d="M650 720 C600 650, 500 640, 450 660 C550 680, 650 630, 650 720 Z" fill="url(#fox-cream)" />
        </motion.g>

        {/* Majestic Flowing Dress/Robe & Breathing Body */}
        <motion.g animate={{ scaleY: [1, 1.015, 1], y: [0, -3, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "400px 750px" }}>
          <path d="M300 480 C150 600, 120 750, 400 750 C680 750, 650 600, 500 480 Z" fill="url(#royal-robe)" />
          
          {/* Body inside Robe */}
          <path d="M340 440 C340 550, 460 550, 460 440 Z" fill="url(#fox-purple)" />
          <path d="M360 440 C360 520, 440 520, 440 440 Z" fill="url(#fox-cream)" />
  
          {/* Robe Collar / Ornaments */}
          <path d="M280 450 C320 520, 480 520, 520 450 C450 580, 350 580, 280 450 Z" fill="#FBBF24" filter="url(#glow-gold)" />
          <circle cx="400" cy="530" r="25" fill="#3B0764" stroke="#FBBF24" strokeWidth="6" />
          <motion.circle cx="400" cy="530" r="10" fill="#D8B4FE" filter="url(#glow-magic)" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity }} />
        </motion.g>

        {/* Left Arm holding Royal Scepter */}
        <g transform="translate(0, 0)">
          <motion.path d="M320 520 C290 560, 260 620, 290 650" stroke="url(#fox-purple)" strokeWidth="26" strokeLinecap="round" animate={{ d: ["M320 520 C290 560, 260 620, 290 650", "M320 517 C290 557, 260 617, 290 647", "M320 520 C290 560, 260 620, 290 650"] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
          
          <motion.g animate={{ y: [-5, 5, -5] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} transform="translate(260, 630)">
            {/* The Queen's Scepter */}
            <rect x="0" y="-180" width="8" height="220" fill="#B45309" />
            <ellipse cx="4" cy="-180" rx="15" ry="5" fill="#FBBF24" />
            <path d="M-15 -180 L4 -230 L23 -180 Z" fill="#9333EA" filter="url(#glow-magic)" />
            <motion.circle cx="4" cy="-200" r="6" fill="#FFF" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          </motion.g>
        </g>

        {/* Right Arm resting elegantly */}
        <g transform="translate(0, 0)">
          <motion.path d="M480 520 C510 560, 540 620, 510 650" stroke="url(#fox-purple)" strokeWidth="26" strokeLinecap="round" animate={{ d: ["M480 520 C510 560, 540 620, 510 650", "M480 517 C510 557, 540 617, 510 647", "M480 520 C510 560, 540 620, 510 650"] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
          <motion.path d="M525 640 C505 660, 495 645, 505 650" stroke="url(#fox-purple)" strokeWidth="20" strokeLinecap="round" animate={{ y: [0, -3, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />
        </g>

        {/* Regal Head */}
        <motion.g animate={{ rotate: [-1, 1, -1], y: [-3, 3, -3] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "400px 440px" }}>
          {/* Subtle slow ear movements */}
          <motion.g animate={{ rotate: [0, -2, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} style={{ transformOrigin: "290px 320px" }}>
            <path d="M290 320 L180 140 C210 160, 330 240, 340 280 Z" fill="url(#fox-purple)" />
            <path d="M290 300 L200 160 C230 180, 320 250, 325 280 Z" fill="#F3E8FF" />
          </motion.g>
          <motion.g animate={{ rotate: [0, 2, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 2 }} style={{ transformOrigin: "510px 320px" }}>
            <path d="M510 320 L620 140 C590 160, 470 240, 460 280 Z" fill="url(#fox-purple)" />
            <path d="M510 300 L600 160 C570 180, 480 250, 475 280 Z" fill="#F3E8FF" />
          </motion.g>

          {/* Mature, beautiful Head Shape */}
          <path d="M400 240 C220 240, 180 430, 270 510 C320 550, 480 550, 530 510 C620 430, 580 240, 400 240 Z" fill="url(#fox-purple)" />
          <path d="M270 460 C330 520, 470 520, 530 460 C480 420, 320 420, 270 460 Z" fill="url(#fox-cream)" />

          {/* Elegant Crystal Crown - Fixed Position & Perfect Fit */}
          <motion.g transform="translate(400, 230)" animate={{ y: [-2, 2, -2] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
            <path d="M-60 15 L-40 -20 L-15 10 L0 -40 L15 10 L40 -20 L60 15 Q0 35 -60 15 Z" fill="#FBBF24" filter="url(#glow-gold)" stroke="#D97706" strokeWidth="2" />
            <path d="M0 -40 L-8 5 L8 5 Z" fill="#C084FC" />
            <motion.circle cx="0" cy="-40" r="5" fill="#FFF" filter="url(#glow-magic)" animate={{ scale: [crownGlowScale, crownGlowScale * 1.3, crownGlowScale], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }} />
            <circle cx="-40" cy="-20" r="4" fill="#FFF" />
            <circle cx="40" cy="-20" r="4" fill="#FFF" />
          </motion.g>

          <ellipse cx="400" cy="475" rx="15" ry="10" fill="#2E1065" />
          <ellipse cx="404" cy="471" rx="4" ry="2" fill="#FFF" />

          {/* Soft, wise, royal eyes - Blinking slowly */}
          <motion.g animate={{ scaleY: [1, 1, 0.1, 1, 1, 1, 1, 1, 1, 1] }} transition={{ duration: 6.5, repeat: Infinity, times: [0, 0.2, 0.23, 0.28, 0.4, 0.6, 0.65, 0.7, 0.9, 1] }} style={{ transformOrigin: "400px 390px" }}>
            <ellipse cx="310" cy="390" rx="22" ry="28" fill="#2E1065" />
            <ellipse cx="490" cy="390" rx="22" ry="28" fill="#2E1065" />
            <circle cx="318" cy="378" r="9" fill="#FFF" />
            <circle cx="298" cy="402" r="3" fill="#FFF" />
            <circle cx="498" cy="378" r="9" fill="#FFF" />
            <circle cx="478" cy="402" r="3" fill="#FFF" />
          </motion.g>

          <path d="M270 345 Q310 335 350 360" stroke="#2E1065" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M530 345 Q490 335 450 360" stroke="#2E1065" strokeWidth="6" fill="none" strokeLinecap="round" />
        </motion.g>
      </g>
    </motion.svg>
  );
}
