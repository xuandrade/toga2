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

function PomodoroModal({ open, onClose, subjects, onCompleteSession, onOpenFullLog, customStudyTypes = [], onAddCustomStudyType }) {
  const [phase, setPhase] = React.useState('pick');     // pick | running | finished
  const [mode, setMode]   = React.useState('timer');    // timer | chrono
  const [mins, setMins]   = React.useState(45);
  const [subjectId, setSubjectId] = React.useState(subjects[0]?.id || '');
  const [secsLeft, setSecsLeft]   = React.useState(45 * 60);
  const [secsElapsed, setSecsElapsed] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [pauseSecs, setPauseSecs] = React.useState(0); // seconds since last pause
  const [distractionAlert, setDistractionAlert] = React.useState(false);
  const [naturallyFinished, setNaturallyFinished] = React.useState(false);

  const totalSecs = mins * 60;

  // Wall-clock anchored ticking — avoids setTimeout drift, survives tab throttling.
  const startAtRef = React.useRef(null);   // ms timestamp of current run-segment start
  const accumMsRef = React.useRef(0);      // accumulated ms across pauses
  const pauseStartRef = React.useRef(null);
  const alertedRef = React.useRef(false);

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
          setNaturallyFinished(true);
          setPhase('finished');
          window.celebrateVictory && window.celebrateVictory();
          window.playTimerEnd && window.playTimerEnd();
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

  // Distraction watchdog: while paused, count seconds and alert at 5min
  React.useEffect(() => {
    if (phase !== 'running' || !paused) {
      pauseStartRef.current = null;
      alertedRef.current = false;
      setPauseSecs(0);
      return;
    }
    pauseStartRef.current = Date.now();
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - pauseStartRef.current) / 1000);
      setPauseSecs(elapsed);
      if (elapsed >= 300 && !alertedRef.current) {
        alertedRef.current = true;
        setDistractionAlert(true);
        window.playEmergency && window.playEmergency();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [phase, paused]);

  React.useEffect(() => {
    if (open) {
      setPhase('pick');
      setMode('timer');
      setSecsLeft(mins * 60);
      setSecsElapsed(0);
      setPaused(false);
      setPauseSecs(0);
      setDistractionAlert(false);
      setNaturallyFinished(false);
      accumMsRef.current = 0;
      startAtRef.current = null;
      pauseStartRef.current = null;
      alertedRef.current = false;
      const firstSubj = subjects[0];
      setSubjectId(firstSubj?.id || '');
    }
  }, [open]);

  const start = () => {
    accumMsRef.current = 0;
    startAtRef.current = null;
    if (mode === 'timer') setSecsLeft(mins * 60);
    if (mode === 'chrono') setSecsElapsed(0);
    setPaused(false);
    setPhase('running');
    setNaturallyFinished(false);
  };

  // Manually finalize (early exit). No XP — only natural timer completion awards XP.
  const finalizeEarly = () => {
    const elapsedMs = accumMsRef.current + (startAtRef.current && !paused ? (Date.now() - startAtRef.current) : 0);
    const elapsedSecs = Math.floor(elapsedMs / 1000);
    const elapsedMins = mode === 'timer'
      ? Math.max(1, Math.round(Math.min(mins * 60, elapsedSecs) / 60))
      : Math.max(1, Math.round(elapsedSecs / 60));
    setNaturallyFinished(mode === 'chrono'); // chrono is open-ended → still counts as completed
    setPhase('finished');
  };

  // Open the full SessionLogModal carrying the timed duration in.
  const openFullForm = () => {
    const elapsedMs = accumMsRef.current + (startAtRef.current && !paused && phase === 'running' ? (Date.now() - startAtRef.current) : 0);
    const elapsedSecs = Math.floor(elapsedMs / 1000);
    const durationMin = mode === 'timer'
      ? Math.max(1, Math.round(Math.min(totalSecs, elapsedSecs) / 60))
      : Math.max(1, Math.round(elapsedSecs / 60));
    const subj = subjects.find(s => s.id === subjectId);
    const awardXp = !!naturallyFinished;
    onClose();
    if (onOpenFullLog) {
      onOpenFullLog({
        durationMin,
        discipline: subj?.name || '',
        awardXp,
        source: awardXp ? 'pomodoro' : 'pomodoro-early',
      });
    }
  };

  if (!open) return null;
  const progress = mode === 'timer' ? 1 - secsLeft / totalSecs : 0;
  const r = 110, c = 2 * Math.PI * r;
  const showSecs = mode === 'timer' ? secsLeft : secsElapsed;
  const showH = Math.floor(showSecs / 3600);
  const showM = Math.floor((showSecs % 3600) / 60);
  const showS = showSecs % 60;

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
                <div className="num" style={{ fontSize: showH > 0 ? 38 : 50, fontWeight: 700, letterSpacing: '-0.02em', color: paused ? 'var(--coral)' : 'var(--text-primary)' }}>
                  {showH > 0 && <>{String(showH).padStart(2,'0')}<span style={{ color: 'var(--text-dim)' }}>:</span></>}
                  {String(showM).padStart(2,'0')}<span style={{ color: 'var(--text-dim)' }}>:</span>{String(showS).padStart(2,'0')}
                </div>
              </div>
            </div>
            {paused && (
              <div style={{
                marginTop: 14, padding: '8px 12px', borderRadius: 10,
                background: pauseSecs >= 240 ? 'rgba(232,93,93,0.10)' : 'rgba(245,158,11,0.10)',
                border: `1px solid ${pauseSecs >= 240 ? 'rgba(232,93,93,0.40)' : 'rgba(245,158,11,0.35)'}`,
                fontSize: 12, color: pauseSecs >= 240 ? 'var(--coral)' : 'var(--ambar)',
                fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
              }}>
                ⏸ Pausado há {Math.floor(pauseSecs/60)}min {String(pauseSecs%60).padStart(2,'0')}s
                {pauseSecs >= 240 && pauseSecs < 300 && <span> · alerta em {300 - pauseSecs}s</span>}
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
              {mode === 'timer'
                ? 'XP só é concedido se o timer for finalizado naturalmente.'
                : 'Modo cronômetro: registre quando quiser. Sem XP automático.'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <button className="btn-ghost" onClick={() => setPaused(p => !p)}>
                {paused ? <I.play size={12} /> : <I.pause size={12} />} {paused ? 'Continuar' : 'Pausar'}
              </button>
              <button className="btn-ghost" onClick={finalizeEarly}
                style={{ borderColor: 'rgba(232,93,93,0.3)', color: 'var(--coral)' }}>
                Encerrar antes
              </button>
            </div>
          </div>
        )}

        {phase === 'finished' && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 6 }}>{naturallyFinished ? '🏆' : '🛡'}</div>
            <div className="font-display gradient-neon" style={{ fontSize: 22, fontWeight: 700 }}>
              {naturallyFinished ? 'Timer concluído!' : 'Sessão encerrada'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              {naturallyFinished
                ? 'Excelente foco. Registre o que estudou pra coletar o XP da sessão.'
                : 'Sem XP automático (timer não foi até o fim). Você ainda pode registrar a sessão.'}
            </div>
            <button onClick={openFullForm} className="btn-neon" style={{
              width: '100%', justifyContent: 'center', marginTop: 18,
              padding: '12px', fontSize: 14,
              background: 'linear-gradient(135deg, var(--petroleo), var(--ciano))',
              borderColor: 'transparent', color: 'white',
            }}>
              ✏️ Abrir registro completo (tema, questões, acertos, erros)
            </button>
            <button onClick={onClose} className="btn-ghost" style={{ marginTop: 8, fontSize: 12 }}>
              Fechar sem registrar
            </button>
          </div>
        )}
      </div>

      {/* Distraction alert overlay */}
      {distractionAlert && (
        <div onClick={e => e.stopPropagation()} style={{
          position: 'fixed', inset: 0, zIndex: 110,
          background: 'radial-gradient(ellipse at center, rgba(220,38,38,0.55), rgba(60,10,10,0.85))',
          backdropFilter: 'blur(6px)',
          display: 'grid', placeItems: 'center', padding: 24,
          animation: 'distraction-flash 1.2s ease-in-out infinite',
        }}>
          <style>{`
            @keyframes distraction-flash {
              0%, 100% { background: radial-gradient(ellipse at center, rgba(220,38,38,0.55), rgba(60,10,10,0.85)); }
              50%      { background: radial-gradient(ellipse at center, rgba(248,113,113,0.75), rgba(120,20,20,0.95)); }
            }
            @keyframes distraction-pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
          `}</style>
          <div style={{
            maxWidth: 460, padding: '32px 28px',
            background: 'rgba(255,255,255,0.96)', borderRadius: 20,
            border: '2px solid #DC2626',
            boxShadow: '0 0 0 6px rgba(220,38,38,0.45), 0 24px 80px rgba(120,20,20,0.45)',
            textAlign: 'center',
            animation: 'distraction-pulse 1.2s ease-in-out infinite',
          }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>🚨</div>
            <div style={{ fontSize: 11, letterSpacing: '0.28em', color: '#B91C1C', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, marginBottom: 6 }}>
              ALERTA DISTRAÇÃO
            </div>
            <div className="font-display" style={{ fontSize: 22, fontWeight: 800, color: '#7F1D1D', lineHeight: 1.25, marginBottom: 8 }}>
              Volte a estudar!
            </div>
            <div style={{ fontSize: 14, color: '#7F1D1D', lineHeight: 1.5, fontWeight: 600 }}>
              A realização do seu sonho depende disso!
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' }}>
              <button onClick={() => { setDistractionAlert(false); setPaused(false); }}
                className="btn-neon" style={{
                  padding: '12px 22px', fontSize: 14,
                  background: 'linear-gradient(135deg, #DC2626, #7F1D1D)',
                  borderColor: 'transparent', color: 'white',
                  boxShadow: '0 8px 24px rgba(220,38,38,0.45)',
                }}>
                ▶ Retomar agora
              </button>
              <button onClick={() => setDistractionAlert(false)} className="btn-ghost" style={{ fontSize: 12 }}>
                Continuar pausado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.QuickLogFAB = QuickLogFAB;
window.PomodoroModal = PomodoroModal;
