import { motion } from "motion/react";
import type { FoxStageProps } from "../FoxEvolution";

export function Stage5Studious({ progress = 100, emotion = 'idle', milestones = { hasAura: true, hasBooks: true, hasRunes: true, hasCrown: true, hasCosmic: true } }: FoxStageProps) {
  const glowOpacity = 0.5 + (progress / 100) * 0.4;
  
  const isFocused = emotion === 'focused';
  const isTired = emotion === 'tired';
  const isHappy = emotion === 'happy' || emotion === 'excited';

  // Writing speed increases when focused
  const writeSpeed = isFocused ? 0.7 : 1.5;
  
  // Blinking logic
  const blinkAnimation = isTired 
    ? { scaleY: [1, 0.2, 0.2, 1], transition: { duration: 4, repeat: Infinity, times: [0, 0.1, 0.9, 1] } }
    : isHappy 
    ? { scaleY: [1, 0.1, 1], transition: { duration: 0.3, repeat: Infinity, repeatDelay: 3 } }
    : { scaleY: [1, 1, 0.1, 1, 1, 1, 1, 1, 1, 1], transition: { duration: 5, repeat: Infinity, times: [0, 0.2, 0.25, 0.3, 0.5, 0.6, 0.65, 0.7, 0.9, 1] } };

  const numParticles = Math.floor(10 + (progress / 100) * 15);
  const particles = Array.from({ length: numParticles }).map((_, i) => ({
    cx: Math.random() * 800,
    cy: Math.random() * 800,
    r: Math.random() * 2 + 1,
    duration: Math.random() * 4 + 3,
    delay: Math.random() * 2,
  }));

  return (
    <motion.svg 
      style={{ filter: `drop-shadow(0 0 ${15 + progress/3}px rgba(217, 70, 239, ${glowOpacity}))` }} 
      width="100%" height="100%" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
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
        <linearGradient id="mantle" x1="0%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#2E1065" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>
        <filter id="soft-shadow">
          <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="#3B0764" floodOpacity="0.4" />
        </filter>
        <filter id="glow-magic">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-gold">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Floating Magic Dust */}
      {particles.map((p, i) => (
        <motion.circle
          key={i} cx={p.cx} cy={p.cy} r={p.r} fill="#D8B4FE" filter="url(#glow-magic)"
          animate={{ y: [0, -40, 0], opacity: [0, 0.6, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Background Floating Pages */}
      {milestones.hasBooks && (
        <>
          <motion.g animate={{ y: [-15, 15, -15], rotate: [-8, 8, -8] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} transform="translate(180, 450)">
            <path d="M0 0 L40 -20 L60 20 L20 40 Z" fill="#FEF3C7" opacity="0.6" filter="url(#glow-magic)" />
            <path d="M10 5 L35 -5" stroke="#D97706" strokeWidth="2" opacity="0.5" />
          </motion.g>
          <motion.g animate={{ y: [15, -15, 15], rotate: [12, -12, 12] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }} transform="translate(550, 480)">
            <path d="M0 0 L50 -15 L60 25 L10 40 Z" fill="#FEF3C7" opacity="0.6" filter="url(#glow-magic)" />
            <path d="M10 10 L45 0" stroke="#D97706" strokeWidth="2" opacity="0.5" />
          </motion.g>
        </>
      )}

      {/* Runic Circle unlocked via milestones */}
      {milestones.hasRunes && (
        <motion.ellipse 
          cx="400" cy="720" rx={200 + (progress/100) * 80} ry={50 + (progress/100) * 20} 
          fill="none" stroke="#C084FC" strokeWidth={1 + (progress/100) * 3} strokeDasharray="10 20" 
          opacity={0.3 + (progress/100)*0.5} filter="url(#glow-magic)"
          animate={{ rotate: -360 }} transition={{ duration: 30 - (progress/100) * 15, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "400px 720px" }}
        />
      )}

      <g filter="url(#soft-shadow)">
        {/* Smarter, longer Tail */}
        <motion.g animate={{ rotate: [-2, 3, -2] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "400px 650px" }}>
          <path d="M370 650 C600 780, 750 500, 640 380 C540 250, 420 450, 370 650 Z" fill="url(#fox-purple)" />
          <path d="M640 380 C570 290, 490 380, 490 440 C520 440, 610 440, 640 380 Z" fill="url(#fox-cream)" />
        </motion.g>

        {/* Breathing Scholar Body & Cape */}
        <motion.g animate={{ scaleY: [1, 1.02, 1], y: [0, -3, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "400px 700px" }}>
          <path d="M300 480 C260 580, 270 650, 320 650 L480 650 C530 650, 540 580, 500 480 Z" fill="url(#mantle)" />
          <path d="M300 480 L350 550 L400 580 L450 550 L500 480" fill="none" stroke="#FBBF24" strokeWidth="6" strokeLinecap="round" />
  
          {/* Body */}
          <path d="M330 460 C280 600, 300 700, 400 700 C500 700, 520 600, 470 460 Z" fill="url(#fox-purple)" />
          <path d="M360 460 C360 580, 440 580, 440 460 Z" fill="url(#fox-cream)" />
        </motion.g>

        {/* Legs */}
        <path d="M310 660 C290 710, 350 720, 350 660 Z" fill="url(#fox-purple)" />
        <path d="M490 660 C510 710, 450 720, 450 660 Z" fill="url(#fox-purple)" />

        {/* Writing Action */}
        <g transform="translate(0, 0)">
          {/* Left Arm holding Parchment Scroll */}
          <motion.path d="M320 520 C300 560, 330 600, 360 620" stroke="url(#fox-purple)" strokeWidth="24" strokeLinecap="round" animate={{ d: ["M320 520 C300 560, 330 600, 360 620", "M320 518 C300 558, 330 598, 360 618", "M320 520 C300 560, 330 600, 360 620"] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
          
          {/* Hovering Glowing Scroll */}
          <motion.g animate={{ y: [-4, 4, -4], rotate: [-15, -12, -15] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }} transform="translate(260, 550)">
            <path d="M0 0 L50 -20 L90 50 L40 70 Z" fill="#FEF3C7" />
            <path d="M40 70 C55 80, 80 65, 90 50" fill="none" stroke="#D97706" strokeWidth="4" />
            <ellipse cx="25" cy="-10" rx="25" ry="12" fill="#FDE68A" transform="rotate(-20 25 -10)" />
            {/* Runes / Lines animating like writing */}
            <motion.path d="M20 15 L60 0 M25 35 L65 20 M30 55 L55 45" stroke="#9333EA" strokeWidth="3" opacity="0.6" strokeLinecap="round" animate={{ strokeDasharray: ["0, 100", "100, 0"], strokeDashoffset: [100, 0] }} transition={{ duration: writeSpeed * 2, repeat: Infinity, ease: "linear" }} />
            <circle cx="50" cy="30" r="15" fill="#C084FC" filter="url(#glow-magic)" opacity={isFocused ? 0.8 : 0.4} />
          </motion.g>

          {/* Right Arm holding Feather Quill - Writing smoothly */}
          <motion.path d="M480 520 C500 560, 470 600, 440 620" stroke="url(#fox-purple)" strokeWidth="24" strokeLinecap="round" animate={{ d: ["M480 520 C500 560, 470 600, 440 620", "M480 518 C500 558, 470 598, 440 618", "M480 520 C500 560, 470 600, 440 620"] }} transition={{ duration: writeSpeed * 2, repeat: Infinity, ease: "easeInOut" }} />
          
          <motion.g animate={{ rotate: [-2, 8, -2], x: [-6, 6, -6], y: [-2, 2, -2] }} transition={{ duration: writeSpeed, repeat: Infinity, ease: "easeInOut" }} transform="translate(430, 590) rotate(15)">
            <path d="M0 20 L5 -5 L40 -70 C60 -90, 80 -40, 40 -25 Z" fill="#E9D5FF" />
            <path d="M40 -70 C50 -50, 30 -30, 40 -25" fill="none" stroke="#C084FC" strokeWidth="2" />
            <path d="M0 20 L40 -70" fill="none" stroke="#9333EA" strokeWidth="3" filter="url(#glow-magic)" />
            <motion.circle cx="2" cy="18" r="5" fill="#3B0764" animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: writeSpeed, repeat: Infinity }} />
          </motion.g>

          <motion.path d="M350 600 C360 620, 370 610, 360 620" stroke="url(#fox-purple)" strokeWidth="20" strokeLinecap="round" animate={{ y: [0, -3, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
          <motion.path d="M450 600 C440 620, 430 610, 440 620" stroke="url(#fox-purple)" strokeWidth="20" strokeLinecap="round" animate={{ y: [0, -3, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
        </g>

        {/* Head with Glasses - Attentive head movements */}
        <motion.g animate={{ rotate: [-1, 2, -1], y: [isTired ? 10 : -3, 3, isTired ? 10 : -3] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "400px 460px" }}>
          {/* Twitchy smart ears */}
          <motion.g animate={{ rotate: [0, 4, 0] }} transition={{ duration: isFocused ? 2 : 3, repeat: Infinity, delay: 1 }} style={{ transformOrigin: "310px 350px" }}>
            <path d="M310 350 L220 180 C250 200, 350 270, 360 310 Z" fill="url(#fox-purple)" />
            <path d="M310 330 L235 205 C265 225, 335 285, 345 310 Z" fill="#F3E8FF" />
          </motion.g>
          <motion.g animate={{ rotate: [0, -4, 0] }} transition={{ duration: isFocused ? 2.5 : 4, repeat: Infinity, delay: 2 }} style={{ transformOrigin: "490px 350px" }}>
            <path d="M490 350 L580 180 C550 200, 450 270, 440 310 Z" fill="url(#fox-purple)" />
            <path d="M490 330 L565 205 C535 225, 465 285, 455 310 Z" fill="#F3E8FF" />
          </motion.g>

          {/* Head Shape */}
          <path d="M400 270 C240 270, 190 440, 290 520 C340 560, 460 560, 510 520 C610 440, 560 270, 400 270 Z" fill="url(#fox-purple)" />
          <path d="M290 470 C350 530, 450 530, 510 470 C460 440, 340 440, 290 470 Z" fill="url(#fox-cream)" />

          <ellipse cx="400" cy="485" rx="16" ry="11" fill="#2E1065" />
          <ellipse cx="404" cy="481" rx="4" ry="2" fill="#FFF" />

          {/* Attentive Eyes - Blinking */}
          <motion.g animate={blinkAnimation} style={{ transformOrigin: "400px 410px" }}>
            <ellipse cx="320" cy="410" rx="20" ry={isHappy ? 14 : 26} fill="#2E1065" />
            <ellipse cx="480" cy="410" rx="20" ry={isHappy ? 14 : 26} fill="#2E1065" />
            <circle cx="328" cy={isHappy ? 406 : 398} r="8" fill="#FFF" />
            <circle cx="312" cy={isHappy ? 414 : 418} r="3" fill="#FFF" />
            <circle cx="488" cy={isHappy ? 406 : 398} r="8" fill="#FFF" />
            <circle cx="472" cy={isHappy ? 414 : 418} r="3" fill="#FFF" />
          </motion.g>

          {/* Philosopher Glasses */}
          <g stroke="#FBBF24" strokeWidth="6" fill="rgba(251, 191, 36, 0.15)" strokeLinejoin="round" filter="url(#glow-gold)">
            <path d="M270 395 C270 440, 370 440, 370 395 Z" />
            <path d="M430 395 C430 440, 530 440, 530 395 Z" />
            <path d="M370 400 Q400 390 430 400" fill="none" strokeWidth="4" />
          </g>
          {/* Shimmer on Glasses */}
          <motion.g stroke="#FFFFFF" strokeWidth="4" opacity="0.6" strokeLinecap="round" animate={{ x: [-5, 10, -5], opacity: [0.3, 0.9, 0.3] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <path d="M285 410 L310 425" />
            <path d="M445 410 L470 425" />
          </motion.g>
          
          <ellipse cx="280" cy="450" rx="16" ry="9" fill="#F472B6" opacity={isTired ? 0.8 : 0.5} />
          <ellipse cx="520" cy="450" rx="16" ry="9" fill="#F472B6" opacity={isTired ? 0.8 : 0.5} />
        </motion.g>
      </g>
    </motion.svg>
  );
}
