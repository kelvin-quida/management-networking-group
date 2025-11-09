import { randomBytes } from 'crypto';

export function generateInviteToken(): string {
  return randomBytes(32).toString('hex');
}

export function generateTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7); // Token válido por 7 dias
  return expiry;
}

export function isTokenExpired(tokenExpiry: Date): boolean {
  return new Date() > tokenExpiry;
}
