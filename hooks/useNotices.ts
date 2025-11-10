import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateNoticeInput, UpdateNoticeInput } from '@/lib/validations/notices';
import { queryKeys } from '@/lib/query-keys';
import { Notice } from '@/lib/types';

const API_URL = '/api/notices';

export function useNotices(type?: string, active?: boolean) {
  return useQuery<Notice[]>({
    queryKey: queryKeys.notices.list({ type, active }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (active !== undefined) params.append('active', active.toString());

      const res = await fetch(`${API_URL}?${params}`);
      if (!res.ok) throw new Error('Failed to fetch notices');
      const data = await res.json();
      return data.notices || [];
    },
  });
}

export function useNotice(id: string) {
  return useQuery<Notice>({
    queryKey: queryKeys.notices.detail(id),
    queryFn: async () => {
      const res = await fetch(`${API_URL}/${id}`);
      if (!res.ok) throw new Error('Failed to fetch notice');
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateNotice() {
  const queryClient = useQueryClient();

  return useMutation<Notice, Error, CreateNoticeInput>({
    mutationFn: async (data: CreateNoticeInput) => {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create notice');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notices.all });
    },
  });
}

export function useUpdateNotice(id: string) {
  const queryClient = useQueryClient();

  return useMutation<Notice, Error, UpdateNoticeInput>({
    mutationFn: async (data: UpdateNoticeInput) => {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update notice');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notices.detail(id) });
    },
  });
}

export function useDeleteNotice() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '',
        },
      });
      if (!res.ok) throw new Error('Failed to delete notice');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notices.all });
    },
  });
}
