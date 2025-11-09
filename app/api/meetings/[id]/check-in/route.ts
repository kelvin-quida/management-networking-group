import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkInSchema } from '@/lib/validations/meetings';
import { handleError, createSuccessResponse, createErrorResponse } from '@/lib/utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: meetingId } = await params;
    const body = await request.json();
    const data = checkInSchema.parse(body);

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting) {
      return createErrorResponse('Reunião não encontrada', 404);
    }

    const member = await prisma.member.findUnique({
      where: { id: data.memberId },
    });

    if (!member) {
      return createErrorResponse('Membro não encontrado', 404);
    }

    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        memberId_meetingId: {
          memberId: data.memberId,
          meetingId,
        },
      },
    });

    let attendance;

    if (existingAttendance) {
      attendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          checkedIn: true,
          checkInAt: new Date(),
        },
      });
    } else {
      attendance = await prisma.attendance.create({
        data: {
          memberId: data.memberId,
          meetingId,
          checkedIn: true,
          checkInAt: new Date(),
        },
      });
    }

    return createSuccessResponse({
      message: 'Check-in realizado com sucesso!',
      attendance: {
        id: attendance.id,
        checkedIn: attendance.checkedIn,
        checkInAt: attendance.checkInAt,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
