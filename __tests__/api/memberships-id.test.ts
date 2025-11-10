import { GET, PATCH } from '@/app/api/memberships/[id]/route';
import { prisma } from '@/lib/prisma';
import { createMockRequest } from '../utils/mocks';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    membership: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('/api/memberships/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('deve retornar mensalidade específica', async () => {
      const mockMembership = {
        id: 'clh1234567890abcdefgh',
        memberId: 'clh1111111111111111',
        dueDate: '2024-12-31T00:00:00.000Z',
        amount: 100,
        status: 'PENDING',
        paidAt: null,
        paymentMethod: null,
        notes: 'Mensalidade de dezembro',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        member: {
          id: 'clh1111111111111111',
          name: 'John Doe',
          email: 'john@example.com',
          company: 'ACME Corp',
        },
      };

      (prisma.membership.findUnique as jest.Mock).mockResolvedValue(mockMembership);

      const request = createMockRequest({ method: 'GET' });
      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.membership).toEqual(mockMembership);
    });

    it('deve retornar 404 quando mensalidade não existe', async () => {
      (prisma.membership.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({ method: 'GET' });
      const params = Promise.resolve({ id: 'invalid-id' });
      const response = await GET(request, { params });

      expect(response.status).toBe(404);
    });

    it('deve lidar com erro do banco de dados', async () => {
      (prisma.membership.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({ method: 'GET' });
      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await GET(request, { params });

      expect(response.status).toBe(500);
    });
  });

  describe('PATCH', () => {
    it('deve atualizar mensalidade com sucesso', async () => {
      const mockMembership = {
        id: 'clh1234567890abcdefgh',
        status: 'PENDING',
      };

      const mockUpdatedMembership = {
        ...mockMembership,
        status: 'PAID',
        notes: 'Pago via PIX',
      };

      (prisma.membership.findUnique as jest.Mock).mockResolvedValue(mockMembership);
      (prisma.membership.update as jest.Mock).mockResolvedValue(mockUpdatedMembership);

      const request = createMockRequest({
        method: 'PATCH',
        body: {
          status: 'PAID',
          notes: 'Pago via PIX',
        },
      });

      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Mensalidade atualizada com sucesso');
      expect(data.membership).toEqual(mockUpdatedMembership);
    });

    it('deve retornar 404 quando mensalidade não existe', async () => {
      (prisma.membership.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({
        method: 'PATCH',
        body: { status: 'PAID' },
      });

      const params = Promise.resolve({ id: 'invalid-id' });
      const response = await PATCH(request, { params });

      expect(response.status).toBe(404);
    });

    it('deve atualizar apenas status', async () => {
      const mockMembership = { id: 'clh1234567890abcdefgh' };
      const mockUpdatedMembership = { ...mockMembership, status: 'OVERDUE' };

      (prisma.membership.findUnique as jest.Mock).mockResolvedValue(mockMembership);
      (prisma.membership.update as jest.Mock).mockResolvedValue(mockUpdatedMembership);

      const request = createMockRequest({
        method: 'PATCH',
        body: { status: 'OVERDUE' },
      });

      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await PATCH(request, { params });

      expect(response.status).toBe(200);
      expect(prisma.membership.update).toHaveBeenCalledWith({
        where: { id: 'clh1234567890abcdefgh' },
        data: { status: 'OVERDUE' },
      });
    });

    it('deve atualizar apenas notas', async () => {
      const mockMembership = { id: 'clh1234567890abcdefgh' };
      const mockUpdatedMembership = { ...mockMembership, notes: 'Nova nota' };

      (prisma.membership.findUnique as jest.Mock).mockResolvedValue(mockMembership);
      (prisma.membership.update as jest.Mock).mockResolvedValue(mockUpdatedMembership);

      const request = createMockRequest({
        method: 'PATCH',
        body: { notes: 'Nova nota' },
      });

      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await PATCH(request, { params });

      expect(response.status).toBe(200);
    });

    it('deve lidar com erro ao atualizar', async () => {
      const mockMembership = { id: 'clh1234567890abcdefgh' };
      (prisma.membership.findUnique as jest.Mock).mockResolvedValue(mockMembership);
      (prisma.membership.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({
        method: 'PATCH',
        body: { status: 'PAID' },
      });

      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await PATCH(request, { params });

      expect(response.status).toBe(500);
    });
  });
});
