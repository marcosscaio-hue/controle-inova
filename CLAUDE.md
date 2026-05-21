# CLAUDE.md

Este arquivo fornece orientações ao Claude Code (claude.ai/code) ao trabalhar com o código neste repositório.

## Comandos

```bash
# Desenvolvimento (frontend + backend simultaneamente)
npm run dev

# Apenas frontend (Vite na porta 5173)
npm run dev:front

# Apenas backend (Express na porta 3001)
npm run dev:api

# Build de produção
npm run build

# Lint
npm run lint

# Migrações do banco de dados
npm run db:migrate
npm run db:info      # exibe status das migrações
npm run db:validate  # valida checksums
```

## Configuração do Ambiente

Copie `.env.example` para `.env` e preencha as credenciais do PostgreSQL:
```
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
```

## Arquitetura

**Controle-Inova** é um sistema de gestão de produtos e vendas. Stack: React 19 + TypeScript + Vite (frontend), Express 5 (backend), PostgreSQL com SQL puro via `pg`.

### Fluxo de requisições

```
Browser → proxy Vite /api/* → Express :3001 → PostgreSQL
```

Em produção, o proxy `/api` é substituído por um reverse proxy real. O Vite está configurado com `base: '/controle-inova/'`.

### Camadas do frontend (`src/`)

| Camada | Localização | Responsabilidade |
|---|---|---|
| Páginas | `pages/` | `DashboardPage`, `ProdutosPage`, `VendasPage` |
| Hooks de dados | `hooks/` | `useProdutos`, `useVendas` — wrappers React Query para todo o CRUD |
| Componentes | `components/produtos/`, `components/vendas/` | Modais para formulários de criação/edição |
| Layout | `layouts/MainLayout.tsx` | Sidebar + `<Outlet>` |
| Estado | `store/useStore.ts` | Store Zustand — atualmente não utilizada (legado) |

React Query é a camada principal de estado do servidor; o store Zustand não está em uso ativo.

### Backend (`server/index.cjs`)

Arquivo Express único. Rotas:
- `GET/POST/PUT/DELETE /api/produtos`
- `GET/POST /api/vendas` — o POST é transacional: insere em `vendas` e depois em `venda_itens`

Sem ORM. Usa SQL puro. Colunas NUMERIC(15,2) são convertidas para float via `pg.types.setTypeParser(1700, parseFloat)`.

### Banco de dados (`db/`)

Flyway gerencia as migrações em `db/migrations/` (V1–V4). Tabelas principais:
- `produtos` — catálogo de produtos com flag `status`
- `vendas` — cabeçalho da venda
- `venda_itens` — itens da venda, FK para `vendas` e `produtos`

Timestamps automáticos de `data_alteracao` são mantidos por triggers PL/pgSQL definidos na V3.

### Componentes de UI

Shadcn (estilo base-nova, cores neutras) com TailwindCSS 4. O alias `@/*` aponta para `src/*`. Ícones do `lucide-react`.

### Sem autenticação

Não há sistema de autenticação. O rótulo "Admin" na sidebar é apenas um placeholder.
