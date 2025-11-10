import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateNoticeSchema } from '@/lib/validations/notices';
import { handleError, createSuccessResponse, createErrorResponse } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const notice = await prisma.notice.findUnique({
      where: { id },
    });

    if (!notice) {
      return createErrorResponse('Aviso não encontrado', 404);
    }

    return createSuccessResponse({ notice });
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
    const data = updateNoticeSchema.parse(body);

    const notice = await prisma.notice.findUnique({
      where: { id },
    });

    if (!notice) {
      return createErrorResponse('Aviso não encontrado', 404);
    }

    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.content) updateData.content = data.content;
    if (data.type) updateData.type = data.type;
    if (data.priority) updateData.priority = data.priority;
    if (data.expiresAt !== undefined) {
      updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    }

    const updatedNotice = await prisma.notice.update({
      where: { id },
      data: updateData,
    });

    return createSuccessResponse({
      message: 'Aviso atualizado com sucesso',
      notice: updatedNotice,
    });
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

    const notice = await prisma.notice.findUnique({
      where: { id },
    });

    if (!notice) {
      return createErrorResponse('Aviso não encontrado', 404);
    }

    await prisma.notice.delete({
      where: { id },
    });

    return createSuccessResponse({
      message: 'Aviso deletado com sucesso',
    });
  } catch (error) {
    return handleError(error);
  }
}
