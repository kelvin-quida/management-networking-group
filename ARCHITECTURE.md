# Documento de Arquitetura - Sistema de Gestão de Grupos de Networking

## 1. Visão Geral

Sistema completo de gestão para grupos de networking empresarial, implementado com Next.js, TypeScript, Prisma ORM, PostgreSQL, Docker, Zod e React Query.

O sistema abrange todo o ciclo de vida de um grupo de networking: desde a admissão de novos membros, passando pela comunicação interna, geração de negócios através de indicações, acompanhamento de performance, até o controle financeiro de mensalidades.

### 1.1 Objetivos

**1. Gestão de Membros:**
- Permitir que usuários manifestem interesse em participar do grupo
- Fornecer área administrativa para aprovar/rejeitar intenções
- Gerar convites únicos com tokens temporários
- Permitir cadastro completo apenas via token válido
- Gerenciar perfis e status de membros

**2. Comunicação e Engajamento:**
- Publicar avisos e comunicados para os membros
- Controlar presença em reuniões através de check-in
- Manter histórico de participação

**3. Geração de Negócios:**
- Facilitar indicações e referências de negócios entre membros
- Rastrear status das indicações (enviada, em negociação, fechada)
- Registrar agradecimentos públicos por negócios concretizados
- Calcular valor gerado pelo grupo

**4. Acompanhamento e Performance:**
- Controlar reuniões 1 a 1 entre membros
- Exibir dashboards de desempenho individual e coletivo
- Gerar relatórios por período (semanal, mensal, acumulado)
- Métricas de engajamento e produtividade

**5. Financeiro:**
- Gerar e controlar mensalidades dos membros
- Rastrear status de pagamento
- Relatórios financeiros do grupo

## 2. Arquitetura do Sistema

### 2.1 Diagrama de Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ARQUITETURA DO SISTEMA                               │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Next.js 14)                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │   Páginas    │  │  Componentes │  │  React Query │                │
│  │   Públicas   │  │      UI      │  │    Hooks     │                │
│  └──────────────┘  └──────────────┘  └──────────────┘                │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │   Páginas    │  │  Validação   │  │    Estado    │                │
│  │    Admin     │  │     Zod      │  │    Global    │                │
│  └──────────────┘  └──────────────┘  └──────────────┘                │
│                                                                         │
└────────────────────────────┬────────────────────────────────────────────┘
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      BACKEND API (Next.js API Routes)                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐      │
│  │  Gestão de │  │Comunicação │  │  Geração   │  │Performance │      │
│  │   Membros  │  │Engajamento │  │ Negócios   │  │  Tracking  │      │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘      │
│                                                                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐      │
│  │ Financeiro │  │Autenticação│  │ Validação  │  │   Email    │      │
│  │            │  │   Admin    │  │    Zod     │  │  Service   │      │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘      │
│                                                                         │
└────────────────────────────┬────────────────────────────────────────────┘
                             │ Prisma ORM
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      BANCO DE DADOS (PostgreSQL)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐      │
│  │ Intentions │  │  Members   │  │   Notices  │  │  Meetings  │      │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘      │
│                                                                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐      │
│  │Attendances │  │ Referrals  │  │  Thanks    │  │ OneOnOnes  │      │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘      │
│                                                                         │
│  ┌────────────┐  ┌────────────┐                                       │
│  │Memberships │  │ EmailLogs  │                                       │
│  └────────────┘  └────────────┘                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.1.1 Diagrama em Mermaid

```mermaid
graph TB
    subgraph Frontend["FRONTEND - Next.js"]
        direction TB
        PUB[Páginas Públicas]
        MEMBER[Páginas Membros]
        ADMIN[Páginas Admin]
        UI[Componentes UI]
        RQ[React Query]
        ZOD[Validação Zod]
    end

    subgraph Backend["BACKEND - Next.js API Routes"]
        direction TB
        
        subgraph APIs["APIs por Módulo"]
            API1[Gestão Membros]
            API2[Comunicação]
            API3[Negócios]
            API4[Performance]
            API5[Financeiro]
        end
        
        AUTH[Autenticação]
        EMAIL[Email Service]
    end

    subgraph Database["DATABASE - PostgreSQL + Prisma"]
        direction TB
        
        subgraph DB1["Gestão"]
            T1[(Intentions)]
            T2[(Members)]
        end
        
        subgraph DB2["Comunicação"]
            T3[(Notices)]
            T4[(Meetings)]
            T5[(Attendances)]
        end
        
        subgraph DB3["Negócios"]
            T6[(Referrals)]
            T7[(Thanks)]
        end
        
        subgraph DB4["Performance"]
            T8[(OneOnOnes)]
        end
        
        subgraph DB5["Financeiro"]
            T9[(Memberships)]
        end
        
        subgraph DB6["Sistema"]
            T10[(EmailLogs)]
        end
    end

    %% Conexões Frontend
    PUB -->|HTTP/REST| API1
    MEMBER -->|HTTP/REST| API1
    MEMBER -->|HTTP/REST| API2
    MEMBER -->|HTTP/REST| API3
    MEMBER -->|HTTP/REST| API4
    ADMIN -->|Admin Key| AUTH
    ADMIN -->|HTTP/REST| API1
    ADMIN -->|HTTP/REST| API2
    ADMIN -->|HTTP/REST| API5
    
    UI -.->|usa| RQ
    RQ -.->|valida| ZOD

    %% Conexões Backend
    AUTH -.->|protege| API1
    AUTH -.->|protege| API2
    AUTH -.->|protege| API5
    
    API1 -->|Prisma| T1
    API1 -->|Prisma| T2
    API2 -->|Prisma| T3
    API2 -->|Prisma| T4
    API2 -->|Prisma| T5
    API3 -->|Prisma| T6
    API3 -->|Prisma| T7
    API4 -->|Prisma| T8
    API5 -->|Prisma| T9
    EMAIL -->|Prisma| T10

    %% Estilos
    style Frontend fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style Backend fill:#fff3e0,stroke:#f57c00,stroke-width:3px
    style Database fill:#e8f5e9,stroke:#388e3c,stroke-width:3px
    
    style PUB fill:#90caf9
    style MEMBER fill:#90caf9
    style ADMIN fill:#ef5350
    style UI fill:#64b5f6
    style RQ fill:#64b5f6
    style ZOD fill:#64b5f6
    
    style APIs fill:#ffe0b2
    style API1 fill:#ffb74d
    style API2 fill:#ffb74d
    style API3 fill:#ffb74d
    style API4 fill:#ffb74d
    style API5 fill:#ffb74d
    style AUTH fill:#ff8a65
    style EMAIL fill:#ff8a65
    
    style DB1 fill:#c8e6c9
    style DB2 fill:#c8e6c9
    style DB3 fill:#c8e6c9
    style DB4 fill:#c8e6c9
    style DB5 fill:#c8e6c9
    style DB6 fill:#e0e0e0
    style T1 fill:#81c784
    style T2 fill:#81c784
    style T3 fill:#81c784
    style T4 fill:#81c784
    style T5 fill:#81c784
    style T6 fill:#81c784
    style T7 fill:#81c784
    style T8 fill:#81c784
    style T9 fill:#81c784
    style T10 fill:#bdbdbd
```

### 2.2 Estrutura de Componentes (Frontend)

```
┌─────────────────────────────────────────────────────────────────┐
│                      ESTRUTURA DO PROJETO                       │
└─────────────────────────────────────────────────────────────────┘

src/
├── app/                                    # Next.js App Router
│   ├── api/                                # API Routes
│   │   ├── intentions/
│   │   │   ├── route.ts                    # POST, GET intentions
│   │   │   ├── approve/route.ts            # POST approve
│   │   │   └── reject/route.ts             # POST reject
│   │   ├── members/
│   │   │   ├── route.ts                    # GET members list
│   │   │   ├── [id]/route.ts               # GET, PATCH, DELETE member
│   │   │   ├── register/route.ts           # POST register
│   │   │   └── validate-token/route.ts     # GET validate
│   │   ├── notices/
│   │   │   ├── route.ts                    # GET, POST notices
│   │   │   └── [id]/route.ts               # GET, PATCH, DELETE notice
│   │   ├── meetings/
│   │   │   ├── route.ts                    # GET, POST meetings
│   │   │   ├── [id]/route.ts               # GET, PATCH, DELETE meeting
│   │   │   └── [id]/check-in/route.ts      # POST check-in
│   │   ├── attendances/
│   │   │   ├── route.ts                    # GET attendances
│   │   │   └── stats/route.ts              # GET attendance stats
│   │   ├── referrals/
│   │   │   ├── route.ts                    # GET, POST referrals
│   │   │   ├── [id]/route.ts               # GET, PATCH referral
│   │   │   └── stats/route.ts              # GET referral stats
│   │   ├── thanks/
│   │   │   ├── route.ts                    # GET, POST thanks
│   │   │   └── [id]/route.ts               # GET, DELETE thank
│   │   ├── one-on-ones/
│   │   │   ├── route.ts                    # GET, POST one-on-ones
│   │   │   └── [id]/route.ts               # GET, PATCH one-on-one
│   │   ├── memberships/
│   │   │   ├── route.ts                    # GET, POST memberships
│   │   │   ├── [id]/route.ts               # GET, PATCH membership
│   │   │   └── [id]/pay/route.ts           # POST payment
│   │   ├── dashboard/
│   │   │   ├── member/[id]/route.ts        # GET member dashboard
│   │   │   ├── group/route.ts              # GET group dashboard
│   │   │   └── reports/route.ts            # GET reports
│   │   └── emails/route.ts                 # GET email logs
│   │
│   ├── (public)/                           # Public routes
│   │   ├── page.tsx                        # Home (intention form)
│   │   ├── register/page.tsx               # Registration page
│   │   └── layout.tsx                      # Public layout
│   │
│   ├── (member)/                           # Member routes (auth required)
│   │   ├── dashboard/page.tsx              # Member dashboard
│   │   ├── notices/page.tsx                # Notices list
│   │   ├── meetings/page.tsx               # Meetings list
│   │   ├── referrals/
│   │   │   ├── page.tsx                    # My referrals
│   │   │   └── new/page.tsx                # Create referral
│   │   ├── thanks/page.tsx                 # Thanks feed
│   │   ├── one-on-ones/page.tsx            # 1-on-1 meetings
│   │   ├── profile/page.tsx                # My profile
│   │   └── layout.tsx                      # Member layout
│   │
│   ├── (admin)/                            # Admin routes
│   │   ├── admin/
│   │   │   ├── page.tsx                    # Admin dashboard
│   │   │   ├── intentions/page.tsx         # Manage intentions
│   │   │   ├── members/page.tsx            # Manage members
│   │   │   ├── notices/
│   │   │   │   ├── page.tsx                # Manage notices
│   │   │   │   └── new/page.tsx            # Create notice
│   │   │   ├── meetings/
│   │   │   │   ├── page.tsx                # Manage meetings
│   │   │   │   └── new/page.tsx            # Create meeting
│   │   │   ├── referrals/page.tsx          # All referrals
│   │   │   ├── memberships/page.tsx        # Financial control
│   │   │   ├── reports/page.tsx            # Reports
│   │   │   └── emails/page.tsx             # Email logs
│   │   └── layout.tsx                      # Admin layout
│   │
│   ├── layout.tsx                          # Root layout
│   └── globals.css                         # Global styles
│
├── components/                             # React Components
│   ├── ui/                                 # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Table.tsx
│   │   ├── Modal.tsx
│   │   └── Toast.tsx
│   │
│   ├── features/                           # Feature components
│   │   ├── intentions/
│   │   │   ├── IntentionForm.tsx
│   │   │   ├── IntentionsList.tsx
│   │   │   └── IntentionCard.tsx
│   │   ├── members/
│   │   │   ├── RegistrationForm.tsx
│   │   │   ├── MemberCard.tsx
│   │   │   ├── MembersList.tsx
│   │   │   └── MemberProfile.tsx
│   │   ├── notices/
│   │   │   ├── NoticeForm.tsx
│   │   │   ├── NoticeCard.tsx
│   │   │   └── NoticesList.tsx
│   │   ├── meetings/
│   │   │   ├── MeetingForm.tsx
│   │   │   ├── MeetingCard.tsx
│   │   │   ├── CheckInButton.tsx
│   │   │   └── AttendanceList.tsx
│   │   ├── referrals/
│   │   │   ├── ReferralForm.tsx
│   │   │   ├── ReferralCard.tsx
│   │   │   ├── ReferralsList.tsx
│   │   │   └── ReferralStatusBadge.tsx
│   │   ├── thanks/
│   │   │   ├── ThankForm.tsx
│   │   │   ├── ThankCard.tsx
│   │   │   └── ThanksFeed.tsx
│   │   ├── one-on-ones/
│   │   │   ├── OneOnOneForm.tsx
│   │   │   ├── OneOnOneCard.tsx
│   │   │   └── OneOnOnesList.tsx
│   │   ├── memberships/
│   │   │   ├── MembershipCard.tsx
│   │   │   ├── PaymentForm.tsx
│   │   │   └── PaymentHistory.tsx
│   │   └── dashboard/
│   │       ├── MemberDashboard.tsx
│   │       ├── GroupDashboard.tsx
│   │       ├── StatsCard.tsx
│   │       ├── PerformanceChart.tsx
│   │       └── ReportsTable.tsx
│   │
│   └── layout/                             # Layout components
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       ├── Footer.tsx
│       └── Navigation.tsx
│
├── hooks/                                  # React Query Hooks
│   ├── useIntentions.ts
│   ├── useMembers.ts
│   ├── useNotices.ts
│   ├── useMeetings.ts
│   ├── useAttendances.ts
│   ├── useReferrals.ts
│   ├── useThanks.ts
│   ├── useOneOnOnes.ts
│   ├── useMemberships.ts
│   ├── useDashboard.ts
│   └── useEmails.ts
│
├── lib/                                    # Utilities & Core Logic
│   ├── prisma.ts                           # Prisma client singleton
│   ├── validations/                        # Zod schemas
│   │   ├── intentions.ts
│   │   ├── members.ts
│   │   ├── notices.ts
│   │   ├── meetings.ts
│   │   ├── referrals.ts
│   │   ├── thanks.ts
│   │   ├── one-on-ones.ts
│   │   └── memberships.ts
│   ├── auth.ts                             # Admin authentication
│   ├── tokens.ts                           # Token generation/validation
│   ├── email.ts                            # Email simulation
│   ├── reports.ts                          # Report generation
│   └── utils.ts                            # Helper functions
│
├── types/                                  # TypeScript types
│   ├── intentions.ts
│   ├── members.ts
│   ├── notices.ts
│   ├── meetings.ts
│   ├── referrals.ts
│   ├── thanks.ts
│   ├── one-on-ones.ts
│   └── memberships.ts
│
└── providers/
    └── QueryProvider.tsx                   # React Query provider

prisma/
├── schema.prisma                           # Database schema
└── seed.ts                                 # Database seeding
```

## 3. Modelo de Dados

### 3.1 Schema do Banco de Dados Completo
> **Nota sobre a Especificação:** O modelo de dados está especificado em **Prisma Schema Language**, que é a linguagem declarativa padrão para definição de schemas de banco de dados em aplicações modernas. O Prisma converte automaticamente este schema em migrations SQL otimizadas para PostgreSQL. Esta abordagem oferece:
> - ✅ **Type-safety** completo com TypeScript
> - ✅ **Legibilidade superior** comparado a SQL puro
> - ✅ **Relacionamentos explícitos** e auto-documentados
> - ✅ **Padrão da indústria** para Next.js e aplicações full-stack modernas
> - ✅ **Geração automática** de queries otimizadas

```prisma
// ============================================
// 1. GESTÃO DE MEMBROS
// ============================================

model Intention {
  id        String           @id @default(cuid())
  name      String
  email     String           @unique
  phone     String?
  message   String?
  status    IntentionStatus  @default(PENDING)
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt
  member    Member?

  @@index([status])
  @@index([email])
}

model Member {
  id           String       @id @default(cuid())
  name         String
  email        String       @unique
  phone        String?
  company      String?
  position     String?
  address      String?
  city         String?
  state        String?
  zipCode      String?
  birthDate    DateTime?
  status       MemberStatus @default(INVITED)
  inviteToken  String       @unique
  tokenExpiry  DateTime
  intentionId  String       @unique
  intention    Intention    @relation(fields: [intentionId], references: [id], onDelete: Cascade)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  
  // Relacionamentos
  attendances       Attendance[]
  referralsGiven    Referral[]      @relation("ReferralFrom")
  referralsReceived Referral[]      @relation("ReferralTo")
  thanksGiven       Thank[]         @relation("ThankFrom")
  thanksReceived    Thank[]         @relation("ThankTo")
  oneOnOnesHost     OneOnOne[]      @relation("OneOnOneHost")
  oneOnOnesGuest    OneOnOne[]      @relation("OneOnOneGuest")
  memberships       Membership[]

  @@index([status])
  @@index([email])
}

// ============================================
// 2. COMUNICAÇÃO E ENGAJAMENTO
// ============================================

model Notice {
  id          String       @id @default(cuid())
  title       String
  content     String       @db.Text
  type        NoticeType   @default(INFO)
  priority    NoticePriority @default(NORMAL)
  publishedAt DateTime     @default(now())
  expiresAt   DateTime?
  createdBy   String       // Admin identifier
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([publishedAt])
  @@index([type])
}

model Meeting {
  id          String      @id @default(cuid())
  title       String
  description String?     @db.Text
  date        DateTime
  location    String?
  type        MeetingType @default(REGULAR)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  attendances Attendance[]

  @@index([date])
}

model Attendance {
  id         String   @id @default(cuid())
  memberId   String
  member     Member   @relation(fields: [memberId], references: [id], onDelete: Cascade)
  meetingId  String
  meeting    Meeting  @relation(fields: [meetingId], references: [id], onDelete: Cascade)
  checkedIn  Boolean  @default(false)
  checkInAt  DateTime?
  createdAt  DateTime @default(now())

  @@unique([memberId, meetingId])
  @@index([memberId])
  @@index([meetingId])
}

// ============================================
// 3. GERAÇÃO DE NEGÓCIOS
// ============================================

model Referral {
  id              String         @id @default(cuid())
  fromMemberId    String
  fromMember      Member         @relation("ReferralFrom", fields: [fromMemberId], references: [id], onDelete: Cascade)
  toMemberId      String
  toMember        Member         @relation("ReferralTo", fields: [toMemberId], references: [id], onDelete: Cascade)
  clientName      String
  clientContact   String
  description     String         @db.Text
  estimatedValue  Decimal?       @db.Decimal(10, 2)
  actualValue     Decimal?       @db.Decimal(10, 2)
  status          ReferralStatus @default(SENT)
  statusUpdatedAt DateTime       @default(now())
  notes           String?        @db.Text
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  thanks          Thank[]

  @@index([fromMemberId])
  @@index([toMemberId])
  @@index([status])
  @@index([createdAt])
}

model Thank {
  id          String   @id @default(cuid())
  fromMemberId String
  fromMember  Member   @relation("ThankFrom", fields: [fromMemberId], references: [id], onDelete: Cascade)
  toMemberId  String
  toMember    Member   @relation("ThankTo", fields: [toMemberId], references: [id], onDelete: Cascade)
  referralId  String?
  referral    Referral? @relation(fields: [referralId], references: [id], onDelete: SetNull)
  message     String   @db.Text
  value       Decimal? @db.Decimal(10, 2)
  isPublic    Boolean  @default(true)
  createdAt   DateTime @default(now())

  @@index([fromMemberId])
  @@index([toMemberId])
  @@index([createdAt])
}

// ============================================
// 4. ACOMPANHAMENTO E PERFORMANCE
// ============================================

model OneOnOne {
  id          String        @id @default(cuid())
  hostId      String
  host        Member        @relation("OneOnOneHost", fields: [hostId], references: [id], onDelete: Cascade)
  guestId     String
  guest       Member        @relation("OneOnOneGuest", fields: [guestId], references: [id], onDelete: Cascade)
  scheduledAt DateTime
  completedAt DateTime?
  status      OneOnOneStatus @default(SCHEDULED)
  notes       String?       @db.Text
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([hostId])
  @@index([guestId])
  @@index([scheduledAt])
  @@index([status])
}

// ============================================
// 5. FINANCEIRO
// ============================================

model Membership {
  id          String           @id @default(cuid())
  memberId    String
  member      Member           @relation(fields: [memberId], references: [id], onDelete: Cascade)
  dueDate     DateTime
  amount      Decimal          @db.Decimal(10, 2)
  status      MembershipStatus @default(PENDING)
  paidAt      DateTime?
  paymentMethod String?
  notes       String?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  @@index([memberId])
  @@index([dueDate])
  @@index([status])
}

// ============================================
// SISTEMA
// ============================================

model EmailLog {
  id        String   @id @default(cuid())
  to        String
  subject   String
  body      String   @db.Text
  token     String?
  sentAt    DateTime @default(now())

  @@index([sentAt])
}

// ============================================
// ENUMS
// ============================================

enum IntentionStatus {
  PENDING
  APPROVED
  REJECTED
}

enum MemberStatus {
  INVITED
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum NoticeType {
  INFO
  WARNING
  URGENT
  EVENT
}

enum NoticePriority {
  LOW
  NORMAL
  HIGH
}

enum MeetingType {
  REGULAR
  SPECIAL
  TRAINING
  SOCIAL
}

enum ReferralStatus {
  SENT
  IN_NEGOTIATION
  CLOSED
  LOST
}

enum OneOnOneStatus {
  SCHEDULED
  COMPLETED
  CANCELLED
}

enum MembershipStatus {
  PENDING
  PAID
  OVERDUE
  CANCELLED
}
```

### 3.2 Relacionamentos e Justificativas

#### **1. Gestão de Membros**
- **Intention → Member** (1:1): Uma intenção aprovada gera exatamente um membro
- **Cascade delete**: Deletar intenção remove o membro associado

#### **2. Comunicação e Engajamento**
- **Meeting → Attendance** (1:N): Uma reunião tem múltiplas presenças
- **Member → Attendance** (1:N): Um membro tem múltiplas presenças
- **Unique constraint** em (memberId, meetingId): Previne duplicatas

#### **3. Geração de Negócios**
- **Member → Referral** (1:N): Um membro pode dar/receber múltiplas indicações
- **Referral → Thank** (1:N): Uma indicação pode gerar múltiplos agradecimentos
- **Member → Thank** (1:N): Um membro pode dar/receber múltiplos agradecimentos

#### **4. Acompanhamento e Performance**
- **Member → OneOnOne** (1:N): Um membro pode ser host ou guest em múltiplas reuniões 1-on-1
- **Unique constraint** implícito: Evita duplicatas por lógica de negócio

#### **5. Financeiro**
- **Member → Membership** (1:N): Um membro tem múltiplas mensalidades ao longo do tempo
- **Cascade delete**: Deletar membro remove suas mensalidades

### 3.3 Justificativa da Escolha do PostgreSQL

**Vantagens:**
- ✅ **Relacionamentos complexos**: Suporta múltiplas foreign keys e joins eficientes
- ✅ **Índices**: Performance otimizada para queries complexas
- ✅ **Escalabilidade**: Suporta crescimento do grupo sem problemas
- ✅ **Integridade referencial**: Garante consistência dos dados

### 3.4 Índices para Performance

Todos os campos frequentemente usados em queries possuem índices:
- **Status fields**: Para filtrar por estado
- **Foreign keys**: Para joins eficientes
- **Date fields**: Para queries temporais e relatórios
- **Email**: Para buscas e validações de unicidade

## 4. Definição da API

### 4.1 Endpoints Públicos

#### **POST /api/intentions**
Cria uma nova intenção de admissão.

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "+55 11 98765-4321",
  "message": "Quero participar do grupo"
}
```

**Response (201):**
```json
{
  "message": "Intenção criada com sucesso!",
  "intention": {
    "id": "clq...",
    "name": "João Silva",
    "email": "joao@example.com",
    "status": "PENDING"
  }
}
```

#### **GET /api/members/validate-token?token=xxx**
Valida um token de convite.

**Response (200):**
```json
{
  "valid": true,
  "member": {
    "id": "clq...",
    "name": "João Silva",
    "email": "joao@example.com",
    "status": "INVITED"
  }
}
```

#### **POST /api/members/register**
Completa o cadastro de um membro.

**Request:**
```json
{
  "token": "abc123...",
  "company": "Empresa XYZ",
  "position": "Gerente",
  "address": "Rua das Flores, 123",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "12345-678",
  "birthDate": "1990-01-01"
}
```

**Response (200):**
```json
{
  "message": "Cadastro completado com sucesso!",
  "member": {
    "id": "clq...",
    "name": "João Silva",
    "email": "joao@example.com",
    "status": "ACTIVE"
  }
}
```

---

### 4.2 Gestão de Membros (Admin)

**Autenticação:** Header `x-admin-key: <ADMIN_KEY>`

#### **GET /api/intentions**
Lista todas as intenções.

**Query params:** `?status=PENDING&page=1&limit=20`

**Response (200):**
```json
{
  "intentions": [
    {
      "id": "clq...",
      "name": "João Silva",
      "email": "joao@example.com",
      "status": "PENDING",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

#### **POST /api/intentions/approve**
Aprova uma intenção e gera convite.

**Request:**
```json
{
  "intentionId": "clq..."
}
```

**Response (200):**
```json
{
  "message": "Intenção aprovada com sucesso!",
  "member": {
    "id": "clq...",
    "inviteToken": "abc123...",
    "registrationUrl": "http://localhost:3000/register?token=abc123..."
  }
}
```

#### **POST /api/intentions/reject**
Rejeita uma intenção.

**Request:**
```json
{
  "intentionId": "clq...",
  "reason": "Não atende aos critérios"
}
```

#### **GET /api/members**
Lista todos os membros.

**Query params:** `?status=ACTIVE&page=1&limit=20`

**Response (200):**
```json
{
  "members": [
    {
      "id": "clq...",
      "name": "João Silva",
      "email": "joao@example.com",
      "company": "Empresa XYZ",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 120 }
}
```

#### **PATCH /api/members/[id]**
Atualiza dados de um membro.

**Request:**
```json
{
  "status": "INACTIVE",
  "company": "Nova Empresa"
}
```

---

### 4.3 Comunicação e Engajamento

#### **GET /api/notices**
Lista avisos e comunicados.

**Query params:** `?type=URGENT&active=true`

**Response (200):**
```json
{
  "notices": [
    {
      "id": "clq...",
      "title": "Reunião Extraordinária",
      "content": "Haverá reunião...",
      "type": "URGENT",
      "priority": "HIGH",
      "publishedAt": "2024-01-01T00:00:00Z",
      "expiresAt": "2024-01-15T00:00:00Z"
    }
  ]
}
```

#### **POST /api/notices** (Admin)
Cria um novo aviso.

**Request:**
```json
{
  "title": "Reunião Extraordinária",
  "content": "Haverá reunião extraordinária...",
  "type": "URGENT",
  "priority": "HIGH",
  "expiresAt": "2024-01-15T00:00:00Z"
}
```

#### **GET /api/meetings**
Lista reuniões.

**Query params:** `?from=2024-01-01&to=2024-12-31`

**Response (200):**
```json
{
  "meetings": [
    {
      "id": "clq...",
      "title": "Reunião Semanal",
      "date": "2024-01-10T09:00:00Z",
      "location": "Sala A",
      "type": "REGULAR",
      "attendanceCount": 25
    }
  ]
}
```

#### **POST /api/meetings** (Admin)
Cria uma nova reunião.

**Request:**
```json
{
  "title": "Reunião Semanal",
  "description": "Reunião de networking",
  "date": "2024-01-10T09:00:00Z",
  "location": "Sala A",
  "type": "REGULAR"
}
```

#### **POST /api/meetings/[id]/check-in**
Faz check-in em uma reunião.

**Request:**
```json
{
  "memberId": "clq..."
}
```

**Response (200):**
```json
{
  "message": "Check-in realizado com sucesso!",
  "attendance": {
    "id": "clq...",
    "checkedIn": true,
    "checkInAt": "2024-01-10T09:05:00Z"
  }
}
```

#### **GET /api/attendances/stats**
Estatísticas de presença.

**Query params:** `?memberId=clq...&period=monthly`

**Response (200):**
```json
{
  "stats": {
    "totalMeetings": 12,
    "attended": 10,
    "attendanceRate": 83.33,
    "byMonth": [
      { "month": "2024-01", "attended": 4, "total": 4 }
    ]
  }
}
```

---

### 4.4 Geração de Negócios

#### **POST /api/referrals**
Cria uma nova indicação.

**Request:**
```json
{
  "fromMemberId": "clq...",
  "toMemberId": "clq...",
  "clientName": "Empresa ABC",
  "clientContact": "contato@abc.com",
  "description": "Cliente interessado em...",
  "estimatedValue": 5000.00
}
```

**Response (201):**
```json
{
  "message": "Indicação criada com sucesso!",
  "referral": {
    "id": "clq...",
    "status": "SENT",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### **GET /api/referrals**
Lista indicações.

**Query params:** `?memberId=clq...&status=IN_NEGOTIATION`

**Response (200):**
```json
{
  "referrals": [
    {
      "id": "clq...",
      "fromMember": { "id": "clq...", "name": "João Silva" },
      "toMember": { "id": "clq...", "name": "Maria Santos" },
      "clientName": "Empresa ABC",
      "status": "IN_NEGOTIATION",
      "estimatedValue": 5000.00,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### **PATCH /api/referrals/[id]**
Atualiza status de uma indicação.

**Request:**
```json
{
  "status": "CLOSED",
  "actualValue": 5500.00,
  "notes": "Negócio fechado com sucesso!"
}
```

#### **GET /api/referrals/stats**
Estatísticas de indicações.

**Query params:** `?memberId=clq...&period=monthly`

**Response (200):**
```json
{
  "stats": {
    "totalReferrals": 25,
    "sent": 15,
    "inNegotiation": 5,
    "closed": 5,
    "conversionRate": 20.0,
    "totalValue": 125000.00,
    "byStatus": {
      "SENT": 15,
      "IN_NEGOTIATION": 5,
      "CLOSED": 5
    }
  }
}
```

#### **POST /api/thanks**
Cria um agradecimento público.

**Request:**
```json
{
  "fromMemberId": "clq...",
  "toMemberId": "clq...",
  "referralId": "clq...",
  "message": "Obrigado pela indicação!",
  "value": 5500.00,
  "isPublic": true
}
```

**Response (201):**
```json
{
  "message": "Agradecimento registrado!",
  "thank": {
    "id": "clq...",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### **GET /api/thanks**
Lista agradecimentos públicos (feed).

**Response (200):**
```json
{
  "thanks": [
    {
      "id": "clq...",
      "fromMember": { "id": "clq...", "name": "João Silva" },
      "toMember": { "id": "clq...", "name": "Maria Santos" },
      "message": "Obrigado pela indicação!",
      "value": 5500.00,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### 4.5 Acompanhamento e Performance

#### **POST /api/one-on-ones**
Agenda uma reunião 1-on-1.

**Request:**
```json
{
  "hostId": "clq...",
  "guestId": "clq...",
  "scheduledAt": "2024-01-15T14:00:00Z",
  "notes": "Discutir parcerias"
}
```

#### **GET /api/one-on-ones**
Lista reuniões 1-on-1.

**Query params:** `?memberId=clq...&status=SCHEDULED`

**Response (200):**
```json
{
  "oneOnOnes": [
    {
      "id": "clq...",
      "host": { "id": "clq...", "name": "João Silva" },
      "guest": { "id": "clq...", "name": "Maria Santos" },
      "scheduledAt": "2024-01-15T14:00:00Z",
      "status": "SCHEDULED"
    }
  ]
}
```

#### **PATCH /api/one-on-ones/[id]**
Atualiza status de uma reunião 1-on-1.

**Request:**
```json
{
  "status": "COMPLETED",
  "completedAt": "2024-01-15T15:00:00Z",
  "notes": "Reunião produtiva"
}
```

#### **GET /api/dashboard/member/[id]**
Dashboard individual de um membro.

**Response (200):**
```json
{
  "member": { "id": "clq...", "name": "João Silva" },
  "stats": {
    "attendanceRate": 85.5,
    "referralsGiven": 10,
    "referralsReceived": 8,
    "referralsClosed": 3,
    "totalBusinessGenerated": 25000.00,
    "oneOnOnesCompleted": 5,
    "thanksReceived": 3
  },
  "recentActivity": [...]
}
```

#### **GET /api/dashboard/group**
Dashboard do grupo.

**Response (200):**
```json
{
  "stats": {
    "totalMembers": 120,
    "activeMembers": 115,
    "averageAttendance": 82.3,
    "totalReferrals": 450,
    "closedReferrals": 95,
    "totalBusinessGenerated": 1250000.00,
    "monthlyGrowth": 5.2
  },
  "topPerformers": [
    {
      "member": { "id": "clq...", "name": "João Silva" },
      "referralsClosed": 15,
      "businessGenerated": 75000.00
    }
  ]
}
```

#### **GET /api/dashboard/reports**
Gera relatórios por período.

**Query params:** `?period=monthly&from=2024-01&to=2024-12`

**Response (200):**
```json
{
  "period": "monthly",
  "data": [
    {
      "month": "2024-01",
      "members": 120,
      "meetings": 4,
      "averageAttendance": 85.0,
      "referrals": 38,
      "closedReferrals": 8,
      "businessGenerated": 105000.00
    }
  ]
}
```

---

### 4.6 Financeiro

#### **POST /api/memberships** (Admin)
Gera mensalidade para um membro.

**Request:**
```json
{
  "memberId": "clq...",
  "dueDate": "2024-02-01",
  "amount": 150.00
}
```

#### **GET /api/memberships**
Lista mensalidades.

**Query params:** `?memberId=clq...&status=PENDING`

**Response (200):**
```json
{
  "memberships": [
    {
      "id": "clq...",
      "member": { "id": "clq...", "name": "João Silva" },
      "dueDate": "2024-02-01",
      "amount": 150.00,
      "status": "PENDING"
    }
  ]
}
```

#### **POST /api/memberships/[id]/pay** (Admin)
Registra pagamento de mensalidade.

**Request:**
```json
{
  "paymentMethod": "PIX",
  "paidAt": "2024-01-28T10:00:00Z",
  "notes": "Pagamento confirmado"
}
```

**Response (200):**
```json
{
  "message": "Pagamento registrado com sucesso!",
  "membership": {
    "id": "clq...",
    "status": "PAID",
    "paidAt": "2024-01-28T10:00:00Z"
  }
}
```

---

### 4.7 Sistema

#### **GET /api/emails** (Admin)
Lista logs de emails enviados (simulados).


