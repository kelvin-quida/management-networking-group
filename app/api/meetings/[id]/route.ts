import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateMeetingSchema } from '@/lib/validations/meetings';
import { validateAdminAuth, createUnauthorizedResponse } from '@/lib/auth';
import { handleError, createSuccessResponse, createErrorResponse } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        attendances: {
          include: {
            member: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!meeting) {
      return createErrorResponse('Reunião não encontrada', 404);
    }

    return createSuccessResponse({ meeting });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!validateAdminAuth(request)) {
      return createUnauthorizedResponse();
    }

    const { id } = await params;
    const body = await request.json();
    const data = updateMeetingSchema.parse(body);

    const meeting = await prisma.meeting.findUnique({
      where: { id },
    });

    if (!meeting) {
      return createErrorResponse('Reunião não encontrada', 404);
    }

    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.date) updateData.date = new Date(data.date);
    if (data.location !== undefined) updateData.location = data.location;
    if (data.type) updateData.type = data.type;

    const updatedMeeting = await prisma.meeting.update({
      where: { id },
      data: updateData,
    });

    return createSuccessResponse({
      message: 'Reunião atualizada com sucesso',
      meeting: updatedMeeting,
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
    if (!validateAdminAuth(request)) {
      return createUnauthorizedResponse();
    }

    const { id } = await params;

    const meeting = await prisma.meeting.findUnique({
      where: { id },
    });

    if (!meeting) {
      return createErrorResponse('Reunião não encontrada', 404);
    }

    await prisma.meeting.delete({
      where: { id },
    });

    return createSuccessResponse({
      message: 'Reunião deletada com sucesso',
    });
  } catch (error) {
    return handleError(error);
  }
}
