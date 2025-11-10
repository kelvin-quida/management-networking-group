import { GET } from '@/app/api/emails/route';
import { prisma } from '@/lib/prisma';
import { createMockRequest } from '../utils/mocks';
import type { EmailLog } from '@/lib/types';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    emailLog: {
      findMany: jest.fn(),
    },
  },
}));

describe('/api/emails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('deve retornar lista de emails com limite padrão', async () => {
      const mockEmails = [
        {
          id: '1',
          to: 'john@example.com',
          subject: 'Bem-vindo',
          body: 'Olá John',
          status: 'SENT',
          sentAt: '2024-01-15T10:00:00.000Z',
          createdAt: '2024-01-15T09:00:00.000Z',
        },
      ];

      (prisma.emailLog.findMany as jest.Mock).mockResolvedValue(mockEmails);

      const request = createMockRequest({ method: 'GET' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.emails).toEqual(mockEmails);
      expect(prisma.emailLog.findMany).toHaveBeenCalledWith({
        take: 50,
        orderBy: { sentAt: 'desc' },
      });
    });

    it('deve retornar emails com limite customizado', async () => {
      const mockEmails: EmailLog[] = [];

      (prisma.emailLog.findMany as jest.Mock).mockResolvedValue(mockEmails);

      const request = createMockRequest({ 
        method: 'GET',
        searchParams: { limit: '10' }
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.emailLog.findMany).toHaveBeenCalledWith({
        take: 10,
        orderBy: { sentAt: 'desc' },
      });
    });

    it('deve limitar a 100 emails no máximo', async () => {
      const mockEmails: EmailLog[] = [];

      (prisma.emailLog.findMany as jest.Mock).mockResolvedValue(mockEmails);

      const request = createMockRequest({ 
        method: 'GET',
        searchParams: { limit: '200' }
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.emailLog.findMany).toHaveBeenCalledWith({
        take: 100,
        orderBy: { sentAt: 'desc' },
      });
    });

    it('deve retornar array vazio quando não há emails', async () => {
      (prisma.emailLog.findMany as jest.Mock).mockResolvedValue([]);

      const request = createMockRequest({ method: 'GET' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.emails).toEqual([]);
    });

    it('deve lidar com erro do banco de dados', async () => {
      (prisma.emailLog.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({ method: 'GET' });
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });
});
