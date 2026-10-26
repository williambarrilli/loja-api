# Loja API — CESURG

API de produtos, carrinho e compras para o trabalho final de **Desenvolvimento de Aplicativos Móveis**.

**Endereço:** `https://[endereço-da-api].vercel.app`

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

## O `usuarioId`

Cada usuário tem o próprio carrinho, identificado pelo `usuarioId`. Use o `uid` do Firebase Authentication ou outro identificador seu, por exemplo `joao-silva`. Ele aceita de 1 a 128 caracteres: letras, números, `_` e `-`.

Use sempre o mesmo `usuarioId`, senão o carrinho "some". Usuários diferentes não veem o carrinho uns dos outros.

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
    "imagem": "https://[endereço-da-api].vercel.app/imagens/1.png"
  }
]
```

### `GET /produtos/:id`

Devolve um `Produto`, ou `404` se ele não existir.

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
      "imagem": "https://[endereço-da-api].vercel.app/imagens/1.png",
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
- Responde `201` com o carrinho atualizado.

### `PUT /carrinho/:usuarioId/itens/:produtoId`

Define a nova quantidade do item. Também aceita `PATCH`.

```json
{ "quantidade": 3 }
```

A quantidade precisa ser **1 ou mais**. Para tirar o item do carrinho, use `DELETE`.

### `DELETE /carrinho/:usuarioId/itens/:produtoId`

Remove o item. Responde com o carrinho atualizado.

### `DELETE /carrinho/:usuarioId`

Esvazia o carrinho.

## Compras

### `POST /compras`

Finaliza a compra com o que está no carrinho e **esvazia o carrinho**.

```json
{ "usuarioId": "joao-silva", "formaPagamento": "pix" }
```

Formas de pagamento: `pix`, `cartao` e `boleto`. Responde `201` com a `Compra` criada. Não há pagamento real: a compra já vem com `status: "confirmada"`.

### `GET /compras?usuarioId=joao-silva`

Lista as compras do usuário, da mais recente para a mais antiga.

### `GET /compras/:id`

Devolve uma `Compra`, ou `404`.

## Erros

Quando algo dá errado, a API responde com um status de erro e um JSON com a mensagem:

```json
{ "erro": "Estoque insuficiente: há 5 unidade(s) de \"Livro de React Native\"." }
```

| Status | Quando acontece |
|---|---|
| 400 | Dados inválidos: `produtoId` que não é número, quantidade menor que 1, estoque insuficiente, carrinho vazio, forma de pagamento inválida, `usuarioId` inválido |
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
const API = "https://[endereço-da-api].vercel.app";

// Listar produtos
async function buscarProdutos(): Promise<Produto[]> {
  const resposta = await fetch(`${API}/produtos`);
  if (!resposta.ok) throw new Error("Não foi possível carregar os produtos.");
  return resposta.json();
}

// Adicionar ao carrinho
async function adicionarAoCarrinho(usuarioId: string, produtoId: number): Promise<Carrinho> {
  const resposta = await fetch(`${API}/carrinho/${usuarioId}/itens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ produtoId, quantidade: 1 }),
  });
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error((dados as ErroApi).erro);
  return dados as Carrinho;
}

// Finalizar a compra
async function finalizarCompra(usuarioId: string, formaPagamento: FormaPagamento): Promise<Compra> {
  const resposta = await fetch(`${API}/compras`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

**Localmente** (os dados ficam na memória e se perdem ao reiniciar):

```bash
npm install
npm run dev   # http://localhost:3000
```

**Na Vercel:**

1. Importe o repositório na Vercel. Não precisa de configuração de build.
2. Em **Storage**, crie um banco **Upstash for Redis** (plano gratuito) e conecte ao projeto. A integração cria as variáveis `KV_REST_API_URL` e `KV_REST_API_TOKEN`.
3. Faça um novo deploy e abra `/status`. Deve aparecer `"armazenamento": "redis"`. Se aparecer `"memoria"`, o Redis não está conectado, e os carrinhos vão se perder entre as requisições.

Carrinhos e compras ficam salvos por 60 dias sem uso.
