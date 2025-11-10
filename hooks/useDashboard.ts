import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

export type MemberDashboard = {
  attendanceRate: number;
  totalMeetings: number;
  upcomingMeetings: number;
  thanksReceived: number;
  thanksGiven: number;
};

export type GroupDashboard = {
  stats: {
    totalMembers: number;
    activeMembers: number;
    totalMeetings: number;
    upcomingMeetings: number;
    averageAttendance?: number;
    totalReferrals?: number;
    closedReferrals?: number;
    totalBusinessGenerated?: number;
    monthlyGrowth?: number;
    totalThanks?: number;
    monthlyThanks?: number;
  };
  topPerformers?: Array<{
    member: {
      id: string;
      name: string;
    };
    referralsClosed: number;
    businessGenerated: number;
  }>;
  recentActivity?: any[];
};

export type Reports = {
  period: string;
  data: any[];
};

export function useMemberDashboard(memberId: string) {
  return useQuery<MemberDashboard>({
    queryKey: queryKeys.dashboard.member(memberId),
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/member/${memberId}`);
      if (!res.ok) throw new Error('Failed to fetch member dashboard');
      return res.json();
    },
    enabled: !!memberId,
  });
}

export function useGroupDashboard() {
  return useQuery<GroupDashboard>({
    queryKey: queryKeys.dashboard.group(),
    queryFn: async () => {
      const res = await fetch('/api/dashboard/group');
      if (!res.ok) throw new Error('Failed to fetch group dashboard');
      return res.json();
    },
  });
}

export function useReports(period?: string, from?: string, to?: string) {
  return useQuery<Reports>({
    queryKey: queryKeys.dashboard.reports({ period, from, to }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      if (from) params.append('from', from);
      if (to) params.append('to', to);

      const res = await fetch(`/api/dashboard/reports?${params}`);
      if (!res.ok) throw new Error('Failed to fetch reports');
      return res.json();
    },
  });
}
