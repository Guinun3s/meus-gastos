// ============================================================
// js/templates.js — templates de lançamentos frequentes
// ============================================================

const TEMPLATES_KEY = 'msd_templates';

function loadTemplates() {
  try { return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '[]'); }
  catch { return []; }
}

function saveTemplates(list) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(list));
}

// ── Salvar lançamento atual como template ──────────────────
function saveCurrentAsTemplate() {
  const desc  = document.getElementById('mDesc')?.value.trim()
             || document.getElementById('desc')?.value.trim();
  const valor = parseFloat(document.getElementById('mValor')?.value
             || document.getElementById('valor')?.value);
  const cat   = document.getElementById('mCatSelect')?.value
             || document.getElementById('catSelect')?.value;
  const pay   = document.getElementById('mPaySelect')?.value
             || document.getElementById('paySelect')?.value;

  if (!desc) { toast('Preencha a descrição antes de salvar o template.'); return; }

  const templates = loadTemplates();
  // Evita duplicata por descrição
  if (templates.some(t => t.desc.toLowerCase() === desc.toLowerCase())) {
    toast('Template "' + desc + '" já existe.'); return;
  }

  templates.unshift({ id: Date.now(), desc, valor: valor || 0, cat: cat || 'outros', pay: pay || 'pix' });
  if (templates.length > 20) templates.splice(20); // máx 20 templates
  saveTemplates(templates);
  toast('Template salvo!');
  renderTemplatesList();
}

// ── Aplicar template ao formulário ────────────────────────
function applyTemplate(id) {
  const t = loadTemplates().find(t => t.id === id);
  if (!t) return;

  const isMob = isMobile();
  const descEl  = document.getElementById(isMob ? 'mDesc'      : 'desc');
  const valorEl = document.getElementById(isMob ? 'mValor'     : 'valor');
  const catEl   = document.getElementById(isMob ? 'mCatSelect' : 'catSelect');
  const payEl   = document.getElementById(isMob ? 'mPaySelect' : 'paySelect');

  if (descEl)  descEl.value  = t.desc;
  if (valorEl) valorEl.value = t.valor || '';
  if (catEl)   catEl.value   = t.cat;
  if (payEl)   payEl.value   = t.pay;

  // Atualiza UI dependente
  if (typeof onCatChange === 'function' && catEl) onCatChange(catEl);
  if (typeof onPayChange === 'function' && payEl) onPayChange(payEl);

  closeTemplatesPanel();
  toast('Template aplicado!');
}

// ── Deletar template ───────────────────────────────────────
function deleteTemplate(id) {
  const list = loadTemplates().filter(t => t.id !== id);
  saveTemplates(list);
  renderTemplatesList();
}

// ── Render da lista ────────────────────────────────────────
function renderTemplatesList() {
  const el = document.getElementById('templatesList');
  if (!el) return;

  const templates = loadTemplates();
  if (!templates.length) {
    el.innerHTML = `<div class="tpl-empty">
      <div style="font-size:12px;color:var(--text3)">Nenhum template salvo.<br>Preencha um lançamento e clique em "Salvar template".</div>
    </div>`;
    return;
  }

  el.innerHTML = templates.map(t => {
    const cat = catById(t.cat);
    const iconHtml = isNeonTheme()
      ? `<span class="neon-cat-mini">${catIconSVG(t.cat)}</span>`
      : `<span class="tpl-dot" style="background:${cat.color}"></span>`;
    return `<div class="tpl-row">
      <button class="tpl-apply" onclick="applyTemplate(${t.id})" title="Aplicar">
        ${iconHtml}
        <div class="tpl-info">
          <span class="tpl-desc">${t.desc}</span>
          <span class="tpl-meta">${cat.name} · ${PAY_LABELS[t.pay] || t.pay}${t.valor ? ' · ' + fmt(t.valor) : ''}</span>
        </div>
      </button>
      <button class="tpl-del" onclick="deleteTemplate(${t.id})" title="Remover">✕</button>
    </div>`;
  }).join('');
}

// ── Abrir / fechar painel de templates ─────────────────────
function openTemplatesPanel() {
  renderTemplatesList();
  const panel = document.getElementById('templatesPanel');
  if (panel) panel.classList.add('open');
}

function closeTemplatesPanel() {
  const panel = document.getElementById('templatesPanel');
  if (panel) panel.classList.remove('open');
}
