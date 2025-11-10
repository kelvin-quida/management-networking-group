import { GET } from '@/app/api/attendances/stats/route';
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
  },
}));

describe('/api/attendances/stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('deve retornar estatísticas de presença do membro', async () => {
      const mockMember = {
        id: 'clh1234567890abcdefgh',
        name: 'John Doe',
      };

      const mockAttendances = [
        {
          id: '1',
          memberId: 'clh1234567890abcdefgh',
          checkedIn: true,
          meeting: { date: new Date('2024-01-15') },
        },
        {
          id: '2',
          memberId: 'clh1234567890abcdefgh',
          checkedIn: true,
          meeting: { date: new Date('2024-01-20') },
        },
        {
          id: '3',
          memberId: 'clh1234567890abcdefgh',
          checkedIn: false,
          meeting: { date: new Date('2024-02-10') },
        },
      ];

      (prisma.member.findUnique as jest.Mock).mockResolvedValue(mockMember);
      (prisma.meeting.count as jest.Mock).mockResolvedValue(10);
      (prisma.attendance.findMany as jest.Mock).mockResolvedValue(mockAttendances);

      const request = createMockRequest({
        method: 'GET',
        searchParams: { memberId: 'clh1234567890abcdefgh' },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats.totalMeetings).toBe(10);
      expect(data.stats.attended).toBe(2);
      expect(data.stats.attendanceRate).toBe(20);
      expect(data.stats.byMonth).toHaveLength(2);
    });

    it('deve retornar erro quando memberId não é fornecido', async () => {
      const request = createMockRequest({ method: 'GET' });
      const response = await GET(request);

      expect(response.status).toBe(400);
    });

    it('deve retornar 404 quando membro não existe', async () => {
      (prisma.member.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({
        method: 'GET',
        searchParams: { memberId: 'invalid-id' },
      });

      const response = await GET(request);

      expect(response.status).toBe(404);
    });

    it('deve filtrar por período mensal', async () => {
      const mockMember = { id: 'clh1234567890abcdefgh' };

      (prisma.member.findUnique as jest.Mock).mockResolvedValue(mockMember);
      (prisma.meeting.count as jest.Mock).mockResolvedValue(5);
      (prisma.attendance.findMany as jest.Mock).mockResolvedValue([]);

      const request = createMockRequest({
        method: 'GET',
        searchParams: { memberId: 'clh1234567890abcdefgh', period: 'monthly' },
      });

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.meeting.count).toHaveBeenCalledWith({
        where: { date: expect.any(Object) },
      });
    });

    it('deve filtrar por período anual', async () => {
      const mockMember = { id: 'clh1234567890abcdefgh' };

      (prisma.member.findUnique as jest.Mock).mockResolvedValue(mockMember);
      (prisma.meeting.count as jest.Mock).mockResolvedValue(20);
      (prisma.attendance.findMany as jest.Mock).mockResolvedValue([]);

      const request = createMockRequest({
        method: 'GET',
        searchParams: { memberId: 'clh1234567890abcdefgh', period: 'yearly' },
      });

      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('deve calcular taxa de presença 0 quando não há reuniões', async () => {
      const mockMember = { id: 'clh1234567890abcdefgh' };

      (prisma.member.findUnique as jest.Mock).mockResolvedValue(mockMember);
      (prisma.meeting.count as jest.Mock).mockResolvedValue(0);
      (prisma.attendance.findMany as jest.Mock).mockResolvedValue([]);

      const request = createMockRequest({
        method: 'GET',
        searchParams: { memberId: 'clh1234567890abcdefgh' },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stats.attendanceRate).toBe(0);
    });

    it('deve lidar com erro do banco de dados', async () => {
      (prisma.member.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({
        method: 'GET',
        searchParams: { memberId: 'clh1234567890abcdefgh' },
      });

      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });
});
