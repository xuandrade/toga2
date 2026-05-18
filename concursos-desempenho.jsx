// TOGA — Aba Desempenho em Concursos (premium gamified redesign)

// ── Constants ──
const BANCAS_CONCURSO = ['CESPE/CEBRASPE','FCC','FGV','VUNESP','IBFC','IADES','AOCP','Quadrix','FUNDATEC','FEPESE','NC-UFPR','FAFIPA','Própria','Outra'];

const PROVA_PALETTE = [
  { main: '#6366F1', glow: '#818CF8', bg: 'rgba(99,102,241,0.08)' },
  { main: '#8B5CF6', glow: '#A78BFA', bg: 'rgba(139,92,246,0.08)' },
  { main: '#00b8d4', glow: '#00D4F5', bg: 'rgba(0,184,212,0.08)' },
  { main: '#7C3AED', glow: '#9B5DE5', bg: 'rgba(124,58,237,0.08)' },
  { main: '#0EA5E9', glow: '#38BDF8', bg: 'rgba(14,165,233,0.08)' },
  { main: '#D97706', glow: '#F59E0B', bg: 'rgba(217,119,6,0.08)' },
  { main: '#059669', glow: '#34D399', bg: 'rgba(5,150,105,0.08)' },
  { main: '#C026D3', glow: '#E879F9', bg: 'rgba(192,38,211,0.08)' },
];

function provaColor(idx) {
  return PROVA_PALETTE[((idx % PROVA_PALETTE.length) + PROVA_PALETTE.length) % PROVA_PALETTE.length];
}

function provaTitle(p) {
  const inst = p.orgao || p.cargo || 'Concurso';
  const year = p.date ? new Date(p.date + 'T12:00:00').getFullYear() : '';
  return year ? `${inst} · ${year}` : inst;
}

function discPct(d) {
  if (!d || !d.total || d.total <= 0) return 0;
  return Math.min(100, Math.max(0, (d.pontos / d.total) * 100));
}

function discColor(pct) {
  if (pct >= 80) return '#00a86b';
  if (pct >= 65) return '#00b8d4';
  if (pct >= 50) return '#8B5CF6';
  if (pct >= 35) return '#D97706';
  return '#C084FC';
}

function fmtDateBR(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtNum(n, decimals) {
  if (n === null || n === undefined || isNaN(n)) return '0';
  const d = decimals === undefined ? 1 : decimals;
  return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
}

// ── XP ──
function calcProvaXp(entry, isNew, prevProvas) {
  if (!isNew) return { xp: 0, kind: null };
  let xp = 20, kind = 'light';
  const discs = (entry.disciplinas || []).filter(d => d.nome && d.total > 0);
  if (discs.length >= 3) xp += 10;
  const passou = entry.pontos >= entry.corte;
  if (passou) { xp += 50; kind = 'victory'; }
  if (prevProvas.length > 0) {
    const myPct = entry.totalProva > 0 ? (entry.pontos / entry.totalProva) * 100 : 0;
    const prevPcts = prevProvas.map(p => p.totalProva > 0 ? (p.pontos / p.totalProva) * 100 : 0);
    if (myPct > Math.max(...prevPcts)) { xp += 30; if (!passou) kind = 'high'; }
    else { if (myPct > (prevPcts[prevPcts.length - 1] || 0)) xp += 15; }
  }
  return { xp, kind };
}

// ── Insights (positive-only) ──
function computeProvasInsights(provas) {
  const out = [];
  if (!provas || provas.length === 0) return out;

  const sorted = [...provas].sort((a, b) => a.date.localeCompare(b.date));

  // Personal best
  let best = null;
  sorted.forEach(p => {
    const pct = p.totalProva > 0 ? (p.pontos / p.totalProva) * 100 : 0;
    if (!best || pct > best.pct) best = { p, pct };
  });
  if (best) {
    out.push({
      id: 'best', icon: '🏆',
      label: 'Seu melhor resultado',
      value: `${fmtNum(best.pct)}%`,
      desc: provaTitle(best.p),
      color: '#D97706', hl: true,
    });
  }

  // Closer to cutoff (only if improving)
  if (sorted.length >= 2) {
    const latest = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];
    const lGap = latest.totalProva > 0 ? (latest.pontos - latest.corte) / latest.totalProva * 100 : 0;
    const pGap = prev.totalProva > 0 ? (prev.pontos - prev.corte) / prev.totalProva * 100 : 0;
    if (lGap > pGap) {
      const improved = lGap - pGap;
      out.push({
        id: 'closer', icon: '🎯',
        label: 'Cada vez mais próximo',
        value: `+${fmtNum(improved)}%`,
        desc: 'mais perto do corte',
        color: '#00a86b', hl: true,
      });
    }
  }

  // Journey milestone
  if (sorted.length >= 3) {
    out.push({
      id: 'journey', icon: '🚀',
      label: 'Jornada em progresso',
      value: `${sorted.length}`,
      desc: 'concursos registrados',
      color: '#8B5CF6', hl: true,
    });
  }

  // Discipline map
  const discMap = {};
  sorted.forEach(p => {
    (p.disciplinas || []).forEach(d => {
      if (!d.nome || !d.total || d.total <= 0) return;
      const k = d.nome.trim();
      if (!discMap[k]) discMap[k] = [];
      discMap[k].push({ pct: discPct(d), date: p.date, banca: p.banca });
    });
  });
  const discAvgs = Object.entries(discMap).map(([nome, arr]) => ({
    nome,
    avg: arr.reduce((s, x) => s + x.pct, 0) / arr.length,
    count: arr.length,
    arr,
  }));

  // Strongest discipline
  if (discAvgs.length > 0) {
    const top = [...discAvgs].sort((x, y) => y.avg - x.avg)[0];
    if (top && top.avg >= 50) {
      out.push({
        id: 'strong', icon: '💪',
        label: 'Ponto forte',
        value: top.nome,
        desc: `${fmtNum(top.avg)}% de aproveitamento médio`,
        color: '#00a86b', hl: true,
      });
    }
  }

  // Most potential to gain (reframed weakest)
  if (discAvgs.length >= 2) {
    const ranked = [...discAvgs].filter(x => x.count >= 1).sort((x, y) => x.avg - y.avg);
    const potential = ranked[0];
    if (potential && potential.avg < 70) {
      out.push({
        id: 'potential', icon: '🌱',
        label: 'Maior potencial de ganho',
        value: potential.nome,
        desc: 'maior espaço para crescer aqui',
        color: '#8B5CF6', hl: false,
      });
    }
  }

  // Discipline growing the most (only positive)
  let bestGrowth = null;
  discAvgs.forEach(d => {
    if (d.arr.length < 2) return;
    const sortedArr = [...d.arr].sort((x, y) => x.date.localeCompare(y.date));
    const delta = sortedArr[sortedArr.length - 1].pct - sortedArr[0].pct;
    if (delta >= 5 && (!bestGrowth || delta > bestGrowth.delta)) {
      bestGrowth = { nome: d.nome, delta };
    }
  });
  if (bestGrowth) {
    out.push({
      id: 'growing', icon: '📈',
      label: 'Em crescimento',
      value: bestGrowth.nome,
      desc: `+${fmtNum(bestGrowth.delta)}% desde o início`,
      color: '#00b8d4', hl: true,
    });
  }

  // Smart strategy: discipline that appears 2+ times with low score
  if (discAvgs.length > 0) {
    const repeated = discAvgs.filter(x => x.count >= 2).sort((x, y) => x.avg - y.avg);
    const focus = repeated[0];
    if (focus && focus.avg < 60) {
      out.push({
        id: 'strategy', icon: '🧠',
        label: 'Estratégia inteligente',
        value: focus.nome,
        desc: `focar aqui pode aproximar você do corte mais rapidamente`,
        color: '#7C3AED', hl: false,
      });
    }
  }

  // Best banca
  const bancaMap = {};
  sorted.forEach(p => {
    if (!p.banca) return;
    const pct = p.totalProva > 0 ? (p.pontos / p.totalProva) * 100 : 0;
    if (!bancaMap[p.banca]) bancaMap[p.banca] = [];
    bancaMap[p.banca].push(pct);
  });
  const bancaAvgs = Object.entries(bancaMap).map(([nome, arr]) => ({
    nome, avg: arr.reduce((s, x) => s + x, 0) / arr.length, count: arr.length,
  }));
  if (bancaAvgs.length >= 2) {
    const topBanca = [...bancaAvgs].sort((x, y) => y.avg - x.avg)[0];
    if (topBanca && topBanca.count >= 1) {
      out.push({
        id: 'banca', icon: '⭐',
        label: 'Você se destaca em',
        value: topBanca.nome,
        desc: `${fmtNum(topBanca.avg)}% de aproveitamento médio`,
        color: '#0EA5E9', hl: false,
      });
    }
  }

  return out;
}

// ── Proximity Chart ──
function ProximityChart({ provas, colors }) {
  if (!provas || provas.length === 0) return null;
  const W = 520, H = 240, PAD_L = 50, PAD_R = 20, PAD_T = 30, PAD_B = 40;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const points = provas.map(p => {
    const pct = p.totalProva > 0 ? (p.pontos / p.totalProva) * 100 : 0;
    const corteP = p.totalProva > 0 ? (p.corte / p.totalProva) * 100 : 0;
    return { pct, corteP, p };
  });

  const allVals = points.flatMap(pt => [pt.pct, pt.corteP]);
  const minV = Math.max(0, Math.min(...allVals) - 10);
  const maxV = Math.min(100, Math.max(...allVals) + 10);

  const xAt = i => PAD_L + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const yAt = v => PAD_T + innerH - ((v - minV) / (maxV - minV || 1)) * innerH;

  // Cutoff reference (use average for visual line)
  const avgCorte = points.reduce((s, x) => s + x.corteP, 0) / points.length;
  const corteY = yAt(avgCorte);

  const linePath = points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(pt.pct)}`).join(' ');
  const areaAbovePath = `${linePath} L ${xAt(points.length - 1)} ${corteY} L ${xAt(0)} ${corteY} Z`;

  return (
    <div className="glass anim-slide-up" style={{ padding: 20, borderRadius: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <div>
          <div className="font-display" style={{ fontSize: 14, letterSpacing: 1.5, color: '#8B5CF6', textTransform: 'uppercase' }}>Jornada rumo ao corte</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Acima = aprovado · Abaixo = evoluindo</div>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', maxHeight: 280 }}>
        <defs>
          <linearGradient id="proxLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00b8d4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Above-cutoff area (emerald) */}
        <rect x={PAD_L} y={PAD_T} width={innerW} height={Math.max(0, corteY - PAD_T)} fill="rgba(0,168,107,0.08)" />
        {/* Below-cutoff area (indigo) */}
        <rect x={PAD_L} y={corteY} width={innerW} height={Math.max(0, (PAD_T + innerH) - corteY)} fill="rgba(99,102,241,0.08)" />

        {/* Y axis labels */}
        {[minV, (minV + maxV) / 2, maxV].map((v, i) => (
          <g key={i}>
            <line x1={PAD_L} y1={yAt(v)} x2={W - PAD_R} y2={yAt(v)} stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4" />
            <text x={PAD_L - 8} y={yAt(v) + 4} textAnchor="end" fontSize="10" fill="rgba(255,255,255,0.4)">{fmtNum(v, 0)}%</text>
          </g>
        ))}

        {/* Cutoff line */}
        <line x1={PAD_L} y1={corteY} x2={W - PAD_R} y2={corteY} stroke="rgba(217,119,6,0.6)" strokeWidth="1.5" strokeDasharray="6 4" />
        <text x={W - PAD_R - 4} y={corteY - 6} textAnchor="end" fontSize="10" fill="#D97706" fontWeight="600" letterSpacing="1">APROVAÇÃO</text>

        {/* Line */}
        <path d={linePath} fill="none" stroke="url(#proxLine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points */}
        {points.map((pt, i) => {
          const c = (colors && colors[i]) || provaColor(i);
          const cx = xAt(i), cy = yAt(pt.pct);
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r="7" fill={c.main} fillOpacity="0.2" />
              <circle cx={cx} cy={cy} r="4" fill={c.main} stroke="#0a0a14" strokeWidth="1.5" />
              <text x={cx} y={cy - 12} textAnchor="middle" fontSize="10" fill={c.glow} fontWeight="700">{fmtNum(pt.pct, 0)}%</text>
              <text x={cx} y={PAD_T + innerH + 14} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.5)">
                {(pt.p.orgao || pt.p.banca || '').slice(0, 10)}
              </text>
              <text x={cx} y={PAD_T + innerH + 26} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.35)">
                {pt.p.date ? new Date(pt.p.date + 'T12:00:00').getFullYear() : ''}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Discipline Avg Chart ──
function DisciplineAvgChart({ provas }) {
  const { useState: useSt } = React;
  const [hover, setHover] = useSt(null);

  const discMap = {};
  provas.forEach(p => {
    (p.disciplinas || []).forEach(d => {
      if (!d.nome || !d.total || d.total <= 0) return;
      const k = d.nome.trim();
      if (!discMap[k]) discMap[k] = [];
      discMap[k].push({ pct: discPct(d), date: p.date });
    });
  });
  const rows = Object.entries(discMap).map(([nome, arr]) => {
    const sortedArr = [...arr].sort((x, y) => x.date.localeCompare(y.date));
    const min = Math.min(...sortedArr.map(x => x.pct));
    const max = Math.max(...sortedArr.map(x => x.pct));
    const avg = sortedArr.reduce((s, x) => s + x.pct, 0) / sortedArr.length;
    let trend = '→';
    if (sortedArr.length >= 2) {
      const delta = sortedArr[sortedArr.length - 1].pct - sortedArr[0].pct;
      if (delta >= 3) trend = '↑';
      else if (delta <= -3) trend = '↓';
    }
    return { nome, avg, min, max, count: sortedArr.length, trend };
  }).sort((x, y) => y.avg - x.avg);

  if (rows.length === 0) return null;

  return (
    <div className="glass anim-slide-up" style={{ padding: 20, borderRadius: 16 }}>
      <div style={{ marginBottom: 14 }}>
        <div className="font-display" style={{ fontSize: 14, letterSpacing: 1.5, color: '#00b8d4', textTransform: 'uppercase' }}>Aproveitamento por disciplina</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Média entre todos os concursos</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {rows.map((r, i) => {
          const color = discColor(r.avg);
          const isHover = hover === r.nome;
          const trendColor = r.trend === '↑' ? '#00a86b' : r.trend === '↓' ? '#8B5CF6' : 'rgba(255,255,255,0.4)';
          return (
            <div
              key={r.nome}
              onMouseEnter={() => setHover(r.nome)}
              onMouseLeave={() => setHover(null)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 8, background: isHover ? 'rgba(255,255,255,0.03)' : 'transparent', transition: 'all .15s' }}
              title={`Min ${fmtNum(r.min)}% · Máx ${fmtNum(r.max)}% · ${r.count} prova(s)`}
            >
              <div style={{ width: 130, fontSize: 12, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nome}</div>
              <div style={{ flex: 1, height: 18, position: 'relative', background: 'rgba(255,255,255,0.04)', borderRadius: 9, overflow: 'hidden' }}>
                {r.count >= 2 && (
                  <div style={{
                    position: 'absolute', top: 0, bottom: 0,
                    left: `${r.min}%`, width: `${Math.max(1, r.max - r.min)}%`,
                    background: 'rgba(255,255,255,0.06)',
                  }} />
                )}
                <div style={{
                  position: 'absolute', top: 0, bottom: 0, left: 0,
                  width: `${r.avg}%`,
                  background: `linear-gradient(90deg, ${color}88, ${color})`,
                  borderRadius: 9,
                  transition: 'width .5s ease',
                }} />
                <div style={{
                  position: 'absolute', top: 0, bottom: 0, left: `calc(${r.avg}% - 1px)`,
                  width: 2, background: color, boxShadow: `0 0 8px ${color}`,
                }} />
              </div>
              <div style={{ width: 56, textAlign: 'right', fontSize: 12, color, fontWeight: 700 }} className="num">{fmtNum(r.avg)}%</div>
              <div style={{ width: 20, textAlign: 'center', fontSize: 14, color: trendColor, fontWeight: 700 }}>{r.trend}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Discipline Evolution Table ──
function DisciplineEvolutionTable({ provas }) {
  const sorted = [...provas].sort((a, b) => a.date.localeCompare(b.date));
  const discMap = {};
  sorted.forEach((p, idx) => {
    (p.disciplinas || []).forEach(d => {
      if (!d.nome || !d.total || d.total <= 0) return;
      const k = d.nome.trim();
      if (!discMap[k]) discMap[k] = {};
      discMap[k][idx] = discPct(d);
    });
  });

  const rows = Object.entries(discMap)
    .filter(([_, vals]) => Object.keys(vals).length >= 2)
    .map(([nome, vals]) => {
      const indices = Object.keys(vals).map(Number).sort((x, y) => x - y);
      const first = vals[indices[0]];
      const last = vals[indices[indices.length - 1]];
      const trendDelta = last - first;
      let trend = '→';
      if (trendDelta >= 3) trend = '↑';
      else if (trendDelta <= -3) trend = '↓';
      return { nome, vals, trend, trendDelta };
    })
    .sort((x, y) => y.trendDelta - x.trendDelta);

  if (rows.length === 0) return null;

  return (
    <div className="glass anim-slide-up" style={{ padding: 20, borderRadius: 16, overflowX: 'auto' }}>
      <div style={{ marginBottom: 14 }}>
        <div className="font-display" style={{ fontSize: 14, letterSpacing: 1.5, color: '#8B5CF6', textTransform: 'uppercase' }}>Evolução por disciplina</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Como cada matéria evoluiu ao longo dos concursos</div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px', fontSize: 12 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '6px 10px', color: 'rgba(255,255,255,0.55)', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' }}>Disciplina</th>
            {sorted.map((p, i) => {
              const c = provaColor(i);
              return (
                <th key={p.id} style={{ textAlign: 'center', padding: '6px 8px', minWidth: 90 }}>
                  <div style={{ color: c.main, fontWeight: 700, fontSize: 11 }}>{provaTitle(p)}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: 400, marginTop: 2 }}>{p.banca || ''}</div>
                </th>
              );
            })}
            <th style={{ textAlign: 'center', padding: '6px 8px', color: 'rgba(255,255,255,0.55)', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' }}>Tend.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const indices = Object.keys(r.vals).map(Number).sort((x, y) => x - y);
            let prevVal = null;
            const trendColor = r.trend === '↑' ? '#00a86b' : r.trend === '↓' ? '#8B5CF6' : 'rgba(255,255,255,0.4)';
            return (
              <tr key={r.nome} style={{ background: 'rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '8px 10px', color: 'rgba(255,255,255,0.9)', fontWeight: 500, borderRadius: '8px 0 0 8px' }}>{r.nome}</td>
                {sorted.map((p, i) => {
                  const v = r.vals[i];
                  if (v === undefined) {
                    return <td key={p.id} style={{ textAlign: 'center', padding: '6px 4px', color: 'rgba(255,255,255,0.2)' }}>—</td>;
                  }
                  const color = discColor(v);
                  let delta = null;
                  if (prevVal !== null) delta = v - prevVal;
                  prevVal = v;
                  const deltaArrow = delta === null ? null : (delta >= 3 ? '↑' : delta <= -3 ? '↓' : '');
                  const deltaColor = delta === null ? '' : (delta >= 0 ? '#00a86b' : '#8B5CF6');
                  return (
                    <td key={p.id} style={{ textAlign: 'center', padding: '6px 4px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '3px 8px', borderRadius: 999,
                        background: `${color}22`, color, fontWeight: 700, fontSize: 11,
                        border: `1px solid ${color}44`,
                      }} className="num">
                        {fmtNum(v, 0)}%
                        {deltaArrow && <span style={{ color: deltaColor, fontSize: 10 }}>{deltaArrow}</span>}
                      </span>
                    </td>
                  );
                })}
                <td style={{ textAlign: 'center', padding: '6px 8px', color: trendColor, fontWeight: 700, fontSize: 14, borderRadius: '0 8px 8px 0' }}>{r.trend}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Banca Evolution Section ──
function BancaEvolutionSection({ provas }) {
  const bancaMap = {};
  provas.forEach(p => {
    if (!p.banca) return;
    if (!bancaMap[p.banca]) bancaMap[p.banca] = [];
    bancaMap[p.banca].push(p);
  });

  const bancas = Object.entries(bancaMap).map(([nome, arr]) => {
    const pcts = arr.map(p => p.totalProva > 0 ? (p.pontos / p.totalProva) * 100 : 0);
    const avg = pcts.reduce((s, x) => s + x, 0) / pcts.length;
    const gaps = arr.map(p => p.totalProva > 0 ? (p.pontos - p.corte) / p.totalProva * 100 : 0);
    const avgGap = gaps.reduce((s, x) => s + x, 0) / gaps.length;

    // Best discipline within this banca
    const dm = {};
    arr.forEach(p => {
      (p.disciplinas || []).forEach(d => {
        if (!d.nome || !d.total) return;
        if (!dm[d.nome]) dm[d.nome] = [];
        dm[d.nome].push(discPct(d));
      });
    });
    const dList = Object.entries(dm).map(([n, pp]) => ({ nome: n, avg: pp.reduce((s, x) => s + x, 0) / pp.length }));
    dList.sort((x, y) => y.avg - x.avg);
    const bestDisc = dList[0] || null;

    return { nome, count: arr.length, avg, avgGap, bestDisc };
  }).sort((x, y) => y.avgGap - x.avgGap);

  if (bancas.length < 2) return null;
  const hasRepeated = bancas.some(b => b.count >= 2);
  if (!hasRepeated) return null;

  // Build 1-2 pattern insights
  const patterns = [];
  const topBanca = bancas[0];
  if (topBanca && topBanca.count >= 1) {
    patterns.push(`Você performa historicamente melhor em provas da ${topBanca.nome}.`);
  }
  const bancaWithStrongDisc = bancas.find(b => b.bestDisc && b.bestDisc.avg >= 70 && b.count >= 2);
  if (bancaWithStrongDisc && patterns.length < 2) {
    patterns.push(`${bancaWithStrongDisc.bestDisc.nome} é seu ponto mais forte em provas da ${bancaWithStrongDisc.nome}.`);
  }

  return (
    <div className="glass anim-slide-up" style={{ padding: 20, borderRadius: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <div className="font-display" style={{ fontSize: 14, letterSpacing: 1.5, color: '#0EA5E9', textTransform: 'uppercase' }}>Jornada por banca</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Como você se sai em cada estilo de prova</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 14 }}>
        {bancas.map((b, i) => {
          const c = provaColor(i);
          return (
            <div key={b.nome} style={{
              padding: 14, borderRadius: 12,
              background: c.bg,
              border: `1px solid ${c.main}33`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, color: c.main, fontSize: 14 }}>{b.nome}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{b.count} prova{b.count > 1 ? 's' : ''}</div>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{
                  height: '100%', width: `${Math.min(100, b.avg)}%`,
                  background: `linear-gradient(90deg, ${c.main}, ${c.glow})`,
                  borderRadius: 4,
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ color: 'rgba(255,255,255,0.6)' }}>Desempenho médio</span>
                <span className="num" style={{ color: c.glow, fontWeight: 700 }}>{fmtNum(b.avg)}%</span>
              </div>
              {b.bestDisc && (
                <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
                  Melhor: <span style={{ color: discColor(b.bestDisc.avg), fontWeight: 600 }}>{b.bestDisc.nome}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {patterns.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {patterns.map((t, i) => (
            <div key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', display: 'flex', gap: 8 }}>
              <span style={{ color: '#8B5CF6' }}>◆</span>
              <span>{t}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Insights Panel ──
function ConcursosInsightsPanel({ provas }) {
  const items = computeProvasInsights(provas);
  if (items.length === 0) return null;
  return (
    <div className="anim-slide-up" style={{ marginBottom: 16 }}>
      <div className="font-display" style={{ fontSize: 12, letterSpacing: 2, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', marginBottom: 10 }}>Insights da sua jornada</div>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6 }}>
        {items.map(it => (
          <div key={it.id} className="glass" style={{
            flex: '0 0 auto', minWidth: 200, maxWidth: 280,
            padding: 14, borderRadius: 14,
            border: `1px solid ${it.color}33`,
            background: `linear-gradient(135deg, ${it.color}11, rgba(255,255,255,0.02))`,
            boxShadow: it.hl ? `0 6px 18px ${it.color}22` : 'none',
          }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{it.icon}</div>
            <div style={{ fontSize: 9, letterSpacing: 1.5, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 4 }}>{it.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: it.color, marginBottom: 4, lineHeight: 1.1 }} className="num">{it.value}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', lineHeight: 1.35 }}>{it.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ProvaCard ──
function ProvaCard({ p, idx, onEdit, onRemove }) {
  const { useState: useSt } = React;
  const [open, setOpen] = useSt(false);
  const [hover, setHover] = useSt(false);

  const color = provaColor(idx);
  const pctDesempenho = p.totalProva > 0 ? (p.pontos / p.totalProva) * 100 : 0;
  const gapPts = p.pontos - p.corte;
  const gapPctTotal = p.totalProva > 0 ? (gapPts / p.totalProva) * 100 : 0;
  const passou = p.pontos >= p.corte;

  const corteFracTrack = p.totalProva > 0 ? Math.min(100, Math.max(0, (p.corte / p.totalProva) * 100)) : 0;
  const fillFracTrack = p.totalProva > 0 ? Math.min(100, Math.max(0, (p.pontos / p.totalProva) * 100)) : 0;

  const discs = (p.disciplinas || [])
    .filter(d => d.nome && d.total > 0)
    .map(d => ({ ...d, pct: discPct(d) }))
    .sort((x, y) => y.pct - x.pct);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="anim-slide-up"
      style={{
        position: 'relative',
        background: `linear-gradient(135deg, ${color.bg}, rgba(255,255,255,0.015))`,
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: '18px 20px 16px 24px',
        transition: 'transform .2s ease, box-shadow .2s ease',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hover ? `0 10px 30px ${color.main}33, 0 0 0 1px ${color.main}55` : '0 2px 8px rgba(0,0,0,0.25)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Left accent border */}
      <div style={{
        position: 'absolute', left: 0, top: 12, bottom: 12, width: 4,
        background: `linear-gradient(180deg, ${color.main}, ${color.glow})`,
        borderRadius: '0 4px 4px 0',
        boxShadow: `0 0 12px ${color.main}66`,
      }} />

      {/* TOP */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 60%', minWidth: 200 }}>
          <div className="font-display" style={{ fontSize: 20, color: color.main, fontWeight: 700, lineHeight: 1.15 }}>
            {provaTitle(p)}
          </div>
          {(p.orgao && p.cargo) ? (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>{p.cargo}</div>
          ) : null}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            {p.banca && (
              <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.8)', letterSpacing: 0.5 }}>{p.banca}</span>
            )}
            {p.date && (
              <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}>{fmtDateBR(p.date)}</span>
            )}
            {passou && (
              <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 999, background: 'rgba(0,168,107,0.15)', color: '#00a86b', fontWeight: 700, letterSpacing: 0.5 }}>✓ APROVADO</span>
            )}
          </div>
        </div>

        {/* SCORE HERO */}
        <div style={{ textAlign: 'right', minWidth: 140 }}>
          <div className="num" style={{ fontSize: 36, fontWeight: 800, color: color.main, lineHeight: 1, textShadow: `0 0 24px ${color.main}44` }}>
            {fmtNum(pctDesempenho, 1)}%
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>de desempenho</div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '8px 0' }} />
          <div style={{ fontSize: 12, fontWeight: 600, color: passou ? '#00a86b' : color.glow }} className="num">
            {passou
              ? `${fmtNum(gapPctTotal)}% acima do corte`
              : `${fmtNum(Math.abs(gapPctTotal))}% abaixo do corte`}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 2 }} className="num">
            {passou ? `+${fmtNum(gapPts, 1)} pts` : `faltam ${fmtNum(Math.abs(gapPts), 1)} pts`}
          </div>
        </div>
      </div>

      {/* MIDDLE: progress track */}
      <div style={{ marginTop: 16 }}>
        <div style={{ position: 'relative', height: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 8, overflow: 'visible' }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${fillFracTrack}%`,
            background: `linear-gradient(90deg, ${color.main}99, ${color.main})`,
            borderRadius: 8,
            boxShadow: `0 0 10px ${color.main}88`,
            transition: 'width .6s ease',
          }} />
          {/* Cutoff marker */}
          <div style={{
            position: 'absolute', top: -4, bottom: -4, left: `${corteFracTrack}%`,
            width: 2, background: '#D97706',
            boxShadow: '0 0 8px rgba(217,119,6,0.7)',
          }} title="Corte" />
          <div style={{
            position: 'absolute', top: -18, left: `${corteFracTrack}%`,
            transform: 'translateX(-50%)',
            fontSize: 9, color: '#D97706', fontWeight: 700, letterSpacing: 1,
          }}>CORTE</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 6 }} className="num">
          <span>0</span>
          <span>corte: {fmtNum(p.corte, 1)}</span>
          <span>{fmtNum(p.totalProva, 1)}</span>
        </div>
      </div>

      {/* BOTTOM: disciplines */}
      {discs.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <button
            onClick={() => setOpen(!open)}
            className="btn-ghost"
            style={{
              fontSize: 11, padding: '6px 10px',
              color: color.main, letterSpacing: 0.5,
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${color.main}33`,
              borderRadius: 8,
            }}
          >
            Ver por disciplina {open ? '▴' : '▾'}
          </button>
          {open && (
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {discs.map((d, i) => {
                const dc = discColor(d.pct);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: dc, boxShadow: `0 0 6px ${dc}88` }} />
                    <div style={{ flex: '1 1 30%', color: 'rgba(255,255,255,0.85)', minWidth: 100 }}>{d.nome}</div>
                    <div style={{ flex: '1 1 40%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${d.pct}%`, background: dc, borderRadius: 3 }} />
                    </div>
                    <div className="num" style={{ width: 50, textAlign: 'right', color: dc, fontWeight: 700, fontSize: 11 }}>{fmtNum(d.pct, 0)}%</div>
                    <div className="num" style={{ width: 70, textAlign: 'right', color: 'rgba(255,255,255,0.45)', fontSize: 10 }}>
                      {fmtNum(d.pontos, 1)}/{fmtNum(d.total, 1)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* observacoes */}
      {p.observacoes && (
        <div style={{ marginTop: 12, padding: '8px 10px', background: 'rgba(255,255,255,0.025)', borderRadius: 8, fontSize: 11, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', borderLeft: `2px solid ${color.main}66` }}>
          {p.observacoes}
        </div>
      )}

      {/* FOOTER actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 12 }}>
        <button
          onClick={() => onEdit(p)}
          className="btn-ghost"
          style={{ fontSize: 11, padding: '4px 10px', color: 'rgba(255,255,255,0.7)' }}
          title="Editar"
        >
          ✏️ Editar
        </button>
        <button
          onClick={() => onRemove(p)}
          className="btn-ghost"
          style={{ fontSize: 11, padding: '4px 10px', color: 'rgba(255,255,255,0.55)' }}
          title="Remover"
        >
          ✕ Remover
        </button>
      </div>
    </div>
  );
}

// ── Form ──
function ProvaForm({ initial, onSave, onCancel }) {
  const { useState: useSt } = React;
  const [cargo, setCargo] = useSt(initial?.cargo || '');
  const [banca, setBanca] = useSt(initial?.banca || '');
  const [orgao, setOrgao] = useSt(initial?.orgao || '');
  const [date, setDate] = useSt(initial?.date || new Date().toISOString().slice(0, 10));
  const [totalProva, setTotalProva] = useSt(initial?.totalProva ?? '');
  const [pontos, setPontos] = useSt(initial?.pontos ?? '');
  const [corte, setCorte] = useSt(initial?.corte ?? '');
  const [observacoes, setObservacoes] = useSt(initial?.observacoes || '');
  const [disciplinas, setDisciplinas] = useSt(
    initial?.disciplinas?.length ? [...initial.disciplinas] : [{ nome: '', pontos: '', total: '' }]
  );
  const [err, setErr] = useSt('');

  function updateDisc(i, key, val) {
    const copy = [...disciplinas];
    copy[i] = { ...copy[i], [key]: val };
    setDisciplinas(copy);
  }
  function addDisc() { setDisciplinas([...disciplinas, { nome: '', pontos: '', total: '' }]); }
  function rmDisc(i) { setDisciplinas(disciplinas.filter((_, j) => j !== i)); }

  function submit() {
    setErr('');
    const tp = parseFloat(totalProva), pt = parseFloat(pontos), ct = parseFloat(corte);
    if (!date) return setErr('Informe a data.');
    if (isNaN(tp) || tp <= 0) return setErr('Total da prova inválido.');
    if (isNaN(pt) || pt < 0) return setErr('Pontuação inválida.');
    if (isNaN(ct) || ct < 0) return setErr('Corte inválido.');
    const cleanDiscs = disciplinas
      .filter(d => d.nome && d.nome.trim())
      .map(d => ({
        nome: d.nome.trim(),
        pontos: parseFloat(d.pontos) || 0,
        total: parseFloat(d.total) || 0,
      }))
      .filter(d => d.total > 0);

    onSave({
      id: initial?.id || `prova-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      cargo: cargo.trim(), banca: banca.trim(), orgao: orgao.trim(),
      date, totalProva: tp, pontos: pt, corte: ct,
      observacoes: observacoes.trim(),
      disciplinas: cleanDiscs,
    });
  }

  return (
    <div className="glass anim-slide-up" style={{ padding: 22, borderRadius: 16, marginBottom: 18, border: '1px solid rgba(139,92,246,0.25)' }}>
      <div className="font-display" style={{ fontSize: 14, letterSpacing: 1.5, color: '#8B5CF6', textTransform: 'uppercase', marginBottom: 14 }}>
        {initial ? 'Editar prova' : 'Registrar nova prova'}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 12 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: 1, textTransform: 'uppercase' }}>Cargo</span>
          <input className="input-base" type="text" value={cargo} onChange={e => setCargo(e.target.value)} placeholder="Defensor Público" />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: 1, textTransform: 'uppercase' }}>Órgão</span>
          <input className="input-base" type="text" value={orgao} onChange={e => setOrgao(e.target.value)} placeholder="DPE-BA" />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: 1, textTransform: 'uppercase' }}>Banca</span>
          <select className="input-base" value={banca} onChange={e => setBanca(e.target.value)}>
            <option value="">Selecione…</option>
            {BANCAS_CONCURSO.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: 1, textTransform: 'uppercase' }}>Data</span>
          <input className="input-base" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 14 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: 1, textTransform: 'uppercase' }}>Total da prova</span>
          <input className="input-base num" type="number" step="0.01" value={totalProva} onChange={e => setTotalProva(e.target.value)} placeholder="100" />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: 1, textTransform: 'uppercase' }}>Sua pontuação</span>
          <input className="input-base num" type="number" step="0.01" value={pontos} onChange={e => setPontos(e.target.value)} placeholder="68" />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: 1, textTransform: 'uppercase' }}>Nota de corte</span>
          <input className="input-base num" type="number" step="0.01" value={corte} onChange={e => setCorte(e.target.value)} placeholder="70" />
        </label>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: 1, textTransform: 'uppercase' }}>Disciplinas (opcional)</div>
          <button type="button" className="btn-ghost" style={{ fontSize: 11, padding: '4px 10px' }} onClick={addDisc}>+ Adicionar</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {disciplinas.map((d, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 6 }}>
              <input className="input-base" type="text" value={d.nome} onChange={e => updateDisc(i, 'nome', e.target.value)} placeholder="Direito Constitucional" />
              <input className="input-base num" type="number" step="0.01" value={d.pontos} onChange={e => updateDisc(i, 'pontos', e.target.value)} placeholder="Pts" />
              <input className="input-base num" type="number" step="0.01" value={d.total} onChange={e => updateDisc(i, 'total', e.target.value)} placeholder="Total" />
              <button type="button" className="btn-ghost" style={{ fontSize: 12, padding: '4px 8px' }} onClick={() => rmDisc(i)}>✕</button>
            </div>
          ))}
        </div>
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: 1, textTransform: 'uppercase' }}>Observações</span>
        <textarea className="input-base" rows={2} value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Anotações sobre essa prova…" />
      </label>

      {err && <div style={{ color: '#C084FC', fontSize: 12, marginBottom: 10 }}>{err}</div>}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <button className="btn-neon" onClick={submit}>{initial ? 'Salvar' : 'Registrar'}</button>
      </div>
    </div>
  );
}

// ── Main Tab ──
function ConcursosDesempenhoTab({ provas, setProvas, onXpGain }) {
  const { useState: useSt, useMemo } = React;
  const [showForm, setShowForm] = useSt(false);
  const [editing, setEditing] = useSt(null);
  const [filterBanca, setFilterBanca] = useSt('');

  const sortedByDateAsc = useMemo(
    () => [...(provas || [])].sort((a, b) => (a.date || '').localeCompare(b.date || '')),
    [provas]
  );
  const sortedByDateDesc = useMemo(
    () => [...(provas || [])].sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [provas]
  );

  // Map prova id -> chronological index (for stable colors)
  const colorIdxMap = useMemo(() => {
    const m = {};
    sortedByDateAsc.forEach((p, i) => { m[p.id] = i; });
    return m;
  }, [sortedByDateAsc]);

  const chartColors = useMemo(() => sortedByDateAsc.map((_, i) => provaColor(i)), [sortedByDateAsc]);

  function handleSave(entry) {
    const isNew = !editing;
    const prevProvas = (provas || []).filter(p => p.id !== entry.id);
    const next = [...prevProvas, entry];
    setProvas(next);
    if (onXpGain) {
      const { xp, kind } = calcProvaXp(entry, isNew, prevProvas);
      if (xp > 0) onXpGain(xp, kind);
    }
    setShowForm(false);
    setEditing(null);
  }

  function handleEdit(p) { setEditing(p); setShowForm(true); }
  function handleRemove(p) {
    if (!window.confirm(`Remover ${provaTitle(p)}?`)) return;
    setProvas((provas || []).filter(x => x.id !== p.id));
  }

  // Filter pills (bancas)
  const bancasInUse = useMemo(() => {
    const s = new Set();
    (provas || []).forEach(p => { if (p.banca) s.add(p.banca); });
    return Array.from(s).sort();
  }, [provas]);

  const filtered = useMemo(() => {
    if (!filterBanca) return sortedByDateDesc;
    return sortedByDateDesc.filter(p => p.banca === filterBanca);
  }, [sortedByDateDesc, filterBanca]);

  // Header stats
  const totalProvasCount = (provas || []).length;
  const avgPerf = totalProvasCount > 0
    ? (provas.reduce((s, p) => s + (p.totalProva > 0 ? (p.pontos / p.totalProva) * 100 : 0), 0) / totalProvasCount)
    : 0;
  const totalDiscs = useMemo(() => {
    const s = new Set();
    (provas || []).forEach(p => (p.disciplinas || []).forEach(d => { if (d.nome) s.add(d.nome.trim()); }));
    return s.size;
  }, [provas]);

  // Discipline evolution gate
  const showEvolutionTable = useMemo(() => {
    if ((provas || []).length < 2) return false;
    const discMap = {};
    (provas || []).forEach(p => {
      (p.disciplinas || []).forEach(d => {
        if (!d.nome || !d.total) return;
        discMap[d.nome] = (discMap[d.nome] || 0) + 1;
      });
    });
    return Object.values(discMap).some(c => c >= 2);
  }, [provas]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div className="font-display" style={{
            fontSize: 28, fontWeight: 800, lineHeight: 1.1,
            background: 'linear-gradient(135deg, #8B5CF6, #00b8d4)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Desempenho em Concursos
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>Sua jornada de evolução</div>
          {totalProvasCount > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <div style={{ padding: '6px 12px', borderRadius: 999, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', fontSize: 12 }}>
                <span style={{ color: '#A78BFA', fontWeight: 700 }} className="num">{totalProvasCount}</span>
                <span style={{ color: 'rgba(255,255,255,0.65)', marginLeft: 6 }}>concurso{totalProvasCount > 1 ? 's' : ''}</span>
              </div>
              <div style={{ padding: '6px 12px', borderRadius: 999, background: 'rgba(0,184,212,0.1)', border: '1px solid rgba(0,184,212,0.3)', fontSize: 12 }}>
                <span style={{ color: '#00D4F5', fontWeight: 700 }} className="num">{fmtNum(avgPerf)}%</span>
                <span style={{ color: 'rgba(255,255,255,0.65)', marginLeft: 6 }}>desempenho médio</span>
              </div>
              <div style={{ padding: '6px 12px', borderRadius: 999, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', fontSize: 12 }}>
                <span style={{ color: '#818CF8', fontWeight: 700 }} className="num">{totalDiscs}</span>
                <span style={{ color: 'rgba(255,255,255,0.65)', marginLeft: 6 }}>disciplina{totalDiscs > 1 ? 's' : ''} registrada{totalDiscs > 1 ? 's' : ''}</span>
              </div>
            </div>
          )}
        </div>
        <button
          className="btn-neon"
          onClick={() => { setEditing(null); setShowForm(true); }}
          style={{ alignSelf: 'flex-start' }}
        >
          + Registrar prova
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <ProvaForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {/* Empty state */}
      {totalProvasCount === 0 && !showForm && (
        <div className="glass anim-slide-up" style={{ padding: 32, borderRadius: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
          <div className="font-display" style={{ fontSize: 18, color: '#A78BFA', marginBottom: 6 }}>Comece sua jornada</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
            Registre a primeira prova para acompanhar sua evolução rumo à aprovação.
          </div>
          <button className="btn-neon" onClick={() => setShowForm(true)}>Registrar primeira prova</button>
        </div>
      )}

      {/* Insights */}
      {totalProvasCount >= 1 && <ConcursosInsightsPanel provas={provas} />}

      {/* Charts row */}
      {totalProvasCount >= 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 14 }}>
          <ProximityChart provas={sortedByDateAsc} colors={chartColors} />
          <DisciplineAvgChart provas={provas} />
        </div>
      )}

      {/* Evolution Table */}
      {showEvolutionTable && <DisciplineEvolutionTable provas={provas} />}

      {/* Banca Evolution */}
      {bancasInUse.length >= 2 && <BancaEvolutionSection provas={provas} />}

      {/* History */}
      {totalProvasCount > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 6, flexWrap: 'wrap', gap: 10 }}>
            <div className="font-display" style={{ fontSize: 14, letterSpacing: 1.5, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Histórico</div>
            {bancasInUse.length >= 2 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setFilterBanca('')}
                  style={{
                    fontSize: 10, padding: '4px 10px', borderRadius: 999,
                    background: filterBanca === '' ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
                    color: filterBanca === '' ? '#A78BFA' : 'rgba(255,255,255,0.6)',
                    border: filterBanca === '' ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer', letterSpacing: 0.5,
                  }}
                >
                  Todas
                </button>
                {bancasInUse.map(b => (
                  <button
                    key={b}
                    onClick={() => setFilterBanca(b)}
                    style={{
                      fontSize: 10, padding: '4px 10px', borderRadius: 999,
                      background: filterBanca === b ? 'rgba(0,184,212,0.18)' : 'rgba(255,255,255,0.04)',
                      color: filterBanca === b ? '#00D4F5' : 'rgba(255,255,255,0.6)',
                      border: filterBanca === b ? '1px solid rgba(0,184,212,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      cursor: 'pointer', letterSpacing: 0.5,
                    }}
                  >
                    {b}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(p => (
              <ProvaCard
                key={p.id}
                p={p}
                idx={colorIdxMap[p.id] ?? 0}
                onEdit={handleEdit}
                onRemove={handleRemove}
              />
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                Nenhuma prova com este filtro.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

window.ConcursosDesempenhoTab = ConcursosDesempenhoTab;
