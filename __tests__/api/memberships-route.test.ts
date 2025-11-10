import { GET, POST } from '@/app/api/memberships/route';
import { prisma } from '@/lib/prisma';
import { createMockRequest } from '../utils/mocks';
import type { MembershipWithMember } from '@/lib/types';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    membership: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('/api/memberships', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('deve retornar lista de mensalidades', async () => {
      const mockMemberships = [
        {
          id: '1',
          memberId: 'clh1234567890abcdefgh',
          dueDate: '2024-12-31T00:00:00.000Z',
          amount: 100,
          status: 'PENDING',
          paidAt: null,
          paymentMethod: null,
          notes: null,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          member: { id: 'clh1234567890abcdefgh', name: 'John Doe', email: 'john@example.com' },
        },
      ];

      (prisma.membership.findMany as jest.Mock).mockResolvedValue(mockMemberships);

      const request = createMockRequest({ method: 'GET' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.memberships).toEqual(mockMemberships);
      expect(prisma.membership.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: { dueDate: 'desc' },
      });
    });

    it('deve filtrar mensalidades por memberId', async () => {
      const mockMemberships: MembershipWithMember[] = [];

      (prisma.membership.findMany as jest.Mock).mockResolvedValue(mockMemberships);

      const request = createMockRequest({ 
        method: 'GET',
        searchParams: { memberId: 'clh1234567890abcdefgh' }
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.membership.findMany).toHaveBeenCalledWith({
        where: { memberId: 'clh1234567890abcdefgh' },
        include: expect.any(Object),
        orderBy: { dueDate: 'desc' },
      });
    });

    it('deve filtrar mensalidades por status', async () => {
      const mockMemberships: MembershipWithMember[] = [];

      (prisma.membership.findMany as jest.Mock).mockResolvedValue(mockMemberships);

      const request = createMockRequest({ 
        method: 'GET',
        searchParams: { status: 'PAID' }
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.membership.findMany).toHaveBeenCalledWith({
        where: { status: 'PAID' },
        include: expect.any(Object),
        orderBy: { dueDate: 'desc' },
      });
    });

    it('deve lidar com erro ao buscar mensalidades', async () => {
      (prisma.membership.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({ method: 'GET' });
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });

  describe('POST', () => {
    it('deve criar mensalidade com sucesso', async () => {
      const mockMembership = {
        id: '1',
        memberId: 'clh1234567890abcdefgh',
        dueDate: '2024-12-31T00:00:00.000Z',
        amount: 100,
        status: 'PENDING',
        notes: 'Mensalidade de dezembro',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        member: { id: 'clh1234567890abcdefgh', name: 'John Doe', email: 'john@example.com' },
      };

      (prisma.membership.create as jest.Mock).mockResolvedValue(mockMembership);

      const request = createMockRequest({
        method: 'POST',
        body: {
          memberId: 'clh1234567890abcdefgh',
          dueDate: '2024-12-31T00:00:00.000Z',
          amount: 100,
          notes: 'Mensalidade de dezembro',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe('Mensalidade criada com sucesso!');
      expect(data.membership).toEqual(mockMembership);
    });

    it('deve criar mensalidade sem notas', async () => {
      const mockMembership = {
        id: '2',
        memberId: 'clh1234567890abcdefgh',
        dueDate: '2024-11-30T00:00:00.000Z',
        amount: 150,
        status: 'PENDING',
        notes: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        member: { id: 'clh1234567890abcdefgh', name: 'John Doe', email: 'john@example.com' },
      };

      (prisma.membership.create as jest.Mock).mockResolvedValue(mockMembership);

      const request = createMockRequest({
        method: 'POST',
        body: {
          memberId: 'clh1234567890abcdefgh',
          dueDate: '2024-11-30T00:00:00.000Z',
          amount: 150,
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
    });

    it('deve lidar com erro de validação', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          // Dados inválidos - faltando campos obrigatórios
          amount: 100,
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('deve lidar com erro do banco de dados', async () => {
      (prisma.membership.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({
        method: 'POST',
        body: {
          memberId: 'clh1234567890abcdefgh',
          dueDate: '2024-12-31T00:00:00.000Z',
          amount: 100,
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });
});
