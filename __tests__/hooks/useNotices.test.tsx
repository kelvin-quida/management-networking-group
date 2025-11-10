import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  useNotices, 
  useNotice, 
  useCreateNotice, 
  useUpdateNotice, 
  useDeleteNotice 
} from '@/hooks/useNotices';

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

describe('useNotices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useNotices', () => {
    it('deve buscar lista de avisos com sucesso', async () => {
      const mockData = {
        notices: [
          { id: '1', title: 'Aviso 1', content: 'Conteúdo 1', type: 'INFO', priority: 'NORMAL' },
          { id: '2', title: 'Aviso 2', content: 'Conteúdo 2', type: 'URGENT', priority: 'HIGH' },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useNotices(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData.notices);
      expect(global.fetch).toHaveBeenCalledWith('/api/notices?');
    });

    it('deve filtrar por tipo', async () => {
      const mockData = { notices: [] };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useNotices('URGENT'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(global.fetch).toHaveBeenCalledWith('/api/notices?type=URGENT');
    });

    it('deve filtrar por status ativo', async () => {
      const mockData = { notices: [] };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useNotices(undefined, true), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(global.fetch).toHaveBeenCalledWith('/api/notices?active=true');
    });

    it('deve filtrar por tipo e status ativo', async () => {
      const mockData = { notices: [] };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useNotices('EVENT', false), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(global.fetch).toHaveBeenCalledWith('/api/notices?type=EVENT&active=false');
    });

    it('deve retornar array vazio quando notices é undefined', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useNotices(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);
    });

    it('deve lidar com erro ao buscar avisos', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useNotices(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to fetch notices');
    });
  });

  describe('useNotice', () => {
    it('deve buscar aviso específico com sucesso', async () => {
      const mockNotice = {
        id: '1',
        title: 'Aviso Importante',
        content: 'Conteúdo detalhado',
        type: 'WARNING',
        priority: 'HIGH',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotice,
      });

      const { result } = renderHook(() => useNotice('1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockNotice);
      expect(global.fetch).toHaveBeenCalledWith('/api/notices/1');
    });

    it('não deve buscar quando id está vazio', async () => {
      const { result } = renderHook(() => useNotice(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('deve lidar com erro ao buscar aviso', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useNotice('1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to fetch notice');
    });
  });

  describe('useCreateNotice', () => {
    it('deve criar aviso com sucesso', async () => {
      const mockNotice = {
        id: '1',
        title: 'Novo Aviso',
        content: 'Conteúdo do aviso',
        type: 'INFO',
        priority: 'NORMAL',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotice,
      });

      const { result } = renderHook(() => useCreateNotice(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        title: 'Novo Aviso',
        content: 'Conteúdo do aviso',
        type: 'INFO',
        priority: 'NORMAL',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockNotice);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/notices',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('deve lidar com erro ao criar aviso', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useCreateNotice(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        title: 'Aviso',
        content: 'Conteúdo',
        type: 'INFO',
        priority: 'NORMAL',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to create notice');
    });
  });

  describe('useUpdateNotice', () => {
    it('deve atualizar aviso com sucesso', async () => {
      const mockNotice = {
        id: '1',
        title: 'Aviso Atualizado',
        content: 'Conteúdo atualizado',
        type: 'WARNING',
        priority: 'HIGH',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotice,
      });

      const { result } = renderHook(() => useUpdateNotice('1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        title: 'Aviso Atualizado',
        content: 'Conteúdo atualizado',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockNotice);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/notices/1',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('deve atualizar apenas campos específicos', async () => {
      const mockNotice = {
        id: '1',
        title: 'Título Original',
        content: 'Conteúdo atualizado',
        type: 'INFO',
        priority: 'NORMAL',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotice,
      });

      const { result } = renderHook(() => useUpdateNotice('1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        content: 'Conteúdo atualizado',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it('deve lidar com erro ao atualizar aviso', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useUpdateNotice('1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        title: 'Atualização',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to update notice');
    });
  });

  describe('useDeleteNotice', () => {
    it('deve deletar aviso com sucesso', async () => {
      const mockResponse = { success: true };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useDeleteNotice(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/notices/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('deve lidar com erro ao deletar aviso', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useDeleteNotice(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('1');

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to delete notice');
    });
  });
});
