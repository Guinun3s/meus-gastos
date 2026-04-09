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

  // Hero saldo (mobile)
  const srM = document.getElementById('saldoRealM');
  const spm = document.getElementById('saldoPctM');
  if (srM) {
    srM.textContent = (saldoReal < 0 ? '−' : '') + fmt(Math.abs(saldoReal));
    srM.className = 'card-val m-hero-val ' + (saldoReal >= 0 ? 'green' : 'red');
  }
  if (spm) spm.textContent = receita > 0 ? Math.round(totalAll / receita * 100) + '% utilizado' : 'sem receita lançada';

  const pct = receita > 0 ? Math.round(totalAll / receita * 100) + '% da receita' : 'sem receita lançada';
  document.getElementById('saldoPct').textContent = pct;

  renderMobileExtras(receita, totalAll, ct, saldoBanco, saldoDin);
  renderSidebar();
}

function renderMobileExtras(receita, total, ct, saldoBanco, saldoDin) {
  const el = document.getElementById('mHomeExtras');
  if (!el) return;

  let html = '';

  // Barra de progresso do mês
  if (receita > 0) {
    const usedPct = Math.min(100, Math.round(total / receita * 100));
    const saldo   = receita - total;
    const barColor = total > receita ? 'var(--red)' : 'var(--accent)';
    html += `<div class="m-progress-card">
      <div class="m-progress-row">
        <span class="m-progress-label">Utilizado do mês</span>
        <span class="m-progress-pct" style="color:${barColor}">${usedPct}%</span>
      </div>
      <div class="m-progress-bar-bg">
        <div class="m-progress-bar-fill" style="width:${usedPct}%;background:${barColor}"></div>
      </div>
      <div class="m-progress-msg" style="color:${saldo >= 0 ? 'var(--accent)' : 'var(--red)'}">
        ${saldo >= 0 ? '✓ Sobra ' + fmt(saldo) : '⚠ Excedeu ' + fmt(Math.abs(saldo))}
      </div>
    </div>`;
  }

  // Top 3 categorias
  const active = CATS.filter(c => ct[c.id] > 0).sort((a, b) => ct[b.id] - ct[a.id]);
  if (active.length) {
    const top3 = active.slice(0, 3);
    const hasMore = active.length > 3;
    html += `<div class="m-section-hdr">
      <span class="m-section-title">Top categorias</span>
      ${hasMore ? `<button class="m-section-link" onclick="switchMobilePage('lancamentos', document.querySelector('.nav-btn:nth-child(2))'))">ver todas →</button>` : ''}
    </div>`;
    html += `<div class="m-top-cats">`;
    html += top3.map(c => {
      const iconHtml = isNeonTheme()
        ? `<span class="neon-cat-mini">${catIconSVG(c.id)}</span>`
        : `<span class="m-top-cat-dot" style="background:${c.color}"></span>`;
      return `<div class="m-top-cat-row">
        ${iconHtml}
        <span class="m-top-cat-name">${c.name}</span>
        <span class="m-top-cat-val">${fmt(ct[c.id])}</span>
      </div>`;
    }).join('');
    html += `</div>`;
  }

  // Cartões (compacto — só se tiver gasto)
  const cards = _cache.cards || [];
  const allExps = _cache.expenses[mKey()] || [];
  const cardsComGasto = cards.filter(c =>
    allExps.some(e => e.pay === 'credito' && e.cardId === c.id)
  );
  if (cardsComGasto.length) {
    html += `<div class="m-section-hdr"><span class="m-section-title">Cartões</span></div>`;
    html += `<div class="m-top-cats">`;
    cardsComGasto.forEach(c => {
      const gasto  = allExps.filter(e => e.pay === 'credito' && e.cardId === c.id).reduce((s, e) => s + e.valor, 0);
      const pct    = c.limit > 0 ? Math.min(100, Math.round(gasto / c.limit * 100)) : 0;
      const danger = pct >= 80;
      html += `<div class="m-top-cat-row">
        <span class="m-top-cat-dot" style="background:${danger ? 'var(--red)' : c.color}"></span>
        <span class="m-top-cat-name">${c.name}</span>
        <span class="m-top-cat-val" style="color:${danger ? 'var(--red)' : 'var(--text2)'}">
          ${fmt(gasto)} <span style="font-size:10px;color:var(--text3)">/ ${fmt(c.limit)}</span>
        </span>
      </div>`;
    });
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
          ${uiIcon('card')}
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
          const iconHtml = isNeonTheme()
            ? `<span class="neon-sidebar-icon">${catIconSVG(c.id)}</span>`
            : `<span class="scat-dot" style="background:${c.color}"></span>`;
          return `<div style="margin-bottom:6px">
            <div class="scat-top">
              <span style="display:flex;align-items:center;gap:5px">${iconHtml}<span class="scat-name">${c.name}</span></span>
              <span class="scat-val">${fmt(ct[c.id])}</span>
            </div>
            <div class="sbar-bg">
              <div class="sbar-fill" style="width:${p}%;background:${c.color}"></div>
            </div>
          </div>`;
        }).join('')
      : '<div style="font-size:11px;color:var(--text3)">Nenhum gasto ainda.</div>';
  }

  // Cartões na sidebar
  const scards = document.getElementById('sidebarCards');
  if (scards) {
    const cards = _cache.cards || [];
    const allExpsS = _cache.expenses[mKey()] || [];
    if (cards.length) {
      scards.innerHTML = cards.map(c => {
        const gasto  = allExpsS.filter(e => e.pay === 'credito' && e.cardId === c.id)
                               .reduce((s, e) => s + e.valor, 0);
        const pct    = c.limit > 0 ? Math.min(100, Math.round(gasto / c.limit * 100)) : 0;
        const danger = pct >= 80;
        const barColor = danger ? 'var(--red)' : c.color;
        return `<div style="margin-bottom:10px">
          <div class="scat-top">
            <span class="scat-name" style="color:${c.color}">${c.name}</span>
            <span class="scat-val" style="color:${danger ? 'var(--red)' : 'var(--text2)'}">
              ${fmt(gasto)} <span style="color:var(--text3);font-size:10px">/ ${fmt(c.limit)}</span>
            </span>
          </div>
          <div class="sbar-bg">
            <div class="sbar-fill" style="width:${pct}%;background:${barColor}"></div>
          </div>
          <div style="font-size:10px;color:${danger ? 'var(--red)' : 'var(--text3)'};margin-top:3px">
            ${pct}% do limite${danger ? ' ⚠' : ''}
          </div>
        </div>`;
      }).join('');
    } else {
      scards.innerHTML = '';
    }
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
