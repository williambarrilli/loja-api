// Catálogo fixo da loja. Preços em CENTAVOS (inteiros): 4990 = R$ 49,90.
// Produtos sem "imagem" usam public/imagens/<id>.png. Os que têm "imagem" usam
// fotos de licença livre do Wikimedia Commons (créditos no README).

const categorias = [
  { id: "eletronicos", nome: "Eletrônicos" },
  { id: "roupas", nome: "Roupas" },
  { id: "casa", nome: "Casa" },
  { id: "livros", nome: "Livros" },
  { id: "cervejas", nome: "Cervejas" },
  { id: "carnes", nome: "Carnes" },
  { id: "refrigerantes", nome: "Refrigerantes" },
  { id: "chocolates", nome: "Chocolates" },
  { id: "cachorro-quente", nome: "Cachorro-quente" },
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
  { id: 13, nome: "Cerveja Pilsen long neck", descricao: "Cerveja leve e refrescante, garrafa de 355 ml.", preco: 699, categoria: "cervejas", estoque: 48, imagem: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/Lav_beer_and_glass_-_2012-10-12_-_Andy_Mabbett.jpg/500px-Lav_beer_and_glass_-_2012-10-12_-_Andy_Mabbett.jpg" },
  { id: 14, nome: "Cerveja de trigo", descricao: "Cerveja de trigo estilo alemão, encorpada e aromática, garrafa de 500 ml.", preco: 1590, categoria: "cervejas", estoque: 24, imagem: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/Glass_of_wheat_beer_Krautheimer%2C_Friedrich_D%C3%BCll_Brewery%2C_Volkach-Krautheim%2C_Lower_Franconia.jpg/500px-Glass_of_wheat_beer_Krautheimer%2C_Friedrich_D%C3%BCll_Brewery%2C_Volkach-Krautheim%2C_Lower_Franconia.jpg" },
  { id: 15, nome: "Pack de cerveja com 12 latas", descricao: "Doze latas de 350 ml de cerveja Pilsen.", preco: 4990, categoria: "cervejas", estoque: 10, imagem: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Beer_cans.jpg/500px-Beer_cans.jpg" },
  { id: 16, nome: "Picanha", descricao: "Peça de picanha bovina, aproximadamente 1 kg.", preco: 8990, categoria: "carnes", estoque: 8, imagem: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5f/Picanha.jpg/500px-Picanha.jpg" },
  { id: 17, nome: "Costela bovina", descricao: "Costela bovina para assar, aproximadamente 1 kg.", preco: 3990, categoria: "carnes", estoque: 15, imagem: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1c/C%C3%B4te_%28Costela_de_boi%29_%283220167933%29.jpg/500px-C%C3%B4te_%28Costela_de_boi%29_%283220167933%29.jpg" },
  { id: 18, nome: "Refrigerante de cola", descricao: "Refrigerante sabor cola, garrafa de 2 litros.", preco: 999, categoria: "refrigerantes", estoque: 40, imagem: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/Glass_cola.jpg/500px-Glass_cola.jpg" },
  { id: 19, nome: "Refrigerante de laranja", descricao: "Refrigerante sabor laranja, garrafa de 2 litros.", preco: 849, categoria: "refrigerantes", estoque: 35, imagem: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/Orangeade.jpg/500px-Orangeade.jpg" },
  { id: 20, nome: "Barra de chocolate ao leite", descricao: "Chocolate ao leite cremoso, barra de 90 g.", preco: 699, categoria: "chocolates", estoque: 60, imagem: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Hershey-bar-open.JPG/500px-Hershey-bar-open.JPG" },
  { id: 21, nome: "Chocolate amargo 70%", descricao: "Chocolate com 70% de cacau, barra de 100 g.", preco: 1290, categoria: "chocolates", estoque: 30, imagem: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/10/Righteously_Raw_chocolate.jpg/500px-Righteously_Raw_chocolate.jpg" },
  { id: 22, nome: "Caixa de bombons", descricao: "Caixa com bombons sortidos, 250 g.", preco: 1490, categoria: "chocolates", estoque: 3, imagem: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/Victoria_Bonbons_Assortis_box%2C_pic1.JPG/500px-Victoria_Bonbons_Assortis_box%2C_pic1.JPG" },
  { id: 23, nome: "Cachorro-quente tradicional", descricao: "Pão, salsicha, molho de tomate, mostarda e ketchup.", preco: 1290, categoria: "cachorro-quente", estoque: 20, imagem: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/Hot_dog_01.jpg/500px-Hot_dog_01.jpg" },
  { id: 24, nome: "Cachorro-quente completo", descricao: "Pão, duas salsichas, purê, milho, ervilha, queijo ralado e batata palha.", preco: 1890, categoria: "cachorro-quente", estoque: 15, imagem: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b6/Hot_dog_gourmet.jpg/500px-Hot_dog_gourmet.jpg" },
];

module.exports = { categorias, produtos };
