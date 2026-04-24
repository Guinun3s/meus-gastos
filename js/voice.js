// ============================================================
// js/voice.js — lançamento rápido por voz
// Exemplos: "mercado 45 reais pix" | "uber 15 débito" | "salário 3000 banco"
// ============================================================

let _voiceActive = false;
let _recognition = null;

function isVoiceSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

// ── Iniciar / parar ────────────────────────────────────────
function toggleVoiceInput() {
  if (_voiceActive) { stopVoice(); return; }
  startVoice();
}

function startVoice() {
  if (!isVoiceSupported()) {
    toast('Seu navegador não suporta reconhecimento de voz.');
    return;
  }

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  _recognition = new SR();
  _recognition.lang = 'pt-BR';
  _recognition.continuous = false;
  _recognition.interimResults = false;

  _recognition.onstart = () => {
    _voiceActive = true;
    _updateVoiceBtn(true);
    toast('Fale agora... Ex: "Mercado 45 reais pix"');
  };

  _recognition.onresult = e => {
    const transcript = e.results[0][0].transcript;
    _parseVoiceInput(transcript);
  };

  _recognition.onerror = e => {
    _voiceActive = false;
    _updateVoiceBtn(false);
    if (e.error !== 'no-speech') toast('Erro de voz: ' + e.error);
  };

  _recognition.onend = () => {
    _voiceActive = false;
    _updateVoiceBtn(false);
  };

  _recognition.start();
}

function stopVoice() {
  if (_recognition) _recognition.stop();
  _voiceActive = false;
  _updateVoiceBtn(false);
}

// ── Parser do texto falado ─────────────────────────────────
function _parseVoiceInput(text) {
  const original = text;
  let t = text.toLowerCase().trim();
  toast('Entendido: "' + original + '"');

  // Extrai valor — suporta: "45", "45 reais", "45,90", "45.90"
  const valorMatch = t.match(/(\d+[.,]?\d*)\s*(reais?|r\$)?/);
  const valor = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : 0;

  // Remove o valor do texto para facilitar parse dos demais campos
  if (valorMatch) t = t.replace(valorMatch[0], ' ').trim();

  // Detecta forma de pagamento
  const payMap = {
    pix: 'pix', 'cartão': 'debito', debito: 'debito', 'débito': 'debito',
    crédito: 'credito', credito: 'credito', dinheiro: 'dinheiro',
    boleto: 'boleto', 'transferência': 'transferencia', transferencia: 'transferencia',
    inter: 'credito', nubank: 'credito', banco: 'dinheiro',
  };
  let pay = 'pix';
  for (const [kw, val] of Object.entries(payMap)) {
    if (t.includes(kw)) { pay = val; t = t.replace(kw, '').trim(); break; }
  }

  // Detecta categoria por palavras-chave
  const catMap = {
    mercado: 'mercado', supermercado: 'mercado', feira: 'mercado', hortifruti: 'mercado',
    compra: 'compra', amazon: 'compra', ifood: 'alimentacao', rappi: 'alimentacao',
    'delivery\b': 'alimentacao', 'lanche': 'alimentacao', pizza: 'alimentacao',
    restaurante: 'alimentacao', almoço: 'alimentacao', janta: 'alimentacao',
    uber: 'uber', '99': 'uber', taxi: 'uber', 'ônibus': 'onibus', metrô: 'onibus',
    netflix: 'assinatura', spotify: 'assinatura', assinatura: 'assinatura',
    farmácia: 'saude', remédio: 'saude', médico: 'saude', academia: 'saude',
    roupa: 'vestuario', sapato: 'vestuario', tênis: 'vestuario',
    conta: 'contas', luz: 'contas', água: 'contas', internet: 'internet',
    faculdade: 'educacao', curso: 'educacao', livro: 'educacao',
    salário: null, salario: null, freelance: null, renda: null, // receitas
    lazer: 'lazer', cinema: 'lazer', show: 'lazer', bar: 'lazer',
    beleza: 'beleza', cabelo: 'beleza', manicure: 'beleza',
    investimento: 'investimento', caixinha: 'investimento',
  };

  let cat = 'outros';
  let isReceita = false;
  for (const [kw, catVal] of Object.entries(catMap)) {
    if (t.includes(kw)) {
      if (catVal === null) { isReceita = true; break; }
      cat = catVal; break;
    }
  }

  // Descrição = texto limpo restante
  const stopWords = ['de', 'da', 'do', 'para', 'em', 'no', 'na', 'o', 'a', 'um', 'uma'];
  const desc = t.split(' ')
    .filter(w => w.length > 1 && !stopWords.includes(w))
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || original.split(' ').slice(0, 3).join(' ');

  // Preenche o formulário correto
  _fillFormWithVoice({ desc, valor, cat, pay, isReceita });
}

function _fillFormWithVoice({ desc, valor, cat, pay, isReceita }) {
  const mob = isMobile();

  // ── Detecta a aba/modo atual ──
  // Mobile: _addSheetMode é o modo do sheet (gasto|receita|investimento)
  // Desktop: _extratoType é a aba do extrato (gastos|receitas|investimentos)
  let currentMode;
  if (mob) {
    currentMode = typeof _addSheetMode !== 'undefined' ? _addSheetMode : 'gasto';
  } else {
    const et = typeof _extratoType !== 'undefined' ? _extratoType : 'gastos';
    if (et === 'receitas') currentMode = 'receita';
    else if (et === 'investimentos') currentMode = 'investimento';
    else currentMode = 'gasto';
  }

  // Determina o modo final: prioridade da fala, depois respeita a aba atual
  let targetMode;
  if (isReceita)                                           targetMode = 'receita';
  else if (cat === 'investimento')                         targetMode = 'investimento';
  else if (currentMode === 'receita' || currentMode === 'investimento') targetMode = currentMode;
  else                                                     targetMode = 'gasto';

  if (mob) {
    // O botão de voz fica dentro do sheetAdd, que já pode estar aberto
    // na aba correta. Só abre se não estiver visível.
    const sheetEl = document.getElementById('sheetAdd');
    const sheetOpen = sheetEl && sheetEl.closest('.sheet-bg.open');
    if (!sheetOpen) {
      openAddSheet();
      setAddSheetMode(targetMode);
    }
    // Se o sheet já estava aberto, mantém o modo atual (receita/investimento)

    setTimeout(() => {
      const activeMode = typeof _addSheetMode !== 'undefined' ? _addSheetMode : 'gasto';
      const d = document.getElementById('mDesc');
      const v = document.getElementById('mValor');
      if (d) d.value = desc;
      if (v && valor) v.value = valor;

      if (activeMode === 'gasto') {
        const c = document.getElementById('mCatSelect');
        const p = document.getElementById('mPaySelect');
        if (c) { c.value = cat; if (typeof onCatChange === 'function') onCatChange(c); }
        if (p) { p.value = pay; if (typeof onPayChange === 'function') onPayChange(p); }
      }
      toast('Formulário preenchido — revise e confirme!');
    }, 200);
  } else {
    if (targetMode === 'receita') {
      const r = { id: Date.now(), desc, valor: valor || 0,
                  data: new Date().toISOString().split('T')[0], tipo: 'banco' };
      const list = loadInc();
      list.unshift(r);
      saveInc(list);
      if (typeof setExtratoType === 'function') setExtratoType('receitas',
        document.querySelector('[data-etype="receitas"]'));
      render();
      toast(`Receita "${desc}" adicionada — R$ ${fmt(valor || 0)}`);
    } else if (targetMode === 'investimento') {
      const inv = { id: Date.now(), desc, valor: valor || 0,
                    data: new Date().toISOString().split('T')[0], tipo: 'rendafixa' };
      const list = loadInvest();
      list.unshift(inv);
      saveInvest(list);
      if (typeof setExtratoType === 'function') setExtratoType('investimentos',
        document.querySelector('[data-etype="investimentos"]'));
      render();
      toast(`Investimento "${desc}" adicionado — R$ ${fmt(valor || 0)}`);
    } else {
      const d = document.getElementById('desc');
      const v = document.getElementById('valor');
      const c = document.getElementById('catSelect');
      const p = document.getElementById('paySelect');
      if (d) d.value = desc;
      if (v && valor) v.value = valor;
      if (c) c.value = cat;
      if (p) p.value = pay;
      toast('Formulário preenchido — revise e confirme!');
    }
  }
}

function _updateVoiceBtn(active) {
  document.querySelectorAll('.voice-btn').forEach(btn => {
    btn.classList.toggle('voice-active', active);
    btn.title = active ? 'Parar gravação' : 'Adicionar por voz';
  });
}
