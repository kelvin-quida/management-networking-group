import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateAdminAuth, createUnauthorizedResponse } from '@/lib/auth';
import { handleError, createSuccessResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    if (!validateAdminAuth(request)) {
      return createUnauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const emails = await prisma.emailLog.findMany({
      take: Math.min(limit, 100),
      orderBy: { sentAt: 'desc' },
    });

    return createSuccessResponse({ emails });
  } catch (error) {
    return handleError(error);
  }
}
