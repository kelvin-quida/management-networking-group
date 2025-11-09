import { NextRequest } from 'next/server';

const ADMIN_KEY = process.env.ADMIN_KEY || 'admin-secret-key-change-in-production';

export function validateAdminAuth(request: NextRequest): boolean {
  const adminKey = request.headers.get('x-admin-key');
  return adminKey === ADMIN_KEY;
}

export function createUnauthorizedResponse() {
  return Response.json(
    { error: 'Não autorizado' },
    { status: 401 }
  );
}
