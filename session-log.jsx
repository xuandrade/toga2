// TOGA — Modal de Registro Enriquecido de Sessão (Bloco 5)
// Suporta entrada manual de duração OU cronômetro (count-up).

const STUDY_TYPES = [
  'Lei seca', 'Teoria', 'Jurisprudência', 'Questões',
  'Revisão', 'Mapa mental', 'Aula', 'Simulado',
];

function SessionLogModal({ open, subjects, onSave, onClose }) {
  const { useState: useSt, useEffect: useEff, useRef: useR } = React;

  const todayISO = new Date().toISOString().slice(0, 10);

  const empty = {
    date: todayISO,
    discipline: '',
    topic: '',
    studyType: '',
    hours: '',
    minutes: '',
    questions: '',
    correct: '',
    wrong: '',
    reviews: '',
    note: '',
  };

  const [form, setForm] = useSt(empty);

  // Chronometer state
  const [chronoOpen, setChronoOpen]       = useSt(false);
  const [chronoRunning, setChronoRunning] = useSt(false);
  const [chronoSecs, setChronoSecs]       = useSt(0);
  const chronoRef = useR(null);

  useEff(() => {
    if (open) {
      setForm(empty);
      setChronoOpen(false);
      setChronoRunning(false);
      setChronoSecs(0);
    }
  }, [open]);

  // Chronometer tick
  useEff(() => {
    if (chronoRunning) {
      chronoRef.current = setInterval(() => setChronoSecs(s => s + 1), 1000);
    } else if (chronoRef.current) {
      clearInterval(chronoRef.current);
      chronoRef.current = null;
    }
    return () => { if (chronoRef.current) clearInterval(chronoRef.current); };
  }, [chronoRunning]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selectedSubject = subjects.find(s => s.name === form.discipline);
  const topicOptions = selectedSubject
    ? selectedSubject.topics.map(t => t.name)
    : [];

  const showQuestionsFields = form.studyType === 'Questões' || form.studyType === 'Simulado';

  const applyChrono = () => {
    const totalMins = Math.round(chronoSecs / 60);
    const hh = Math.floor(totalMins / 60);
    const mm = totalMins % 60;
    set('hours', String(hh));
    set('minutes', String(mm));
    setChronoRunning(false);
    setChronoOpen(false);
  };

  const resetChrono = () => {
    setChronoRunning(false);
    setChronoSecs(0);
  };

  const handleSave = () => {
    const totalMinutes = (parseFloat(form.hours) || 0) * 60 + (parseFloat(form.minutes) || 0);
    const hours = totalMinutes / 60;
    const log = {
      date: form.date,
      hours: Math.round(hours * 100) / 100,
      questions: parseInt(form.questions) || 0,
      correct: parseInt(form.correct) || 0,
      wrong: parseInt(form.wrong) || 0,
      reviews: parseInt(form.reviews) || 0,
      discipline: form.discipline || undefined,
      topic: form.topic || undefined,
      studyType: form.studyType || undefined,
      note: form.note.trim() || undefined,
    };
    onSave(log);
    onClose();
  };

  if (!open) return null;

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px', borderRadius: 9,
    border: '1px solid rgba(42,45,58,0.13)',
    background: 'rgba(255,255,255,0.75)',
    fontSize: 13, color: 'var(--grafite)',
    fontFamily: 'inherit', outline: 'none',
  };
  const labelStyle = { fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5, display: 'block' };

  const ch = Math.floor(chronoSecs / 3600);
  const cm = Math.floor((chronoSecs % 3600) / 60);
  const cs = chronoSecs % 60;

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 90,
      background: 'rgba(11,61,92,0.35)', backdropFilter: 'blur(8px)',
      display: 'grid', placeItems: 'center', padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} className="glass-strong anim-slide-up"
        style={{ width: '100%', maxWidth: 500, padding: 24, borderRadius: 18, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>

        <button onClick={onClose} className="btn-ghost" style={{ position: 'absolute', top: 12, right: 12, padding: '4px 8px' }}>✕</button>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.25em', color: 'var(--ciano)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>REGISTRAR SESSÃO DE ESTUDOS</div>
          <div className="font-display" style={{ fontSize: 20, fontWeight: 700, marginTop: 3 }}>O que você estudou?</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Date */}
          <div>
            <label style={labelStyle}>Data</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inputStyle} />
          </div>

          {/* Discipline */}
          <div>
            <label style={labelStyle}>Disciplina</label>
            <select value={form.discipline} onChange={e => { set('discipline', e.target.value); set('topic', ''); }} style={inputStyle}>
              <option value="">— Selecione —</option>
              {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>

          {/* Topic */}
          {topicOptions.length > 0 && (
            <div>
              <label style={labelStyle}>Tópico</label>
              <select value={form.topic} onChange={e => set('topic', e.target.value)} style={inputStyle}>
                <option value="">— Selecione —</option>
                {topicOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}

          {/* Study type */}
          <div>
            <label style={labelStyle}>Tipo de estudo</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {STUDY_TYPES.map(t => (
                <button key={t} onClick={() => set('studyType', form.studyType === t ? '' : t)}
                  className={form.studyType === t ? 'btn-neon' : 'btn-ghost'}
                  style={{ fontSize: 12, padding: '5px 12px',
                    ...(form.studyType === t ? { background: 'var(--petroleo)', borderColor: 'transparent', color: 'white' } : {}) }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Duration with chronometer toggle */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Duração</label>
              <button onClick={() => setChronoOpen(o => !o)}
                className="btn-ghost"
                style={{ fontSize: 11, padding: '3px 10px',
                  ...(chronoOpen ? { background: 'rgba(0,184,212,0.1)', borderColor: 'rgba(0,184,212,0.4)', color: 'var(--ciano)' } : {}) }}>
                ⏱ Usar cronômetro
              </button>
            </div>

            {chronoOpen ? (
              <div style={{
                padding: 14, borderRadius: 12,
                background: 'rgba(0,184,212,0.06)',
                border: '1px solid rgba(0,184,212,0.2)',
                textAlign: 'center',
              }}>
                <div className="num" style={{
                  fontSize: 36, fontWeight: 700, color: 'var(--petroleo)',
                  letterSpacing: '-0.02em', marginBottom: 12,
                }}>
                  {String(ch).padStart(2,'0')}<span style={{ color: 'var(--text-dim)' }}>:</span>
                  {String(cm).padStart(2,'0')}<span style={{ color: 'var(--text-dim)' }}>:</span>
                  {String(cs).padStart(2,'0')}
                </div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => setChronoRunning(r => !r)}
                    className="btn-neon"
                    style={{ fontSize: 12, padding: '6px 16px',
                      background: chronoRunning ? 'var(--coral)' : 'linear-gradient(135deg, var(--petroleo), var(--ciano))',
                      borderColor: 'transparent', color: 'white' }}>
                    {chronoRunning ? '⏸ Pausar' : '▶ Iniciar'}
                  </button>
                  <button onClick={resetChrono} className="btn-ghost" style={{ fontSize: 12, padding: '6px 14px' }}>
                    ⟲ Zerar
                  </button>
                  <button onClick={applyChrono} className="btn-ghost"
                    style={{ fontSize: 12, padding: '6px 14px',
                      background: 'rgba(0,168,107,0.1)', borderColor: 'rgba(0,168,107,0.4)', color: 'var(--esmeralda)' }}
                    disabled={chronoSecs === 0}>
                    ✓ Aplicar
                  </button>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
                  Cronometre o estudo e clique em "Aplicar" para preencher a duração.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <input type="number" min={0} max={12} placeholder="0 horas" value={form.hours}
                    onChange={e => set('hours', e.target.value)} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <input type="number" min={0} max={59} placeholder="0 min" value={form.minutes}
                    onChange={e => set('minutes', e.target.value)} style={inputStyle} />
                </div>
              </div>
            )}
          </div>

          {/* Questions (only if studyType = Questões or Simulado) */}
          {showQuestionsFields && (
            <div>
              <label style={labelStyle}>Questões</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)', marginBottom: 3 }}>Total</div>
                  <input type="number" min={0} placeholder="0" value={form.questions}
                    onChange={e => set('questions', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--esmeralda)', marginBottom: 3, fontWeight: 600 }}>✓ Acertos</div>
                  <input type="number" min={0} placeholder="0" value={form.correct}
                    onChange={e => set('correct', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--coral)', marginBottom: 3, fontWeight: 600 }}>✗ Erros</div>
                  <input type="number" min={0} placeholder="0" value={form.wrong}
                    onChange={e => set('wrong', e.target.value)} style={inputStyle} />
                </div>
              </div>
            </div>
          )}

          {/* Reviews / Flashcards */}
          {!showQuestionsFields && (
            <div>
              <label style={labelStyle}>Revisões / Flashcards</label>
              <input type="number" min={0} placeholder="0" value={form.reviews}
                onChange={e => set('reviews', e.target.value)} style={inputStyle} />
            </div>
          )}

          {/* Note */}
          <div>
            <label style={labelStyle}>Observação (opcional)</label>
            <textarea placeholder="O que foi estudado, dificuldades, pontos de destaque…"
              value={form.note} onChange={e => set('note', e.target.value)}
              rows={2}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
          </div>
        </div>

        <button onClick={handleSave} className="btn-neon" style={{
          width: '100%', justifyContent: 'center', marginTop: 20,
          padding: '12px', fontSize: 14,
          background: 'linear-gradient(135deg, var(--petroleo), var(--ciano))',
          borderColor: 'transparent', color: 'white',
        }}>
          Salvar sessão
        </button>
      </div>
    </div>
  );
}
