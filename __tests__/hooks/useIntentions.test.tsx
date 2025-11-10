import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  useIntentions, 
  useCreateIntention, 
  useApproveIntention, 
  useRejectIntention,
  useIntentionStatus 
} from '@/hooks/useIntentions';

global.fetch = jest.fn();

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useIntentions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useIntentions', () => {
    it('deve buscar lista de intenções com sucesso', async () => {
      const mockData = {
        data: [
          { id: '1', name: 'John Doe', email: 'john@example.com', status: 'PENDING' },
          { id: '2', name: 'Jane Doe', email: 'jane@example.com', status: 'APPROVED' },
        ],
        total: 2,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useIntentions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('/api/intentions?page=1&limit=20');
    });

    it('deve filtrar por status', async () => {
      const mockData = {
        data: [{ id: '1', name: 'John Doe', status: 'PENDING' }],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useIntentions('PENDING'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(global.fetch).toHaveBeenCalledWith('/api/intentions?status=PENDING&page=1&limit=20');
    });

    it('deve lidar com erro ao buscar intenções', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useIntentions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to fetch intentions');
    });
  });

  describe('useCreateIntention', () => {
    it('deve criar intenção com sucesso', async () => {
      const mockIntention = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123456789',
        message: 'Quero participar',
        status: 'PENDING',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockIntention,
      });

      const { result } = renderHook(() => useCreateIntention(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123456789',
        message: 'Quero participar',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockIntention);
    });

    it('deve lidar com erro de email duplicado', async () => {
      const errorResponse = {
        error: 'DUPLICATE_EMAIL',
        message: 'Você já enviou uma intenção de participação',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => errorResponse,
      });

      const { result } = renderHook(() => useCreateIntention(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123456789',
        message: 'Quero participar',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect((result.current.error as any).code).toBe('DUPLICATE_EMAIL');
    });

    it('deve lidar com erro genérico', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Erro interno' }),
      });

      const { result } = renderHook(() => useCreateIntention(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123456789',
        message: 'Quero participar',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useApproveIntention', () => {
    it('deve aprovar intenção com sucesso', async () => {
      const mockResponse = {
        member: { id: '1', name: 'John Doe' },
        invitation: { token: 'abc123' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useApproveIntention(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        intentionId: '1',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/intentions/approve',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('deve lidar com erro ao aprovar', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useApproveIntention(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        intentionId: '1',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to approve intention');
    });
  });

  describe('useRejectIntention', () => {
    it('deve rejeitar intenção com sucesso', async () => {
      const mockIntention = {
        id: '1',
        status: 'REJECTED',
        rejectionReason: 'Não atende aos critérios',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockIntention,
      });

      const { result } = renderHook(() => useRejectIntention(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        intentionId: '1',
        reason: 'Não atende aos critérios',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockIntention);
    });

    it('deve lidar com erro ao rejeitar', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useRejectIntention(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        intentionId: '1',
        reason: 'Motivo',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to reject intention');
    });
  });

  describe('useIntentionStatus', () => {
    it('deve buscar status da intenção com sucesso', async () => {
      const mockData = {
        intention: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          status: 'PENDING',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useIntentionStatus('john@example.com'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/intentions/status?email=john%40example.com'
      );
    });

    it('não deve buscar quando email é null', async () => {
      const { result } = renderHook(() => useIntentionStatus(null), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('deve lidar com intenção não encontrada (404)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const { result } = renderHook(() => useIntentionStatus('notfound@example.com'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Nenhuma intenção encontrada para este email');
    });

    it('deve lidar com erro genérico', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useIntentionStatus('error@example.com'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to fetch intention status');
    });
  });
});
