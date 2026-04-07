// ============================================================
// js/constants.js — categorias e formas de pagamento
// Para adicionar uma categoria: inclua um novo objeto em CATS.
// ============================================================

const CATS = [
  { id: 'mercado',      name: 'Mercado',               color: '#7ab648' },
  { id: 'compra',      name: 'Compra online',                color: '#d9e43b' },
  { id: 'uber',         name: 'Uber / Táxi',            color: '#60a8f0' },
  { id: 'onibus',       name: 'Ônibus / Transporte',    color: '#50c8a0' },
  { id: 'lazer',        name: 'Lazer / Saídas',         color: '#a888f0' },
  { id: 'internet',     name: 'Internet / Telefone',    color: '#f0b860' },
  { id: 'alimentacao',  name: 'Alimentação / Delivery', color: '#f08860' },
  { id: 'saude',        name: 'Saúde / Farmácia',       color: '#f060a0' },
  { id: 'vestuario',    name: 'Roupas / Calçados',      color: '#f06060' },
  { id: 'contas',       name: 'Água / Luz / Gás / Aluguel',       color: '#808088' },
  { id: 'assinatura',   name: 'Assinaturas',            color: '#60c8f0' },
  { id: 'educacao',     name: 'Educação / Cursos',      color: '#9060f0' },
  { id: 'investimento', name: 'Investimentos',          color: '#c8f060' },
  { id: 'meta',         name: 'Meta',                   color: '#f0c040' },
  { id: 'divida',       name: 'Dívidas / Parcelas',     color: '#e05252' },
  { id: 'beleza',       name: 'Beleza / Autocuidado',   color: '#e878c0' },
  { id: 'outros',       name: 'Outros',                 color: '#585860' },
];

const PAY_LABELS = {
  dinheiro:      'Dinheiro',
  debito:        'Débito',
  credito:       'Crédito',
  pix:           'Pix',
  boleto:        'Boleto',
  transferencia: 'Transferência',
};

const PAY_COLORS = {
  dinheiro:      '#7ab648',
  debito:        '#60a8f0',
  credito:       '#f06060',
  pix:           '#50c8a0',
  boleto:        '#f0b860',
  transferencia: '#a888f0',
};
