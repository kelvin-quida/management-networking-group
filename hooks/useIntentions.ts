import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateIntentionInput, ApproveIntentionInput, RejectIntentionInput } from '@/lib/validations/intentions';
import { queryKeys } from '@/lib/query-keys';

const API_URL = '/api/intentions';

export function useIntentions(status?: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.intentions.list({ status, page, limit }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const res = await fetch(`${API_URL}?${params}`, {
        headers: {
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch intentions');
      return res.json();
    },
  });
}

export function useCreateIntention() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateIntentionInput) => {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create intention');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.intentions.all });
    },
  });
}

export function useApproveIntention() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ApproveIntentionInput) => {
      const res = await fetch(`${API_URL}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to approve intention');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.intentions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
    },
  });
}

export function useRejectIntention() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RejectIntentionInput) => {
      const res = await fetch(`${API_URL}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to reject intention');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.intentions.all });
    },
  });
}
