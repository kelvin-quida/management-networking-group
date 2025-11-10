import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  useMemberDashboard, 
  useGroupDashboard, 
  useReports 
} from '@/hooks/useDashboard';

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

describe('useDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useMemberDashboard', () => {
    it('deve buscar dashboard do membro com sucesso', async () => {
      const mockDashboard = {
        attendanceRate: 85,
        totalMeetings: 20,
        upcomingMeetings: 3,
        thanksReceived: 5,
        thanksGiven: 8,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboard,
      });

      const { result } = renderHook(() => useMemberDashboard('member123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockDashboard);
      expect(global.fetch).toHaveBeenCalledWith('/api/dashboard/member/member123');
    });

    it('não deve buscar quando memberId está vazio', async () => {
      const { result } = renderHook(() => useMemberDashboard(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('deve lidar com erro ao buscar dashboard do membro', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useMemberDashboard('member123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to fetch member dashboard');
    });
  });

  describe('useGroupDashboard', () => {
    it('deve buscar dashboard do grupo com sucesso', async () => {
      const mockDashboard = {
        stats: {
          totalMembers: 50,
          activeMembers: 45,
          totalMeetings: 100,
          upcomingMeetings: 5,
          averageAttendance: 82.5,
          totalReferrals: 30,
          closedReferrals: 20,
          totalBusinessGenerated: 150000,
          monthlyGrowth: 12.5,
          totalThanks: 120,
          monthlyThanks: 15,
        },
        topPerformers: [
          {
            member: { id: '1', name: 'John Doe' },
            referralsClosed: 10,
            businessGenerated: 50000,
          },
        ],
        recentActivity: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboard,
      });

      const { result } = renderHook(() => useGroupDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockDashboard);
      expect(global.fetch).toHaveBeenCalledWith('/api/dashboard/group');
    });

    it('deve buscar dashboard sem top performers', async () => {
      const mockDashboard = {
        stats: {
          totalMembers: 10,
          activeMembers: 8,
          totalMeetings: 20,
          upcomingMeetings: 2,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboard,
      });

      const { result } = renderHook(() => useGroupDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.topPerformers).toBeUndefined();
    });

    it('deve lidar com erro ao buscar dashboard do grupo', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useGroupDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to fetch group dashboard');
    });
  });

  describe('useReports', () => {
    it('deve buscar relatórios sem filtros', async () => {
      const mockReports = {
        period: 'monthly',
        data: [
          { month: 'Janeiro', value: 100 },
          { month: 'Fevereiro', value: 150 },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockReports,
      });

      const { result } = renderHook(() => useReports(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockReports);
      expect(global.fetch).toHaveBeenCalledWith('/api/dashboard/reports?');
    });

    it('deve buscar relatórios com período', async () => {
      const mockReports = {
        period: 'weekly',
        data: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockReports,
      });

      const { result } = renderHook(() => useReports('weekly'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(global.fetch).toHaveBeenCalledWith('/api/dashboard/reports?period=weekly');
    });

    it('deve buscar relatórios com intervalo de datas', async () => {
      const mockReports = {
        period: 'custom',
        data: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockReports,
      });

      const { result } = renderHook(() => useReports(undefined, '2024-01-01', '2024-12-31'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(global.fetch).toHaveBeenCalledWith('/api/dashboard/reports?from=2024-01-01&to=2024-12-31');
    });

    it('deve buscar relatórios com todos os filtros', async () => {
      const mockReports = {
        period: 'monthly',
        data: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockReports,
      });

      const { result } = renderHook(() => useReports('monthly', '2024-01-01', '2024-12-31'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(global.fetch).toHaveBeenCalledWith('/api/dashboard/reports?period=monthly&from=2024-01-01&to=2024-12-31');
    });

    it('deve lidar com erro ao buscar relatórios', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useReports(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Failed to fetch reports');
    });
  });
});
