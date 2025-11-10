import { GET, PATCH, DELETE } from '@/app/api/meetings/[id]/route';
import { prisma } from '@/lib/prisma';
import { createMockRequest } from '../utils/mocks';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    meeting: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('/api/meetings/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('deve retornar reunião específica com presenças', async () => {
      const mockMeeting = {
        id: 'clh1234567890abcdefgh',
        title: 'Reunião Mensal',
        description: 'Reunião de networking',
        date: '2024-12-01T10:00:00.000Z',
        location: 'Sala A',
        type: 'REGULAR',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        attendances: [
          {
            id: 'att1',
            memberId: 'member1',
            meetingId: 'clh1234567890abcdefgh',
            checkedInAt: '2024-12-01T10:00:00.000Z',
            member: { id: 'member1', name: 'John Doe', email: 'john@example.com' },
          },
        ],
      };

      (prisma.meeting.findUnique as jest.Mock).mockResolvedValue(mockMeeting);

      const request = createMockRequest({ method: 'GET' });
      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.meeting).toEqual(mockMeeting);
      expect(data.meeting.attendances).toHaveLength(1);
    });

    it('deve retornar 404 quando reunião não existe', async () => {
      (prisma.meeting.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({ method: 'GET' });
      const params = Promise.resolve({ id: 'invalid-id' });
      const response = await GET(request, { params });

      expect(response.status).toBe(404);
    });

    it('deve lidar com erro do banco de dados', async () => {
      (prisma.meeting.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({ method: 'GET' });
      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await GET(request, { params });

      expect(response.status).toBe(500);
    });
  });

  describe('PATCH', () => {
    it('deve atualizar reunião com sucesso', async () => {
      const mockMeeting = {
        id: 'clh1234567890abcdefgh',
        title: 'Reunião Mensal',
        type: 'REGULAR',
      };

      const mockUpdatedMeeting = {
        ...mockMeeting,
        title: 'Reunião Atualizada',
        location: 'Sala B',
      };

      (prisma.meeting.findUnique as jest.Mock).mockResolvedValue(mockMeeting);
      (prisma.meeting.update as jest.Mock).mockResolvedValue(mockUpdatedMeeting);

      const request = createMockRequest({
        method: 'PATCH',
        body: {
          title: 'Reunião Atualizada',
          location: 'Sala B',
        },
      });

      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Reunião atualizada com sucesso');
      expect(data.meeting).toEqual(mockUpdatedMeeting);
    });

    it('deve retornar 404 quando reunião não existe', async () => {
      (prisma.meeting.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({
        method: 'PATCH',
        body: { title: 'Test' },
      });

      const params = Promise.resolve({ id: 'invalid-id' });
      const response = await PATCH(request, { params });

      expect(response.status).toBe(404);
    });

    it('deve atualizar apenas campos fornecidos', async () => {
      const mockMeeting = { id: 'clh1234567890abcdefgh' };
      const mockUpdatedMeeting = { ...mockMeeting, description: 'Nova descrição' };

      (prisma.meeting.findUnique as jest.Mock).mockResolvedValue(mockMeeting);
      (prisma.meeting.update as jest.Mock).mockResolvedValue(mockUpdatedMeeting);

      const request = createMockRequest({
        method: 'PATCH',
        body: { description: 'Nova descrição' },
      });

      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await PATCH(request, { params });

      expect(response.status).toBe(200);
      expect(prisma.meeting.update).toHaveBeenCalledWith({
        where: { id: 'clh1234567890abcdefgh' },
        data: { description: 'Nova descrição' },
      });
    });

    it('deve lidar com erro de validação', async () => {
      const mockMeeting = { id: 'clh1234567890abcdefgh' };
      (prisma.meeting.findUnique as jest.Mock).mockResolvedValue(mockMeeting);

      const request = createMockRequest({
        method: 'PATCH',
        body: { type: 'INVALID_TYPE' },
      });

      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await PATCH(request, { params });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE', () => {
    it('deve deletar reunião com sucesso', async () => {
      const mockMeeting = {
        id: 'clh1234567890abcdefgh',
        title: 'Reunião Mensal',
      };

      (prisma.meeting.findUnique as jest.Mock).mockResolvedValue(mockMeeting);
      (prisma.meeting.delete as jest.Mock).mockResolvedValue(mockMeeting);

      const request = createMockRequest({ method: 'DELETE' });
      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Reunião deletada com sucesso');
      expect(prisma.meeting.delete).toHaveBeenCalledWith({
        where: { id: 'clh1234567890abcdefgh' },
      });
    });

    it('deve retornar 404 quando reunião não existe', async () => {
      (prisma.meeting.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({ method: 'DELETE' });
      const params = Promise.resolve({ id: 'invalid-id' });
      const response = await DELETE(request, { params });

      expect(response.status).toBe(404);
    });

    it('deve lidar com erro ao deletar', async () => {
      const mockMeeting = { id: 'clh1234567890abcdefgh' };
      (prisma.meeting.findUnique as jest.Mock).mockResolvedValue(mockMeeting);
      (prisma.meeting.delete as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({ method: 'DELETE' });
      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await DELETE(request, { params });

      expect(response.status).toBe(500);
    });
  });
});
