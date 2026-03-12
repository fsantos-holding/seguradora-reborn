# Backlog Reborn — Painel Executivo Kanban

## Estrutura do Projeto

```
seguradora-reborn/
├── api/
│   └── db.js              # API serverless (usa Vercel KV / Redis)
├── data/
│   └── db.json             # Seed inicial do banco de dados
├── public/
│   └── index.html          # Frontend Kanban
├── package.json            # Dependência: @vercel/kv
├── vercel.json             # Roteamento
└── README.md
```

## Configuração Obrigatória: Vercel KV

O sistema usa **Vercel KV (Redis)** para persistir dados entre sessões e browsers.

### Passo a passo:

1. Acesse o dashboard do Vercel → seu projeto `seguradora-reborn`

2. Vá em **Storage** (menu lateral)

3. Clique **Create Database** → selecione **KV (Redis)**

4. Nome: `backlog-reborn-kv` (ou qualquer nome)

5. Clique **Create** e depois **Connect to Project** → selecione `seguradora-reborn`

6. O Vercel adiciona automaticamente as variáveis de ambiente:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`
   - `KV_URL`

7. Faça um **Redeploy** do projeto (Deployments → Redeploy)

### Verificação:

Acesse `https://seguradora-reborn.vercel.app/api/db` — deve retornar o JSON com os cards.

## Persistência

| Camada | Velocidade | Escopo | Persistência |
|--------|-----------|--------|-------------|
| localStorage | Instantânea | Por browser | Local permanente |
| Vercel KV (Redis) | ~100ms | Global | Servidor permanente |

## Uso Local (sem Vercel)

Abra `public/index.html` direto no browser. Funciona 100% via localStorage.

## Exportação

Botão CSV no header: separador `;`, UTF-8 com BOM (Excel-compatível).
