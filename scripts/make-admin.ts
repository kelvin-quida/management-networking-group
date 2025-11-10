import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('❌ Email não fornecido');
    console.log('\nUso: npx tsx scripts/make-admin.ts <email>');
    console.log('Exemplo: npx tsx scripts/make-admin.ts admin@networking.com');
    process.exit(1);
  }

  console.log(`🔧 Promovendo ${email} para ADMIN...`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`❌ Usuário ${email} não encontrado`);
    console.log('\n💡 Crie o usuário primeiro via signup em: http://localhost:3001/signup');
    process.exit(1);
  }

  if (user.role === UserRole.ADMIN) {
    console.log('✓ Usuário já é ADMIN');
    return;
  }

  await prisma.user.update({
    where: { email },
    data: { role: UserRole.ADMIN },
  });

  console.log('✅ Usuário promovido para ADMIN!');
  console.log(`📧 Email: ${email}`);
  console.log(`👤 Nome: ${user.name}`);
  console.log(`🛡️  Role: ADMIN`);
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
