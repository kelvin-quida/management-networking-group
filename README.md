# Sistema de Gerenciamento de Networking

Sistema completo de gerenciamento para grupos de networking, desenvolvido com Next.js 15, Prisma, PostgreSQL e Better Auth.

## 📋 Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- pnpm (recomendado)

## 🔧 Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
pnpm install
```

3. Inicie o banco de dados PostgreSQL com Docker:

```bash
docker-compose up -d
```

4. Configure as variáveis de ambiente (`.env`):

```env
DATABASE_URL="postgresql://admin:admin123@localhost:5432/management_networking_group?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
BETTER_AUTH_SECRET="secret-key"
```

5. Execute as migrations do banco de dados:

```bash
pnpm db:push
```

6. Popule o banco com dados de exemplo:

```bash
pnpm db:seed
```

7. Crie o usuário Admin:

```bash
pnpm admin:create
```

## 🏃 Executando o Projeto

```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## 🔐 Credenciais de Acesso

Após executar `pnpm admin:create`, use as seguintes credenciais para acessar o painel administrativo:

- **Email:** admin@networking.com
- **Senha:** admin123456
- **Role:** ADMIN

### Sistema de Roles

O sistema possui três níveis de acesso:

- **GUEST** - Usuário recém-cadastrado, aguardando aprovação
- **MEMBER** - Membro aprovado com acesso ao portal
- **ADMIN** - Administrador com acesso total ao sistema

### Fluxo de Aprovação

1. Usuário se cadastra via `/signup` → role **GUEST**
2. Usuário é redirecionado para `/pending` → envia intenção de participação via home (`/`)
3. Admin aprova intenção → usuário recebe role **MEMBER** e `memberId`
4. Usuário pode acessar o portal de membros (`/dashboard`)

## 📦 Funcionalidades

### Gerenciamento de Membros
- Cadastro de intenções de participação
- Convite e ativação de membros
- Perfis completos com informações profissionais

### Reuniões
- Agendamento de reuniões
- Sistema de check-in para membros
- Controle de presença em tempo real
- Histórico de participação
- Atualização automática do status de check-in

### Avisos e Comunicados
- Sistema de notificações
- Priorização de avisos
- Publicação agendada

### Agradecimentos
- Registro de agradecimentos entre membros
- Valoração de negócios gerados
- Visibilidade pública/privada

### One-on-One
- Agendamento de reuniões individuais via modal
- Seleção de membro, data, horário e notas
- Marcar reuniões como concluídas ou canceladas
- Acompanhamento de status (SCHEDULED, COMPLETED, CANCELLED)
- Notas e observações

### Mensalidades
- Controle de pagamentos
- Status de inadimplência
- Histórico financeiro

### Dashboard
- Métricas de performance do grupo
- Top performers
- Indicadores de crescimento
- Atualização automática após ações administrativas
- Invalidação inteligente de queries com TanStack Query

## 🗂️ Estrutura do Projeto

```
├── __tests__/            # Testes de integração
│   ├── api/              # Testes de API routes
│   ├── components/       # Testes de componentes
│   └── hooks/            # Testes de hooks
├── app/
│   ├── (admin)/          # Rotas administrativas
│   ├── (member)/         # Rotas de membros
│   ├── (public)/         # Rotas públicas (login, registro)
│   └── api/              # API routes
├── components/
│   ├── auth/             # Componentes de autenticação
│   ├── features/         # Componentes de funcionalidades
│   ├── layout/           # Componentes de layout
│   └── ui/               # Componentes UI reutilizáveis
├── hooks/                # React Query hooks
├── lib/                  # Utilitários e configurações
│   ├── auth-config.ts    # Configuração Better Auth
│   ├── auth-client.ts    # Cliente Better Auth
│   ├── prisma.ts         # Cliente Prisma
│   ├── types.ts          # Tipos TypeScript centralizados
│   ├── query-keys.ts     # Query Key Factories (TanStack Query)
│   └── validations/      # Schemas Zod
├── prisma/
│   ├── schema.prisma     # Schema do banco de dados
│   └── migrations/       # Migrations
└── middleware.ts         # Middleware de autenticação
```

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor de desenvolvimento

# Build
pnpm build            # Build para produção
pnpm start            # Inicia servidor de produção

# Testes
pnpm test             # Executa todos os testes
pnpm test:watch       # Executa testes em modo watch
pnpm test:coverage    # Executa testes com cobertura

# Docker
docker-compose up -d  # Inicia PostgreSQL em background
docker-compose down   # Para o PostgreSQL
docker-compose logs   # Visualiza logs do banco

# Banco de Dados
pnpm db:generate      # Gera Prisma Client
pnpm db:push          # Sincroniza schema com banco
pnpm db:migrate       # Cria migration
pnpm db:seed          # Popula banco com dados
pnpm db:studio        # Abre Prisma Studio
pnpm db:reset         # Reseta banco de dados
pnpm admin:create     # Cria usuário admin
pnpm admin:make       # Transforma usuário existente em admin

# Qualidade de Código
pnpm lint             # Executa ESLint
```