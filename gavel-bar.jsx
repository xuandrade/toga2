// GavelBar v2 — Premium progress bar + streak/shields inline
function GavelBar({ percentage, streak, shields }) {
  const pct = Math.min(100, Math.max(0, percentage));
  return (
    <div className="glass" style={{ padding: '14px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Gavel icon */}
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'rgba(201,169,97,0.12)',
          border: '1px solid rgba(201,169,97,0.25)',
          display: 'grid', placeItems: 'center',
          color: 'var(--dourado)',
          filter: 'drop-shadow(0 0 6px rgba(201,169,97,0.4))',
        }}>
          <I.gavel size={17} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
              RUMO À POSSE
            </span>
            <span className="num" style={{ fontSize: 14, fontWeight: 800, color: 'var(--petroleo)', letterSpacing: '-0.01em' }}>
              {percentage.toFixed(1)}<span style={{ fontSize: 10, fontWeight: 600, opacity: 0.7 }}>%</span>
            </span>
          </div>

          {/* Progress bar — thin and elegant */}
          <div style={{ height: 6, background: 'rgba(30,32,48,0.07)', borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: 0, width: `${pct}%`,
              background: 'linear-gradient(90deg, var(--esmeralda) 0%, var(--ciano) 60%, var(--petroleo) 100%)',
              borderRadius: 99,
              boxShadow: '0 0 10px rgba(0,184,212,0.4)',
              transition: 'width 800ms cubic-bezier(0.16,1,0.3,1)',
            }} />
            {/* Milestone marks */}
            {[25, 50, 75].map(p => (
              <div key={p} style={{
                position: 'absolute', left: `${p}%`, top: 0, bottom: 0,
                width: 1, background: pct >= p ? 'rgba(255,255,255,0.35)' : 'rgba(30,32,48,0.10)',
              }} />
            ))}
          </div>
        </div>

        {/* Streak + Shields chips */}
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 8.5, color: 'var(--text-dim)', letterSpacing: '0.15em', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', marginBottom: 2 }}>STREAK</div>
            <div className="num" style={{
              fontSize: 17, fontWeight: 800, color: 'var(--ambar)',
              filter: 'drop-shadow(0 0 6px rgba(255,193,7,0.5))',
              letterSpacing: '-0.01em',
            }}>🔥 {streak}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 8.5, color: 'var(--text-dim)', letterSpacing: '0.15em', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', marginBottom: 2 }}>SHIELDS</div>
            <div className="num" style={{
              fontSize: 17, fontWeight: 800, color: 'var(--ciano)',
              filter: 'drop-shadow(0 0 6px rgba(0,217,255,0.5))',
              letterSpacing: '-0.01em',
            }}>🛡 {shields}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.GavelBar = GavelBar;
