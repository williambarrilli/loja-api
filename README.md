# Loja API — CESURG

API de produtos, carrinho e compras para o trabalho final de **Desenvolvimento de Aplicativos Móveis**.

**Endereço:** `https://loja-api-wheat.vercel.app`

> **Todos os preços e totais estão em CENTAVOS.** `4990` = R$ 49,90. Para mostrar na tela, divida por 100 e formate em reais.

## Resumo das rotas

| Método | Rota | O que faz |
|---|---|---|
| GET | `/produtos` | Lista os produtos (filtros opcionais `?categoria=` e `?busca=`) |
| GET | `/produtos/:id` | Detalhes de um produto |
| GET | `/categorias` | Lista as categorias |
| GET | `/formas-pagamento` | Lista as formas de pagamento |
| GET | `/carrinho/:usuarioId` | Mostra o carrinho do usuário |
| POST | `/carrinho/:usuarioId/itens` | Adiciona um produto ao carrinho |
| PUT | `/carrinho/:usuarioId/itens/:produtoId` | Altera a quantidade de um item |
| DELETE | `/carrinho/:usuarioId/itens/:produtoId` | Remove um item do carrinho |
| DELETE | `/carrinho/:usuarioId` | Esvazia o carrinho |
| POST | `/compras` | Finaliza a compra com o carrinho atual |
| GET | `/compras?usuarioId=` | Histórico de compras do usuário |
| GET | `/compras/:id` | Detalhes de uma compra |

## Autenticação (`x-api-key`)

Toda requisição precisa do cabeçalho `x-api-key` com a chave que o professor passou em aula:

```
x-api-key: SUA_CHAVE
```

Sem a chave, ou com uma chave errada, a API responde `401`. As rotas `/` e `/status` e as imagens dos produtos não pedem chave, então o componente `<Image>` funciona só com a URL.

## O `usuarioId`

Cada usuário tem o próprio carrinho, identificado pelo `usuarioId`. Use o `uid` do Firebase Authentication ou outro identificador seu, por exemplo `joao-silva`. Ele aceita de 1 a 128 caracteres: letras, números, `_` e `-`.

Use sempre o mesmo `usuarioId`, senão o carrinho "some". Usuários diferentes não veem o carrinho uns dos outros.

Não é preciso criar o carrinho: um `usuarioId` novo já começa com o carrinho vazio, e o primeiro `POST` de item guarda o carrinho.

Em `POST` e `PUT`, envie o corpo em JSON com o cabeçalho `Content-Type: application/json`.

## Tipos (TypeScript)

```ts
type Categoria = "eletronicos" | "roupas" | "casa" | "livros";
type FormaPagamento = "pix" | "cartao" | "boleto";

type Produto = {
  id: number;
  nome: string;
  descricao: string;
  preco: number;      // em centavos
  categoria: Categoria;
  estoque: number;
  imagem: string;     // URL da imagem (PNG)
};

type ItemCarrinho = {
  produtoId: number;
  nome: string;
  preco: number;      // em centavos
  imagem: string;
  quantidade: number;
  subtotal: number;   // preco × quantidade, em centavos
};

type Carrinho = {
  usuarioId: string;
  itens: ItemCarrinho[];
  quantidadeTotal: number; // soma das quantidades
  total: number;           // em centavos
};

type Compra = {
  id: number;
  usuarioId: string;
  itens: ItemCarrinho[];
  quantidadeTotal: number;
  total: number;           // em centavos
  formaPagamento: FormaPagamento;
  status: "confirmada";
  criadaEm: string;        // data ISO
};

type ErroApi = { erro: string };
```

## Produtos

O catálogo é fixo: são 12 produtos em 4 categorias, e a API não tem rotas para criar ou editar produtos. A `imagem` é montada pela API a partir do `id` (`/imagens/<id>.png`), então uma URL de imagem enviada pelo app é ignorada.

### `GET /produtos`

Filtros opcionais, que podem ser combinados:

- `?categoria=eletronicos` (veja `/categorias`)
- `?busca=fone` (procura no nome, sem diferenciar maiúsculas)

```json
[
  {
    "id": 1,
    "nome": "Fone de ouvido Bluetooth",
    "descricao": "Fone sem fio com cancelamento de ruído e bateria para 20 horas.",
    "preco": 19990,
    "categoria": "eletronicos",
    "estoque": 15,
    "imagem": "https://loja-api-wheat.vercel.app/imagens/1.png"
  }
]
```

### `GET /produtos/:id`

Devolve um `Produto`, ou `404` se ele não existir.

### `GET /categorias`

Devolve `eletronicos`, `roupas`, `casa` e `livros`, cada uma com `id` e `nome`.

### `GET /formas-pagamento`

Devolve `pix`, `cartao` e `boleto`, cada uma com `id` e `nome`.

## Carrinho

Todas as rotas que mudam o carrinho **devolvem o carrinho atualizado**. Não é preciso buscá-lo de novo.

### `GET /carrinho/:usuarioId`

```json
{
  "usuarioId": "joao-silva",
  "itens": [
    {
      "produtoId": 1,
      "nome": "Fone de ouvido Bluetooth",
      "preco": 19990,
      "imagem": "https://loja-api-wheat.vercel.app/imagens/1.png",
      "quantidade": 2,
      "subtotal": 39980
    }
  ],
  "quantidadeTotal": 2,
  "total": 39980
}
```

Um carrinho que nunca foi usado vem com `itens: []` e total `0`.

### `POST /carrinho/:usuarioId/itens`

```json
{ "produtoId": 1, "quantidade": 1 }
```

- `quantidade` é opcional (padrão: 1).
- Se o produto já estiver no carrinho, a quantidade **soma**, sem duplicar o item.
- Responde `201` com o carrinho atualizado, ou `400` se passar do estoque.

### `PUT /carrinho/:usuarioId/itens/:produtoId`

Define a nova quantidade do item. Também aceita `PATCH`.

```json
{ "quantidade": 3 }
```

A quantidade precisa ser **1 ou mais**. Para tirar o item do carrinho, use `DELETE`. Dá `404` se o produto não estiver no carrinho.

### `DELETE /carrinho/:usuarioId/itens/:produtoId`

Remove o item. Responde com o carrinho atualizado, ou `404` se o item não estiver no carrinho.

### `DELETE /carrinho/:usuarioId`

Esvazia o carrinho.

## Compras

### `POST /compras`

Finaliza a compra com o que está no carrinho e **esvazia o carrinho**.

```json
{ "usuarioId": "joao-silva", "formaPagamento": "pix" }
```

Formas de pagamento: `pix`, `cartao` e `boleto`. Responde `201` com a `Compra` criada, ou `400` se o carrinho estiver vazio. Não há pagamento real: a compra já vem com `status: "confirmada"`.

### `GET /compras?usuarioId=joao-silva`

Lista as compras do usuário, da mais recente para a mais antiga. Sem compras, devolve `[]`.

### `GET /compras/:id`

Devolve uma `Compra`, ou `404`.

## Erros

Quando algo dá errado, a API responde com um status de erro e um JSON com a mensagem:

```json
{ "erro": "Estoque insuficiente: há 5 unidade(s) de \"Livro de React Native\"." }
```

| Status | Quando acontece |
|---|---|
| 400 | Dados inválidos: `produtoId` que não é número, quantidade menor que 1, estoque insuficiente, carrinho vazio, forma de pagamento inválida, `usuarioId` inválido, JSON malformado |
| 401 | Cabeçalho `x-api-key` ausente ou com a chave errada |
| 404 | Produto, item do carrinho, compra ou rota não encontrados |
| 500 | Erro na API |

Sempre confira `resposta.ok` antes de usar os dados, e mostre a mensagem de `erro` para o usuário.

## Para testar carregamento e erro no app

Qualquer rota aceita dois parâmetros extras:

- `?atraso=2000`: a API demora 2 segundos para responder (máximo de 5000). Bom para ver o `ActivityIndicator`.
- `?simularErro=true`: a API responde com erro 500. Bom para testar a tela de erro.

```
GET /produtos?atraso=2000
GET /produtos?simularErro=true
```

## Exemplos com `fetch`

```ts
const API = "https://loja-api-wheat.vercel.app";
const API_KEY = "SUA_CHAVE";

const cabecalhos = {
  "Content-Type": "application/json",
  "x-api-key": API_KEY,
};

// Listar produtos
async function buscarProdutos(): Promise<Produto[]> {
  const resposta = await fetch(`${API}/produtos`, { headers: cabecalhos });
  if (!resposta.ok) throw new Error("Não foi possível carregar os produtos.");
  return resposta.json();
}

// Adicionar ao carrinho
async function adicionarAoCarrinho(usuarioId: string, produtoId: number): Promise<Carrinho> {
  const resposta = await fetch(`${API}/carrinho/${usuarioId}/itens`, {
    method: "POST",
    headers: cabecalhos,
    body: JSON.stringify({ produtoId, quantidade: 1 }),
  });
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error((dados as ErroApi).erro);
  return dados as Carrinho;
}

// Remover do carrinho
async function removerDoCarrinho(usuarioId: string, produtoId: number): Promise<Carrinho> {
  const resposta = await fetch(`${API}/carrinho/${usuarioId}/itens/${produtoId}`, {
    method: "DELETE",
    headers: cabecalhos,
  });
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error((dados as ErroApi).erro);
  return dados as Carrinho;
}

// Finalizar a compra
async function finalizarCompra(usuarioId: string, formaPagamento: FormaPagamento): Promise<Compra> {
  const resposta = await fetch(`${API}/compras`, {
    method: "POST",
    headers: cabecalhos,
    body: JSON.stringify({ usuarioId, formaPagamento }),
  });
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error((dados as ErroApi).erro);
  return dados as Compra;
}

// Formatar centavos em reais
function formatarPreco(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
```

---

## Para o professor: rodar e publicar

**Localmente** (sem `API_KEY` a API fica aberta, e sem Redis os dados ficam na memória e se perdem ao reiniciar):

```bash
npm install
npm run dev   # http://localhost:3000
```

**Na Vercel**, o projeto `loja-api` já está ligado a este repositório: cada push na `main` faz um novo deploy de produção sozinho. A configuração atual:

| Variável | De onde vem |
|---|---|
| `API_KEY` | Criada em **Settings → Environment Variables**. Para trocar a chave, mude o valor e faça um novo deploy |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Integração **Upstash for Redis** |

O banco Redis é o `upstash-kv-claret-ferry`, no plano gratuito, compartilhado com o projeto `soldiers-mvp` (o plano gratuito só permite um banco por conta). As chaves não se misturam: o loja-api só usa `carrinho:`, `compra:`, `compras:` e `seq:`, e o soldiers-mvp usa `player:` e `rank:`. Os dois projetos dividem o limite de uso do plano gratuito.

Abra `/status` para conferir: deve aparecer `"armazenamento": "redis"`. Se aparecer `"memoria"`, o Redis não está conectado, e os carrinhos vão se perder entre as requisições.

Carrinhos e compras ficam salvos por 60 dias sem uso.

**Para mudar o catálogo**, edite `src/produtos.js`. Para trocar a imagem de um produto, substitua `public/imagens/<id>.png` (mesmo nome) e faça push.
