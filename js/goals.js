// ============================================================
// js/goals.js — metas financeiras
//
// Estrutura de uma meta:
// {
//   id:       number (timestamp),
//   name:     string,   // ex: "Carro novo"
//   target:   number,   // valor alvo em R$
//   saved:    number,   // total guardado (soma dos aportes)
//   deadline: string,   // data alvo (YYYY-MM-DD) — opcional
//   icon:     string,   // emoji escolhido
//   color:    string,   // cor do card
// }
//
// Cada aporte também gera um lançamento no mês atual,
// categoria "investimento", descontando do saldo real.
// ============================================================

const GOAL_ICONS   = ['🎯','🚗','✈️','🏠','📱','💻','🎓','💍','🏖️','🏋️','🎸','📷','⛵','🌍','💰'];
const GOAL_COLORS  = ['#7ab648','#60a8f0','#a888f0','#f0b860','#f06060','#50c8a0','#e878c0','#c8f060'];

// ── CRUD ─────────────────────────────────────────────────────
function addGoal() {
  const name     = document.getElementById('goalName').value.trim();
  const target   = parseFloat(document.getElementById('goalTarget').value);
  const saved    = parseFloat(document.getElementById('goalSaved').value) || 0;
  const deadline = document.getElementById('goalDeadline').value;
  const icon     = document.querySelector('.icon-opt.selected')?.dataset.icon || '🎯';
  const color    = document.querySelector('.color-opt.selected')?.dataset.color || GOAL_COLORS[0];

  if (!name || isNaN(target) || target <= 0) {
    toast('Preencha o nome e o valor alvo da meta.');
    return;
  }

  const goals = loadGoals();

  if (_editingGoalId) {
    const idx = goals.findIndex(g => g.id === _editingGoalId);
    if (idx !== -1) goals[idx] = { ...goals[idx], name, target, saved, deadline, icon, color };
    _editingGoalId = null;
  } else {
    goals.push({ id: Date.now(), name, target, saved, deadline, icon, color });
  }

  saveGoals(goals);
  closeGoalForm();
  renderGoals();
  toast('Meta salva!');
}

function deleteGoal(id) {
  if (!confirm('Remover esta meta?')) return;
  saveGoals(loadGoals().filter(g => g.id !== id));
  renderGoals();
  toast('Meta removida.');
}

function editGoal(id) {
  const g = loadGoals().find(g => g.id === id);
  if (!g) return;

  _editingGoalId = id;
  openGoalForm();

  document.getElementById('goalName').value     = g.name;
  document.getElementById('goalTarget').value   = g.target;
  document.getElementById('goalSaved').value    = g.saved || '';
  document.getElementById('goalDeadline').value = g.deadline || '';

  document.querySelectorAll('.icon-opt').forEach(el => {
    el.classList.toggle('selected', el.dataset.icon === g.icon);
  });
  document.querySelectorAll('.color-opt').forEach(el => {
    el.classList.toggle('selected', el.dataset.color === g.color);
  });

  document.getElementById('goalFormTitle').textContent  = 'Editar meta';
  document.getElementById('goalFormSubmit').textContent = 'Salvar alterações';
}

function addSavedAmount(id) {
  const input = document.getElementById(`saved-input-${id}`);
  const val   = parseFloat(input?.value);
  if (!input || isNaN(val) || val <= 0) { toast('Digite um valor válido.'); return; }

  // 1. Atualiza o total guardado na meta
  const goals = loadGoals();
  const g     = goals.find(g => g.id === id);
  if (!g) return;
  g.saved = (parseFloat(g.saved) || 0) + val;
  saveGoals(goals);

  // 2. Registra um lançamento no mês atual para descontar do saldo
  //    Categoria: investimento | Descrição: "Meta: [nome]"
  const list = loadExp();
  list.push({
    id:    Date.now(),
    desc:  `Meta: ${g.name}`,
    valor: val,
    cat:   'meta',
    pay:   'transferencia',
    data:  today(),
  });
  list.sort((a, b) => b.data.localeCompare(a.data));
  saveExp(list);

  input.value = '';
  render();
  toast(`${fmt(val)} guardado para "${g.name}" e descontado do saldo!`);
}

// ── FORMULÁRIO ────────────────────────────────────────────────
function openGoalForm() {
  _editingGoalId = null;
  document.getElementById('goalName').value     = '';
  document.getElementById('goalTarget').value   = '';
  document.getElementById('goalSaved').value    = '';
  document.getElementById('goalDeadline').value = '';
  document.getElementById('goalFormTitle').textContent  = 'Nova meta';
  document.getElementById('goalFormSubmit').textContent = 'Criar meta';

  const icons  = document.querySelectorAll('.icon-opt');
  const colors = document.querySelectorAll('.color-opt');
  icons.forEach((el, i)  => el.classList.toggle('selected', i === 0));
  colors.forEach((el, i) => el.classList.toggle('selected', i === 0));

  if (isMobile()) openSheet('sheetGoal');
  else            openModal('modalGoal');
}

function closeGoalForm() {
  closeModal('modalGoal');
  closeSheet('sheetGoal');
  _editingGoalId = null;
}

// ── RENDER ────────────────────────────────────────────────────
function renderGoals() {
  const goals = loadGoals();
  const containers = ['goalsList', 'goalsListM'].map(id => document.getElementById(id)).filter(Boolean);
  if (!containers.length) return;

  if (!goals.length) {
    const empty = `<div class="goals-empty">
      <div class="goals-empty-icon">★</div>
      <div class="goals-empty-text">Nenhuma meta ainda.</div>
      <div class="goals-empty-sub">Crie sua primeira meta financeira!</div>
    </div>`;
    containers.forEach(c => c.innerHTML = empty);
    return;
  }

  const html = goals.map(g => {
    const saved    = parseFloat(g.saved) || 0;
    const target   = parseFloat(g.target) || 1;
    const pct      = Math.min(100, Math.round(saved / target * 100));
    const done     = saved >= target;
    const remaining = Math.max(0, target - saved);

    // Cálculo de tempo restante
    let timeHtml = '';
    if (g.deadline) {
      const daysLeft = Math.ceil((new Date(g.deadline) - new Date()) / 86400000);
      const label    = daysLeft < 0
        ? `<span style="color:var(--red)">Prazo encerrado</span>`
        : daysLeft === 0
          ? `<span style="color:var(--amber)">Vence hoje</span>`
          : `<span style="color:var(--text3)">${daysLeft}d restantes</span>`;

      // Quanto economizar por mês/semana para bater a meta
      if (!done && daysLeft > 0) {
        const months = Math.max(1, Math.ceil(daysLeft / 30));
        const perMonth = remaining / months;
        timeHtml = `<div class="goal-tip">${label} · poupar ${fmt(perMonth)}/mês</div>`;
      } else {
        timeHtml = `<div class="goal-tip">${label}</div>`;
      }
    }

    return `<div class="goal-card ${done ? 'goal-done' : ''}" style="--gc:${g.color}">
      <div class="goal-card-top">
        <div class="goal-icon">${g.icon || '★'}</div>
        <div class="goal-info">
          <div class="goal-name">${g.name}</div>
          <div class="goal-period">${g.deadline ? fmtDateBR(g.deadline) : ''}</div>
        </div>
        <div class="goal-actions">
          <button class="goal-btn-edit" onclick="editGoal(${g.id})" title="Editar">✎</button>
          <button class="goal-btn-del"  onclick="deleteGoal(${g.id})" title="Remover">×</button>
        </div>
      </div>

      <div class="goal-amounts">
        <span class="goal-saved">${fmt(saved)}</span>
        <span class="goal-sep">de</span>
        <span class="goal-target">${fmt(target)}</span>
        ${done ? '<span class="goal-badge">✓ Concluída</span>' : ''}
      </div>

      <div class="goal-bar-bg">
        <div class="goal-bar-fill" style="width:${pct}%"></div>
      </div>
      <div class="goal-pct">${pct}%</div>

      ${timeHtml}

      ${!done ? `<div class="goal-add-row">
        <input class="goal-add-input" type="number" id="saved-input-${g.id}"
          placeholder="Valor guardado..." step="10" min="0" inputmode="decimal" />
        <button class="goal-add-btn" onclick="addSavedAmount(${g.id})">+ Guardar</button>
      </div>` : ''}
    </div>`;
  }).join('');

  containers.forEach(c => c.innerHTML = html);
}

// ── PICKER DE ÍCONES E CORES ─────────────────────────────────
function buildGoalPickers() {
  const iconWrap  = document.getElementById('goalIconPicker');
  const colorWrap = document.getElementById('goalColorPicker');
  if (!iconWrap || !colorWrap) return;

  iconWrap.innerHTML = GOAL_ICONS.map((ic, i) =>
    `<button class="icon-opt${i === 0 ? ' selected' : ''}" data-icon="${ic}"
       onclick="selectGoalIcon(this)">${ic}</button>`
  ).join('');

  colorWrap.innerHTML = GOAL_COLORS.map((cl, i) =>
    `<button class="color-opt${i === 0 ? ' selected' : ''}" data-color="${cl}"
       style="background:${cl}" onclick="selectGoalColor(this)"></button>`
  ).join('');
}

function selectGoalIcon(el) {
  document.querySelectorAll('.icon-opt').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
}

function selectGoalColor(el) {
  document.querySelectorAll('.color-opt').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
}

// Formata data para exibição (DD/MM/AAAA)
function fmtDateBR(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

// ── MOBILE: wrapper que lê dos campos do sheet ────────────────
function addGoalMobile() {
  const map = {
    goalNameM:     'goalName',
    goalTargetM:   'goalTarget',
    goalSavedM:    'goalSaved',
    goalDeadlineM: 'goalDeadline',
  };
  Object.entries(map).forEach(([src, dst]) => {
    const s = document.getElementById(src);
    const d = document.getElementById(dst);
    if (s && d) d.value = s.value;
  });
  // Copia seleção de ícone/cor do picker mobile para o desktop
  const selIcon = document.querySelector('#goalIconPickerM .icon-opt.selected');
  if (selIcon) {
    document.querySelectorAll('#goalIconPicker .icon-opt').forEach(el =>
      el.classList.toggle('selected', el.dataset.icon === selIcon.dataset.icon)
    );
  }
  const selColor = document.querySelector('#goalColorPickerM .color-opt.selected');
  if (selColor) {
    document.querySelectorAll('#goalColorPicker .color-opt').forEach(el =>
      el.classList.toggle('selected', el.dataset.color === selColor.dataset.color)
    );
  }
  addGoal();
}

// ── buildGoalPickers: monta pickers tanto no modal quanto no sheet ──
// (sobrescreve a função definida acima para incluir os pickers mobile)
function buildGoalPickers() {
  const pairs = [
    ['goalIconPicker',  'goalColorPicker'],
    ['goalIconPickerM', 'goalColorPickerM'],
  ];
  pairs.forEach(([iconId, colorId]) => {
    const iconWrap  = document.getElementById(iconId);
    const colorWrap = document.getElementById(colorId);
    if (!iconWrap || !colorWrap) return;

    iconWrap.innerHTML = GOAL_ICONS.map((ic, i) =>
      `<button class="icon-opt${i === 0 ? ' selected' : ''}" data-icon="${ic}"
         onclick="selectGoalIcon(this)">${ic}</button>`
    ).join('');

    colorWrap.innerHTML = GOAL_COLORS.map((cl, i) =>
      `<button class="color-opt${i === 0 ? ' selected' : ''}" data-color="${cl}"
         style="background:${cl}" onclick="selectGoalColor(this)"></button>`
    ).join('');
  });
}

// ── openGoalForm: atualiza título nos dois lugares ────────────
const _openGoalFormOrig = openGoalForm;
// (A função openGoalForm já foi definida acima; aqui só garantimos
//  que o sheet mobile também exibe o título correto ao editar)
