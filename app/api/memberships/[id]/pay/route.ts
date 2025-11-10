import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { payMembershipSchema } from '@/lib/validations/memberships';
import { handleError, createSuccessResponse, createErrorResponse } from '@/lib/utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = payMembershipSchema.parse(body);

    const membership = await prisma.membership.findUnique({
      where: { id },
    });

    if (!membership) {
      return createErrorResponse('Mensalidade não encontrada', 404);
    }

    if (membership.status === 'PAID') {
      return createErrorResponse('Mensalidade já foi paga', 400);
    }

    const updatedMembership = await prisma.membership.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(data.paidAt),
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      },
    });

    return createSuccessResponse({
      message: 'Pagamento registrado com sucesso!',
      membership: {
        id: updatedMembership.id,
        status: updatedMembership.status,
        paidAt: updatedMembership.paidAt,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
