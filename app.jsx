// TOGA — App Root v2 — Ultra Premium
// Changes vs v1:
// • Sidebar: fixed 200px, premium active state, no layout bug
// • TotalsSection: condensed to single horizontal row + mastered % metric
// • Removed "Checks no edital" item (replaced by Tópicos Dominados %)
// • Removed ConcursoInfo block below "tempo até a prova"
// • InsightsPanel, BackupSection, GoalsModal preserved
// • Micro-animation delays on cards

const { useState, useEffect, useRef } = React;

// ── Achievement Toast ──────────────────────────────────────
function AchievementToast({ kind, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 4500); return () => clearTimeout(t); }, []);
  const A = {
    week_streak:    { title: '7 dias de constância',         sub: 'Uma semana inteira encadeada',         icon: '🔥', color: '#f59e0b' },
    marathon:       { title: 'Maratonista',                  sub: 'Sessão de 90 min completa',            icon: '🛡', color: 'var(--tinta)' },
    first_mastered: { title: 'Primeiro tema dominado',       sub: 'Um tópico conquistado',                icon: '⚡', color: '#00b8d4' },
    half_edital:    { title: 'Meio edital',                  sub: '50% dos tópicos dominados',            icon: '🏆', color: 'var(--esmeralda)' },
    backup_done:    { title: 'Backup baixado',               sub: 'Arquivo salvo no seu computador',      icon: '💾', color: 'var(--esmeralda)' },
    restore_done:   { title: 'Backup restaurado',            sub: 'Seus dados foram recarregados',        icon: '🔄', color: '#00b8d4' },
    reset_done:     { title: 'Sistema zerado',               sub: 'Tudo voltou ao estado inicial',        icon: '🌱', color: 'var(--esmeralda)' },
    goals_saved:    { title: 'Metas atualizadas',            sub: 'Boa! Vamos cumprir',                   icon: '🎯', color: 'var(--tinta)' },
    pet_sick:       { title: 'Sua dragãozinha adoeceu 🤒',   sub: 'Estude 2 dias seguidos para curá-la', icon: '🤒', color: '#f59e0b' },
    pet_healed:     { title: 'Sua dragãozinha está curada!', sub: 'Cuidando dela com seus estudos',       icon: '💚', color: 'var(--esmeralda)' },
  };
  const a = A[kind] || A.first_mastered;
  return (
    <div className="glass-strong toast-achievement" style={{
      position: 'fixed', top: 80, right: 20, zIndex: 80,
      padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
      maxWidth: 340, borderRadius: 16,
      boxShadow: `0 12px 40px rgba(30,32,48,0.18), 0 0 0 1px ${a.color}44`,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: `radial-gradient(circle, ${a.color}28, transparent)`,
        border: `1px solid ${a.color}33`,
        display: 'grid', placeItems: 'center', fontSize: 20,
      }}>{a.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 9, letterSpacing: '0.2em', color: a.color, fontFamily: 'JetBrains Mono, monospace', fontWeight: 800 }}>
          {kind.startsWith('pet_') || ['goals_saved','backup_done','restore_done','reset_done'].includes(kind) ? 'AVISO' : 'CONQUISTA'}
        </div>
        <div className="font-display" style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{a.title}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{a.sub}</div>
      </div>
    </div>
  );
}

// ── Storage helpers ────────────────────────────────────────
const KEYS = { shared: 'da_v3_shared', obj: 'da_v3_objetiva', disc: 'da_v3_discursiva', meta: 'da_v3_meta' };
function loadKey(key, fallback) {
  try { const raw = localStorage.getItem(key); if (!raw) return fallback; return JSON.parse(raw); } catch { return fallback; }
}
function saveKey(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "showSplash": false,
  "view": "dashboard",
  "mode": "objetiva"
}/*EDITMODE-END*/;

// Frases inspiradoras diárias — rotação determinística pelo dia do ano
const DAILY_PHRASES = [
  { text: 'Disciplina é a ponte entre as metas e as conquistas.', author: 'Jim Rohn' },
  { text: 'Constância vence talento quando o talento não é constante.', author: 'TOGA' },
  { text: 'Aprovação não acontece num dia — acontece todos os dias.', author: 'TOGA' },
  { text: 'O sucesso é a soma de pequenos esforços repetidos dia após dia.', author: 'Robert Collier' },
  { text: 'Sua única competição é quem você foi ontem.', author: 'James Clear' },
  { text: 'Não pare quando estiver cansado. Pare quando tiver terminado.', author: 'David Goggins' },
  { text: 'A toga não veste quem desiste no meio do caminho.', author: 'TOGA' },
  { text: 'A persistência realiza o impossível.', author: 'Provérbio chinês' },
  { text: 'Pequenos passos diários superam grandes saltos esporádicos.', author: 'TOGA' },
  { text: 'A dor da disciplina pesa gramas; a dor do arrependimento, toneladas.', author: 'Jim Rohn' },
  { text: 'O futuro pertence àqueles que se preparam hoje.', author: 'Malcolm X' },
  { text: 'Aprovar é decidir, todo dia, não desistir.', author: 'TOGA' },
  { text: 'Quem planta constância, colhe aprovação.', author: 'TOGA' },
  { text: 'Estude como se a vaga já fosse sua — porque ela está.', author: 'TOGA' },
  { text: 'Foco não é fazer mil coisas, é dizer não pra novecentas e noventa e nove.', author: 'Steve Jobs' },
  { text: 'Hábitos diários definem destinos finais.', author: 'TOGA' },
  { text: 'Não conte os dias — faça os dias contarem.', author: 'Muhammad Ali' },
  { text: 'A diferença entre o ordinário e o extraordinário é o "extra".', author: 'Jimmy Johnson' },
  { text: 'Comece onde está. Use o que tem. Faça o que pode.', author: 'Arthur Ashe' },
  { text: 'A jornada de mil páginas começa com uma única virada.', author: 'TOGA' },
];

function DailyPhrase() {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  const p = DAILY_PHRASES[dayOfYear % DAILY_PHRASES.length];
  return (
    <div className="anim-slide-up glass" style={{
      animationDelay: '40ms',
      padding: '12px 16px',
      display: 'flex', alignItems: 'flex-start', gap: 12,
      background: 'linear-gradient(135deg, rgba(11,61,92,0.05), rgba(0,184,212,0.05))',
      border: '1px solid rgba(0,184,212,0.15)',
      borderLeft: '3px solid var(--ciano)',
    }}>
      <div style={{ fontSize: 20, lineHeight: 1, flexShrink: 0, filter: 'drop-shadow(0 0 6px rgba(0,184,212,0.4))' }}>✨</div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 4 }}>
          INSPIRAÇÃO DO DIA
        </div>
        <div className="font-display" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.45, fontStyle: 'italic' }}>
          "{p.text}"
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>
          — {p.author}
        </div>
      </div>
    </div>
  );
}

// ── Goals Modal ────────────────────────────────────────────
function GoalsModal({ open, goals, onSave, onClose }) {
  const [form, setForm] = useState(goals || {});
  useEffect(() => { if (open) setForm(goals); }, [open, goals]);
  if (!open) return null;

  const fields = [
    { k: 'dailyHours',      label: 'Horas por dia',        max: 16,   step: 0.5, color: '#00b8d4', icon: '⏱', unit: 'h' },
    { k: 'weeklyHours',     label: 'Horas por semana',     max: 80,   step: 1,   color: 'var(--tinta)',     icon: '📅', unit: 'h' },
    { k: 'dailyQuestions',  label: 'Questões por dia',     max: 300,  step: 5,   color: 'var(--esmeralda)', icon: '❓', unit: '' },
    { k: 'weeklyQuestions', label: 'Questões por semana',  max: 1500, step: 10,  color: '#f59e0b',          icon: '🎯', unit: '' },
    { k: 'dailyFlashcards', label: 'Flashcards por dia',   max: 300,  step: 5,   color: 'var(--coral)',     icon: '🃏', unit: '' },
  ];

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 90,
      background: 'rgba(30,32,48,0.45)', backdropFilter: 'blur(10px)',
      display: 'grid', placeItems: 'center', padding: 24,
      animation: 'fade-in 250ms ease-out',
    }}>
      <div onClick={e => e.stopPropagation()} className="glass-strong anim-slide-up"
        style={{ width: '100%', maxWidth: 480, padding: 26, borderRadius: 20, position: 'relative' }}>
        <button onClick={onClose} className="btn-ghost" style={{ position: 'absolute', top: 14, right: 14 }}>
          <I.close size={13} />
        </button>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.25em', color: 'var(--tinta)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800 }}>
            CONFIGURAR METAS
          </div>
          <div className="font-display gradient-neon" style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>
            Suas metas pessoais 🎯
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Ajuste pra sua realidade. Você pode mudar quando quiser.
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {fields.map(f => (
            <div key={f.k}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
                  <span style={{ marginRight: 6 }}>{f.icon}</span>{f.label}
                </span>
                <span className="num" style={{ fontSize: 16, fontWeight: 800, color: f.color }}>
                  {form[f.k] ?? 0}{f.unit}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button className="btn-ghost" style={{ padding: '4px 8px' }}
                  onClick={() => setForm(s => ({ ...s, [f.k]: Math.max(0, (s[f.k] || 0) - f.step) }))}>
                  <I.minus size={11} />
                </button>
                <input type="range" min={0} max={f.max} step={f.step} value={form[f.k] ?? 0}
                  onChange={e => setForm(s => ({ ...s, [f.k]: parseFloat(e.target.value) }))}
                  style={{ flex: 1, accentColor: f.color }} />
                <button className="btn-ghost" style={{ padding: '4px 8px' }}
                  onClick={() => setForm(s => ({ ...s, [f.k]: Math.min(f.max, (s[f.k] || 0) + f.step) }))}>
                  <I.plusSm size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => { onSave(form); onClose(); }} className="btn-neon" style={{
          width: '100%', justifyContent: 'center', marginTop: 22, padding: '12px 20px', fontSize: 13,
          background: 'linear-gradient(135deg, var(--petroleo), var(--ciano))', borderColor: 'transparent', color: 'white',
        }}>
          <I.check size={14} stroke={2.5} /> Salvar metas
        </button>
      </div>
    </div>
  );
}

// ── TotalsSection — condensed horizontal row ───────────────
function TotalsSection({ shared, objState, discState }) {
  const logs = shared.dailyLogs || [];
  const totalHours = logs.reduce((a, l) => a + (l.hours || 0), 0);
  const totalQuestions = logs.reduce((a, l) => a + (l.questions || 0), 0);
  const totalReviews = logs.reduce((a, l) => a + (l.reviews || 0), 0);
  const activeDays = logs.filter(l => (l.hours || 0) + (l.questions || 0) + (l.reviews || 0) > 0).length;

  const FLAGS_O = ['lei','doutrina','juris','questoes','revisao'];
  const FLAGS_D = ['estudado','grifado','questoes'];

  // Tópicos dominados: se > 2/3 das checkboxes marcadas = dominado
  let objMastered = 0, objTotalTopics = 0;
  objState.subjects.forEach(s => {
    objTotalTopics += s.topics.length;
    s.topics.forEach(t => {
      const c = FLAGS_O.filter(f => t[f]).length;
      if (c > FLAGS_O.length * 2 / 3) objMastered++;
    });
  });
  let discMastered = 0, discTotalTopics = 0;
  discState.subjects.forEach(s => {
    discTotalTopics += s.topics.length;
    s.topics.forEach(t => {
      const c = FLAGS_D.filter(f => t[f]).length;
      if (c > FLAGS_D.length * 2 / 3) discMastered++;
    });
  });
  const totalMastered = objMastered + discMastered;
  const totalTopics = objTotalTopics + discTotalTopics;
  const masteredPct = totalTopics > 0 ? (totalMastered / totalTopics) * 100 : 0;

  // Tópicos pedindo revisão
  const REVIEW_DAYS = 30;
  const daysSince = (iso) => iso ? Math.floor((new Date() - new Date(iso)) / 86400000) : Infinity;
  let needsReview = 0;
  objState.subjects.forEach(s => s.topics.forEach(t => {
    const c = FLAGS_O.filter(f => t[f]).length;
    if (c > 0 && daysSince(t.lastStudiedAt) >= REVIEW_DAYS) needsReview++;
  }));
  discState.subjects.forEach(s => s.topics.forEach(t => {
    const c = FLAGS_D.filter(f => t[f]).length;
    if (c > 0 && daysSince(t.lastStudiedAt) >= REVIEW_DAYS) needsReview++;
  }));

  const since = logs.length > 0
    ? new Date(logs[0].date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })
    : null;

  const items = [
    { label: 'Horas estudadas',    value: totalHours.toFixed(1),              unit: 'h',  color: '#00b8d4',       colorRaw: '#00b8d4',  glow: '#00d9ff', sub: `${activeDays} dias` },
    { label: 'Questões',           value: totalQuestions.toLocaleString('pt-BR'), unit: '',color: 'var(--esmeralda)', colorRaw: '#00A86B', glow: '#00ff88', sub: 'resolvidas' },
    { label: 'Revisões',           value: totalReviews.toLocaleString('pt-BR'),   unit: '',color: 'var(--tinta)',   colorRaw: '#5B47B8',  glow: '#7B67D8', sub: 'flashcards' },
    { label: 'Tópicos dominados',  value: masteredPct.toFixed(0),             unit: '%',  color: 'var(--coral)',   colorRaw: '#E85D5D',  glow: '#FF7070', sub: `${totalMastered}/${totalTopics}` },
    { label: 'Pedem revisão',      value: needsReview,                        unit: '',   color: '#f59e0b',        colorRaw: '#f59e0b',  glow: '#ffc107', sub: needsReview > 0 ? '>30 dias' : 'tudo ok' },
  ];

  return (
    <div className="glass" style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 6 }}>
        <div>
          <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
            SUA JORNADA ATÉ AGORA
          </div>
          {since && (
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 3, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
              desde {since}
            </div>
          )}
        </div>

        {/* Mastered topics progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Dominância do edital</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 120, height: 5, background: 'rgba(30,32,48,0.07)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${masteredPct}%`,
                background: 'linear-gradient(90deg, var(--coral), var(--ambar))',
                borderRadius: 99,
                transition: 'width 700ms cubic-bezier(0.16,1,0.3,1)',
                boxShadow: masteredPct > 0 ? '0 0 6px rgba(232,93,93,0.4)' : 'none',
              }} />
            </div>
            <span className="num" style={{ fontSize: 12, fontWeight: 800, color: 'var(--coral)' }}>{masteredPct.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Horizontal stat chips */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {items.map((m, i) => (
          <div key={i} className="anim-slide-up" style={{
            flex: '1 1 140px', padding: '12px 14px', borderRadius: 12,
            background: `linear-gradient(145deg, rgba(255,255,255,0.8), rgba(255,255,255,0.55)), radial-gradient(ellipse at 0% 0%, ${m.colorRaw}0e, transparent 60%)`,
            border: `1px solid ${m.colorRaw}22`,
            animationDelay: `${i * 60}ms`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <div style={{
                fontSize: 10, letterSpacing: '0.08em', color: 'var(--text-muted)',
                fontWeight: 700, textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace',
              }}>{m.label}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <span className="num" style={{
                fontSize: 24, fontWeight: 800, color: m.colorRaw,
                letterSpacing: '-0.02em',
                filter: `drop-shadow(0 0 8px ${m.glow}44)`,
              }}>{m.value}</span>
              <span className="num" style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 600 }}>{m.unit}</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
              {m.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── BackupSection ──────────────────────────────────────────
function BackupSection({ shared, objState, discState, onRestore, onReset, onToast }) {
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const backup = { version: 'v3', exportedAt: new Date().toISOString(), shared, objetiva: objState, discursiva: discState };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `toga-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url); onToast('backup_done');
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.shared || !data.objetiva || !data.discursiva) { alert('Arquivo inválido.'); return; }
        const ok = window.confirm('Isso vai SOBRESCREVER todos os seus dados atuais.\n\nDeseja continuar?');
        if (!ok) return; onRestore(data); onToast('restore_done');
      } catch (err) { alert('Erro ao ler o arquivo: ' + err.message); }
      finally { e.target.value = ''; }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    const typed = window.prompt('⚠️ Para confirmar, digite exatamente:\n\nRESETAR TOGA');
    if (typed !== 'RESETAR TOGA') return;
    localStorage.removeItem('toga_onboarded'); onReset(); onToast('reset_done');
  };

  return (
    <div className="glass" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 5 }}>
            DADOS · BACKUP & RESTAURO
          </div>
          <div className="font-display" style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Seus dados, sob seu controle 💾</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 580 }}>
            Baixe um arquivo .json com todo o seu progresso. Você pode restaurar em outro navegador ou após reinstalação.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignSelf: 'center' }}>
          <button className="btn-neon" onClick={handleExport}><I.download size={13} /> Baixar backup</button>
          <button className="btn-ghost" onClick={handleImportClick}
            style={{ borderColor: 'rgba(245,158,11,0.4)', color: '#a14e0c', background: 'rgba(245,158,11,0.06)' }}>
            <I.up size={13} /> Restaurar
          </button>
          <button className="btn-ghost" onClick={handleReset}
            style={{ borderColor: 'rgba(232,93,93,0.4)', color: '#a82360', background: 'rgba(232,93,93,0.06)' }}>
            <I.close size={13} /> Zerar
          </button>
          <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleFileChange} className="file-input-hidden" />
        </div>
      </div>
    </div>
  );
}

// ── APP ROOT ───────────────────────────────────────────────
function App() {
  const [tweaks, setTweaks] = useTweaks(DEFAULTS);

  const [shared, setShared] = useState(() => {
    if (!localStorage.getItem('toga_onboarded')) {
      localStorage.removeItem(KEYS.shared); localStorage.removeItem(KEYS.obj);
      localStorage.removeItem(KEYS.disc); localStorage.removeItem(KEYS.meta);
      localStorage.setItem('toga_onboarded', '1');
    }
    return loadKey(KEYS.shared, window.DA.INITIAL_SHARED);
  });
  const [objState, setObjState]   = useState(() => loadKey(KEYS.obj,  window.DA.INITIAL_OBJETIVA));
  const [discState, setDiscState] = useState(() => loadKey(KEYS.disc, window.DA.INITIAL_DISCURSIVA));
  const [meta, setMeta]           = useState(() => loadKey(KEYS.meta, { mode: tweaks.mode }));

  useEffect(() => saveKey(KEYS.shared, shared), [shared]);
  useEffect(() => saveKey(KEYS.obj, objState), [objState]);
  useEffect(() => saveKey(KEYS.disc, discState), [discState]);
  useEffect(() => saveKey(KEYS.meta, meta), [meta]);

  useEffect(() => {
    setShared(s => {
      const logs = s.dailyLogs || [];
      const streak = window.DA.calcConstancia(logs);
      const bestStreak = Math.max(s.bestStreak || 0, window.DA.calcConstanciaRecord(logs), streak);
      return { petHealth: s.petHealth || 'healthy', goals: { dailyFlashcards: 30, ...s.goals }, ...s, streak, bestStreak };
    });
    const todayISO = new Date().toISOString();
    const FLAGS_O = ['lei','doutrina','juris','questoes','revisao'];
    const FLAGS_D = ['estudado','grifado','questoes'];
    setObjState(o => ({ ...o, subjects: o.subjects.map(sub => ({ ...sub, topics: sub.topics.map(t => {
      if (t.lastStudiedAt !== undefined) return t;
      return { ...t, lastStudiedAt: FLAGS_O.some(f => t[f]) ? todayISO : null };
    })}))}));
    setDiscState(d => ({ ...d, subjects: d.subjects.map(sub => ({ ...sub, topics: sub.topics.map(t => {
      if (t.lastStudiedAt !== undefined) return t;
      return { ...t, lastStudiedAt: FLAGS_D.some(f => t[f]) ? todayISO : null };
    })}))}));
  }, []);

  const mode = tweaks.mode;
  const setMode = (m) => { setTweaks('mode', m); setMeta(mt => ({ ...mt, mode: m })); };

  const [showSplash, setShowSplash] = useState(tweaks.showSplash);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [sessionLogOpen, setSessionLogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('hoje');
  const [legalModal, setLegalModal] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('toga_onboarded_tutorial'));
  const [toasts, setToasts] = useState([]);
  const [evolutionEvent, setEvolutionEvent] = useState(null);
  const prevPetStageRef = useRef(window.DA.getPetStage(shared.xp));

  const pushToast = (kind) => setToasts(t => [...t, { id: Math.random(), kind }]);

  useEffect(() => {
    const stage = window.DA.getPetStage(shared.xp);
    if (stage > prevPetStageRef.current) {
      setEvolutionEvent({ from: prevPetStageRef.current, to: stage });
      window.celebrateEvolution && window.celebrateEvolution();
      prevPetStageRef.current = stage;
    } else if (stage < prevPetStageRef.current) {
      prevPetStageRef.current = stage;
    }
  }, [shared.xp]);

  useEffect(() => {
    const next = window.DA.nextPetHealth(shared.petHealth || 'healthy', shared.dailyLogs || []);
    if (next !== shared.petHealth) {
      setShared(s => ({ ...s, petHealth: next }));
      if (next === 'sick') { pushToast('pet_sick'); window.playSick && window.playSick(); }
      else { pushToast('pet_healed'); window.playHealed && window.playHealed(); window.celebrateLight && window.celebrateLight(); }
    }
  }, [shared.dailyLogs, shared.petHealth]);
  useEffect(() => {
    const next = window.DA.nextPetHealth(shared.petHealth || 'healthy', shared.dailyLogs || []);
    if (next !== shared.petHealth) setShared(s => ({ ...s, petHealth: next }));
  }, []);

  const calcStreak = (logs) => window.DA.calcConstancia(logs);
  const calcBestStreak = (logs) => window.DA.calcConstanciaRecord(logs);
  const withStreakState = (s, logs) => {
    const streak = calcStreak(logs);
    const bestStreak = Math.max(s.bestStreak || 0, calcBestStreak(logs), streak);
    return { ...s, dailyLogs: logs, streak, bestStreak };
  };

  const mergeLog = (logs, e) => {
    const out = [...logs];
    const idx = out.findIndex(l => l.date === e.date);
    if (idx >= 0) {
      const ex = out[idx];
      out[idx] = { ...ex, hours: (ex.hours||0)+(e.hours||0), questions: (ex.questions||0)+(e.questions||0),
        correct: (ex.correct||0)+(e.correct||0), wrong: (ex.wrong||0)+(e.wrong||0), reviews: (ex.reviews||0)+(e.reviews||0),
        discipline: e.discipline || ex.discipline, studyType: e.studyType || ex.studyType, entries: [...(ex.entries||[]), e] };
      return { logs: out, idx };
    }
    out.push({ ...e, entries: [e] }); out.sort((a,b) => a.date.localeCompare(b.date));
    return { logs: out, idx: out.findIndex(l => l.date === e.date) };
  };

  const goalCrossBonus = (newDay, prevHours, prevQ, goals) => {
    let b = 0;
    if ((goals?.dailyHours||0) > 0 && newDay.hours >= goals.dailyHours && prevHours < goals.dailyHours) b += 5;
    if ((goals?.dailyQuestions||0) > 0 && newDay.questions >= goals.dailyQuestions && prevQ < goals.dailyQuestions) b += 5;
    return b;
  };

  const handleLog = (date, h, q, r) => {
    const entry = { date, hours: h, questions: q, reviews: r };
    setShared(s => {
      const { logs, idx } = mergeLog(s.dailyLogs, entry);
      const day = logs[idx];
      const bonus = goalCrossBonus(day, (day.hours||0)-h, (day.questions||0)-q, s.goals);
      return { ...withStreakState(s, logs), xp: s.xp + bonus };
    });
    window.celebrateVictory && window.celebrateVictory();
  };

  const handleEnrichedLog = (logEntry, opts) => {
    const noXp = opts && opts.noXp;
    const bonusXp = (opts && opts.bonusXp) || 0;
    setShared(s => {
      const { logs, idx } = mergeLog(s.dailyLogs, logEntry);
      const day = logs[idx];
      const cross = noXp ? 0 : goalCrossBonus(day, (day.hours||0)-(logEntry.hours||0), (day.questions||0)-(logEntry.questions||0), s.goals);
      return { ...withStreakState(s, logs), xp: s.xp + cross + (noXp ? 0 : bonusXp) };
    });
    window.celebrateLight && window.celebrateLight();
  };

  const recomputeDayTotals = (day) => {
    const entries = day.entries || [];
    const sum = (k) => entries.reduce((a, e) => a + (Number(e[k]) || 0), 0);
    const last = entries[entries.length - 1] || {};
    return {
      ...day,
      hours: Math.round(sum('hours') * 100) / 100,
      questions: sum('questions'),
      correct: sum('correct'),
      wrong: sum('wrong'),
      reviews: sum('reviews'),
      discipline: last.discipline || day.discipline,
      studyType: last.studyType || day.studyType,
      entries,
    };
  };

  const ensureEntries = (day) => {
    if (day.entries && day.entries.length > 0) return day;
    const { entries: _drop, ...rest } = day;
    return { ...day, entries: [{ ...rest }] };
  };

  const [editTarget, setEditTarget] = useState(null); // { date, idx, entry }
  const [pomodoroPrefill, setPomodoroPrefill] = useState(null); // { initial, awardXp }

  const handleDeleteEntry = (date, idx) => {
    setShared(s => {
      const logs = (s.dailyLogs || []).map(d => d.date === date ? ensureEntries(d) : d);
      const i = logs.findIndex(d => d.date === date);
      if (i < 0) return s;
      const day = logs[i];
      const newEntries = day.entries.filter((_, k) => k !== idx);
      let newLogs;
      if (newEntries.length === 0) {
        newLogs = logs.filter(d => d.date !== date);
      } else {
        newLogs = [...logs];
        newLogs[i] = recomputeDayTotals({ ...day, entries: newEntries });
      }
      return withStreakState(s, newLogs);
    });
  };

  const handleUpdateEntry = (date, idx, updated) => {
    setShared(s => {
      let logs = (s.dailyLogs || []).map(d => d.date === date ? ensureEntries(d) : d);
      const i = logs.findIndex(d => d.date === date);
      if (i < 0) return s;
      const day = logs[i];
      const newEntry = { ...day.entries[idx], ...updated };
      const newDate = updated.date || date;

      if (newDate === date) {
        const newEntries = day.entries.map((e, k) => k === idx ? newEntry : e);
        const newLogs = [...logs];
        newLogs[i] = recomputeDayTotals({ ...day, entries: newEntries });
        return withStreakState(s, newLogs);
      }

      // Date changed: remove from old day, add to new day.
      const oldEntries = day.entries.filter((_, k) => k !== idx);
      let working = [...logs];
      if (oldEntries.length === 0) working = working.filter(d => d.date !== date);
      else working[i] = recomputeDayTotals({ ...day, entries: oldEntries });

      const targetIdx = working.findIndex(d => d.date === newDate);
      if (targetIdx >= 0) {
        const target = ensureEntries(working[targetIdx]);
        working[targetIdx] = recomputeDayTotals({ ...target, entries: [...target.entries, { ...newEntry, date: newDate }] });
      } else {
        working.push(recomputeDayTotals({ date: newDate, entries: [{ ...newEntry, date: newDate }] }));
        working.sort((a, b) => a.date.localeCompare(b.date));
      }
      return withStreakState(s, working);
    });
  };

  const handleAddCustomStudyType = (name) => {
    setShared(s => {
      const list = s.customStudyTypes || [];
      if (list.includes(name)) return s;
      return { ...s, customStudyTypes: [...list, name] };
    });
  };

  const handleSession = ({ minutes, subjectId, discipline, studyType, note }) => {
    const today = new Date().toISOString().slice(0,10);
    const hours = minutes / 60;
    const entry = { date: today, hours, discipline, studyType: studyType || 'Pomodoro', note, source: 'pomodoro' };
    setShared(s => {
      const { logs, idx } = mergeLog(s.dailyLogs, entry);
      const day = logs[idx];
      const cross = goalCrossBonus(day, (day.hours||0)-hours, (day.questions||0), s.goals);
      return { ...withStreakState(s, logs), xp: s.xp + 2 + cross };
    });
    if (minutes >= 90) pushToast('marathon');
    window.celebrateVictory();
  };

  const handleMaster = () => {
    setShared(s => ({ ...s, xp: s.xp + 25 }));
    if (!shared.achievements.includes('first_mastered')) {
      pushToast('first_mastered');
      setShared(s => ({ ...s, achievements: [...s.achievements, 'first_mastered'] }));
    }
  };
  const handleCheckXp = (delta) => setShared(s => ({ ...s, xp: Math.max(0, s.xp + delta) }));

  const setConcursos = (updater) => setShared(s => ({ ...s, concursos: typeof updater === 'function' ? updater(s.concursos) : updater }));

  const handleAddSimulado = (sim) => {
    setShared(s => {
      const sims = [...(s.simulados || []), sim];
      const xpGain = (window.DA.simuladoXp ? window.DA.simuladoXp(sim) : 10);
      return { ...s, simulados: sims, xp: (s.xp || 0) + xpGain };
    });
    window.celebrateHighEnergy && window.celebrateHighEnergy();
  };
  const handleRemoveSimulado = (id) => {
    setShared(s => ({ ...s, simulados: (s.simulados || []).filter(x => x.id !== id) }));
  };
  const handleRestore = (backup) => {
    setShared(backup.shared); setObjState(backup.objetiva); setDiscState(backup.discursiva);
    prevPetStageRef.current = window.DA.getPetStage(backup.shared.xp || 0);
  };
  const handleReset = () => {
    setShared(window.DA.INITIAL_SHARED); setObjState(window.DA.INITIAL_OBJETIVA); setDiscState(window.DA.INITIAL_DISCURSIVA);
    prevPetStageRef.current = 1;
  };
  const handleSaveGoals = (newGoals) => { setShared(s => ({ ...s, goals: { ...s.goals, ...newGoals } })); pushToast('goals_saved'); };

  if (showSplash) return <SplashScreen onEnter={() => { setShowSplash(false); setTweaks('showSplash', false); }} />;

  const activeSubjects = mode === 'objetiva' ? objState.subjects : discState.subjects;
  const combinedSubjects = React.useMemo(() => {
    const seen = new Map();
    [...objState.subjects, ...discState.subjects].forEach(s => {
      if (s && s.name && !seen.has(s.name)) seen.set(s.name, s);
    });
    return Array.from(seen.values());
  }, [objState.subjects, discState.subjects]);
  const totalStats = mode === 'objetiva' ? window.DA.getTotalStatsObj(objState.subjects) : window.DA.getTotalStatsDisc(discState.subjects);
  const isSick = shared.petHealth === 'sick';

  const TABS = [
    { id: 'hoje',         label: 'HOJE',         icon: '🏠' },
    { id: 'edital',       label: 'EDITAL',       icon: '📋' },
    { id: 'simulados',    label: 'SIMULADOS',    icon: '🎯' },
    { id: 'estatisticas', label: 'ESTATÍSTICAS', icon: '📊' },
    { id: 'historico',    label: 'HISTÓRICO',    icon: '📜' },
    { id: 'ajustes',      label: 'AJUSTES',      icon: '⚙️' },
  ];

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div className="aurora" />
      <div className="dot-grid" />

      <GlobalHeader shared={shared} mode={mode} setMode={setMode} totalPct={totalStats.percentage} />

      {/* Sidebar */}
      <nav className="nav-sidebar">
        <div className="nav-sidebar-brand">
          <span style={{ fontSize: 20 }}>⚖️</span> TOGA
        </div>
        {TABS.map(tab => (
          <button key={tab.id} className={`nav-tab ${activeTab === tab.id ? 'nav-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}>
            <span className="nav-tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom nav (mobile) */}
      <nav className="nav-bottom">
        {TABS.map(tab => (
          <button key={tab.id} className={`nav-tab ${activeTab === tab.id ? 'nav-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}>
            <span className="nav-tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="toga-main" style={{ maxWidth: 1200, margin: '0 auto', padding: '22px 24px 100px', position: 'relative' }}>

        {/* ── ABA: HOJE ── */}
        {activeTab === 'hoje' && (
          <>
            <style>{`@media (max-width: 900px) { .greeting-row { grid-template-columns: 1fr !important; } }`}</style>
            <div className="greeting-row" style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)', marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="anim-slide-up" style={{ animationDelay: '0ms' }}>
                  <div className="font-display" style={{ fontSize: 27, fontWeight: 700, letterSpacing: '-0.025em' }}>
                    Bom estudo, <span className="gradient-neon">Concurseiro(a)</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    {' · '}
                    <span style={{ fontWeight: 700, color: mode === 'objetiva' ? 'var(--ciano)' : 'var(--coral)' }}>
                      Modo {mode === 'objetiva' ? 'Objetiva' : 'Discursiva'}
                    </span>
                  </div>
                </div>
                <DailyPhrase />
                <PetCompanion xp={shared.xp} sick={isSick} dailyLogs={shared.dailyLogs} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="anim-slide-up" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', animationDelay: '60ms' }}>
                  <button className="btn-ghost" onClick={() => setGoalsOpen(true)}
                    style={{ borderColor: 'rgba(91,71,184,0.3)', color: 'var(--tinta)', background: 'rgba(91,71,184,0.05)', fontWeight: 600, fontSize: 12 }}>
                    🎯 Metas
                  </button>
                  <button className="btn-neon" onClick={() => setSessionLogOpen(true)} style={{ fontSize: 12 }}>
                    ✏️ Registrar sessão
                  </button>
                  <button className="btn-ghost" onClick={() => setPomodoroOpen(true)} style={{ fontSize: 12 }}>
                    🛡 Blindado
                  </button>
                </div>

                <div className="anim-slide-up" style={{ animationDelay: '100ms' }}>
                  <GavelBar percentage={totalStats.percentage} streak={shared.streak} shields={shared.shields} />
                </div>

                <div className="anim-slide-up" style={{ animationDelay: '140ms' }}>
                  <ConcursoDonuts concursos={shared.concursos || []} setConcursos={setConcursos} />
                </div>
              </div>
            </div>

            <section className="anim-slide-up" style={{ marginBottom: 16, animationDelay: '50ms' }}>
              <WeeklyHoursChart shared={shared} />
            </section>

            <section className="anim-slide-up" style={{ marginBottom: 16, animationDelay: '70ms' }}>
              <MetricsRow shared={shared} setShared={setShared} kind="hours" title="METAS DE HORAS" />
            </section>

            <section className="anim-slide-up" style={{ marginBottom: 16, animationDelay: '85ms' }}>
              <ConstanciaTracker logs={shared.dailyLogs} bestStreak={shared.bestStreak} />
            </section>

            <div className="dual-grid anim-slide-up" style={{ display: 'grid', gap: 14, marginBottom: 16, animationDelay: '100ms' }}>
              <StudyHeatmap logs={shared.dailyLogs} />
              <QuestionsFlashcardsHeatmap logs={shared.dailyLogs} />
            </div>

            <section className="anim-slide-up metrics-line" style={{
              display: 'grid',
              gap: 14,
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
              marginBottom: 16,
              animationDelay: '115ms',
            }}>
              <MetricsRow shared={shared} setShared={setShared} kind="questions" title="METAS DE QUESTÕES" />
              <AccuracyOverallCard shared={shared} />
            </section>
            <style>{`@media (max-width: 900px) { .metrics-line { grid-template-columns: 1fr !important; } }`}</style>

            <section className="anim-slide-up" style={{ marginBottom: 16, animationDelay: '130ms' }}>
              <InsightsPanel shared={shared} objState={objState} discState={discState} />
            </section>

            <section className="anim-slide-up" style={{ marginBottom: 16, animationDelay: '150ms' }}>
              <TotalsSection shared={shared} objState={objState} discState={discState} />
            </section>
          </>
        )}

        {/* ── ABA: HISTÓRICO ── */}
        {activeTab === 'historico' && (
          <HistoricoTab
            shared={shared}
            onDeleteEntry={handleDeleteEntry}
            onEditEntry={(date, idx, entry) => setEditTarget({ date, idx, entry })}
          />
        )}

        {/* ── ABA: EDITAL ── */}
        {activeTab === 'edital' && (
          <>
            <section style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                <div className="font-display" style={{ fontSize: 20, fontWeight: 700 }}>Matriz do Edital</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', fontWeight: 700 }}>
                  · {mode === 'objetiva' ? 'OBJETIVA' : 'DISCURSIVA'}
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                  cada check +1 XP × peso
                </div>
              </div>
              {mode === 'objetiva'
                ? <SyllabusMatrixObjetiva state={objState} setState={setObjState} onMaster={handleMaster} onCheckXp={handleCheckXp} dailyLogs={shared.dailyLogs} />
                : <SyllabusMatrixDiscursiva state={discState} setState={setDiscState} onCheckXp={handleCheckXp} dailyLogs={shared.dailyLogs} />}
            </section>
            {activeSubjects.length > 0 && (
              <section style={{ marginBottom: 16 }}>
                <SubjectDonuts subjects={activeSubjects} mode={mode} />
              </section>
            )}
            <section style={{ marginBottom: 16 }}>
              <EditalHeatmap subjects={mode === 'objetiva' ? objState.subjects : discState.subjects} mode={mode} />
            </section>
          </>
        )}

        {/* ── ABA: SIMULADOS ── */}
        {activeTab === 'simulados' && (
          <SimuladosTab
            shared={shared}
            objState={objState}
            discState={discState}
            mode={mode}
            onAddSimulado={handleAddSimulado}
            onRemoveSimulado={handleRemoveSimulado}
          />
        )}

        {/* ── ABA: ESTATÍSTICAS ── */}
        {activeTab === 'estatisticas' && (
          <StatsPage shared={shared} objState={objState} discState={discState} />
        )}

        {/* ── ABA: AJUSTES ── */}
        {activeTab === 'ajustes' && (
          <>
            <div className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--petroleo)', marginBottom: 16 }}>Ajustes</div>
            <section style={{ marginBottom: 14 }}>
              <div className="glass" style={{ padding: '18px 20px' }}>
                <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 6 }}>METAS PESSOAIS</div>
                <div className="font-display" style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Configure suas metas diárias e semanais</div>
                <button className="btn-neon" onClick={() => setGoalsOpen(true)} style={{ fontSize: 13 }}>🎯 Configurar metas</button>
              </div>
            </section>
            <section style={{ marginBottom: 14 }}>
              <BackupSection shared={shared} objState={objState} discState={discState}
                onRestore={handleRestore} onReset={handleReset} onToast={pushToast} />
            </section>
            <section style={{ marginBottom: 14 }}>
              <div className="glass" style={{ padding: '18px 20px' }}>
                <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 6 }}>TUTORIAL</div>
                <div className="font-display" style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Rever o tutorial de boas-vindas</div>
                <button className="btn-ghost" onClick={() => { localStorage.removeItem('toga_onboarded_tutorial'); setShowOnboarding(true); }} style={{ fontSize: 13 }}>📖 Ver tutorial novamente</button>
              </div>
            </section>
            <section style={{ marginBottom: 14 }}>
              <div className="glass" style={{ padding: '18px 20px' }}>
                <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 6 }}>INFORMAÇÕES LEGAIS</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  <button className="btn-ghost" onClick={() => setLegalModal('privacy')} style={{ fontSize: 12 }}>🔒 Política de Privacidade</button>
                  <button className="btn-ghost" onClick={() => setLegalModal('terms')} style={{ fontSize: 12 }}>📄 Termos de Uso</button>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 10, fontFamily: 'JetBrains Mono, monospace' }}>
                  TOGA v2.0 · Todos os dados ficam no seu dispositivo
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <QuickLogFAB onOpenSessionLog={() => setSessionLogOpen(true)} onOpenPomodoro={() => setPomodoroOpen(true)} />
      <SessionLogModal open={sessionLogOpen} subjects={combinedSubjects}
        initial={pomodoroPrefill ? pomodoroPrefill.initial : undefined}
        onSave={(log) => {
          const fromPomo = !!pomodoroPrefill;
          const noXp = fromPomo && pomodoroPrefill.awardXp === false;
          const bonusXp = (fromPomo && pomodoroPrefill.awardXp === true) ? 5 : 0;
          handleEnrichedLog(log, { noXp, bonusXp });
          setPomodoroPrefill(null);
        }}
        onClose={() => { setSessionLogOpen(false); setPomodoroPrefill(null); }}
        customStudyTypes={shared.customStudyTypes || []}
        onAddCustomStudyType={handleAddCustomStudyType} />
      <SessionLogModal open={!!editTarget} subjects={combinedSubjects}
        initial={editTarget?.entry}
        customStudyTypes={shared.customStudyTypes || []}
        onAddCustomStudyType={handleAddCustomStudyType}
        onSave={(updated) => { if (editTarget) handleUpdateEntry(editTarget.date, editTarget.idx, updated); }}
        onClose={() => setEditTarget(null)} />
      <PomodoroModal open={pomodoroOpen} onClose={() => setPomodoroOpen(false)}
        subjects={combinedSubjects.length ? combinedSubjects : objState.subjects}
        customStudyTypes={shared.customStudyTypes || []}
        onAddCustomStudyType={handleAddCustomStudyType}
        onCompleteSession={handleSession}
        onOpenFullLog={({ durationMin, discipline, awardXp }) => {
          const totalMin = Math.max(0, Math.round(durationMin || 0));
          const initial = {
            date: new Date().toISOString().slice(0,10),
            discipline: discipline || '',
            hours: totalMin / 60,
            source: awardXp ? 'pomodoro' : 'pomodoro-early',
          };
          setPomodoroPrefill({ initial, awardXp: !!awardXp });
          setPomodoroOpen(false);
          setSessionLogOpen(true);
        }} />
      <GoalsModal open={goalsOpen} goals={shared.goals} onSave={handleSaveGoals} onClose={() => setGoalsOpen(false)} />

      {showOnboarding && <OnboardingModal onDone={() => setShowOnboarding(false)} />}
      {legalModal && <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />}
      {evolutionEvent && <EvolutionModal fromStage={evolutionEvent.from} toStage={evolutionEvent.to} onClose={() => setEvolutionEvent(null)} />}
      {toasts.map(t => <AchievementToast key={t.id} kind={t.kind} onDone={() => setToasts(ts => ts.filter(x => x.id !== t.id))} />)}

      <TweaksPanel title="Tweaks · TOGA">
        <TweakSection label="Modo">
          <TweakRadio label="Fase" value={tweaks.mode}
            options={[{ value: 'objetiva', label: 'Objetiva' }, { value: 'discursiva', label: 'Discursiva' }]}
            onChange={(v) => { setTweaks('mode', v); setMeta(m => ({ ...m, mode: v })); }} />
          <TweakToggle label="Mostrar Splash" value={tweaks.showSplash} onChange={(v) => setTweaks('showSplash', v)} />
        </TweakSection>
        <TweakSection label="Backup">
          <TweakButton label="💾 Baixar backup" onClick={() => {
            const backup = { version: 'v3', exportedAt: new Date().toISOString(), shared, objetiva: objState, discursiva: discState };
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `toga-backup-${new Date().toISOString().slice(0,10)}.json`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
            pushToast('backup_done');
          }} />
        </TweakSection>
        <TweakSection label="Pet sandbox">
          <TweakButton label="+250 XP"    onClick={() => setShared(s => ({ ...s, xp: s.xp + 250 }))} />
          <TweakButton label="+1000 XP"   onClick={() => setShared(s => ({ ...s, xp: s.xp + 1000 }))} />
          <TweakButton label="+3000 XP"   onClick={() => setShared(s => ({ ...s, xp: s.xp + 3000 }))} />
          <TweakButton label="Reset XP"   onClick={() => { setShared(s => ({ ...s, xp: 0 })); prevPetStageRef.current = 1; }} />
          <TweakButton label="XP=15k"     onClick={() => setShared(s => ({ ...s, xp: 15000 }))} />
          <TweakButton label="Pet doente" onClick={() => { setShared(s => ({ ...s, petHealth: 'sick' })); pushToast('pet_sick'); }} />
          <TweakButton label="Pet saudável" onClick={() => { setShared(s => ({ ...s, petHealth: 'healthy' })); pushToast('pet_healed'); }} />
        </TweakSection>
        <TweakSection label="Celebrações">
          <TweakButton label="✨ Leve"    onClick={() => window.celebrateLight && window.celebrateLight()} />
          <TweakButton label="🎉 Meta"    onClick={() => window.celebrateHighEnergy && window.celebrateHighEnergy()} />
          <TweakButton label="🏆 Vitória" onClick={() => window.celebrateVictory && window.celebrateVictory()} />
          <TweakButton label="🌟 Evolução" onClick={() => window.celebrateEvolution && window.celebrateEvolution()} />
        </TweakSection>
        <TweakSection label="Limpar dados">
          <TweakButton label="Reset Objetiva"   onClick={() => setObjState(window.DA.INITIAL_OBJETIVA)} />
          <TweakButton label="Reset Discursiva" onClick={() => setDiscState(window.DA.INITIAL_DISCURSIVA)} />
        </TweakSection>
      </TweaksPanel>

      <div id="confetti-root" />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
