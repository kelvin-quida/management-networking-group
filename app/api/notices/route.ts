import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createNoticeSchema } from '@/lib/validations/notices';
import { handleError, createSuccessResponse } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const active = searchParams.get('active');

    const where: any = {};
    if (type) where.type = type;
    if (active === 'true') {
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ];
    }

    const notices = await prisma.notice.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { publishedAt: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        priority: true,
        publishedAt: true,
        expiresAt: true,
        createdBy: true,
      },
    });

    return createSuccessResponse({ notices });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createNoticeSchema.parse(body);

    const notice = await prisma.notice.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        priority: data.priority,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        createdBy: 'admin', 
      },
    });

    return createSuccessResponse(
      {
        message: 'Aviso criado com sucesso!',
        notice,
      },
      201
    );
  } catch (error) {
    return handleError(error);
  }
}
