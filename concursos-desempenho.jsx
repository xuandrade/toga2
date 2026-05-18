// TOGA — Aba Desempenho em Concursos
const BANCAS_CONCURSO = ['CESPE/CEBRASPE', 'FCC', 'FGV', 'VUNESP', 'IBFC', 'IADES', 'AOCP', 'Quadrix', 'FUNDATEC', 'FEPESE', 'NC-UFPR', 'FAFIPA', 'Própria', 'Outra'];

function ProximityChart({ provas }) {
  if (provas.length < 2) return null;

  const W = 600, H = 170;
  const PAD = { top: 24, right: 64, bottom: 44, left: 44 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const values = provas.map(p => (p.pontos / p.corte) * 100);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const yMin = Math.floor(Math.min(rawMin, 90) / 10) * 10;
  const yMax = Math.ceil(Math.max(rawMax, 105) / 10) * 10;
  const yRange = yMax - yMin || 1;

  const xScale = (i) => PAD.left + (i / Math.max(provas.length - 1, 1)) * chartW;
  const yScale = (v) => PAD.top + ((yMax - v) / yRange) * chartH;

  const cutoffY = yScale(100);

  const pts = provas.map((p, i) => `${xScale(i)},${yScale(values[i])}`).join(' ');

  const areaAbove = [
    `${xScale(0)},${cutoffY}`,
    ...provas.map((p, i) => `${xScale(i)},${Math.min(yScale(values[i]), cutoffY)}`),
    `${xScale(provas.length - 1)},${cutoffY}`,
  ].join(' ');

  const areaBelow = [
    `${xScale(0)},${cutoffY}`,
    ...provas.map((p, i) => `${xScale(i)},${Math.max(yScale(values[i]), cutoffY)}`),
    `${xScale(provas.length - 1)},${cutoffY}`,
  ].join(' ');

  const yTicks = [];
  for (let v = yMin; v <= yMax; v += 10) yTicks.push(v);

  const fmtDate = (p) => {
    const d = new Date(p.date + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block' }}>
        <defs>
          <clipPath id="clip-above">
            <rect x={PAD.left} y={PAD.top} width={chartW} height={Math.max(0, cutoffY - PAD.top)} />
          </clipPath>
          <clipPath id="clip-below">
            <rect x={PAD.left} y={cutoffY} width={chartW} height={Math.max(0, H - PAD.bottom - cutoffY)} />
          </clipPath>
        </defs>

        {/* Grid lines */}
        {yTicks.map(v => (
          <g key={v}>
            <line x1={PAD.left} y1={yScale(v)} x2={W - PAD.right} y2={yScale(v)}
              stroke={v === 100 ? 'rgba(245,158,11,0.35)' : 'rgba(30,32,48,0.06)'} strokeWidth={v === 100 ? 1.5 : 1} />
            <text x={PAD.left - 5} y={yScale(v) + 4} fontSize="10" fill="rgba(30,32,48,0.4)"
              textAnchor="end" fontFamily="JetBrains Mono, monospace" fontWeight="600">
              {v}%
            </text>
          </g>
        ))}

        {/* Area fills */}
        <polygon points={areaAbove} fill="rgba(0,168,107,0.10)" clipPath="url(#clip-above)" />
        <polygon points={areaBelow} fill="rgba(232,93,93,0.10)" clipPath="url(#clip-below)" />

        {/* Cutoff label */}
        <text x={W - PAD.right + 5} y={cutoffY + 4} fontSize="9.5" fill="rgba(245,158,11,0.85)"
          fontFamily="JetBrains Mono, monospace" fontWeight="700">CORTE</text>

        {/* Main line */}
        <polyline points={pts} fill="none" stroke="#00b8d4" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {provas.map((p, i) => {
          const x = xScale(i), y = yScale(values[i]);
          const passou = p.pontos >= p.corte;
          return (
            <g key={p.id}>
              <circle cx={x} cy={y} r="5" fill="white"
                stroke={passou ? '#00a86b' : '#E85D5D'} strokeWidth="2.5" />
              <text x={x} y={H - PAD.bottom + 14} fontSize="9" fill="rgba(30,32,48,0.45)"
                textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontWeight="600">
                {fmtDate(p)}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ fontSize: 10, color: 'var(--text-dim)', textAlign: 'center', marginTop: 4, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, letterSpacing: '0.05em' }}>
        100% = exatamente no corte · acima de 100% = aprovado
      </div>
    </div>
  );
}

function ProvaCard({ p, onEdit, onRemove }) {
  const pontos = p.pontos || 0;
  const corte = p.corte || 0;
  const totalProva = p.totalProva || Math.max(pontos, corte);

  const pctDesempenho = totalProva > 0 ? (pontos / totalProva) * 100 : 0;
  const gapPts = pontos - corte;
  const gapPct = totalProva > 0 ? Math.abs(gapPts / totalProva) * 100 : 0;
  const passou = gapPts >= 0;

  const GREEN = '#00a86b';
  const CORAL = '#E85D5D';
  const AMBER = '#f59e0b';

  const dateStr = p.date
    ? new Date(p.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })
    : '';

  const pontosW = totalProva > 0 ? Math.min(100, (pontos / totalProva) * 100) : 0;
  const corteW = totalProva > 0 ? Math.min(100, (corte / totalProva) * 100) : 0;

  return (
    <div className="glass" style={{
      padding: '18px 20px',
      border: passou ? '1px solid rgba(0,168,107,0.15)' : '1px solid rgba(232,93,93,0.12)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          {/* Gap badge */}
          <div style={{
            flexShrink: 0, minWidth: 66, padding: '8px 10px', borderRadius: 10, textAlign: 'center',
            background: passou ? 'rgba(0,168,107,0.10)' : 'rgba(232,93,93,0.10)',
            border: `1px solid ${passou ? 'rgba(0,168,107,0.28)' : 'rgba(232,93,93,0.28)'}`,
          }}>
            <div className="num" style={{ fontSize: 19, fontWeight: 800, color: passou ? GREEN : CORAL, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {gapPct.toFixed(0)}<span style={{ fontSize: 10, fontWeight: 700 }}>%</span>
            </div>
            <div style={{ fontSize: 8, color: passou ? GREEN : CORAL, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '0.05em', marginTop: 3, lineHeight: 1.3, textTransform: 'uppercase', opacity: 0.85 }}>
              {passou ? 'acima\ndo corte' : 'abaixo\ndo corte'}
            </div>
          </div>

          {/* Name + tags */}
          <div style={{ minWidth: 0 }}>
            <div className="font-display" style={{ fontSize: 16, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p.cargo}
            </div>
            <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
              {p.banca && (
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', padding: '2px 7px', borderRadius: 99, background: 'rgba(30,32,48,0.06)' }}>
                  {p.banca}
                </span>
              )}
              {p.orgao && (
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', padding: '2px 7px', borderRadius: 99, background: 'rgba(30,32,48,0.06)' }}>
                  {p.orgao}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Score / total + date */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div>
            <span className="num" style={{ fontSize: 20, fontWeight: 800, color: passou ? GREEN : CORAL }}>
              {pontos}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}> / {totalProva}</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, marginTop: 2 }}>
            {pctDesempenho.toFixed(0)}% de desempenho
          </div>
          {dateStr && (
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, marginTop: 2 }}>
              {dateStr}
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ position: 'relative', marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, marginBottom: 4 }}>
          <span>0</span>
          <span style={{ color: passou ? GREEN : AMBER, fontWeight: 700 }}>corte ({corte})</span>
          <span>{totalProva}</span>
        </div>
        <div style={{ position: 'relative', height: 10, background: 'rgba(30,32,48,0.07)', borderRadius: 99, overflow: 'visible' }}>
          {/* Score fill */}
          <div style={{
            height: '100%', width: `${pontosW}%`,
            background: passou
              ? `linear-gradient(90deg, #f59e0b, ${GREEN})`
              : `linear-gradient(90deg, ${CORAL}, #f59e0b)`,
            borderRadius: 99,
            transition: 'width 600ms cubic-bezier(0.16,1,0.3,1)',
          }} />
          {/* Cutoff marker */}
          <div style={{
            position: 'absolute', top: -3, bottom: -3, left: `${corteW}%`,
            width: 2.5, background: passou ? GREEN : AMBER,
            borderRadius: 99,
            transform: 'translateX(-50%)',
            boxShadow: `0 0 6px ${passou ? GREEN : AMBER}99`,
          }} />
        </div>
      </div>

      {/* Points gap description */}
      <div style={{ fontSize: 12, marginTop: 8, fontFamily: 'JetBrains Mono, monospace' }}>
        <span className="num" style={{ fontWeight: 800, color: passou ? GREEN : CORAL }}>{pontos}</span>
        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
          {passou
            ? ` — ${Math.abs(gapPts).toFixed(1)} pts acima do corte`
            : ` — faltam ${Math.abs(gapPts).toFixed(1)} pts para o corte`}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button className="btn-ghost" onClick={onEdit}
          style={{ fontSize: 11, padding: '5px 12px' }}>
          ✏️ Editar
        </button>
        <button className="btn-ghost" onClick={() => {
          if (window.confirm('Remover este registro?')) onRemove();
        }} style={{ fontSize: 11, padding: '5px 12px', color: 'var(--coral)', borderColor: 'rgba(232,93,93,0.3)' }}>
          ✕ Remover
        </button>
      </div>
    </div>
  );
}

function ConcursosDesempenhoTab({ provas, setProvas }) {
  const { useState: useSt } = React;
  const emptyForm = { cargo: '', banca: '', orgao: '', date: '', totalProva: '', pontos: '', corte: '' };
  const [showForm, setShowForm] = useSt(false);
  const [form, setForm] = useSt(emptyForm);
  const [editId, setEditId] = useSt(null);
  const [formError, setFormError] = useSt('');

  const openNew = () => { setForm(emptyForm); setEditId(null); setFormError(''); setShowForm(true); };
  const openEdit = (p) => {
    setForm({ cargo: p.cargo, banca: p.banca || '', orgao: p.orgao || '', date: p.date, totalProva: String(p.totalProva), pontos: String(p.pontos), corte: String(p.corte) });
    setEditId(p.id);
    setFormError('');
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditId(null); setForm(emptyForm); setFormError(''); };

  const handleSave = () => {
    const p = parseFloat(form.pontos);
    const c = parseFloat(form.corte);
    const t = parseFloat(form.totalProva);
    if (!form.cargo.trim()) { setFormError('Informe o cargo/concurso.'); return; }
    if (!form.date) { setFormError('Informe a data da prova.'); return; }
    if (isNaN(t) || t <= 0) { setFormError('Informe o total de pontos da prova.'); return; }
    if (isNaN(p) || p < 0) { setFormError('Informe os pontos obtidos.'); return; }
    if (isNaN(c) || c <= 0) { setFormError('Informe a nota de corte.'); return; }
    if (p > t) { setFormError('Pontos obtidos não podem ser maiores que o total da prova.'); return; }
    if (c > t) { setFormError('Nota de corte não pode ser maior que o total da prova.'); return; }

    const entry = {
      id: editId || `prova-${Date.now()}`,
      cargo: form.cargo.trim(),
      banca: form.banca.trim(),
      orgao: form.orgao.trim(),
      date: form.date,
      totalProva: t,
      pontos: p,
      corte: c,
    };

    if (editId) {
      setProvas(arr => arr.map(x => x.id === editId ? entry : x));
    } else {
      setProvas(arr => [...arr, entry]);
    }
    closeForm();
  };

  const handleRemove = (id) => setProvas(arr => arr.filter(x => x.id !== id));

  const sorted = [...provas].sort((a, b) => b.date.localeCompare(a.date));
  const chronological = [...sorted].reverse();

  // Preview calc
  const prevP = parseFloat(form.pontos);
  const prevC = parseFloat(form.corte);
  const prevT = parseFloat(form.totalProva);
  const showPreview = !isNaN(prevP) && !isNaN(prevC) && !isNaN(prevT) && prevT > 0;
  const prevGapPts = prevP - prevC;
  const prevGapPct = showPreview ? Math.abs(prevGapPts / prevT) * 100 : 0;
  const prevPassou = prevGapPts >= 0;
  const prevPctDesempenho = showPreview ? (prevP / prevT) * 100 : 0;

  const inputLabel = (text, required) => (
    <label style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
      {text}{required && <span style={{ color: 'var(--coral)', marginLeft: 2 }}>*</span>}
    </label>
  );

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="font-display" style={{ fontSize: 20, fontWeight: 700 }}>Desempenho em Concursos</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', fontWeight: 700, marginTop: 4 }}>
            HISTÓRICO DE PROVAS REALIZADAS
          </div>
        </div>
        <button className="btn-neon" onClick={openNew} style={{ fontSize: 12 }}>
          + Registrar prova
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass anim-slide-up" style={{ padding: '20px 22px', marginBottom: 20, border: '1px solid rgba(0,184,212,0.22)', background: 'rgba(0,184,212,0.03)' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 14 }}>
            {editId ? 'EDITAR PROVA' : 'REGISTRAR PROVA ANTERIOR'}
          </div>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', marginBottom: 12 }}>
            <div style={{ gridColumn: 'span 2' }}>
              {inputLabel('Cargo / Concurso', true)}
              <input className="input-base" placeholder="ex: Defensor Público" value={form.cargo}
                autoFocus onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))} style={{ width: '100%' }} />
            </div>

            <div>
              {inputLabel('Banca')}
              <select className="input-base" value={form.banca}
                onChange={e => setForm(f => ({ ...f, banca: e.target.value }))} style={{ width: '100%' }}>
                <option value="">Selecionar banca</option>
                {BANCAS_CONCURSO.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              {inputLabel('Órgão')}
              <input className="input-base" placeholder="ex: DPE-BA" value={form.orgao}
                onChange={e => setForm(f => ({ ...f, orgao: e.target.value }))} style={{ width: '100%' }} />
            </div>

            <div>
              {inputLabel('Data da prova', true)}
              <input className="input-base" type="date" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ width: '100%' }} />
            </div>

            <div>
              {inputLabel('Total de pontos da prova', true)}
              <input className="input-base" type="number" placeholder="ex: 100" value={form.totalProva}
                onChange={e => setForm(f => ({ ...f, totalProva: e.target.value }))} style={{ width: '100%' }} />
            </div>

            <div>
              {inputLabel('Pontos obtidos', true)}
              <input className="input-base" type="number" placeholder="ex: 68" value={form.pontos}
                onChange={e => setForm(f => ({ ...f, pontos: e.target.value }))} style={{ width: '100%' }} />
            </div>

            <div>
              {inputLabel('Nota de corte', true)}
              <input className="input-base" type="number" placeholder="ex: 74" value={form.corte}
                onChange={e => setForm(f => ({ ...f, corte: e.target.value }))} style={{ width: '100%' }} />
            </div>
          </div>

          {/* Live preview */}
          {showPreview && (
            <div className="anim-slide-up" style={{
              padding: '10px 14px', borderRadius: 10, marginBottom: 12,
              background: prevPassou ? 'rgba(0,168,107,0.08)' : 'rgba(232,93,93,0.08)',
              border: `1px solid ${prevPassou ? 'rgba(0,168,107,0.25)' : 'rgba(232,93,93,0.25)'}`,
              fontSize: 12, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center',
            }}>
              <span style={{ fontWeight: 800, color: prevPassou ? '#00a86b' : 'var(--coral)', fontFamily: 'JetBrains Mono, monospace' }}>
                {prevGapPct.toFixed(1)}% {prevPassou ? 'acima do corte' : 'abaixo do corte'}
              </span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                Desempenho: {prevPctDesempenho.toFixed(1)}% &nbsp;·&nbsp; {prevP} / {prevT} pts
              </span>
            </div>
          )}

          {formError && (
            <div style={{ fontSize: 11.5, color: 'var(--coral)', fontWeight: 600, marginBottom: 10 }}>
              ⚠ {formError}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-neon" onClick={handleSave} style={{ fontSize: 12 }}>
              {editId ? '✓ Salvar alterações' : '+ Registrar'}
            </button>
            <button className="btn-ghost" onClick={closeForm} style={{ fontSize: 12 }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Proximity chart */}
      {chronological.length >= 2 && (
        <div className="glass anim-slide-up" style={{ padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 14 }}>
            % DE PROXIMIDADE AO CORTE
          </div>
          <ProximityChart provas={chronological} />
        </div>
      )}

      {/* History list */}
      {sorted.length === 0 ? (
        <div className="glass" style={{ padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, opacity: 0.18, marginBottom: 12 }}>🏛️</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>Nenhuma prova registrada ainda.</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>
            Clique em <strong>+ Registrar prova</strong> para adicionar seu histórico.
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 12 }}>
            HISTÓRICO · {sorted.length} {sorted.length === 1 ? 'CONCURSO' : 'CONCURSOS'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {sorted.map(p => (
              <ProvaCard key={p.id} p={p} onEdit={() => openEdit(p)} onRemove={() => handleRemove(p.id)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

window.ConcursosDesempenhoTab = ConcursosDesempenhoTab;
