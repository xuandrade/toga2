// TOGA — Aba Desempenho em Concursos
// Registra resultados reais, calcula % do corte, gera insights e integra gamificação.

const DESEMP_BANCAS = [
  'CESPE/CEBRASPE', 'FCC', 'FGV', 'VUNESP', 'IBFC', 'IADES',
  'AOCP', 'Quadrix', 'FUNDATEC', 'FEPESE', 'FUNIVERSA', 'NCE/UFRJ',
  'FAFIPA', 'Própria', 'Outra',
];

const DISC_COLORS = [
  '#00B8D4', '#00A86B', '#5B47B8', '#E85D5D',
  '#F59E0B', '#FF7A1A', '#EC4899', '#06B6D4',
];

// ── Utility ────────────────────────────────────────────────

function calcPctCorte(notaTotal, corte) {
  if (!corte || corte <= 0) return 0;
  return (notaTotal / corte) * 100;
}

function getSituacao(pct) {
  if (pct >= 100) return { label: 'Acima do corte', color: 'var(--esmeralda)', colorRaw: '#00A86B', icon: '✅', code: 'above' };
  if (pct >= 93)  return { label: 'No limite',      color: 'var(--dourado)',    colorRaw: '#C9A961', icon: '⚡', code: 'near' };
  return            { label: 'Abaixo do corte',     color: 'var(--coral)',      colorRaw: '#E85D5D', icon: '📍', code: 'below' };
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });
}

function mean(arr) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// ── Chart: Evolução do % do Corte ─────────────────────────

function CorteEvolutionChart({ records }) {
  const sorted = [...records].sort((a, b) => a.data.localeCompare(b.data));
  const W = 560, H = 170, PX = 44, PY = 22;

  if (sorted.length === 0) {
    return (
      <div style={{ height: H, display: 'grid', placeItems: 'center', color: 'var(--text-dim)', fontSize: 12 }}>
        Registre seu primeiro concurso para ver sua evolução aqui.
      </div>
    );
  }

  const values = sorted.map(r => calcPctCorte(r.notaTotal, r.corte));

  if (sorted.length === 1) {
    const v = values[0];
    const sit = getSituacao(v);
    return (
      <div style={{ height: H, display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="num" style={{ fontSize: 56, fontWeight: 800, color: sit.color, filter: `drop-shadow(0 0 16px ${sit.colorRaw}44)` }}>
            {v.toFixed(0)}%
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
            {sit.icon} {sit.label} · 1 concurso registrado
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>
            adicione mais registros para ver sua linha de evolução
          </div>
        </div>
      </div>
    );
  }

  const minV = Math.max(0, Math.min(...values) - 12);
  const maxV = Math.max(115, Math.max(...values) + 10);

  const toX = (i) => PX + (i / (sorted.length - 1)) * (W - 2 * PX);
  const toY = (v) => PY + (1 - (v - minV) / (maxV - minV)) * (H - 2 * PY - 14);
  const cutoffY = toY(100);

  const pts = sorted.map((_, i) => ({ x: toX(i), y: toY(values[i]), v: values[i] }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${pathD} L ${pts[pts.length - 1].x.toFixed(1)} ${H - PY - 14} L ${pts[0].x.toFixed(1)} ${H - PY - 14} Z`;

  const gridVals = [50, 70, 90, 100, 110].filter(v => v > minV && v < maxV);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="dc-line" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#00D48A" />
          <stop offset="100%" stopColor="#00B8D4" />
        </linearGradient>
        <linearGradient id="dc-area-above" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#00A86B" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#00A86B" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="dc-area-below" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#E85D5D" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#E85D5D" stopOpacity="0.22" />
        </linearGradient>
        <clipPath id="dc-clip-above">
          <rect x={0} y={0} width={W} height={Math.max(0, cutoffY)} />
        </clipPath>
        <clipPath id="dc-clip-below">
          <rect x={0} y={cutoffY} width={W} height={H} />
        </clipPath>
      </defs>

      {/* Grid lines */}
      {gridVals.map(v => {
        const y = toY(v);
        const isCutoff = v === 100;
        return (
          <g key={v}>
            <line x1={PX} y1={y} x2={W - PX} y2={y}
              stroke={isCutoff ? 'rgba(201,169,97,0.60)' : 'rgba(30,32,48,0.06)'}
              strokeDasharray={isCutoff ? '5 3' : '2 4'}
              strokeWidth={isCutoff ? 1.5 : 1} />
            <text x={PX - 5} y={y + 3.5} textAnchor="end" fontSize="8"
              fill={isCutoff ? 'rgba(201,169,97,0.90)' : 'rgba(90,100,120,0.55)'}
              fontFamily="JetBrains Mono" fontWeight={isCutoff ? '700' : '500'}>
              {v}%
            </text>
          </g>
        );
      })}

      {/* CORTE label */}
      <text x={W - PX + 4} y={cutoffY + 3.5} fontSize="8" fill="rgba(201,169,97,0.85)"
        fontFamily="JetBrains Mono" fontWeight="700">CORTE</text>

      {/* Area fills */}
      <path d={areaPath} fill="url(#dc-area-above)" clipPath="url(#dc-clip-above)" />
      <path d={areaPath} fill="url(#dc-area-below)" clipPath="url(#dc-clip-below)" />

      {/* Line */}
      <path d={pathD} fill="none" stroke="url(#dc-line)" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots + date labels */}
      {pts.map((p, i) => {
        const sit = getSituacao(p.v);
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="white" stroke={sit.colorRaw} strokeWidth="2.5" />
            <text x={p.x} y={H - 3} textAnchor="middle" fontSize="7.5"
              fill="rgba(90,100,120,0.65)" fontFamily="JetBrains Mono">
              {new Date(sorted[i].data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Chart: Evolução por Disciplina ─────────────────────────

function DisciplinaChart({ records, selectedDiscs, allDiscs }) {
  const sorted = [...records].sort((a, b) => a.data.localeCompare(b.data));
  const W = 560, H = 160, PX = 44, PY = 18;

  if (sorted.length === 0 || allDiscs.length === 0) {
    return (
      <div style={{ height: H, display: 'grid', placeItems: 'center', color: 'var(--text-dim)', fontSize: 12 }}>
        Adicione registros com disciplinas para visualizar a evolução por matéria.
      </div>
    );
  }

  const discsToShow = selectedDiscs.length > 0
    ? selectedDiscs
    : allDiscs.slice(0, Math.min(5, allDiscs.length));

  const toX = (i) => PX + (i / Math.max(1, sorted.length - 1)) * (W - 2 * PX);
  const toY = (v) => PY + (1 - v / 100) * (H - 2 * PY - 14);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block' }}>
      {/* Grid */}
      {[0, 50, 70, 100].map(v => {
        const y = toY(v);
        return (
          <g key={v}>
            <line x1={PX} y1={y} x2={W - PX} y2={y}
              stroke={v === 70 ? 'rgba(245,158,11,0.20)' : 'rgba(30,32,48,0.055)'}
              strokeDasharray="2 4" />
            <text x={PX - 5} y={y + 3.5} textAnchor="end" fontSize="8"
              fill="rgba(90,100,120,0.55)" fontFamily="JetBrains Mono">{v}%</text>
          </g>
        );
      })}

      {/* Lines per discipline */}
      {discsToShow.map((disc, di) => {
        const color = DISC_COLORS[di % DISC_COLORS.length];
        const pts = sorted.map((r, i) => {
          const d = (r.disciplinas || []).find(x => x.nome === disc);
          const pct = d && d.totalQuestoes > 0 ? (d.acertos / d.totalQuestoes) * 100 : null;
          return { x: toX(i), y: pct !== null ? toY(pct) : null, v: pct };
        });

        const pathParts = [];
        let currentPath = '';
        pts.forEach((p) => {
          if (p.v !== null) {
            currentPath += `${currentPath === '' ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
          } else if (currentPath) {
            pathParts.push(currentPath.trim());
            currentPath = '';
          }
        });
        if (currentPath) pathParts.push(currentPath.trim());

        return (
          <g key={di}>
            {pathParts.map((d, pi) => (
              <path key={pi} d={d} fill="none" stroke={color} strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.85" />
            ))}
            {pts.map((p, i) => p.v !== null && (
              <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="white" stroke={color} strokeWidth="2" />
            ))}
          </g>
        );
      })}

      {/* X-axis date labels */}
      {sorted.length <= 8 && sorted.map((r, i) => (
        <text key={i} x={toX(i)} y={H - 3} textAnchor="middle" fontSize="7.5"
          fill="rgba(90,100,120,0.60)" fontFamily="JetBrains Mono">
          {new Date(r.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </text>
      ))}
    </svg>
  );
}

// ── Insights Engine ─────────────────────────────────────────

function computeDesempenhoInsights(records) {
  if (records.length === 0) return [];
  const sorted = [...records].sort((a, b) => a.data.localeCompare(b.data));
  const pcts = sorted.map(r => calcPctCorte(r.notaTotal, r.corte));
  const insights = [];

  // 1. Trend (últimos 3 vs 3 anteriores)
  if (sorted.length >= 4) {
    const recent = pcts.slice(-3);
    const older = pcts.slice(-6, -3);
    if (older.length > 0) {
      const delta = mean(recent) - mean(older);
      if (delta > 4) {
        insights.push({ id: 'trend-up', priority: 10, icon: '🚀', color: 'var(--esmeralda)',
          title: `Tendência de melhora: +${delta.toFixed(1)}pp`,
          body: `Sua média recente (${mean(recent).toFixed(0)}%) superou a anterior (${mean(older).toFixed(0)}%) em ${delta.toFixed(1)} pontos percentuais.` });
      } else if (delta < -5) {
        insights.push({ id: 'trend-down', priority: 10, icon: '📉', color: 'var(--coral)',
          title: `Atenção: queda de ${Math.abs(delta).toFixed(1)}pp recente`,
          body: `Sua média recente (${mean(recent).toFixed(0)}%) caiu em relação à anterior (${mean(older).toFixed(0)}%). Revise sua estratégia de estudos.` });
      }
    }
  }

  // 2. Passou o corte no último
  const lastPct = pcts[pcts.length - 1];
  if (lastPct >= 100) {
    insights.push({ id: 'above-cutoff', priority: 10, icon: '✅', color: 'var(--esmeralda)',
      title: `Aprovação no papel: ${lastPct.toFixed(0)}% do corte!`,
      body: `No último concurso você ficou ${(lastPct - 100).toFixed(1)}pp acima do corte. Isso equivale a aprovação — continue assim!` });
  }

  // 3. Novo recorde pessoal
  if (sorted.length > 1) {
    const bestIdx = pcts.indexOf(Math.max(...pcts));
    if (bestIdx === pcts.length - 1) {
      insights.push({ id: 'new-record', priority: 9, icon: '🏆', color: 'var(--dourado)',
        title: `Novo recorde pessoal: ${pcts[bestIdx].toFixed(0)}% do corte!`,
        body: `Seu último concurso foi seu melhor desempenho histórico. Cada melhora te aproxima da aprovação.` });
    }
  }

  // 4. Análise de disciplinas
  const discMap = {};
  sorted.forEach(r => {
    (r.disciplinas || []).forEach(d => {
      if (!d.nome || !d.totalQuestoes) return;
      if (!discMap[d.nome]) discMap[d.nome] = [];
      discMap[d.nome].push((d.acertos / d.totalQuestoes) * 100);
    });
  });
  const discNames = Object.keys(discMap);

  if (discNames.length >= 2) {
    const discAvgs = discNames
      .map(n => ({ n, avg: mean(discMap[n]), count: discMap[n].length }))
      .sort((a, b) => a.avg - b.avg);

    const weakest = discAvgs[0];
    const strongest = discAvgs[discAvgs.length - 1];

    if (weakest && weakest.avg < 60 && weakest.count >= 2) {
      insights.push({ id: 'weakest-disc', priority: 8, icon: '⚠️', color: 'var(--coral)',
        title: `${weakest.n}: ponto mais fraco (${weakest.avg.toFixed(0)}%)`,
        body: `Esta disciplina tem a menor média de acerto em seus concursos. Deve ser prioridade no seu plano de estudos.` });
    }

    if (strongest && strongest.avg >= 75 && strongest.count >= 2) {
      insights.push({ id: 'strongest-disc', priority: 5, icon: '⭐', color: 'var(--ciano)',
        title: `${strongest.n}: seu maior destaque (${strongest.avg.toFixed(0)}%)`,
        body: `Você tem performance consistente e forte nesta disciplina. Continue mantendo esse nível.` });
    }

    // Alta variância = inconsistência
    discAvgs.forEach(d => {
      if (discMap[d.n].length < 3) return;
      const variance = mean(discMap[d.n].map(v => Math.pow(v - d.avg, 2)));
      if (Math.sqrt(variance) > 18) {
        insights.push({ id: `inconsistent-${d.n}`, priority: 7, icon: '🎢', color: 'var(--ambar)',
          title: `${d.n}: desempenho muito irregular`,
          body: `Você oscila muito nesta matéria entre concursos. Foque em consolidar o conteúdo base antes de avançar.` });
      }
    });

    // Disciplina em forte evolução
    if (sorted.length >= 4) {
      discAvgs.forEach(d => {
        const vals = discMap[d.n];
        if (vals.length < 4) return;
        const early = mean(vals.slice(0, Math.ceil(vals.length / 2)));
        const late = mean(vals.slice(Math.floor(vals.length / 2)));
        if (late - early > 12) {
          insights.push({ id: `improved-${d.n}`, priority: 6, icon: '📈', color: 'var(--esmeralda)',
            title: `${d.n} em forte evolução (+${(late - early).toFixed(0)}pp)`,
            body: `Seu esforço nesta disciplina está se traduzindo em resultados. Mantenha a consistência!` });
        }
      });
    }
  }

  // 5. Comparação por banca
  if (sorted.length >= 4) {
    const bancaMap = {};
    sorted.forEach((r, i) => {
      if (!r.banca) return;
      if (!bancaMap[r.banca]) bancaMap[r.banca] = [];
      bancaMap[r.banca].push(pcts[i]);
    });
    const bancas = Object.keys(bancaMap).filter(b => bancaMap[b].length >= 2);
    if (bancas.length >= 2) {
      const bancaAvgs = bancas.map(b => ({ b, avg: mean(bancaMap[b]) })).sort((a, b) => b.avg - a.avg);
      const best = bancaAvgs[0], worst = bancaAvgs[bancaAvgs.length - 1];
      if (best.avg - worst.avg > 8) {
        insights.push({ id: 'best-banca', priority: 6, icon: '🏛️', color: 'var(--tinta)',
          title: `Você se sai melhor em ${best.b} (${best.avg.toFixed(0)}%)`,
          body: `Diferença de ${(best.avg - worst.avg).toFixed(0)}pp em relação à ${worst.b}. Pode indicar um estilo de prova mais favorável.` });
      }
    }
  }

  // 6. Projeção para o corte
  if (sorted.length >= 3 && lastPct < 100) {
    const recentDelta = pcts.length >= 2 ? pcts[pcts.length - 1] - pcts[pcts.length - 2] : 0;
    if (recentDelta > 0) {
      const needed = Math.ceil((100 - lastPct) / recentDelta);
      if (needed >= 1 && needed <= 8) {
        insights.push({ id: 'projection', priority: 5, icon: '🔭', color: 'var(--ciano)',
          title: `Projeção: ~${needed} concurso${needed > 1 ? 's' : ''} para o corte`,
          body: `No ritmo atual (+${recentDelta.toFixed(1)}pp por concurso), você deve cruzar o corte em aproximadamente ${needed} concurso${needed > 1 ? 's' : ''}.` });
      }
    }
  }

  return insights.sort((a, b) => b.priority - a.priority).slice(0, 5);
}

// ── Formulário de Registro ──────────────────────────────────

function AddConcursoDesempModal({ open, onClose, onSave }) {
  const EMPTY = { nome: '', orgao: '', banca: '', data: '', corte: '', notaTotal: '', disciplinas: [], observacoes: '' };
  const [form, setForm] = React.useState(EMPTY);

  React.useEffect(() => {
    if (open) setForm({ ...EMPTY, data: new Date().toISOString().slice(0, 10) });
  }, [open]);

  if (!open) return null;

  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addDisc = () => setForm(f => ({ ...f, disciplinas: [...f.disciplinas, { nome: '', totalQuestoes: '', acertos: '' }] }));
  const rmDisc = (i) => setForm(f => ({ ...f, disciplinas: f.disciplinas.filter((_, k) => k !== i) }));
  const sdDisc = (i, k, v) => setForm(f => {
    const d = [...f.disciplinas];
    d[i] = { ...d[i], [k]: v };
    return { ...f, disciplinas: d };
  });

  const notaNum = parseFloat(form.notaTotal) || 0;
  const corteNum = parseFloat(form.corte) || 0;
  const pctPreview = corteNum > 0 ? calcPctCorte(notaNum, corteNum) : null;
  const sitPreview = pctPreview !== null ? getSituacao(pctPreview) : null;
  const isValid = form.nome.trim() && form.banca && form.data && corteNum > 0 && form.notaTotal !== '';

  const handleSave = () => {
    if (!isValid) return;
    onSave({
      id: 'cde_' + Date.now(),
      nome: form.nome.trim(),
      orgao: form.orgao.trim(),
      banca: form.banca,
      data: form.data,
      corte: corteNum,
      notaTotal: notaNum,
      disciplinas: form.disciplinas
        .filter(d => d.nome.trim())
        .map(d => ({
          nome: d.nome.trim(),
          totalQuestoes: parseInt(d.totalQuestoes) || 0,
          acertos: parseInt(d.acertos) || 0,
        })),
      observacoes: form.observacoes.trim(),
    });
    onClose();
  };

  const inp = {
    width: '100%', padding: '9px 12px', borderRadius: 10, boxSizing: 'border-box',
    border: '1px solid rgba(30,32,48,0.12)', background: 'rgba(255,255,255,0.85)',
    fontSize: 13, color: 'var(--text-primary)', outline: 'none', fontFamily: 'Inter, sans-serif',
  };
  const lbl = {
    fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em',
    textTransform: 'uppercase', marginBottom: 5, display: 'block', fontFamily: 'JetBrains Mono, monospace',
  };
  const sec = {
    fontSize: 9, letterSpacing: '0.2em', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono',
    fontWeight: 700, marginBottom: 12, marginTop: 20, paddingBottom: 6,
    borderBottom: '1px solid rgba(30,32,48,0.07)',
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 90,
      background: 'rgba(30,32,48,0.45)', backdropFilter: 'blur(10px)',
      display: 'grid', placeItems: 'center', padding: 24,
      animation: 'fade-in 250ms ease-out', overflowY: 'auto',
    }}>
      <div onClick={e => e.stopPropagation()} className="glass-strong anim-slide-up"
        style={{ width: '100%', maxWidth: 560, padding: 28, borderRadius: 22, position: 'relative', maxHeight: '92vh', overflowY: 'auto' }}>

        <button onClick={onClose} className="btn-ghost" style={{ position: 'absolute', top: 16, right: 16 }}>
          <I.close size={13} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.25em', color: 'var(--tinta)', fontFamily: 'JetBrains Mono', fontWeight: 800 }}>
            DESEMPENHO EM CONCURSOS
          </div>
          <div className="font-display gradient-neon" style={{ fontSize: 21, fontWeight: 700, marginTop: 4 }}>
            Registrar concurso 🏛️
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
            Quanto mais detalhado o registro, melhores os insights gerados.
          </div>
        </div>

        {/* Preview em tempo real */}
        {pctPreview !== null && sitPreview && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '12px 16px', borderRadius: 12, marginBottom: 20,
            background: `${sitPreview.colorRaw}12`, border: `1px solid ${sitPreview.colorRaw}30`,
          }}>
            <div style={{ fontSize: 24 }}>{sitPreview.icon}</div>
            <div>
              <div className="num" style={{ fontSize: 26, fontWeight: 800, color: sitPreview.color, lineHeight: 1 }}>
                {pctPreview.toFixed(1)}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {sitPreview.label} ·{' '}
                {notaNum - corteNum >= 0 ? '+' : ''}{(notaNum - corteNum).toFixed(1)} pts em relação ao corte
              </div>
            </div>
          </div>
        )}

        {/* Identificação */}
        <div style={sec}>IDENTIFICAÇÃO</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 4 }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={lbl}>Nome do concurso *</label>
            <input style={inp} placeholder="Ex: Analista Judiciário TRF5" value={form.nome}
              onChange={e => sf('nome', e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Órgão</label>
            <input style={inp} placeholder="Ex: TRF 5ª Região" value={form.orgao}
              onChange={e => sf('orgao', e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Banca *</label>
            <select style={inp} value={form.banca} onChange={e => sf('banca', e.target.value)}>
              <option value="">Selecionar...</option>
              {DESEMP_BANCAS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Data da prova *</label>
            <input style={inp} type="date" value={form.data} onChange={e => sf('data', e.target.value)} />
          </div>
        </div>

        {/* Notas */}
        <div style={sec}>NOTAS E CORTE</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 4 }}>
          <div>
            <label style={lbl}>Sua nota total *</label>
            <input style={inp} type="number" min="0" step="0.1" placeholder="Ex: 68.5" value={form.notaTotal}
              onChange={e => sf('notaTotal', e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Nota de corte *</label>
            <input style={inp} type="number" min="0" step="0.1" placeholder="Ex: 72.0" value={form.corte}
              onChange={e => sf('corte', e.target.value)} />
          </div>
        </div>

        {/* Disciplinas */}
        <div style={{ ...sec, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>DISCIPLINAS (opcional · +XP extra)</span>
          <button onClick={addDisc} className="btn-ghost" style={{ fontSize: 11, padding: '3px 10px' }}>
            + Adicionar
          </button>
        </div>
        {form.disciplinas.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 28px', gap: 8 }}>
              {['DISCIPLINA', 'QUESTÕES', 'ACERTOS', ''].map((h, i) => (
                <div key={i} style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono', fontWeight: 600, textAlign: i > 0 ? 'center' : 'left' }}>{h}</div>
              ))}
            </div>
            {form.disciplinas.map((d, i) => {
              const pDisc = d.totalQuestoes > 0 ? ((parseInt(d.acertos) || 0) / parseInt(d.totalQuestoes)) * 100 : null;
              const dColor = pDisc !== null ? (pDisc >= 75 ? '#00A86B' : pDisc >= 60 ? '#00B8D4' : pDisc >= 50 ? '#F59E0B' : '#E85D5D') : null;
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 28px', gap: 8, alignItems: 'center' }}>
                  <input style={{ ...inp, padding: '7px 10px' }} placeholder="Direito Constitucional"
                    value={d.nome} onChange={e => sdDisc(i, 'nome', e.target.value)} />
                  <input style={{ ...inp, padding: '7px 10px', textAlign: 'center' }} type="number" min="0"
                    placeholder="20" value={d.totalQuestoes} onChange={e => sdDisc(i, 'totalQuestoes', e.target.value)} />
                  <input style={{ ...inp, padding: '7px 10px', textAlign: 'center', ...(dColor ? { color: dColor, fontWeight: 700 } : {}) }}
                    type="number" min="0" placeholder="15" value={d.acertos} onChange={e => sdDisc(i, 'acertos', e.target.value)} />
                  <button onClick={() => rmDisc(i)} className="btn-ghost"
                    style={{ padding: 0, width: 28, height: 28, display: 'grid', placeItems: 'center', opacity: 0.5, fontSize: 13 }}>✕</button>
                </div>
              );
            })}
          </div>
        )}

        {/* Observações */}
        <div style={sec}>OBSERVAÇÕES</div>
        <textarea style={{ ...inp, height: 76, resize: 'vertical', lineHeight: 1.5 }}
          placeholder="Como foi a prova? Dificuldades, pontos de atenção, sensações..."
          value={form.observacoes} onChange={e => sf('observacoes', e.target.value)} />

        {/* Gamificação preview */}
        {isValid && (
          <div style={{
            marginTop: 14, padding: '10px 14px', borderRadius: 10,
            background: 'rgba(0,184,212,0.06)', border: '1px solid rgba(0,184,212,0.18)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 16 }}>⚡</span>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Você vai ganhar {30 + (form.disciplinas.filter(d => d.nome.trim()).length >= 3 ? 10 : 0) + (form.observacoes.trim().length > 10 ? 5 : 0) + (pctPreview !== null && pctPreview >= 100 ? 60 : pctPreview !== null && pctPreview >= 93 ? 25 : 0)}&nbsp;
              <strong style={{ color: 'var(--ciano)' }}>XP</strong> por este registro.
            </div>
          </div>
        )}

        <button onClick={handleSave} disabled={!isValid} className="btn-neon" style={{
          width: '100%', justifyContent: 'center', marginTop: 18, padding: '13px 20px', fontSize: 14,
          background: isValid ? 'linear-gradient(135deg, var(--petroleo), var(--ciano))' : 'rgba(30,32,48,0.07)',
          borderColor: 'transparent', color: isValid ? 'white' : 'var(--text-dim)',
          cursor: isValid ? 'pointer' : 'not-allowed', transition: 'all 200ms ease',
        }}>
          <I.check size={14} stroke={2.5} /> Salvar registro
        </button>
      </div>
    </div>
  );
}

// ── Aba Principal ───────────────────────────────────────────

function DesempenhoTab({ shared, onAddDesempenho, onRemoveDesempenho }) {
  const records = shared.desempenho || [];
  const sorted = [...records].sort((a, b) => b.data.localeCompare(a.data));

  const [formOpen, setFormOpen] = React.useState(false);
  const [filterBanca, setFilterBanca] = React.useState('');
  const [expandedId, setExpandedId] = React.useState(null);
  const [activeSection, setActiveSection] = React.useState('evolucao');
  const [selectedDiscs, setSelectedDiscs] = React.useState([]);

  const allDiscs = React.useMemo(() => {
    const s = new Set();
    records.forEach(r => (r.disciplinas || []).forEach(d => d.nome && s.add(d.nome)));
    return Array.from(s);
  }, [records]);

  const allBancas = React.useMemo(() => {
    const s = new Set(records.map(r => r.banca).filter(Boolean));
    return Array.from(s);
  }, [records]);

  const pcts = records.map(r => calcPctCorte(r.notaTotal, r.corte));
  const avgPct = pcts.length > 0 ? mean(pcts) : 0;
  const bestPct = pcts.length > 0 ? Math.max(...pcts) : 0;
  const lastRecord = sorted[0] || null;
  const lastPct = lastRecord ? calcPctCorte(lastRecord.notaTotal, lastRecord.corte) : 0;
  const trend = pcts.length >= 2
    ? pcts[pcts.length - 1] - pcts[pcts.length - 2]
    : null;

  const insights = React.useMemo(() => computeDesempenhoInsights(records), [records]);
  const bancaRecords = filterBanca ? records.filter(r => r.banca === filterBanca) : records;

  const SECTION_TABS = [
    { id: 'evolucao',    label: '📈 Evolução Geral',    color: 'var(--ciano)' },
    { id: 'disciplinas', label: '📚 Por Disciplina',    color: 'var(--tinta)' },
    { id: 'banca',       label: '🏛️ Por Banca',        color: 'var(--esmeralda)' },
  ];

  const summaryItems = records.length > 0 ? [
    { label: 'CONCURSOS',        value: records.length, unit: '',   color: '#00B8D4', sub: records.length === 1 ? 'registrado' : 'registrados' },
    { label: 'ÚLTIMO',           value: lastPct.toFixed(0), unit: '%', color: lastPct >= 100 ? '#00A86B' : lastPct >= 93 ? '#C9A961' : '#E85D5D', sub: 'do corte' },
    { label: 'MÉDIA HISTÓRICA',  value: avgPct.toFixed(0), unit: '%', color: '#5B47B8', sub: 'do corte' },
    { label: 'MELHOR RESULTADO', value: bestPct.toFixed(0), unit: '%', color: '#C9A961', sub: 'do corte' },
    ...(trend !== null ? [{ label: 'TENDÊNCIA', value: `${trend >= 0 ? '+' : ''}${trend.toFixed(1)}`, unit: 'pp', color: trend >= 0 ? '#00A86B' : '#E85D5D', sub: 'vs anterior' }] : []),
  ] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--petroleo)' }}>
            Desempenho <span style={{ color: 'var(--ciano)' }}>· Concursos</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Registre resultados reais e acompanhe sua evolução em direção ao corte.
          </div>
        </div>
        <button onClick={() => setFormOpen(true)} className="btn-neon" style={{
          padding: '9px 18px', fontSize: 13,
          background: 'linear-gradient(135deg, var(--petroleo), var(--ciano))',
          borderColor: 'transparent', color: 'white',
        }}>
          <I.plus size={13} stroke={2.5} /> Registrar concurso
        </button>
      </div>

      {/* ── Empty state ── */}
      {records.length === 0 && (
        <div className="glass anim-slide-up" style={{ padding: 44, textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🏛️</div>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'var(--petroleo)', marginBottom: 8 }}>
            Nenhum concurso registrado ainda
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 420, margin: '0 auto 22px', lineHeight: 1.65 }}>
            Registre seus concursos reais para acompanhar sua evolução, descobrir pontos fracos e ver o quanto você se aproxima do corte a cada prova.
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            {['📈 Gráfico de evolução', '🧠 Insights automáticos', '⚡ XP por registro', '🏆 Conquistas por desempenho'].map(f => (
              <span key={f} style={{
                fontSize: 11, color: 'var(--text-muted)', padding: '4px 10px', borderRadius: 20,
                background: 'rgba(0,184,212,0.08)', border: '1px solid rgba(0,184,212,0.18)',
              }}>{f}</span>
            ))}
          </div>
          <button onClick={() => setFormOpen(true)} className="btn-neon" style={{
            padding: '11px 24px', fontSize: 13,
            background: 'linear-gradient(135deg, var(--petroleo), var(--ciano))',
            borderColor: 'transparent', color: 'white',
          }}>
            <I.plus size={14} /> Registrar primeiro concurso
          </button>
        </div>
      )}

      {/* ── Summary Cards ── */}
      {records.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          {summaryItems.map((m, i) => (
            <div key={i} className="glass anim-slide-up" style={{
              padding: '14px 16px', animationDelay: `${i * 50}ms`,
              background: `linear-gradient(145deg, rgba(255,255,255,0.82), rgba(255,255,255,0.55)), radial-gradient(ellipse at 0% 0%, ${m.color}14, transparent 60%)`,
              border: `1px solid ${m.color}22`,
            }}>
              <div style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontWeight: 700, marginBottom: 7 }}>{m.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <span className="num" style={{ fontSize: 26, fontWeight: 800, color: m.color, letterSpacing: '-0.02em', filter: `drop-shadow(0 0 8px ${m.color}44)` }}>{m.value}</span>
                <span className="num" style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 600 }}>{m.unit}</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{m.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Insights ── */}
      {insights.length > 0 && (
        <div className="glass" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontWeight: 700, marginBottom: 12 }}>
            INSIGHTS · {insights.length} AUTOMÁTICOS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 8 }}>
            {insights.map(ins => (
              <div key={ins.id} style={{
                padding: '12px 14px', borderRadius: 12, borderLeft: `3px solid ${ins.color}`,
                background: `linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.4)), radial-gradient(ellipse at 0% 100%, ${ins.color}0a, transparent 60%)`,
                display: 'flex', alignItems: 'flex-start', gap: 12,
              }}>
                <div style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{ins.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: ins.color, marginBottom: 3 }}>{ins.title}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.45 }}>{ins.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Section Switcher ── */}
      {records.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {SECTION_TABS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={activeSection === s.id ? 'btn-neon' : 'btn-ghost'}
              style={{
                padding: '7px 14px', fontSize: 12, fontWeight: 600,
                ...(activeSection === s.id ? {
                  background: `linear-gradient(135deg, ${s.color}20, ${s.color}0c)`,
                  borderColor: `${s.color}55`, color: s.color,
                } : {}),
              }}>
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Seção: Evolução Geral ── */}
      {records.length > 0 && activeSection === 'evolucao' && (
        <div className="glass" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>EVOLUÇÃO GERAL</div>
              <div className="font-display" style={{ fontSize: 16, fontWeight: 700, marginTop: 3 }}>% de proximidade ao corte</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(0,168,107,0.40)' }} />
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>acima do corte</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(232,93,93,0.35)' }} />
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>abaixo do corte</span>
              </div>
            </div>
          </div>
          <CorteEvolutionChart records={records} />
          <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text-dim)', textAlign: 'center', fontFamily: 'JetBrains Mono' }}>
            100% = exatamente no corte · acima de 100% = aprovado
          </div>
        </div>
      )}

      {/* ── Seção: Por Disciplina ── */}
      {records.length > 0 && activeSection === 'disciplinas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Gráfico de linhas */}
          <div className="glass" style={{ padding: '18px 20px' }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>EVOLUÇÃO POR DISCIPLINA</div>
              <div className="font-display" style={{ fontSize: 16, fontWeight: 700, marginTop: 3 }}>% de acerto por matéria</div>
            </div>

            {/* Toggle pills */}
            {allDiscs.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {allDiscs.map((d, i) => {
                  const color = DISC_COLORS[i % DISC_COLORS.length];
                  const active = selectedDiscs.length === 0 || selectedDiscs.includes(d);
                  return (
                    <button key={d} onClick={() => {
                      setSelectedDiscs(s => s.includes(d) ? s.filter(x => x !== d) : [...s, d]);
                    }} style={{
                      padding: '4px 11px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      border: `1px solid ${color}55`, cursor: 'pointer', transition: 'all 150ms ease',
                      background: active ? `${color}18` : 'transparent',
                      color: active ? color : 'var(--text-dim)',
                    }}>{d}</button>
                  );
                })}
                {selectedDiscs.length > 0 && (
                  <button onClick={() => setSelectedDiscs([])} style={{
                    padding: '4px 11px', borderRadius: 20, fontSize: 11,
                    border: '1px solid rgba(30,32,48,0.12)', cursor: 'pointer',
                    background: 'transparent', color: 'var(--text-muted)',
                  }}>Todos</button>
                )}
              </div>
            )}

            <DisciplinaChart records={records} selectedDiscs={selectedDiscs} allDiscs={allDiscs} />
          </div>

          {/* Ranking de disciplinas */}
          {allDiscs.length > 0 && (
            <div className="glass" style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontWeight: 700, marginBottom: 14 }}>
                RANKING DE DISCIPLINAS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(() => {
                  const discStats = allDiscs.map(nome => {
                    const vals = records.flatMap(r => {
                      const d = (r.disciplinas || []).find(x => x.nome === nome);
                      return d && d.totalQuestoes > 0 ? [(d.acertos / d.totalQuestoes) * 100] : [];
                    });
                    return { nome, avg: vals.length > 0 ? mean(vals) : 0, count: vals.length };
                  }).sort((a, b) => b.avg - a.avg);

                  return discStats.map((d, i) => {
                    const color = d.avg >= 75 ? '#00A86B' : d.avg >= 60 ? '#00B8D4' : d.avg >= 50 ? '#F59E0B' : '#E85D5D';
                    const gradients = {
                      '#00A86B': 'linear-gradient(90deg, #00A86B, #00D48A)',
                      '#00B8D4': 'linear-gradient(90deg, #00B8D4, #00D9FF)',
                      '#F59E0B': 'linear-gradient(90deg, #F59E0B, #FFC107)',
                      '#E85D5D': 'linear-gradient(90deg, #E85D5D, #FF7070)',
                    };
                    const badge = i === 0 ? '⭐' : d.avg < 50 ? '⚠️' : null;
                    return (
                      <div key={d.nome}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            {badge && <span style={{ fontSize: 12 }}>{badge}</span>}
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{d.nome}</span>
                            <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono', fontWeight: 600, background: 'rgba(30,32,48,0.06)', padding: '1px 5px', borderRadius: 4 }}>
                              {d.count}×
                            </span>
                          </div>
                          <span className="num" style={{ fontSize: 17, fontWeight: 800, color, filter: `drop-shadow(0 0 6px ${color}44)` }}>
                            {d.avg.toFixed(0)}%
                          </span>
                        </div>
                        <div style={{ height: 5, background: 'rgba(30,32,48,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${d.avg}%`,
                            background: gradients[color] || gradients['#E85D5D'],
                            borderRadius: 99, transition: 'width 700ms cubic-bezier(0.16,1,0.3,1)',
                          }} />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Seção: Por Banca ── */}
      {records.length > 0 && activeSection === 'banca' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Filtro */}
          {allBancas.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>FILTRO:</span>
              <button onClick={() => setFilterBanca('')}
                className={!filterBanca ? 'btn-neon' : 'btn-ghost'}
                style={{ fontSize: 11, padding: '5px 12px', ...(filterBanca === '' ? { background: 'rgba(0,184,212,0.12)', borderColor: 'rgba(0,184,212,0.4)', color: 'var(--ciano)' } : {}) }}>
                Todas
              </button>
              {allBancas.map(b => (
                <button key={b} onClick={() => setFilterBanca(b === filterBanca ? '' : b)}
                  className={filterBanca === b ? 'btn-neon' : 'btn-ghost'}
                  style={{ fontSize: 11, padding: '5px 12px', ...(filterBanca === b ? { background: 'rgba(0,168,107,0.12)', borderColor: 'rgba(0,168,107,0.4)', color: 'var(--esmeralda)' } : {}) }}>
                  {b}
                </button>
              ))}
            </div>
          )}

          {/* Cards por banca */}
          {allBancas.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 10 }}>
              {allBancas.map(banca => {
                const br = records.filter(r => r.banca === banca);
                const bp = br.map(r => calcPctCorte(r.notaTotal, r.corte));
                const bAvg = bp.length > 0 ? mean(bp) : 0;
                const bBest = bp.length > 0 ? Math.max(...bp) : 0;
                const bColor = bAvg >= 100 ? '#00A86B' : bAvg >= 93 ? '#C9A961' : bAvg >= 80 ? '#00B8D4' : '#E85D5D';
                const isSelected = filterBanca === banca;
                return (
                  <div key={banca} className="glass" onClick={() => setFilterBanca(banca === filterBanca ? '' : banca)}
                    style={{
                      padding: '14px 16px', cursor: 'pointer',
                      border: isSelected ? `1px solid ${bColor}44` : undefined,
                      background: isSelected ? `linear-gradient(145deg, rgba(255,255,255,0.85), rgba(255,255,255,0.6)), radial-gradient(ellipse at 0% 0%, ${bColor}14, transparent 60%)` : undefined,
                      transition: 'all 150ms ease',
                    }}>
                    <div style={{ fontSize: 9, letterSpacing: '0.1em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontWeight: 700, marginBottom: 8 }}>{banca.toUpperCase()}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                      <span className="num" style={{ fontSize: 28, fontWeight: 800, color: bColor, filter: `drop-shadow(0 0 8px ${bColor}44)` }}>{bAvg.toFixed(0)}%</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>média</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                      {br.length} concurso{br.length > 1 ? 's' : ''} · melhor: <strong style={{ color: bColor }}>{bBest.toFixed(0)}%</strong>
                    </div>
                    <div style={{ height: 4, background: 'rgba(30,32,48,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${Math.min(100, bAvg)}%`,
                        background: bAvg >= 100 ? 'linear-gradient(90deg, #00A86B, #00D48A)' :
                          bAvg >= 93 ? 'linear-gradient(90deg, #C9A961, #E8C97A)' :
                          'linear-gradient(90deg, #00B8D4, #00A86B)',
                        borderRadius: 99, transition: 'width 700ms cubic-bezier(0.16,1,0.3,1)',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Gráfico da banca selecionada */}
          {filterBanca && bancaRecords.length > 0 && (
            <div className="glass" style={{ padding: '18px 20px' }}>
              <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontWeight: 700, marginBottom: 4 }}>
                EVOLUÇÃO EM {filterBanca.toUpperCase()}
              </div>
              <div className="font-display" style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
                % do corte nos concursos desta banca
              </div>
              <CorteEvolutionChart records={bancaRecords} />
            </div>
          )}

          {allBancas.length === 0 && (
            <div className="glass" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Registre ao menos um concurso com banca para ver esta análise.
            </div>
          )}
        </div>
      )}

      {/* ── Histórico de Registros ── */}
      {records.length > 0 && (
        <div className="glass" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.22em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontWeight: 700, marginBottom: 12 }}>
            HISTÓRICO · {records.length} CONCURSO{records.length > 1 ? 'S' : ''}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sorted.map((r) => {
              const pct = calcPctCorte(r.notaTotal, r.corte);
              const sit = getSituacao(pct);
              const isExp = expandedId === r.id;

              return (
                <div key={r.id} className="glass" onClick={() => setExpandedId(isExp ? null : r.id)}
                  style={{
                    padding: '14px 16px', cursor: 'pointer',
                    border: `1px solid ${sit.colorRaw}20`,
                    background: `linear-gradient(135deg, rgba(255,255,255,0.65), rgba(255,255,255,0.45)), radial-gradient(ellipse at 100% 0%, ${sit.colorRaw}0a, transparent 60%)`,
                    transition: 'all 150ms ease',
                  }}>

                  {/* Row principal */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Badge % */}
                    <div style={{
                      minWidth: 52, textAlign: 'center', padding: '6px 8px', borderRadius: 10, flexShrink: 0,
                      background: `${sit.colorRaw}14`, border: `1px solid ${sit.colorRaw}30`,
                    }}>
                      <div className="num" style={{ fontSize: 16, fontWeight: 800, color: sit.color, lineHeight: 1 }}>{pct.toFixed(0)}%</div>
                      <div style={{ fontSize: 7.5, color: sit.color, fontFamily: 'JetBrains Mono', fontWeight: 700, marginTop: 1 }}>CORTE</div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.nome}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        {r.banca && (
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontWeight: 600, background: 'rgba(30,32,48,0.06)', padding: '2px 6px', borderRadius: 5 }}>
                            {r.banca}
                          </span>
                        )}
                        {r.orgao && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.orgao}</span>}
                      </div>
                    </div>

                    {/* Nota */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>
                        <span style={{ color: sit.color, fontWeight: 800 }}>{r.notaTotal}</span>
                        <span style={{ color: 'var(--text-dim)' }}> / {r.corte}</span>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono', marginTop: 2 }}>{fmtDate(r.data)}</div>
                    </div>

                    <div style={{ color: 'var(--text-dim)', fontSize: 13, transition: 'transform 200ms ease', transform: isExp ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>▾</div>
                  </div>

                  {/* Expanded details */}
                  {isExp && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(30,32,48,0.07)' }}
                      onClick={e => e.stopPropagation()}>

                      {/* Barra de distância ao corte */}
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                          <span>0</span>
                          <span style={{ color: 'var(--dourado)', fontWeight: 700 }}>corte ({r.corte})</span>
                          <span>{(Math.max(r.corte * 1.15, r.notaTotal + 3)).toFixed(0)}</span>
                        </div>
                        <div style={{ height: 8, background: 'rgba(30,32,48,0.06)', borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
                          <div style={{
                            position: 'absolute', left: 0, top: 0, height: '100%',
                            width: `${Math.min(100, (r.notaTotal / Math.max(r.corte * 1.15, r.notaTotal + 3)) * 100)}%`,
                            background: pct >= 100 ? 'linear-gradient(90deg, #00A86B, #00D48A)' : 'linear-gradient(90deg, #E85D5D, #F59E0B)',
                            borderRadius: 99, transition: 'width 700ms cubic-bezier(0.16,1,0.3,1)',
                          }} />
                          <div style={{
                            position: 'absolute', top: 0, height: '100%', width: 2,
                            left: `${(r.corte / Math.max(r.corte * 1.15, r.notaTotal + 3)) * 100}%`,
                            background: 'var(--dourado)',
                          }} />
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
                          {pct >= 100
                            ? <><strong style={{ color: sit.color }}>{r.notaTotal}</strong> — {(r.notaTotal - r.corte).toFixed(1)} pts acima do corte ✅</>
                            : <><strong style={{ color: sit.color }}>{r.notaTotal}</strong> — faltam {(r.corte - r.notaTotal).toFixed(1)} pts para o corte</>
                          }
                        </div>
                      </div>

                      {/* Disciplinas */}
                      {r.disciplinas && r.disciplinas.length > 0 && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono', fontWeight: 700, marginBottom: 10 }}>
                            DISCIPLINAS
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                            {r.disciplinas.map((d, i) => {
                              const dp = d.totalQuestoes > 0 ? (d.acertos / d.totalQuestoes) * 100 : 0;
                              const dc = dp >= 75 ? '#00A86B' : dp >= 60 ? '#00B8D4' : dp >= 50 ? '#F59E0B' : '#E85D5D';
                              const dg = { '#00A86B': 'linear-gradient(90deg,#00A86B,#00D48A)', '#00B8D4': 'linear-gradient(90deg,#00B8D4,#00D9FF)', '#F59E0B': 'linear-gradient(90deg,#F59E0B,#FFC107)', '#E85D5D': 'linear-gradient(90deg,#E85D5D,#FF7070)' };
                              return (
                                <div key={i}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{d.nome}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono' }}>{d.acertos}/{d.totalQuestoes}</span>
                                      <span className="num" style={{ fontSize: 15, fontWeight: 800, color: dc }}>{dp.toFixed(0)}%</span>
                                    </div>
                                  </div>
                                  <div style={{ height: 4, background: 'rgba(30,32,48,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${dp}%`, background: dg[dc] || dg['#E85D5D'], borderRadius: 99, transition: 'width 600ms cubic-bezier(0.16,1,0.3,1)' }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Observações */}
                      {r.observacoes && (
                        <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(30,32,48,0.035)', border: '1px solid rgba(30,32,48,0.07)', marginBottom: 12 }}>
                          <div style={{ fontSize: 9, letterSpacing: '0.15em', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono', fontWeight: 700, marginBottom: 5 }}>OBSERVAÇÕES</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55 }}>{r.observacoes}</div>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={(e) => { e.stopPropagation(); if (window.confirm('Remover este registro?')) onRemoveDesempenho(r.id); }}
                          className="btn-ghost" style={{ fontSize: 11, color: 'var(--coral)', borderColor: 'rgba(232,93,93,0.3)', background: 'rgba(232,93,93,0.05)', padding: '5px 12px' }}>
                          Remover
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AddConcursoDesempModal open={formOpen} onClose={() => setFormOpen(false)} onSave={onAddDesempenho} />
    </div>
  );
}

window.DesempenhoTab = DesempenhoTab;
