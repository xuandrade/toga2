// FAB — opens SessionLogModal directly. Pomodoro with chronometer + post-session log form.

function QuickLogFAB({ onOpenSessionLog, onOpenPomodoro }) {
  return (
    <div className="fab">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
        <button onClick={onOpenPomodoro} title="Modo Blindado (Pomodoro / Cronômetro)"
          style={{
            width: 50, height: 50, borderRadius: 14,
            background: 'rgba(91,71,184,0.1)',
            border: '1px solid rgba(91,71,184,0.4)',
            color: '#3A2780', cursor: 'pointer',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 4px 14px rgba(91,71,184,0.2)',
          }}>
          <I.shield size={20} />
        </button>
        <button onClick={onOpenSessionLog} title="Registrar sessão de estudos"
          style={{
            width: 58, height: 58, borderRadius: 18,
            background: 'linear-gradient(135deg, var(--petroleo), var(--ciano))',
            border: 'none', color: 'white', cursor: 'pointer',
            display: 'grid', placeItems: 'center',
            boxShadow: '0 8px 24px rgba(0,184,212,0.35), 0 0 0 1px rgba(255,255,255,0.3) inset',
            transition: 'transform 200ms cubic-bezier(0.2,0.8,0.2,1)',
          }}>
          <I.plus size={24} stroke={2.5} />
        </button>
      </div>
    </div>
  );
}

// Pomodoro options (countdown) + Cronômetro (count-up)
const POMODORO_OPTIONS = [
  { mins: 30, label: '30 min'   },
  { mins: 45, label: '45 min'   },
  { mins: 60, label: '1 hora'   },
  { mins: 90, label: '1h 30min' },
];

const STUDY_TYPES_POM = [
  'Lei seca', 'Teoria', 'Jurisprudência', 'Questões',
  'Revisão', 'Mapa mental', 'Aula', 'Simulado',
];

function PomodoroModal({ open, onClose, subjects, onCompleteSession, customStudyTypes = [], onAddCustomStudyType }) {
  const [phase, setPhase] = React.useState('pick');     // pick | running | done
  const [mode, setMode]   = React.useState('timer');    // timer | chrono
  const [mins, setMins]   = React.useState(45);
  const [subjectId, setSubjectId] = React.useState(subjects[0]?.id || '');
  const [secsLeft, setSecsLeft]   = React.useState(45 * 60);
  const [secsElapsed, setSecsElapsed] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  // Done-phase form fields
  const [doneDiscipline, setDoneDiscipline] = React.useState('');
  const [doneStudyType, setDoneStudyType]   = React.useState('');
  const [doneNote, setDoneNote]             = React.useState('');
  const [doneMins, setDoneMins]             = React.useState(0);

  const totalSecs = mins * 60;

  // Wall-clock anchored ticking — avoids setTimeout drift, survives tab throttling.
  const startAtRef = React.useRef(null);   // ms timestamp of current run-segment start
  const accumMsRef = React.useRef(0);      // accumulated ms across pauses

  React.useEffect(() => {
    if (phase !== 'running' || paused) return;
    startAtRef.current = Date.now();
    const tick = () => {
      const elapsedMs = accumMsRef.current + (Date.now() - startAtRef.current);
      const elapsedSec = Math.floor(elapsedMs / 1000);
      if (mode === 'timer') {
        const left = totalSecs - elapsedSec;
        if (left <= 0) {
          setSecsLeft(0);
          accumMsRef.current = totalSecs * 1000;
          setDoneMins(mins);
          setPhase('done');
          window.celebrateVictory && window.celebrateVictory();
        } else {
          setSecsLeft(left);
        }
      } else {
        setSecsElapsed(elapsedSec);
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => {
      accumMsRef.current += Date.now() - startAtRef.current;
      clearInterval(id);
    };
  }, [phase, paused, mode, totalSecs, mins]);

  React.useEffect(() => {
    if (open) {
      setPhase('pick');
      setMode('timer');
      setSecsLeft(mins * 60);
      setSecsElapsed(0);
      setPaused(false);
      accumMsRef.current = 0;
      startAtRef.current = null;
      const firstSubj = subjects[0];
      setSubjectId(firstSubj?.id || '');
      setDoneDiscipline(firstSubj?.name || '');
      setDoneStudyType('');
      setDoneNote('');
    }
  }, [open]);

  const start = () => {
    accumMsRef.current = 0;
    startAtRef.current = null;
    if (mode === 'timer') setSecsLeft(mins * 60);
    if (mode === 'chrono') setSecsElapsed(0);
    setPaused(false);
    setPhase('running');
    const subj = subjects.find(s => s.id === subjectId);
    if (subj) setDoneDiscipline(subj.name);
  };

  const finalize = () => {
    const elapsedMs = accumMsRef.current + (startAtRef.current && !paused ? (Date.now() - startAtRef.current) : 0);
    const elapsedSecs = Math.floor(elapsedMs / 1000);
    const elapsedMins = mode === 'timer'
      ? Math.max(1, Math.round(Math.min(mins * 60, elapsedSecs) / 60))
      : Math.max(1, Math.round(elapsedSecs / 60));
    setDoneMins(elapsedMins);
    setPhase('done');
  };

  const allStudyTypes = [...STUDY_TYPES_POM, ...customStudyTypes];
  const handleAddCustom = () => {
    const name = window.prompt('Novo tipo de estudo:');
    if (!name) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!allStudyTypes.includes(trimmed) && onAddCustomStudyType) onAddCustomStudyType(trimmed);
    setDoneStudyType(trimmed);
  };

  const saveAndClose = () => {
    onCompleteSession({
      minutes: doneMins,
      subjectId,
      discipline: doneDiscipline || undefined,
      studyType: doneStudyType || undefined,
      note: doneNote.trim() || undefined,
    });
    onClose();
  };

  if (!open) return null;
  const progress = mode === 'timer' ? 1 - secsLeft / totalSecs : 0;
  const r = 110, c = 2 * Math.PI * r;
  const showSecs = mode === 'timer' ? secsLeft : secsElapsed;
  const showH = Math.floor(showSecs / 3600);
  const showM = Math.floor((showSecs % 3600) / 60);
  const showS = showSecs % 60;

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px', borderRadius: 9,
    border: '1px solid rgba(42,45,58,0.13)',
    background: 'rgba(255,255,255,0.75)',
    fontSize: 13, color: 'var(--grafite)',
    fontFamily: 'inherit', outline: 'none',
  };
  const labelStyle = { fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5, display: 'block' };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 90,
      background: 'rgba(12,13,18,0.5)', backdropFilter: 'blur(8px)',
      display: 'grid', placeItems: 'center', padding: 24,
    }} onClick={onClose}>
      <div className="glass-strong anim-slide-up" onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 460, padding: 24, borderRadius: 18, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} className="btn-ghost" style={{ position: 'absolute', top: 12, right: 12 }}>
          <I.close size={14} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.25em', color: 'var(--neon-violet)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
            MODO BLINDADO
          </div>
          <div className="font-display gradient-neon" style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>
            Sessão de foco
          </div>
        </div>

        {phase === 'pick' && (
          <>
            {/* Mode toggle: Timer vs Cronômetro */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
              <button onClick={() => setMode('timer')}
                className={mode === 'timer' ? 'btn-neon' : 'btn-ghost'}
                style={{ justifyContent: 'center', padding: '8px',
                  ...(mode === 'timer' ? { background: 'var(--petroleo)', borderColor: 'transparent', color: 'white' } : {}) }}>
                ⏲ Timer
              </button>
              <button onClick={() => setMode('chrono')}
                className={mode === 'chrono' ? 'btn-neon' : 'btn-ghost'}
                style={{ justifyContent: 'center', padding: '8px',
                  ...(mode === 'chrono' ? { background: 'var(--petroleo)', borderColor: 'transparent', color: 'white' } : {}) }}>
                ⏱ Cronômetro
              </button>
            </div>

            {mode === 'timer' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 14 }}>
                {POMODORO_OPTIONS.map(o => (
                  <button key={o.mins} onClick={() => setMins(o.mins)}
                    style={{
                      padding: '10px 4px', borderRadius: 10, cursor: 'pointer',
                      background: mins === o.mins ? 'rgba(0,184,212,0.1)' : 'white',
                      border: `1px solid ${mins === o.mins ? 'rgba(0,184,212,0.5)' : 'rgba(12,13,18,0.08)'}`,
                      boxShadow: mins === o.mins ? '0 0 12px rgba(0,217,255,0.3)' : 'none',
                      color: 'var(--text-primary)', textAlign: 'center',
                    }}>
                    <div className="num" style={{ fontSize: 14, fontWeight: 700, color: mins === o.mins ? '#00b8d4' : 'var(--text-primary)' }}>
                      {o.label}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {mode === 'chrono' && (
              <div style={{ background: 'rgba(0,184,212,0.06)', padding: '12px 14px', borderRadius: 10, marginBottom: 14, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Modo cronômetro: o tempo conta para cima sem limite. Você decide quando finalizar.
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 5, fontWeight: 600 }}>DISCIPLINA</div>
              <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="input-base" style={{ width: '100%' }}>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <button onClick={start} className="btn-neon" style={{ width: '100%', justifyContent: 'center', padding: '11px 20px', fontSize: 13,
              background: 'linear-gradient(135deg, var(--petroleo), var(--ciano))', borderColor: 'transparent', color: 'white' }}>
              <I.play size={11} /> Iniciar {mode === 'timer' ? `· ${mins} min` : '· cronômetro'}
            </button>
          </>
        )}

        {phase === 'running' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: 260, height: 260, margin: '0 auto' }}>
              <svg viewBox="0 0 260 260" width={260} height={260}>
                <circle cx="130" cy="130" r={r} fill="none" stroke="rgba(12,13,18,0.06)" strokeWidth="4" />
                {mode === 'timer' && (
                  <circle cx="130" cy="130" r={r} fill="none" stroke="#00b8d4" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={c} strokeDashoffset={c * progress} transform="rotate(-90 130 130)"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(0,217,255,0.5))', transition: 'stroke-dashoffset 1s linear' }} />
                )}
                {mode === 'chrono' && (
                  <circle cx="130" cy="130" r={r} fill="none" stroke="var(--esmeralda)" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={c} strokeDashoffset={c * 0.15}
                    style={{ filter: 'drop-shadow(0 0 6px rgba(0,212,138,0.5))' }} />
                )}
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                <div className="num" style={{ fontSize: showH > 0 ? 38 : 50, fontWeight: 700, letterSpacing: '-0.02em' }}>
                  {showH > 0 && <>{String(showH).padStart(2,'0')}<span style={{ color: 'var(--text-dim)' }}>:</span></>}
                  {String(showM).padStart(2,'0')}<span style={{ color: 'var(--text-dim)' }}>:</span>{String(showS).padStart(2,'0')}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              <button className="btn-ghost" onClick={() => setPaused(p => !p)}>
                {paused ? <I.play size={12} /> : <I.pause size={12} />} {paused ? 'Continuar' : 'Pausar'}
              </button>
              <button className="btn-ghost" onClick={finalize}>Finalizar</button>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div>
            <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
              <div style={{ fontSize: 44, marginBottom: 6 }}>🛡</div>
              <div className="font-display gradient-neon" style={{ fontSize: 22, fontWeight: 700 }}>Sessão concluída!</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {doneMins} minutos · +{2 + (doneMins >= 90 ? 0 : 0)} XP base
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={labelStyle}>Disciplina</label>
                <select value={doneDiscipline} onChange={e => setDoneDiscipline(e.target.value)} style={inputStyle}>
                  <option value="">— Selecione —</option>
                  {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Tipo de estudo</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {allStudyTypes.map(t => (
                    <button key={t} onClick={() => setDoneStudyType(doneStudyType === t ? '' : t)}
                      className={doneStudyType === t ? 'btn-neon' : 'btn-ghost'}
                      style={{ fontSize: 11, padding: '4px 10px',
                        ...(doneStudyType === t ? { background: 'var(--petroleo)', borderColor: 'transparent', color: 'white' } : {}) }}>
                      {t}
                    </button>
                  ))}
                  <button onClick={handleAddCustom} className="btn-ghost"
                    style={{ fontSize: 11, padding: '4px 10px', borderStyle: 'dashed' }}>
                    + Outro
                  </button>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Observação (opcional)</label>
                <textarea placeholder="Tópicos, dificuldades, destaques…"
                  value={doneNote} onChange={e => setDoneNote(e.target.value)}
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
              </div>
            </div>

            <button onClick={saveAndClose} className="btn-neon" style={{
              width: '100%', justifyContent: 'center', marginTop: 18,
              padding: '12px', fontSize: 14,
              background: 'linear-gradient(135deg, var(--petroleo), var(--ciano))',
              borderColor: 'transparent', color: 'white',
            }}>
              Salvar sessão e coletar XP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

window.QuickLogFAB = QuickLogFAB;
window.PomodoroModal = PomodoroModal;
