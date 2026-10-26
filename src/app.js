const path = require("path");
const express = require("express");
const cors = require("cors");
const { categorias, produtos } = require("./produtos");
const armazenamento = require("./armazenamento");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

const FORMAS_PAGAMENTO = [
  { id: "pix", nome: "Pix" },
  { id: "cartao", nome: "Cartão de crédito" },
  { id: "boleto", nome: "Boleto" },
];

// ---------- utilidades ----------

function erro(res, status, mensagem) {
  return res.status(status).json({ erro: mensagem });
}

function urlBase(req) {
  const protocolo = req.headers["x-forwarded-proto"] || req.protocol;
  return `${protocolo}://${req.get("host")}`;
}

function urlImagem(req, produto) {
  return `${urlBase(req)}/imagens/${produto.id}.jpg`;
}

function comImagem(req, produto) {
  return { ...produto, imagem: urlImagem(req, produto) };
}

function buscarProduto(id) {
  return produtos.find((p) => p.id === Number(id));
}

function ehInteiroPositivo(valor) {
  return Number.isInteger(valor) && valor >= 1;
}

const USUARIO_VALIDO = /^[A-Za-z0-9_-]{1,128}$/;

function validarUsuario(req, res, next) {
  const usuarioId = req.params.usuarioId ?? req.body?.usuarioId ?? req.query.usuarioId;
  if (!usuarioId || !USUARIO_VALIDO.test(usuarioId)) {
    return erro(res, 400, "usuarioId inválido: use de 1 a 128 letras, números, _ ou -.");
  }
  req.usuarioId = usuarioId;
  next();
}

async function lerCarrinho(usuarioId) {
  return (await armazenamento.ler(`carrinho:${usuarioId}`)) || { itens: [] };
}

function montarCarrinho(req, usuarioId, carrinho) {
  const itens = carrinho.itens.map(({ produtoId, quantidade }) => {
    const produto = buscarProduto(produtoId);
    return {
      produtoId,
      nome: produto.nome,
      preco: produto.preco,
      imagem: urlImagem(req, produto),
      quantidade,
      subtotal: produto.preco * quantidade,
    };
  });
  return {
    usuarioId,
    itens,
    quantidadeTotal: itens.reduce((soma, item) => soma + item.quantidade, 0),
    total: itens.reduce((soma, item) => soma + item.subtotal, 0),
  };
}

// ---------- autenticação por x-api-key ----------
// A chave vem da variável API_KEY. Sem ela (rodando localmente), a API fica aberta.
// "/", "/status" e as imagens não pedem chave.

const ROTAS_PUBLICAS = ["/", "/status"];

app.use((req, res, next) => {
  if (!process.env.API_KEY || ROTAS_PUBLICAS.includes(req.path)) return next();
  if (req.get("x-api-key") !== process.env.API_KEY) {
    return erro(res, 401, "Chave de acesso inválida ou ausente: envie o cabeçalho x-api-key.");
  }
  next();
});

// ---------- simulação de lentidão e erro (para testar estados no app) ----------

app.use(async (req, res, next) => {
  if (req.query.simularErro === "true") {
    return erro(res, 500, "Erro simulado pela API.");
  }
  const atraso = Math.min(Number(req.query.atraso) || 0, 5000);
  if (atraso > 0) await new Promise((r) => setTimeout(r, atraso));
  next();
});

// ---------- informações ----------

app.get("/", (req, res) => {
  res.json({
    nome: "Loja API — CESURG",
    descricao: "API de produtos, carrinho e compras para o trabalho final de Desenvolvimento de Aplicativos Móveis.",
    observacao: "Todos os preços e totais estão em CENTAVOS (4990 = R$ 49,90).",
    rotas: [
      "GET    /produtos?categoria=&busca=",
      "GET    /produtos/:id",
      "GET    /categorias",
      "GET    /formas-pagamento",
      "GET    /carrinho/:usuarioId",
      "POST   /carrinho/:usuarioId/itens",
      "PUT    /carrinho/:usuarioId/itens/:produtoId",
      "DELETE /carrinho/:usuarioId/itens/:produtoId",
      "DELETE /carrinho/:usuarioId",
      "POST   /compras",
      "GET    /compras?usuarioId=",
      "GET    /compras/:id",
    ],
  });
});

app.get("/status", (req, res) => {
  res.json({ ok: true, armazenamento: armazenamento.tipo });
});

// ---------- produtos ----------

app.get("/categorias", (req, res) => {
  res.json(categorias);
});

app.get("/formas-pagamento", (req, res) => {
  res.json(FORMAS_PAGAMENTO);
});

app.get("/produtos", (req, res) => {
  const { categoria, busca } = req.query;
  if (categoria && !categorias.some((c) => c.id === categoria)) {
    return erro(res, 400, `Categoria inválida. Use: ${categorias.map((c) => c.id).join(", ")}.`);
  }
  const termo = (busca || "").toString().trim().toLowerCase();
  const resultado = produtos
    .filter((p) => !categoria || p.categoria === categoria)
    .filter((p) => !termo || p.nome.toLowerCase().includes(termo))
    .map((p) => comImagem(req, p));
  res.json(resultado);
});

app.get("/produtos/:id", (req, res) => {
  const produto = buscarProduto(req.params.id);
  if (!produto) return erro(res, 404, "Produto não encontrado.");
  res.json(comImagem(req, produto));
});

// ---------- carrinho ----------

app.get("/carrinho/:usuarioId", validarUsuario, async (req, res) => {
  const carrinho = await lerCarrinho(req.usuarioId);
  res.json(montarCarrinho(req, req.usuarioId, carrinho));
});

app.post("/carrinho/:usuarioId/itens", validarUsuario, async (req, res) => {
  const { produtoId } = req.body || {};
  const quantidade = req.body?.quantidade ?? 1;

  if (!Number.isInteger(produtoId)) return erro(res, 400, "Informe produtoId (número inteiro).");
  if (!ehInteiroPositivo(quantidade)) return erro(res, 400, "quantidade deve ser um número inteiro maior que zero.");

  const produto = buscarProduto(produtoId);
  if (!produto) return erro(res, 404, "Produto não encontrado.");

  const carrinho = await lerCarrinho(req.usuarioId);
  const existente = carrinho.itens.find((i) => i.produtoId === produtoId);
  const novaQuantidade = (existente?.quantidade || 0) + quantidade;

  if (novaQuantidade > produto.estoque) {
    return erro(res, 400, `Estoque insuficiente: há ${produto.estoque} unidade(s) de "${produto.nome}".`);
  }

  if (existente) existente.quantidade = novaQuantidade;
  else carrinho.itens.push({ produtoId, quantidade });

  await armazenamento.gravar(`carrinho:${req.usuarioId}`, carrinho);
  res.status(201).json(montarCarrinho(req, req.usuarioId, carrinho));
});

async function alterarQuantidade(req, res) {
  const produtoId = Number(req.params.produtoId);
  const { quantidade } = req.body || {};

  if (!ehInteiroPositivo(quantidade)) {
    return erro(res, 400, "quantidade deve ser um número inteiro maior que zero. Para tirar o item, use DELETE.");
  }

  const carrinho = await lerCarrinho(req.usuarioId);
  const item = carrinho.itens.find((i) => i.produtoId === produtoId);
  if (!item) return erro(res, 404, "Este produto não está no carrinho.");

  const produto = buscarProduto(produtoId);
  if (quantidade > produto.estoque) {
    return erro(res, 400, `Estoque insuficiente: há ${produto.estoque} unidade(s) de "${produto.nome}".`);
  }

  item.quantidade = quantidade;
  await armazenamento.gravar(`carrinho:${req.usuarioId}`, carrinho);
  res.json(montarCarrinho(req, req.usuarioId, carrinho));
}

app.put("/carrinho/:usuarioId/itens/:produtoId", validarUsuario, alterarQuantidade);
app.patch("/carrinho/:usuarioId/itens/:produtoId", validarUsuario, alterarQuantidade);

app.delete("/carrinho/:usuarioId/itens/:produtoId", validarUsuario, async (req, res) => {
  const produtoId = Number(req.params.produtoId);
  const carrinho = await lerCarrinho(req.usuarioId);
  const antes = carrinho.itens.length;
  carrinho.itens = carrinho.itens.filter((i) => i.produtoId !== produtoId);
  if (carrinho.itens.length === antes) return erro(res, 404, "Este produto não está no carrinho.");

  await armazenamento.gravar(`carrinho:${req.usuarioId}`, carrinho);
  res.json(montarCarrinho(req, req.usuarioId, carrinho));
});

app.delete("/carrinho/:usuarioId", validarUsuario, async (req, res) => {
  await armazenamento.apagar(`carrinho:${req.usuarioId}`);
  res.json(montarCarrinho(req, req.usuarioId, { itens: [] }));
});

// ---------- compras ----------

app.post("/compras", validarUsuario, async (req, res) => {
  const { formaPagamento } = req.body || {};
  if (!FORMAS_PAGAMENTO.some((f) => f.id === formaPagamento)) {
    return erro(res, 400, `Forma de pagamento inválida. Use: ${FORMAS_PAGAMENTO.map((f) => f.id).join(", ")}.`);
  }

  const carrinho = await lerCarrinho(req.usuarioId);
  if (carrinho.itens.length === 0) return erro(res, 400, "O carrinho está vazio.");

  const resumo = montarCarrinho(req, req.usuarioId, carrinho);
  const compra = {
    id: await armazenamento.proximoId("compra"),
    usuarioId: req.usuarioId,
    itens: resumo.itens,
    quantidadeTotal: resumo.quantidadeTotal,
    total: resumo.total,
    formaPagamento,
    status: "confirmada",
    criadaEm: new Date().toISOString(),
  };

  const historico = (await armazenamento.ler(`compras:${req.usuarioId}`)) || [];
  historico.unshift(compra);
  await armazenamento.gravar(`compras:${req.usuarioId}`, historico);
  await armazenamento.gravar(`compra:${compra.id}`, compra);
  await armazenamento.apagar(`carrinho:${req.usuarioId}`);

  res.status(201).json(compra);
});

app.get("/compras", validarUsuario, async (req, res) => {
  res.json((await armazenamento.ler(`compras:${req.usuarioId}`)) || []);
});

app.get("/compras/:id", async (req, res) => {
  const compra = await armazenamento.ler(`compra:${Number(req.params.id)}`);
  if (!compra) return erro(res, 404, "Compra não encontrada.");
  res.json(compra);
});

// ---------- erros ----------

app.use((req, res) => erro(res, 404, `Rota não encontrada: ${req.method} ${req.path}`));

app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") return erro(res, 400, "JSON inválido no corpo da requisição.");
  console.error(err);
  erro(res, 500, "Erro interno da API.");
});

module.exports = app;
