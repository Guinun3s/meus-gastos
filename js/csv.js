// ============================================================
// js/csv.js — exportação e importação de dados em CSV
// Importação com upload de arquivo, detecção automática de colunas,
// classificação gasto/receita/investimento, detecção de duplicatas.
// ============================================================

// ── EXPORTAÇÃO ──────────────────────────────────────────────

function buildCSV() {
  const rows = ['data,descricao,categoria,pagamento,valor'];
  loadExp().forEach(e =>
    rows.push(`${e.data},"${e.desc}",${e.cat},${e.pay || ''},${e.valor.toFixed(2)}`)
  );
  return rows.join('\n');
}

function openExport() {
  document.getElementById('csvOut').value = buildCSV();
  openModal('modalExport');
}
function openExportM() {
  document.getElementById('mCsvOut').value = buildCSV();
  openSheet('sheetExport');
}

function downloadCSV(src) {
  const content = src === 'm'
    ? document.getElementById('mCsvOut').value
    : (document.getElementById('csvOut')?.value || '');
  const name = capitalize(mName()).replace(' de ', '_').replace(' ', '_');
  const a    = document.createElement('a');
  a.href     = 'data:text/csv;charset=utf-8,' + encodeURIComponent(content);
  a.download = `gastos_${name}.csv`;
  a.click();
}


// ════════════════════════════════════════════════════════════
// IMPORTAÇÃO
// ════════════════════════════════════════════════════════════

let _importState = {
  file: null,
  rows: [],         // array de objetos com o raw parsing
  headers: [],
  mapping: {},      // { date: 'col0', desc: 'col1', credit: 'col3', debit: 'col4' }
  preview: [],      // objetos normalizados { tipo, desc, cat, pay, valor, data, dup, checked }
  lastDate: null,
  filter: 'all',    // all | new | dup
};

// ── Abertura do modal de importação (entry point) ────────────
function openImportModal() {
  if (isMobile()) openImportModalM();
  else            openImportModalD();
}
function openImportModalD() {
  _resetImportState();
  _renderImportStep('upload');
  openModal('modalImport');
}
function openImportModalM() {
  _resetImportState();
  _renderImportStep('upload');
  openSheet('sheetImport');
}

function _resetImportState() {
  _importState = {
    file: null, rows: [], headers: [],
    mapping: {}, preview: [], lastDate: _findLastEntryDate(),
    filter: 'all',
  };
}

// ── Encontra a data mais recente entre todos os tipos ────────
function _findLastEntryDate() {
  let latest = null;
  const scan = obj => {
    Object.values(obj || {}).forEach(list => {
      (list || []).forEach(e => {
        if (e.data && (!latest || e.data > latest)) latest = e.data;
      });
    });
  };
  scan(_cache.expenses);
  scan(_cache.incomes);
  scan(_cache.investments);
  return latest;
}

// ── Handler do input file ────────────────────────────────────
function handleCSVFile(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  _readCSVFile(file);
}

function _readCSVFile(file) {
  _importState.file = file;
  const reader = new FileReader();
  reader.onload = e => {
    let text = e.target.result;
    // Detecta encoding — se tiver caracteres de replacement, re-lê como Latin1
    if (text.includes('\uFFFD')) {
      const reader2 = new FileReader();
      reader2.onload = e2 => _processCSVText(e2.target.result);
      reader2.readAsText(file, 'ISO-8859-1');
    } else {
      _processCSVText(text);
    }
  };
  reader.readAsText(file, 'UTF-8');
}

// ── Drag & Drop ─────────────────────────────────────────────
function _initDropzone() {
  const dz = document.querySelector('.imp-dropzone');
  if (!dz) return;

  dz.addEventListener('dragover', e => {
    e.preventDefault();
    e.stopPropagation();
    dz.classList.add('dragover');
  });
  dz.addEventListener('dragleave', e => {
    e.preventDefault();
    e.stopPropagation();
    dz.classList.remove('dragover');
  });
  dz.addEventListener('drop', e => {
    e.preventDefault();
    e.stopPropagation();
    dz.classList.remove('dragover');
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast('Selecione um arquivo .csv');
      return;
    }
    _readCSVFile(file);
  });
}

function _processCSVText(text) {
  const { headers, rows, delim } = _parseCSV(text);
  if (!headers.length || !rows.length) {
    toast('Arquivo CSV vazio ou inválido.');
    return;
  }
  _importState.headers = headers;
  _importState.rows    = rows;
  _importState.mapping = _autoDetectColumns(headers);
  _buildPreview();

  // Se não detectou data+descrição+valor, mostra o mapeamento
  const m = _importState.mapping;
  const hasDesc = m.desc !== undefined || m.historico !== undefined;
  const hasVal  = m.valor !== undefined || m.credit !== undefined || m.debit !== undefined;
  const hasMin  = m.date !== undefined && hasDesc && hasVal;
  if (!hasMin) _renderImportStep('mapping');
  else         _renderImportStep('preview');
}

// ── Parser CSV robusto ───────────────────────────────────────
function _parseCSV(text) {
  text = text.replace(/^\uFEFF/, ''); // remove BOM
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return { headers: [], rows: [], delim: ',' };

  // ── Detecção de delimitador: conta nas primeiras 20 linhas ───
  let totalCommas = 0, totalSemis = 0;
  const scan = lines.slice(0, Math.min(20, lines.length));
  scan.forEach(l => {
    totalCommas += (l.match(/,/g) || []).length;
    totalSemis  += (l.match(/;/g) || []).length;
  });
  const delim = totalSemis >= totalCommas ? ';' : ',';

  const parseLine = line => {
    const out = [];
    let cur = '', inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQuote) {
        if (c === '"' && line[i+1] === '"') { cur += '"'; i++; }
        else if (c === '"') inQuote = false;
        else cur += c;
      } else {
        if (c === '"') inQuote = true;
        else if (c === delim) { out.push(cur); cur = ''; }
        else cur += c;
      }
    }
    out.push(cur);
    return out.map(s => s.trim());
  };

  // ── Procura a linha de header real: primeira linha "cheia"
  // (≥2 delimitadores) que contenha pelo menos um keyword conhecido
  const normalize = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const keywordRe = /(data|hist[oó]rico|descri[cç][aã]o|valor|credito|cr[eé]dito|d[eé]bito|debito|montante|lan[cç]amento|movimenta|titulo|identificador|amount|date|saldo)/i;

  let headerIdx = 0;
  for (let i = 0; i < scan.length; i++) {
    const cells = parseLine(scan[i]);
    if (cells.length >= 2) {
      const hasKeyword = cells.some(c => keywordRe.test(normalize(c)));
      const hasMultipleCols = cells.length >= 3;
      if (hasKeyword && hasMultipleCols) { headerIdx = i; break; }
    }
  }

  const headers = parseLine(lines[headerIdx]);
  const rows = lines.slice(headerIdx + 1)
    .map(parseLine)
    .filter(r => r.length === headers.length && r.some(c => c));
  return { headers, rows, delim };
}

// ── Detecção automática de colunas ───────────────────────────
// Suporta formatos de: Inter, Nubank, Itaú, Bradesco, Santander, C6, BTG, Caixa, BB
function _autoDetectColumns(headers) {
  const m = {};
  headers.forEach((h, i) => {
    const lh = h.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos preservando letras
      .replace(/[^a-z0-9]/g, '');
    // Data — suporta "Data", "Data Lançamento", "Data Movimentação", "Date"
    if (m.date === undefined && /^(data|date|dt|datalancamento|datamoviment|datamov|dtmov)/.test(lh)) m.date = i;
    // Histórico (Inter, Bradesco): tipo da operação
    else if (m.historico === undefined && /^(historico|tipolancamento|tipolanc|natureza|tipodemov)/.test(lh)) m.historico = i;
    // Descrição: nome do destinatário/estabelecimento
    else if (m.desc === undefined && /^(desc|descricao|titulo|memo|movimento|detalhe|favorecido|contrapart|nome)/.test(lh)) m.desc = i;
    // Identificador (Nubank): só usa como desc se não achou desc melhor
    else if (m.desc === undefined && m.ident === undefined && /^identificador/.test(lh)) m.ident = i;
    // Crédito/Entrada (bancos que separam em 2 colunas)
    else if (m.credit === undefined && /^(credito|entrada|receita|credit|valorentrada)/.test(lh)) m.credit = i;
    // Débito/Saída
    else if (m.debit === undefined && /^(debito|saida|despesa|debit|valorsaida)/.test(lh)) m.debit = i;
    // Valor único (positivo/negativo)
    else if (m.valor === undefined && /^(valor|value|amount|montante|quantia|vlr)/.test(lh)) m.valor = i;
    // Tipo (raro)
    else if (m.tipo === undefined && /^(tipo|type|categoria|category)$/.test(lh)) m.tipo = i;
    // Ignora: Saldo, Agência, Conta, Identificador (Nubank 2ª col), Nº Doc
  });
  // Fallbacks: historico ou identificador como desc
  if (m.historico !== undefined && m.desc === undefined) m.desc = m.historico;
  if (m.desc === undefined && m.ident !== undefined) m.desc = m.ident;
  delete m.ident; // campo auxiliar, não precisa persistir
  return m;
}

// ── Normalização de data (DD/MM/YYYY → YYYY-MM-DD, etc) ──────
function _normalizeDate(s) {
  if (!s) return '';
  s = s.trim();
  let m;
  if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) {
    return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;
  }
  if ((m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/))) {
    let y = m[3]; if (y.length === 2) y = '20' + y;
    return `${y}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
  }
  return '';
}

// ── Normalização de valor (R$ 1.234,56 → 1234.56) ────────────
function _normalizeValor(s) {
  if (!s) return 0;
  s = String(s).replace(/[R$\s]/gi, '').trim();
  if (!s) return 0;
  // Se tem vírgula E ponto: ponto é milhar, vírgula é decimal
  if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, '').replace(',', '.');
  else if (s.includes(',')) s = s.replace(',', '.');
  const v = parseFloat(s);
  return isNaN(v) ? 0 : v;
}

// ── Detecção de investimento por palavras-chave ──────────────
function _isInvestDescription(desc) {
  const d = desc.toLowerCase();
  // Usa limites de palavra para evitar falsos positivos (ex: "nETFlix" contendo "etf")
  return /\b(aplica[cç][aã]o|resgate|cdb|tesouro|investimento|fundo|a[cç][oõ]es|b3|cripto|bitcoin|ethereum|etf|fii|poupan[cç]a|lci|lca|cdi)\b/i.test(d);
}

// ── Detecção de forma de pagamento pela descrição ────────────
function _detectPayMethod(desc) {
  const d = desc.toLowerCase();
  if (/pix/.test(d))                                return 'pix';
  if (/cart[aã]o.*cr[eé]dito|credito|cred\.?/i.test(d)) return 'credito';
  if (/cart[aã]o.*d[eé]bito|debito|deb\.?/i.test(d))    return 'debito';
  if (/boleto/.test(d))                             return 'boleto';
  if (/transferencia|ted|doc/i.test(d))             return 'transferencia';
  return 'pix'; // default razoável para extratos de banco
}

// ── Classificação baseada no campo Histórico (bancos brasileiros) ──
// Suporta padrões de: Inter, Nubank, Itaú, Bradesco, Santander, C6, BTG, Caixa, BB
// Retorna { tipo, pay } ou null se não reconhecer
function _detectFromHistorico(hist) {
  if (!hist) return null;
  const h = hist.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  // ── PIX ──
  if (/pix (enviado|transferido) devolvido|pix devolv/.test(h)) return { tipo: 'receita', pay: 'banco' };
  if (/pix (enviado|transferido|transf)/.test(h))               return { tipo: 'gasto', pay: 'pix' };
  if (/pix (recebido|qr code recebido)/.test(h))                return { tipo: 'receita', pay: 'banco' };
  // Nubank: "Transferência enviada pelo Pix", "Transferência recebida pelo Pix"
  if (/transferencia.*enviad.*pix|pix.*enviad/.test(h))          return { tipo: 'gasto', pay: 'pix' };
  if (/transferencia.*recebid.*pix|pix.*recebid/.test(h))        return { tipo: 'receita', pay: 'banco' };

  // ── Compras ──
  if (/compra.*debito|compra no deb/.test(h))                    return { tipo: 'gasto', pay: 'debito' };
  if (/compra.*credito|compra no cred|parcela/.test(h))          return { tipo: 'gasto', pay: 'credito' };

  // ── Pagamentos ──
  if (/pagamento efetuado|pagto.*efet/.test(h))                  return { tipo: 'gasto', pay: 'debito' };
  if (/pagamento.*boleto|boleto.*pago/.test(h))                  return { tipo: 'gasto', pay: 'boleto' };
  if (/pagamento.*conta|pagamento.*fatura/.test(h))              return { tipo: 'gasto', pay: 'debito' };
  // Nubank: "Pagamento de boleto efetuado"
  if (/pagamento.*boleto.*efet/.test(h))                         return { tipo: 'gasto', pay: 'boleto' };

  // ── Investimentos ──
  if (/aplicacao|aplicac[aã]o|compra.*titulo|compra.*acao/.test(h)) return { tipo: 'investimento', pay: 'rendafixa' };
  if (/resgate/.test(h))                                         return { tipo: 'receita', pay: 'banco' };
  // B3, dividendos, proventos (Inter, BTG, etc)
  if (/credito evento b3|rendimento|provento|dividendo|jcp|jscp|juro.*capital/.test(h)) return { tipo: 'receita', pay: 'banco' };

  // ── TEDs e DOCs ──
  if (/ted recebid|doc recebid|transferencia recebid|credito transferencia/.test(h)) return { tipo: 'receita', pay: 'banco' };
  if (/ted enviad|doc enviad|transferencia enviad|debito transferencia/.test(h))      return { tipo: 'gasto', pay: 'transferencia' };
  // Nubank: "Transferência enviada", "Transferência recebida" (sem "pelo Pix")
  if (/transferencia enviad/.test(h) && !/pix/.test(h))          return { tipo: 'gasto', pay: 'transferencia' };
  if (/transferencia recebid/.test(h) && !/pix/.test(h))         return { tipo: 'receita', pay: 'banco' };

  // ── Boleto ──
  if (/boleto/.test(h))                                          return { tipo: 'gasto', pay: 'boleto' };

  // ── Débito automático ──
  if (/debito automatico|deb auto/.test(h))                      return { tipo: 'gasto', pay: 'debito' };

  // ── Saque / Depósito ──
  if (/saque/.test(h))                                           return { tipo: 'gasto', pay: 'dinheiro' };
  if (/deposito|dep.*dinheiro/.test(h))                          return { tipo: 'receita', pay: 'dinheiro' };

  // ── Salário / Receitas ──
  if (/salario|folha.*pagamento|credito salario/.test(h))        return { tipo: 'receita', pay: 'banco' };

  // ── Estorno / Devolução ──
  if (/estorno|devolucao|chargeback/.test(h))                    return { tipo: 'receita', pay: 'banco' };

  // ── Nubank: descrições diretas como tipo (ex: "Restaurante X", "Uber *Trip") ──
  // Não retorna nada — deixa classificação por desc/valor

  return null;
}

// ── Detecção inteligente por descrição (sem Histórico, ex: Nubank) ──
// Quando não há coluna Histórico separada, tenta inferir tipo/pay da descrição
function _detectFromDescription(desc, valor) {
  if (!desc) return null;
  const d = desc.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Nubank: transferências pelo app
  if (/transferencia.*pix|pix -/.test(d))   return { tipo: valor < 0 ? 'gasto' : 'receita', pay: valor < 0 ? 'pix' : 'banco' };
  if (/pagamento.*boleto/.test(d))          return { tipo: 'gasto', pay: 'boleto' };
  if (/pagamento de fatura/.test(d))        return { tipo: 'gasto', pay: 'debito' };

  // IOF, Juros, Taxas = gasto
  if (/^iof|^juros|^tarifa|^taxa/.test(d))  return { tipo: 'gasto', pay: 'debito' };

  // Resgate / Aplicação
  if (/resgate.*rdb|resgate.*cdb|resgate.*investimento/.test(d)) return { tipo: 'receita', pay: 'banco' };
  if (/aplicacao.*rdb|aplicacao.*cdb/.test(d))                   return { tipo: 'investimento', pay: 'rendafixa' };

  return null;
}

// ── Categorização por palavras-chave (heurística) ────────────
function _guessCategory(desc) {
  const d = desc.toLowerCase();
  const rules = [
    [/\b(uber|99|taxi|t[aá]xi|cabify)\b/i, 'uber'],
    [/\b(onibus|metr[oô]|passagem|bilhete|brt|trem)\b|transporte coletivo/i, 'onibus'],
    [/\b(ifood|rappi|burger|lanche|restaurante|pizzaria|hamburgu|delivery|pastel|padaria|sorvet)\b/i, 'alimentacao'],
    [/\b(mercado|supermercado|carrefour|extra|atacad|assai|bistek)\b|pao de a[cç]ucar/i, 'mercado'],
    [/\b(netflix|spotify|disney|prime|hbo|deezer|apple\.com)\b|youtube premium/i, 'assinatura'],
    [/\b(farmacia|droga|drogaria|medicam)\b/i, 'saude'],
    [/\b(vivo|claro|tim|oi|internet|telefon)\b/i, 'internet'],
    [/\b(luz|energia|enel|cemig|light|gas|sabesp|[aá]gua)\b/i, 'contas'],
    [/\b(fatura)\b|boleto.*cart/i, 'divida'],
    [/\b(curso|udemy|escola|faculdade|livro|educa)\b/i, 'educacao'],
    [/\b(cinema|show|teatro|parque|balada)\b/i, 'lazer'],
    [/\b(roupa|cal[cç]ado|tenis|sapato|camiseta|zara|renner)\b|c&a/i, 'vestuario'],
    [/\b(salao|barbeiro|cabelo|manicure|esteti)\b/i, 'beleza'],
    [/\b(amazon|mercadolivre|shopee|aliexpress|shein)\b|compra.*online/i, 'compra'],
  ];
  for (const [re, cat] of rules) if (re.test(d)) return cat;
  return 'outros';
}

// ── Detecção de duplicatas (data + desc + valor) ─────────────
function _isDuplicate(row) {
  const norm = s => (s || '').toLowerCase().trim().replace(/\s+/g, ' ');
  const match = (e) => e.data === row.data &&
                       norm(e.desc) === norm(row.desc) &&
                       Math.abs(e.valor - row.valor) < 0.01;
  const checkStore = store => Object.values(store || {})
    .some(list => (list || []).some(match));
  return checkStore(_cache.expenses) || checkStore(_cache.incomes) || checkStore(_cache.investments);
}

// ── Construção da preview a partir do state ──────────────────
function _buildPreview() {
  const m = _importState.mapping;
  const preview = [];

  _importState.rows.forEach((r, idx) => {
    const dataRaw = m.date !== undefined ? r[m.date] : '';

    // ── Montar descrição ──
    // Se temos Histórico separado de Descrição, concatenamos para display
    // e usamos Histórico para classificação
    const historico = m.historico !== undefined ? (r[m.historico] || '').trim() : '';
    const descCol   = m.desc !== undefined ? (r[m.desc] || '').trim() : '';

    let desc, displayDesc;
    if (m.historico !== undefined && m.desc !== undefined && m.historico !== m.desc) {
      // Duas colunas separadas: Descrição (nome do destino) é mais útil p/ display
      displayDesc = descCol || historico;
      desc = displayDesc;
    } else {
      desc = descCol || historico;
      displayDesc = desc;
    }

    // ── Determinar valor e tipo ──
    let valor = 0, tipo = 'gasto';

    // Prioridade 1: Histórico para classificação (bancos brasileiros)
    const histDetect = _detectFromHistorico(historico);

    // Caso 1: colunas separadas de crédito e débito
    if (m.credit !== undefined || m.debit !== undefined) {
      const cred = m.credit !== undefined ? _normalizeValor(r[m.credit]) : 0;
      const deb  = m.debit  !== undefined ? _normalizeValor(r[m.debit])  : 0;
      if (cred > 0) { valor = cred; tipo = 'receita'; }
      else if (deb > 0) { valor = deb; tipo = 'gasto'; }
    }
    // Caso 2: coluna única de valor (positivo/negativo)
    else if (m.valor !== undefined) {
      const v = _normalizeValor(r[m.valor]);
      valor = Math.abs(v);
      if (histDetect) {
        tipo = histDetect.tipo;
      } else {
        tipo = v < 0 ? 'gasto' : 'receita';
      }
    }

    const data = _normalizeDate(dataRaw);
    if (!data || (!desc && !historico) || valor <= 0) return;

    // Classificação: Histórico > Descrição > sinal do valor
    const rawValor = m.valor !== undefined ? _normalizeValor(r[m.valor]) : 0;
    const descDetect = !histDetect ? _detectFromDescription(desc, rawValor) : null;
    const detect = histDetect || descDetect;

    if (detect) tipo = detect.tipo;

    // Reclassifica como investimento se a descrição ou Histórico sugerir
    if (!detect && _isInvestDescription(desc + ' ' + historico)) tipo = 'investimento';

    // ── Determinar forma de pagamento ──
    let pay;
    if (detect) {
      pay = detect.pay;
    } else if (tipo === 'gasto') {
      pay = _detectPayMethod(desc);
    } else if (tipo === 'receita') {
      pay = 'banco';
    } else {
      pay = 'rendafixa';
    }

    // ── Categorização ──
    const fullText = (historico + ' ' + descCol).trim();
    let cat;
    if (tipo === 'gasto') {
      // Usa Histórico para pistas adicionais de categoria
      if (/pagamento.*fatura/i.test(historico)) cat = 'divida';
      else cat = _guessCategory(fullText || desc);
    } else if (tipo === 'investimento') {
      cat = 'investimento';
    } else {
      cat = 'outros';
    }

    const item = {
      idx, data, valor, tipo, cat, pay,
      desc: displayDesc,
      checked: true,
      dup: false,
    };
    item.dup = _isDuplicate(item);
    if (item.dup) item.checked = false;
    preview.push(item);
  });

  _importState.preview = preview;
}

// ── Roteador de views (upload / mapping / preview) ────────────
function _renderImportStep(step) {
  const isMob = isMobile();
  const containerId = isMob ? 'sheetImportBody' : 'modalImportBody';
  const el = document.getElementById(containerId);
  if (!el) return;

  if (step === 'upload')       { el.innerHTML = _htmlUploadStep(); _initDropzone(); }
  else if (step === 'mapping') el.innerHTML = _htmlMappingStep();
  else if (step === 'preview') el.innerHTML = _htmlPreviewStep();
}

// ── View: upload ─────────────────────────────────────────────
function _htmlUploadStep() {
  const last = _importState.lastDate;
  const lastStr = last ? fmtDate(last) + '/' + last.slice(0, 4) : null;
  const history = _loadImportHistory();
  const mob = isMobile();

  let historyHtml = '';
  if (history.length > 0) {
    const items = history.slice(0, 5).map(h => {
      const dateStr = h.date ? fmtDate(h.date) : '—';
      return `<div class="imp-hist-item">
        <span class="imp-hist-file">${_escHtml(h.fileName)}</span>
        <span class="imp-hist-meta">${h.count} lançamentos · ${dateStr}</span>
      </div>`;
    }).join('');
    historyHtml = `
      <div class="imp-history">
        <div class="imp-hist-title">Importações anteriores</div>
        ${items}
      </div>`;
  }

  return `
    ${last ? `
      <div class="imp-warn">
        <span>⚠</span>
        <div>Seu último lançamento foi em <strong>${lastStr}</strong>.
        Importe apenas movimentações posteriores a essa data para evitar duplicatas.</div>
      </div>` : ''}
    <div class="imp-dropzone" onclick="document.getElementById('impFileInput').click()">
      <div class="imp-dz-icon">${typeof icon==='function' ? icon('upload') : '⬆'}</div>
      <div class="imp-dz-title">${mob ? 'Toque para selecionar' : 'Clique ou arraste o CSV aqui'}</div>
      <div class="imp-dz-sub">Extrato exportado do seu banco (.csv)</div>
      <button class="btn-p" type="button" onclick="event.stopPropagation();document.getElementById('impFileInput').click()">Escolher arquivo</button>
      <input type="file" id="impFileInput" accept=".csv,text/csv" style="display:none" onchange="handleCSVFile(this)">
    </div>
    <div class="imp-banks">
      <div class="imp-banks-title">Bancos compatíveis</div>
      <div class="imp-banks-list">
        <span class="imp-bank-tag">Inter</span>
        <span class="imp-bank-tag">Nubank</span>
        <span class="imp-bank-tag">Itaú</span>
        <span class="imp-bank-tag">Bradesco</span>
        <span class="imp-bank-tag">Santander</span>
        <span class="imp-bank-tag">C6 Bank</span>
        <span class="imp-bank-tag">BTG</span>
        <span class="imp-bank-tag">Caixa</span>
        <span class="imp-bank-tag">BB</span>
        <span class="imp-bank-tag">Outros CSV</span>
      </div>
    </div>
    ${historyHtml}`;
}

// ── View: mapeamento manual ──────────────────────────────────
function _htmlMappingStep() {
  const headers = _importState.headers;
  const m = _importState.mapping;
  const opts = (sel) => {
    let h = '<option value="">— Ignorar —</option>';
    headers.forEach((col, i) => {
      h += `<option value="${i}" ${m[sel]==i?'selected':''}>${col || 'Coluna '+(i+1)}</option>`;
    });
    return h;
  };
  return `
    <p class="imp-hint">Identifique as colunas do arquivo para o app poder importar corretamente.</p>
    <div class="imp-map">
      <label>Data <select onchange="_mapSet('date',this.value)">${opts('date')}</select></label>
      <label>Descrição <select onchange="_mapSet('desc',this.value)">${opts('desc')}</select></label>
      <label>Valor (se único) <select onchange="_mapSet('valor',this.value)">${opts('valor')}</select></label>
      <label>Crédito / entrada <select onchange="_mapSet('credit',this.value)">${opts('credit')}</select></label>
      <label>Débito / saída <select onchange="_mapSet('debit',this.value)">${opts('debit')}</select></label>
    </div>
    <div class="imp-actions">
      <button class="btn-s" onclick="_renderImportStep('upload')">Voltar</button>
      <button class="btn-p" onclick="_confirmMapping()">Continuar →</button>
    </div>`;
}

function _mapSet(key, val) {
  if (val === '') delete _importState.mapping[key];
  else _importState.mapping[key] = parseInt(val);
}

function _confirmMapping() {
  const m = _importState.mapping;
  if (m.date === undefined || m.desc === undefined) {
    toast('Selecione pelo menos as colunas de data e descrição.');
    return;
  }
  if (m.valor === undefined && m.credit === undefined && m.debit === undefined) {
    toast('Selecione uma coluna de valor (ou crédito/débito).');
    return;
  }
  _buildPreview();
  _renderImportStep('preview');
}

// ── View: preview ────────────────────────────────────────────
function _htmlPreviewStep() {
  const pv = _importState.preview;
  const total = pv.length;
  const news  = pv.filter(p => !p.dup).length;
  const dups  = total - news;

  const filter = _importState.filter;
  const visible = pv.filter(p => filter === 'all' || (filter === 'new' && !p.dup) || (filter === 'dup' && p.dup));

  const sumG = pv.filter(p => p.checked && p.tipo === 'gasto').reduce((s,p) => s + p.valor, 0);
  const sumR = pv.filter(p => p.checked && p.tipo === 'receita').reduce((s,p) => s + p.valor, 0);
  const sumI = pv.filter(p => p.checked && p.tipo === 'investimento').reduce((s,p) => s + p.valor, 0);
  const sel  = pv.filter(p => p.checked).length;

  const summary = `${sel} selecionados`
    + (sumG > 0 ? ` · <span style="color:var(--red)">−${fmt(sumG)}</span>` : '')
    + (sumR > 0 ? ` · <span style="color:var(--accent)">+${fmt(sumR)}</span>` : '')
    + (sumI > 0 ? ` · <span style="color:var(--amber)">${fmt(sumI)}</span>` : '');

  const isMob = isMobile();

  return `
    <div class="imp-banner ${dups > 0 ? 'ok' : 'ok'}">
      <strong style="color:var(--accent)">${news} novos</strong>
      ${dups > 0 ? ` · <span style="color:var(--purple)">${dups} duplicatas</span> desmarcadas automaticamente` : ''}
    </div>
    <div class="imp-chips">
      <span class="imp-chip ${filter==='all'?'active':''}" onclick="_setImpFilter('all')">Todos · ${total}</span>
      <span class="imp-chip ${filter==='new'?'active':''}" onclick="_setImpFilter('new')">Só novos · ${news}</span>
      <span class="imp-chip ${filter==='dup'?'active':''}" onclick="_setImpFilter('dup')">Duplicatas · ${dups}</span>
      <span style="flex:1"></span>
      <select class="imp-bulk" onchange="_bulkPay(this.value);this.value=''">
        <option value="">Pagamento em massa…</option>
        <option value="dinheiro">Dinheiro</option>
        <option value="debito">Débito</option>
        <option value="credito">Crédito</option>
        <option value="pix">Pix</option>
        <option value="boleto">Boleto</option>
        <option value="transferencia">Transferência</option>
      </select>
    </div>
    <div class="imp-scroll">
      ${isMob ? _htmlPreviewCards(visible) : _htmlPreviewTable(visible)}
    </div>
    <div class="imp-footer">
      <div class="imp-summary">${summary}</div>
      <div class="imp-actions">
        <button class="btn-s" onclick="_renderImportStep('upload')">Cancelar</button>
        <button class="btn-p" onclick="_doImport()">Importar ${sel}</button>
      </div>
    </div>
    <div id="impPopover"></div>
  `;
}

// ── Tabela desktop ───────────────────────────────────────────
function _htmlPreviewTable(rows) {
  return `
    <table class="imp-table">
      <thead>
        <tr>
          <th style="width:28px;text-align:center">
            <input type="checkbox" ${rows.every(r => r.checked) ? 'checked' : ''} onchange="_toggleAll(this.checked)">
          </th>
          <th>Descrição</th>
          <th style="width:200px">Categoria</th>
          <th style="width:140px">Pagamento</th>
          <th style="width:70px">Data</th>
          <th class="r" style="width:110px">Valor</th>
          <th style="width:60px;text-align:center">Ações</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => _htmlPreviewRow(r)).join('')}
      </tbody>
    </table>`;
}

function _htmlPreviewRow(r) {
  const cat = catById(r.cat);
  const { label, color } = _payInfo(r);
  return `
    <tr class="imp-row ${r.dup?'dup':''}" data-idx="${r.idx}">
      <td style="text-align:center"><input type="checkbox" ${r.checked?'checked':''} onchange="_toggleRow(${r.idx},this.checked)"></td>
      <td class="imp-desc">${r.desc}${r.dup ? ' <span class="imp-dup-tag">já existe</span>' : ''}</td>
      <td>${_catPillInline(r, cat)}</td>
      <td>${_payPillInline(r, label, color)}</td>
      <td class="imp-date">${fmtDate(r.data)}</td>
      <td class="imp-val" style="color:${_valColor(r.tipo)}">${_valPrefix(r.tipo)}${fmt(r.valor)}</td>
      <td style="text-align:center">
        <div class="imp-acts">
          <button onclick="_editRow(${r.idx})" title="Editar">${typeof icon==='function'?icon('pencil','icon-sm'):'✎'}</button>
          <button onclick="_removeRow(${r.idx})" title="Remover">${typeof icon==='function'?icon('x','icon-sm'):'✕'}</button>
        </div>
      </td>
    </tr>`;
}

// ── Cards mobile ─────────────────────────────────────────────
function _htmlPreviewCards(rows) {
  return `<div class="imp-cards">${rows.map(r => {
    const cat = catById(r.cat);
    const { label, color } = _payInfo(r);
    return `
      <div class="imp-card ${r.dup?'dup':''}" data-idx="${r.idx}">
        <div class="imp-card-head">
          <input type="checkbox" class="imp-chk" ${r.checked?'checked':''} onchange="_toggleRow(${r.idx},this.checked)">
          <div class="imp-card-body">
            <div class="imp-card-desc">${r.desc}${r.dup ? ' <span class="imp-dup-tag">já existe</span>' : ''}</div>
            <div class="imp-card-pills">
              ${_catPillInline(r, cat)}
              ${_payPillInline(r, label, color)}
            </div>
          </div>
          <div class="imp-card-val" style="color:${_valColor(r.tipo)}">${_valPrefix(r.tipo)}${fmt(r.valor)}</div>
        </div>
        <div class="imp-card-foot">
          <span class="imp-card-date">${fmtDate(r.data)}</span>
          <div class="imp-acts">
            <button onclick="_editRow(${r.idx})">${typeof icon==='function'?icon('pencil','icon-sm'):'✎'}</button>
            <button onclick="_removeRow(${r.idx})">${typeof icon==='function'?icon('x','icon-sm'):'✕'}</button>
          </div>
        </div>
      </div>`;
  }).join('')}</div>`;
}

// ── Helpers visuais ──────────────────────────────────────────
function _valColor(tipo) {
  return tipo === 'gasto' ? 'var(--red)' : tipo === 'receita' ? 'var(--accent)' : 'var(--amber)';
}
function _valPrefix(tipo) {
  return tipo === 'gasto' ? '−' : tipo === 'receita' ? '+' : '';
}
function _payInfo(r) {
  if (r.tipo === 'receita') {
    const c = r.pay === 'dinheiro' ? '#40d090' : '#60b0ff';
    return { label: r.pay === 'dinheiro' ? 'Dinheiro' : 'Banco', color: c };
  }
  if (r.tipo === 'investimento') {
    return {
      label: (typeof INV_TIPO_LABELS !== 'undefined' && INV_TIPO_LABELS[r.pay]) || r.pay,
      color: (typeof INV_TIPO_COLORS !== 'undefined' && INV_TIPO_COLORS[r.pay]) || '#8888a0',
    };
  }
  return { label: PAY_LABELS[r.pay] || r.pay, color: PAY_COLORS[r.pay] || '#888' };
}
function _catPillInline(r, cat) {
  if (r.tipo === 'receita') {
    return `<span class="e-pill imp-pill" data-kind="tipo" data-idx="${r.idx}" onclick="_openPopover(event, ${r.idx}, 'tipo')" style="background:#60a8f01a;color:#60a8f0"><span class="pdot" style="background:#60a8f0"></span>Receita</span>`;
  }
  if (r.tipo === 'investimento') {
    return `<span class="e-pill imp-pill" data-kind="tipo" data-idx="${r.idx}" onclick="_openPopover(event, ${r.idx}, 'tipo')" style="background:#f0b8601a;color:#f0b860"><span class="pdot" style="background:#f0b860"></span>Investimento</span>`;
  }
  return `<span class="e-pill imp-pill" data-kind="cat" data-idx="${r.idx}" onclick="_openPopover(event, ${r.idx}, 'cat')" style="background:${cat.color}1a;color:${cat.color}"><span class="pdot" style="background:${cat.color}"></span>${cat.name}</span>`;
}
function _payPillInline(r, label, color) {
  return `<span class="e-pill imp-pill" data-kind="pay" data-idx="${r.idx}" onclick="_openPopover(event, ${r.idx}, 'pay')" style="background:${color}1a;color:${color}"><span class="pdot" style="background:${color}"></span>${label}</span>`;
}

// ── Popover (edição inline dos pills) ────────────────────────
function _openPopover(evt, idx, kind) {
  evt.stopPropagation();
  const row = _importState.preview.find(p => p.idx === idx);
  if (!row) return;
  const host = document.getElementById('impPopover');
  if (!host) return;
  const rect = evt.currentTarget.getBoundingClientRect();
  const scrollY = window.scrollY, scrollX = window.scrollX;

  let opts = [];
  if (kind === 'cat') {
    opts = CATS.map(c => ({ val: c.id, label: c.name, color: c.color, sel: c.id === row.cat }));
  } else if (kind === 'tipo') {
    opts = [
      { val: 'gasto',         label: 'Gasto',         color: '#f06060', sel: row.tipo === 'gasto' },
      { val: 'receita',       label: 'Receita',       color: '#60a8f0', sel: row.tipo === 'receita' },
      { val: 'investimento',  label: 'Investimento',  color: '#f0b860', sel: row.tipo === 'investimento' },
    ];
  } else if (kind === 'pay') {
    if (row.tipo === 'receita') {
      opts = [
        { val: 'banco',    label: 'Banco',    color: '#60b0ff', sel: row.pay === 'banco' },
        { val: 'dinheiro', label: 'Dinheiro', color: '#40d090', sel: row.pay === 'dinheiro' },
      ];
    } else if (row.tipo === 'investimento') {
      opts = Object.keys(INV_TIPO_LABELS || {}).map(k => ({
        val: k, label: INV_TIPO_LABELS[k], color: INV_TIPO_COLORS[k], sel: row.pay === k,
      }));
    } else {
      opts = Object.keys(PAY_LABELS).map(k => ({
        val: k, label: PAY_LABELS[k], color: PAY_COLORS[k], sel: row.pay === k,
      }));
    }
  }

  host.innerHTML = `<div class="imp-popover" style="left:${rect.left+scrollX}px;top:${rect.bottom+scrollY+4}px">
    ${opts.map(o => `<div class="imp-pop-opt ${o.sel?'selected':''}" onclick="_pickOpt(${idx},'${kind}','${o.val}')">
      <span class="pdot" style="background:${o.color}"></span>${o.label}${o.sel?' ✓':''}
    </div>`).join('')}
  </div>`;

  // Click fora fecha
  setTimeout(() => document.addEventListener('click', _closePopover, { once: true }), 0);
}
function _closePopover() {
  const host = document.getElementById('impPopover');
  if (host) host.innerHTML = '';
}

function _pickOpt(idx, kind, val) {
  const row = _importState.preview.find(p => p.idx === idx);
  if (!row) return;
  if (kind === 'cat') row.cat = val;
  else if (kind === 'pay') row.pay = val;
  else if (kind === 'tipo') {
    row.tipo = val;
    // Ajusta pay e cat defaults para o novo tipo
    if (val === 'receita')             row.pay = 'banco';
    else if (val === 'investimento')   { row.pay = 'rendafixa'; row.cat = 'investimento'; }
    else if (val === 'gasto')          row.pay = _detectPayMethod(row.desc);
  }
  _closePopover();
  _renderImportStep('preview');
}

// ── Ações de linha ───────────────────────────────────────────
function _toggleRow(idx, checked) {
  const r = _importState.preview.find(p => p.idx === idx);
  if (r) r.checked = checked;
  _renderImportStep('preview');
}
function _toggleAll(checked) {
  _importState.preview.forEach(p => p.checked = checked);
  _renderImportStep('preview');
}
function _removeRow(idx) {
  _importState.preview = _importState.preview.filter(p => p.idx !== idx);
  _renderImportStep('preview');
}
function _setImpFilter(f) {
  _importState.filter = f;
  _renderImportStep('preview');
}
function _bulkPay(pay) {
  if (!pay) return;
  _importState.preview.forEach(p => {
    if (p.tipo === 'gasto') p.pay = pay;
  });
  _renderImportStep('preview');
}

// ── Edição completa (descrição/data/valor) — modal simples ───
function _editRow(idx) {
  const r = _importState.preview.find(p => p.idx === idx);
  if (!r) return;
  const desc  = prompt('Descrição:', r.desc);
  if (desc === null) return;
  const data  = prompt('Data (YYYY-MM-DD):', r.data);
  if (data === null) return;
  const valor = prompt('Valor:', r.valor.toFixed(2));
  if (valor === null) return;

  r.desc = desc.trim() || r.desc;
  const d = _normalizeDate(data) || data;
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) r.data = d;
  const v = _normalizeValor(valor);
  if (v > 0) r.valor = v;
  r.dup = _isDuplicate(r);
  _renderImportStep('preview');
}

// ── Histórico de importações ─────────────────────────────────
function _loadImportHistory() {
  try {
    return JSON.parse(localStorage.getItem('importHistory') || '[]');
  } catch { return []; }
}

function _saveImportRecord(fileName, count, dateRange) {
  const history = _loadImportHistory();
  history.unshift({
    fileName,
    count,
    date: new Date().toISOString().split('T')[0],
    dateRange, // { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
    ts: Date.now(),
  });
  // Mantém apenas as últimas 20 importações
  if (history.length > 20) history.length = 20;
  localStorage.setItem('importHistory', JSON.stringify(history));
}

function _escHtml(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Execução final da importação ─────────────────────────────
function _doImport() {
  const selected = _importState.preview.filter(p => p.checked);
  if (!selected.length) { toast('Nenhum lançamento selecionado.'); return; }

  // Garante containers
  _cache.expenses    = _cache.expenses    || {};
  _cache.incomes     = _cache.incomes     || {};
  _cache.investments = _cache.investments || {};

  let count = 0;
  selected.forEach((r, i) => {
    const key = _monthKeyFromDate(r.data);
    const id  = Date.now() + i;

    if (r.tipo === 'gasto') {
      const list = _cache.expenses[key] || [];
      list.push({ id, desc: r.desc, valor: r.valor, cat: r.cat, pay: r.pay, data: r.data });
      _cache.expenses[key] = list;
    } else if (r.tipo === 'receita') {
      const list = _cache.incomes[key] || [];
      list.push({ id, desc: r.desc, valor: r.valor, tipo: r.pay, data: r.data });
      _cache.incomes[key] = list;
    } else if (r.tipo === 'investimento') {
      const list = _cache.investments[key] || [];
      list.push({ id, desc: r.desc, valor: r.valor, tipo: r.pay, data: r.data });
      _cache.investments[key] = list;
    }
    count++;
  });

  // Ordena cada mês por data desc
  ['expenses','incomes','investments'].forEach(storeName => {
    Object.keys(_cache[storeName]).forEach(k => {
      _cache[storeName][k].sort((a, b) => (b.data||'').localeCompare(a.data||''));
    });
  });

  // Salva registro no histórico de importações
  const dates = selected.map(r => r.data).filter(Boolean).sort();
  _saveImportRecord(
    _importState.file ? _importState.file.name : 'importação manual',
    count,
    { from: dates[0] || '', to: dates[dates.length - 1] || '' }
  );

  if (typeof scheduleSync === 'function') scheduleSync();
  if (isMobile()) closeSheet('sheetImport');
  else            closeModal('modalImport');
  render();
  toast(count + ' lançamento(s) importado(s)!');
}

// ── Calcula a chave YYYY_M a partir de YYYY-MM-DD ────────────
function _monthKeyFromDate(isoDate) {
  const [y, m] = isoDate.split('-');
  return `${parseInt(y)}_${parseInt(m)-1}`;
}

// ── Compat legado: função antiga (caso algum link ainda chame) ─
function importCSV() { openImportModal(); }
