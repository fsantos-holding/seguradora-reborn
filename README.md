# Backlog Reborn — Painel Executivo Kanban

## Estrutura do Projeto

```
vercel-kanban/
├── api/
│   └── db.js              # API route GET/POST para persistência
├── data/
│   └── db.json             # Seed inicial do banco de dados
├── public/
│   └── index.html          # Frontend (Kanban completo)
├── package.json
├── vercel.json             # Configuração de rotas Vercel
└── README.md
```

## Deploy no Vercel

### Opção 1: Via CLI
```bash
npm i -g vercel
cd vercel-kanban
vercel
```

### Opção 2: Via GitHub
1. Criar um repositório no GitHub com estes arquivos
2. Conectar o repositório no dashboard do Vercel
3. Deploy automático

## Persistência

O sistema usa **dupla persistência**:

- **localStorage** — gravação instantânea a cada alteração (funciona offline)
- **API `/api/db`** — sync assíncrono com arquivo JSON no servidor (Vercel `/tmp`)

### Para persistência permanente no Vercel:
O `/tmp` do Vercel é efêmero (limpa entre cold starts). Para persistência real, substitua o `api/db.js` por uma das opções:

- **Vercel KV** (Redis) — `@vercel/kv`
- **Vercel Postgres** — `@vercel/postgres`  
- **Supabase** — client REST
- **Firebase Realtime DB** — client REST

O localStorage garante que o usuário nunca perde dados no navegador, mesmo sem backend.

## Uso Local (sem Vercel)

Basta abrir `public/index.html` diretamente no navegador. A persistência funciona 100% via localStorage. A chamada à API falha silenciosamente.

## Exportação

- **CSV** — botão no header exporta todos os cards com separador `;` e encoding UTF-8 com BOM (abre direto no Excel)
