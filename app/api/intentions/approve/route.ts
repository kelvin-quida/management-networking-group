import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { approveIntentionSchema } from '@/lib/validations/intentions';
import { validateAdminAuth, createUnauthorizedResponse } from '@/lib/auth';
import { generateInviteToken, generateTokenExpiry } from '@/lib/tokens';
import { sendEmail, createInviteEmailBody } from '@/lib/email';
import { handleError, createSuccessResponse, createErrorResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    if (!validateAdminAuth(request)) {
      return createUnauthorizedResponse();
    }

    const body = await request.json();
    const data = approveIntentionSchema.parse(body);

    const intention = await prisma.intention.findUnique({
      where: { id: data.intentionId },
    });

    if (!intention) {
      return createErrorResponse('Intenção não encontrada', 404);
    }

    if (intention.status !== 'PENDING') {
      return createErrorResponse('Intenção já foi processada', 400);
    }

    const inviteToken = generateInviteToken();
    const tokenExpiry = generateTokenExpiry();

    const [updatedIntention, member] = await prisma.$transaction([
      prisma.intention.update({
        where: { id: data.intentionId },
        data: { status: 'APPROVED' },
      }),
      prisma.member.create({
        data: {
          name: intention.name,
          email: intention.email,
          phone: intention.phone,
          inviteToken,
          tokenExpiry,
          intentionId: intention.id,
        },
      }),
    ]);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const registrationUrl = `${baseUrl}/register?token=${inviteToken}`;

    await sendEmail({
      to: intention.email,
      subject: 'Convite para o Grupo de Networking',
      body: createInviteEmailBody(intention.name, inviteToken, baseUrl),
      token: inviteToken,
    });

    return createSuccessResponse({
      message: 'Intenção aprovada com sucesso!',
      member: {
        id: member.id,
        inviteToken: member.inviteToken,
        registrationUrl,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
