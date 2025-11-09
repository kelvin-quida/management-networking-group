import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleError, createSuccessResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const [totalMembers, activeMembers, totalMeetings] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({ where: { status: 'ACTIVE' } }),
      prisma.meeting.count(),
    ]);

    const attendances = await prisma.attendance.findMany({
      where: { checkedIn: true },
    });
    const averageAttendance = totalMeetings > 0 ? (attendances.length / (totalMembers * totalMeetings)) * 100 : 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [currentMonthMembers, lastMonthMembers] = await Promise.all([
      prisma.member.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.member.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lt: startOfMonth,
          },
        },
      }),
    ]);

    const monthlyGrowth = lastMonthMembers > 0 
      ? ((currentMonthMembers - lastMonthMembers) / lastMonthMembers) * 100 
      : 0;


    return createSuccessResponse({
      stats: {
        totalMembers,
        activeMembers,
        averageAttendance: parseFloat(averageAttendance.toFixed(2)),
        monthlyGrowth: parseFloat(monthlyGrowth.toFixed(2)),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
