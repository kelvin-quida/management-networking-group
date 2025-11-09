import { prisma } from './prisma';

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  token?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  await prisma.emailLog.create({
    data: {
      to: options.to,
      subject: options.subject,
      body: options.body,
      token: options.token,
    },
  });

  console.log('📧 Email simulado enviado para:', options.to);
  console.log('Assunto:', options.subject);
  if (options.token) {
    console.log('Token:', options.token);
  }
}

export function createInviteEmailBody(name: string, token: string, baseUrl: string): string {
  const registrationUrl = `${baseUrl}/register?token=${token}`;
  
  return `
Olá ${name},

Você foi aprovado para participar do nosso grupo de networking!

Para completar seu cadastro, acesse o link abaixo:
${registrationUrl}

Este link é válido por 7 dias.

Bem-vindo ao grupo!
  `.trim();
}

export function createRejectionEmailBody(name: string, reason?: string): string {
  return `
Olá ${name},

Agradecemos seu interesse em participar do nosso grupo de networking.

${reason ? `Infelizmente, não foi possível aprovar sua solicitação neste momento.\n\nMotivo: ${reason}` : 'Infelizmente, não foi possível aprovar sua solicitação neste momento.'}

Você pode tentar novamente no futuro.

Atenciosamente,
Equipe de Gestão
  `.trim();
}
