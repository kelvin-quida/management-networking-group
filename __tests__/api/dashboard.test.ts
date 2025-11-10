import { GET } from '@/app/api/dashboard/group/route';
import { prisma } from '@/lib/prisma';
import { createMockRequest, resetAllMocks } from '../utils/mocks';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      count: jest.fn(),
    },
    meeting: {
      count: jest.fn(),
    },
    attendance: {
      findMany: jest.fn(),
    },
    thank: {
      count: jest.fn(),
    },
  },
}));

describe('Dashboard API', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.clearAllMocks();
  });

  describe('GET /api/dashboard/group', () => {
    it('should return group statistics', async () => {
      (prisma.member.count as jest.Mock)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(85)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(8);

      (prisma.meeting.count as jest.Mock).mockResolvedValue(20);
      
      (prisma.attendance.findMany as jest.Mock).mockResolvedValue(
        Array(150).fill({ checkedIn: true })
      );

      (prisma.thank.count as jest.Mock)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(12);

      const request = createMockRequest({
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats).toEqual({
        totalMembers: 100,
        activeMembers: 85,
        averageAttendance: expect.any(Number),
        monthlyGrowth: expect.any(Number),
        totalThanks: 50,
        monthlyThanks: 12,
      });
    });

    it('should calculate average attendance correctly', async () => {
      (prisma.member.count as jest.Mock)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(8)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(1);

      (prisma.meeting.count as jest.Mock).mockResolvedValue(5);
      
      (prisma.attendance.findMany as jest.Mock).mockResolvedValue(
        Array(30).fill({ checkedIn: true })
      );

      (prisma.thank.count as jest.Mock)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(3);

      const request = createMockRequest({
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(data.stats.averageAttendance).toBe(60);
    });

    it('should handle zero meetings gracefully', async () => {
      (prisma.member.count as jest.Mock)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(8)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(1);

      (prisma.meeting.count as jest.Mock).mockResolvedValue(0);
      (prisma.attendance.findMany as jest.Mock).mockResolvedValue([]);
      
      (prisma.thank.count as jest.Mock)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(3);

      const request = createMockRequest({
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(data.stats.averageAttendance).toBe(0);
    });

    it('should calculate monthly growth correctly', async () => {
      (prisma.member.count as jest.Mock)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(85)
        .mockResolvedValueOnce(12)
        .mockResolvedValueOnce(10);

      (prisma.meeting.count as jest.Mock).mockResolvedValue(20);
      (prisma.attendance.findMany as jest.Mock).mockResolvedValue([]);
      
      (prisma.thank.count as jest.Mock)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(12);

      const request = createMockRequest({
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(data.stats.monthlyGrowth).toBe(20);
    });

    it('should handle zero last month members gracefully', async () => {
      (prisma.member.count as jest.Mock)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(85)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(0);

      (prisma.meeting.count as jest.Mock).mockResolvedValue(20);
      (prisma.attendance.findMany as jest.Mock).mockResolvedValue([]);
      
      (prisma.thank.count as jest.Mock)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(12);

      const request = createMockRequest({
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(data.stats.monthlyGrowth).toBe(0);
    });

    it('should return thank statistics', async () => {
      (prisma.member.count as jest.Mock)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(85)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(8);

      (prisma.meeting.count as jest.Mock).mockResolvedValue(20);
      (prisma.attendance.findMany as jest.Mock).mockResolvedValue([]);
      
      (prisma.thank.count as jest.Mock)
        .mockResolvedValueOnce(75)
        .mockResolvedValueOnce(15);

      const request = createMockRequest({
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(data.stats.totalThanks).toBe(75);
      expect(data.stats.monthlyThanks).toBe(15);
    });

    it('should format numbers to 2 decimal places', async () => {
      (prisma.member.count as jest.Mock)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(85)
        .mockResolvedValueOnce(7)
        .mockResolvedValueOnce(3);

      (prisma.meeting.count as jest.Mock).mockResolvedValue(3);
      
      (prisma.attendance.findMany as jest.Mock).mockResolvedValue(
        Array(10).fill({ checkedIn: true })
      );
      
      (prisma.thank.count as jest.Mock)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(12);

      const request = createMockRequest({
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(data.stats.averageAttendance.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
      expect(data.stats.monthlyGrowth.toString()).toMatch(/^\d+(\.\d{1,2})?$/);
    });
  });
});
