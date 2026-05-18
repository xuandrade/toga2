// TOGA — Aba Desempenho em Concursos

const BANCAS_CONCURSO = ['CESPE/CEBRASPE','FCC','FGV','VUNESP','IBFC','IADES','AOCP','Quadrix','FUNDATEC','FEPESE','NC-UFPR','FAFIPA','Própria','Outra'];

function discPct(d) {
  if (!d || !d.total || d.total <= 0) return 0;
  return Math.min(100, Math.max(0, (d.pontos / d.total) * 100));
}

function discColor(pct) {
  if (pct >= 80) return '#00a86b';
  if (pct >= 65) return '#56c27a';
  if (pct >= 50) return '#f59e0b';
  if (pct >= 35) return '#f97316';
  return '#E85D5D';
}

function calcProvaXp(entry, isNew, prevProvas) {
  if (!isNew) return { xp: 0, kind: null };
  let xp = 20;
  let kind = 'light';
  const discs = (entry.disciplinas || []).filter(d => d.nome && d.total > 0);
  if (discs.length >= 3) xp += 10;
  const passou = entry.pontos >= entry.corte;
  if (passou) { xp += 50; kind = 'victory'; }
  if (prevProvas.length > 0) {
    const myPct = entry.totalProva > 0 ? (entry.pontos / entry.totalProva) * 100 : 0;
    const prevPcts = prevProvas.map(p => p.totalProva > 0 ? (p.pontos / p.totalProva) * 100 : 0);
    if (myPct > Math.max(...prevPcts)) { xp += 30; if (!passou) kind = 'high'; }
    else {
      const lastPct = prevPcts[prevPcts.length - 1] || 0;
      if (myPct > lastPct) xp += 15;
    }
  }
  return { xp, kind };
}

function computeInsights(provas) {
  const out = [];
  if (!provas || provas.length === 0) return out;

  const sorted = [...provas].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sorted[sorted.length - 1];
  const prev = sorted.length >= 2 ? sorted[sorted.length - 2] : null;

  // Tendência de desempenho geral
  if (prev) {
    const lPct = latest.totalProva > 0 ? (latest.pontos / latest.totalProva) * 100 : 0;
    const pPct = prev.totalProva > 0 ? (prev.pontos / prev.totalProva) * 100 : 0;
    const delta = lPct - pPct;
    out.push({
      id: 'trend', icon: delta >= 0 ? '📈' : '📉',
      label: 'Tendência geral',
      value: `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`,
      desc: 'vs concurso anterior',
      color: delta >= 0 ? '#00a86b' : '#E85D5D',
      hl: Math.abs(delta) >= 3,
    });
  }

  // Distância ao corte: melhorando ou piorando?
  if (prev) {
    const lGap = latest.totalProva > 0 ? Math.abs(latest.pontos - latest.corte) / latest.totalProva * 100 : 0;
    const pGap = prev.totalProva > 0 ? Math.abs(prev.pontos - prev.corte) / prev.totalProva * 100 : 0;
    const closer = lGap < pGap;
    out.push({
      id: 'gap', icon: closer ? '🎯' : '⚡',
      label: 'Distância ao corte',
      value: `${lGap.toFixed(1)}%`,
      desc: closer ? '↓ ficou mais próximo' : '↑ ficou mais distante',
      color: closer ? '#00a86b' : '#f59e0b',
      hl: closer,
    });
  }

  // Disciplina map
  const discMap = {};
  provas.forEach(p => {
    (p.disciplinas || []).forEach(d => {
      if (!d.nome || !d.total || d.total <= 0) return;
      const pct = discPct(d);
      if (!discMap[d.nome]) discMap[d.nome] = [];
      discMap[d.nome].push({ pct, date: p.date });
    });
  });
  const discList = Object.entries(discMap)
    .map(([nome, arr]) => ({
      nome, count: arr.length,
      avg: arr.reduce((a, b) => a + b.pct, 0) / arr.length,
      arr: [...arr].sort((a, b) => a.date.localeCompare(b.date)),
    }))
    .sort((a, b) => b.avg - a.avg);

  if (discList.length >= 1) {
    const best = discList[0];
    out.push({
      id: 'best-disc', icon: '⭐',
      label: 'Ponto forte',
      value: `${best.avg.toFixed(0)}%`,
      desc: best.nome.length > 22 ? best.nome.slice(0, 20) + '…' : best.nome,
      color: discColor(best.avg),
    });
  }
  if (discList.length >= 2) {
    const worst = discList[discList.length - 1];
    out.push({
      id: 'worst-disc', icon: '🔴',
      label: 'Ponto crítico',
      value: `${worst.avg.toFixed(0)}%`,
      desc: worst.nome.length > 22 ? worst.nome.slice(0, 20) + '…' : worst.nome,
      color: discColor(worst.avg),
      hl: worst.avg < 50,
    });
  }

  // Maior evolução em disciplina (2+ aparições)
  const evolving = discList
    .filter(d => d.count >= 2)
    .map(d => ({ ...d, delta: d.arr[d.arr.length - 1].pct - d.arr[0].pct }))
    .sort((a, b) => b.delta - a.delta)[0];
  if (evolving && evolving.delta >= 5) {
    out.push({
      id: 'evolving', icon: '🚀',
      label: 'Maior evolução',
      value: `+${evolving.delta.toFixed(0)}%`,
      desc: evolving.nome.length > 22 ? evolving.nome.slice(0, 20) + '…' : evolving.nome,
      color: '#00b8d4',
    });
  }

  // Prioridade de estudo (mais fraca com 2+ aparições)
  const priority = discList.filter(d => d.count >= 2 && d.avg < 65).sort((a, b) => a.avg - b.avg)[0];
  if (priority) {
    out.push({
      id: 'priority', icon: '📚',
      label: 'Prioridade',
      value: `${priority.avg.toFixed(0)}%`,
      desc: priority.nome.length > 22 ? priority.nome.slice(0, 20) + '…' : priority.nome,
      color: discColor(priority.avg),
      hl: true,
    });
  }

  // Melhor banca
  const bancaMap = {};
  provas.forEach(p => {
    if (!p.banca) return;
    const pct = p.corte > 0 ? (p.pontos / p.corte) * 100 : 0;
    if (!bancaMap[p.banca]) bancaMap[p.banca] = [];
    bancaMap[p.banca].push(pct);
  });
  const bancaList = Object.entries(bancaMap)
    .map(([b, pcts]) => ({ b, avg: pcts.reduce((a, c) => a + c, 0) / pcts.length, n: pcts.length }))
    .sort((a, b) => b.avg - a.avg);
  if (bancaList.length >= 1) {
    const top = bancaList[0];
    out.push({
      id: 'banca', icon: '🏛️',
      label: bancaList.length >= 2 ? 'Melhor banca' : 'Sua banca',
      value: `${top.avg.toFixed(0)}%`,
      desc: top.b,
      color: '#00b8d4',
    });
  }

  // Melhor resultado pessoal
  if (sorted.length >= 2) {
    const bestR = [...sorted].sort((a, b) => (b.pontos / b.totalProva) - (a.pontos / a.totalProva))[0];
    const bPct = bestR.totalProva > 0 ? (bestR.pontos / bestR.totalProva) * 100 : 0;
    out.push({
      id: 'pb', icon: '🏆',
      label: 'Melhor resultado',
      value: `${bPct.toFixed(0)}%`,
      desc: bestR.cargo ? (bestR.cargo.length > 22 ? bestR.cargo.slice(0, 20) + '…' : bestR.cargo) : '—',
      color: '#f59e0b',
    });
  }

  return out;
}

// ── ProximityChart ──
function ProximityChart({ provas }) {
  if (provas.length < 2) return null;
  const W = 600, H = 170;
  const PAD = { top: 24, right: 64, bottom: 44, left: 44 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const values = provas.map(p => p.corte > 0 ? (p.pontos / p.corte) * 100 : 0);
  const yMin = Math.floor(Math.min(...values, 90) / 10) * 10;
  const yMax = Math.ceil(Math.max(...values, 105) / 10) * 10;
  const yRange = yMax - yMin || 1;

  const xs = (i) => PAD.left + (i / Math.max(provas.length - 1, 1)) * chartW;
  const ys = (v) => PAD.top + ((yMax - v) / yRange) * chartH;
  const cy = ys(100);

  const pts = provas.map((p, i) => `${xs(i)},${ys(values[i])}`).join(' ');
  const areaAbove = [`${xs(0)},${cy}`, ...provas.map((p, i) => `${xs(i)},${Math.min(ys(values[i]), cy)}`), `${xs(provas.length - 1)},${cy}`].join(' ');
  const areaBelow = [`${xs(0)},${cy}`, ...provas.map((p, i) => `${xs(i)},${Math.max(ys(values[i]), cy)}`), `${xs(provas.length - 1)},${cy}`].join(' ');

  const ticks = [];
  for (let v = yMin; v <= yMax; v += 10) ticks.push(v);

  const fmtDate = (p) => new Date(p.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, display: 'block' }}>
        <defs>
          <clipPath id="cdp-clip-above">
            <rect x={PAD.left} y={PAD.top} width={chartW} height={Math.max(0, cy - PAD.top)} />
          </clipPath>
          <clipPath id="cdp-clip-below">
            <rect x={PAD.left} y={cy} width={chartW} height={Math.max(0, H - PAD.bottom - cy)} />
          </clipPath>
        </defs>
        {ticks.map(v => (
          <g key={v}>
            <line x1={PAD.left} y1={ys(v)} x2={W - PAD.right} y2={ys(v)}
              stroke={v === 100 ? 'rgba(245,158,11,0.35)' : 'rgba(30,32,48,0.06)'}
              strokeWidth={v === 100 ? 1.5 : 1} strokeDasharray={v === 100 ? '6,4' : undefined} />
            <text x={PAD.left - 5} y={ys(v) + 4} fontSize="10" fill="rgba(30,32,48,0.38)"
              textAnchor="end" fontFamily="JetBrains Mono, monospace" fontWeight="600">{v}%</text>
          </g>
        ))}
        <polygon points={areaAbove} fill="rgba(0,168,107,0.09)" clipPath="url(#cdp-clip-above)" />
        <polygon points={areaBelow} fill="rgba(232,93,93,0.09)" clipPath="url(#cdp-clip-below)" />
        <text x={W - PAD.right + 5} y={cy + 4} fontSize="9.5" fill="rgba(245,158,11,0.85)"
          fontFamily="JetBrains Mono, monospace" fontWeight="700">CORTE</text>
        <polyline points={pts} fill="none" stroke="#00b8d4" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />
        {provas.map((p, i) => {
          const passou = p.pontos >= p.corte;
          return (
            <g key={p.id}>
              <circle cx={xs(i)} cy={ys(values[i])} r="5" fill="white"
                stroke={passou ? '#00a86b' : '#E85D5D'} strokeWidth="2.5" />
              <text x={xs(i)} y={H - PAD.bottom + 14} fontSize="9" fill="rgba(30,32,48,0.45)"
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

// ── DisciplineAvgChart: horizontal bars por média de % ──
function DisciplineAvgChart({ provas }) {
  const discMap = {};
  provas.forEach(p => {
    (p.disciplinas || []).forEach(d => {
      if (!d.nome || !d.total || d.total <= 0) return;
      const pct = discPct(d);
      if (!discMap[d.nome]) discMap[d.nome] = [];
      discMap[d.nome].push(pct);
    });
  });
  const entries = Object.entries(discMap)
    .map(([nome, pcts]) => ({
      nome,
      avg: pcts.reduce((a, b) => a + b, 0) / pcts.length,
      min: Math.min(...pcts),
      max: Math.max(...pcts),
      count: pcts.length,
    }))
    .sort((a, b) => b.avg - a.avg);

  if (entries.length === 0) return (
    <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 0' }}>
      Adicione disciplinas ao registrar provas para ver esta análise.
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {entries.map((e, i) => {
        const color = discColor(e.avg);
        const hasRange = e.count >= 2 && e.max - e.min >= 2;
        return (
          <div key={e.nome}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ flex: 1, fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {e.nome}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                <span className="num" style={{ fontSize: 12, fontWeight: 800, color, fontFamily: 'JetBrains Mono, monospace' }}>
                  {e.avg.toFixed(0)}%
                </span>
                {hasRange && (
                  <span style={{ fontSize: 9.5, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                    ({e.min.toFixed(0)}–{e.max.toFixed(0)}%)
                  </span>
                )}
                {e.count >= 2 && (
                  <span style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                    · {e.count}×
                  </span>
                )}
              </span>
            </div>
            <div style={{ position: 'relative', height: 8, background: 'rgba(30,32,48,0.07)', borderRadius: 99 }}>
              {hasRange && (
                <div style={{
                  position: 'absolute', top: 0, bottom: 0,
                  left: `${e.min}%`, width: `${e.max - e.min}%`,
                  background: `${color}20`, borderRadius: 99,
                }} />
              )}
              <div style={{
                height: '100%', width: `${e.avg}%`,
                background: `linear-gradient(90deg, ${color}80, ${color})`,
                borderRadius: 99,
                boxShadow: `0 0 8px ${color}44`,
                transition: `width 700ms ${i * 50}ms cubic-bezier(0.16,1,0.3,1)`,
              }} />
            </div>
          </div>
        );
      })}
      <div style={{ fontSize: 9.5, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, marginTop: 4, letterSpacing: '0.06em' }}>
        BARRA CINZA = FAIXA (mín–máx) · BARRA COLORIDA = MÉDIA
      </div>
    </div>
  );
}

// ── DisciplineEvolutionTable: tabela comparativa por concurso ──
function DisciplineEvolutionTable({ provas }) {
  const { useState: useSt } = React;
  // Only show disciplines that appear in 2+ provas
  const discMap = {};
  provas.forEach(p => {
    (p.disciplinas || []).forEach(d => {
      if (!d.nome || !d.total || d.total <= 0) return;
      if (!discMap[d.nome]) discMap[d.nome] = new Set();
      discMap[d.nome].add(p.id);
    });
  });
  const multiDiscs = Object.entries(discMap)
    .filter(([, ids]) => ids.size >= 2)
    .map(([nome]) => nome)
    .sort();

  if (multiDiscs.length === 0 || provas.length < 2) return null;

  // Last 5 contests max, chronological
  const cols = [...provas].sort((a, b) => a.date.localeCompare(b.date)).slice(-5);

  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 10 }}>
        EVOLUÇÃO POR DISCIPLINA
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '6px 10px 6px 0', fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap', minWidth: 130 }}>
                DISCIPLINA
              </th>
              {cols.map(p => (
                <th key={p.id} style={{ textAlign: 'center', padding: '6px 8px', fontSize: 9.5, color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>
                  {new Date(p.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  <div style={{ fontSize: 9, opacity: 0.65, fontWeight: 600, marginTop: 1 }}>
                    {(p.orgao || p.cargo || '').slice(0, 8)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {multiDiscs.map(nome => (
              <tr key={nome} style={{ borderTop: '1px solid rgba(30,32,48,0.06)' }}>
                <td style={{ padding: '7px 10px 7px 0', fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                  {nome.length > 24 ? nome.slice(0, 22) + '…' : nome}
                </td>
                {cols.map(p => {
                  const d = (p.disciplinas || []).find(x => x.nome === nome);
                  if (!d) return <td key={p.id} style={{ textAlign: 'center', padding: '7px 8px', color: 'var(--text-dim)', fontSize: 11 }}>—</td>;
                  const pct = discPct(d);
                  const color = discColor(pct);
                  return (
                    <td key={p.id} style={{ textAlign: 'center', padding: '7px 8px' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: 99,
                        background: `${color}16`, color, fontWeight: 800,
                        fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
                      }}>
                        {pct.toFixed(0)}%
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── InsightsPanel ──
function ConcursosInsightsPanel({ provas }) {
  const insights = computeInsights(provas);
  if (insights.length === 0) return null;

  return (
    <div className="glass anim-slide-up" style={{ padding: '18px 20px', marginBottom: 20 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 12 }}>
        INSIGHTS AUTOMÁTICOS
      </div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
        {insights.map(ins => (
          <div key={ins.id} style={{
            flexShrink: 0, width: 150, padding: '14px 14px 12px',
            borderRadius: 14,
            background: ins.hl
              ? `linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.75))`
              : `linear-gradient(145deg, rgba(255,255,255,0.85), rgba(255,255,255,0.6))`,
            border: `1px solid ${ins.color}28`,
            boxShadow: ins.hl ? `0 3px 14px ${ins.color}1e` : 'none',
          }}>
            <div style={{ fontSize: 22, marginBottom: 6, lineHeight: 1 }}>{ins.icon}</div>
            <div className="num" style={{ fontSize: 22, fontWeight: 800, color: ins.color, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {ins.value}
            </div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', marginTop: 4, textTransform: 'uppercase' }}>
              {ins.label}
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--text-dim)', fontWeight: 600, marginTop: 3, lineHeight: 1.3 }}>
              {ins.desc}
            </div>
          </div>
        ))}
      </div>
      <style>{`.cdp-insights::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}

// ── ProvaCard ──
function ProvaCard({ p, onEdit, onRemove }) {
  const { useState: useSt } = React;
  const [showDiscs, setShowDiscs] = useSt(true);

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

  const discs = [...(p.disciplinas || [])].sort((a, b) => discPct(b) - discPct(a));

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
            flexShrink: 0, minWidth: 68, padding: '8px 10px', borderRadius: 10, textAlign: 'center',
            background: passou ? 'rgba(0,168,107,0.10)' : 'rgba(232,93,93,0.10)',
            border: `1px solid ${passou ? 'rgba(0,168,107,0.28)' : 'rgba(232,93,93,0.28)'}`,
          }}>
            <div className="num" style={{ fontSize: 19, fontWeight: 800, color: passou ? GREEN : CORAL, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              {gapPct.toFixed(0)}<span style={{ fontSize: 10, fontWeight: 700 }}>%</span>
            </div>
            <div style={{ fontSize: 8, color: passou ? GREEN : CORAL, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '0.04em', marginTop: 3, lineHeight: 1.3, textTransform: 'uppercase', opacity: 0.9 }}>
              {passou ? 'acima' : 'abaixo'}<br />do corte
            </div>
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="font-display" style={{ fontSize: 16, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {p.cargo}
            </div>
            <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
              {p.banca && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', padding: '2px 7px', borderRadius: 99, background: 'rgba(30,32,48,0.06)' }}>{p.banca}</span>}
              {p.orgao && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', padding: '2px 7px', borderRadius: 99, background: 'rgba(30,32,48,0.06)' }}>{p.orgao}</span>}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div>
            <span className="num" style={{ fontSize: 20, fontWeight: 800, color: passou ? GREEN : CORAL }}>{pontos}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}> / {totalProva}</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, marginTop: 2 }}>
            {pctDesempenho.toFixed(0)}% de desempenho
          </div>
          {dateStr && <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, marginTop: 2 }}>{dateStr}</div>}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, marginBottom: 4 }}>
          <span>0</span>
          <span style={{ color: passou ? GREEN : AMBER, fontWeight: 700 }}>corte ({corte})</span>
          <span>{totalProva}</span>
        </div>
        <div style={{ position: 'relative', height: 10, background: 'rgba(30,32,48,0.07)', borderRadius: 99 }}>
          <div style={{
            height: '100%', width: `${pontosW}%`,
            background: passou ? `linear-gradient(90deg, ${AMBER}, ${GREEN})` : `linear-gradient(90deg, ${CORAL}, ${AMBER})`,
            borderRadius: 99,
            transition: 'width 600ms cubic-bezier(0.16,1,0.3,1)',
          }} />
          <div style={{
            position: 'absolute', top: -3, bottom: -3, left: `${corteW}%`,
            width: 2.5, background: passou ? GREEN : AMBER,
            transform: 'translateX(-50%)', borderRadius: 99,
            boxShadow: `0 0 6px ${passou ? GREEN : AMBER}99`,
          }} />
        </div>
      </div>

      {/* Points gap */}
      <div style={{ fontSize: 12, marginTop: 8, fontFamily: 'JetBrains Mono, monospace' }}>
        <span className="num" style={{ fontWeight: 800, color: passou ? GREEN : CORAL }}>{pontos}</span>
        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
          {passou
            ? ` — ${Math.abs(gapPts).toFixed(1)} pts acima do corte`
            : ` — faltam ${Math.abs(gapPts).toFixed(1)} pts para o corte`}
        </span>
      </div>

      {/* Disciplines */}
      {discs.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <button
            onClick={() => setShowDiscs(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6, marginBottom: showDiscs ? 10 : 0 }}>
            <span style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, textTransform: 'uppercase' }}>
              DESEMPENHO POR DISCIPLINA
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, transform: showDiscs ? 'none' : 'rotate(-90deg)', display: 'inline-block', transition: 'transform 200ms' }}>▾</span>
          </button>
          {showDiscs && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {discs.map((d, i) => {
                const pct = discPct(d);
                const color = discColor(pct);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      flex: '0 0 8px', height: 8, width: 8, borderRadius: 2,
                      background: color, flexShrink: 0,
                      boxShadow: `0 0 5px ${color}66`,
                    }} />
                    <div style={{ flex: 1, fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.nome}
                    </div>
                    <div style={{ flex: '0 0 80px', position: 'relative', height: 6, background: 'rgba(30,32,48,0.07)', borderRadius: 99 }}>
                      <div style={{
                        height: '100%', width: `${pct}%`,
                        background: `linear-gradient(90deg, ${color}80, ${color})`,
                        borderRadius: 99,
                        transition: `width 600ms ${i * 40}ms cubic-bezier(0.16,1,0.3,1)`,
                      }} />
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right', minWidth: 72 }}>
                      <span className="num" style={{ fontSize: 12, fontWeight: 800, color, fontFamily: 'JetBrains Mono, monospace' }}>{pct.toFixed(0)}%</span>
                      <span style={{ fontSize: 9.5, color: 'var(--text-dim)', fontWeight: 600, marginLeft: 5 }}>{d.pontos}/{d.total}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Observações */}
      {p.observacoes && (
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', borderLeft: '2px solid rgba(30,32,48,0.1)', paddingLeft: 10 }}>
          {p.observacoes}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button className="btn-ghost" onClick={onEdit} style={{ fontSize: 11, padding: '5px 12px' }}>✏️ Editar</button>
        <button className="btn-ghost" onClick={() => { if (window.confirm('Remover este registro?')) onRemove(); }}
          style={{ fontSize: 11, padding: '5px 12px', color: 'var(--coral)', borderColor: 'rgba(232,93,93,0.3)' }}>
          ✕ Remover
        </button>
      </div>
    </div>
  );
}

// ── ConcursosDesempenhoTab ──
function ConcursosDesempenhoTab({ provas, setProvas, onXpGain }) {
  const { useState: useSt } = React;

  const emptyDisc = () => ({ id: Date.now() + Math.random(), nome: '', pontos: '', total: '' });
  const emptyForm = { cargo: '', banca: '', orgao: '', date: '', totalProva: '', pontos: '', corte: '', observacoes: '', disciplinas: [] };

  const [showForm, setShowForm] = useSt(false);
  const [form, setForm] = useSt(emptyForm);
  const [editId, setEditId] = useSt(null);
  const [formError, setFormError] = useSt('');
  const [bancaFilter, setBancaFilter] = useSt(null);

  const setF = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const addDisc = () => setForm(f => ({ ...f, disciplinas: [...f.disciplinas, emptyDisc()] }));
  const updateDisc = (id, field, val) => setForm(f => ({
    ...f, disciplinas: f.disciplinas.map(d => d.id === id ? { ...d, [field]: val } : d),
  }));
  const removeDisc = (id) => setForm(f => ({ ...f, disciplinas: f.disciplinas.filter(d => d.id !== id) }));

  const openNew = () => { setForm(emptyForm); setEditId(null); setFormError(''); setShowForm(true); };
  const openEdit = (p) => {
    setForm({
      cargo: p.cargo, banca: p.banca || '', orgao: p.orgao || '',
      date: p.date, totalProva: String(p.totalProva), pontos: String(p.pontos),
      corte: String(p.corte), observacoes: p.observacoes || '',
      disciplinas: (p.disciplinas || []).map(d => ({ id: Date.now() + Math.random(), nome: d.nome, pontos: String(d.pontos), total: String(d.total) })),
    });
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
    if (p > t) { setFormError('Pontos obtidos > total da prova.'); return; }
    if (c > t) { setFormError('Nota de corte > total da prova.'); return; }

    const cleanDiscs = form.disciplinas
      .filter(d => d.nome.trim() && parseFloat(d.total) > 0)
      .map(d => ({
        nome: d.nome.trim(),
        pontos: Math.min(parseFloat(d.total), Math.max(0, parseFloat(d.pontos) || 0)),
        total: parseFloat(d.total),
      }));

    const entry = {
      id: editId || `prova-${Date.now()}`,
      cargo: form.cargo.trim(), banca: form.banca.trim(),
      orgao: form.orgao.trim(), date: form.date,
      totalProva: t, pontos: p, corte: c,
      observacoes: form.observacoes.trim(),
      disciplinas: cleanDiscs,
    };

    const isNew = !editId;
    if (isNew) {
      const { xp, kind } = calcProvaXp(entry, true, provas);
      setProvas(arr => [...arr, entry]);
      if (xp > 0 && onXpGain) onXpGain(xp, kind);
    } else {
      setProvas(arr => arr.map(x => x.id === editId ? entry : x));
    }
    closeForm();
  };

  const handleRemove = (id) => setProvas(arr => arr.filter(x => x.id !== id));

  const sorted = [...provas].sort((a, b) => b.date.localeCompare(a.date));
  const chronological = [...sorted].reverse();
  const bancas = [...new Set(sorted.map(p => p.banca).filter(Boolean))];
  const filteredProvas = bancaFilter ? sorted.filter(p => p.banca === bancaFilter) : sorted;

  // Suggestions: discipline names used before
  const usedDiscNames = [...new Set(provas.flatMap(p => (p.disciplinas || []).map(d => d.nome).filter(Boolean)))];

  // Live preview
  const prvP = parseFloat(form.pontos);
  const prvC = parseFloat(form.corte);
  const prvT = parseFloat(form.totalProva);
  const showPrev = !isNaN(prvP) && !isNaN(prvC) && !isNaN(prvT) && prvT > 0;
  const prvPassou = prvP >= prvC;
  const prvGapPct = showPrev ? Math.abs(prvP - prvC) / prvT * 100 : 0;
  const prvPctDes = showPrev ? (prvP / prvT) * 100 : 0;

  const inputLabel = (text, req) => (
    <label style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, display: 'block', marginBottom: 4 }}>
      {text}{req && <span style={{ color: 'var(--coral)', marginLeft: 2 }}>*</span>}
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
        <button className="btn-neon" onClick={openNew} style={{ fontSize: 12 }}>+ Registrar prova</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass anim-slide-up" style={{ padding: '20px 22px', marginBottom: 20, border: '1px solid rgba(0,184,212,0.22)', background: 'rgba(0,184,212,0.03)' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 14 }}>
            {editId ? 'EDITAR PROVA' : 'REGISTRAR PROVA ANTERIOR'}
          </div>

          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', marginBottom: 12 }}>
            <div style={{ gridColumn: 'span 2' }}>
              {inputLabel('Cargo / Concurso', true)}
              <input className="input-base" placeholder="ex: Defensor Público" value={form.cargo}
                autoFocus onChange={e => setF('cargo', e.target.value)} style={{ width: '100%' }} />
            </div>
            <div>
              {inputLabel('Banca')}
              <select className="input-base" value={form.banca} onChange={e => setF('banca', e.target.value)} style={{ width: '100%' }}>
                <option value="">Selecionar banca</option>
                {BANCAS_CONCURSO.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              {inputLabel('Órgão')}
              <input className="input-base" placeholder="ex: DPE-BA" value={form.orgao}
                onChange={e => setF('orgao', e.target.value)} style={{ width: '100%' }} />
            </div>
            <div>
              {inputLabel('Data da prova', true)}
              <input className="input-base" type="date" value={form.date}
                onChange={e => setF('date', e.target.value)} style={{ width: '100%' }} />
            </div>
            <div>
              {inputLabel('Total de pontos da prova', true)}
              <input className="input-base" type="number" placeholder="ex: 100" value={form.totalProva}
                onChange={e => setF('totalProva', e.target.value)} style={{ width: '100%' }} />
            </div>
            <div>
              {inputLabel('Pontos obtidos', true)}
              <input className="input-base" type="number" placeholder="ex: 68" value={form.pontos}
                onChange={e => setF('pontos', e.target.value)} style={{ width: '100%' }} />
            </div>
            <div>
              {inputLabel('Nota de corte', true)}
              <input className="input-base" type="number" placeholder="ex: 74" value={form.corte}
                onChange={e => setF('corte', e.target.value)} style={{ width: '100%' }} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              {inputLabel('Observações')}
              <input className="input-base" placeholder="Notas sobre esta prova (opcional)" value={form.observacoes}
                onChange={e => setF('observacoes', e.target.value)} style={{ width: '100%' }} />
            </div>
          </div>

          {/* Live preview */}
          {showPrev && (
            <div className="anim-slide-up" style={{
              padding: '10px 14px', borderRadius: 10, marginBottom: 14,
              background: prvPassou ? 'rgba(0,168,107,0.08)' : 'rgba(232,93,93,0.08)',
              border: `1px solid ${prvPassou ? 'rgba(0,168,107,0.25)' : 'rgba(232,93,93,0.25)'}`,
              display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', fontSize: 12,
            }}>
              <span style={{ fontWeight: 800, color: prvPassou ? '#00a86b' : 'var(--coral)', fontFamily: 'JetBrains Mono, monospace' }}>
                {prvGapPct.toFixed(1)}% {prvPassou ? 'acima do corte' : 'abaixo do corte'}
              </span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                Desempenho: {prvPctDes.toFixed(1)}% &nbsp;·&nbsp; {prvP} / {prvT} pts
              </span>
            </div>
          )}

          {/* Disciplines section */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: form.disciplinas.length > 0 ? 10 : 6 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                DISCIPLINAS <span style={{ opacity: 0.6, fontWeight: 600 }}>(opcional)</span>
              </div>
              <button className="btn-ghost" onClick={addDisc}
                style={{ fontSize: 11, padding: '4px 10px', color: 'var(--ciano)', borderColor: 'rgba(0,184,212,0.3)' }}>
                + Adicionar
              </button>
            </div>

            {/* Suggestions */}
            {usedDiscNames.length > 0 && form.disciplinas.length > 0 && (
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
                <span style={{ fontSize: 9.5, color: 'var(--text-dim)', fontWeight: 600, alignSelf: 'center', fontFamily: 'JetBrains Mono, monospace' }}>SUGESTÕES:</span>
                {usedDiscNames.slice(0, 8).map(name => (
                  <button key={name} onClick={() => {
                    const empty = form.disciplinas.find(d => !d.nome);
                    if (empty) updateDisc(empty.id, 'nome', name);
                    else setForm(f => ({ ...f, disciplinas: [...f.disciplinas, { ...emptyDisc(), nome: name }] }));
                  }} style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 99, cursor: 'pointer',
                    border: '1px solid rgba(0,184,212,0.3)', background: 'rgba(0,184,212,0.06)',
                    color: 'var(--petroleo)', fontWeight: 600,
                  }}>
                    {name.length > 20 ? name.slice(0, 18) + '…' : name}
                  </button>
                ))}
              </div>
            )}

            {form.disciplinas.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Header row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 28px', gap: 6, paddingRight: 2 }}>
                  <div style={{ fontSize: 9.5, color: 'var(--text-dim)', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', paddingLeft: 2 }}>DISCIPLINA</div>
                  <div style={{ fontSize: 9.5, color: 'var(--text-dim)', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', textAlign: 'center' }}>ACERTOS</div>
                  <div style={{ fontSize: 9.5, color: 'var(--text-dim)', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', textAlign: 'center' }}>TOTAL</div>
                  <div />
                </div>
                {form.disciplinas.map(d => {
                  const pct = parseFloat(d.total) > 0 ? Math.min(100, (parseFloat(d.pontos) || 0) / parseFloat(d.total) * 100) : null;
                  const color = pct !== null ? discColor(pct) : 'var(--text-dim)';
                  return (
                    <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 28px', gap: 6, alignItems: 'center' }}>
                      <input className="input-base" placeholder="Nome da disciplina" value={d.nome}
                        onChange={e => updateDisc(d.id, 'nome', e.target.value)}
                        style={{ width: '100%', fontSize: 11 }} />
                      <input className="input-base" type="number" placeholder="Pts" value={d.pontos}
                        onChange={e => updateDisc(d.id, 'pontos', e.target.value)}
                        style={{ width: '100%', fontSize: 11, textAlign: 'center' }} />
                      <div style={{ position: 'relative' }}>
                        <input className="input-base" type="number" placeholder="Total" value={d.total}
                          onChange={e => updateDisc(d.id, 'total', e.target.value)}
                          style={{ width: '100%', fontSize: 11, textAlign: 'center' }} />
                        {pct !== null && (
                          <span style={{
                            position: 'absolute', right: -38, top: '50%', transform: 'translateY(-50%)',
                            fontSize: 10, fontWeight: 800, color, fontFamily: 'JetBrains Mono, monospace',
                            whiteSpace: 'nowrap',
                          }}>
                            {pct.toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <button onClick={() => removeDisc(d.id)} style={{
                        width: 26, height: 26, borderRadius: 6, border: '1px solid rgba(232,93,93,0.3)',
                        background: 'rgba(232,93,93,0.06)', color: 'var(--coral)', cursor: 'pointer',
                        fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>×</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {formError && (
            <div style={{ fontSize: 11.5, color: 'var(--coral)', fontWeight: 600, marginBottom: 10 }}>⚠ {formError}</div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-neon" onClick={handleSave} style={{ fontSize: 12 }}>
              {editId ? '✓ Salvar alterações' : '+ Registrar'}
            </button>
            <button className="btn-ghost" onClick={closeForm} style={{ fontSize: 12 }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Insights */}
      {provas.length >= 1 && <ConcursosInsightsPanel provas={provas} />}

      {/* Charts */}
      {provas.length >= 2 && (
        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginBottom: 20 }}>
          <div className="glass anim-slide-up" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 14 }}>
              % DE PROXIMIDADE AO CORTE
            </div>
            <ProximityChart provas={chronological} />
          </div>

          {provas.some(p => (p.disciplinas || []).length > 0) && (
            <div className="glass anim-slide-up" style={{ padding: '18px 20px' }}>
              <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 14 }}>
                DESEMPENHO MÉDIO POR DISCIPLINA
              </div>
              <DisciplineAvgChart provas={provas} />
            </div>
          )}
        </div>
      )}

      {/* Discipline evolution table */}
      {provas.length >= 2 && provas.some(p => (p.disciplinas || []).length > 0) && (
        <div className="glass anim-slide-up" style={{ padding: '18px 20px', marginBottom: 20 }}>
          <DisciplineEvolutionTable provas={provas} />
        </div>
      )}

      {/* Banca comparison */}
      {bancas.length >= 2 && (
        <div className="glass anim-slide-up" style={{ padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, marginBottom: 12 }}>
            COMPARAÇÃO POR BANCA
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(() => {
              const bancaStats = bancas.map(b => {
                const ps = provas.filter(p => p.banca === b);
                const avgProx = ps.reduce((a, p) => a + (p.corte > 0 ? (p.pontos / p.corte) * 100 : 0), 0) / ps.length;
                const avgDes = ps.reduce((a, p) => a + (p.totalProva > 0 ? (p.pontos / p.totalProva) * 100 : 0), 0) / ps.length;
                return { banca: b, count: ps.length, avgProx, avgDes };
              }).sort((a, b) => b.avgProx - a.avgProx);

              return bancaStats.map((s, i) => {
                const color = discColor(s.avgDes);
                return (
                  <div key={s.banca} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ minWidth: 110, fontSize: 11.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {s.banca}
                      <span style={{ fontSize: 9.5, color: 'var(--text-dim)', fontWeight: 600, marginLeft: 5, fontFamily: 'JetBrains Mono, monospace' }}>
                        {s.count}×
                      </span>
                    </div>
                    <div style={{ flex: 1, position: 'relative', height: 8, background: 'rgba(30,32,48,0.07)', borderRadius: 99 }}>
                      <div style={{
                        height: '100%', width: `${Math.min(100, s.avgProx)}%`,
                        background: `linear-gradient(90deg, ${color}80, ${color})`,
                        borderRadius: 99,
                        transition: `width 700ms ${i * 80}ms cubic-bezier(0.16,1,0.3,1)`,
                      }} />
                      {/* 100% = corte marker */}
                      <div style={{
                        position: 'absolute', top: -3, bottom: -3, left: '100%',
                        width: 2, background: 'rgba(245,158,11,0.4)', borderRadius: 99,
                        transform: 'translateX(-50%)',
                      }} />
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right', minWidth: 80 }}>
                      <span className="num" style={{ fontSize: 12, fontWeight: 800, color, fontFamily: 'JetBrains Mono, monospace' }}>
                        {s.avgProx.toFixed(0)}%
                      </span>
                      <span style={{ fontSize: 9.5, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, marginLeft: 4 }}>
                        do corte
                      </span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* History */}
      {sorted.length === 0 ? (
        <div className="glass" style={{ padding: '44px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, opacity: 0.18, marginBottom: 12 }}>🏛️</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>Nenhuma prova registrada ainda.</div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 6 }}>
            Clique em <strong>+ Registrar prova</strong> para adicionar seu histórico.
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
              HISTÓRICO · {sorted.length} {sorted.length === 1 ? 'CONCURSO' : 'CONCURSOS'}
            </div>
            {bancas.length >= 2 && (
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {[null, ...bancas].map(b => (
                  <button key={b || '__all'} onClick={() => setBancaFilter(b)} style={{
                    fontSize: 10, padding: '3px 10px', borderRadius: 99, cursor: 'pointer',
                    border: `1px solid ${bancaFilter === b ? 'rgba(0,184,212,0.5)' : 'rgba(30,32,48,0.12)'}`,
                    background: bancaFilter === b ? 'rgba(0,184,212,0.10)' : 'transparent',
                    color: bancaFilter === b ? 'var(--petroleo)' : 'var(--text-muted)',
                    fontWeight: bancaFilter === b ? 700 : 600,
                    fontFamily: 'JetBrains Mono, monospace',
                    transition: 'all 160ms ease',
                  }}>
                    {b || 'Todas'}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredProvas.map(p => (
              <ProvaCard key={p.id} p={p} onEdit={() => openEdit(p)} onRemove={() => handleRemove(p.id)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

window.ConcursosDesempenhoTab = ConcursosDesempenhoTab;
