// Tela do controle financeiro. Os dados ficam salvos no navegador (localStorage).

const CHAVE = "controle-financeiro:lancamentos";
const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

let lancamentos = carregar();

function carregar() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) || [];
  } catch {
    return [];
  }
}

function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lancamentos));
  } catch {
    // Se o navegador bloquear o armazenamento, o app continua funcionando nesta sessão.
  }
}

const campoMes = document.getElementById("mes");
const campoTipo = document.getElementById("tipo");
const campoCategoria = document.getElementById("categoria");

// Data local (toISOString usaria o fuso UTC e mostraria "amanhã" depois das 21h no Brasil)
function hoje() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function preencherCategorias() {
  campoCategoria.innerHTML = "";
  for (const nome of CATEGORIAS[campoTipo.value]) {
    const opcao = document.createElement("option");
    opcao.textContent = nome;
    campoCategoria.appendChild(opcao);
  }
}

function desenhar() {
  const doMes = filtrarPorMes(lancamentos, campoMes.value);
  const totais = resumo(doMes);

  document.getElementById("receitas").textContent = moeda.format(totais.receitas);
  document.getElementById("despesas").textContent = moeda.format(totais.despesas);
  const saldo = document.getElementById("saldo");
  saldo.textContent = moeda.format(totais.saldo);
  saldo.classList.toggle("negativo", totais.saldo < 0);

  // Barras de despesas por categoria
  const barras = document.getElementById("barras");
  barras.innerHTML = "";
  const categorias = despesasPorCategoria(doMes);
  const maior = categorias[0]?.total || 1;
  for (const { categoria, total } of categorias) {
    const linha = document.createElement("div");
    linha.className = "barra";
    linha.innerHTML = `<span class="barra-nome"></span><span class="barra-trilho"><span class="barra-cheia"></span></span><span class="barra-valor"></span>`;
    linha.querySelector(".barra-nome").textContent = categoria;
    linha.querySelector(".barra-cheia").style.width = `${(total / maior) * 100}%`;
    linha.querySelector(".barra-valor").textContent = moeda.format(total);
    barras.appendChild(linha);
  }
  document.getElementById("semDespesas").hidden = categorias.length > 0;

  // Lista de lançamentos
  const lista = document.getElementById("lista");
  lista.innerHTML = "";
  for (const l of doMes) {
    const item = document.createElement("li");
    item.className = l.tipo;
    item.innerHTML = `<div><strong></strong><small></small></div><span class="valor"></span><button class="remover" aria-label="Remover">✕</button>`;
    item.querySelector("strong").textContent = l.descricao;
    item.querySelector("small").textContent = `${l.categoria} · ${l.data.split("-").reverse().join("/")}`;
    item.querySelector(".valor").textContent = (l.tipo === "despesa" ? "− " : "+ ") + moeda.format(l.valor);
    item.querySelector(".remover").addEventListener("click", () => remover(l.id));
    lista.appendChild(item);
  }
  document.getElementById("vazio").hidden = doMes.length > 0;
}

function adicionar(evento) {
  evento.preventDefault();
  const erro = document.getElementById("erro");
  try {
    const novo = criarLancamento({
      descricao: document.getElementById("descricao").value,
      valor: Number(document.getElementById("valor").value.replace(",", ".")),
      tipo: campoTipo.value,
      categoria: campoCategoria.value,
      data: document.getElementById("data").value,
    });
    lancamentos.push(novo);
    salvar();
    erro.hidden = true;
    evento.target.reset();
    document.getElementById("data").value = hoje();
    preencherCategorias();
    campoMes.value = novo.data.slice(0, 7);
    desenhar();
  } catch (e) {
    erro.textContent = e.message;
    erro.hidden = false;
  }
}

function remover(id) {
  lancamentos = lancamentos.filter((l) => l.id !== id);
  salvar();
  desenhar();
}

function exportar() {
  const csv = gerarCSV(filtrarPorMes(lancamentos, campoMes.value));
  const arquivo = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(arquivo);
  link.download = `financas-${campoMes.value}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

campoMes.value = hoje().slice(0, 7);
document.getElementById("data").value = hoje();
preencherCategorias();
campoTipo.addEventListener("change", preencherCategorias);
campoMes.addEventListener("change", desenhar);
document.getElementById("formulario").addEventListener("submit", adicionar);
document.getElementById("exportar").addEventListener("click", exportar);
desenhar();
