import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  useMemberships, 
  useCreateMembership, 
  usePayMembership 
} from '@/hooks/useMemberships';

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

describe('useMemberships', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useMemberships', () => {
    it('deve buscar lista de mensalidades com sucesso', async () => {
      const mockData = {
        memberships: [
          {
            id: '1',
            memberId: 'member1',
            dueDate: '2024-12-31',
            amount: 100,
            status: 'PENDING',
            member: { id: 'member1', name: 'John Doe', email: 'john@example.com' },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useMemberships(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData.memberships);
      expect(global.fetch).toHaveBeenCalledWith('/api/memberships?');
    });

    it('deve filtrar por memberId', async () => {
      const mockData = { memberships: [] };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useMemberships('member123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(global.fetch).toHaveBeenCalledWith('/api/memberships?memberId=member123');
    });

    it('deve filtrar por status', async () => {
      const mockData = { memberships: [] };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useMemberships(undefined, 'PAID'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(global.fetch).toHaveBeenCalledWith('/api/memberships?status=PAID');
    });

    it('deve filtrar por memberId e status', async () => {
      const mockData = { memberships: [] };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useMemberships('member123', 'PENDING'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(global.fetch).toHaveBeenCalledWith('/api/memberships?memberId=member123&status=PENDING');
    });

    it('deve retornar array vazio quando memberships é undefined', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useMemberships(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);
    });

    it('deve lidar com erro ao buscar mensalidades', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useMemberships(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to fetch memberships');
    });
  });

  describe('useCreateMembership', () => {
    it('deve criar mensalidade com sucesso', async () => {
      const mockMembership = {
        id: '1',
        memberId: 'member1',
        dueDate: '2024-12-31',
        amount: 100,
        status: 'PENDING',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMembership,
      });

      const { result } = renderHook(() => useCreateMembership(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        memberId: 'member1',
        dueDate: '2024-12-31',
        amount: 100,
        notes: 'Mensalidade de dezembro',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockMembership);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/memberships',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('deve criar mensalidade sem notas', async () => {
      const mockMembership = {
        id: '2',
        memberId: 'member2',
        dueDate: '2024-11-30',
        amount: 150,
        status: 'PENDING',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMembership,
      });

      const { result } = renderHook(() => useCreateMembership(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        memberId: 'member2',
        dueDate: '2024-11-30',
        amount: 150,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it('deve lidar com erro ao criar mensalidade', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useCreateMembership(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        memberId: 'member1',
        dueDate: '2024-12-31',
        amount: 100,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to create membership');
    });
  });

  describe('usePayMembership', () => {
    it('deve pagar mensalidade com sucesso', async () => {
      const mockMembership = {
        id: '1',
        status: 'PAID',
        paidAt: '2024-01-15T10:00:00Z',
        paymentMethod: 'PIX',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMembership,
      });

      const { result } = renderHook(() => usePayMembership('1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        paidAt: '2024-01-15T10:00:00Z',
        paymentMethod: 'PIX',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockMembership);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/memberships/1/pay',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('deve pagar mensalidade com diferentes métodos de pagamento', async () => {
      const mockMembership = {
        id: '2',
        status: 'PAID',
        paidAt: '2024-01-15T10:00:00Z',
        paymentMethod: 'CREDIT_CARD',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMembership,
      });

      const { result } = renderHook(() => usePayMembership('2'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        paidAt: '2024-01-15T10:00:00Z',
        paymentMethod: 'CREDIT_CARD',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it('deve lidar com erro ao pagar mensalidade', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => usePayMembership('1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        paidAt: '2024-01-15T10:00:00Z',
        paymentMethod: 'PIX',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to pay membership');
    });
  });
});
