import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth-config';
import { updateMemberSchema } from '@/lib/validations/members';
import { handleError, createSuccessResponse, createErrorResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return createErrorResponse('Não autenticado', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        memberId: true,
      },
    });

    if (!user?.memberId) {
      return createErrorResponse('Usuário não vinculado a um membro', 404);
    }

    const member = await prisma.member.findUnique({
      where: { id: user.memberId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        position: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        birthDate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!member) {
      return createErrorResponse('Membro não encontrado', 404);
    }

    return createSuccessResponse({ member });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return createErrorResponse('Não autenticado', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        memberId: true,
      },
    });

    if (!user?.memberId) {
      return createErrorResponse('Usuário não vinculado a um membro', 404);
    }

    const body = await request.json();
    const data = updateMemberSchema.parse(body);

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.phone) updateData.phone = data.phone;
    if (data.company) updateData.company = data.company;
    if (data.position) updateData.position = data.position;
    if (data.address) updateData.address = data.address;
    if (data.city) updateData.city = data.city;
    if (data.state) updateData.state = data.state;
    if (data.zipCode) updateData.zipCode = data.zipCode;
    if (data.birthDate) updateData.birthDate = new Date(data.birthDate);

    const updatedMember = await prisma.member.update({
      where: { id: user.memberId },
      data: updateData,
    });

    if (data.name) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name: data.name },
      });
    }

    return createSuccessResponse({
      message: 'Perfil atualizado com sucesso',
      member: updatedMember,
    });
  } catch (error) {
    return handleError(error);
  }
}
