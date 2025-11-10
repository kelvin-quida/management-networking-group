import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';

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

describe('useProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useProfile', () => {
    it('deve buscar perfil do usuário com sucesso', async () => {
      const mockProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '11999999999',
        company: 'ACME Corp',
        position: 'CEO',
        status: 'ACTIVE',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ member: mockProfile }),
      });

      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockProfile);
      expect(global.fetch).toHaveBeenCalledWith('/api/profile');
    });

    it('deve lidar com erro ao buscar perfil', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useProfile(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to fetch profile');
    });
  });

  describe('useUpdateProfile', () => {
    it('deve atualizar perfil com sucesso', async () => {
      const mockProfile = {
        id: '1',
        name: 'John Doe Updated',
        email: 'john@example.com',
        phone: '11988888888',
        company: 'New Company',
        position: 'CTO',
        status: 'ACTIVE',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ member: mockProfile }),
      });

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        name: 'John Doe Updated',
        phone: '11988888888',
        company: 'New Company',
        position: 'CTO',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockProfile);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/profile',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('deve atualizar apenas campos específicos', async () => {
      const mockProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '11999999999',
        company: 'Updated Company',
        position: 'CEO',
        status: 'ACTIVE',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ member: mockProfile }),
      });

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        company: 'Updated Company',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it('deve lidar com erro ao atualizar perfil', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        name: 'Update',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to update profile');
    });
  });
});
