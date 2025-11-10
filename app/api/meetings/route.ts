import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createMeetingSchema } from '@/lib/validations/meetings';
import { handleError, createSuccessResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where: any = {};
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }

    const meetings = await prisma.meeting.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        _count: {
          select: { attendances: true },
        },
      },
    });

    const meetingsWithCount = meetings.map((meeting) => ({
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      date: meeting.date,
      location: meeting.location,
      type: meeting.type,
      attendanceCount: meeting._count.attendances,
      createdAt: meeting.createdAt,
    }));

    return createSuccessResponse({ meetings: meetingsWithCount });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createMeetingSchema.parse(body);

    const meeting = await prisma.meeting.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        location: data.location,
        type: data.type,
      },
    });

    return createSuccessResponse(
      {
        message: 'Reunião criada com sucesso!',
        meeting,
      },
      201
    );
  } catch (error) {
    return handleError(error);
  }
}
