import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAttendances, useAttendanceStats } from '@/hooks/useAttendances';

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

describe('useAttendances', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useAttendances', () => {
    it('deve buscar lista de presenças com sucesso', async () => {
      const mockData = {
        attendances: [
          {
            id: '1',
            meetingId: 'meeting1',
            memberId: 'member1',
            checkedInAt: '2024-01-15T10:00:00Z',
            meeting: { title: 'Reunião 1' },
            member: { name: 'John Doe' },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useAttendances(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData.attendances);
      expect(global.fetch).toHaveBeenCalledWith('/api/attendances?');
    });

    it('deve filtrar por memberId', async () => {
      const mockData = { attendances: [] };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useAttendances('member123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(global.fetch).toHaveBeenCalledWith('/api/attendances?memberId=member123');
    });

    it('deve filtrar por meetingId', async () => {
      const mockData = { attendances: [] };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useAttendances(undefined, 'meeting456'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(global.fetch).toHaveBeenCalledWith('/api/attendances?meetingId=meeting456');
    });

    it('deve filtrar por memberId e meetingId', async () => {
      const mockData = { attendances: [] };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useAttendances('member123', 'meeting456'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(global.fetch).toHaveBeenCalledWith('/api/attendances?memberId=member123&meetingId=meeting456');
    });

    it('deve retornar array vazio quando attendances é undefined', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useAttendances(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);
    });

    it('deve lidar com erro ao buscar presenças', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useAttendances(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to fetch attendances');
    });
  });

  describe('useAttendanceStats', () => {
    it('deve buscar estatísticas de presença com sucesso', async () => {
      const mockStats = {
        total: 15,
        percentage: 75,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      });

      const { result } = renderHook(() => useAttendanceStats('member123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockStats);
      expect(global.fetch).toHaveBeenCalledWith('/api/attendances/stats?memberId=member123');
    });

    it('deve incluir período nas estatísticas', async () => {
      const mockStats = {
        total: 10,
        percentage: 80,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      });

      const { result } = renderHook(() => useAttendanceStats('member123', '2024-01'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(global.fetch).toHaveBeenCalledWith('/api/attendances/stats?memberId=member123&period=2024-01');
    });

    it('não deve buscar quando memberId está vazio', async () => {
      const { result } = renderHook(() => useAttendanceStats(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('deve lidar com erro ao buscar estatísticas', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useAttendanceStats('member123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to fetch attendance stats');
    });
  });
});
