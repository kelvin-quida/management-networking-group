import { POST } from '@/app/api/meetings/[id]/check-in/route';
import { prisma } from '@/lib/prisma';
import { createMockRequest, mockMeeting, mockMember, mockAttendance, resetAllMocks } from '../utils/mocks';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    meeting: {
      findUnique: jest.fn(),
    },
    member: {
      findUnique: jest.fn(),
    },
    attendance: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('Check-in API', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.clearAllMocks();
  });

  describe('POST /api/meetings/[id]/check-in', () => {
    it('should create a new check-in successfully', async () => {
      const checkInData = {
        memberId: 'clh9876543210zyxwvuts',
      };

      (prisma.meeting.findUnique as jest.Mock).mockResolvedValue(mockMeeting);
      (prisma.member.findUnique as jest.Mock).mockResolvedValue(mockMember);
      (prisma.attendance.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.attendance.create as jest.Mock).mockResolvedValue({
        ...mockAttendance,
        checkedIn: true,
        checkInAt: new Date(),
      });

      const request = createMockRequest({
        method: 'POST',
        body: checkInData,
      });

      const params = Promise.resolve({ id: 'clh5555555555meeting' });
      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Check-in realizado com sucesso!');
      expect(data.attendance.checkedIn).toBe(true);
      expect(prisma.attendance.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          memberId: checkInData.memberId,
          meetingId: 'clh5555555555meeting',
        }),
      });
    });

    it('should update existing attendance on duplicate check-in', async () => {
      const checkInData = {
        memberId: 'clh9876543210zyxwvuts',
      };

      (prisma.meeting.findUnique as jest.Mock).mockResolvedValue(mockMeeting);
      (prisma.member.findUnique as jest.Mock).mockResolvedValue(mockMember);
      (prisma.attendance.findUnique as jest.Mock).mockResolvedValue({
        ...mockAttendance,
        checkedIn: false,
      });
      (prisma.attendance.update as jest.Mock).mockResolvedValue({
        ...mockAttendance,
        checkedIn: true,
        checkInAt: new Date(),
      });

      const request = createMockRequest({
        method: 'POST',
        body: checkInData,
      });

      const params = Promise.resolve({ id: 'clh5555555555meeting' });
      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Check-in realizado com sucesso!');
      expect(prisma.attendance.update).toHaveBeenCalled();
      expect(prisma.attendance.create).not.toHaveBeenCalled();
    });

    it('should return 404 if meeting not found', async () => {
      const checkInData = {
        memberId: 'clh9876543210zyxwvuts',
      };

      (prisma.meeting.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({
        method: 'POST',
        body: checkInData,
      });

      const params = Promise.resolve({ id: 'clhnonexistentmeeting' });
      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Reunião não encontrada');
      expect(prisma.attendance.create).not.toHaveBeenCalled();
    });

    it('should return 404 if member not found', async () => {
      const checkInData = {
        memberId: 'clhnonexistentmember',
      };

      (prisma.meeting.findUnique as jest.Mock).mockResolvedValue(mockMeeting);
      (prisma.member.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({
        method: 'POST',
        body: checkInData,
      });

      const params = Promise.resolve({ id: 'clh5555555555meeting' });
      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Membro não encontrado');
      expect(prisma.attendance.create).not.toHaveBeenCalled();
    });

    it('should validate memberId format', async () => {
      const invalidCheckIn = {
        memberId: 'invalid-id-format',
      };

      const request = createMockRequest({
        method: 'POST',
        body: invalidCheckIn,
      });

      const params = Promise.resolve({ id: 'clh5555555555meeting' });
      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should require memberId field', async () => {
      const missingMemberId = {};

      const request = createMockRequest({
        method: 'POST',
        body: missingMemberId,
      });

      const params = Promise.resolve({ id: 'clh5555555555meeting' });
      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should set checkInAt timestamp', async () => {
      const checkInData = {
        memberId: 'clh9876543210zyxwvuts',
      };

      (prisma.meeting.findUnique as jest.Mock).mockResolvedValue(mockMeeting);
      (prisma.member.findUnique as jest.Mock).mockResolvedValue(mockMember);
      (prisma.attendance.findUnique as jest.Mock).mockResolvedValue(null);
      
      const mockDate = new Date('2024-12-01T10:00:00Z');
      (prisma.attendance.create as jest.Mock).mockResolvedValue({
        ...mockAttendance,
        checkedIn: true,
        checkInAt: mockDate,
      });

      const request = createMockRequest({
        method: 'POST',
        body: checkInData,
      });

      const params = Promise.resolve({ id: 'clh5555555555meeting' });
      const response = await POST(request, { params });
      const data = await response.json();

      expect(data.attendance.checkInAt).toBeDefined();
      expect(prisma.attendance.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          checkInAt: expect.any(Date),
        }),
      });
    });
  });
});
