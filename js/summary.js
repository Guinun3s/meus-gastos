// ============================================================
// js/summary.js — cards de resumo, sidebar e extras do mobile
// ============================================================

function renderSummary() {
  const list       = loadExp();
  const ct         = catTotals();
  const totalAll   = list.reduce((s, e) => s + e.valor, 0);
  const invest     = ct['investimento'] || 0;
  const gastos     = totalAll - invest;
  const receita    = calcReceitaTotal();
  const saldoReal  = calcSaldoReal();
  const saldoBanco = calcSaldoBanco();
  const saldoDin   = calcSaldoDinheiro();

  document.getElementById('monthLabel').textContent    = capitalize(mName());
  document.getElementById('totalReceita').textContent  = fmt(receita);
  document.getElementById('totalGasto').textContent    = fmt(gastos);
  document.getElementById('nLanc').textContent         = list.length + ' lançamento' + (list.length !== 1 ? 's' : '');
  document.getElementById('totalInvest').textContent   = fmt(invest);

  const sr = document.getElementById('saldoReal');
  sr.textContent = (saldoReal < 0 ? '−' : '') + fmt(Math.abs(saldoReal));
  sr.className   = 'card-val ' + (saldoReal >= 0 ? 'green' : 'red');

  const pct = receita > 0 ? Math.round(totalAll / receita * 100) + '% da receita' : 'sem receita lançada';
  document.getElementById('saldoPct').textContent = pct;

  renderMobileExtras(receita, totalAll, ct, saldoBanco, saldoDin);
  renderSidebar();
}

function renderMobileExtras(receita, total, ct, saldoBanco, saldoDin) {
  const el = document.getElementById('mHomeExtras');
  if (!el) return;

  const active = CATS.filter(c => ct[c.id] > 0).sort((a, b) => ct[b.id] - ct[a.id]);
  const grand  = Object.values(ct).reduce((s, v) => s + v, 0);
  let html = '';

  // Painel banco / dinheiro
  html += `<div class="m-saldo-split">
    <div class="m-saldo-item">
      <span class="m-saldo-icon">💳</span>
      <div>
        <div class="m-saldo-label">Banco</div>
        <div class="m-saldo-val ${saldoBanco >= 0 ? 'green' : 'red'}">${(saldoBanco < 0 ? '−' : '') + fmt(Math.abs(saldoBanco))}</div>
      </div>
    </div>
    <div class="m-saldo-item">
      <span class="m-saldo-icon">💵</span>
      <div>
        <div class="m-saldo-label">Dinheiro</div>
        <div class="m-saldo-val ${saldoDin >= 0 ? 'green' : 'red'}">${(saldoDin < 0 ? '−' : '') + fmt(Math.abs(saldoDin))}</div>
      </div>
    </div>
  </div>`;

  if (receita > 0) {
    const usedPct = Math.min(100, Math.round(total / receita * 100));
    const saldo   = receita - total;
    html += `<div class="sit-wrap">
      <div class="sit-row">
        <span>Gasto: <b>${fmt(total)}</b></span>
        <span>de <b>${fmt(receita)}</b></span>
      </div>
      <div class="sbar-bg">
        <div class="sbar-fill" style="width:${usedPct}%;background:${total > receita ? 'var(--red)' : 'var(--accent)'}"></div>
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
  const ct         = catTotals();
  const grand      = Object.values(ct).reduce((s, v) => s + v, 0);
  const total      = loadExp().reduce((s, e) => s + e.valor, 0);
  const receita    = calcReceitaTotal();
  const saldoBanco = calcSaldoBanco();
  const saldoDin   = calcSaldoDinheiro();
  const saldo      = calcSaldoReal();
  const active     = CATS.filter(c => ct[c.id] > 0).sort((a, b) => ct[b.id] - ct[a.id]);

  const sb = document.getElementById('sidebarBalance');
  if (sb) {
    sb.innerHTML = `
      <div class="s-label">saldo disponível</div>
      <div class="s-bal-split">
        <div class="s-bal-item">
          <span class="s-bal-icon">💳</span>
          <div>
            <div class="s-bal-sub">Banco</div>
            <div class="s-bal-val ${saldoBanco >= 0 ? 'green' : 'red'}">${(saldoBanco < 0 ? '−' : '') + fmt(Math.abs(saldoBanco))}</div>
          </div>
        </div>
        <div class="s-bal-item">
          <span class="s-bal-icon">💵</span>
          <div>
            <div class="s-bal-sub">Dinheiro</div>
            <div class="s-bal-val ${saldoDin >= 0 ? 'green' : 'red'}">${(saldoDin < 0 ? '−' : '') + fmt(Math.abs(saldoDin))}</div>
          </div>
        </div>
      </div>`;
  }

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
    ss.innerHTML = receita > 0
      ? `<div>
          <div class="s-label">situação</div>
          <div style="font-size:11px;color:var(--text2);margin-bottom:6px">
            Gasto: ${fmt(total)} / ${fmt(receita)}
          </div>
          <div class="sbar-bg">
            <div class="sbar-fill"
              style="width:${Math.min(100, Math.round(total / receita * 100))}%;
                     background:${total > receita ? 'var(--red)' : 'var(--accent)'}">
            </div>
          </div>
          <div style="font-size:11px;margin-top:5px;color:${saldo >= 0 ? 'var(--accent)' : 'var(--red)'}">
            ${saldo >= 0 ? 'Sobra ' + fmt(saldo) : 'Excedeu ' + fmt(Math.abs(saldo))}
          </div>
        </div>`
      : '';
  }
}
