import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateOneOnOneInput, UpdateOneOnOneInput } from '@/lib/validations/one-on-ones';
import { queryKeys } from '@/lib/query-keys';

const API_URL = '/api/one-on-ones';

export function useOneOnOnes(memberId?: string, status?: string) {
  return useQuery({
    queryKey: queryKeys.oneOnOnes.list({ memberId, status }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (memberId) params.append('memberId', memberId);
      if (status) params.append('status', status);

      const res = await fetch(`${API_URL}?${params}`);
      if (!res.ok) throw new Error('Failed to fetch one-on-ones');
      return res.json();
    },
  });
}

export function useOneOnOne(id: string) {
  return useQuery({
    queryKey: queryKeys.oneOnOnes.detail(id),
    queryFn: async () => {
      const res = await fetch(`${API_URL}/${id}`);
      if (!res.ok) throw new Error('Failed to fetch one-on-one');
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateOneOnOne() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOneOnOneInput) => {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create one-on-one');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.oneOnOnes.all });
    },
  });
}

export function useUpdateOneOnOne(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateOneOnOneInput) => {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update one-on-one');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.oneOnOnes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.oneOnOnes.detail(id) });
    },
  });
}
