import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateAdminAuth, createUnauthorizedResponse } from '@/lib/auth';
import { handleError, createSuccessResponse, parsePaginationParams, calculatePagination } from '@/lib/utils';

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

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          company: true,
          position: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.member.count({ where }),
    ]);

    return createSuccessResponse({
      data: members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit!),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
