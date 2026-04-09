// ============================================================
// js/analytics.js — previsão, resumo semanal, gasto por dia
// ============================================================

// ── Helpers de semana ─────────────────────────────────────────
function _startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=dom
  const diff = (day === 0 ? -6 : 1 - day); // ajusta para segunda
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function _isoWeekKey(date) {
  const d = _startOfWeek(date);
  return `${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`;
}

// ── 1. Previsão de gastos ─────────────────────────────────────
function calcPrevisao() {
  // Pega últimos 3 meses completos (exclui mês atual)
  const history = getMonthlyHistory(4); // [0..2]=passados, [3]=atual
  const passados = history.slice(0, 3).filter(h => h.gastos > 0);
  if (passados.length === 0) return null;

  const media = passados.reduce((s, h) => s + h.gastos, 0) / passados.length;
  const atual = history[3]; // mês atual

  // Dias passados no mês / dias totais do mês
  const hoje = new Date();
  const diaAtual = (curMonth === hoje.getMonth() && curYear === hoje.getFullYear())
    ? hoje.getDate()
    : new Date(curYear, curMonth + 1, 0).getDate();
  const diasTotal = new Date(curYear, curMonth + 1, 0).getDate();
  const ritmo = diaAtual / diasTotal;

  // Projeção = gasto atual / % do mês passado = ritmo esperado no fim
  const projecao = ritmo > 0 ? atual.gastos / ritmo : atual.gastos;

  return {
    media:    Math.round(media * 100) / 100,
    projecao: Math.round(projecao * 100) / 100,
    atual:    atual.gastos,
    ritmo:    Math.round(ritmo * 100),
    meses:    passados.length
  };
}

// ── 2. Resumo semanal ─────────────────────────────────────────
function calcResumoSemanal() {
  const hoje      = new Date();
  const inicioSem = _startOfWeek(hoje);
  const inicioAnt = new Date(inicioSem);
  inicioAnt.setDate(inicioAnt.getDate() - 7);
  const fimAnt = new Date(inicioSem);
  fimAnt.setMilliseconds(-1);

  // Coleta todas as despesas dos 2 meses envolvidos
  const meses = new Set();
  for (let d = new Date(inicioAnt); d <= hoje; d.setDate(d.getDate() + 1)) {
    meses.add(`${d.getFullYear()}_${d.getMonth()}`);
  }

  let semAtual = 0, semAnt = 0;
  meses.forEach(key => {
    const exps = (_cache.expenses[key] || []).filter(e => e.pay !== 'credito');
    exps.forEach(e => {
      const d = new Date(e.data + 'T00:00:00');
      if (d >= inicioSem && d <= hoje) semAtual += e.valor;
      if (d >= inicioAnt && d < inicioSem) semAnt += e.valor;
    });
  });

  const diff   = semAtual - semAnt;
  const diffPct = semAnt > 0 ? Math.round((diff / semAnt) * 100) : null;
  return { semAtual, semAnt, diff, diffPct };
}

// ── 3. Gasto por dia da semana ────────────────────────────────
function calcGastoPorDia() {
  const dias  = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const totais = [0, 0, 0, 0, 0, 0, 0];
  const contagem = [0, 0, 0, 0, 0, 0, 0]; // para calcular média

  // Usa histórico de 3 meses
  const history = getMonthlyHistory(3);
  const keysUsed = new Set();

  history.forEach(h => {
    const key = h.key;
    if (keysUsed.has(key)) return;
    keysUsed.add(key);
    const exps = (_cache.expenses[key] || []).filter(e => e.pay !== 'credito');
    exps.forEach(e => {
      const d   = new Date(e.data + 'T00:00:00');
      let dow   = d.getDay(); // 0=dom
      // Converte para seg=0 ... dom=6
      dow = dow === 0 ? 6 : dow - 1;
      totais[dow]   += e.valor;
      contagem[dow] += 1;
    });
  });

  return { dias, totais, contagem };
}

// ── Render: widget de previsão (mobile home + sidebar) ────────
function renderPrevisao() {
  const p = calcPrevisao();

  // Mobile
  const elM = document.getElementById('previsaoHome');
  // Sidebar
  const elD = document.getElementById('previsaoSidebar');

  if (!p) {
    const emptyHtml = `<div class="prev-empty">
      <div class="prev-empty-icon">${uiIcon('chartUp','var(--text3)')}</div>
      <div class="prev-empty-txt">Previsão disponível após 3 meses de uso</div>
    </div>`;
    if (elM) elM.innerHTML = emptyHtml;
    if (elD) elD.innerHTML = emptyHtml;
    return;
  }

  const pct    = p.media > 0 ? Math.min(100, Math.round(p.projecao / p.media * 100)) : 0;
  const danger = p.projecao > p.media;
  const barColor = danger ? 'var(--red)' : 'var(--accent)';
  const projColor = danger ? 'var(--red)' : 'var(--accent)';

  const htmlM = `
    <div class="m-cat-title">📈 previsão do mês</div>
    <div class="prev-card">
      <div class="prev-row">
        <span class="prev-label">Projeção final</span>
        <span class="prev-val" style="color:${projColor}">${fmt(p.projecao)}</span>
      </div>
      <div class="prev-row">
        <span class="prev-label">Média ${p.meses} meses</span>
        <span class="prev-val" style="color:var(--text2)">${fmt(p.media)}</span>
      </div>
      <div class="bar-bg" style="margin-top:8px">
        <div class="bar-fill" style="width:${pct}%;background:${barColor}"></div>
      </div>
      <div style="font-size:10px;color:var(--text3);margin-top:3px">
        ${p.ritmo}% do mês · ${danger ? '⚠ acima da média' : '✓ dentro da média'}
      </div>
    </div>`;

  const htmlD = `
    <div class="s-label" style="margin-top:16px">📈 previsão</div>
    <div style="margin-bottom:14px">
      <div style="font-size:11px;color:var(--text2);margin-bottom:4px">
        Projeção: <span style="color:${projColor};font-family:var(--mono);font-weight:500">${fmt(p.projecao)}</span>
      </div>
      <div style="font-size:10px;color:var(--text3);margin-bottom:6px">
        Média: ${fmt(p.media)} · ${p.ritmo}% do mês
      </div>
      <div class="sbar-bg">
        <div class="sbar-fill" style="width:${pct}%;background:${barColor}"></div>
      </div>
      <div style="font-size:10px;color:${danger ? 'var(--red)' : 'var(--text3)'};margin-top:3px">
        ${danger ? '⚠ acima da média' : '✓ dentro da média'}
      </div>
    </div>`;

  if (elM) elM.innerHTML = htmlM;
  if (elD) elD.innerHTML = htmlD;
}

// ── Render: resumo semanal (mobile home) ──────────────────────
function renderResumoSemanal() {
  const el = document.getElementById('resumoSemHome');
  if (!el) return;

  const r = calcResumoSemanal();
  if (r.semAtual === 0 && r.semAnt === 0) { el.innerHTML = ''; return; }

  const up      = r.diff >= 0;
  const arrow   = up ? '↑' : '↓';
  const color   = up ? 'var(--red)' : 'var(--accent)';
  const pctTxt  = r.diffPct !== null ? ` (${Math.abs(r.diffPct)}%)` : '';

  el.innerHTML = `
    <div class="m-cat-title">📅 esta semana</div>
    <div class="sem-card">
      <div class="sem-row">
        <span class="sem-label">Esta semana</span>
        <span class="sem-val">${fmt(r.semAtual)}</span>
      </div>
      <div class="sem-row">
        <span class="sem-label">Semana passada</span>
        <span class="sem-val" style="color:var(--text2)">${fmt(r.semAnt)}</span>
      </div>
      ${r.semAnt > 0 ? `
      <div class="sem-diff" style="color:${color}">
        ${arrow} ${fmt(Math.abs(r.diff))}${pctTxt} em relação à semana passada
      </div>` : ''}
    </div>`;
}

// ── Render: gráfico dia da semana (painel gráficos) ───────────
let _dowChart = null;

function renderDowChart() {
  const canvas = document.getElementById('dowChart');
  if (!canvas) return;

  const { dias, totais } = calcGastoPorDia();
  const maxVal = Math.max(...totais);

  if (_dowChart) { _dowChart.destroy(); _dowChart = null; }

  if (maxVal === 0) {
    canvas.parentElement.innerHTML =
      '<div class="empty" style="padding:32px">Sem dados suficientes ainda.</div>';
    return;
  }

  _dowChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: dias,
      datasets: [{
        label: 'Gastos',
        data: totais,
        backgroundColor: totais.map((v, i) => {
          if (v === maxVal) return '#f06060cc';
          return i >= 5 ? '#a888f0cc' : '#60a8f0cc'; // fim de semana roxo
        }),
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ' ' + fmt(ctx.raw)
          }
        }
      },
      scales: {
        x: {
          grid:  { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#888', font: { family: 'IBM Plex Mono', size: 11 } }
        },
        y: {
          grid:  { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#888', font: { family: 'IBM Plex Mono', size: 10 },
                   callback: v => 'R$' + (v >= 1000 ? (v/1000).toFixed(1)+'k' : v) }
        }
      }
    }
  });
}
