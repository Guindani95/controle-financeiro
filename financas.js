/**
 * Regras do controle financeiro (sem nada de tela).
 * Um lançamento tem: { id, descricao, valor, tipo: "receita" | "despesa", categoria, data: "AAAA-MM-DD" }
 */

const CATEGORIAS = {
  receita: ["Salário", "Comissão", "Serviço extra", "Outros"],
  despesa: ["Moradia", "Alimentação", "Transporte", "Estudos", "Saúde", "Lazer", "Contas", "Outros"],
};

/** Valida os dados e devolve um lançamento novo. */
function criarLancamento({ descricao, valor, tipo, categoria, data }) {
  if (!descricao || !descricao.trim()) throw new Error("Informe uma descrição.");
  if (!(valor > 0)) throw new Error("O valor precisa ser maior que zero.");
  if (!CATEGORIAS[tipo]) throw new Error("Tipo inválido.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) throw new Error("Data inválida.");
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    descricao: descricao.trim(),
    valor: Math.round(valor * 100) / 100,
    tipo,
    categoria: categoria || "Outros",
    data,
  };
}

/** Lançamentos de um mês ("AAAA-MM"), do mais recente para o mais antigo. */
function filtrarPorMes(lancamentos, mes) {
  return lancamentos
    .filter((l) => l.data.startsWith(mes))
    .sort((a, b) => b.data.localeCompare(a.data));
}

/** Totais de receitas, despesas e saldo. */
function resumo(lancamentos) {
  let receitas = 0;
  let despesas = 0;
  for (const l of lancamentos) {
    if (l.tipo === "receita") receitas += l.valor;
    else despesas += l.valor;
  }
  const arred = (v) => Math.round(v * 100) / 100;
  return { receitas: arred(receitas), despesas: arred(despesas), saldo: arred(receitas - despesas) };
}

/** Soma das despesas por categoria, da maior para a menor. */
function despesasPorCategoria(lancamentos) {
  const totais = {};
  for (const l of lancamentos) {
    if (l.tipo !== "despesa") continue;
    totais[l.categoria] = (totais[l.categoria] || 0) + l.valor;
  }
  return Object.entries(totais)
    .map(([categoria, total]) => ({ categoria, total: Math.round(total * 100) / 100 }))
    .sort((a, b) => b.total - a.total);
}

/** Gera um CSV (abre no Excel / Google Planilhas). Usa ; como separador, padrão brasileiro. */
function gerarCSV(lancamentos) {
  const escapar = (texto) => `"${String(texto).replace(/"/g, '""')}"`;
  const linhas = ["data;descricao;tipo;categoria;valor"];
  for (const l of lancamentos) {
    linhas.push([l.data, escapar(l.descricao), l.tipo, l.categoria, l.valor.toFixed(2).replace(".", ",")].join(";"));
  }
  return linhas.join("\n");
}

if (typeof module !== "undefined") {
  module.exports = { CATEGORIAS, criarLancamento, filtrarPorMes, resumo, despesasPorCategoria, gerarCSV };
}
