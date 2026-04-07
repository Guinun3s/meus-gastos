// ============================================================
// js/csv.js — exportação e importação de dados em CSV
// Formato: data, descrição, categoria_id, pagamento, valor
// ============================================================

function buildCSV() {
  const rows = ['data,descricao,categoria,pagamento,valor'];
  loadExp().forEach(e =>
    rows.push(`${e.data},"${e.desc}",${e.cat},${e.pay || ''},${e.valor.toFixed(2)}`)
  );
  return rows.join('\n');
}

// Desktop
function openExport() {
  document.getElementById('csvOut').value = buildCSV();
  openModal('modalExport');
}

// Mobile
function openExportM() {
  document.getElementById('mCsvOut').value = buildCSV();
  openSheet('sheetExport');
}

function openImportModal() { openModal('modalImport'); }

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

function importCSV() {
  const el  = document.getElementById('csvIn') || document.getElementById('mCsvIn');
  const raw = el?.value.trim() || '';
  if (!raw) return;

  const lines = raw.split('\n').filter(l => l.trim() && !l.startsWith('data'));
  const list  = loadExp();
  let count   = 0;

  lines.forEach(line => {
    const parts = line
      .match(/(\".*?\"|[^,]+)(?:,|$)/g)
      ?.map(p => p.replace(/,$/, '').replace(/^\"|\"$/g, '').trim());

    if (!parts || parts.length < 4) return;

    const [data, desc, cat, pay, valor] =
      parts.length >= 5
        ? parts
        : [parts[0], parts[1], parts[2], 'outros', parts[3]];

    const v = parseFloat(parts.length >= 5 ? valor : pay);
    if (!isNaN(v) && v > 0 && desc) {
      list.push({
        id:    Date.now() + count,
        desc,
        valor: v,
        cat:   cat || 'outros',
        pay:   parts.length >= 5 ? (pay || 'outros') : 'outros',
        data,
      });
      count++;
    }
  });

  list.sort((a, b) => b.data.localeCompare(a.data));
  saveExp(list);

  if (document.getElementById('csvIn'))  { document.getElementById('csvIn').value  = ''; closeModal('modalImport'); }
  if (document.getElementById('mCsvIn')) { document.getElementById('mCsvIn').value = ''; closeSheet('sheetImport'); }

  render();
  toast(count + ' lançamento(s) importado(s)!');
}
