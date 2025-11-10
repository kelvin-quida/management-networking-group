import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useThanks, useThank, useCreateThank, useDeleteThank } from '@/hooks/useThanks';

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

describe('useThanks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useThanks', () => {
    it('deve buscar lista de agradecimentos com sucesso', async () => {
      const mockData = {
        thanks: [
          {
            id: '1',
            message: 'Obrigado pela indicação',
            value: 1000,
            fromMember: { id: '1', name: 'John' },
            toMember: { id: '2', name: 'Jane' },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useThanks(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData.thanks);
      expect(global.fetch).toHaveBeenCalledWith('/api/thanks?');
    });

    it('deve filtrar por memberId', async () => {
      const mockData = { thanks: [] };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useThanks('member123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(global.fetch).toHaveBeenCalledWith('/api/thanks?memberId=member123');
    });

    it('deve retornar array vazio quando thanks é undefined', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useThanks(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);
    });

    it('deve lidar com erro ao buscar agradecimentos', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useThanks(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to fetch thanks');
    });
  });

  describe('useThank', () => {
    it('deve buscar agradecimento específico com sucesso', async () => {
      const mockThank = {
        id: '1',
        message: 'Obrigado',
        value: 500,
        fromMember: { id: '1', name: 'John' },
        toMember: { id: '2', name: 'Jane' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockThank,
      });

      const { result } = renderHook(() => useThank('1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockThank);
      expect(global.fetch).toHaveBeenCalledWith('/api/thanks/1');
    });

    it('não deve buscar quando id está vazio', async () => {
      const { result } = renderHook(() => useThank(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('deve lidar com erro ao buscar agradecimento', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useThank('1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to fetch thank');
    });
  });

  describe('useCreateThank', () => {
    it('deve criar agradecimento com sucesso', async () => {
      const mockThank = {
        id: '1',
        message: 'Obrigado pela indicação',
        value: 1000,
        fromMember: { id: '1', name: 'John' },
        toMember: { id: '2', name: 'Jane' },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockThank,
      });

      const { result } = renderHook(() => useCreateThank(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        fromMemberId: '1',
        toMemberId: '2',
        message: 'Obrigado pela indicação',
        value: 1000,
        isPublic: true,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockThank);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/thanks',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('deve lidar com erro ao criar agradecimento', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useCreateThank(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        fromMemberId: '1',
        toMemberId: '2',
        message: 'Obrigado',
        value: 500,
        isPublic: true,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to create thank');
    });
  });

  describe('useDeleteThank', () => {
    it('deve deletar agradecimento com sucesso', async () => {
      const mockResponse = { success: true };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useDeleteThank(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/thanks/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('deve lidar com erro ao deletar agradecimento', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useDeleteThank(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('1');

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to delete thank');
    });
  });
});
