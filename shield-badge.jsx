// ShieldBadge — light theme, evolving by completion %
function ShieldBadge({ percent = 0, size = 44, showRing = true }) {
let tier = 0;
if (percent >= 100) tier = 5;
else if (percent >= 80) tier = 4;
else if (percent >= 60) tier = 3;
else if (percent >= 40) tier = 2;
else if (percent >= 20) tier = 1;

const colors = ['#5A6478', '#00B8D4', '#00A86B', '#C9A961', '#5B47B8', '#0B3D5C'];
const glow = ['none', '0 0 6px rgba(0,184,212,0.3)', '0 0 12px rgba(0,168,107,0.45)',
'0 0 16px rgba(201,169,97,0.5)', '0 0 20px rgba(91,71,184,0.55)', '0 0 24px rgba(201,169,97,0.6)'];
const borderColor = colors[tier];

return (
<div style={{ width: size, height: size, position: 'relative', filter: `drop-shadow(${glow[tier]})` }}>
<svg viewBox="0 0 48 48" width={size} height={size}>
<defs>
<linearGradient id={`sh-${tier}`} x1="0" y1="0" x2="1" y2="1">
{tier === 5 ? (
<>
<stop offset="0%" stopColor="#0B3D5C">
<animate attributeName="stop-color" values="#0B3D5C;#00B8D4;#00A86B;#C9A961;#0B3D5C" dur="6s" repeatCount="indefinite" />
</stop>
<stop offset="100%" stopColor="#C9A961">
<animate attributeName="stop-color" values="#C9A961;#00A86B;#00B8D4;#0B3D5C;#C9A961" dur="6s" repeatCount="indefinite" />
</stop>
</>
) : (
<>
<stop offset="0%" stopColor={borderColor} stopOpacity={tier >= 2 ? 0.35 : 0.12} />
<stop offset="100%" stopColor={borderColor} stopOpacity={tier >= 3 ? 0.2 : 0.04} />
</>
)}
</linearGradient>
</defs>
<path
d="M24 4 L40 9 L40 22 C40 32 33 38 24 42 C15 38 8 32 8 22 L8 9 Z"
fill={`url(#sh-${tier})`} stroke={borderColor} strokeWidth={tier >= 2 ? 2 : 1.5} strokeLinejoin="round"
/>
{tier >= 2 && (
<g transform="translate(24 25)" stroke={borderColor} strokeWidth="1.8" fill="none" strokeLinecap="round">
<path d="M-5 -5 L5 5 M-3 -7 L-7 -3" />
<path d="M3 3 L6 6" />
</g>
)}
{tier < 2 && (
<text x="24" y="29" textAnchor="middle" fontSize="9" fontWeight="700" fill={borderColor} fontFamily="Space Grotesk">TOGA</text>
)}
{tier >= 3 && <circle cx="24" cy="12" r="1.6" fill={borderColor} />}
</svg>
{showRing && (
<svg viewBox="0 0 48 48" width={size} height={size} style={{ position: 'absolute', inset: 0 }}>
<circle cx="24" cy="24" r="22" fill="none" stroke="rgba(12,13,18,0.06)" strokeWidth="1.5" />
<circle cx="24" cy="24" r="22" fill="none" stroke={borderColor} strokeWidth="1.5"
strokeDasharray={`${(percent / 100) * 138.2} 138.2`} strokeLinecap="round"
transform="rotate(-90 24 24)" />
</svg>
)}
</div>
);
}

window.ShieldBadge = ShieldBadge;
