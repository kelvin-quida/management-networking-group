import { GET } from '@/app/api/members/route';
import { prisma } from '@/lib/prisma';
import { createMockRequest, mockMember, resetAllMocks } from '../utils/mocks';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('Members API', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.clearAllMocks();
  });

  describe('GET /api/members', () => {
    it('should return paginated members', async () => {
      const mockMembers = [
        mockMember,
        { ...mockMember, id: 'clh8888888888member2', name: 'John Doe' },
      ];

      (prisma.member.findMany as jest.Mock).mockResolvedValue(mockMembers);
      (prisma.member.count as jest.Mock).mockResolvedValue(2);

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

    it('should filter members by status', async () => {
      const activeMembers = [mockMember];

      (prisma.member.findMany as jest.Mock).mockResolvedValue(activeMembers);
      (prisma.member.count as jest.Mock).mockResolvedValue(1);

      const request = createMockRequest({
        method: 'GET',
        searchParams: { status: 'ACTIVE', page: '1', limit: '10' },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(prisma.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'ACTIVE' },
        })
      );
    });

    it('should return all members when no status filter is provided', async () => {
      const allMembers = [
        mockMember,
        { ...mockMember, id: 'clh8888888888member2', status: 'INACTIVE' },
      ];

      (prisma.member.findMany as jest.Mock).mockResolvedValue(allMembers);
      (prisma.member.count as jest.Mock).mockResolvedValue(2);

      const request = createMockRequest({
        method: 'GET',
        searchParams: { page: '1', limit: '10' },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
      expect(prisma.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        })
      );
    });

    it('should handle pagination correctly with multiple pages', async () => {
      (prisma.member.findMany as jest.Mock).mockResolvedValue([mockMember]);
      (prisma.member.count as jest.Mock).mockResolvedValue(50);

      const request = createMockRequest({
        method: 'GET',
        searchParams: { page: '3', limit: '10' },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.totalPages).toBe(5);
      expect(prisma.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        })
      );
    });

    it('should order members by creation date descending', async () => {
      (prisma.member.findMany as jest.Mock).mockResolvedValue([mockMember]);
      (prisma.member.count as jest.Mock).mockResolvedValue(1);

      const request = createMockRequest({
        method: 'GET',
        searchParams: { page: '1', limit: '10' },
      });

      await GET(request);

      expect(prisma.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should return only selected fields', async () => {
      (prisma.member.findMany as jest.Mock).mockResolvedValue([mockMember]);
      (prisma.member.count as jest.Mock).mockResolvedValue(1);

      const request = createMockRequest({
        method: 'GET',
        searchParams: { page: '1', limit: '10' },
      });

      await GET(request);

      expect(prisma.member.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            id: true,
            name: true,
            email: true,
            phone: true,
            company: true,
            position: true,
            status: true,
            createdAt: true,
          }),
        })
      );
    });
  });
});
