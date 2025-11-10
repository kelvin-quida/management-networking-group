import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleError, createSuccessResponse, createErrorResponse } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const membership = await prisma.membership.findUnique({
      where: { id },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
      },
    });

    if (!membership) {
      return createErrorResponse('Mensalidade não encontrada', 404);
    }

    return createSuccessResponse({ membership });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const membership = await prisma.membership.findUnique({
      where: { id },
    });

    if (!membership) {
      return createErrorResponse('Mensalidade não encontrada', 404);
    }

    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const updatedMembership = await prisma.membership.update({
      where: { id },
      data: updateData,
    });

    return createSuccessResponse({
      message: 'Mensalidade atualizada com sucesso',
      membership: updatedMembership,
    });
  } catch (error) {
    return handleError(error);
  }
}
