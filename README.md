# Sistema de Gerenciamento de Networking

Sistema completo de gerenciamento para grupos de networking, desenvolvido com Next.js 15, Prisma, PostgreSQL e Better Auth.

## 🚀 Tecnologias

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados relacional
- **Better Auth** - Sistema de autenticação moderno
- **TanStack Query** - Gerenciamento de estado assíncrono
- **Tailwind CSS** - Estilização

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
DATABASE_URL="postgresql://admin:admin123@localhost:5432/management_networking_group"
BETTER_AUTH_SECRET="seu-secret-key-aqui"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
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

## 📦 Funcionalidades

### Gerenciamento de Membros
- Cadastro de intenções de participação
- Convite e ativação de membros
- Perfis completos com informações profissionais

### Reuniões
- Agendamento de reuniões
- Controle de presença
- Histórico de participação

### Avisos e Comunicados
- Sistema de notificações
- Priorização de avisos
- Publicação agendada

### Agradecimentos
- Registro de agradecimentos entre membros
- Valoração de negócios gerados
- Visibilidade pública/privada

### One-on-One
- Agendamento de reuniões individuais
- Acompanhamento de status
- Notas e observações

### Mensalidades
- Controle de pagamentos
- Status de inadimplência
- Histórico financeiro

### Dashboard
- Métricas de performance do grupo
- Top performers
- Indicadores de crescimento

## 🗂️ Estrutura do Projeto

```
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
│   ├── types.ts          # Tipos TypeScript
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

# Qualidade de Código
pnpm lint             # Executa ESLint
```

