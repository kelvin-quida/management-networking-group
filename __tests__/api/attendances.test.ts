import { GET } from '@/app/api/attendances/route';
import { prisma } from '@/lib/prisma';
import { createMockRequest } from '../utils/mocks';
import type { AttendanceWithRelations } from '@/lib/types';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    attendance: {
      findMany: jest.fn(),
    },
  },
}));

describe('/api/attendances', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('deve retornar lista de presenças', async () => {
      const mockAttendances = [
        {
          id: '1',
          memberId: 'member1',
          meetingId: 'meeting1',
          checkedInAt: '2024-01-15T10:00:00.000Z',
          member: { id: 'member1', name: 'John Doe', email: 'john@example.com' },
          meeting: { id: 'meeting1', title: 'Reunião 1', date: '2024-01-15T00:00:00.000Z', type: 'REGULAR' },
          createdAt: '2024-01-15T10:00:00.000Z',
        },
      ];

      (prisma.attendance.findMany as jest.Mock).mockResolvedValue(mockAttendances);

      const request = createMockRequest({ method: 'GET' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.attendances).toEqual(mockAttendances);
      expect(prisma.attendance.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          member: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          meeting: {
            select: {
              id: true,
              title: true,
              date: true,
              type: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('deve filtrar presenças por memberId', async () => {
      const mockAttendances = [
        {
          id: '1',
          memberId: 'member123',
          meetingId: 'meeting1',
          checkedInAt: '2024-01-15T10:00:00.000Z',
          member: { id: 'member123', name: 'John Doe', email: 'john@example.com' },
          meeting: { id: 'meeting1', title: 'Reunião 1', date: '2024-01-15T00:00:00.000Z', type: 'REGULAR' },
          createdAt: '2024-01-15T10:00:00.000Z',
        },
      ];

      (prisma.attendance.findMany as jest.Mock).mockResolvedValue(mockAttendances);

      const request = createMockRequest({ 
        method: 'GET', 
        searchParams: { memberId: 'member123' }
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.attendances).toEqual(mockAttendances);
      expect(prisma.attendance.findMany).toHaveBeenCalledWith({
        where: { memberId: 'member123' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('deve filtrar presenças por meetingId', async () => {
      const mockAttendances: AttendanceWithRelations[] = [];

      (prisma.attendance.findMany as jest.Mock).mockResolvedValue(mockAttendances);

      const request = createMockRequest({ 
        method: 'GET', 
        searchParams: { meetingId: 'meeting456' }
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(prisma.attendance.findMany).toHaveBeenCalledWith({
        where: { meetingId: 'meeting456' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('deve filtrar por memberId e meetingId simultaneamente', async () => {
      const mockAttendances: AttendanceWithRelations[] = [];

      (prisma.attendance.findMany as jest.Mock).mockResolvedValue(mockAttendances);

      const request = createMockRequest({ 
        method: 'GET', 
        searchParams: { memberId: 'member1', meetingId: 'meeting1' }
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.attendance.findMany).toHaveBeenCalledWith({
        where: { memberId: 'member1', meetingId: 'meeting1' },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('deve retornar array vazio quando não há presenças', async () => {
      (prisma.attendance.findMany as jest.Mock).mockResolvedValue([]);

      const request = createMockRequest({ method: 'GET' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.attendances).toEqual([]);
    });

    it('deve lidar com erro do banco de dados', async () => {
      (prisma.attendance.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({ method: 'GET' });
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });
});
