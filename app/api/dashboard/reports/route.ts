import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleError, createSuccessResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let startDate: Date;
    let endDate: Date = new Date();

    if (from && to) {
      startDate = new Date(from);
      endDate = new Date(to);
    } else {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12);
    }

    const [members, meetings] = await Promise.all([
      prisma.member.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: { createdAt: true },
      }),
      prisma.meeting.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          date: true,
          _count: {
            select: { attendances: true },
          },
        },
      }),
    ]);

    const monthlyData: { [key: string]: any } = {};

    members.forEach((member) => {
      const month = member.createdAt.toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          members: 0,
          meetings: 0,
          totalAttendances: 0,
        };
      }
      monthlyData[month].members++;
    });

    meetings.forEach((meeting) => {
      const month = meeting.date.toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          members: 0,
          meetings: 0,
          totalAttendances: 0,
        };
      }
      monthlyData[month].meetings++;
      monthlyData[month].totalAttendances += meeting._count.attendances;
    });

    const data = Object.values(monthlyData).map((item: any) => {
      const averageAttendance = item.meetings > 0 && item.members > 0
        ? (item.totalAttendances / (item.meetings * item.members)) * 100
        : 0;

      return {
        month: item.month,
        members: item.members,
        meetings: item.meetings,
        averageAttendance: parseFloat(averageAttendance.toFixed(2)),
      };
    });

    data.sort((a, b) => a.month.localeCompare(b.month));

    return createSuccessResponse({
      period,
      data,
    });
  } catch (error) {
    return handleError(error);
  }
}
