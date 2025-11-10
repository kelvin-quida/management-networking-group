import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateMemberSchema } from '@/lib/validations/members';
import { handleError, createSuccessResponse, createErrorResponse } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const member = await prisma.member.findUnique({
      where: { id },
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateMemberSchema.parse(body);

    const member = await prisma.member.findUnique({
      where: { id },
    });

    if (!member) {
      return createErrorResponse('Membro não encontrado', 404);
    }

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
    if (data.status) updateData.status = data.status;

    const updatedMember = await prisma.member.update({
      where: { id },
      data: updateData,
    });

    return createSuccessResponse({
      message: 'Membro atualizado com sucesso',
      member: updatedMember,
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const member = await prisma.member.findUnique({
      where: { id },
    });

    if (!member) {
      return createErrorResponse('Membro não encontrado', 404);
    }

    await prisma.member.delete({
      where: { id },
    });

    return createSuccessResponse({
      message: 'Membro deletado com sucesso',
    });
  } catch (error) {
    return handleError(error);
  }
}
