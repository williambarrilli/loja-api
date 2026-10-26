// Catálogo fixo da loja. Preços em CENTAVOS (inteiros): 4990 = R$ 49,90.

const categorias = [
  { id: "eletronicos", nome: "Eletrônicos" },
  { id: "roupas", nome: "Roupas" },
  { id: "casa", nome: "Casa" },
  { id: "livros", nome: "Livros" },
];

const produtos = [
  { id: 1, nome: "Fone de ouvido Bluetooth", descricao: "Fone sem fio com cancelamento de ruído e bateria para 20 horas.", preco: 19990, categoria: "eletronicos", estoque: 15 },
  { id: 2, nome: "Mouse sem fio", descricao: "Mouse ergonômico com receptor USB e ajuste de sensibilidade.", preco: 8990, categoria: "eletronicos", estoque: 30 },
  { id: 3, nome: "Teclado mecânico", descricao: "Teclado com switches azuis, iluminação e layout ABNT2.", preco: 29990, categoria: "eletronicos", estoque: 8 },
  { id: 4, nome: "Carregador portátil", descricao: "Power bank de 10.000 mAh com duas saídas USB.", preco: 12990, categoria: "eletronicos", estoque: 20 },
  { id: 5, nome: "Camiseta básica", descricao: "Camiseta 100% algodão, disponível em várias cores.", preco: 4990, categoria: "roupas", estoque: 50 },
  { id: 6, nome: "Moletom com capuz", descricao: "Moletom flanelado com bolso canguru.", preco: 15990, categoria: "roupas", estoque: 12 },
  { id: 7, nome: "Boné aba curva", descricao: "Boné ajustável com fecho de metal.", preco: 5990, categoria: "roupas", estoque: 25 },
  { id: 8, nome: "Caneca térmica", descricao: "Caneca de inox que mantém a temperatura por até 6 horas.", preco: 6990, categoria: "casa", estoque: 40 },
  { id: 9, nome: "Luminária de mesa", descricao: "Luminária LED com três níveis de intensidade.", preco: 11990, categoria: "casa", estoque: 10 },
  { id: 10, nome: "Garrafa de água", descricao: "Garrafa reutilizável de 750 ml, livre de BPA.", preco: 3990, categoria: "casa", estoque: 60 },
  { id: 11, nome: "Livro de algoritmos", descricao: "Introdução a algoritmos e estruturas de dados com exemplos.", preco: 8990, categoria: "livros", estoque: 18 },
  { id: 12, nome: "Livro de React Native", descricao: "Guia prático para criar aplicativos móveis com React Native.", preco: 9990, categoria: "livros", estoque: 5 },
];

module.exports = { categorias, produtos };
