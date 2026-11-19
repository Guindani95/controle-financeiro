// Testes automatizados. Rodar com: node --test
const test = require("node:test");
const assert = require("node:assert");
const f = require("./financas.js");

const exemplo = [
  { id: "1", descricao: "Salário", valor: 2300, tipo: "receita", categoria: "Salário", data: "2026-11-05" },
  { id: "2", descricao: "Aluguel", valor: 800, tipo: "despesa", categoria: "Moradia", data: "2026-11-10" },
  { id: "3", descricao: "Mercado", valor: 350.5, tipo: "despesa", categoria: "Alimentação", data: "2026-11-12" },
  { id: "4", descricao: "Lanche", valor: 25, tipo: "despesa", categoria: "Alimentação", data: "2026-11-13" },
  { id: "5", descricao: "Mercado", valor: 300, tipo: "despesa", categoria: "Alimentação", data: "2026-10-20" },
];

test("cria lançamento válido", () => {
  const l = f.criarLancamento({ descricao: " Ônibus ", valor: 4.5, tipo: "despesa", categoria: "Transporte", data: "2026-11-19" });
  assert.strictEqual(l.descricao, "Ônibus");
  assert.ok(l.id);
});

test("recusa lançamento inválido", () => {
  assert.throws(() => f.criarLancamento({ descricao: "", valor: 10, tipo: "despesa", data: "2026-11-19" }));
  assert.throws(() => f.criarLancamento({ descricao: "X", valor: 0, tipo: "despesa", data: "2026-11-19" }));
  assert.throws(() => f.criarLancamento({ descricao: "X", valor: 10, tipo: "outro", data: "2026-11-19" }));
});

test("filtra por mês e ordena do mais recente", () => {
  const nov = f.filtrarPorMes(exemplo, "2026-11");
  assert.strictEqual(nov.length, 4);
  assert.strictEqual(nov[0].data, "2026-11-13");
});

test("resumo calcula receitas, despesas e saldo", () => {
  const r = f.resumo(f.filtrarPorMes(exemplo, "2026-11"));
  assert.deepStrictEqual(r, { receitas: 2300, despesas: 1175.5, saldo: 1124.5 });
});

test("agrupa despesas por categoria", () => {
  const cats = f.despesasPorCategoria(f.filtrarPorMes(exemplo, "2026-11"));
  assert.deepStrictEqual(cats, [
    { categoria: "Moradia", total: 800 },
    { categoria: "Alimentação", total: 375.5 },
  ]);
});

test("CSV usa ponto e vírgula e vírgula decimal", () => {
  const csv = f.gerarCSV([exemplo[2]]);
  assert.strictEqual(csv.split("\n")[1], '2026-11-12;"Mercado";despesa;Alimentação;350,50');
});
