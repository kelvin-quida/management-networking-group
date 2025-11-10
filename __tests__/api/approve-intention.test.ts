import { POST } from '@/app/api/intentions/approve/route';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { createMockRequest, mockIntention, mockMember, mockUser, resetAllMocks } from '../utils/mocks';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    intention: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    member: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('@/lib/email', () => ({
  sendEmail: jest.fn(),
  createInviteEmailBody: jest.fn(() => 'Email body'),
}));

jest.mock('@/lib/tokens', () => ({
  generateInviteToken: jest.fn(() => 'test-token-123'),
  generateTokenExpiry: jest.fn(() => new Date('2024-12-31')),
}));

describe('Approve Intention API', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.clearAllMocks();
  });

  describe('POST /api/intentions/approve', () => {
    it('should approve intention and create member for new user', async () => {
      const approveData = {
        intentionId: 'clh1234567890abcdefgh',
      };

      (prisma.intention.findUnique as jest.Mock).mockResolvedValue(mockIntention);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({
          intention: {
            update: jest.fn().mockResolvedValue({
              ...mockIntention,
              status: 'APPROVED',
            }),
          },
          member: {
            create: jest.fn().mockResolvedValue({
              ...mockMember,
              status: 'INVITED',
              inviteToken: 'test-token-123',
            }),
          },
          user: {
            update: jest.fn(),
          },
        });
      });

      (sendEmail as jest.Mock).mockResolvedValue(true);

      const request = createMockRequest({
        method: 'POST',
        body: approveData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Intenção aprovada com sucesso!');
      expect(data.member.inviteToken).toBe('test-token-123');
      expect(sendEmail).toHaveBeenCalled();
    });

    it('should approve intention and activate member for existing user', async () => {
      const approveData = {
        intentionId: 'clh1234567890abcdefgh',
      };

      (prisma.intention.findUnique as jest.Mock).mockResolvedValue(mockIntention);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      const mockTxUpdate = jest.fn();
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({
          intention: {
            update: jest.fn().mockResolvedValue({
              ...mockIntention,
              status: 'APPROVED',
            }),
          },
          member: {
            create: jest.fn().mockResolvedValue({
              ...mockMember,
              status: 'ACTIVE',
              inviteToken: 'test-token-123',
            }),
          },
          user: {
            update: mockTxUpdate.mockResolvedValue({
              ...mockUser,
              role: 'MEMBER',
            }),
          },
        });
      });

      (sendEmail as jest.Mock).mockResolvedValue(true);

      const request = createMockRequest({
        method: 'POST',
        body: approveData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockTxUpdate).toHaveBeenCalled();
    });

    it('should return 404 if intention not found', async () => {
      const approveData = {
        intentionId: 'clhnonexistentintent',
      };

      (prisma.intention.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({
        method: 'POST',
        body: approveData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Intenção não encontrada');
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should reject already processed intention', async () => {
      const approveData = {
        intentionId: 'clh1234567890abcdefgh',
      };

      (prisma.intention.findUnique as jest.Mock).mockResolvedValue({
        ...mockIntention,
        status: 'APPROVED',
      });

      const request = createMockRequest({
        method: 'POST',
        body: approveData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Intenção já foi processada');
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should send invitation email', async () => {
      const approveData = {
        intentionId: 'clh1234567890abcdefgh',
      };

      (prisma.intention.findUnique as jest.Mock).mockResolvedValue(mockIntention);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({
          intention: {
            update: jest.fn().mockResolvedValue({
              ...mockIntention,
              status: 'APPROVED',
            }),
          },
          member: {
            create: jest.fn().mockResolvedValue({
              ...mockMember,
              inviteToken: 'test-token-123',
            }),
          },
          user: {
            update: jest.fn(),
          },
        });
      });

      (sendEmail as jest.Mock).mockResolvedValue(true);

      const request = createMockRequest({
        method: 'POST',
        body: approveData,
      });

      await POST(request);

      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: mockIntention.email,
          subject: 'Convite para o Grupo de Networking',
          token: 'test-token-123',
        })
      );
    });

    it('should include registration URL in response', async () => {
      const approveData = {
        intentionId: 'clh1234567890abcdefgh',
      };

      (prisma.intention.findUnique as jest.Mock).mockResolvedValue(mockIntention);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({
          intention: {
            update: jest.fn().mockResolvedValue({
              ...mockIntention,
              status: 'APPROVED',
            }),
          },
          member: {
            create: jest.fn().mockResolvedValue({
              ...mockMember,
              inviteToken: 'test-token-123',
            }),
          },
          user: {
            update: jest.fn(),
          },
        });
      });

      (sendEmail as jest.Mock).mockResolvedValue(true);

      const request = createMockRequest({
        method: 'POST',
        body: approveData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.member.registrationUrl).toContain('test-token-123');
      expect(data.member.registrationUrl).toMatch(/\/register\?token=/);
    });

    it('should validate intentionId format', async () => {
      const invalidData = {
        intentionId: 'invalid-id',
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

    it('should require intentionId field', async () => {
      const missingData = {};

      const request = createMockRequest({
        method: 'POST',
        body: missingData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });
});
