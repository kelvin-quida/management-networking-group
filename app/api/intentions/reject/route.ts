import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rejectIntentionSchema } from '@/lib/validations/intentions';
import { sendEmail, createRejectionEmailBody } from '@/lib/email';
import { handleError, createSuccessResponse, createErrorResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = rejectIntentionSchema.parse(body);

    const intention = await prisma.intention.findUnique({
      where: { id: data.intentionId },
    });

    if (!intention) {
      return createErrorResponse('Intenção não encontrada', 404);
    }

    if (intention.status !== 'PENDING') {
      return createErrorResponse('Intenção já foi processada', 400);
    }

    await prisma.intention.update({
      where: { id: data.intentionId },
      data: { status: 'REJECTED' },
    });

    await sendEmail({
      to: intention.email,
      subject: 'Sobre sua solicitação ao Grupo de Networking',
      body: createRejectionEmailBody(intention.name, data.reason),
    });

    return createSuccessResponse({
      message: 'Intenção rejeitada',
    });
  } catch (error) {
    return handleError(error);
  }
}
