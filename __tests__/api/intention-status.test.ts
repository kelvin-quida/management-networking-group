import { GET } from '@/app/api/intentions/status/route';
import { prisma } from '@/lib/prisma';
import { createMockRequest, mockIntention, resetAllMocks } from '../utils/mocks';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    intention: {
      findUnique: jest.fn(),
    },
  },
}));

describe('Intention Status API', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.clearAllMocks();
  });

  describe('GET /api/intentions/status', () => {
    it('should return intention status for valid email', async () => {
      const email = 'john@example.com';

      (prisma.intention.findUnique as jest.Mock).mockResolvedValue(mockIntention);

      const request = createMockRequest({
        method: 'GET',
        searchParams: { email },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.intention).toBeDefined();
      expect(data.intention.email).toBe(email);
      expect(data.intention.status).toBe('PENDING');
      expect(prisma.intention.findUnique).toHaveBeenCalledWith({
        where: { email },
        select: expect.objectContaining({
          id: true,
          name: true,
          email: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        }),
      });
    });

    it('should return approved status', async () => {
      const email = 'approved@example.com';

      (prisma.intention.findUnique as jest.Mock).mockResolvedValue({
        ...mockIntention,
        email,
        status: 'APPROVED',
      });

      const request = createMockRequest({
        method: 'GET',
        searchParams: { email },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.intention.status).toBe('APPROVED');
    });

    it('should return rejected status', async () => {
      const email = 'rejected@example.com';

      (prisma.intention.findUnique as jest.Mock).mockResolvedValue({
        ...mockIntention,
        email,
        status: 'REJECTED',
      });

      const request = createMockRequest({
        method: 'GET',
        searchParams: { email },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.intention.status).toBe('REJECTED');
    });

    it('should return 404 if intention not found', async () => {
      const email = 'notfound@example.com';

      (prisma.intention.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({
        method: 'GET',
        searchParams: { email },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Nenhuma intenção encontrada para este email');
    });

    it('should return 400 if email is missing', async () => {
      const request = createMockRequest({
        method: 'GET',
        searchParams: {},
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Email é obrigatório');
      expect(prisma.intention.findUnique).not.toHaveBeenCalled();
    });

    it('should not expose sensitive fields', async () => {
      const email = 'john@example.com';

      const limitedIntention = {
        id: mockIntention.id,
        name: mockIntention.name,
        email: mockIntention.email,
        status: mockIntention.status,
        createdAt: mockIntention.createdAt,
        updatedAt: mockIntention.updatedAt,
      };

      (prisma.intention.findUnique as jest.Mock).mockResolvedValue(limitedIntention);

      const request = createMockRequest({
        method: 'GET',
        searchParams: { email },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(data.intention.phone).toBeUndefined();
      expect(data.intention.company).toBeUndefined();
      expect(data.intention.message).toBeUndefined();
    });

    it('should include timestamps', async () => {
      const email = 'john@example.com';

      (prisma.intention.findUnique as jest.Mock).mockResolvedValue(mockIntention);

      const request = createMockRequest({
        method: 'GET',
        searchParams: { email },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(data.intention.createdAt).toBeDefined();
      expect(data.intention.updatedAt).toBeDefined();
    });
  });
});
