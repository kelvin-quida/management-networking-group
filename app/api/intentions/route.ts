import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createIntentionSchema } from '@/lib/validations/intentions';
import { validateAdminAuth, createUnauthorizedResponse } from '@/lib/auth';
import { handleError, createSuccessResponse, parsePaginationParams, calculatePagination } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createIntentionSchema.parse(body);

    const existing = await prisma.intention.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return Response.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      );
    }

    const intention = await prisma.intention.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
      },
    });

    return createSuccessResponse(
      {
        message: 'Intenção criada com sucesso!',
        intention: {
          id: intention.id,
          name: intention.name,
          email: intention.email,
          status: intention.status,
        },
      },
      201
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!validateAdminAuth(request)) {
      return createUnauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const { page, limit } = parsePaginationParams(searchParams);
    const { skip, take } = calculatePagination(page!, limit!);

    const where = status ? { status: status as any } : {};

    const [intentions, total] = await Promise.all([
      prisma.intention.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          message: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.intention.count({ where }),
    ]);

    return createSuccessResponse({
      intentions,
      pagination: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
