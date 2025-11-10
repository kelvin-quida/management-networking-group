import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

jest.mock('@/hooks/useAuth');
jest.mock('next/navigation');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('AdminGuard Component', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter as any);
  });

  it('shows loading state when isPending is true', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isMember: false,
      isGuest: false,
      isPending: true,
      error: null,
    });

    render(
      <AdminGuard>
        <div>Protected Content</div>
      </AdminGuard>
    );

    expect(screen.getByText('Verificando permissões...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when user is admin', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
        name: 'Admin User',
        email: 'admin@test.com',
        role: 'ADMIN',
        memberId: null,
      },
      isAuthenticated: true,
      isAdmin: true,
      isMember: false,
      isGuest: false,
      isPending: false,
      error: null,
    });

    render(
      <AdminGuard>
        <div>Protected Content</div>
      </AdminGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects member to /dashboard', async () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '2',
        name: 'Member User',
        email: 'member@test.com',
        role: 'MEMBER',
        memberId: 'member-1',
      },
      isAuthenticated: true,
      isAdmin: false,
      isMember: true,
      isGuest: false,
      isPending: false,
      error: null,
    });

    render(
      <AdminGuard>
        <div>Protected Content</div>
      </AdminGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    expect(screen.getByText(/Acesso de Membro/i)).toBeInTheDocument();
  });

  it('shows member access message for non-admin members', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '2',
        name: 'Member User',
        email: 'member@test.com',
        role: 'MEMBER',
        memberId: 'member-1',
      },
      isAuthenticated: true,
      isAdmin: false,
      isMember: true,
      isGuest: false,
      isPending: false,
      error: null,
    });

    render(
      <AdminGuard>
        <div>Protected Content</div>
      </AdminGuard>
    );

    expect(screen.getByText(/Acesso de Membro/i)).toBeInTheDocument();
    expect(screen.getByText(/Você é um membro/i)).toBeInTheDocument();
    expect(screen.getByText('member@test.com')).toBeInTheDocument();
  });

  it('redirects non-admin to default redirectTo path', async () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '3',
        name: 'Guest User',
        email: 'guest@test.com',
        role: 'GUEST',
        memberId: null,
      },
      isAuthenticated: true,
      isAdmin: false,
      isMember: false,
      isGuest: true,
      isPending: false,
      error: null,
    });

    render(
      <AdminGuard>
        <div>Protected Content</div>
      </AdminGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('redirects non-admin to custom redirectTo path', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isMember: false,
      isGuest: false,
      isPending: false,
      error: null,
    });

    render(
      <AdminGuard redirectTo="/login">
        <div>Protected Content</div>
      </AdminGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('triggers redirect for non-admin users', async () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '3',
        name: 'Guest User',
        email: 'guest@test.com',
        role: 'GUEST',
        memberId: null,
      },
      isAuthenticated: true,
      isAdmin: false,
      isMember: false,
      isGuest: true,
      isPending: false,
      error: null,
    });

    render(
      <AdminGuard>
        <div>Protected Content</div>
      </AdminGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });

  it('does not render protected content for non-admin users', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isMember: false,
      isGuest: false,
      isPending: false,
      error: null,
    });

    render(
      <AdminGuard>
        <div>Protected Content</div>
      </AdminGuard>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
