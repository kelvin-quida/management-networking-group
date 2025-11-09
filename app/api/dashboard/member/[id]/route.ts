import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleError, createSuccessResponse, createErrorResponse } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: memberId } = await params;

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        status: true,
      },
    });

    if (!member) {
      return createErrorResponse('Membro não encontrado', 404);
    }

    const [totalMeetings, attendances] = await Promise.all([
      prisma.meeting.count(),
      prisma.attendance.findMany({
        where: { memberId, checkedIn: true },
      }),
    ]);

    const attendanceRate = totalMeetings > 0 ? (attendances.length / totalMeetings) * 100 : 0;

    const oneOnOnesCompleted = await prisma.oneOnOne.count({
      where: {
        OR: [{ hostId: memberId }, { guestId: memberId }],
        status: 'COMPLETED',
      },
    });

    const thanksReceived = await prisma.thank.count({
      where: { toMemberId: memberId },
    });

    const [recentThanks, recentOneOnOnes] = await Promise.all([
      prisma.thank.findMany({
        where: {
          OR: [{ fromMemberId: memberId }, { toMemberId: memberId }],
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          fromMember: { select: { name: true } },
          toMember: { select: { name: true } },
        },
      }),
      prisma.oneOnOne.findMany({
        where: {
          OR: [{ hostId: memberId }, { guestId: memberId }],
        },
        take: 5,
        orderBy: { scheduledAt: 'desc' },
        include: {
          host: { select: { name: true } },
          guest: { select: { name: true } },
        },
      }),
    ]);

    return createSuccessResponse({
      member,
      stats: {
        attendanceRate: parseFloat(attendanceRate.toFixed(2)),
        oneOnOnesCompleted,
        thanksReceived,
      },
      recentActivity: {
        thanks: recentThanks,
        oneOnOnes: recentOneOnOnes,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
