import { motion } from "motion/react";

import type { FoxStageProps } from "../FoxEvolution";

export function Stage3BabyFox({ progress = 0 }: FoxStageProps) {
  const glowOpacity = 0.5 + (progress / 100) * 0.4;
  const glowStyle = { filter: `drop-shadow(0 0 ${15 + progress/4}px rgba(168, 85, 247, ${glowOpacity}))` };

  const numStars = Math.floor(8 + (progress / 100) * 15);
  const stars = Array.from({ length: numStars }).map((_, i) => ({
    x: 250 + Math.random() * 300,
    y: 250 + Math.random() * 200,
    delay: Math.random() * 2,
    size: 2 + Math.random() * 3 + (progress / 100) * 2,
  }));
  
  const toyScale = 1 + (progress / 100) * 0.2;

  return (
    <motion.svg style={glowStyle} width="100%" height="100%" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="fox-purple" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="60%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#581C87" />
        </radialGradient>
        <linearGradient id="fox-cream" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FAFAF9" />
          <stop offset="100%" stopColor="#E9D5FF" />
        </linearGradient>
        <radialGradient id="pillow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4C1D95" />
          <stop offset="100%" stopColor="#2E1065" />
        </radialGradient>
        <filter id="glow-light">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="shadow">
          <feDropShadow dx="0" dy="15" stdDeviation="15" floodColor="#3B0764" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Twinkling Stars Background */}
      {stars.map((s, i) => (
        <motion.path 
          key={i} 
          d={`M${s.x} ${s.y - s.size * 2} L${s.x + s.size} ${s.y - s.size} L${s.x + s.size * 2} ${s.y} L${s.x + s.size} ${s.y + s.size} L${s.x} ${s.y + s.size * 2} L${s.x - s.size} ${s.y + s.size} L${s.x - s.size * 2} ${s.y} L${s.x - s.size} ${s.y - s.size} Z`} 
          fill="#FDE68A" filter="url(#glow-light)"
          animate={{ scale: [0.5, 1.2, 0.5], opacity: [0.2, 0.8, 0.2] }} 
          transition={{ duration: 2.5, repeat: Infinity, delay: s.delay }} 
        />
      ))}

      <g filter="url(#shadow)">
        {/* Soft Comfy Pillow */}
        <motion.ellipse 
          cx="400" cy="620" rx="160" ry="40" 
          fill="url(#pillow)" stroke="#7E22CE" strokeWidth="4" 
          animate={{ ry: [40, 38, 40] }} 
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Cute Tail (Wrapped around front) */}
        <motion.g animate={{ rotate: [-2, 2, -2] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "220px 580px" }}>
          <motion.path 
            d="M480 580 C580 580, 600 680, 480 640 C380 620, 250 630, 220 580 C200 520, 300 480, 340 550" 
            fill="url(#fox-purple)" 
            animate={{ d: ["M480 580 C580 580, 600 670, 480 630 C380 610, 250 620, 220 570 C200 510, 300 480, 340 550", "M480 580 C580 580, 600 680, 480 640 C380 620, 250 630, 220 580 C200 520, 300 480, 340 550", "M480 580 C580 580, 600 670, 480 630 C380 610, 250 620, 220 570 C200 510, 300 480, 340 550"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <path d="M220 580 C200 520, 260 490, 280 520 C270 540, 230 560, 220 580 Z" fill="url(#fox-cream)" />
        </motion.g>

        {/* Baby Body (Plump) - Breathing Animation */}
        <motion.g animate={{ scaleY: [1, 1.02, 1], y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "400px 620px" }}>
          <path d="M320 480 C320 620, 480 620, 480 480 Z" fill="url(#fox-purple)" />
          <path d="M350 490 C350 580, 450 580, 450 490 Z" fill="url(#fox-cream)" />
          
          {/* Baby Paws holding pillow */}
          <circle cx="340" cy="580" r="18" fill="url(#fox-purple)" />
          <circle cx="460" cy="580" r="18" fill="url(#fox-purple)" />
        </motion.g>

        {/* Giant Baby Head */}
        <motion.g animate={{ y: [-4, 4, -4], rotate: [-2, 2, -2] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "400px 480px" }}>
          {/* Ears with twitching */}
          <motion.g animate={{ rotate: [0, -5, 0, -2, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} style={{ transformOrigin: "330px 350px" }}>
            <path d="M330 350 L250 220 C280 230, 350 280, 360 320 Z" fill="url(#fox-purple)" />
            <path d="M330 340 L265 240 C285 245, 335 290, 340 320 Z" fill="#F3E8FF" />
          </motion.g>
          
          <motion.g animate={{ rotate: [0, 5, 0, 2, 0] }} transition={{ duration: 6, repeat: Infinity, delay: 2 }} style={{ transformOrigin: "470px 350px" }}>
            <path d="M470 350 L550 220 C520 230, 450 280, 440 320 Z" fill="url(#fox-purple)" />
            <path d="M470 340 L535 240 C515 245, 465 290, 460 320 Z" fill="#F3E8FF" />
          </motion.g>

          {/* Main Round Head */}
          <ellipse cx="400" cy="400" rx="140" ry="110" fill="url(#fox-purple)" />
          <path d="M280 430 C340 480, 460 480, 520 430 C500 400, 300 400, 280 430 Z" fill="url(#fox-cream)" />
          <ellipse cx="400" cy="400" rx="140" ry="110" fill="none" stroke="#9333EA" strokeWidth="2" opacity="0.3" />

          {/* Big Innocent Eyes - Blinking */}
          <motion.g animate={{ scaleY: [1, 1, 0.1, 1, 1, 1, 1, 1, 1, 1] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.2, 0.25, 0.3, 0.5, 0.6, 0.65, 0.7, 0.9, 1] }} style={{ transformOrigin: "400px 380px" }}>
            <ellipse cx="330" cy="380" rx="26" ry="34" fill="#000" />
            <ellipse cx="470" cy="380" rx="26" ry="34" fill="#000" />
            <circle cx="340" cy="365" r="12" fill="#FFF" />
            <circle cx="325" cy="390" r="5" fill="#FFF" />
            <circle cx="480" cy="365" r="12" fill="#FFF" />
            <circle cx="465" cy="390" r="5" fill="#FFF" />
          </motion.g>

          {/* Magical Pacifier or Star Toy in Mouth - Sucking animation */}
          <motion.g transform="translate(400, 445)" animate={{ scale: [toyScale, toyScale * 1.1, toyScale] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
            <ellipse cx="0" cy="0" rx="20" ry="12" fill="#FBBF24" filter="url(#glow-light)" />
            <circle cx="0" cy="0" r="8" fill="#FDE68A" />
            <path d="M-5 15 C-5 25, 5 25, 5 15" fill="none" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
            {/* Pacifier Ring */}
            <motion.circle cx="0" cy="18" r="12" fill="none" stroke="#FBBF24" strokeWidth="4" animate={{ rotateX: [0, 20, 0] }} transition={{ duration: 2, repeat: Infinity }} />
          </motion.g>

          {/* Baby Blush */}
          <ellipse cx="280" cy="420" rx="15" ry="8" fill="#F472B6" opacity="0.6" />
          <ellipse cx="520" cy="420" rx="15" ry="8" fill="#F472B6" opacity="0.6" />
        </motion.g>
      </g>
    </motion.svg>
  );
}
