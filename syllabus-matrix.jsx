// SyllabusMatrix — Objetiva mode (5 cols) — editable subject weights
const FLAGS_OBJ = ['lei', 'doutrina', 'juris', 'questoes', 'revisao'];
const FLAG_LABELS_OBJ = { lei: 'Lei', doutrina: 'Teoria/Resumos', juris: 'Juris', questoes: 'Questões', revisao: 'Revisão' };

function SyllabusMatrixObjetiva({ state, setState, onMaster, onCheckXp }) {
const toggle = (sId, tId, flag) => {
let willMaster = false;
let xpDelta = 0;
setState(s => ({
...s,
subjects: s.subjects.map(sub => sub.id !== sId ? sub : {
...sub,
topics: sub.topics.map(t => {
if (t.id !== tId) return t;
const next = { ...t, [flag]: !t[flag] };
const nextChecks = FLAGS_OBJ.filter(f => next[f]).length;
const prevChecks = FLAGS_OBJ.filter(f => t[f]).length;
const w = Math.max(1, sub.weight || 1);          // weight-scaled XP
if (nextChecks > prevChecks) xpDelta = 1 * w;    // +1 × peso por check
if (nextChecks < prevChecks) xpDelta = -1 * w;   // -1 × peso se desmarcar
if (nextChecks === 5 && prevChecks < 5) willMaster = true;
// Atualiza lastStudiedAt sempre que houver qualquer alteração nos checks
// (necessário para o decaimento temporal do EditalHeatmap)
if (xpDelta !== 0) next.lastStudiedAt = new Date().toISOString();
return next;
}),
}),
}));
setTimeout(() => {
if (willMaster) {
// 5/5 atingido: celebração maior + som de "tópico dominado"
window.celebrateHighEnergy && window.celebrateHighEnergy();
window.playTopicMastered && window.playTopicMastered();
if (onCheckXp) onCheckXp(xpDelta);
if (onMaster) onMaster();
} else if (xpDelta > 0) {
// Check normal: confete leve + som satisfatório
window.celebrateLight && window.celebrateLight();
window.playCheckChime && window.playCheckChime();
if (onCheckXp) onCheckXp(xpDelta);
} else if (xpDelta < 0) {
if (onCheckXp) onCheckXp(xpDelta);
}
}, 0);
};

const moveSubject = (idx, dir) => setState(s => {
const arr = [...s.subjects];
const j = dir === 'up' ? idx - 1 : idx + 1;
if (j < 0 || j >= arr.length) return s;
[arr[idx], arr[j]] = [arr[j], arr[idx]];
return { ...s, subjects: arr };
});

const moveTopic = (sId, idx, dir) => setState(s => ({
...s,
subjects: s.subjects.map(sub => {
if (sub.id !== sId) return sub;
const arr = [...sub.topics];
const j = dir === 'up' ? idx - 1 : idx + 1;
if (j < 0 || j >= arr.length) return sub;
[arr[idx], arr[j]] = [arr[j], arr[idx]];
return { ...sub, topics: arr };
}),
}));

const setWeight = (sId, w) => setState(s => ({
...s, subjects: s.subjects.map(sub => sub.id === sId ? { ...sub, weight: Math.max(1, Math.min(5, w)) } : sub),
}));

const renameSubject = (sId, name) => setState(s => ({
...s, subjects: s.subjects.map(sub => sub.id === sId ? { ...sub, name } : sub),
}));

const renameTopic = (sId, tId, name) => setState(s => ({
...s, subjects: s.subjects.map(sub => sub.id !== sId ? sub : {
...sub, topics: sub.topics.map(t => t.id === tId ? { ...t, name } : t),
}),
}));

const addTopic = (sId) => setState(s => ({
...s, subjects: s.subjects.map(sub => sub.id !== sId ? sub : {
...sub, topics: [...sub.topics, { id: `t-${Date.now()}`, name: 'Novo tópico', lei: false, doutrina: false, juris: false, questoes: false, revisao: false }],
}),
}));

const removeTopic = (sId, tId) => setState(s => ({
...s, subjects: s.subjects.map(sub => sub.id !== sId ? sub : { ...sub, topics: sub.topics.filter(t => t.id !== tId) }),
}));

const addSubject = () => setState(s => ({
...s, subjects: [...s.subjects, { id: `s-${Date.now()}`, name: 'Nova disciplina', shortName: 'Nova', weight: 3, topics: [] }],
}));

const removeSubject = (sId) => setState(s => ({ ...s, subjects: s.subjects.filter(sub => sub.id !== sId) }));

return (
<div style={{ display: 'grid', gap: 12 }}>
{state.subjects.map((s, si) => {
const completion = window.DA.getSubjectCompletionObj(s);
const totalChecks = s.topics.reduce((a, t) => a + FLAGS_OBJ.filter(f => t[f]).length, 0);
return (
<SubjectCardObj key={s.id} subject={s} idx={si} total={state.subjects.length}
completion={completion} totalChecks={totalChecks}
onMoveSubject={moveSubject} onMoveTopic={moveTopic}
onToggle={toggle} onSetWeight={setWeight}
onRename={renameSubject} onRenameTopic={renameTopic}
onAddTopic={addTopic} onRemoveTopic={removeTopic} onRemoveSubject={removeSubject} />
);
})}
<button className="btn-neon" style={{ justifySelf: 'start' }} onClick={addSubject}>
<I.plus size={14} /> Nova disciplina
</button>
</div>
);
}

function SubjectCardObj({ subject, idx, total, completion, totalChecks, onMoveSubject, onMoveTopic, onToggle, onSetWeight, onRename, onRenameTopic, onAddTopic, onRemoveTopic, onRemoveSubject }) {
const [open, setOpen] = React.useState(idx < 2);
const [hover, setHover] = React.useState(false);

return (
<div className="glass" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
style={{ padding: 0, overflow: 'hidden' }}>
<div style={{ padding: '14px 18px', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
<div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
<div style={{
display: 'flex', flexDirection: 'column', gap: 2,
opacity: hover ? 1 : 0.15, transition: 'opacity 150ms',
}}>
<button className="btn-ghost" style={{ padding: 2 }} disabled={idx === 0}
onClick={e => { e.stopPropagation(); onMoveSubject(idx, 'up'); }}><I.up size={11} /></button>
<button className="btn-ghost" style={{ padding: 2 }} disabled={idx === total - 1}
onClick={e => { e.stopPropagation(); onMoveSubject(idx, 'down'); }}><I.down size={11} /></button>
</div>

      <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
        <svg viewBox="0 0 40 40" width={40} height={40}>
          <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(12,13,18,0.06)" strokeWidth="3" />
          <circle cx="20" cy="20" r="17" fill="none"
            stroke={completion === 100 ? 'var(--esmeralda)' : '#00b8d4'} strokeWidth="3"
            strokeDasharray={`${(completion / 100) * 107} 107`} strokeLinecap="round" transform="rotate(-90 20 20)" />
        </svg>
        <div className="num" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700, color: completion === 100 ? 'var(--esmeralda)' : '#006e80' }}>
          {Math.round(completion)}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <input className="inline-edit font-display" style={{ fontSize: 16, fontWeight: 600 }}
            value={subject.name} onClick={e => e.stopPropagation()}
            onChange={e => onRename(subject.id, e.target.value)} />
          <WeightControl weight={subject.weight} onChange={(w) => onSetWeight(subject.id, w)} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          {subject.topics.length} tópicos · <span className="num">{totalChecks}/{subject.topics.length * 5}</span> checks
        </div>
      </div>
      <button className="btn-ghost" onClick={e => { e.stopPropagation(); onRemoveSubject(subject.id); }} style={{ padding: 4, opacity: hover ? 0.6 : 0 }}><I.close size={12} /></button>
      <div className="btn-ghost" style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 150ms' }}>
        <I.chevronR size={14} />
      </div>
    </div>
    <div style={{ marginTop: 12, height: 4, background: 'rgba(12,13,18,0.06)', borderRadius: 3, overflow: 'hidden' }}>
      <div className="gradient-bar-green-cyan" style={{ height: '100%', width: `${completion}%`, transition: 'width 500ms ease' }} />
    </div>
  </div>

  {open && (
    <div style={{ padding: '4px 18px 14px', borderTop: '1px solid rgba(12,13,18,0.04)' }}>
      <div className="topic-row-obj header-row" style={{ padding: '10px 0', borderBottom: '1px solid rgba(12,13,18,0.04)' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>TÓPICO</div>
        {FLAGS_OBJ.map(f => (
          <div key={f} style={{ fontSize: 10, letterSpacing: '0.08em', color: 'var(--text-dim)', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
            {FLAG_LABELS_OBJ[f]}
          </div>
        ))}
      </div>
      {subject.topics.map((t, ti) => {
        const checks = FLAGS_OBJ.filter(f => t[f]).length;
        return (
          <TopicRowObj key={t.id} topic={t} idx={ti} total={subject.topics.length} checks={checks}
            onMove={(dir) => onMoveTopic(subject.id, ti, dir)}
            onToggle={(flag) => onToggle(subject.id, t.id, flag)}
            onRename={(name) => onRenameTopic(subject.id, t.id, name)}
            onRemove={() => onRemoveTopic(subject.id, t.id)} />
        );
      })}
      <button className="btn-ghost" style={{ marginTop: 8 }} onClick={() => onAddTopic(subject.id)}>
        <I.plus size={11} stroke={2.5} /> Adicionar tópico
      </button>
    </div>
  )}

  <style>{`
    .topic-row-obj { display: grid; grid-template-columns: 1fr repeat(5, 40px); gap: 10px; align-items: center; }
    @media (min-width: 640px) { .topic-row-obj { grid-template-columns: 1fr repeat(5, 56px); gap: 16px; } }
  `}</style>
</div>

);
}

function WeightControl({ weight, onChange }) {
const [open, setOpen] = React.useState(false);
return (
<div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
<button className="num"
onClick={() => setOpen(o => !o)}
style={{
fontSize: 10, padding: '3px 8px', borderRadius: 4,
background: 'rgba(91,71,184,0.1)', color: '#5a1fa0',
letterSpacing: '0.08em', border: '1px solid rgba(91,71,184,0.3)',
fontWeight: 700, cursor: 'pointer',
}}>
PESO {weight}
</button>
{open && (
<div className="glass-strong" style={{
position: 'absolute', top: '100%', left: 0, marginTop: 4, padding: 4, borderRadius: 8,
display: 'flex', gap: 2, zIndex: 5,
}}>
{[1,2,3,4,5].map(w => (
<button key={w} className="num"
onClick={() => { onChange(w); setOpen(false); }}
style={{
width: 26, height: 26, borderRadius: 4, border: 'none', cursor: 'pointer',
background: w === weight ? 'rgba(91,71,184,0.2)' : 'transparent',
color: w === weight ? '#5a1fa0' : 'var(--text-muted)',
fontWeight: 700, fontSize: 12,
}}>
{w}
</button>
))}
</div>
)}
</div>
);
}

function TopicRowObj({ topic, idx, total, checks, onMove, onToggle, onRename, onRemove }) {
const [hover, setHover] = React.useState(false);
const complete = checks === 5;
return (
<div className="topic-row-obj" style={{ padding: '6px 0' }}
onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
<div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
<div style={{ display: 'flex', flexDirection: 'column', gap: 0, opacity: hover ? 1 : 0.1, transition: 'opacity 150ms' }}>
<button className="btn-ghost" style={{ padding: 1 }} onClick={() => onMove('up')} disabled={idx === 0}><I.up size={9} /></button>
<button className="btn-ghost" style={{ padding: 1 }} onClick={() => onMove('down')} disabled={idx === total - 1}><I.down size={9} /></button>
</div>
<input className="inline-edit" value={topic.name} onChange={e => onRename(e.target.value)}
style={{ fontSize: 13, color: complete ? 'var(--esmeralda)' : 'var(--text-primary)', flex: 1, minWidth: 0 }} />
<button className="btn-ghost" onClick={onRemove} style={{ padding: 2, opacity: hover ? 0.4 : 0 }}><I.close size={10} /></button>
</div>
{FLAGS_OBJ.map(f => (
<div key={f} style={{ display: 'grid', placeItems: 'center' }}>
<button className={`check-cell ${topic[f] ? 'active' : ''}`} onClick={() => onToggle(f)} title={FLAG_LABELS_OBJ[f]}>
{topic[f] && <I.check size={14} stroke={2.5} />}
</button>
</div>
))}
</div>
);
}

window.SyllabusMatrixObjetiva = SyllabusMatrixObjetiva;