import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleError, createSuccessResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const meetingId = searchParams.get('meetingId');

    const where: any = {};
    if (memberId) where.memberId = memberId;
    if (meetingId) where.meetingId = meetingId;

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        meeting: {
          select: {
            id: true,
            title: true,
            date: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return createSuccessResponse({ attendances });
  } catch (error) {
    return handleError(error);
  }
}
