import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registerMemberSchema } from '@/lib/validations/members';
import { isTokenExpired } from '@/lib/tokens';
import { handleError, createSuccessResponse, createErrorResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerMemberSchema.parse(body);

    const member = await prisma.member.findUnique({
      where: { inviteToken: data.token },
    });

    if (!member) {
      return createErrorResponse('Token inválido', 400);
    }

    if (isTokenExpired(member.tokenExpiry)) {
      return createErrorResponse('Token expirado', 400);
    }

    if (member.status !== 'INVITED') {
      return createErrorResponse('Cadastro já completado', 400);
    }

    const updateData: any = {
      status: 'ACTIVE',
    };

    if (data.company) updateData.company = data.company;
    if (data.position) updateData.position = data.position;
    if (data.address) updateData.address = data.address;
    if (data.city) updateData.city = data.city;
    if (data.state) updateData.state = data.state;
    if (data.zipCode) updateData.zipCode = data.zipCode;
    if (data.birthDate) updateData.birthDate = new Date(data.birthDate);

    const updatedMember = await prisma.member.update({
      where: { id: member.id },
      data: updateData,
    });

    return createSuccessResponse({
      message: 'Cadastro completado com sucesso!',
      member: {
        id: updatedMember.id,
        name: updatedMember.name,
        email: updatedMember.email,
        status: updatedMember.status,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
