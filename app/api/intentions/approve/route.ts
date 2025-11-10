import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { approveIntentionSchema } from '@/lib/validations/intentions';
import { generateInviteToken, generateTokenExpiry } from '@/lib/tokens';
import { sendEmail, createInviteEmailBody } from '@/lib/email';
import { handleError, createSuccessResponse, createErrorResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
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

    const existingUser = await prisma.user.findUnique({
      where: { email: intention.email },
    });

    const [updatedIntention, member] = await prisma.$transaction(async (tx) => {
      const intention = await tx.intention.update({
        where: { id: data.intentionId },
        data: { status: 'APPROVED' },
      });

      const newMember = await tx.member.create({
        data: {
          name: intention.name,
          email: intention.email,
          phone: intention.phone,
          inviteToken,
          tokenExpiry,
          intentionId: intention.id,
          status: existingUser ? 'ACTIVE' : 'INVITED',
        },
      });

      if (existingUser) {
        await tx.user.update({
          where: { id: existingUser.id },
          data: {
            role: 'MEMBER',
            memberId: newMember.id,
          },
        });
      }

      return [intention, newMember];
    });

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
