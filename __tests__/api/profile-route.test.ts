import { GET, PATCH } from '@/app/api/profile/route';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth-config';
import { createMockRequest } from '../utils/mocks';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    member: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth-config', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

describe('/api/profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('deve retornar perfil do usuário autenticado', async () => {
      const mockSession = {
        user: { id: 'user1', email: 'john@example.com' },
      };

      const mockUser = {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        memberId: 'member1',
      };

      const mockMember = {
        id: 'member1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '11999999999',
        company: 'ACME Corp',
        position: 'CEO',
        address: 'Rua A, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        birthDate: '1990-01-01',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(mockSession);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.member.findUnique as jest.Mock).mockResolvedValue(mockMember);

      const request = createMockRequest({ method: 'GET' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.member).toEqual(mockMember);
    });

    it('deve retornar erro 401 quando não autenticado', async () => {
      jest.mocked(auth.api.getSession).mockResolvedValue(null);

      const request = createMockRequest({ method: 'GET' });
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('deve retornar erro 404 quando usuário não tem memberId', async () => {
      const mockSession = {
        user: { id: 'user1', email: 'john@example.com' },
      };

      const mockUser = {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        memberId: null,
      };

      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(mockSession);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const request = createMockRequest({ method: 'GET' });
      const response = await GET(request);

      expect(response.status).toBe(404);
    });

    it('deve retornar erro 404 quando membro não existe', async () => {
      const mockSession = {
        user: { id: 'user1', email: 'john@example.com' },
      };

      const mockUser = {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        memberId: 'member1',
      };

      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(mockSession);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.member.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({ method: 'GET' });
      const response = await GET(request);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH', () => {
    it('deve atualizar perfil do usuário', async () => {
      const mockSession = {
        user: { id: 'user1', email: 'john@example.com' },
      };

      const mockUser = {
        id: 'user1',
        memberId: 'member1',
      };

      const mockUpdatedMember = {
        id: 'member1',
        name: 'John Doe Updated',
        email: 'john@example.com',
        phone: '11988888888',
        company: 'New Company',
        position: 'CTO',
        status: 'ACTIVE',
      };

      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(mockSession);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.member.update as jest.Mock).mockResolvedValue(mockUpdatedMember);
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const request = createMockRequest({
        method: 'PATCH',
        body: {
          name: 'John Doe Updated',
          phone: '11988888888',
          company: 'New Company',
          position: 'CTO',
        },
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Perfil atualizado com sucesso');
      expect(data.member).toEqual(mockUpdatedMember);
    });

    it('deve atualizar apenas campos específicos', async () => {
      const mockSession = {
        user: { id: 'user1', email: 'john@example.com' },
      };

      const mockUser = {
        id: 'user1',
        memberId: 'member1',
      };

      const mockUpdatedMember = {
        id: 'member1',
        company: 'Updated Company',
      };

      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(mockSession);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.member.update as jest.Mock).mockResolvedValue(mockUpdatedMember);

      const request = createMockRequest({
        method: 'PATCH',
        body: {
          company: 'Updated Company',
        },
      });

      const response = await PATCH(request);

      expect(response.status).toBe(200);
      expect(prisma.member.update).toHaveBeenCalledWith({
        where: { id: 'member1' },
        data: { company: 'Updated Company' },
      });
    });

    it('deve retornar erro 401 quando não autenticado', async () => {
      jest.mocked(auth.api.getSession).mockResolvedValue(null);

      const request = createMockRequest({
        method: 'PATCH',
        body: { name: 'Test' },
      });

      const response = await PATCH(request);

      expect(response.status).toBe(401);
    });

    it('deve retornar erro 404 quando usuário não tem memberId', async () => {
      const mockSession = {
        user: { id: 'user1', email: 'john@example.com' },
      };

      const mockUser = {
        id: 'user1',
        memberId: null,
      };

      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(mockSession);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const request = createMockRequest({
        method: 'PATCH',
        body: { name: 'Test' },
      });

      const response = await PATCH(request);

      expect(response.status).toBe(404);
    });

  });
});
