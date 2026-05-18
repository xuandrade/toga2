import { motion } from "motion/react";

import type { FoxStageProps } from "../FoxEvolution";

export function Stage6Strategic({ progress = 0 }: FoxStageProps) {
  const glowOpacity = 0.5 + (progress / 100) * 0.4;
  const glowStyle = { filter: `drop-shadow(0 0 ${15 + progress/4}px rgba(168, 85, 247, ${glowOpacity}))` };

  const arcSpeed = 25 - (progress/100) * 15;
  const crystalScale = 1 + (progress / 100) * 0.4;
  const orbScale = 1 + (progress / 100) * 0.5;

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
        <linearGradient id="robe" x1="0%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#312E81" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>
        <filter id="soft-shadow">
          <feDropShadow dx="0" dy="15" stdDeviation="15" floodColor="#3B0764" floodOpacity="0.5" />
        </filter>
        <filter id="glow-magic-blue">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-magic-orange">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-gold">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Dynamic Elemental Magic Arcs - Much smoother swishing */}
      <motion.g animate={{ rotate: 360 }} transition={{ duration: arcSpeed, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "400px 480px" }}>
        {/* Blue Water/Ice Arc */}
        <motion.path 
          d="M200 480 C150 200, 500 150, 650 350" fill="none" stroke="#38BDF8" strokeWidth="12" strokeLinecap="round" filter="url(#glow-magic-blue)" opacity="0.8"
          animate={{ strokeDasharray: ["0, 1500", "750, 750", "0, 1500"], strokeDashoffset: [0, -1500, -3000] }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        />
        {/* Orange Fire/Energy Arc */}
        <motion.path 
          d="M600 480 C650 750, 300 800, 150 600" fill="none" stroke="#F97316" strokeWidth="12" strokeLinecap="round" filter="url(#glow-magic-orange)" opacity="0.8"
          animate={{ strokeDasharray: ["0, 1500", "750, 750", "0, 1500"], strokeDashoffset: [0, 1500, 3000] }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear", delay: 1 }}
        />
      </motion.g>

      {/* Floating Crystals */}
      <motion.g animate={{ y: [-20, 20, -20], rotate: [-10, 10, -10], scale: crystalScale }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} transform="translate(150, 350)">
        <path d="M0 -30 L15 0 L0 30 L-15 0 Z" fill="#60A5FA" filter="url(#glow-magic-blue)" />
      </motion.g>
      <motion.g animate={{ y: [20, -20, 20], rotate: [10, -10, 10], scale: crystalScale }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} transform="translate(650, 350)">
        <path d="M0 -30 L15 0 L0 30 L-15 0 Z" fill="#FBBF24" filter="url(#glow-magic-orange)" />
      </motion.g>

      <g filter="url(#soft-shadow)">
        {/* Fluffy Powerful Tail */}
        <motion.g animate={{ rotate: [-2, 3, -2] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "400px 650px" }}>
          <path d="M340 650 C600 820, 820 480, 650 350 C540 220, 400 450, 340 650 Z" fill="url(#fox-purple)" />
          <path d="M650 350 C570 260, 480 370, 430 460 C470 460, 620 420, 650 350 Z" fill="url(#fox-cream)" />
        </motion.g>

        {/* Breathing Mage Body & Robe */}
        <motion.g animate={{ scaleY: [1, 1.02, 1], y: [0, -3, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "400px 700px" }}>
          {/* Mage Robe (Dynamic flowing shape) */}
          <path d="M250 480 C200 620, 230 750, 330 720 C420 700, 550 750, 600 700 C650 650, 640 550, 550 480 Z" fill="url(#robe)" />
          
          {/* Body */}
          <path d="M310 440 C260 590, 270 700, 400 700 C530 700, 540 590, 490 440 Z" fill="url(#fox-purple)" />
          <path d="M350 440 C350 560, 450 560, 450 440 Z" fill="url(#fox-cream)" />
  
          {/* Front Robe Cutaway & Belt */}
          <path d="M300 480 L350 680 L400 720 L450 680 L500 480" fill="none" stroke="#FBBF24" strokeWidth="8" strokeLinejoin="round" />
          <motion.circle cx="400" cy="500" r="18" fill="#FBBF24" filter="url(#glow-gold)" animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity }} />
          <circle cx="400" cy="500" r="8" fill="#C084FC" />
        </motion.g>

        {/* Left Arm channeling magic smoothly */}
        <g transform="translate(0, 0)">
          <motion.path d="M300 520 C260 560, 220 580, 200 550" stroke="url(#fox-purple)" strokeWidth="28" strokeLinecap="round" animate={{ d: ["M300 520 C260 560, 220 580, 200 550", "M300 517 C260 557, 220 577, 200 547", "M300 520 C260 560, 220 580, 200 550"] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} />
          
          <motion.g animate={{ y: [0, -5, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}>
            <motion.circle cx="180" cy="540" r="25" fill="#38BDF8" opacity="0.8" filter="url(#glow-magic-blue)" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
            <circle cx="180" cy="540" r="10" fill="#FFF" />
          </motion.g>

          <motion.path d="M210 560 C230 550, 230 565, 215 565" stroke="url(#fox-purple)" strokeWidth="20" strokeLinecap="round" animate={{ y: [0, -5, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} />
        </g>

        {/* Right Arm holding Elemental Staff */}
        <g transform="translate(0, 0)">
          <motion.path d="M500 520 C540 560, 560 600, 520 630" stroke="url(#fox-purple)" strokeWidth="28" strokeLinecap="round" animate={{ d: ["M500 520 C540 560, 560 600, 520 630", "M500 517 C540 557, 560 597, 520 627", "M500 520 C540 560, 560 600, 520 630"] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} />
          
          {/* Mage Holding Staff */}
          <motion.g animate={{ y: [-8, 8, -8], rotate: [13, 17, 13] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} transform="translate(560, 580)">
            <rect x="-8" y="-120" width="16" height="250" rx="6" fill="#78350F" />
            <path d="M-8 -120 L8 -120 L8 130 L-8 130 Z" fill="none" stroke="#B45309" strokeWidth="2" />
            {/* Top Arcane Mount */}
            <path d="M-25 -120 Q0 -150 25 -120 L10 -100 L-10 -100 Z" fill="#FBBF24" />
            {/* Floating Orb on Staff */}
            <motion.circle cx="0" cy="-140" r="20" fill="#38BDF8" filter="url(#glow-magic-blue)" animate={{ scale: [orbScale, orbScale * 1.25, orbScale], y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
            <circle cx="0" cy="-140" r="8" fill="#FFF" />
          </motion.g>

          <motion.path d="M530 630 C510 610, 525 615, 520 630" stroke="url(#fox-purple)" strokeWidth="20" strokeLinecap="round" animate={{ y: [0, -3, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} />
        </g>

        {/* Confident Mage Head with blinking */}
        <motion.g animate={{ rotate: [-1, 1, -1], y: [-3, 3, -3] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "400px 440px" }}>
          {/* Twiching mature ears */}
          <motion.g animate={{ rotate: [0, -3, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 1 }} style={{ transformOrigin: "290px 320px" }}>
            <path d="M290 320 L180 140 C210 160, 330 240, 340 280 Z" fill="url(#fox-purple)" />
            <path d="M290 300 L200 160 C230 180, 320 250, 325 280 Z" fill="#F3E8FF" />
          </motion.g>
          
          <motion.g animate={{ rotate: [0, 3, 0] }} transition={{ duration: 4.5, repeat: Infinity, delay: 2 }} style={{ transformOrigin: "510px 320px" }}>
            <path d="M510 320 L620 140 C590 160, 470 240, 460 280 Z" fill="url(#fox-purple)" />
            <path d="M510 300 L600 160 C570 180, 480 250, 475 280 Z" fill="#F3E8FF" />
          </motion.g>

          {/* Mature Head Shape */}
          <path d="M400 240 C220 240, 180 430, 270 510 C320 550, 480 550, 530 510 C620 430, 580 240, 400 240 Z" fill="url(#fox-purple)" />
          <path d="M270 460 C330 520, 470 520, 530 460 C480 420, 320 420, 270 460 Z" fill="url(#fox-cream)" />

          <ellipse cx="400" cy="475" rx="17" ry="11" fill="#2E1065" />
          <ellipse cx="404" cy="471" rx="5" ry="3" fill="#FFF" />

          {/* Sharp, confident eyes - Blinking */}
          <motion.g animate={{ scaleY: [1, 1, 0.1, 1, 1, 1, 1, 1, 1, 1] }} transition={{ duration: 5.5, repeat: Infinity, times: [0, 0.2, 0.25, 0.3, 0.5, 0.6, 0.65, 0.7, 0.9, 1] }} style={{ transformOrigin: "400px 390px" }}>
            <ellipse cx="310" cy="390" rx="24" ry="30" fill="#2E1065" />
            <ellipse cx="490" cy="390" rx="24" ry="30" fill="#2E1065" />
            <circle cx="318" cy="378" r="10" fill="#FFF" />
            <circle cx="298" cy="402" r="4" fill="#FFF" />
            <circle cx="498" cy="378" r="10" fill="#FFF" />
            <circle cx="478" cy="402" r="4" fill="#FFF" />
          </motion.g>

          <path d="M270 340 Q310 330 350 355" stroke="#2E1065" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M530 340 Q490 330 450 355" stroke="#2E1065" strokeWidth="7" fill="none" strokeLinecap="round" />

          {/* Arcane Forehead Mark */}
          <motion.path d="M400 260 L415 285 L400 310 L385 285 Z" fill="#FBBF24" filter="url(#glow-gold)" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity }} />
        </motion.g>
      </g>
    </motion.svg>
  );
}
