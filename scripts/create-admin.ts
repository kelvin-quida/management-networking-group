import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Criando usuário admin...\n');

  const adminEmail = 'admin@networking.com';
  const adminPassword = 'admin123456';
  const adminName = 'Administrador';

  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: { accounts: true },
  });

  if (existingUser) {
    console.log('⚠️  Usuário já existe:', existingUser.email);
    
    if (existingUser.role === UserRole.ADMIN) {
      console.log('✓ Já é ADMIN');
    } else {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { role: UserRole.ADMIN },
      });
      console.log('✅ Promovido para ADMIN');
    }

    if (existingUser.accounts.length === 0) {
      console.log('⚠️  Usuário sem credenciais. Delete manualmente e execute novamente.');
    }

    return;
  }

  console.log('📝 Criando usuário via Better Auth API...');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  
  try {
    const healthCheck = await fetch(baseUrl, { method: 'HEAD' });
  } catch (error) {
    console.error('\n❌ Servidor Next.js não está rodando!');
    console.log('\n💡 Inicie o servidor primeiro:');
    console.log('   pnpm dev');
    console.log('\n   Depois execute este script novamente em outro terminal.');
    process.exit(1);
  }

  try {
    const response = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Signup falhou: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log('✅ Usuário criado via Better Auth');

    const newUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!newUser) {
      throw new Error('Usuário não encontrado após criação');
    }

    await prisma.user.update({
      where: { id: newUser.id },
      data: { role: UserRole.ADMIN },
    });

    console.log('✅ Promovido para ADMIN\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Senha:', adminPassword);
    console.log('👤 Nome:', adminName);
    console.log('🛡️  Role: ADMIN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!');

  } catch (error) {
    console.error('\n❌ Erro ao criar admin via API:', error);
    console.log('\n💡 Alternativa: Crie manualmente via signup e execute:');
    console.log('   npx tsx scripts/make-admin.ts admin@networking.com');
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
