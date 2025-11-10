import { GET, DELETE } from '@/app/api/thanks/[id]/route';
import { prisma } from '@/lib/prisma';
import { createMockRequest } from '../utils/mocks';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    thank: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('/api/thanks/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('deve retornar agradecimento específico', async () => {
      const mockThank = {
        id: 'clh1234567890abcdefgh',
        fromMemberId: 'clh1111111111111111',
        toMemberId: 'clh2222222222222222',
        message: 'Obrigado pela indicação!',
        value: 5000,
        isPublic: true,
        createdAt: '2024-01-15T10:00:00.000Z',
        fromMember: { id: 'clh1111111111111111', name: 'John', email: 'john@example.com', company: 'ACME' },
        toMember: { id: 'clh2222222222222222', name: 'Jane', email: 'jane@example.com', company: 'Tech' },
      };

      (prisma.thank.findUnique as jest.Mock).mockResolvedValue(mockThank);

      const request = createMockRequest({ method: 'GET' });
      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.thank).toEqual(mockThank);
      expect(prisma.thank.findUnique).toHaveBeenCalledWith({
        where: { id: 'clh1234567890abcdefgh' },
        include: expect.any(Object),
      });
    });

    it('deve retornar 404 quando agradecimento não existe', async () => {
      (prisma.thank.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({ method: 'GET' });
      const params = Promise.resolve({ id: 'invalid-id' });
      const response = await GET(request, { params });

      expect(response.status).toBe(404);
    });

    it('deve lidar com erro do banco de dados', async () => {
      (prisma.thank.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({ method: 'GET' });
      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await GET(request, { params });

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE', () => {
    it('deve deletar agradecimento com sucesso', async () => {
      const mockThank = {
        id: 'clh1234567890abcdefgh',
        fromMemberId: 'clh1111111111111111',
        toMemberId: 'clh2222222222222222',
        message: 'Obrigado!',
        value: 1000,
        isPublic: true,
      };

      (prisma.thank.findUnique as jest.Mock).mockResolvedValue(mockThank);
      (prisma.thank.delete as jest.Mock).mockResolvedValue(mockThank);

      const request = createMockRequest({ method: 'DELETE' });
      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Agradecimento deletado com sucesso');
      expect(prisma.thank.delete).toHaveBeenCalledWith({
        where: { id: 'clh1234567890abcdefgh' },
      });
    });

    it('deve retornar 404 quando agradecimento não existe', async () => {
      (prisma.thank.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({ method: 'DELETE' });
      const params = Promise.resolve({ id: 'invalid-id' });
      const response = await DELETE(request, { params });

      expect(response.status).toBe(404);
    });

    it('deve lidar com erro ao deletar', async () => {
      const mockThank = { id: 'clh1234567890abcdefgh' };
      (prisma.thank.findUnique as jest.Mock).mockResolvedValue(mockThank);
      (prisma.thank.delete as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({ method: 'DELETE' });
      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await DELETE(request, { params });

      expect(response.status).toBe(500);
    });
  });
});
