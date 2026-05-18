import { motion } from "motion/react";

import type { FoxStageProps } from "../FoxEvolution";

export function Stage4Apprentice({ progress = 0 }: FoxStageProps) {
  const glowOpacity = 0.5 + (progress / 100) * 0.4;
  const glowStyle = { filter: `drop-shadow(0 0 ${15 + progress/4}px rgba(168, 85, 247, ${glowOpacity}))` };

  const numParticles = Math.floor(15 + (progress / 100) * 20);
  const particles = Array.from({ length: numParticles }).map((_, i) => ({
    cx: Math.random() * 800,
    cy: Math.random() * 800,
    r: Math.random() * 2 + 1,
    duration: Math.random() * 4 + 3,
    delay: Math.random() * 2,
  }));
  
  const bookGlowScale = 1 + (progress / 100) * 0.4;
  const bookFloatSpeed = 4 - (progress / 100);

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
        <linearGradient id="cape" x1="0%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#1E1B4B" />
          <stop offset="100%" stopColor="#312E81" />
        </linearGradient>
        <filter id="soft-shadow">
          <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#3B0764" floodOpacity="0.4" />
        </filter>
        <filter id="glow-magic">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Subdued ambient magical dust */}
      {particles.map((p, i) => (
        <motion.circle
          key={i} cx={p.cx} cy={p.cy} r={p.r} fill="#FDE68A" filter="url(#glow-magic)"
          animate={{ y: [0, -30, 0], opacity: [0, 0.5, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      <g filter="url(#soft-shadow)">
        {/* Tail - Swishing smoothly */}
        <motion.g animate={{ rotate: [-3, 5, -3] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "400px 650px" }}>
          <path d="M380 650 C580 740, 700 520, 620 400 C540 280, 420 500, 380 650 Z" fill="url(#fox-purple)" />
          <path d="M620 400 C560 320, 490 380, 470 450 C500 450, 590 450, 620 400 Z" fill="url(#fox-cream)" />
        </motion.g>

        {/* Breathing Upper Body & Cape */}
        <motion.g animate={{ scaleY: [1, 1.02, 1], y: [0, -2, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "400px 700px" }}>
          {/* Apprentice Cape (Back) */}
          <path d="M320 500 C280 600, 260 680, 360 680 L440 680 C540 680, 520 600, 480 500 Z" fill="url(#cape)" />
  
          {/* Body */}
          <path d="M330 480 C280 620, 300 700, 400 700 C500 700, 520 620, 470 480 Z" fill="url(#fox-purple)" />
          <path d="M360 480 C360 590, 440 590, 440 480 Z" fill="url(#fox-cream)" />
  
          {/* Apprentice Cape Front Tie */}
          <path d="M320 480 C400 500, 480 480, 480 480 L450 520 C400 530, 350 520, 320 480 Z" fill="#312E81" />
          <motion.circle cx="400" cy="500" r="8" fill="#FBBF24" filter="url(#glow-magic)" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }} />
        </motion.g>

        {/* Legs */}
        <path d="M310 660 C290 710, 360 720, 360 660 Z" fill="url(#fox-purple)" />
        <path d="M490 660 C510 710, 440 720, 440 660 Z" fill="url(#fox-purple)" />

        {/* Holding Book */}
        <g transform="translate(0, 0)">
          {/* Left Arm Back */}
          <motion.path d="M320 520 C290 550, 310 610, 360 610" stroke="url(#fox-purple)" strokeWidth="24" strokeLinecap="round" animate={{ d: ["M320 520 C290 550, 310 610, 360 610", "M320 518 C290 548, 310 608, 360 608", "M320 520 C290 550, 310 610, 360 610"] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} />
          {/* Right Arm Back */}
          <motion.path d="M480 520 C510 550, 490 610, 440 610" stroke="url(#fox-purple)" strokeWidth="24" strokeLinecap="round" animate={{ d: ["M480 520 C510 550, 490 610, 440 610", "M480 518 C510 548, 490 608, 440 608", "M480 520 C510 550, 490 610, 440 610"] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} />

          {/* Beautiful glowing hovering open book */}
          <motion.g animate={{ y: [-5, 5, -5], rotate: [-2, 2, -2] }} transition={{ duration: bookFloatSpeed, repeat: Infinity, ease: "easeInOut" }} transform="translate(320, 550)">
            <motion.circle cx="80" cy="25" r="40" fill="#9333EA" filter="url(#glow-magic)" opacity="0.4" animate={{ scale: [bookGlowScale, bookGlowScale * 1.1, bookGlowScale] }} transition={{ duration: 2, repeat: Infinity }} />
            <path d="M0 20 L75 0 L150 20 L75 40 Z" fill="#4C1D95" stroke="#FBBF24" strokeWidth="2" strokeLinejoin="round" />
            <path d="M0 20 L0 35 L75 55 L75 40 Z" fill="#3B0764" />
            <path d="M150 20 L150 35 L75 55 L75 40 Z" fill="#3B0764" />
            <path d="M10 18 L75 4 L140 18 L75 32 Z" fill="#FEF3C7" />
            
            {/* Glowing magic rune shining out from book */}
            <motion.circle cx="75" cy="20" r="10" fill="#FDE68A" filter="url(#glow-magic)" animate={{ scale: [bookGlowScale, bookGlowScale * 1.2, bookGlowScale], opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }} />
            <motion.path d="M75 10 L75 30 M65 20 L85 20" stroke="#F59E0B" strokeWidth="2" animate={{ rotate: [0, 180] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "75px 20px" }} />
          </motion.g>

          {/* Paws overlapping Book */}
          <motion.path d="M340 600 C360 620, 380 610, 370 605" stroke="url(#fox-purple)" strokeWidth="20" strokeLinecap="round" animate={{ y: [0, -2, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} />
          <motion.path d="M460 600 C440 620, 420 610, 430 605" stroke="url(#fox-purple)" strokeWidth="20" strokeLinecap="round" animate={{ y: [0, -2, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} />
        </g>

        {/* Head Group with idle animations */}
        <motion.g animate={{ rotate: [-2, 2, -2], y: [-3, 3, -3] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "400px 480px" }}>
          {/* Ear twitching */}
          <motion.g animate={{ rotate: [0, 4, -2, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 0.5 }} style={{ transformOrigin: "320px 350px" }}>
            <path d="M320 370 L240 230 C270 250, 350 300, 360 330 Z" fill="url(#fox-purple)" />
            <path d="M320 350 L255 245 C280 265, 340 310, 345 330 Z" fill="#F3E8FF" />
          </motion.g>
          
          <motion.g animate={{ rotate: [0, -4, 2, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1.5 }} style={{ transformOrigin: "480px 350px" }}>
            <path d="M480 370 L560 230 C530 250, 450 300, 440 330 Z" fill="url(#fox-purple)" />
            <path d="M480 350 L545 245 C520 265, 460 310, 455 330 Z" fill="#F3E8FF" />
          </motion.g>

          {/* Head Shape */}
          <path d="M400 300 C250 300, 210 450, 300 520 C350 550, 450 550, 500 520 C590 450, 550 300, 400 300 Z" fill="url(#fox-purple)" />
          <path d="M300 480 C350 540, 450 540, 500 480 C460 450, 340 450, 300 480 Z" fill="url(#fox-cream)" />

          <ellipse cx="400" cy="490" rx="15" ry="10" fill="#2E1065" />
          <ellipse cx="404" cy="486" rx="5" ry="3" fill="#FFF" />

          {/* Curious Eyes - Blinking */}
          <motion.g animate={{ scaleY: [1, 1, 0.1, 1, 1, 1, 1, 1, 1, 1] }} transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.2, 0.25, 0.3, 0.5, 0.6, 0.65, 0.7, 0.9, 1] }} style={{ transformOrigin: "400px 420px" }}>
            <ellipse cx="320" cy="420" rx="22" ry="28" fill="#2E1065" />
            <ellipse cx="480" cy="420" rx="22" ry="28" fill="#2E1065" />
            <circle cx="328" cy="408" r="9" fill="#FFF" />
            <circle cx="312" cy="428" r="4" fill="#FFF" />
            <circle cx="488" cy="408" r="9" fill="#FFF" />
            <circle cx="472" cy="428" r="4" fill="#FFF" />
          </motion.g>
          
          <ellipse cx="280" cy="460" rx="18" ry="10" fill="#F472B6" opacity="0.5" />
          <ellipse cx="520" cy="460" rx="18" ry="10" fill="#F472B6" opacity="0.5" />
        </motion.g>
      </g>
    </motion.svg>
  );
}
