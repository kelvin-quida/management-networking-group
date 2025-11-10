import { GET, POST } from '@/app/api/thanks/route';
import { prisma } from '@/lib/prisma';
import { createMockRequest } from '../utils/mocks';
import type { ThankWithMembers } from '@/lib/types';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    thank: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('/api/thanks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('deve retornar lista de agradecimentos públicos', async () => {
      const mockThanks = [
        {
          id: '1',
          fromMemberId: 'member1',
          toMemberId: 'member2',
          message: 'Obrigado pela indicação!',
          value: 5000,
          isPublic: true,
          createdAt: '2024-01-15T10:00:00.000Z',
          fromMember: { id: 'member1', name: 'John', email: 'john@example.com', company: 'ACME' },
          toMember: { id: 'member2', name: 'Jane', email: 'jane@example.com', company: 'Tech' },
        },
      ];

      (prisma.thank.findMany as jest.Mock).mockResolvedValue(mockThanks);

      const request = createMockRequest({ method: 'GET' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.thanks).toEqual(mockThanks);
      expect(prisma.thank.findMany).toHaveBeenCalledWith({
        where: { isPublic: true },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('deve filtrar agradecimentos por memberId', async () => {
      const mockThanks: ThankWithMembers[] = [];

      (prisma.thank.findMany as jest.Mock).mockResolvedValue(mockThanks);

      const request = createMockRequest({ 
        method: 'GET',
        searchParams: { memberId: 'member123' }
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.thank.findMany).toHaveBeenCalledWith({
        where: {
          isPublic: true,
          OR: [
            { fromMemberId: 'member123' },
            { toMemberId: 'member123' },
          ],
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('deve retornar array vazio quando não há agradecimentos', async () => {
      (prisma.thank.findMany as jest.Mock).mockResolvedValue([]);

      const request = createMockRequest({ method: 'GET' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.thanks).toEqual([]);
    });

    it('deve lidar com erro ao buscar agradecimentos', async () => {
      (prisma.thank.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({ method: 'GET' });
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });

  describe('POST', () => {
    it('deve criar agradecimento com sucesso', async () => {
      const mockThank = {
        id: 'clh1234567890abcdefgh',
        fromMemberId: 'clh1234567890abcdefgh',
        toMemberId: 'clh9876543210zyxwvuts',
        message: 'Obrigado pela indicação que gerou ótimos resultados!',
        value: 1000,
        isPublic: true,
        createdAt: new Date('2024-01-15T10:00:00.000Z'),
        fromMember: { id: 'clh1234567890abcdefgh', name: 'John' },
        toMember: { id: 'clh9876543210zyxwvuts', name: 'Jane' },
      };

      (prisma.thank.create as jest.Mock).mockResolvedValue(mockThank);

      const request = createMockRequest({
        method: 'POST',
        body: {
          fromMemberId: 'clh1234567890abcdefgh',
          toMemberId: 'clh9876543210zyxwvuts',
          message: 'Obrigado pela indicação que gerou ótimos resultados!',
          value: 1000,
          isPublic: true,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe('Agradecimento registrado!');
      expect(data.thank.id).toBe('clh1234567890abcdefgh');
      expect(prisma.thank.create).toHaveBeenCalledWith({
        data: {
          fromMemberId: 'clh1234567890abcdefgh',
          toMemberId: 'clh9876543210zyxwvuts',
          message: 'Obrigado pela indicação que gerou ótimos resultados!',
          value: 1000,
          isPublic: true,
        },
        include: expect.any(Object),
      });
    });

    it('deve criar agradecimento privado', async () => {
      const mockThank = {
        id: 'clh2222222222abcdefgh',
        fromMemberId: 'clh1234567890abcdefgh',
        toMemberId: 'clh9876543210zyxwvuts',
        message: 'Obrigado pela ajuda com o projeto!',
        value: 500,
        isPublic: false,
        createdAt: new Date('2024-01-15T10:00:00.000Z'),
        fromMember: { id: 'clh1234567890abcdefgh', name: 'John' },
        toMember: { id: 'clh9876543210zyxwvuts', name: 'Jane' },
      };

      (prisma.thank.create as jest.Mock).mockResolvedValue(mockThank);

      const request = createMockRequest({
        method: 'POST',
        body: {
          fromMemberId: 'clh1234567890abcdefgh',
          toMemberId: 'clh9876543210zyxwvuts',
          message: 'Obrigado pela ajuda com o projeto!',
          value: 500,
          isPublic: false,
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
    });

    it('deve lidar com erro de validação', async () => {
      const request = createMockRequest({
        method: 'POST',
        body: {
          message: 'Teste',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('deve lidar com erro do banco de dados', async () => {
      (prisma.thank.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({
        method: 'POST',
        body: {
          fromMemberId: 'clh1234567890abcdefgh',
          toMemberId: 'clh9876543210zyxwvuts',
          message: 'Obrigado pela indicação!',
          value: 1000,
          isPublic: true,
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });
});
