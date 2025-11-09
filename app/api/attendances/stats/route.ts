import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleError, createSuccessResponse, createErrorResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const period = searchParams.get('period') || 'all';

    if (!memberId) {
      return createErrorResponse('memberId é obrigatório', 400);
    }

    const member = await prisma.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      return createErrorResponse('Membro não encontrado', 404);
    }

    let dateFilter: any = {};
    if (period === 'monthly') {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      dateFilter = { gte: startOfMonth };
    } else if (period === 'yearly') {
      const startOfYear = new Date();
      startOfYear.setMonth(0, 1);
      startOfYear.setHours(0, 0, 0, 0);
      dateFilter = { gte: startOfYear };
    }

    const whereClause: any = { memberId };
    const meetingWhere: any = {};
    if (Object.keys(dateFilter).length > 0) {
      meetingWhere.date = dateFilter;
    }

    const [totalMeetings, attendances] = await Promise.all([
      prisma.meeting.count({ where: meetingWhere }),
      prisma.attendance.findMany({
        where: {
          ...whereClause,
          meeting: meetingWhere,
        },
        include: {
          meeting: {
            select: {
              date: true,
            },
          },
        },
      }),
    ]);

    const attended = attendances.filter((a) => a.checkedIn).length;
    const attendanceRate = totalMeetings > 0 ? (attended / totalMeetings) * 100 : 0;

    const byMonth: { [key: string]: { attended: number; total: number } } = {};
    
    attendances.forEach((attendance) => {
      const month = attendance.meeting.date.toISOString().substring(0, 7);
      if (!byMonth[month]) {
        byMonth[month] = { attended: 0, total: 0 };
      }
      byMonth[month].total++;
      if (attendance.checkedIn) {
        byMonth[month].attended++;
      }
    });

    const byMonthArray = Object.entries(byMonth).map(([month, data]) => ({
      month,
      attended: data.attended,
      total: data.total,
    }));

    return createSuccessResponse({
      stats: {
        totalMeetings,
        attended,
        attendanceRate: parseFloat(attendanceRate.toFixed(2)),
        byMonth: byMonthArray,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
