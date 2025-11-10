import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateThankInput } from '@/lib/validations/thanks';
import { queryKeys } from '@/lib/query-keys';
import { ThankWithMembers } from '@/lib/types';

const API_URL = '/api/thanks';

export function useThanks(memberId?: string) {
  return useQuery<ThankWithMembers[]>({
    queryKey: queryKeys.thanks.list({ memberId }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (memberId) params.append('memberId', memberId);

      const res = await fetch(`${API_URL}?${params}`);
      if (!res.ok) throw new Error('Failed to fetch thanks');
      const data = await res.json();
      return data.thanks || [];
    },
  });
}

export function useThank(id: string) {
  return useQuery<ThankWithMembers>({
    queryKey: queryKeys.thanks.detail(id),
    queryFn: async () => {
      const res = await fetch(`${API_URL}/${id}`);
      if (!res.ok) throw new Error('Failed to fetch thank');
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateThank() {
  const queryClient = useQueryClient();

  return useMutation<ThankWithMembers, Error, CreateThankInput>({
    mutationFn: async (data: CreateThankInput) => {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create thank');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.thanks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useDeleteThank() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete thank');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.thanks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
