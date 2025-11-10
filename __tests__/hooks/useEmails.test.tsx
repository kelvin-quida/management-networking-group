import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEmails } from '@/hooks/useEmails';

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

describe('useEmails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve buscar lista de emails com sucesso', async () => {
    const mockData = {
      emails: [
        {
          id: '1',
          to: 'john@example.com',
          subject: 'Bem-vindo ao grupo',
          status: 'SENT',
          sentAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          to: 'jane@example.com',
          subject: 'Convite para reunião',
          status: 'SENT',
          sentAt: '2024-01-16T10:00:00Z',
        },
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useEmails(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockData.emails);
    expect(global.fetch).toHaveBeenCalledWith('/api/emails?limit=50');
  });

  it('deve buscar emails com limite customizado', async () => {
    const mockData = { emails: [] };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useEmails(10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(global.fetch).toHaveBeenCalledWith('/api/emails?limit=10');
  });

  it('deve retornar array vazio quando emails é undefined', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useEmails(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it('deve lidar com erro ao buscar emails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    const { result } = renderHook(() => useEmails(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Failed to fetch emails');
  });

  it('deve buscar com limite de 100 emails', async () => {
    const mockData = { emails: [] };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useEmails(100), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(global.fetch).toHaveBeenCalledWith('/api/emails?limit=100');
  });
});
