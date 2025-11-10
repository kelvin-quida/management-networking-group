import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateMeetingInput, UpdateMeetingInput, CheckInInput } from '@/lib/validations/meetings';
import { queryKeys } from '@/lib/query-keys';
import { Meeting, MeetingWithAttendances, Attendance } from '@/lib/types';

const API_URL = '/api/meetings';

export function useMeetings(from?: string, to?: string) {
  return useQuery<Meeting[]>({
    queryKey: queryKeys.meetings.list({ from, to }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);

      const res = await fetch(`${API_URL}?${params}`);
      if (!res.ok) throw new Error('Failed to fetch meetings');
      const data = await res.json();
      return data.meetings || [];
    },
  });
}

export function useMeeting(id: string) {
  return useQuery<MeetingWithAttendances>({
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

  return useMutation<Meeting, Error, CreateMeetingInput>({
    mutationFn: async (data: CreateMeetingInput) => {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create meeting');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useUpdateMeeting(id: string) {
  const queryClient = useQueryClient();

  return useMutation<Meeting, Error, UpdateMeetingInput>({
    mutationFn: async (data: UpdateMeetingInput) => {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
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

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete meeting');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useCheckIn(meetingId: string) {
  const queryClient = useQueryClient();

  return useMutation<Attendance, Error, CheckInInput>({
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
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
