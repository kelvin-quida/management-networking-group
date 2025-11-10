import { GET, POST } from '@/app/api/meetings/route';
import { prisma } from '@/lib/prisma';
import { createMockRequest, mockMeeting, resetAllMocks } from '../utils/mocks';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    meeting: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('Meetings API', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.clearAllMocks();
  });

  describe('GET /api/meetings', () => {
    it('should return all meetings with attendance count', async () => {
      const mockMeetings = [
        {
          ...mockMeeting,
          _count: { attendances: 10 },
        },
        {
          ...mockMeeting,
          id: 'clh6666666666meet2',
          _count: { attendances: 5 },
        },
      ];

      (prisma.meeting.findMany as jest.Mock).mockResolvedValue(mockMeetings);

      const request = createMockRequest({
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.meetings).toHaveLength(2);
      expect(data.meetings[0].attendanceCount).toBe(10);
      expect(data.meetings[1].attendanceCount).toBe(5);
    });

    it('should filter meetings by date range', async () => {
      const mockMeetings = [
        {
          ...mockMeeting,
          _count: { attendances: 10 },
        },
      ];

      (prisma.meeting.findMany as jest.Mock).mockResolvedValue(mockMeetings);

      const request = createMockRequest({
        method: 'GET',
        searchParams: {
          from: '2024-01-01',
          to: '2024-12-31',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(prisma.meeting.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            date: {
              gte: new Date('2024-01-01'),
              lte: new Date('2024-12-31'),
            },
          },
        })
      );
    });

    it('should filter meetings from a specific date', async () => {
      (prisma.meeting.findMany as jest.Mock).mockResolvedValue([]);

      const request = createMockRequest({
        method: 'GET',
        searchParams: {
          from: '2024-06-01',
        },
      });

      await GET(request);

      expect(prisma.meeting.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            date: {
              gte: new Date('2024-06-01'),
            },
          },
        })
      );
    });

    it('should order meetings by date descending', async () => {
      (prisma.meeting.findMany as jest.Mock).mockResolvedValue([]);

      const request = createMockRequest({
        method: 'GET',
      });

      await GET(request);

      expect(prisma.meeting.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { date: 'desc' },
        })
      );
    });
  });

  describe('POST /api/meetings', () => {
    it('should create a new meeting successfully', async () => {
      const newMeeting = {
        title: 'New Meeting',
        description: 'Test meeting',
        date: '2024-12-01T10:00:00Z',
        location: 'Conference Room',
        type: 'REGULAR',
      };

      (prisma.meeting.create as jest.Mock).mockResolvedValue({
        ...mockMeeting,
        ...newMeeting,
        date: new Date(newMeeting.date),
      });

      const request = createMockRequest({
        method: 'POST',
        body: newMeeting,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe('Reunião criada com sucesso!');
      expect(data.meeting.title).toBe(newMeeting.title);
      expect(prisma.meeting.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: newMeeting.title,
          description: newMeeting.description,
          location: newMeeting.location,
          type: newMeeting.type,
        }),
      });
    });

    it('should validate required fields', async () => {
      const invalidMeeting = {
        title: 'New Meeting',
      };

      const request = createMockRequest({
        method: 'POST',
        body: invalidMeeting,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(prisma.meeting.create).not.toHaveBeenCalled();
    });

    it('should validate meeting type enum', async () => {
      const invalidType = {
        title: 'New Meeting',
        description: 'Test meeting',
        date: '2024-12-01T10:00:00Z',
        location: 'Conference Room',
        type: 'INVALID_TYPE',
      };

      const request = createMockRequest({
        method: 'POST',
        body: invalidType,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(prisma.meeting.create).not.toHaveBeenCalled();
    });

    it('should convert date string to Date object', async () => {
      const newMeeting = {
        title: 'New Meeting',
        description: 'Test meeting',
        date: '2024-12-01T10:00:00Z',
        location: 'Conference Room',
        type: 'REGULAR',
      };

      (prisma.meeting.create as jest.Mock).mockResolvedValue({
        ...mockMeeting,
        ...newMeeting,
        date: new Date(newMeeting.date),
      });

      const request = createMockRequest({
        method: 'POST',
        body: newMeeting,
      });

      await POST(request);

      expect(prisma.meeting.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          date: new Date(newMeeting.date),
        }),
      });
    });
  });
});
