import { POST } from '@/app/api/intentions/reject/route';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { createMockRequest, mockIntention, resetAllMocks } from '../utils/mocks';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    intention: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn(),
  createRejectionEmailBody: jest.fn(() => 'Rejection email body'),
}));

describe('Reject Intention API', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.clearAllMocks();
  });

  describe('POST /api/intentions/reject', () => {
    it('should reject intention successfully', async () => {
      const rejectData = {
        intentionId: 'clh1234567890abcdefgh',
        reason: 'Não atende aos critérios do grupo',
      };

      (prisma.intention.findUnique as jest.Mock).mockResolvedValue(mockIntention);
      (prisma.intention.update as jest.Mock).mockResolvedValue({
        ...mockIntention,
        status: 'REJECTED',
      });
      (sendEmail as jest.Mock).mockResolvedValue(true);

      const request = createMockRequest({
        method: 'POST',
        body: rejectData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Intenção rejeitada');
      expect(prisma.intention.update).toHaveBeenCalledWith({
        where: { id: rejectData.intentionId },
        data: { status: 'REJECTED' },
      });
    });

    it('should send rejection email', async () => {
      const rejectData = {
        intentionId: 'clh1234567890abcdefgh',
        reason: 'Perfil não compatível',
      };

      (prisma.intention.findUnique as jest.Mock).mockResolvedValue(mockIntention);
      (prisma.intention.update as jest.Mock).mockResolvedValue({
        ...mockIntention,
        status: 'REJECTED',
      });
      (sendEmail as jest.Mock).mockResolvedValue(true);

      const request = createMockRequest({
        method: 'POST',
        body: rejectData,
      });

      await POST(request);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: mockIntention.email,
          subject: 'Sobre sua solicitação ao Grupo de Networking',
        })
      );
    });

    it('should return 404 if intention not found', async () => {
      const rejectData = {
        intentionId: 'clhnonexistentintent',
        reason: 'Test reason',
      };

      (prisma.intention.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({
        method: 'POST',
        body: rejectData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Intenção não encontrada');
      expect(prisma.intention.update).not.toHaveBeenCalled();
    });

    it('should reject already processed intention', async () => {
      const rejectData = {
        intentionId: 'clh1234567890abcdefgh',
        reason: 'Test reason',
      };

      (prisma.intention.findUnique as jest.Mock).mockResolvedValue({
        ...mockIntention,
        status: 'APPROVED',
      });

      const request = createMockRequest({
        method: 'POST',
        body: rejectData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Intenção já foi processada');
      expect(prisma.intention.update).not.toHaveBeenCalled();
    });

    it('should validate intentionId format', async () => {
      const invalidData = {
        intentionId: 'invalid-id',
        reason: 'Test reason',
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

    it('should require reason field', async () => {
      const missingReason = {
        intentionId: 'clh1234567890abcdefgh',
      };

      const request = createMockRequest({
        method: 'POST',
        body: missingReason,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should validate reason minimum length', async () => {
      const shortReason = {
        intentionId: 'clh1234567890abcdefgh',
        reason: 'abc',
      };

      const request = createMockRequest({
        method: 'POST',
        body: shortReason,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should handle email sending failure gracefully', async () => {
      const rejectData = {
        intentionId: 'clh1234567890abcdefgh',
        reason: 'Test reason',
      };

      (prisma.intention.findUnique as jest.Mock).mockResolvedValue(mockIntention);
      (prisma.intention.update as jest.Mock).mockResolvedValue({
        ...mockIntention,
        status: 'REJECTED',
      });
      (sendEmail as jest.Mock).mockRejectedValue(new Error('Email service error'));

      const request = createMockRequest({
        method: 'POST',
        body: rejectData,
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });
});
