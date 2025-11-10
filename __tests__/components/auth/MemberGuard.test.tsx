import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemberGuard } from '@/components/auth/MemberGuard';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

jest.mock('@/hooks/useAuth');
jest.mock('next/navigation');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('MemberGuard Component', () => {
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
      <MemberGuard>
        <div>Protected Content</div>
      </MemberGuard>
    );

    expect(screen.getByText('Verificando permissões...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when user is member with memberId', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '1',
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
      <MemberGuard>
        <div>Protected Content</div>
      </MemberGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects admin to /admin', async () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '2',
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
      <MemberGuard>
        <div>Protected Content</div>
      </MemberGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin');
    });

    expect(screen.getByText(/Acesso Admin/i)).toBeInTheDocument();
  });

  it('redirects guest to /pending', async () => {
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
      <MemberGuard>
        <div>Protected Content</div>
      </MemberGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/pending');
    });

    expect(screen.getByText(/Cadastro Pendente/i)).toBeInTheDocument();
  });

  it('redirects member without memberId to /pending', async () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: '4',
        name: 'Incomplete Member',
        email: 'incomplete@test.com',
        role: 'MEMBER',
        memberId: null,
      },
      isAuthenticated: true,
      isAdmin: false,
      isMember: true,
      isGuest: false,
      isPending: false,
      error: null,
    });

    render(
      <MemberGuard>
        <div>Protected Content</div>
      </MemberGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/pending');
    });

    expect(screen.getByText(/Perfil Incompleto/i)).toBeInTheDocument();
  });

  it('redirects non-member to default login path', async () => {
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
      <MemberGuard>
        <div>Protected Content</div>
      </MemberGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('redirects non-member to custom redirectTo path', async () => {
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
      <MemberGuard redirectTo="/custom-login">
        <div>Protected Content</div>
      </MemberGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/custom-login');
    });
  });





  it('does not render protected content for unauthorized users', () => {
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
      <MemberGuard>
        <div>Protected Content</div>
      </MemberGuard>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
