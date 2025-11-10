import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createMembershipSchema } from '@/lib/validations/memberships';
import { handleError, createSuccessResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const status = searchParams.get('status');

    const where: any = {};
    if (memberId) where.memberId = memberId;
    if (status) where.status = status;

    const memberships = await prisma.membership.findMany({
      where,
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { dueDate: 'desc' },
    });

    return createSuccessResponse({ memberships });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createMembershipSchema.parse(body);

    const membership = await prisma.membership.create({
      data: {
        memberId: data.memberId,
        dueDate: new Date(data.dueDate),
        amount: data.amount,
        notes: data.notes,
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return createSuccessResponse(
      {
        message: 'Mensalidade criada com sucesso!',
        membership,
      },
      201
    );
  } catch (error) {
    return handleError(error);
  }
}
