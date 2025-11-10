import { GET, POST } from '@/app/api/one-on-ones/route';
import { GET as GET_BY_ID, PATCH } from '@/app/api/one-on-ones/[id]/route';
import { prisma } from '@/lib/prisma';
import { createMockRequest, mockMember, resetAllMocks } from '../utils/mocks';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    oneOnOne: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockOneOnOne = {
  id: 'clh1111111111oneonone',
  hostId: 'clh9876543210zyxwvuts',
  guestId: 'clh1234567890abcdefgh',
  scheduledAt: new Date('2024-12-15T10:00:00Z'),
  status: 'SCHEDULED',
  notes: 'Discutir parceria',
  completedAt: null,
  createdAt: new Date('2024-12-01'),
  updatedAt: new Date('2024-12-01'),
};

const mockOneOnOneWithMembers = {
  ...mockOneOnOne,
  host: {
    id: 'clh9876543210zyxwvuts',
    name: 'Jane Smith',
    email: 'jane@example.com',
    company: 'Business Inc',
  },
  guest: {
    id: 'clh1234567890abcdefgh',
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Tech Corp',
  },
};

describe('One-on-Ones API', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.clearAllMocks();
  });

  describe('GET /api/one-on-ones', () => {
    it('should return all one-on-ones', async () => {
      const oneOnOnes = [mockOneOnOneWithMembers];
      (prisma.oneOnOne.findMany as jest.Mock).mockResolvedValue(oneOnOnes);

      const request = createMockRequest({ method: 'GET' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.oneOnOnes).toHaveLength(1);
      expect(data.oneOnOnes[0].host.name).toBe('Jane Smith');
      expect(data.oneOnOnes[0].guest.name).toBe('John Doe');
      expect(data.oneOnOnes[0].status).toBe('SCHEDULED');
      expect(prisma.oneOnOne.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.objectContaining({
          host: expect.any(Object),
          guest: expect.any(Object),
        }),
        orderBy: { scheduledAt: 'desc' },
      });
    });

    it('should filter by memberId (host or guest)', async () => {
      const memberId = 'clh9876543210zyxwvuts';
      (prisma.oneOnOne.findMany as jest.Mock).mockResolvedValue([mockOneOnOneWithMembers]);

      const request = createMockRequest({
        method: 'GET',
        searchParams: { memberId },
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.oneOnOne.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { hostId: memberId },
              { guestId: memberId },
            ],
          },
        })
      );
    });

    it('should filter by status', async () => {
      (prisma.oneOnOne.findMany as jest.Mock).mockResolvedValue([mockOneOnOneWithMembers]);

      const request = createMockRequest({
        method: 'GET',
        searchParams: { status: 'SCHEDULED' },
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.oneOnOne.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'SCHEDULED' },
        })
      );
    });

    it('should include member details', async () => {
      (prisma.oneOnOne.findMany as jest.Mock).mockResolvedValue([mockOneOnOneWithMembers]);

      const request = createMockRequest({ method: 'GET' });
      const response = await GET(request);
      const data = await response.json();

      expect(data.oneOnOnes[0].host).toBeDefined();
      expect(data.oneOnOnes[0].guest).toBeDefined();
      expect(data.oneOnOnes[0].host.name).toBe('Jane Smith');
      expect(data.oneOnOnes[0].guest.name).toBe('John Doe');
    });

    it('should order by scheduled date descending', async () => {
      (prisma.oneOnOne.findMany as jest.Mock).mockResolvedValue([]);

      const request = createMockRequest({ method: 'GET' });
      await GET(request);

      expect(prisma.oneOnOne.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { scheduledAt: 'desc' },
        })
      );
    });
  });

  describe('POST /api/one-on-ones', () => {
    it('should create a new one-on-one meeting', async () => {
      const meetingData = {
        hostId: 'clh9876543210zyxwvuts',
        guestId: 'clh1234567890abcdefgh',
        scheduledAt: '2024-12-15T10:00:00Z',
        notes: 'Discutir oportunidades',
      };

      (prisma.oneOnOne.create as jest.Mock).mockResolvedValue(mockOneOnOneWithMembers);

      const request = createMockRequest({
        method: 'POST',
        body: meetingData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe('Reunião 1-on-1 agendada com sucesso!');
      expect(data.oneOnOne).toBeDefined();
      expect(prisma.oneOnOne.create).toHaveBeenCalledWith({
        data: {
          hostId: meetingData.hostId,
          guestId: meetingData.guestId,
          scheduledAt: expect.any(Date),
          notes: meetingData.notes,
        },
        include: expect.any(Object),
      });
    });

    it('should create meeting without notes', async () => {
      const meetingData = {
        hostId: 'clh9876543210zyxwvuts',
        guestId: 'clh1234567890abcdefgh',
        scheduledAt: '2024-12-15T10:00:00Z',
      };

      (prisma.oneOnOne.create as jest.Mock).mockResolvedValue({
        ...mockOneOnOneWithMembers,
        notes: null,
      });

      const request = createMockRequest({
        method: 'POST',
        body: meetingData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(prisma.oneOnOne.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          notes: undefined,
        }),
        include: expect.any(Object),
      });
    });

    it('should validate required fields', async () => {
      const invalidData = {
        hostId: 'clh9876543210zyxwvuts',
      };

      const request = createMockRequest({
        method: 'POST',
        body: invalidData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should validate CUID format for hostId', async () => {
      const invalidData = {
        hostId: 'invalid-id',
        guestId: 'clh1234567890abcdefgh',
        scheduledAt: '2024-12-15T10:00:00Z',
      };

      const request = createMockRequest({
        method: 'POST',
        body: invalidData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should validate date format', async () => {
      const invalidData = {
        hostId: 'clh9876543210zyxwvuts',
        guestId: 'clh1234567890abcdefgh',
        scheduledAt: 'invalid-date',
      };

      const request = createMockRequest({
        method: 'POST',
        body: invalidData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });

  describe('GET /api/one-on-ones/[id]', () => {
    it('should return one-on-one by id', async () => {
      (prisma.oneOnOne.findUnique as jest.Mock).mockResolvedValue(mockOneOnOneWithMembers);

      const request = createMockRequest({ method: 'GET' });
      const params = Promise.resolve({ id: mockOneOnOne.id });
      const response = await GET_BY_ID(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.oneOnOne.id).toBe(mockOneOnOne.id);
      expect(data.oneOnOne.host.name).toBe('Jane Smith');
      expect(data.oneOnOne.guest.name).toBe('John Doe');
      expect(data.oneOnOne.status).toBe('SCHEDULED');
      expect(prisma.oneOnOne.findUnique).toHaveBeenCalledWith({
        where: { id: mockOneOnOne.id },
        include: expect.any(Object),
      });
    });

    it('should return 404 if one-on-one not found', async () => {
      (prisma.oneOnOne.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({ method: 'GET' });
      const params = Promise.resolve({ id: 'nonexistent' });
      const response = await GET_BY_ID(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Reunião 1-on-1 não encontrada');
    });
  });

  describe('PATCH /api/one-on-ones/[id]', () => {
    it('should update one-on-one status to COMPLETED', async () => {
      const updateData = {
        status: 'COMPLETED',
        completedAt: '2024-12-15T11:00:00Z',
      };

      (prisma.oneOnOne.findUnique as jest.Mock).mockResolvedValue(mockOneOnOne);
      (prisma.oneOnOne.update as jest.Mock).mockResolvedValue({
        ...mockOneOnOne,
        status: 'COMPLETED',
        completedAt: new Date(updateData.completedAt),
      });

      const request = createMockRequest({
        method: 'PATCH',
        body: updateData,
      });

      const params = Promise.resolve({ id: mockOneOnOne.id });
      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Reunião 1-on-1 atualizada com sucesso');
      expect(prisma.oneOnOne.update).toHaveBeenCalledWith({
        where: { id: mockOneOnOne.id },
        data: {
          status: 'COMPLETED',
          completedAt: expect.any(Date),
        },
      });
    });

    it('should update one-on-one status to CANCELLED', async () => {
      const updateData = {
        status: 'CANCELLED',
      };

      (prisma.oneOnOne.findUnique as jest.Mock).mockResolvedValue(mockOneOnOne);
      (prisma.oneOnOne.update as jest.Mock).mockResolvedValue({
        ...mockOneOnOne,
        status: 'CANCELLED',
      });

      const request = createMockRequest({
        method: 'PATCH',
        body: updateData,
      });

      const params = Promise.resolve({ id: mockOneOnOne.id });
      const response = await PATCH(request, { params });

      expect(response.status).toBe(200);
      expect(prisma.oneOnOne.update).toHaveBeenCalledWith({
        where: { id: mockOneOnOne.id },
        data: { status: 'CANCELLED' },
      });
    });

    it('should update notes', async () => {
      const updateData = {
        notes: 'Reunião muito produtiva',
      };

      (prisma.oneOnOne.findUnique as jest.Mock).mockResolvedValue(mockOneOnOne);
      (prisma.oneOnOne.update as jest.Mock).mockResolvedValue({
        ...mockOneOnOne,
        notes: updateData.notes,
      });

      const request = createMockRequest({
        method: 'PATCH',
        body: updateData,
      });

      const params = Promise.resolve({ id: mockOneOnOne.id });
      const response = await PATCH(request, { params });

      expect(response.status).toBe(200);
      expect(prisma.oneOnOne.update).toHaveBeenCalledWith({
        where: { id: mockOneOnOne.id },
        data: { notes: updateData.notes },
      });
    });

    it('should return 404 if one-on-one not found', async () => {
      (prisma.oneOnOne.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({
        method: 'PATCH',
        body: { status: 'COMPLETED' },
      });

      const params = Promise.resolve({ id: 'nonexistent' });
      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Reunião 1-on-1 não encontrada');
      expect(prisma.oneOnOne.update).not.toHaveBeenCalled();
    });

    it('should validate status enum', async () => {
      const invalidData = {
        status: 'INVALID_STATUS',
      };

      (prisma.oneOnOne.findUnique as jest.Mock).mockResolvedValue(mockOneOnOne);

      const request = createMockRequest({
        method: 'PATCH',
        body: invalidData,
      });

      const params = Promise.resolve({ id: mockOneOnOne.id });
      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });
});
