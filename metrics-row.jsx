// TOGA — MetricsRow + ConcursoDonuts v2 — Ultra Premium

const INCENTIVE_MESSAGES = [
  { min: 1.00, text: '🏆 Meta batida! Você é um(a) monstro(a) da disciplina.' },
  { min: 0.90, text: '🔥 Falta tão pouco! Não para agora.' },
  { min: 0.80, text: '💪 Quase lá! Mais um esforço.' },
  { min: 0.70, text: '✨ Você está em ritmo de aprovado(a)!' },
  { min: 0.60, text: '🚀 Boa! Já passou da metade — siga firme.' },
];

function incentiveFor(progress) {
  return INCENTIVE_MESSAGES.find(m => progress >= m.min) || null;
}

// ── MetricsRow: 4 metric cards ──
function MetricsRow({ shared, setShared }) {
  const today = shared.dailyLogs[shared.dailyLogs.length - 1] || { hours: 0, questions: 0, reviews: 0 };
  const last7 = shared.dailyLogs.slice(-7);
  const weekHours = last7.reduce((a, d) => a + d.hours, 0);
  const weekQ = last7.reduce((a, d) => a + d.questions, 0);

  const metrics = [
    { label: 'Horas hoje',       value: today.hours.toFixed(1), goal: shared.goals.dailyHours,    unit: 'h',  color: '#00b8d4',       colorRaw: '#00b8d4',  glow: '#00d9ff', icon: <I.clock   size={13} /> },
    { label: 'Horas semana',     value: weekHours.toFixed(1),   goal: shared.goals.weeklyHours,   unit: 'h',  color: 'var(--tinta)',  colorRaw: '#5B47B8',  glow: '#7B67D8', icon: <I.target  size={13} /> },
    { label: 'Questões hoje',    value: today.questions,        goal: shared.goals.dailyQuestions, unit: '',   color: '#00c46a',       colorRaw: '#00c46a',  glow: '#00ff88', icon: <I.bolt    size={13} /> },
    { label: 'Questões semana',  value: weekQ,                  goal: shared.goals.weeklyQuestions,unit: '',   color: '#f59e0b',       colorRaw: '#f59e0b',  glow: '#ffc107', icon: <I.trophy  size={13} /> },
  ];

  return (
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(4, 1fr)' }} className="metrics-row">
      {metrics.map((m, i) => {
        const numericValue = parseFloat(m.value) || 0;
        const goal = m.goal || 0;
        const rawProgress = goal > 0 ? numericValue / goal : 0;
        const progress = Math.min(1, rawProgress);
        const done = progress >= 1;
        const pctDone = Math.round(rawProgress * 100);
        const remaining = Math.max(0, goal - numericValue);
        const remainingStr = m.unit === 'h' ? remaining.toFixed(1) : Math.ceil(remaining).toString();
        const incentive = goal > 0 ? incentiveFor(rawProgress) : null;
        return (
          <div key={i} className="glass anim-slide-up" style={{
            padding: '16px 18px',
            animationDelay: `${i * 55}ms`,
            background: done
              ? `linear-gradient(145deg, rgba(255,255,255,0.85), rgba(255,255,255,0.65)), radial-gradient(ellipse at 0% 0%, ${m.colorRaw}12, transparent 60%)`
              : 'var(--card-bg)',
            boxShadow: done
              ? `0 0 0 1px ${m.colorRaw}44, 0 0 24px ${m.glow}33, var(--card-shadow)`
              : undefined,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                color: 'var(--text-muted)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700,
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                <span style={{ color: m.colorRaw, filter: `drop-shadow(0 0 4px ${m.glow})` }}>{m.icon}</span>
                {m.label}
              </div>
              {done && (
                <div style={{
                  padding: '2px 7px', borderRadius: 99,
                  background: `${m.colorRaw}18`, border: `1px solid ${m.colorRaw}44`,
                  fontSize: 9, color: m.colorRaw, fontWeight: 800, letterSpacing: '0.10em',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>✓ META</div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
              <span className="num" style={{
                fontSize: 30, fontWeight: 800, color: m.colorRaw,
                letterSpacing: '-0.03em',
                filter: done ? `drop-shadow(0 0 10px ${m.glow}66)` : undefined,
              }}>{m.value}{m.unit}</span>
              <span className="num" style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>
                / {m.goal}{m.unit}
              </span>
            </div>

            {/* Thin progress bar */}
            <div style={{ height: 4, background: 'rgba(30,32,48,0.07)', borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: 0,
                width: `${progress * 100}%`,
                background: done
                  ? `linear-gradient(90deg, ${m.colorRaw}, ${m.glow})`
                  : `linear-gradient(90deg, ${m.colorRaw}aa, ${m.colorRaw})`,
                borderRadius: 99,
                boxShadow: done ? `0 0 8px ${m.glow}` : undefined,
                transition: 'width 700ms cubic-bezier(0.16,1,0.3,1)',
              }} />
            </div>

            {/* Progress labels: cumprida + restante */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginTop: 6, fontSize: 10,
              fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
              letterSpacing: '0.04em',
            }}>
              <span style={{ color: m.colorRaw }}>{pctDone}% cumprida</span>
              <span style={{ color: 'var(--text-dim)' }}>
                {done ? 'meta atingida' : `faltam ${remainingStr}${m.unit}`}
              </span>
            </div>

            {/* Incentive (only when >= 60%) */}
            {incentive && (
              <div style={{
                marginTop: 8, padding: '6px 10px', borderRadius: 8,
                background: `linear-gradient(90deg, ${m.colorRaw}14, ${m.colorRaw}06)`,
                border: `1px solid ${m.colorRaw}30`,
                fontSize: 11, fontWeight: 700, color: m.colorRaw,
                letterSpacing: '0.01em', lineHeight: 1.3,
              }}>
                {incentive.text}
              </div>
            )}
          </div>
        );
      })}
      <style>{`@media (max-width: 900px) { .metrics-row { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
    </div>
  );
}

// ── ConcursoDonuts — Redesigned, organic layout ──
function ConcursoDonuts({ concursos, setConcursos }) {
  const [editing, setEditing] = React.useState(null);
  const update = (id, patch) => setConcursos(arr => arr.map(c => c.id === id ? { ...c, ...patch } : c));
  const add = () => {
    const id = `c-${Date.now()}`;
    const date = new Date(); date.setDate(date.getDate() + 90);
    setConcursos(arr => [...arr, { id, name: 'Novo concurso', date: date.toISOString().slice(0,10), startedAt: new Date().toISOString().slice(0,10) }]);
    setEditing(id);
  };
  const remove = (id) => setConcursos(arr => arr.filter(c => c.id !== id));
  const editingC = concursos.find(c => c.id === editing);

  return (
    <div className="glass anim-slide-up" style={{ padding: '16px 18px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header row with inline "new" button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: editingC ? 12 : 14 }}>
        <div>
          <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, textTransform: 'uppercase' }}>
            TEMPO ATÉ A PROVA
          </div>
        </div>
        <button className="btn-neon" onClick={add} style={{ padding: '5px 11px', fontSize: 11, gap: 5 }}>
          <I.plus size={10} stroke={2.5} /> Novo
        </button>
      </div>

      {/* Edit form */}
      {editingC && (
        <div className="anim-slide-up" style={{
          display: 'grid', gap: 8, padding: '12px 14px',
          background: 'rgba(0,184,212,0.05)', borderRadius: 12, marginBottom: 14,
          border: '1px solid rgba(0,184,212,0.22)',
        }}>
          <input className="input-base" placeholder="Nome do concurso" value={editingC.name}
            autoFocus onKeyDown={e => { if (e.key === 'Enter') setEditing(null); }}
            onChange={e => update(editingC.id, { name: e.target.value })} />
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <div style={{ color: 'var(--text-dim)', fontSize: 10, marginBottom: 3, fontWeight: 600 }}>Data da prova</div>
              <input className="input-base" type="date" value={editingC.date}
                onChange={e => update(editingC.id, { date: e.target.value })} style={{ width: '100%' }} />
            </div>
            <div>
              <div style={{ color: 'var(--text-dim)', fontSize: 10, marginBottom: 3, fontWeight: 600 }}>Início</div>
              <input className="input-base" type="date" value={editingC.startedAt || ''}
                onChange={e => update(editingC.id, { startedAt: e.target.value })} style={{ width: '100%' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn-neon" onClick={() => setEditing(null)} style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}>OK</button>
            <button className="btn-ghost" onClick={() => { remove(editingC.id); setEditing(null); }}
              style={{ color: 'var(--coral)', borderColor: 'rgba(232,93,93,0.3)' }}>
              <I.close size={11} /> Remover
            </button>
          </div>
        </div>
      )}

      {concursos.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px 0' }}>
          <div style={{ fontSize: 28, opacity: 0.25 }}>⚖️</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
            Nenhum concurso.<br />Clique em <strong>Novo</strong> para adicionar.
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid', gap: 10, flex: 1,
          gridTemplateColumns: concursos.length > 1 ? 'repeat(2, 1fr)' : '1fr',
          alignItems: 'start',
        }}>
          {concursos.map((c, idx) => (
            <ConcursoDonutItem key={c.id} c={c} onEdit={() => setEditing(c.id)} idx={idx} />
          ))}
        </div>
      )}
    </div>
  );
}

function ConcursoDonutItem({ c, onEdit, idx }) {
  const [hov, setHov] = React.useState(false);
  const days = window.DA.daysUntil(c.date);
  const startedAt = c.startedAt ? new Date(c.startedAt) : new Date();
  const target = c.date ? new Date(c.date) : new Date();
  const totalDays = Math.max(1, Math.round((target - startedAt) / 86400000));
  const elapsed = Math.max(0, totalDays - (days || 0));
  const remainingPct = 1 - Math.min(1, elapsed / totalDays);

  let color = '#00b8d4', colorRaw = '#00b8d4', glow = '#00d9ff';
  if (days !== null && days < 30) { color = 'var(--coral)'; colorRaw = '#E85D5D'; glow = '#FF7070'; }
  else if (days !== null && days < 60) { color = '#f59e0b'; colorRaw = '#f59e0b'; glow = '#ffc107'; }

  const r = 36; const circ = 2 * Math.PI * r;
  const urgent = days !== null && days < 30 && days >= 0;

  return (
    <div
      onClick={onEdit}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer',
        padding: '14px 10px', borderRadius: 14,
        background: hov
          ? `linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))`
          : `radial-gradient(ellipse at 50% 0%, ${colorRaw}0d, transparent 70%)`,
        border: `1px solid ${colorRaw}28`,
        boxShadow: hov ? `0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px ${colorRaw}33` : 'none',
        transform: hov ? 'translateY(-2px)' : 'none',
        transition: 'all 200ms cubic-bezier(0.16,1,0.3,1)',
        animation: `scale-in 400ms ${idx * 80}ms cubic-bezier(0.16,1,0.3,1) both`,
      }}
    >
      {urgent && (
        <div style={{
          padding: '2px 8px', borderRadius: 99, marginBottom: 2,
          background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)',
          fontSize: 9, color: '#f59e0b', fontWeight: 800, letterSpacing: '0.12em',
          fontFamily: 'JetBrains Mono, monospace',
        }}>URGENTE</div>
      )}

      {/* Donut */}
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <svg viewBox="0 0 100 100" width={80} height={80} style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}>
          <circle cx="50" cy="50" r={r} fill="none" stroke={`${colorRaw}14`} strokeWidth="8" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${remainingPct * circ} ${circ}`} strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${glow}88)`,
              transition: 'stroke-dasharray 700ms cubic-bezier(0.16,1,0.3,1)',
            }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
          <div>
            <div className="num" style={{
              fontSize: 20, fontWeight: 800, color, letterSpacing: '-0.03em', lineHeight: 1,
              filter: `drop-shadow(0 0 6px ${glow}66)`,
            }}>{days ?? '—'}</div>
            <div style={{ fontSize: 8, color: 'var(--text-dim)', letterSpacing: '0.15em', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>DIAS</div>
          </div>
        </div>
      </div>

      {/* Name + date */}
      <div style={{ textAlign: 'center', minWidth: 0, width: '100%', paddingTop: 2 }}>
        <div className="font-display" style={{
          fontSize: 12, fontWeight: 700, color: 'var(--text-primary)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{c.name}</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
          {c.date ? new Date(c.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' }) : 'sem data'}
        </div>
      </div>

      {/* Thin progress strip */}
      <div style={{ width: '100%', height: 3, background: `${colorRaw}18`, borderRadius: 99, overflow: 'hidden', marginTop: 2 }}>
        <div style={{
          height: '100%', width: `${(1 - remainingPct) * 100}%`,
          background: `linear-gradient(90deg, ${colorRaw}88, ${colorRaw})`,
          borderRadius: 99,
          transition: 'width 700ms cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>
    </div>
  );
}

// ── AccuracyOverallCard — gráfico rosa de % de acertos geral ──
function AccuracyOverallCard({ shared }) {
  const logs = shared.dailyLogs || [];
  let totalCorrect = 0, totalWrong = 0;
  // Sum across entries (use entries[] when available)
  logs.forEach(l => {
    const ents = (l.entries && l.entries.length > 0) ? l.entries : [l];
    ents.forEach(e => {
      totalCorrect += e.correct || 0;
      totalWrong += e.wrong || 0;
    });
  });
  const totalQ = totalCorrect + totalWrong;
  const pct = totalQ > 0 ? (totalCorrect / totalQ) * 100 : 0;

  // Last 7 days accuracy
  const today = new Date(); today.setHours(0,0,0,0);
  let weekCorrect = 0, weekWrong = 0;
  logs.forEach(l => {
    const d = new Date(l.date + 'T00:00:00');
    if ((today - d) > 7 * 86400000) return;
    const ents = (l.entries && l.entries.length > 0) ? l.entries : [l];
    ents.forEach(e => {
      weekCorrect += e.correct || 0;
      weekWrong += e.wrong || 0;
    });
  });
  const weekTotal = weekCorrect + weekWrong;
  const weekPct = weekTotal > 0 ? (weekCorrect / weekTotal) * 100 : 0;

  const PINK = '#EC4899';
  const PINK_DEEP = '#BE185D';
  const PINK_GLOW = '#F472B6';

  const r = 56;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  if (totalQ === 0) {
    return (
      <div className="glass" style={{ padding: '18px 20px' }}>
        <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 6 }}>
          PERCENTUAL DE ACERTOS · GERAL
        </div>
        <div className="font-display" style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Ainda sem questões registradas</div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
          Registre sessões com acertos/erros pra acompanhar sua acurácia geral aqui.
        </div>
      </div>
    );
  }

  return (
    <div className="glass anim-slide-up" style={{
      padding: '18px 20px',
      background: `linear-gradient(145deg, rgba(255,255,255,0.85), rgba(255,255,255,0.6)), radial-gradient(ellipse at 0% 0%, ${PINK}14, transparent 60%)`,
      border: `1px solid ${PINK}28`,
      boxShadow: `0 0 0 1px ${PINK}22, 0 8px 32px -8px ${PINK_GLOW}33, var(--card-shadow)`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
          <svg viewBox="0 0 140 140" width={140} height={140} style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}>
            <defs>
              <linearGradient id="acc-pink-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={PINK_GLOW} />
                <stop offset="100%" stopColor={PINK_DEEP} />
              </linearGradient>
            </defs>
            <circle cx="70" cy="70" r={r} fill="none" stroke={`${PINK}1a`} strokeWidth="11" />
            <circle cx="70" cy="70" r={r} fill="none" stroke="url(#acc-pink-grad)" strokeWidth="11"
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 8px ${PINK_GLOW}88)`,
                transition: 'stroke-dasharray 800ms cubic-bezier(0.16,1,0.3,1)',
              }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
            <div>
              <div className="num" style={{
                fontSize: 30, fontWeight: 800, color: PINK_DEEP, lineHeight: 1, letterSpacing: '-0.03em',
                filter: `drop-shadow(0 0 6px ${PINK_GLOW}66)`,
              }}>{pct.toFixed(0)}<span style={{ fontSize: 16, opacity: 0.7 }}>%</span></div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.16em', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', marginTop: 3 }}>
                ACERTOS
              </div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 4 }}>
            PERCENTUAL DE ACERTOS · GERAL
          </div>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 700, color: PINK_DEEP, marginBottom: 8 }}>
            {pct >= 80 ? 'Excelente acurácia 🎯'
              : pct >= 70 ? 'Boa acurácia 👍'
              : pct >= 60 ? 'No caminho certo'
              : pct >= 50 ? 'Atenção: revisar teoria'
              : 'Crítico: foque em teoria antes de questões'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
            <div style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(0,168,107,0.08)', border: '1px solid rgba(0,168,107,0.18)' }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '0.1em' }}>ACERTOS</div>
              <div className="num" style={{ fontSize: 18, fontWeight: 800, color: 'var(--esmeralda)' }}>{totalCorrect.toLocaleString('pt-BR')}</div>
            </div>
            <div style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(232,93,93,0.08)', border: '1px solid rgba(232,93,93,0.18)' }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '0.1em' }}>ERROS</div>
              <div className="num" style={{ fontSize: 18, fontWeight: 800, color: 'var(--coral)' }}>{totalWrong.toLocaleString('pt-BR')}</div>
            </div>
            <div style={{ padding: '8px 10px', borderRadius: 8, background: `${PINK}10`, border: `1px solid ${PINK}28` }}>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '0.1em' }}>7 DIAS</div>
              <div className="num" style={{ fontSize: 18, fontWeight: 800, color: PINK_DEEP }}>
                {weekTotal > 0 ? `${weekPct.toFixed(0)}%` : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.MetricsRow = MetricsRow;
window.ConcursoDonuts = ConcursoDonuts;
window.AccuracyOverallCard = AccuracyOverallCard;
