import { renderHook } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { useSession } from '@/lib/auth-client';
import { UserRole } from '@prisma/client';

jest.mock('@/lib/auth-client');

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null user when session is null', () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
      error: null,
    } as any);

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isMember).toBe(false);
    expect(result.current.isGuest).toBe(false);
  });

  it('returns admin user correctly', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Admin User',
          email: 'admin@test.com',
          role: UserRole.ADMIN,
          memberId: null,
        },
      },
      isPending: false,
      error: null,
    } as any);

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toEqual({
      id: '1',
      name: 'Admin User',
      email: 'admin@test.com',
      role: UserRole.ADMIN,
      memberId: null,
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isMember).toBe(false);
    expect(result.current.isGuest).toBe(false);
  });

  it('returns member user correctly', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '2',
          name: 'Member User',
          email: 'member@test.com',
          role: UserRole.MEMBER,
          memberId: 'member-1',
        },
      },
      isPending: false,
      error: null,
    } as any);

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toEqual({
      id: '2',
      name: 'Member User',
      email: 'member@test.com',
      role: UserRole.MEMBER,
      memberId: 'member-1',
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isMember).toBe(true);
    expect(result.current.isGuest).toBe(false);
  });

  it('returns guest user correctly', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '3',
          name: 'Guest User',
          email: 'guest@test.com',
          role: UserRole.GUEST,
          memberId: null,
        },
      },
      isPending: false,
      error: null,
    } as any);

    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toEqual({
      id: '3',
      name: 'Guest User',
      email: 'guest@test.com',
      role: UserRole.GUEST,
      memberId: null,
    });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isMember).toBe(false);
    expect(result.current.isGuest).toBe(true);
  });

  it('handles pending state correctly', () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: true,
      error: null,
    } as any);

    const { result } = renderHook(() => useAuth());

    expect(result.current.isPending).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('handles error state correctly', () => {
    const mockError = new Error('Auth error');
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
      error: mockError,
    } as any);

    const { result } = renderHook(() => useAuth());

    expect(result.current.error).toBe(mockError);
    expect(result.current.user).toBeNull();
  });

  it('defaults to GUEST role when role is missing', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '4',
          name: 'User Without Role',
          email: 'norole@test.com',
        },
      },
      isPending: false,
      error: null,
    } as any);

    const { result } = renderHook(() => useAuth());

    expect(result.current.user?.role).toBe(UserRole.GUEST);
    expect(result.current.isGuest).toBe(true);
  });

  it('handles member without memberId', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '5',
          name: 'Member Without ID',
          email: 'nomemberid@test.com',
          role: UserRole.MEMBER,
        },
      },
      isPending: false,
      error: null,
    } as any);

    const { result } = renderHook(() => useAuth());

    expect(result.current.user?.memberId).toBeNull();
    expect(result.current.isMember).toBe(true);
  });

  it('returns all expected properties', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@test.com',
          role: UserRole.MEMBER,
          memberId: 'member-1',
        },
      },
      isPending: false,
      error: null,
    } as any);

    const { result } = renderHook(() => useAuth());

    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('isAuthenticated');
    expect(result.current).toHaveProperty('isAdmin');
    expect(result.current).toHaveProperty('isMember');
    expect(result.current).toHaveProperty('isGuest');
    expect(result.current).toHaveProperty('isPending');
    expect(result.current).toHaveProperty('error');
  });

  it('correctly identifies authenticated vs unauthenticated users', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Auth User',
          email: 'auth@test.com',
          role: UserRole.MEMBER,
        },
      },
      isPending: false,
      error: null,
    } as any);

    const { result: authResult } = renderHook(() => useAuth());
    expect(authResult.current.isAuthenticated).toBe(true);

    mockUseSession.mockReturnValue({
      data: null,
      isPending: false,
      error: null,
    } as any);

    const { result: unauthResult } = renderHook(() => useAuth());
    expect(unauthResult.current.isAuthenticated).toBe(false);
  });
});
