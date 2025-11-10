import { GET } from '@/app/api/dashboard/member/[id]/route';
import { prisma } from '@/lib/prisma';
import { createMockRequest } from '../utils/mocks';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findUnique: jest.fn(),
    },
    meeting: {
      count: jest.fn(),
    },
    attendance: {
      findMany: jest.fn(),
    },
    oneOnOne: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    thank: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('/api/dashboard/member/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('deve retornar dashboard do membro com estatísticas', async () => {
      const mockMember = {
        id: 'clh1234567890abcdefgh',
        name: 'John Doe',
        email: 'john@example.com',
        company: 'ACME Corp',
        status: 'ACTIVE',
      };

      const mockAttendances = [
        { id: '1', memberId: 'clh1234567890abcdefgh', checkedIn: true },
        { id: '2', memberId: 'clh1234567890abcdefgh', checkedIn: true },
      ];

      const mockRecentThanks = [
        {
          id: '1',
          fromMemberId: 'clh1234567890abcdefgh',
          toMemberId: 'other',
          message: 'Obrigado!',
          fromMember: { name: 'John Doe' },
          toMember: { name: 'Jane' },
        },
      ];

      const mockRecentOneOnOnes = [
        {
          id: '1',
          hostId: 'clh1234567890abcdefgh',
          guestId: 'other',
          scheduledAt: '2024-01-15T10:00:00.000Z',
          host: { name: 'John Doe' },
          guest: { name: 'Jane' },
        },
      ];

      (prisma.member.findUnique as jest.Mock).mockResolvedValue(mockMember);
      (prisma.meeting.count as jest.Mock).mockResolvedValue(10);
      (prisma.attendance.findMany as jest.Mock).mockResolvedValue(mockAttendances);
      (prisma.oneOnOne.count as jest.Mock).mockResolvedValue(5);
      (prisma.thank.count as jest.Mock).mockResolvedValue(3);
      (prisma.thank.findMany as jest.Mock).mockResolvedValue(mockRecentThanks);
      (prisma.oneOnOne.findMany as jest.Mock).mockResolvedValue(mockRecentOneOnOnes);

      const request = createMockRequest({ method: 'GET' });
      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.member).toEqual(mockMember);
      expect(data.stats.attendanceRate).toBe(20); 
      expect(data.stats.oneOnOnesCompleted).toBe(5);
      expect(data.stats.thanksReceived).toBe(3);
      expect(data.recentActivity.thanks).toHaveLength(1);
      expect(data.recentActivity.oneOnOnes).toHaveLength(1);
    });

    it('deve retornar 404 quando membro não existe', async () => {
      (prisma.member.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({ method: 'GET' });
      const params = Promise.resolve({ id: 'invalid-id' });
      const response = await GET(request, { params });

      expect(response.status).toBe(404);
    });

    it('deve calcular taxa de presença 0 quando não há reuniões', async () => {
      const mockMember = {
        id: 'clh1234567890abcdefgh',
        name: 'John Doe',
        email: 'john@example.com',
        company: 'ACME Corp',
        status: 'ACTIVE',
      };

      (prisma.member.findUnique as jest.Mock).mockResolvedValue(mockMember);
      (prisma.meeting.count as jest.Mock).mockResolvedValue(0);
      (prisma.attendance.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.oneOnOne.count as jest.Mock).mockResolvedValue(0);
      (prisma.thank.count as jest.Mock).mockResolvedValue(0);
      (prisma.thank.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.oneOnOne.findMany as jest.Mock).mockResolvedValue([]);

      const request = createMockRequest({ method: 'GET' });
      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats.attendanceRate).toBe(0);
    });

    it('deve lidar com erro do banco de dados', async () => {
      (prisma.member.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({ method: 'GET' });
      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await GET(request, { params });

      expect(response.status).toBe(500);
    });
  });
});
