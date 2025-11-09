import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { AttendanceWithRelations } from '@/lib/types';

const API_URL = '/api/attendances';

export function useAttendances(memberId?: string, meetingId?: string) {
  return useQuery<AttendanceWithRelations[]>({
    queryKey: queryKeys.attendances.list({ memberId, meetingId }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (memberId) params.append('memberId', memberId);
      if (meetingId) params.append('meetingId', meetingId);

      const res = await fetch(`${API_URL}?${params}`);
      if (!res.ok) throw new Error('Failed to fetch attendances');
      return res.json();
    },
  });
}

export function useAttendanceStats(memberId: string, period?: string) {
  return useQuery<{ total: number; percentage: number }>({
    queryKey: queryKeys.attendances.stat(memberId, period),
    queryFn: async () => {
      const params = new URLSearchParams({ memberId });
      if (period) params.append('period', period);

      const res = await fetch(`${API_URL}/stats?${params}`);
      if (!res.ok) throw new Error('Failed to fetch attendance stats');
      return res.json();
    },
    enabled: !!memberId,
  });
}
