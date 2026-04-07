// ============================================================
// js/summary.js — cards de resumo, sidebar e extras do mobile
// ============================================================

function renderSummary() {
  const list     = loadExp();
  const bal      = loadBal();
  const ct       = catTotals();
  const totalAll = list.reduce((s, e) => s + e.valor, 0);
  const invest   = ct['investimento'] || 0;
  const gastos   = totalAll - invest;
  const saldoReal = bal - totalAll;

  document.getElementById('monthLabel').textContent   = capitalize(mName());
  document.getElementById('balanceDisp').textContent  = fmt(bal);
  document.getElementById('totalGasto').textContent   = fmt(gastos);
  document.getElementById('nLanc').textContent        = list.length + ' lançamento' + (list.length !== 1 ? 's' : '');
  document.getElementById('totalInvest').textContent  = fmt(invest);

  const sr = document.getElementById('saldoReal');
  sr.textContent = (saldoReal < 0 ? '−' : '') + fmt(Math.abs(saldoReal));
  sr.className   = 'card-val ' + (saldoReal >= 0 ? 'green' : 'red');

  document.getElementById('saldoPct').textContent =
    bal > 0 ? Math.round(totalAll / bal * 100) + '% do saldo' : 'informe seu saldo';

  renderMobileExtras(bal, totalAll, ct);
}

function renderMobileExtras(bal, total, ct) {
  const el = document.getElementById('mHomeExtras');
  if (!el) return;

  const active = CATS.filter(c => ct[c.id] > 0).sort((a, b) => ct[b.id] - ct[a.id]);
  const grand  = Object.values(ct).reduce((s, v) => s + v, 0);
  let html = '';

  if (bal > 0) {
    const saldo   = bal - total;
    const usedPct = Math.min(100, Math.round(total / bal * 100));
    html += `<div class="sit-wrap">
      <div class="sit-row">
        <span>Gasto: <b>${fmt(total)}</b></span>
        <span>de <b>${fmt(bal)}</b></span>
      </div>
      <div class="sbar-bg">
        <div class="sbar-fill" style="width:${usedPct}%;background:${total > bal ? 'var(--red)' : 'var(--accent)'}"></div>
      </div>
      <div class="sit-msg" style="color:${saldo >= 0 ? 'var(--accent)' : 'var(--red)'}">
        ${saldo >= 0 ? '✓ Sobra ' + fmt(saldo) : '⚠ Excedeu ' + fmt(Math.abs(saldo))}
      </div>
    </div>`;
  }

  if (active.length) {
    html += `<div class="m-cat-title">por categoria</div><div class="m-cat-list">`;
    html += active.map(c => {
      const p = grand > 0 ? Math.round(ct[c.id] / grand * 100) : 0;
      return `<div class="m-cat-row">
        <div class="m-cat-top">
          <span class="m-cat-name">${c.name}</span>
          <span class="m-cat-amt">${fmt(ct[c.id])}</span>
        </div>
        <div class="bar-bg">
          <div class="bar-fill" style="width:${p}%;background:${c.color}"></div>
        </div>
      </div>`;
    }).join('');
    html += `</div>`;
  }

  el.innerHTML = html;
}

function renderSidebar() {
  const ct     = catTotals();
  const grand  = Object.values(ct).reduce((s, v) => s + v, 0);
  const bal    = loadBal();
  const total  = loadExp().reduce((s, e) => s + e.valor, 0);
  const saldo  = bal - total;
  const active = CATS.filter(c => ct[c.id] > 0).sort((a, b) => ct[b.id] - ct[a.id]);

  const sc = document.getElementById('sidebarCats');
  if (sc) {
    sc.innerHTML = active.length
      ? active.map(c => {
          const p = grand > 0 ? Math.round(ct[c.id] / grand * 100) : 0;
          return `<div>
            <div class="scat-top">
              <span class="scat-name">${c.name}</span>
              <span class="scat-val">${fmt(ct[c.id])}</span>
            </div>
            <div class="sbar-bg">
              <div class="sbar-fill" style="width:${p}%;background:${c.color}"></div>
            </div>
          </div>`;
        }).join('')
      : '<div style="font-size:11px;color:var(--text3)">Nenhum gasto ainda.</div>';
  }

  const ss = document.getElementById('sidebarSit');
  if (ss) {
    ss.innerHTML = bal > 0
      ? `<div>
          <div class="s-label">situação</div>
          <div style="font-size:11px;color:var(--text2);margin-bottom:6px">
            Gasto: ${fmt(total)} / ${fmt(bal)}
          </div>
          <div class="sbar-bg">
            <div class="sbar-fill"
              style="width:${Math.min(100, Math.round(total / bal * 100))}%;
                     background:${total > bal ? 'var(--red)' : 'var(--accent)'}">
            </div>
          </div>
          <div style="font-size:11px;margin-top:5px;color:${saldo >= 0 ? 'var(--accent)' : 'var(--red)'}">
            ${saldo >= 0 ? 'Sobra ' + fmt(saldo) : 'Excedeu ' + fmt(Math.abs(saldo))}
          </div>
        </div>`
      : '';
  }
}
