import { GET, POST } from '@/app/api/notices/route';
import { GET as GET_BY_ID, PATCH, DELETE } from '@/app/api/notices/[id]/route';
import { prisma } from '@/lib/prisma';
import { createMockRequest, resetAllMocks } from '../utils/mocks';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    notice: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mockNotice = {
  id: 'clh1111111111notice',
  title: 'Reunião Mensal',
  content: 'Próxima reunião será dia 15/12',
  type: 'EVENT',
  priority: 'HIGH',
  publishedAt: new Date('2024-12-01'),
  expiresAt: new Date('2024-12-15'),
  createdBy: 'admin',
  createdAt: new Date('2024-12-01'),
  updatedAt: new Date('2024-12-01'),
};

describe('Notices API', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.clearAllMocks();
  });

  describe('GET /api/notices', () => {
    it('should return all notices', async () => {
      const notices = [mockNotice];
      (prisma.notice.findMany as jest.Mock).mockResolvedValue(notices);

      const request = createMockRequest({ method: 'GET' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.notices).toHaveLength(1);
      expect(data.notices[0].title).toBe('Reunião Mensal');
      expect(data.notices[0].type).toBe('EVENT');
      expect(prisma.notice.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: [
          { priority: 'desc' },
          { publishedAt: 'desc' },
        ],
        select: expect.any(Object),
      });
    });

    it('should filter notices by type', async () => {
      const notices = [mockNotice];
      (prisma.notice.findMany as jest.Mock).mockResolvedValue(notices);

      const request = createMockRequest({
        method: 'GET',
        searchParams: { type: 'EVENT' },
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(prisma.notice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { type: 'EVENT' },
        })
      );
    });

    it('should filter active notices only', async () => {
      const notices = [mockNotice];
      (prisma.notice.findMany as jest.Mock).mockResolvedValue(notices);

      const request = createMockRequest({
        method: 'GET',
        searchParams: { active: 'true' },
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.notice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: expect.any(Date) } },
            ],
          },
        })
      );
    });

    it('should order by priority and date', async () => {
      (prisma.notice.findMany as jest.Mock).mockResolvedValue([]);

      const request = createMockRequest({ method: 'GET' });
      await GET(request);

      expect(prisma.notice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [
            { priority: 'desc' },
            { publishedAt: 'desc' },
          ],
        })
      );
    });
  });

  describe('POST /api/notices', () => {
    it('should create a new notice', async () => {
      const noticeData = {
        title: 'Nova Reunião',
        content: 'Detalhes da reunião',
        type: 'EVENT' as const,
        priority: 'HIGH' as const,
        expiresAt: '2024-12-31T23:59:59.000Z',
      };

      (prisma.notice.create as jest.Mock).mockResolvedValue({
        ...mockNotice,
        ...noticeData,
      });

      const request = createMockRequest({
        method: 'POST',
        body: noticeData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe('Aviso criado com sucesso!');
      expect(data.notice).toBeDefined();
      expect(prisma.notice.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: noticeData.title,
          content: noticeData.content,
          type: noticeData.type,
          priority: noticeData.priority,
        }),
      });
    });

    it('should create notice without expiration date', async () => {
      const noticeData = {
        title: 'Aviso Permanente',
        content: 'Conteúdo importante',
        type: 'INFO' as const,
        priority: 'NORMAL' as const,
      };

      (prisma.notice.create as jest.Mock).mockResolvedValue({
        ...mockNotice,
        ...noticeData,
        expiresAt: null,
      });

      const request = createMockRequest({
        method: 'POST',
        body: noticeData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(prisma.notice.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          expiresAt: null,
        }),
      });
    });

    it('should validate required fields', async () => {
      const invalidData = {
        title: 'Test',
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

    it('should validate notice type enum', async () => {
      const invalidData = {
        title: 'Test',
        content: 'Content',
        type: 'INVALID_TYPE',
        priority: 'HIGH',
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

  describe('GET /api/notices/[id]', () => {
    it('should return notice by id', async () => {
      (prisma.notice.findUnique as jest.Mock).mockResolvedValue(mockNotice);

      const request = createMockRequest({ method: 'GET' });
      const params = Promise.resolve({ id: mockNotice.id });
      const response = await GET_BY_ID(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.notice.id).toBe(mockNotice.id);
      expect(data.notice.title).toBe(mockNotice.title);
      expect(data.notice.type).toBe(mockNotice.type);
      expect(prisma.notice.findUnique).toHaveBeenCalledWith({
        where: { id: mockNotice.id },
      });
    });

    it('should return 404 if notice not found', async () => {
      (prisma.notice.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({ method: 'GET' });
      const params = Promise.resolve({ id: 'nonexistent' });
      const response = await GET_BY_ID(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Aviso não encontrado');
    });
  });

  describe('PATCH /api/notices/[id]', () => {
    it('should update notice', async () => {
      const updateData = {
        title: 'Título Atualizado',
        priority: 'LOW',
      };

      (prisma.notice.findUnique as jest.Mock).mockResolvedValue(mockNotice);
      (prisma.notice.update as jest.Mock).mockResolvedValue({
        ...mockNotice,
        ...updateData,
      });

      const request = createMockRequest({
        method: 'PATCH',
        body: updateData,
      });

      const params = Promise.resolve({ id: mockNotice.id });
      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Aviso atualizado com sucesso');
      expect(prisma.notice.update).toHaveBeenCalledWith({
        where: { id: mockNotice.id },
        data: expect.objectContaining(updateData),
      });
    });

    it('should update expiration date', async () => {
      const updateData = {
        expiresAt: '2025-01-01T00:00:00.000Z',
      };

      (prisma.notice.findUnique as jest.Mock).mockResolvedValue(mockNotice);
      (prisma.notice.update as jest.Mock).mockResolvedValue({
        ...mockNotice,
        expiresAt: new Date(updateData.expiresAt),
      });

      const request = createMockRequest({
        method: 'PATCH',
        body: updateData,
      });

      const params = Promise.resolve({ id: mockNotice.id });
      const response = await PATCH(request, { params });

      expect(response.status).toBe(200);
      expect(prisma.notice.update).toHaveBeenCalledWith({
        where: { id: mockNotice.id },
        data: expect.objectContaining({
          expiresAt: expect.any(Date),
        }),
      });
    });

    it('should return 404 if notice not found', async () => {
      (prisma.notice.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({
        method: 'PATCH',
        body: { title: 'Test' },
      });

      const params = Promise.resolve({ id: 'nonexistent' });
      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Aviso não encontrado');
    });
  });

  describe('DELETE /api/notices/[id]', () => {
    it('should delete notice', async () => {
      (prisma.notice.findUnique as jest.Mock).mockResolvedValue(mockNotice);
      (prisma.notice.delete as jest.Mock).mockResolvedValue(mockNotice);

      const request = createMockRequest({ method: 'DELETE' });
      const params = Promise.resolve({ id: mockNotice.id });
      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Aviso deletado com sucesso');
      expect(prisma.notice.delete).toHaveBeenCalledWith({
        where: { id: mockNotice.id },
      });
    });

    it('should return 404 if notice not found', async () => {
      (prisma.notice.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({ method: 'DELETE' });
      const params = Promise.resolve({ id: 'nonexistent' });
      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Aviso não encontrado');
      expect(prisma.notice.delete).not.toHaveBeenCalled();
    });
  });
});
