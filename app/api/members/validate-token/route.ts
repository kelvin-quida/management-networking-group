import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isTokenExpired } from '@/lib/tokens';
import { handleError, createSuccessResponse, createErrorResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return createErrorResponse('Token não fornecido', 400);
    }

    const member = await prisma.member.findUnique({
      where: { inviteToken: token },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        tokenExpiry: true,
      },
    });

    if (!member) {
      return createSuccessResponse({
        valid: false,
        error: 'Token inválido',
      });
    }

    if (isTokenExpired(member.tokenExpiry)) {
      return createSuccessResponse({
        valid: false,
        error: 'Token expirado',
      });
    }

    if (member.status !== 'INVITED') {
      return createSuccessResponse({
        valid: false,
        error: 'Cadastro já completado',
      });
    }

    return createSuccessResponse({
      valid: true,
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        status: member.status,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
