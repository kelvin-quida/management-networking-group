import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  useMembers, 
  useMember, 
  useUpdateMember, 
  useDeleteMember 
} from '@/hooks/useMembers';

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

describe('useMembers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useMembers', () => {
    it('deve buscar lista de membros com sucesso', async () => {
      const mockData = {
        data: [
          { id: '1', name: 'John Doe', email: 'john@example.com', status: 'ACTIVE' },
          { id: '2', name: 'Jane Doe', email: 'jane@example.com', status: 'ACTIVE' },
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

      const { result } = renderHook(() => useMembers(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith('/api/members?page=1&limit=20');
    });

    it('deve filtrar por status', async () => {
      const mockData = {
        data: [{ id: '1', name: 'John Doe', status: 'ACTIVE' }],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useMembers('ACTIVE'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(global.fetch).toHaveBeenCalledWith('/api/members?status=ACTIVE&page=1&limit=20');
    });

    it('deve lidar com erro ao buscar membros', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useMembers(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to fetch members');
    });
  });

  describe('useMember', () => {
    it('deve buscar membro específico com sucesso', async () => {
      const mockMember = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        status: 'ACTIVE',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ member: mockMember }),
      });

      const { result } = renderHook(() => useMember('1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockMember);
      expect(global.fetch).toHaveBeenCalledWith('/api/members/1');
    });

    it('não deve buscar quando id está vazio', async () => {
      const { result } = renderHook(() => useMember(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('deve lidar com erro ao buscar membro', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useMember('1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to fetch member');
    });
  });

  describe('useUpdateMember', () => {
    it('deve atualizar membro com sucesso', async () => {
      const mockMember = {
        id: '1',
        name: 'John Updated',
        email: 'john@example.com',
        status: 'ACTIVE',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ member: mockMember }),
      });

      const { result } = renderHook(() => useUpdateMember('1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        name: 'John Updated',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockMember);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/members/1',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('deve lidar com erro ao atualizar membro', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useUpdateMember('1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        name: 'Update',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to update member');
    });
  });

  describe('useDeleteMember', () => {
    it('deve deletar membro com sucesso', async () => {
      const mockResponse = { success: true };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useDeleteMember(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/members/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('deve lidar com erro ao deletar membro', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useDeleteMember(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('1');

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to delete member');
    });
  });
});
