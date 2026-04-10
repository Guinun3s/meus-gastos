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

  // Detecta aba/modo atual no extrato (desktop)
  const extratoType = typeof _extratoType !== 'undefined' ? _extratoType : 'gastos';
  const currentTabIsReceita = extratoType === 'receitas';
  // Se o usuário não detectou receita pela fala mas está na aba receitas, força receita
  const forceReceita = isReceita || currentTabIsReceita;

  if (mob) {
    openAddSheet();
    if (forceReceita) setAddSheetMode('receita');
    else              setAddSheetMode('gasto');

    setTimeout(() => {
      const d = document.getElementById('mDesc');
      const v = document.getElementById('mValor');
      const c = document.getElementById('mCatSelect');
      const p = document.getElementById('mPaySelect');
      if (d) d.value = desc;
      if (v && valor) v.value = valor;
      if (!forceReceita) {
        if (c) { c.value = cat; if (typeof onCatChange === 'function') onCatChange(c); }
        if (p) { p.value = pay; if (typeof onPayChange === 'function') onPayChange(p); }
      }
    }, 200);
  } else {
    if (forceReceita) {
      // Preenche formulário de receita (campo incDesc não existe mais no extrato)
      // Usa o sheetIncome se mobile, ou adiciona direto
      const r = { id: Date.now(), desc, valor: valor || 0,
                  data: new Date().toISOString().split('T')[0], tipo: 'banco' };
      const list = loadInc();
      list.unshift(r);
      saveInc(list);
      // Muda para aba receitas no extrato
      if (typeof setExtratoType === 'function') setExtratoType('receitas',
        document.querySelector('[data-etype="receitas"]'));
      render();
      toast(`Receita "${desc}" adicionada — R$ ${fmt(valor || 0)}`);
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
