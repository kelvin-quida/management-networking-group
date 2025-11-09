import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createThankSchema } from '@/lib/validations/thanks';
import { handleError, createSuccessResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    const where: any = { isPublic: true };
    if (memberId) {
      where.OR = [
        { fromMemberId: memberId },
        { toMemberId: memberId },
      ];
    }

    const thanks = await prisma.thank.findMany({
      where,
      include: {
        fromMember: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
        toMember: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return createSuccessResponse({ thanks });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createThankSchema.parse(body);

    const thank = await prisma.thank.create({
      data: {
        fromMemberId: data.fromMemberId,
        toMemberId: data.toMemberId,
        message: data.message,
        value: data.value,
        isPublic: data.isPublic,
      },
      include: {
        fromMember: {
          select: {
            id: true,
            name: true,
          },
        },
        toMember: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return createSuccessResponse(
      {
        message: 'Agradecimento registrado!',
        thank: {
          id: thank.id,
          createdAt: thank.createdAt,
        },
      },
      201
    );
  } catch (error) {
    return handleError(error);
  }
}
