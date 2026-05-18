// TOGA — Fox Evolution Panel
// Raposa mascote de gamificação: 8 estágios integrados ao XP do TOGA
// Sem imports — funciona no ambiente CDN + Babel Standalone do TOGA

const FOX_STAGES = [
  { id: 1, name: 'Ovo da Raposa',  minXp: 0,     color: '#FEF08A', accent: '#F59E0B', desc: 'Um ovo misterioso cheio de potencial.' },
  { id: 2, name: 'Ovo Rachando',   minXp: 500,   color: '#FDE68A', accent: '#EAB308', desc: 'Algo está prestes a eclodir...' },
  { id: 3, name: 'Filhote',        minXp: 1500,  color: '#FED7AA', accent: '#F97316', desc: 'Uma raposa recém-nascida e curiosa.' },
  { id: 4, name: 'Aprendiz',       minXp: 3000,  color: '#FDBA74', accent: '#EA580C', desc: 'Começando a dominar os primeiros tópicos.' },
  { id: 5, name: 'Estudiosa',      minXp: 5000,  color: '#FB923C', accent: '#C2410C', desc: 'Mergulhando fundo nos estudos jurídicos.' },
  { id: 6, name: 'Estrategista',   minXp: 8000,  color: '#F97316', accent: '#9A3412', desc: 'Planejando cada etapa com precisão.' },
  { id: 7, name: 'Avançada',       minXp: 12000, color: '#EA580C', accent: '#7C2D12', desc: 'Dominando a maioria dos conteúdos.' },
  { id: 8, name: 'Mestra da Toga', minXp: 18000, color: '#C2410C', accent: '#431407', desc: 'O ápice. Pronta para vestir a toga!' },
];

function evaluateFoxProgression(xp) {
  const score = xp || 0;
  let currentStage = FOX_STAGES[0];
  for (const stage of FOX_STAGES) {
    if (score >= stage.minXp) currentStage = stage;
  }
  const idx = FOX_STAGES.findIndex(s => s.id === currentStage.id);
  const nextStage = FOX_STAGES[idx + 1];
  const stageProgress = nextStage
    ? Math.min(100, ((score - currentStage.minXp) / (nextStage.minXp - currentStage.minXp)) * 100)
    : 100;
  return { score, currentStage, nextStage, stageProgress, isMax: !nextStage };
}

// ── Fox SVG Stages ────────────────────────────────────────────

function FoxStage1Egg() {
  return (
    <svg viewBox="0 0 200 200" width="130" height="130" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="feg1-body" cx="0.4" cy="0.35">
          <stop offset="0%" stopColor="#FFFDE7" />
          <stop offset="60%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.7" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="185" rx="36" ry="5" fill="rgba(0,0,0,0.1)" />
      <path d="M100 36 C 65 36, 45 96, 50 136 C 55 170, 75 184, 100 184 C 125 184, 145 170, 150 136 C 155 96, 135 36, 100 36 Z"
        fill="url(#feg1-body)" stroke="#F59E0B" strokeWidth="1.5" strokeOpacity="0.5"
        style={{ filter: 'drop-shadow(0 0 8px #FDE68A88)', animation: 'pet-egg-shake 3.6s ease-in-out infinite' }} />
      <circle cx="75" cy="95" r="8" fill="#FDE047" opacity="0.55" />
      <circle cx="128" cy="115" r="10" fill="#FDE047" opacity="0.55" />
      <circle cx="83" cy="150" r="7" fill="#FDE047" opacity="0.55" />
      <ellipse cx="80" cy="72" rx="7" ry="17" transform="rotate(-30 80 72)" fill="white" opacity="0.5" />
      {[[54,56],[148,52],[42,148],[162,142]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="2.5" fill="#FDE047"
          style={{ animation: `sparkle-twinkle 2s ease-in-out ${i * 0.5}s infinite` }} />
      ))}
    </svg>
  );
}

function FoxStage2CrackingEgg() {
  return (
    <svg viewBox="0 0 200 200" width="130" height="130" style={{ overflow: 'visible' }}>
      <defs>
        <radialGradient id="feg2-body" cx="0.4" cy="0.35">
          <stop offset="0%" stopColor="#FFFDE7" />
          <stop offset="55%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="185" rx="36" ry="5" fill="rgba(0,0,0,0.1)" />
      <ellipse cx="100" cy="108" rx="46" ry="56" fill="#FB923C" opacity="0.18"
        style={{ animation: 'pet-glow-pulse 1.4s ease-in-out infinite' }} />
      <path d="M100 36 C 65 36, 45 96, 50 136 C 55 170, 75 184, 100 184 C 125 184, 145 170, 150 136 C 155 96, 135 36, 100 36 Z"
        fill="url(#feg2-body)" stroke="#F59E0B" strokeWidth="1.5"
        style={{ filter: 'drop-shadow(0 0 10px #FB923C88)', animation: 'pet-egg-crack 1.8s ease-in-out infinite' }} />
      <path d="M70 82 L84 97 L77 107 L91 118 L82 128" fill="none" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M124 78 L113 93 L127 104 L117 118" fill="none" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M93 64 L87 44 L80 62 Z" fill="#FB923C" stroke="#EA580C" strokeWidth="1" />
      <path d="M107 64 L113 44 L120 62 Z" fill="#FB923C" stroke="#EA580C" strokeWidth="1" />
      <circle cx="92" cy="80" r="5" fill="white" />
      <circle cx="108" cy="80" r="5" fill="white" />
      <circle cx="93" cy="81" r="2.5" fill="#1a0a0a" />
      <circle cx="109" cy="81" r="2.5" fill="#1a0a0a" />
      <circle cx="94" cy="79" r="1" fill="white" />
      <circle cx="110" cy="79" r="1" fill="white" />
    </svg>
  );
}

function FoxStage3Baby() {
  return (
    <svg viewBox="0 0 200 220" width="130" height="143"
      style={{ overflow: 'visible', animation: 'pet-breath 3s ease-in-out infinite' }}>
      <ellipse cx="100" cy="215" rx="36" ry="5" fill="rgba(0,0,0,0.1)" />
      <ellipse cx="100" cy="162" rx="34" ry="28" fill="#FB923C" />
      <ellipse cx="100" cy="168" rx="22" ry="18" fill="#FEF3C7" opacity="0.9" />
      <path d="M132 157 Q 155 138, 149 116 Q 143 98, 133 107 Q 143 122, 136 140 Q 131 155, 124 160 Z" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1" />
      <ellipse cx="100" cy="120" rx="30" ry="28" fill="#FB923C" />
      <path d="M76 99 L68 74 L88 92 Z" fill="#FB923C" stroke="#EA580C" strokeWidth="1" />
      <path d="M124 99 L132 74 L112 92 Z" fill="#FB923C" stroke="#EA580C" strokeWidth="1" />
      <path d="M78 97 L72 80 L86 93 Z" fill="#FECACA" opacity="0.75" />
      <path d="M122 97 L128 80 L114 93 Z" fill="#FECACA" opacity="0.75" />
      <circle cx="88" cy="118" r="8" fill="white" stroke="#EA580C" strokeWidth="0.5" />
      <circle cx="112" cy="118" r="8" fill="white" stroke="#EA580C" strokeWidth="0.5" />
      <circle cx="90" cy="119" r="4.5" fill="#1a0a0a" />
      <circle cx="114" cy="119" r="4.5" fill="#1a0a0a" />
      <circle cx="92" cy="117" r="1.5" fill="white" />
      <circle cx="116" cy="117" r="1.5" fill="white" />
      <ellipse cx="100" cy="129" rx="7" ry="5" fill="#FEF3C7" />
      <ellipse cx="100" cy="130" rx="3.5" ry="2.5" fill="#1a0a0a" />
      <ellipse cx="78" cy="126" rx="5" ry="3" fill="rgba(252,165,165,0.5)" />
      <ellipse cx="122" cy="126" rx="5" ry="3" fill="rgba(252,165,165,0.5)" />
      <path d="M 94 136 Q 100 141, 106 136" fill="none" stroke="#1a0a0a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function FoxStage4Apprentice() {
  return (
    <svg viewBox="0 0 200 230" width="130" height="150"
      style={{ overflow: 'visible', animation: 'pet-breath 2.8s ease-in-out infinite' }}>
      <ellipse cx="100" cy="225" rx="38" ry="5" fill="rgba(0,0,0,0.1)" />
      <ellipse cx="100" cy="170" rx="38" ry="32" fill="#F97316" />
      <ellipse cx="100" cy="177" rx="24" ry="20" fill="#FEF3C7" opacity="0.9" />
      <path d="M135 162 Q 162 138, 155 112 Q 148 90, 136 102 Q 148 120, 140 142 Q 134 162, 126 168 Z" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1.2" />
      <path d="M67 167 Q 53 172, 50 182" fill="none" stroke="#F97316" strokeWidth="7" strokeLinecap="round" />
      <path d="M133 167 Q 147 172, 150 182" fill="none" stroke="#F97316" strokeWidth="7" strokeLinecap="round" />
      <ellipse cx="100" cy="118" rx="34" ry="32" fill="#F97316" />
      <path d="M74 97 L65 68 L88 90 Z" fill="#F97316" stroke="#EA580C" strokeWidth="1" />
      <path d="M126 97 L135 68 L112 90 Z" fill="#F97316" stroke="#EA580C" strokeWidth="1" />
      <path d="M76 95 L70 75 L87 91 Z" fill="#FECACA" opacity="0.75" />
      <path d="M124 95 L130 75 L113 91 Z" fill="#FECACA" opacity="0.75" />
      <circle cx="87" cy="115" r="9" fill="white" stroke="#EA580C" strokeWidth="0.5" />
      <circle cx="113" cy="115" r="9" fill="white" stroke="#EA580C" strokeWidth="0.5" />
      <circle cx="89" cy="116" r="5" fill="#1a0a0a" />
      <circle cx="115" cy="116" r="5" fill="#1a0a0a" />
      <circle cx="91" cy="114" r="1.8" fill="white" />
      <circle cx="117" cy="114" r="1.8" fill="white" />
      <ellipse cx="100" cy="127" rx="8" ry="5.5" fill="#FEF3C7" />
      <ellipse cx="100" cy="128" rx="3.5" ry="2.5" fill="#1a0a0a" />
      <path d="M 93 136 Q 100 142, 107 136" fill="none" stroke="#1a0a0a" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="75" cy="124" rx="6" ry="3.5" fill="rgba(252,165,165,0.5)" />
      <ellipse cx="125" cy="124" rx="6" ry="3.5" fill="rgba(252,165,165,0.5)" />
    </svg>
  );
}

function FoxStage5Studious() {
  return (
    <svg viewBox="0 0 200 240" width="130" height="156"
      style={{ overflow: 'visible', animation: 'pet-breath 2.6s ease-in-out infinite' }}>
      <ellipse cx="100" cy="235" rx="40" ry="5.5" fill="rgba(0,0,0,0.1)" />
      <ellipse cx="100" cy="174" rx="40" ry="34" fill="#EA580C" />
      <ellipse cx="100" cy="181" rx="26" ry="22" fill="#FEF3C7" opacity="0.9" />
      <path d="M138 165 Q 167 138, 159 108 Q 151 84, 137 97 Q 150 118, 142 144 Q 136 164, 127 170 Z" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1.2" />
      <path d="M65 170 Q 50 174, 44 186" fill="none" stroke="#EA580C" strokeWidth="8" strokeLinecap="round" />
      <path d="M135 170 Q 150 174, 156 186" fill="none" stroke="#EA580C" strokeWidth="8" strokeLinecap="round" />
      <rect x="57" y="186" width="38" height="28" rx="2" fill="#5B47B8" stroke="#3B2D8E" strokeWidth="1" />
      <rect x="59" y="188" width="34" height="24" rx="1" fill="white" />
      <line x1="76" y1="188" x2="76" y2="212" stroke="#5B47B8" strokeWidth="1" />
      <text x="68" y="203" fontSize="7" fill="#5B47B8" fontWeight="700" textAnchor="middle" fontFamily="serif">§</text>
      <ellipse cx="100" cy="116" rx="36" ry="34" fill="#EA580C" />
      <path d="M72 95 L62 62 L87 88 Z" fill="#EA580C" stroke="#C2410C" strokeWidth="1" />
      <path d="M128 95 L138 62 L113 88 Z" fill="#EA580C" stroke="#C2410C" strokeWidth="1" />
      <path d="M74 93 L67 72 L86 89 Z" fill="#FECACA" opacity="0.75" />
      <path d="M126 93 L133 72 L114 89 Z" fill="#FECACA" opacity="0.75" />
      <path d="M82 72 Q 80 60, 84 56" fill="none" stroke="#C2410C" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M118 72 Q 120 60, 116 56" fill="none" stroke="#C2410C" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="86" cy="112" r="10" fill="white" stroke="#C2410C" strokeWidth="0.5" />
      <circle cx="114" cy="112" r="10" fill="white" stroke="#C2410C" strokeWidth="0.5" />
      <circle cx="88" cy="113" r="5.5" fill="#1a0a0a" />
      <circle cx="116" cy="113" r="5.5" fill="#1a0a0a" />
      <circle cx="90" cy="111" r="2" fill="white" />
      <circle cx="118" cy="111" r="2" fill="white" />
      <ellipse cx="100" cy="125" rx="9" ry="6" fill="#FEF3C7" />
      <ellipse cx="100" cy="126" rx="4" ry="3" fill="#1a0a0a" />
      <path d="M 92 135 Q 100 141, 108 135" fill="none" stroke="#1a0a0a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 97 137 L 98.5 141 L 100 137 Z" fill="white" stroke="#1a0a0a" strokeWidth="0.5" />
      <ellipse cx="74" cy="123" rx="7" ry="4" fill="rgba(252,165,165,0.45)" />
      <ellipse cx="126" cy="123" rx="7" ry="4" fill="rgba(252,165,165,0.45)" />
    </svg>
  );
}

function FoxStage6Strategic() {
  return (
    <svg viewBox="0 0 200 250" width="130" height="163"
      style={{ overflow: 'visible', animation: 'pet-breath 2.5s ease-in-out infinite' }}>
      {[[36,68],[164,68],[28,152],[172,152]].map(([cx,cy],i) => (
        <g key={i} transform={`translate(${cx} ${cy})`}
          style={{ animation: `sparkle-twinkle 2.2s ease-in-out ${i * 0.4}s infinite` }}>
          <path d="M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2 Z" fill="#F59E0B" />
        </g>
      ))}
      <ellipse cx="100" cy="245" rx="42" ry="5.5" fill="rgba(0,0,0,0.1)" />
      <ellipse cx="100" cy="182" rx="42" ry="36" fill="#F97316" />
      <ellipse cx="100" cy="189" rx="28" ry="24" fill="#FEF3C7" opacity="0.9" />
      <path d="M140 172 Q 170 142, 162 110 Q 154 86, 140 100 Q 153 122, 145 150 Q 139 170, 129 177 Z" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1.2" />
      <path d="M63 178 Q 47 182, 41 194" fill="none" stroke="#F97316" strokeWidth="8" strokeLinecap="round" />
      <path d="M137 178 Q 153 182, 159 194" fill="none" stroke="#F97316" strokeWidth="8" strokeLinecap="round" />
      <rect x="30" y="190" width="22" height="16" rx="3" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1" />
      <line x1="30" y1="194" x2="52" y2="194" stroke="#F59E0B" strokeWidth="0.8" />
      <line x1="30" y1="198" x2="52" y2="198" stroke="#F59E0B" strokeWidth="0.8" />
      <line x1="30" y1="202" x2="52" y2="202" stroke="#F59E0B" strokeWidth="0.8" />
      <ellipse cx="100" cy="116" rx="38" ry="36" fill="#F97316" />
      <path d="M70 93 L60 58 L86 86 Z" fill="#F97316" stroke="#EA580C" strokeWidth="1" />
      <path d="M130 93 L140 58 L114 86 Z" fill="#F97316" stroke="#EA580C" strokeWidth="1" />
      <path d="M72 91 L65 68 L85 87 Z" fill="#FECACA" opacity="0.75" />
      <path d="M128 91 L135 68 L115 87 Z" fill="#FECACA" opacity="0.75" />
      <path d="M80 100 Q 87 96, 94 100" fill="none" stroke="#C2410C" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M106 100 Q 113 96, 120 100" fill="none" stroke="#C2410C" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="87" cy="111" r="10" fill="white" stroke="#EA580C" strokeWidth="0.5" />
      <circle cx="113" cy="111" r="10" fill="white" stroke="#EA580C" strokeWidth="0.5" />
      <circle cx="89" cy="112" r="5.5" fill="#1a0a0a" />
      <circle cx="115" cy="112" r="5.5" fill="#1a0a0a" />
      <circle cx="91" cy="110" r="2" fill="white" />
      <circle cx="117" cy="110" r="2" fill="white" />
      <ellipse cx="100" cy="124" rx="9" ry="6" fill="#FEF3C7" />
      <ellipse cx="100" cy="125" rx="4" ry="3" fill="#1a0a0a" />
      <path d="M 92 135 Q 100 141, 108 135" fill="none" stroke="#1a0a0a" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="74" cy="122" rx="7" ry="4" fill="rgba(252,165,165,0.4)" />
      <ellipse cx="126" cy="122" rx="7" ry="4" fill="rgba(252,165,165,0.4)" />
    </svg>
  );
}

function FoxStage7Advanced() {
  return (
    <svg viewBox="0 0 200 255" width="130" height="166"
      style={{ overflow: 'visible', animation: 'pet-breath 2.4s ease-in-out infinite' }}>
      {[[34,60],[166,60],[27,153],[173,153],[100,30]].map(([cx,cy],i) => (
        <g key={i} transform={`translate(${cx} ${cy})`}
          style={{ animation: `sparkle-twinkle 2s ease-in-out ${i * 0.35}s infinite` }}>
          <path d="M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2 Z" fill="#F59E0B" />
        </g>
      ))}
      <ellipse cx="100" cy="250" rx="42" ry="5.5" fill="rgba(0,0,0,0.1)" />
      <path d="M 61 153 Q 67 200, 51 217 L 149 217 Q 133 200, 139 153 Z" fill="#1a0a3a" stroke="#5a1fa0" strokeWidth="1" opacity="0.92" />
      <path d="M 61 153 Q 67 200, 51 217" fill="none" stroke="#ffc107" strokeWidth="1.5" />
      <path d="M 139 153 Q 133 200, 149 217" fill="none" stroke="#ffc107" strokeWidth="1.5" />
      <path d="M 73 153 L 100 165 L 127 153 Z" fill="#ffc107" opacity="0.9" />
      <ellipse cx="100" cy="177" rx="38" ry="30" fill="#EA580C" />
      <path d="M137 167 Q 169 137, 161 106 Q 152 82, 138 96 Q 152 118, 144 146 Q 138 166, 128 172 Z" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1.2" />
      <ellipse cx="100" cy="112" rx="38" ry="36" fill="#EA580C" />
      <path d="M70 90 L60 55 L86 82 Z" fill="#EA580C" stroke="#C2410C" strokeWidth="1" />
      <path d="M130 90 L140 55 L114 82 Z" fill="#EA580C" stroke="#C2410C" strokeWidth="1" />
      <path d="M72 88 L65 66 L85 83 Z" fill="#FECACA" opacity="0.75" />
      <path d="M128 88 L135 66 L115 83 Z" fill="#FECACA" opacity="0.75" />
      <path d="M80 96 Q 87 92, 94 96" fill="none" stroke="#C2410C" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M106 96 Q 113 92, 120 96" fill="none" stroke="#C2410C" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="87" cy="108" r="10" fill="white" stroke="#C2410C" strokeWidth="0.5" />
      <circle cx="113" cy="108" r="10" fill="white" stroke="#C2410C" strokeWidth="0.5" />
      <circle cx="89" cy="109" r="5.5" fill="#1a0a0a" />
      <circle cx="115" cy="109" r="5.5" fill="#1a0a0a" />
      <circle cx="91" cy="107" r="2" fill="white" />
      <circle cx="117" cy="107" r="2" fill="white" />
      <ellipse cx="100" cy="122" rx="9" ry="6" fill="#FEF3C7" />
      <ellipse cx="100" cy="123" rx="4" ry="3" fill="#1a0a0a" />
      <path d="M 92 132 Q 100 138, 108 132" fill="none" stroke="#1a0a0a" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 97 134 L 98.5 138 L 100 134 Z" fill="white" stroke="#1a0a0a" strokeWidth="0.5" />
      <ellipse cx="74" cy="120" rx="7" ry="4" fill="rgba(252,165,165,0.4)" />
      <ellipse cx="126" cy="120" rx="7" ry="4" fill="rgba(252,165,165,0.4)" />
    </svg>
  );
}

function FoxStage8Master() {
  return (
    <svg viewBox="0 0 200 260" width="130" height="169"
      style={{ overflow: 'visible', animation: 'pet-breath 2.3s ease-in-out infinite' }}>
      <circle cx="100" cy="122" r="88" fill="none" stroke="#F59E0B" strokeWidth="0.5" opacity="0.3"
        style={{ animation: 'pet-aura-pulse 3s ease-in-out infinite' }} />
      {[[34,54],[166,54],[24,149],[176,149],[100,24],[60,30],[140,30]].map(([cx,cy],i) => (
        <g key={i} transform={`translate(${cx} ${cy})`}
          style={{ animation: `sparkle-twinkle 1.8s ease-in-out ${i * 0.3}s infinite` }}>
          <path d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z"
            fill="#F59E0B" style={{ filter: 'drop-shadow(0 0 3px #F59E0B)' }} />
        </g>
      ))}
      <ellipse cx="100" cy="255" rx="44" ry="5.5" fill="rgba(0,0,0,0.12)" />
      <path d="M 59 152 Q 65 200, 49 220 L 151 220 Q 135 200, 141 152 Z" fill="#1a0a3a" stroke="#5a1fa0" strokeWidth="1.2" opacity="0.95" />
      <path d="M 59 152 Q 65 200, 49 220" fill="none" stroke="#ffc107" strokeWidth="2" />
      <path d="M 141 152 Q 135 200, 151 220" fill="none" stroke="#ffc107" strokeWidth="2" />
      <path d="M 71 152 L 100 166 L 129 152 Z" fill="#ffc107" opacity="0.95" />
      <ellipse cx="100" cy="176" rx="38" ry="30" fill="#C2410C" />
      <path d="M139 166 Q 172 134, 164 100 Q 155 76, 140 92 Q 154 114, 146 144 Q 139 165, 128 172 Z" fill="#FFF7ED" stroke="#F59E0B" strokeWidth="1.5" />
      <ellipse cx="162" cy="98" rx="9" ry="8" fill="#F59E0B" opacity="0.65"
        style={{ filter: 'drop-shadow(0 0 4px #F59E0B)' }} />
      <ellipse cx="100" cy="112" rx="40" ry="38" fill="#C2410C" />
      <ellipse cx="100" cy="56" rx="33" ry="6" fill="none" stroke="#F59E0B" strokeWidth="2.5" opacity="0.9"
        style={{ filter: 'drop-shadow(0 0 6px #F59E0B)', animation: 'pet-halo-spin 4s linear infinite' }} />
      <path d="M 70 86 L 66 70 L 80 80 L 100 64 L 120 80 L 134 70 L 130 86 Z" fill="#F59E0B" stroke="#EA580C" strokeWidth="1" />
      <circle cx="80" cy="79" r="3.5" fill="#EF4444" />
      <circle cx="100" cy="70" r="4" fill="#3B82F6" />
      <circle cx="120" cy="79" r="3.5" fill="#10B981" />
      <path d="M68 90 L58 54 L84 82 Z" fill="#C2410C" stroke="#9A3412" strokeWidth="1" />
      <path d="M132 90 L142 54 L116 82 Z" fill="#C2410C" stroke="#9A3412" strokeWidth="1" />
      <path d="M70 88 L63 66 L83 83 Z" fill="#FECACA" opacity="0.75" />
      <path d="M130 88 L137 66 L117 83 Z" fill="#FECACA" opacity="0.75" />
      <circle cx="85" cy="110" r="11" fill="white" stroke="#9A3412" strokeWidth="0.5" />
      <circle cx="115" cy="110" r="11" fill="white" stroke="#9A3412" strokeWidth="0.5" />
      <circle cx="87" cy="111" r="7" fill="#1a0a0a" />
      <circle cx="117" cy="111" r="7" fill="#1a0a0a" />
      <path d="M 87 108 L 88 110 L 90 110 L 88.5 111.5 L 89 114 L 87 112.5 L 85 114 L 85.5 111.5 L 84 110 L 86 110 Z" fill="#F59E0B" opacity="0.9" />
      <path d="M 117 108 L 118 110 L 120 110 L 118.5 111.5 L 119 114 L 117 112.5 L 115 114 L 115.5 111.5 L 114 110 L 116 110 Z" fill="#F59E0B" opacity="0.9" />
      <circle cx="90" cy="108" r="1.5" fill="white" />
      <circle cx="120" cy="108" r="1.5" fill="white" />
      <ellipse cx="100" cy="124" rx="9" ry="6" fill="#FEF3C7" />
      <ellipse cx="100" cy="125" rx="4" ry="3" fill="#1a0a0a" />
      <path d="M 90 134 Q 100 142, 110 134" fill="none" stroke="#1a0a0a" strokeWidth="2" strokeLinecap="round" />
      <path d="M 96 136 L 97.5 140 L 99 136 Z" fill="white" stroke="#1a0a0a" strokeWidth="0.5" />
      <path d="M 101 136 L 102.5 140 L 104 136 Z" fill="white" stroke="#1a0a0a" strokeWidth="0.5" />
      <ellipse cx="72" cy="122" rx="8" ry="5" fill="rgba(252,165,165,0.45)" />
      <ellipse cx="128" cy="122" rx="8" ry="5" fill="rgba(252,165,165,0.45)" />
    </svg>
  );
}

const FOX_STAGE_COMPONENTS = [
  FoxStage1Egg,
  FoxStage2CrackingEgg,
  FoxStage3Baby,
  FoxStage4Apprentice,
  FoxStage5Studious,
  FoxStage6Strategic,
  FoxStage7Advanced,
  FoxStage8Master,
];

// ── PetFox Context ─────────────────────────────────────────────
const PetFoxContext = React.createContext(null);

function PetFoxProvider({ children }) {
  return (
    <PetFoxContext.Provider value={{}}>
      {children}
    </PetFoxContext.Provider>
  );
}

// ── FoxEvolutionPanel ──────────────────────────────────────────
function FoxEvolutionPanel({ xp }) {
  const progression = evaluateFoxProgression(xp);
  const { currentStage, nextStage, stageProgress, score, isMax } = progression;
  const FoxComponent = FOX_STAGE_COMPONENTS[currentStage.id - 1];

  const [showLevelUp, setShowLevelUp] = React.useState(false);
  const prevStageRef = React.useRef(currentStage.id);

  React.useEffect(() => {
    if (currentStage.id > prevStageRef.current) {
      setShowLevelUp(true);
      const t = setTimeout(() => setShowLevelUp(false), 5000);
      prevStageRef.current = currentStage.id;
      return () => clearTimeout(t);
    }
    prevStageRef.current = currentStage.id;
  }, [currentStage.id]);

  return (
    <div className="glass" style={{ padding: '20px 22px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
      {/* Warm background tint */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse at 72% 50%, ${currentStage.color}18 0%, transparent 60%)`,
      }} />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, position: 'relative' }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
            MASCOTE · RAPOSA JURÍDICA
          </div>
          <div className="font-display" style={{ fontSize: 19, fontWeight: 700, marginTop: 3 }}>
            {currentStage.name}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2, fontStyle: 'italic' }}>
            {currentStage.desc}
          </div>
        </div>
        <div style={{
          flexShrink: 0,
          padding: '5px 12px', borderRadius: 20,
          background: `${currentStage.accent}22`, color: currentStage.accent,
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700,
          border: `1px solid ${currentStage.accent}44`,
          marginLeft: 12,
        }}>
          FASE {currentStage.id}/8
        </div>
      </div>

      {/* Fox + progress */}
      <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap', position: 'relative' }}>
        {/* Fox illustration */}
        <div style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 150, height: 170,
          background: `radial-gradient(circle at center, ${currentStage.color}30 0%, transparent 60%)`,
          borderRadius: 14,
        }}>
          <FoxComponent progress={stageProgress} />
        </div>

        {/* XP & milestones */}
        <div style={{ flex: 1, minWidth: 160 }}>
          {/* XP bar */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                <span className="num" style={{ color: currentStage.accent, fontSize: 14, fontWeight: 700 }}>
                  {score.toLocaleString('pt-BR')}
                </span>{' '}XP
              </span>
              {!isMax && nextStage && (
                <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>
                  próx: {nextStage.minXp.toLocaleString('pt-BR')}
                </span>
              )}
            </div>
            <div style={{ height: 8, background: 'rgba(12,13,18,0.08)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${stageProgress}%`,
                background: `linear-gradient(90deg, ${currentStage.color}, ${currentStage.accent})`,
                boxShadow: `0 0 10px ${currentStage.accent}66`,
                borderRadius: 6,
                transition: 'width 600ms ease',
              }} />
            </div>
          </div>

          {/* Stage milestone dots */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
            {FOX_STAGES.map(s => {
              const unlocked = s.id <= currentStage.id;
              return (
                <div key={s.id} style={{
                  width: 24, height: 24, borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                  background: unlocked ? `${s.accent}22` : 'rgba(12,13,18,0.04)',
                  border: `1px solid ${unlocked ? s.accent + '55' : 'rgba(12,13,18,0.08)'}`,
                  color: unlocked ? s.accent : 'var(--text-dim)',
                  transition: 'all 300ms',
                }}>
                  {unlocked ? '★' : s.id}
                </div>
              );
            })}
          </div>

          <div style={{ fontSize: 10.5, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
            {isMax
              ? '✨ Jornada completa. Pronto(a) para a toga!'
              : `Faltam ${(nextStage.minXp - score).toLocaleString('pt-BR')} XP para ${nextStage.name}`}
          </div>
        </div>
      </div>

      {/* Level-up flash overlay */}
      {showLevelUp && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10, borderRadius: 'inherit',
          background: `radial-gradient(ellipse at center, ${currentStage.color}55, transparent 70%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fade-in 400ms ease-out',
          pointerEvents: 'none',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 44, animation: 'pet-bob 1s ease-in-out infinite' }}>🦊</div>
            <div className="font-display" style={{
              fontSize: 22, fontWeight: 700, color: currentStage.accent,
              textShadow: `0 0 20px ${currentStage.accent}88`,
            }}>
              EVOLUIU!
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              {currentStage.name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.PetFoxProvider = PetFoxProvider;
window.FoxEvolutionPanel = FoxEvolutionPanel;
