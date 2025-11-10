import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  useMeetings, 
  useMeeting, 
  useCreateMeeting, 
  useUpdateMeeting, 
  useDeleteMeeting,
  useCheckIn 
} from '@/hooks/useMeetings';

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

describe('useMeetings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useMeetings', () => {
    it('deve buscar lista de reuniões com sucesso', async () => {
      const mockData = {
        meetings: [
          { id: '1', title: 'Reunião 1', date: '2024-01-15T10:00:00Z', location: 'Sala 1' },
          { id: '2', title: 'Reunião 2', date: '2024-01-20T14:00:00Z', location: 'Sala 2' },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useMeetings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData.meetings);
      expect(global.fetch).toHaveBeenCalledWith('/api/meetings?');
    });

    it('deve filtrar por data inicial (from)', async () => {
      const mockData = { meetings: [] };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useMeetings('2024-01-01'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(global.fetch).toHaveBeenCalledWith('/api/meetings?from=2024-01-01');
    });

    it('deve filtrar por data final (to)', async () => {
      const mockData = { meetings: [] };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useMeetings(undefined, '2024-12-31'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(global.fetch).toHaveBeenCalledWith('/api/meetings?to=2024-12-31');
    });

    it('deve filtrar por intervalo de datas', async () => {
      const mockData = { meetings: [] };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useMeetings('2024-01-01', '2024-12-31'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(global.fetch).toHaveBeenCalledWith('/api/meetings?from=2024-01-01&to=2024-12-31');
    });

    it('deve retornar array vazio quando meetings é undefined', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useMeetings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);
    });

    it('deve lidar com erro ao buscar reuniões', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useMeetings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to fetch meetings');
    });
  });

  describe('useMeeting', () => {
    it('deve buscar reunião específica com sucesso', async () => {
      const mockMeeting = {
        id: '1',
        title: 'Reunião Importante',
        date: '2024-01-15T10:00:00Z',
        location: 'Sala 1',
        attendances: [
          { id: 'att1', memberId: 'member1', member: { name: 'John' } },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMeeting,
      });

      const { result } = renderHook(() => useMeeting('1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockMeeting);
      expect(global.fetch).toHaveBeenCalledWith('/api/meetings/1');
    });

    it('não deve buscar quando id está vazio', async () => {
      const { result } = renderHook(() => useMeeting(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('deve lidar com erro ao buscar reunião', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useMeeting('1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to fetch meeting');
    });
  });

  describe('useCreateMeeting', () => {
    it('deve criar reunião com sucesso', async () => {
      const mockMeeting = {
        id: '1',
        title: 'Nova Reunião',
        date: '2024-02-01T10:00:00Z',
        location: 'Sala Virtual',
        description: 'Reunião mensal',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMeeting,
      });

      const { result } = renderHook(() => useCreateMeeting(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        title: 'Nova Reunião',
        date: '2024-02-01T10:00:00Z',
        type: 'REGULAR',
        location: 'Sala Virtual',
        description: 'Reunião mensal',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockMeeting);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/meetings',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('deve lidar com erro ao criar reunião', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useCreateMeeting(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        title: 'Reunião',
        date: '2024-02-01T10:00:00Z',
        type: 'REGULAR',
        location: 'Local',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to create meeting');
    });
  });

  describe('useUpdateMeeting', () => {
    it('deve atualizar reunião com sucesso', async () => {
      const mockMeeting = {
        id: '1',
        title: 'Reunião Atualizada',
        date: '2024-02-01T14:00:00Z',
        location: 'Nova Sala',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMeeting,
      });

      const { result } = renderHook(() => useUpdateMeeting('1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        title: 'Reunião Atualizada',
        location: 'Nova Sala',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockMeeting);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/meetings/1',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('deve lidar com erro ao atualizar reunião', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useUpdateMeeting('1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        title: 'Atualização',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to update meeting');
    });
  });

  describe('useDeleteMeeting', () => {
    it('deve deletar reunião com sucesso', async () => {
      const mockResponse = { success: true };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const { result } = renderHook(() => useDeleteMeeting(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/meetings/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('deve lidar com erro ao deletar reunião', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useDeleteMeeting(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('1');

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to delete meeting');
    });
  });

  describe('useCheckIn', () => {
    it('deve fazer check-in com sucesso', async () => {
      const mockAttendance = {
        id: 'att1',
        meetingId: 'meeting1',
        memberId: 'member1',
        checkedInAt: '2024-01-15T10:05:00Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAttendance,
      });

      const { result } = renderHook(() => useCheckIn('meeting1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        memberId: 'member1',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockAttendance);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/meetings/meeting1/check-in',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('deve lidar com erro ao fazer check-in', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useCheckIn('meeting1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        memberId: 'member1',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to check-in');
    });
  });
});
