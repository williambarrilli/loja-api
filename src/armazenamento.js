// Guarda carrinhos e compras.
// Na Vercel usa o Redis da Upstash (variáveis criadas pela integração).
// Sem essas variáveis (rodando localmente), usa a memória do processo.

const { Redis } = require("@upstash/redis");

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const SESSENTA_DIAS = 60 * 24 * 60 * 60;

function criarRedis() {
  const redis = new Redis({ url, token });
  return {
    tipo: "redis",
    async ler(chave) {
      return (await redis.get(chave)) ?? null;
    },
    async gravar(chave, valor) {
      await redis.set(chave, valor, { ex: SESSENTA_DIAS });
    },
    async apagar(chave) {
      await redis.del(chave);
    },
    async proximoId(nome) {
      return redis.incr(`seq:${nome}`);
    },
  };
}

function criarMemoria() {
  const dados = new Map();
  const sequencias = new Map();
  return {
    tipo: "memoria",
    async ler(chave) {
      const valor = dados.get(chave);
      return valor === undefined ? null : structuredClone(valor);
    },
    async gravar(chave, valor) {
      dados.set(chave, structuredClone(valor));
    },
    async apagar(chave) {
      dados.delete(chave);
    },
    async proximoId(nome) {
      const proximo = (sequencias.get(nome) || 0) + 1;
      sequencias.set(nome, proximo);
      return proximo;
    },
  };
}

module.exports = url && token ? criarRedis() : criarMemoria();
