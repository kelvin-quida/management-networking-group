import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleError, createSuccessResponse, createErrorResponse } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const thank = await prisma.thank.findUnique({
      where: { id },
      include: {
        fromMember: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        toMember: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
      },
    });

    if (!thank) {
      return createErrorResponse('Agradecimento não encontrado', 404);
    }

    return createSuccessResponse({ thank });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const thank = await prisma.thank.findUnique({
      where: { id },
    });

    if (!thank) {
      return createErrorResponse('Agradecimento não encontrado', 404);
    }

    await prisma.thank.delete({
      where: { id },
    });

    return createSuccessResponse({
      message: 'Agradecimento deletado com sucesso',
    });
  } catch (error) {
    return handleError(error);
  }
}
