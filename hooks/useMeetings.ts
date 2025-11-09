import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateMeetingInput, UpdateMeetingInput, CheckInInput } from '@/lib/validations/meetings';
import { queryKeys } from '@/lib/query-keys';

const API_URL = '/api/meetings';

export function useMeetings(from?: string, to?: string) {
  return useQuery({
    queryKey: queryKeys.meetings.list({ from, to }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);

      const res = await fetch(`${API_URL}?${params}`);
      if (!res.ok) throw new Error('Failed to fetch meetings');
      return res.json();
    },
  });
}

export function useMeeting(id: string) {
  return useQuery({
    queryKey: queryKeys.meetings.detail(id),
    queryFn: async () => {
      const res = await fetch(`${API_URL}/${id}`);
      if (!res.ok) throw new Error('Failed to fetch meeting');
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMeetingInput) => {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create meeting');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all });
    },
  });
}

export function useUpdateMeeting(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateMeetingInput) => {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update meeting');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.detail(id) });
    },
  });
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '',
        },
      });
      if (!res.ok) throw new Error('Failed to delete meeting');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all });
    },
  });
}

export function useCheckIn(meetingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CheckInInput) => {
      const res = await fetch(`${API_URL}/${meetingId}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to check-in');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.detail(meetingId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.attendances.all });
    },
  });
}
