import { POST } from '@/app/api/memberships/[id]/pay/route';
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

describe('/api/memberships/[id]/pay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('deve registrar pagamento com sucesso', async () => {
      const mockMembership = {
        id: 'clh1234567890abcdefgh',
        memberId: 'clh1111111111111111',
        status: 'PENDING',
        amount: 100,
      };

      const mockUpdatedMembership = {
        ...mockMembership,
        status: 'PAID',
        paidAt: new Date('2024-01-15T10:00:00.000Z'),
        paymentMethod: 'PIX',
      };

      (prisma.membership.findUnique as jest.Mock).mockResolvedValue(mockMembership);
      (prisma.membership.update as jest.Mock).mockResolvedValue(mockUpdatedMembership);

      const request = createMockRequest({
        method: 'POST',
        body: {
          paidAt: '2024-01-15T10:00:00.000Z',
          paymentMethod: 'PIX',
          notes: 'Pago via PIX',
        },
      });

      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Pagamento registrado com sucesso!');
      expect(data.membership.status).toBe('PAID');
      expect(prisma.membership.update).toHaveBeenCalledWith({
        where: { id: 'clh1234567890abcdefgh' },
        data: {
          status: 'PAID',
          paidAt: expect.any(Date),
          paymentMethod: 'PIX',
          notes: 'Pago via PIX',
        },
      });
    });

    it('deve registrar pagamento sem notas', async () => {
      const mockMembership = {
        id: 'clh1234567890abcdefgh',
        status: 'PENDING',
      };

      const mockUpdatedMembership = {
        ...mockMembership,
        status: 'PAID',
        paidAt: new Date('2024-01-15T10:00:00.000Z'),
        paymentMethod: 'CREDIT_CARD',
      };

      (prisma.membership.findUnique as jest.Mock).mockResolvedValue(mockMembership);
      (prisma.membership.update as jest.Mock).mockResolvedValue(mockUpdatedMembership);

      const request = createMockRequest({
        method: 'POST',
        body: {
          paidAt: '2024-01-15T10:00:00.000Z',
          paymentMethod: 'CREDIT_CARD',
        },
      });

      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await POST(request, { params });

      expect(response.status).toBe(200);
    });

    it('deve retornar 404 quando mensalidade não existe', async () => {
      (prisma.membership.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({
        method: 'POST',
        body: {
          paidAt: '2024-01-15T10:00:00.000Z',
          paymentMethod: 'PIX',
        },
      });

      const params = Promise.resolve({ id: 'invalid-id' });
      const response = await POST(request, { params });

      expect(response.status).toBe(404);
    });

    it('deve retornar erro quando mensalidade já foi paga', async () => {
      const mockMembership = {
        id: 'clh1234567890abcdefgh',
        status: 'PAID',
        paidAt: new Date('2024-01-10T10:00:00.000Z'),
      };

      (prisma.membership.findUnique as jest.Mock).mockResolvedValue(mockMembership);

      const request = createMockRequest({
        method: 'POST',
        body: {
          paidAt: '2024-01-15T10:00:00.000Z',
          paymentMethod: 'PIX',
        },
      });

      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await POST(request, { params });

      expect(response.status).toBe(400);
    });

    it('deve lidar com erro de validação', async () => {
      const mockMembership = {
        id: 'clh1234567890abcdefgh',
        status: 'PENDING',
      };

      (prisma.membership.findUnique as jest.Mock).mockResolvedValue(mockMembership);

      const request = createMockRequest({
        method: 'POST',
        body: {
          paymentMethod: 'PIX',
        },
      });

      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await POST(request, { params });

      expect(response.status).toBe(400);
    });

    it('deve lidar com erro do banco de dados', async () => {
      const mockMembership = {
        id: 'clh1234567890abcdefgh',
        status: 'PENDING',
      };

      (prisma.membership.findUnique as jest.Mock).mockResolvedValue(mockMembership);
      (prisma.membership.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({
        method: 'POST',
        body: {
          paidAt: '2024-01-15T10:00:00.000Z',
          paymentMethod: 'PIX',
        },
      });

      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await POST(request, { params });

      expect(response.status).toBe(500);
    });
  });
});
