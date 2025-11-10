import { useSession } from '@/lib/auth-client';
import { UserRole } from '@prisma/client'

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  memberId?: string | null;
}

export const useAuth = () => {
  const { data: session, isPending, error } = useSession();

  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: (session.user as any).role || UserRole.GUEST,
        memberId: (session.user as any).memberId || null,
      }
    : null;

  const isAuthenticated = !!session;
  const isAdmin = user?.role === UserRole.ADMIN;
  const isMember = user?.role === UserRole.MEMBER;
  const isGuest = user?.role === UserRole.GUEST;

  return {
    user,
    isAuthenticated,
    isAdmin,
    isMember,
    isGuest,
    isPending,
    error,
  };
};
