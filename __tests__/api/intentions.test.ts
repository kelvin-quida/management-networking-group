import { POST, GET } from '@/app/api/intentions/route';
import { prisma } from '@/lib/prisma';
import { createMockRequest, mockIntention, resetAllMocks } from '../utils/mocks';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    intention: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('Intentions API', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.clearAllMocks();
  });

  describe('POST /api/intentions', () => {
    it('should create a new intention successfully', async () => {
      const newIntention = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+5511999999999',
        message: 'I want to join',
      };

      (prisma.intention.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.intention.create as jest.Mock).mockResolvedValue({
        ...mockIntention,
        ...newIntention,
      });

      const request = createMockRequest({
        method: 'POST',
        body: newIntention,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe('Intenção criada com sucesso!');
      expect(data.intention.email).toBe(newIntention.email);
      expect(prisma.intention.findUnique).toHaveBeenCalledWith({
        where: { email: newIntention.email },
      });
      expect(prisma.intention.create).toHaveBeenCalled();
    });

    it('should reject duplicate email', async () => {
      const duplicateIntention = {
        name: 'John Doe',
        email: 'existing@example.com',
        phone: '+5511999999999',
        message: 'I want to join',
      };

      (prisma.intention.findUnique as jest.Mock).mockResolvedValue(mockIntention);

      const request = createMockRequest({
        method: 'POST',
        body: duplicateIntention,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('DUPLICATE_EMAIL');
      expect(data.message).toContain('Você já enviou uma intenção');
      expect(prisma.intention.create).not.toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const invalidIntention = {
        name: 'John Doe',
      };

      const request = createMockRequest({
        method: 'POST',
        body: invalidIntention,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should validate email format', async () => {
      const invalidEmail = {
        name: 'John Doe',
        email: 'invalid-email',
        phone: '+5511999999999',
        message: 'I want to join',
      };

      const request = createMockRequest({
        method: 'POST',
        body: invalidEmail,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe('GET /api/intentions', () => {
    it('should return paginated intentions', async () => {
      const mockIntentions = [mockIntention, { ...mockIntention, id: 'clh2222222222second' }];

      (prisma.intention.findMany as jest.Mock).mockResolvedValue(mockIntentions);
      (prisma.intention.count as jest.Mock).mockResolvedValue(2);

      const request = createMockRequest({
        method: 'GET',
        searchParams: { page: '1', limit: '10' },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
      expect(data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it('should filter intentions by status', async () => {
      const pendingIntentions = [mockIntention];

      (prisma.intention.findMany as jest.Mock).mockResolvedValue(pendingIntentions);
      (prisma.intention.count as jest.Mock).mockResolvedValue(1);

      const request = createMockRequest({
        method: 'GET',
        searchParams: { status: 'PENDING', page: '1', limit: '10' },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(prisma.intention.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'PENDING' },
        })
      );
    });

    it('should handle pagination correctly', async () => {
      (prisma.intention.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.intention.count as jest.Mock).mockResolvedValue(25);

      const request = createMockRequest({
        method: 'GET',
        searchParams: { page: '2', limit: '10' },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.totalPages).toBe(3);
      expect(prisma.intention.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });
  });
});
