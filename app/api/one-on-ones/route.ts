import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createOneOnOneSchema } from '@/lib/validations/one-on-ones';
import { handleError, createSuccessResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const status = searchParams.get('status');

    const where: any = {};
    if (memberId) {
      where.OR = [
        { hostId: memberId },
        { guestId: memberId },
      ];
    }
    if (status) where.status = status;

    const oneOnOnes = await prisma.oneOnOne.findMany({
      where,
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
      orderBy: { scheduledAt: 'desc' },
    });

    return createSuccessResponse({ oneOnOnes });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createOneOnOneSchema.parse(body);

    const oneOnOne = await prisma.oneOnOne.create({
      data: {
        hostId: data.hostId,
        guestId: data.guestId,
        scheduledAt: new Date(data.scheduledAt),
        notes: data.notes,
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
          },
        },
        guest: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return createSuccessResponse(
      {
        message: 'Reunião 1-on-1 agendada com sucesso!',
        oneOnOne,
      },
      201
    );
  } catch (error) {
    return handleError(error);
  }
}
