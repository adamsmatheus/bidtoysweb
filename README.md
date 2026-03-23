# BidToys — Web Frontend

Interface web do sistema de leilões BidToys. Funciona no navegador (PC) e se comunica com o backend via REST + WebSocket.

## Stack

| Tecnologia | Uso |
|---|---|
| React 18 + TypeScript + Vite | Framework e build |
| React Router v6 | Roteamento |
| Zustand | Estado global (auth + tempo real) |
| Axios | HTTP com interceptor JWT |
| @stomp/stompjs + sockjs-client | WebSocket (lances em tempo real) |
| TanStack Query | Cache de dados REST |
| Tailwind CSS v3 | Estilização |

## Pré-requisitos

- Node.js 18+
- Backend rodando em `http://localhost:8080`

## Como rodar localmente

```bash
# 1. Instalar dependências
npm install

# 2. Criar arquivo de variáveis de ambiente
cp .env.example .env.local

# 3. Iniciar o dev server
npm run dev
```

Acesse: `http://localhost:5173`

O Vite faz proxy automático de `/api` e `/ws` para `http://localhost:8080`, sem problemas de CORS.

## Estrutura

```
src/
├── api/           # Axios + WebSocket client
├── types/         # Interfaces TypeScript (espelham backend DTOs)
├── store/         # Zustand: auth e estado ao vivo do leilão
├── hooks/         # useAuctionSocket, useAuth
├── router/        # Rotas e guards (ProtectedRoute, AdminRoute)
├── pages/
│   ├── auth/      # Login, Register
│   ├── auctions/  # Lista, Detalhe, Criar/Editar, Meus leilões
│   ├── profile/   # Perfil do usuário
│   └── admin/     # Dashboard, Fila de aprovação, Revisar leilão
└── components/    # Navbar, AuctionCard, BidForm, CountdownTimer, StatusBadge
```

## Fluxo principal

1. Usuário faz login → JWT decodificado → role salva no Zustand
2. Listagem de leilões → `GET /api/auctions?status=ACTIVE`
3. Detalhe do leilão → WebSocket conecta em `/topic/auctions/{id}`
4. Lance dado → `POST /api/auctions/{id}/bids` → broadcast WebSocket
5. Todos os usuários conectados recebem `NEW_BID` e atualizam preço/countdown em tempo real
6. Worker do backend encerra o leilão → broadcast `AUCTION_FINISHED` → resultado exibido

## Build de produção

```bash
npm run build
# Saída em dist/
```

## Como criar um usuário admin

Use o Swagger do backend (`http://localhost:8080/swagger-ui.html`) para promover um usuário:

```
PUT /api/users/{id}
Body: { "role": "ADMIN" }
```

Ou diretamente via banco: `UPDATE users SET role = 'ADMIN' WHERE email = 'seu@email.com';`
