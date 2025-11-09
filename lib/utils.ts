import { z } from 'zod';

export function handleZodError(error: z.ZodError<any>) {
  const errors = error.issues.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return Response.json(
    { error: 'Erro de validação', details: errors },
    { status: 400 }
  );
}

export function handleError(error: unknown) {
  console.error('Erro na API:', error);

  if (error instanceof z.ZodError) {
    return handleZodError(error);
  }

  return Response.json(
    { error: 'Erro interno do servidor' },
    { status: 500 }
  );
}

export function createSuccessResponse(data: any, status = 200) {
  return Response.json(data, { status });
}

export function createErrorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)),
  };
}

export function calculatePagination(page: number, limit: number) {
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}
