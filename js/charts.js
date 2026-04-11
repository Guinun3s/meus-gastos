// ============================================================
// js/charts.js — gráficos do mês atual + histórico comparativo
// ============================================================

const charts = {};
const TICK_FONT   = { family: "'IBM Plex Mono'", size: 10 };
const GRID_COLOR  = '#2a2a2e';
const BORDER_COLOR = '#141416';

function destroyCharts() {
  ['pieChart', 'lineChart', 'barChart', 'payChart'].forEach(id => {
    if (charts[id]) { charts[id].destroy(); delete charts[id]; }
  });
}

// ── Pizza: distribuição por categoria ────────────────────────
function renderPieChart(ct) {
  const active = CATS.filter(c => ct[c.id] > 0);
  if (!active.length) return;

  charts['pieChart'] = new Chart(document.getElementById('pieChart'), {
    type: 'doughnut',
    data: {
      labels: active.map(c => c.name),
      datasets: [{
        data: active.map(c => ct[c.id]),
        backgroundColor: active.map(c => c.color),
        borderWidth: 2, borderColor: BORDER_COLOR,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ' ' + fmt(ctx.raw) } },
      },
      cutout: '58%',
    },
  });

  document.getElementById('pieLegend').innerHTML = active
    .map(c => `<div class="leg-item"><div class="leg-dot" style="background:${c.color}"></div>${c.name}</div>`)
    .join('');
}

// ── Linha: evolução acumulada no mês ─────────────────────────
function renderLineChart(list) {
  const days  = new Date(curYear, curMonth + 1, 0).getDate();
  const daily = Array(days).fill(0);

  list.forEach(e => {
    const d = parseInt(e.data.slice(-2)) - 1;
    if (d >= 0 && d < days) daily[d] += e.valor;
  });

  const cum = daily.reduce((acc, v, i) => {
    acc.push((acc[i - 1] || 0) + v);
    return acc;
  }, []);

  charts['lineChart'] = new Chart(document.getElementById('lineChart'), {
    type: 'line',
    data: {
      labels: Array.from({ length: days }, (_, i) => i + 1),
      datasets: [{
        data: cum,
        borderColor: '#c8f060',
        backgroundColor: 'rgba(200,240,96,0.06)',
        tension: .35, fill: true, pointRadius: 2, borderWidth: 1.5,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ' ' + fmt(ctx.raw) } },
      },
      scales: {
        x: { ticks: { font: TICK_FONT, color: '#52525a', maxTicksLimit: 10 }, grid: { color: GRID_COLOR } },
        y: { ticks: { font: TICK_FONT, color: '#52525a', callback: v => 'R$' + v.toLocaleString('pt-BR') }, grid: { color: GRID_COLOR } },
      },
    },
  });
}

// ── Pizza: por forma de pagamento ─────────────────────────────
function renderPayChart(list) {
  const payT = {};
  list.forEach(e => { payT[e.pay] = (payT[e.pay] || 0) + e.valor; });
  const payK = Object.keys(payT).filter(k => payT[k] > 0);
  if (!payK.length) return;

  charts['payChart'] = new Chart(document.getElementById('payChart'), {
    type: 'doughnut',
    data: {
      labels: payK.map(k => PAY_LABELS[k] || k),
      datasets: [{
        data: payK.map(k => payT[k]),
        backgroundColor: payK.map(k => PAY_COLORS[k] || '#585860'),
        borderWidth: 2, borderColor: BORDER_COLOR,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ' ' + fmt(ctx.raw) } },
      },
      cutout: '58%',
    },
  });

  document.getElementById('payLegend').innerHTML = payK
    .map(k => `<div class="leg-item"><div class="leg-dot" style="background:${PAY_COLORS[k] || '#585860'}"></div>${PAY_LABELS[k] || k}</div>`)
    .join('');
}

// ── Barras horizontais: gasto × orçamento ────────────────────
function renderBarChart(ct, budgets) {
  const bCats = CATS.filter(c => ct[c.id] > 0 || (parseFloat(budgets[c.id]) || 0) > 0);
  const bh    = Math.max(220, bCats.length * 42 + 60);
  document.getElementById('barWrap').style.height = bh + 'px';

  charts['barChart'] = new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels: bCats.map(c => c.name),
      datasets: [
        { label: 'Gasto',     data: bCats.map(c => ct[c.id]),                       backgroundColor: bCats.map(c => c.color), borderRadius: 3 },
        { label: 'Orçamento', data: bCats.map(c => parseFloat(budgets[c.id]) || 0), backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3 },
      ],
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { font: { family: "'IBM Plex Mono'", size: 11 }, color: '#8a8a90' } },
        tooltip: { callbacks: { label: ctx => ' ' + fmt(ctx.raw) } },
      },
      scales: {
        x: { ticks: { font: TICK_FONT, color: '#52525a', callback: v => 'R$' + v.toLocaleString('pt-BR') }, grid: { color: GRID_COLOR } },
        y: { ticks: { font: { family: "'IBM Plex Mono'", size: 11 }, color: '#e8e8ea' }, grid: { display: false } },
      },
    },
  });
}

// ── Renderiza todos os gráficos do mês ────────────────────────
function renderCharts() {
  const list    = loadExp();
  const ct      = catTotals();
  const budgets = loadBud();

  destroyCharts();
  renderPieChart(ct);
  renderLineChart(list);
  renderPayChart(list);
  renderBarChart(ct, budgets);
}


// ════════════════════════════════════════════════════════════
// HISTÓRICO COMPARATIVO (últimos 6 meses)
// ════════════════════════════════════════════════════════════

function renderHistoryPanel() {
  const data = getMonthlyHistory(6);
  // Renderiza no canvas correto conforme o dispositivo
  _renderHistoryChart(data, isMobile() ? 'historyChartM' : 'historyChart');
  _renderHistoryTable(data, isMobile() ? 'historyTableM' : 'historyTable');
}

// ── Gráfico de barras agrupadas: gastos vs investimentos ──────
function _renderHistoryChart(data, canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  if (charts[canvasId]) {
    charts[canvasId].destroy();
    delete charts[canvasId];
  }

  charts[canvasId] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: data.map(d => d.label),
      datasets: [
        {
          label: 'Gastos',
          data: data.map(d => d.gastos),
          backgroundColor: data.map(d =>
            // Destaca o mês atual
            d.month === curMonth && d.year === curYear ? '#c8f060' : 'rgba(200,240,96,0.35)'
          ),
          borderRadius: 4,
        },
        {
          label: 'Investimentos',
          data: data.map(d => d.invest),
          backgroundColor: 'rgba(240,184,96,0.5)',
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { font: { family: "'IBM Plex Mono'", size: 11 }, color: '#8a8a90' },
        },
        tooltip: {
          callbacks: {
            label: ctx => ' ' + ctx.dataset.label + ': ' + fmt(ctx.raw),
          },
        },
      },
      scales: {
        x: {
          stacked: false,
          ticks: { font: TICK_FONT, color: '#8a8a90' },
          grid:  { color: GRID_COLOR },
        },
        y: {
          ticks: { font: TICK_FONT, color: '#52525a', callback: v => 'R$' + v.toLocaleString('pt-BR') },
          grid:  { color: GRID_COLOR },
        },
      },
    },
  });
}

// ── Tabela resumo mensal ──────────────────────────────────────
function _renderHistoryTable(data, tableId = 'historyTable') {
  const el = document.getElementById(tableId);
  if (!el) return;

  const isCurrentMonth = d => d.month === curMonth && d.year === curYear;

  el.innerHTML = `
    <table class="hist-table">
      <thead>
        <tr>
          <th>Mês</th>
          <th class="r">Gastos</th>
          <th class="r">Investido</th>
          <th class="r">Total saído</th>
          <th class="r">Receita</th>
          <th class="r">Saldo real</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(d => {
          const saldoReal = d.receita - d.total;
          const current   = isCurrentMonth(d);
          return `<tr class="${current ? 'hist-current' : ''}">
            <td>${d.label}${current ? ' <span class="hist-badge">atual</span>' : ''}</td>
            <td class="r td-r">${fmt(d.gastos)}</td>
            <td class="r" style="color:var(--amber)">${d.invest > 0 ? fmt(d.invest) : '—'}</td>
            <td class="r td-r">${fmt(d.total)}</td>
            <td class="r" style="color:var(--accent)">${d.receita > 0 ? fmt(d.receita) : '—'}</td>
            <td class="r" style="color:${saldoReal >= 0 ? 'var(--accent)' : 'var(--red)'}">
              ${d.receita > 0 ? (saldoReal < 0 ? '−' : '') + fmt(Math.abs(saldoReal)) : '—'}
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}
