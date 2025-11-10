import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateIntentionInput, ApproveIntentionInput, RejectIntentionInput } from '@/lib/validations/intentions';
import { queryKeys } from '@/lib/query-keys';
import { Intention, PaginatedResponse } from '@/lib/types';

const API_URL = '/api/intentions';

export function useIntentions(status?: string, page = 1, limit = 20) {
  return useQuery<PaginatedResponse<Intention>>({
    queryKey: queryKeys.intentions.list({ status, page, limit }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const res = await fetch(`${API_URL}?${params}`);
      if (!res.ok) throw new Error('Failed to fetch intentions');
      return res.json();
    },
  });
}

export function useCreateIntention() {
  const queryClient = useQueryClient();

  return useMutation<Intention, Error, CreateIntentionInput>({
    mutationFn: async (data: CreateIntentionInput) => {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        const error = new Error(errorData.message || 'Failed to create intention');
        (error as any).code = errorData.error;
        throw error;
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.intentions.all });
    },
  });
}

export function useApproveIntention() {
  const queryClient = useQueryClient();

  return useMutation<{ member: any; invitation: any }, Error, ApproveIntentionInput>({
    mutationFn: async (data: ApproveIntentionInput) => {
      const res = await fetch(`${API_URL}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to approve intention');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.intentions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useRejectIntention() {
  const queryClient = useQueryClient();

  return useMutation<Intention, Error, RejectIntentionInput>({
    mutationFn: async (data: RejectIntentionInput) => {
      const res = await fetch(`${API_URL}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to reject intention');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.intentions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useIntentionStatus(email: string | null) {
  return useQuery<{ intention: Intention }>({
    queryKey: queryKeys.intentions.detail(email || ''),
    queryFn: async () => {
      if (!email) throw new Error('Email is required');
      
      const res = await fetch(`${API_URL}/status?email=${encodeURIComponent(email)}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Nenhuma intenção encontrada para este email');
        }
        throw new Error('Failed to fetch intention status');
      }
      return res.json();
    },
    enabled: !!email,
    retry: false,
  });
}
