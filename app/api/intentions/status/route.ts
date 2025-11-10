import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleError, createSuccessResponse, createErrorResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return createErrorResponse('Email é obrigatório', 400);
    }

    const intention = await prisma.intention.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!intention) {
      return createErrorResponse('Nenhuma intenção encontrada para este email', 404);
    }

    return createSuccessResponse({
      intention,
    });
  } catch (error) {
    return handleError(error);
  }
}
