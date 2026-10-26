import { useEffect, useState } from 'react'

// Endereço e chave vêm do arquivo .env.local (veja .env.example)
const API_URL = import.meta.env.VITE_API_URL
const API_KEY = import.meta.env.VITE_API_KEY

// A API devolve preços em centavos: 4990 -> "R$ 49,90"
function formatarPreco(centavos) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function App() {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const resposta = await fetch(`${API_URL}/produtos`, {
          headers: { 'x-api-key': API_KEY },
        })
        const dados = await resposta.json()
        if (!resposta.ok) throw new Error(dados.erro)
        setProdutos(dados)
      } catch (e) {
        setErro(e.message)
      } finally {
        setCarregando(false)
      }
    }

    carregarProdutos()
  }, [])

  if (carregando) return <p className="aviso">Carregando produtos...</p>
  if (erro) return <p className="aviso erro">Erro: {erro}</p>

  return (
    <main>
      <h1>Produtos</h1>
      <p className="subtitulo">GET {API_URL}/produtos · {produtos.length} itens</p>

      <ul className="grade">
        {produtos.map((produto) => (
          <li key={produto.id} className="cartao">
            <img src={produto.imagem} alt={produto.nome} />
            <h2>{produto.nome}</h2>
            <p className="preco">{formatarPreco(produto.preco)}</p>
            <p className="estoque">{produto.estoque} em estoque</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
