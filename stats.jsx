// TOGA — Página de Estatísticas (Bloco 5)

function StatsPage({ shared, objState, discState }) {
  const logs = shared.dailyLogs || [];
  const { useState: useSt } = React;
  const [period, setPeriod] = useSt('all'); // '7d' | '30d' | 'all'

  const now = new Date();
  const cutoff = period === '7d' ? new Date(now - 7*86400000)
               : period === '30d' ? new Date(now - 30*86400000)
               : null;

  const filteredLogs = cutoff
    ? logs.filter(l => new Date(l.date + 'T00:00:00') >= cutoff)
    : logs;

  // ── aggregate helpers ──
  const totalHours     = filteredLogs.reduce((a, l) => a + (l.hours || 0), 0);
  const totalQuestions = filteredLogs.reduce((a, l) => a + (l.questions || 0), 0);
  const totalReviews   = filteredLogs.reduce((a, l) => a + (l.reviews || 0), 0);
  const activeDays     = filteredLogs.filter(l => (l.hours||0)+(l.questions||0)+(l.reviews||0) > 0).length;

  // Flatten all entries (use entries[] when available; fallback to top-level log)
  const allEntries = [];
  filteredLogs.forEach(l => {
    if (l.entries && l.entries.length > 0) {
      l.entries.forEach(e => allEntries.push({ ...e, date: e.date || l.date }));
    } else {
      allEntries.push(l);
    }
  });

  // Hours per discipline
  const hoursByDisc = {};
  allEntries.forEach(e => {
    if (!e.discipline || !e.hours) return;
    hoursByDisc[e.discipline] = (hoursByDisc[e.discipline] || 0) + e.hours;
  });
  const hoursByDiscArr = Object.entries(hoursByDisc)
    .sort((a,b) => b[1]-a[1]).slice(0, 8);

  // Hours per study type
  const hoursByType = {};
  allEntries.forEach(e => {
    if (!e.studyType || !e.hours) return;
    hoursByType[e.studyType] = (hoursByType[e.studyType] || 0) + e.hours;
  });
  const hoursByTypeArr = Object.entries(hoursByType).sort((a,b) => b[1]-a[1]);

  // Accuracy per discipline (questions entries)
  const accByDisc = {};
  allEntries.forEach(e => {
    if (!e.discipline || (!e.correct && !e.wrong)) return;
    if (!accByDisc[e.discipline]) accByDisc[e.discipline] = { c: 0, w: 0 };
    accByDisc[e.discipline].c += (e.correct || 0);
    accByDisc[e.discipline].w += (e.wrong || 0);
  });
  const accByDiscArr = Object.entries(accByDisc)
    .map(([d, v]) => ({ d, pct: v.c + v.w > 0 ? v.c/(v.c+v.w)*100 : 0, total: v.c+v.w }))
    .sort((a,b) => b.pct - a.pct);

  // Daily XP / activity curve (last 30 days)
  const last30 = Array.from({length: 30}, (_, i) => {
    const d = new Date(now - (29-i)*86400000);
    const iso = d.toISOString().slice(0,10);
    const log = logs.find(l => l.date === iso);
    return { date: iso, h: log?.hours || 0, q: log?.questions || 0 };
  });
  const maxH = Math.max(...last30.map(d => d.h), 0.1);

  // Subject domination (objetiva)
  const FLAGS_O = ['lei','doutrina','juris','questoes','revisao'];
  const subjectStats = objState.subjects.map(s => {
    let checks = 0;
    s.topics.forEach(t => FLAGS_O.forEach(f => { if (t[f]) checks++; }));
    const pct = s.topics.length > 0 ? checks / (s.topics.length * 5) * 100 : 0;
    return { name: s.shortName || s.name.slice(0,10), pct };
  }).sort((a,b) => a.pct - b.pct);

  const worstSubjects = subjectStats.slice(0, 5);
  const bestSubjects  = subjectStats.slice(-5).reverse();

  // Neglected (>= 7 days since last entry that had that discipline)
  const lastLogByDisc = {};
  logs.forEach(l => {
    const ents = (l.entries && l.entries.length > 0) ? l.entries : [l];
    ents.forEach(e => {
      if (e.discipline) {
        if (!lastLogByDisc[e.discipline] || l.date > lastLogByDisc[e.discipline])
          lastLogByDisc[e.discipline] = l.date;
      }
    });
  });
  const allDiscs = objState.subjects.map(s => s.name);
  const neglected = allDiscs.filter(d => {
    const last = lastLogByDisc[d];
    if (!last) return true;
    return (now - new Date(last + 'T00:00:00')) / 86400000 >= 7;
  }).slice(0, 6);

  // Weekly comparison (this week vs last week)
  const weekH = (offset) => {
    const start = new Date(now - (offset+1)*7*86400000);
    const end   = new Date(now - offset*7*86400000);
    return logs.filter(l => {
      const d = new Date(l.date+'T00:00:00');
      return d >= start && d < end;
    }).reduce((a,l) => a + (l.hours||0), 0);
  };
  const thisWeek = weekH(0);
  const lastWeek = weekH(1);

  // ── chart colors ──
  const COLORS = ['var(--ciano)','var(--esmeralda)','var(--dourado)','var(--tinta)','var(--coral)','#F59E0B','#00B8D4','#5B47B8'];

  // ── helpers ──
  const Bar = ({ pct, color, height = 8 }) => (
    <div style={{ background: 'rgba(42,45,58,0.08)', borderRadius: 99, overflow: 'hidden', height }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 600ms ease' }} />
    </div>
  );

  if (logs.length === 0 && Object.keys(hoursByDisc).length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
        <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--petroleo)', marginBottom: 8 }}>
          Nenhum dado ainda
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 360, margin: '0 auto' }}>
          Registre suas sessões de estudo usando o botão + (FAB) para ver seus gráficos aqui.
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Period selector */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--petroleo)', flex: 1 }}>
          Suas Estatísticas
        </div>
        {[['7d','7 dias'],['30d','30 dias'],['all','Todo período']].map(([v,l]) => (
          <button key={v} onClick={() => setPeriod(v)}
            className={period === v ? 'btn-neon' : 'btn-ghost'}
            style={{ fontSize: 12, padding: '6px 14px' }}>
            {l}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        {[
          { label: 'Horas', value: totalHours.toFixed(1)+'h', color: 'var(--ciano)', icon: '⏱' },
          { label: 'Questões', value: totalQuestions.toLocaleString('pt-BR'), color: 'var(--esmeralda)', icon: '❓' },
          { label: 'Revisões', value: totalReviews.toLocaleString('pt-BR'), color: 'var(--tinta)', icon: '🃏' },
          { label: 'Dias ativos', value: activeDays, color: 'var(--dourado)', icon: '📅' },
        ].map((m,i) => (
          <div key={i} className="glass" style={{ padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 20 }}>{m.icon}</div>
            <div className="num" style={{ fontSize: 22, fontWeight: 700, color: m.color, marginTop: 4 }}>{m.value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>

        {/* Chart 1 — Curva de atividade (últimos 30 dias) */}
        <div className="glass" style={{ padding: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8, fontFamily: 'JetBrains Mono, monospace' }}>CURVA DE ATIVIDADE · 30 DIAS</div>
          <svg viewBox={`0 0 300 60`} style={{ width: '100%', height: 60, overflow: 'visible' }}>
            {last30.map((d, i) => {
              const x = (i / 29) * 290 + 5;
              const barH = (d.h / maxH) * 50;
              const y = 55 - barH;
              const isToday = d.date === now.toISOString().slice(0,10);
              return (
                <rect key={i} x={x-4} y={y} width={8} height={barH}
                  rx={2} fill={isToday ? 'var(--petroleo)' : d.h > 0 ? 'var(--ciano)' : 'rgba(42,45,58,0.08)'} />
              );
            })}
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-dim)', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>
            <span>30 dias atrás</span><span>hoje</span>
          </div>
        </div>

        {/* Chart 2 — Horas por disciplina */}
        <div className="glass" style={{ padding: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 10, fontFamily: 'JetBrains Mono, monospace' }}>HORAS POR DISCIPLINA</div>
          {hoursByDiscArr.length === 0
            ? <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 0' }}>Registre sessões com disciplina para ver este gráfico.</div>
            : hoursByDiscArr.map(([d, h], i) => (
              <div key={d} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{d.length > 18 ? d.slice(0,16)+'…' : d}</span>
                  <span className="num" style={{ color: COLORS[i % COLORS.length], fontWeight: 700 }}>{h.toFixed(1)}h</span>
                </div>
                <Bar pct={h / hoursByDiscArr[0][1] * 100} color={COLORS[i % COLORS.length]} />
              </div>
            ))
          }
        </div>

        {/* Chart 3 — Horas por tipo de estudo */}
        <div className="glass" style={{ padding: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 10, fontFamily: 'JetBrains Mono, monospace' }}>HORAS POR TIPO DE ESTUDO</div>
          {hoursByTypeArr.length === 0
            ? <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 0' }}>Registre sessões com tipo de estudo para ver este gráfico.</div>
            : hoursByTypeArr.map(([t, h], i) => (
              <div key={t} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{t}</span>
                  <span className="num" style={{ color: COLORS[i % COLORS.length], fontWeight: 700 }}>{h.toFixed(1)}h</span>
                </div>
                <Bar pct={h / hoursByTypeArr[0][1] * 100} color={COLORS[i % COLORS.length]} />
              </div>
            ))
          }
        </div>

        {/* Chart 4 — % acerto por disciplina */}
        <div className="glass" style={{ padding: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 10, fontFamily: 'JetBrains Mono, monospace' }}>% ACERTO POR DISCIPLINA</div>
          {accByDiscArr.length === 0
            ? <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 0' }}>Registre sessões de questões com acertos/erros para ver este gráfico.</div>
            : accByDiscArr.map((item, i) => (
              <div key={item.d} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.d.length > 18 ? item.d.slice(0,16)+'…' : item.d}</span>
                  <span className="num" style={{ color: item.pct >= 70 ? 'var(--esmeralda)' : item.pct >= 50 ? 'var(--dourado)' : 'var(--coral)', fontWeight: 700 }}>
                    {item.pct.toFixed(0)}% <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>({item.total}q)</span>
                  </span>
                </div>
                <Bar pct={item.pct} color={item.pct >= 70 ? 'var(--esmeralda)' : item.pct >= 50 ? 'var(--dourado)' : 'var(--coral)'} />
              </div>
            ))
          }
        </div>

        {/* Chart 5 — Top 5 melhores disciplinas */}
        <div className="glass" style={{ padding: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 10, fontFamily: 'JetBrains Mono, monospace' }}>TOP 5 MELHORES NO EDITAL</div>
          {bestSubjects.map((s, i) => (
            <div key={s.name} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{s.name}</span>
                <span className="num" style={{ color: 'var(--esmeralda)', fontWeight: 700 }}>{s.pct.toFixed(0)}%</span>
              </div>
              <Bar pct={s.pct} color="var(--esmeralda)" />
            </div>
          ))}
        </div>

        {/* Chart 6 — Top 5 piores disciplinas (no edital) */}
        <div className="glass" style={{ padding: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 10, fontFamily: 'JetBrains Mono, monospace' }}>TOP 5 PIORES NO EDITAL</div>
          {worstSubjects.map((s, i) => (
            <div key={s.name} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{s.name}</span>
                <span className="num" style={{ color: 'var(--coral)', fontWeight: 700 }}>{s.pct.toFixed(0)}%</span>
              </div>
              <Bar pct={s.pct} color="var(--coral)" />
            </div>
          ))}
        </div>

        {/* Chart 7 — Disciplinas negligenciadas */}
        <div className="glass" style={{ padding: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 10, fontFamily: 'JetBrains Mono, monospace' }}>DISCIPLINAS NEGLIGENCIADAS (7+ DIAS)</div>
          {neglected.length === 0
            ? <div style={{ fontSize: 13, color: 'var(--esmeralda)', fontWeight: 600, padding: '8px 0' }}>Tudo em dia!</div>
            : neglected.map((d, i) => (
              <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '8px 10px', background: 'rgba(232,93,93,0.06)', borderRadius: 8, border: '1px solid rgba(232,93,93,0.15)' }}>
                <span style={{ fontSize: 14 }}>⚠️</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--grafite)' }}>{d.length > 28 ? d.slice(0,26)+'…' : d}</span>
              </div>
            ))
          }
        </div>

        {/* Chart 8 — Comparação semanal */}
        <div className="glass" style={{ padding: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 12, fontFamily: 'JetBrains Mono, monospace' }}>COMPARAÇÃO SEMANAL</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 8 }}>
            {[['Esta semana', thisWeek, 'var(--petroleo)'], ['Semana passada', lastWeek, 'var(--ardosia)']].map(([label, h, color]) => {
              const maxW = Math.max(thisWeek, lastWeek, 0.1);
              return (
                <div key={label} style={{ flex: 1 }}>
                  <div style={{ background: 'rgba(42,45,58,0.06)', borderRadius: 8, height: 80, display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: `${(h/maxW)*100}%`, background: color, borderRadius: '8px 8px 0 0', minHeight: h > 0 ? 4 : 0, transition: 'height 600ms ease' }} />
                  </div>
                  <div className="num" style={{ fontSize: 18, fontWeight: 700, color, marginTop: 6 }}>{h.toFixed(1)}h</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
                </div>
              );
            })}
            <div style={{ flex: 1, textAlign: 'center' }}>
              {thisWeek > lastWeek
                ? <div><div style={{ fontSize: 28 }}>📈</div><div style={{ fontSize: 11, color: 'var(--esmeralda)', fontWeight: 700 }}>+{((thisWeek-lastWeek)/Math.max(lastWeek,0.1)*100).toFixed(0)}%</div></div>
                : thisWeek < lastWeek
                ? <div><div style={{ fontSize: 28 }}>📉</div><div style={{ fontSize: 11, color: 'var(--coral)', fontWeight: 700 }}>{((thisWeek-lastWeek)/Math.max(lastWeek,0.1)*100).toFixed(0)}%</div></div>
                : <div style={{ fontSize: 28 }}>😐</div>
              }
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
