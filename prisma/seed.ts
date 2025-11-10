import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  console.log('🧹 Limpando dados existentes...')
  await prisma.emailLog.deleteMany()
  await prisma.membership.deleteMany()
  await prisma.oneOnOne.deleteMany()
  await prisma.thank.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.meeting.deleteMany()
  await prisma.notice.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  await prisma.member.deleteMany()
  await prisma.intention.deleteMany()

  console.log('📝 Criando intenções de admissão...')
  
  const intention1 = await prisma.intention.create({
    data: {
      name: 'João Silva',
      email: 'joao.silva@example.com',
      phone: '+55 11 98765-4321',
      message: 'Gostaria de participar do grupo para expandir minha rede de contatos',
      status: 'APPROVED',
    },
  })

  const intention2 = await prisma.intention.create({
    data: {
      name: 'Maria Santos',
      email: 'maria.santos@example.com',
      phone: '+55 11 98765-4322',
      message: 'Interessada em fazer parte do networking',
      status: 'APPROVED',
    },
  })

  const intention3 = await prisma.intention.create({
    data: {
      name: 'Pedro Oliveira',
      email: 'pedro.oliveira@example.com',
      phone: '+55 11 98765-4323',
      message: 'Quero conhecer mais empresários da região',
      status: 'PENDING',
    },
  })

  console.log('👥 Criando membros...')
  
  const member1 = await prisma.member.create({
    data: {
      name: 'João Silva',
      email: 'joao.silva@example.com',
      phone: '+55 11 98765-4321',
      company: 'Tech Solutions Ltda',
      position: 'CEO',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      birthDate: new Date('1985-03-15'),
      status: 'ACTIVE',
      inviteToken: 'token-joao-silva-123',
      tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
      intentionId: intention1.id,
    },
  })

  const member2 = await prisma.member.create({
    data: {
      name: 'Maria Santos',
      email: 'maria.santos@example.com',
      phone: '+55 11 98765-4322',
      company: 'Marketing Pro',
      position: 'Diretora de Marketing',
      address: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      birthDate: new Date('1990-07-22'),
      status: 'ACTIVE',
      inviteToken: 'token-maria-santos-456',
      tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      intentionId: intention2.id,
    },
  })

  console.log('👤 Criando usuários vinculados aos membros...')
  
  await prisma.user.create({
    data: {
      name: 'João Silva',
      email: 'joao.silva@example.com',
      emailVerified: true,
      role: 'MEMBER',
      memberId: member1.id,
    },
  })

  const joaoUser = await prisma.user.findUnique({
    where: { email: 'joao.silva@example.com' },
  })
  
  if (joaoUser) {
    await prisma.account.create({
      data: {
        userId: joaoUser.id,
        accountId: joaoUser.id,
        providerId: 'credential',
        password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u', // senha: password123
      },
    })
  }

  await prisma.user.create({
    data: {
      name: 'Maria Santos',
      email: 'maria.santos@example.com',
      emailVerified: true,
      role: 'MEMBER',
      memberId: member2.id,
    },
  })

  const mariaUser = await prisma.user.findUnique({
    where: { email: 'maria.santos@example.com' },
  })
  
  if (mariaUser) {
    await prisma.account.create({
      data: {
        userId: mariaUser.id,
        accountId: mariaUser.id,
        providerId: 'credential',
        password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u', // senha: password123
      },
    })
  }

  console.log('📢 Criando avisos...')
  
  await prisma.notice.create({
    data: {
      title: 'Bem-vindo ao Grupo!',
      content: 'Estamos felizes em ter você conosco. Participe ativamente das reuniões e aproveite ao máximo as oportunidades de networking.',
      type: 'INFO',
      priority: 'NORMAL',
      createdBy: 'admin',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.notice.create({
    data: {
      title: 'Reunião Extraordinária',
      content: 'Haverá uma reunião extraordinária na próxima semana para discutir novos projetos do grupo.',
      type: 'URGENT',
      priority: 'HIGH',
      createdBy: 'admin',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  console.log('📅 Criando reuniões...')
  
  const meeting1 = await prisma.meeting.create({
    data: {
      title: 'Reunião Semanal #1',
      description: 'Primeira reunião semanal do mês',
      date: new Date('2024-12-10T09:00:00Z'),
      location: 'Sala de Conferências A',
      type: 'REGULAR',
    },
  })

  const meeting2 = await prisma.meeting.create({
    data: {
      title: 'Workshop de Networking',
      description: 'Workshop sobre técnicas eficazes de networking',
      date: new Date('2024-12-15T14:00:00Z'),
      location: 'Auditório Principal',
      type: 'TRAINING',
    },
  })

  console.log('✅ Criando registros de presença...')
  
  await prisma.attendance.create({
    data: {
      memberId: member1.id,
      meetingId: meeting1.id,
      checkedIn: true,
      checkInAt: new Date('2024-12-10T09:05:00Z'),
    },
  })

  await prisma.attendance.create({
    data: {
      memberId: member2.id,
      meetingId: meeting1.id,
      checkedIn: true,
      checkInAt: new Date('2024-12-10T09:03:00Z'),
    },
  })

  console.log('🙏 Criando agradecimentos...')
  
  await prisma.thank.create({
    data: {
      fromMemberId: member1.id,
      toMemberId: member2.id,
      message: 'Muito obrigado pela indicação! O negócio foi fechado com sucesso e superou nossas expectativas.',
      value: 28000.00,
      isPublic: true,
    },
  })

  console.log('☕ Criando reuniões 1-on-1...')
  
  await prisma.oneOnOne.create({
    data: {
      hostId: member1.id,
      guestId: member2.id,
      scheduledAt: new Date('2024-12-12T10:00:00Z'),
      status: 'COMPLETED',
      completedAt: new Date('2024-12-12T11:00:00Z'),
      notes: 'Reunião produtiva, discutimos possíveis parcerias futuras',
    },
  })

  await prisma.oneOnOne.create({
    data: {
      hostId: member2.id,
      guestId: member1.id,
      scheduledAt: new Date('2024-12-20T15:00:00Z'),
      status: 'SCHEDULED',
    },
  })

  console.log('💰 Criando mensalidades...')
  
  await prisma.membership.create({
    data: {
      memberId: member1.id,
      dueDate: new Date('2024-12-01'),
      amount: 150.00,
      status: 'PAID',
      paidAt: new Date('2024-11-28T10:00:00Z'),
      paymentMethod: 'PIX',
    },
  })

  await prisma.membership.create({
    data: {
      memberId: member2.id,
      dueDate: new Date('2024-12-01'),
      amount: 150.00,
      status: 'PAID',
      paidAt: new Date('2024-11-29T14:30:00Z'),
      paymentMethod: 'Transferência Bancária',
    },
  })

  await prisma.membership.create({
    data: {
      memberId: member1.id,
      dueDate: new Date('2025-01-01'),
      amount: 150.00,
      status: 'PENDING',
    },
  })

  console.log('📧 Criando logs de email...')
  
  await prisma.emailLog.create({
    data: {
      to: 'joao.silva@example.com',
      subject: 'Convite para Completar Cadastro',
      body: 'Olá João, você foi aprovado! Use o token: token-joao-silva-123',
      token: 'token-joao-silva-123',
    },
  })

  await prisma.emailLog.create({
    data: {
      to: 'maria.santos@example.com',
      subject: 'Convite para Completar Cadastro',
      body: 'Olá Maria, você foi aprovada! Use o token: token-maria-santos-456',
      token: 'token-maria-santos-456',
    },
  })

  console.log('✅ Seed concluído com sucesso!')
  console.log('\n📊 Resumo:')
  console.log(`   - ${await prisma.intention.count()} intenções`)
  console.log(`   - ${await prisma.member.count()} membros`)
  console.log(`   - ${await prisma.user.count()} usuários`)
  console.log(`   - ${await prisma.notice.count()} avisos`)
  console.log(`   - ${await prisma.meeting.count()} reuniões`)
  console.log(`   - ${await prisma.attendance.count()} presenças`)
  console.log(`   - ${await prisma.thank.count()} agradecimentos`)
  console.log(`   - ${await prisma.oneOnOne.count()} reuniões 1-on-1`)
  console.log(`   - ${await prisma.membership.count()} mensalidades`)
  console.log(`   - ${await prisma.emailLog.count()} logs de email`)
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
