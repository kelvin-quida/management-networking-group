import { GET, PATCH, DELETE } from '@/app/api/members/[id]/route';
import { prisma } from '@/lib/prisma';
import { createMockRequest } from '../utils/mocks';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    member: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('/api/members/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('deve retornar membro específico', async () => {
      const mockMember = {
        id: 'clh1234567890abcdefgh',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '11999999999',
        company: 'ACME Corp',
        position: 'CEO',
        address: 'Rua A, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        birthDate: '1990-01-01',
        status: 'ACTIVE',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      (prisma.member.findUnique as jest.Mock).mockResolvedValue(mockMember);

      const request = createMockRequest({ method: 'GET' });
      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.member).toEqual(mockMember);
    });

    it('deve retornar 404 quando membro não existe', async () => {
      (prisma.member.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({ method: 'GET' });
      const params = Promise.resolve({ id: 'invalid-id' });
      const response = await GET(request, { params });

      expect(response.status).toBe(404);
    });

    it('deve lidar com erro do banco de dados', async () => {
      (prisma.member.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({ method: 'GET' });
      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await GET(request, { params });

      expect(response.status).toBe(500);
    });
  });

  describe('PATCH', () => {
    it('deve atualizar membro com sucesso', async () => {
      const mockMember = {
        id: 'clh1234567890abcdefgh',
        name: 'John Doe',
        status: 'ACTIVE',
      };

      const mockUpdatedMember = {
        ...mockMember,
        name: 'John Doe Updated',
        company: 'New Company',
      };

      (prisma.member.findUnique as jest.Mock).mockResolvedValue(mockMember);
      (prisma.member.update as jest.Mock).mockResolvedValue(mockUpdatedMember);

      const request = createMockRequest({
        method: 'PATCH',
        body: {
          name: 'John Doe Updated',
          company: 'New Company',
        },
      });

      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await PATCH(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Membro atualizado com sucesso');
      expect(data.member).toEqual(mockUpdatedMember);
    });

    it('deve retornar 404 quando membro não existe', async () => {
      (prisma.member.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({
        method: 'PATCH',
        body: { name: 'Test' },
      });

      const params = Promise.resolve({ id: 'invalid-id' });
      const response = await PATCH(request, { params });

      expect(response.status).toBe(404);
    });

    it('deve atualizar apenas campos fornecidos', async () => {
      const mockMember = { id: 'clh1234567890abcdefgh' };
      const mockUpdatedMember = { ...mockMember, company: 'Updated Company' };

      (prisma.member.findUnique as jest.Mock).mockResolvedValue(mockMember);
      (prisma.member.update as jest.Mock).mockResolvedValue(mockUpdatedMember);

      const request = createMockRequest({
        method: 'PATCH',
        body: { company: 'Updated Company' },
      });

      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await PATCH(request, { params });

      expect(response.status).toBe(200);
      expect(prisma.member.update).toHaveBeenCalledWith({
        where: { id: 'clh1234567890abcdefgh' },
        data: { company: 'Updated Company' },
      });
    });

    it('deve lidar com erro de validação', async () => {
      const mockMember = { id: 'clh1234567890abcdefgh' };
      (prisma.member.findUnique as jest.Mock).mockResolvedValue(mockMember);

      const request = createMockRequest({
        method: 'PATCH',
        body: { status: 'INVALID_STATUS' },
      });

      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await PATCH(request, { params });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE', () => {
    it('deve deletar membro com sucesso', async () => {
      const mockMember = {
        id: 'clh1234567890abcdefgh',
        name: 'John Doe',
      };

      (prisma.member.findUnique as jest.Mock).mockResolvedValue(mockMember);
      (prisma.member.delete as jest.Mock).mockResolvedValue(mockMember);

      const request = createMockRequest({ method: 'DELETE' });
      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Membro deletado com sucesso');
      expect(prisma.member.delete).toHaveBeenCalledWith({
        where: { id: 'clh1234567890abcdefgh' },
      });
    });

    it('deve retornar 404 quando membro não existe', async () => {
      (prisma.member.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({ method: 'DELETE' });
      const params = Promise.resolve({ id: 'invalid-id' });
      const response = await DELETE(request, { params });

      expect(response.status).toBe(404);
    });

    it('deve lidar com erro ao deletar', async () => {
      const mockMember = { id: 'clh1234567890abcdefgh' };
      (prisma.member.findUnique as jest.Mock).mockResolvedValue(mockMember);
      (prisma.member.delete as jest.Mock).mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({ method: 'DELETE' });
      const params = Promise.resolve({ id: 'clh1234567890abcdefgh' });
      const response = await DELETE(request, { params });

      expect(response.status).toBe(500);
    });
  });
});
