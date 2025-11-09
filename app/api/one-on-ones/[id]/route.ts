import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateOneOnOneSchema } from '@/lib/validations/one-on-ones';
import { handleError, createSuccessResponse, createErrorResponse } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const oneOnOne = await prisma.oneOnOne.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        guest: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
      },
    });

    if (!oneOnOne) {
      return createErrorResponse('Reunião 1-on-1 não encontrada', 404);
    }

    return createSuccessResponse({ oneOnOne });
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
    const data = updateOneOnOneSchema.parse(body);

    const oneOnOne = await prisma.oneOnOne.findUnique({
      where: { id },
    });

    if (!oneOnOne) {
      return createErrorResponse('Reunião 1-on-1 não encontrada', 404);
    }

    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.completedAt) updateData.completedAt = new Date(data.completedAt);
    if (data.notes !== undefined) updateData.notes = data.notes;

    const updatedOneOnOne = await prisma.oneOnOne.update({
      where: { id },
      data: updateData,
    });

    return createSuccessResponse({
      message: 'Reunião 1-on-1 atualizada com sucesso',
      oneOnOne: updatedOneOnOne,
    });
  } catch (error) {
    return handleError(error);
  }
}
