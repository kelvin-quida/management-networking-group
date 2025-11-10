import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  useOneOnOnes, 
  useOneOnOne, 
  useCreateOneOnOne, 
  useUpdateOneOnOne 
} from '@/hooks/useOneOnOnes';

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

describe('useOneOnOnes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useOneOnOnes', () => {
    it('deve buscar lista de reuniões 1:1 com sucesso', async () => {
      const mockData = {
        oneOnOnes: [
          {
            id: '1',
            hostId: 'member1',
            guestId: 'member2',
            scheduledAt: '2024-02-01T10:00:00Z',
            status: 'SCHEDULED',
            host: { id: 'member1', name: 'John' },
            guest: { id: 'member2', name: 'Jane' },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useOneOnOnes(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData.oneOnOnes);
      expect(global.fetch).toHaveBeenCalledWith('/api/one-on-ones?');
    });

    it('deve filtrar por memberId', async () => {
      const mockData = { oneOnOnes: [] };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useOneOnOnes('member123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(global.fetch).toHaveBeenCalledWith('/api/one-on-ones?memberId=member123');
    });

    it('deve filtrar por status', async () => {
      const mockData = { oneOnOnes: [] };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useOneOnOnes(undefined, 'COMPLETED'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(global.fetch).toHaveBeenCalledWith('/api/one-on-ones?status=COMPLETED');
    });

    it('deve filtrar por memberId e status', async () => {
      const mockData = { oneOnOnes: [] };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useOneOnOnes('member123', 'SCHEDULED'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(global.fetch).toHaveBeenCalledWith('/api/one-on-ones?memberId=member123&status=SCHEDULED');
    });

    it('deve retornar array vazio quando oneOnOnes é undefined', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useOneOnOnes(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);
    });

    it('deve lidar com erro ao buscar reuniões 1:1', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useOneOnOnes(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to fetch one-on-ones');
    });
  });

  describe('useOneOnOne', () => {
    it('deve buscar reunião 1:1 específica com sucesso', async () => {
      const mockOneOnOne = {
        id: '1',
        hostId: 'member1',
        guestId: 'member2',
        scheduledAt: '2024-02-01T10:00:00Z',
        status: 'SCHEDULED',
        notes: 'Discutir parceria',
        host: { id: 'member1', name: 'John' },
        guest: { id: 'member2', name: 'Jane' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOneOnOne,
      });

      const { result } = renderHook(() => useOneOnOne('1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockOneOnOne);
      expect(global.fetch).toHaveBeenCalledWith('/api/one-on-ones/1');
    });

    it('não deve buscar quando id está vazio', async () => {
      const { result } = renderHook(() => useOneOnOne(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('deve lidar com erro ao buscar reunião 1:1', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useOneOnOne('1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to fetch one-on-one');
    });
  });

  describe('useCreateOneOnOne', () => {
    it('deve criar reunião 1:1 com sucesso', async () => {
      const mockOneOnOne = {
        id: '1',
        hostId: 'member1',
        guestId: 'member2',
        scheduledAt: '2024-02-01T10:00:00Z',
        status: 'SCHEDULED',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOneOnOne,
      });

      const { result } = renderHook(() => useCreateOneOnOne(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        hostId: 'member1',
        guestId: 'member2',
        scheduledAt: '2024-02-01T10:00:00Z',
        notes: 'Discutir projeto',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockOneOnOne);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/one-on-ones',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('deve lidar com erro ao criar reunião 1:1', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useCreateOneOnOne(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        hostId: 'member1',
        guestId: 'member2',
        scheduledAt: '2024-02-01T10:00:00Z',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to create one-on-one');
    });
  });

  describe('useUpdateOneOnOne', () => {
    it('deve atualizar reunião 1:1 com sucesso', async () => {
      const mockOneOnOne = {
        id: '1',
        status: 'COMPLETED',
        completedAt: '2024-02-01T11:00:00Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOneOnOne,
      });

      const { result } = renderHook(() => useUpdateOneOnOne('1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        status: 'COMPLETED',
        completedAt: '2024-02-01T11:00:00Z',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockOneOnOne);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/one-on-ones/1',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('deve cancelar reunião 1:1', async () => {
      const mockOneOnOne = {
        id: '1',
        status: 'CANCELLED',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockOneOnOne,
      });

      const { result } = renderHook(() => useUpdateOneOnOne('1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        status: 'CANCELLED',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockOneOnOne);
    });

    it('deve lidar com erro ao atualizar reunião 1:1', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useUpdateOneOnOne('1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        status: 'COMPLETED',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to update one-on-one');
    });
  });
});
