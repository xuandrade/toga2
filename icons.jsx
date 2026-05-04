// Icons
const Icon = ({ d, size = 16, stroke = 1.75, className = '', fill = 'none' }) => (
<svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className}>
{typeof d === 'string' ? <path d={d} /> : d}
</svg>
);
const I = {
check: (p) => <Icon {...p} d="M4 12l5 5L20 6" />,
plus: (p) => <Icon {...p} d="M12 5v14M5 12h14" />,
minus: (p) => <Icon {...p} d="M5 12h14" />,
up: (p) => <Icon {...p} d="M6 15l6-6 6 6" />,
down: (p) => <Icon {...p} d="M6 9l6 6 6-6" />,
shield: (p) => <Icon {...p} d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />,
bolt: (p) => <Icon {...p} d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
clock: (p) => <Icon {...p} d="M12 6v6l4 2M12 22a10 10 0 110-20 10 10 0 010 20z" />,
target: (p) => <Icon {...p} d="M12 22a10 10 0 110-20 10 10 0 010 20zM12 18a6 6 0 110-12 6 6 0 010 12zM12 14a2 2 0 110-4 2 2 0 010 4z" />,
book: (p) => <Icon {...p} d="M4 4h12a4 4 0 014 4v12H8a4 4 0 01-4-4V4zM4 4v12" />,
gavel: (p) => <Icon {...p} d="M14 5l5 5M16 3l5 5M11 8l5 5M4 20l7-7M3 21h9" />,
trophy: (p) => <Icon {...p} d="M8 21h8M12 17v4M6 4h12v5a6 6 0 01-12 0V4zM6 7H3a3 3 0 003 3M18 7h3a3 3 0 01-3 3" />,
settings: (p) => <Icon {...p} d="M12 15a3 3 0 100-6 3 3 0 000 6z" />,
download: (p) => <Icon {...p} d="M12 3v12M7 10l5 5 5-5M4 21h16" />,
play: (p) => <Icon {...p} d="M7 4v16l13-8L7 4z" fill="currentColor" />,
pause: (p) => <Icon {...p} d="M7 4h3v16H7zM14 4h3v16h-3z" fill="currentColor" />,
close: (p) => <Icon {...p} d="M6 6l12 12M18 6l-6 12" />,
calendar: (p) => <Icon {...p} d="M4 7h16v13H4zM4 7V5a1 1 0 011-1h14a1 1 0 011 1v2M8 3v4M16 3v4" />,
chevronR: (p) => <Icon {...p} d="M9 6l6 6-6 6" />,
chevronL: (p) => <Icon {...p} d="M15 6l-6 6 6 6" />,
zap: (p) => <Icon {...p} d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="currentColor" stroke="none" />,
plusSm: (p) => <Icon {...p} d="M12 5v14M5 12h14" stroke={2.5} />,
};
window.I = I;
window.Icon = Icon;
