import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RegisterMemberInput, UpdateMemberInput } from '@/lib/validations/members';
import { queryKeys } from '@/lib/query-keys';
import { Member, PaginatedResponse } from '@/lib/types';

const API_URL = '/api/members';

export function useMembers(status?: string, page = 1, limit = 20) {
  return useQuery<PaginatedResponse<Member>>({
    queryKey: queryKeys.members.list({ status, page, limit }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const res = await fetch(`${API_URL}?${params}`);
      if (!res.ok) throw new Error('Failed to fetch members');
      return res.json();
    },
  });
}

export function useMember(id: string) {
  return useQuery<Member>({
    queryKey: queryKeys.members.detail(id),
    queryFn: async () => {
      const res = await fetch(`${API_URL}/${id}`);
      if (!res.ok) throw new Error('Failed to fetch member');
      const data = await res.json();
      return data.member;
    },
    enabled: !!id,
  });
}

export function useValidateToken(token: string) {
  return useQuery<{ valid: boolean; member?: Member }>({
    queryKey: queryKeys.members.validateToken(token),
    queryFn: async () => {
      const res = await fetch(`${API_URL}/validate-token?token=${token}`);
      if (!res.ok) throw new Error('Failed to validate token');
      return res.json();
    },
    enabled: !!token,
  });
}

export function useRegisterMember() {
  const queryClient = useQueryClient();

  return useMutation<Member, Error, RegisterMemberInput>({
    mutationFn: async (data: RegisterMemberInput) => {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to register member');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
    },
  });
}

export function useUpdateMember(id: string) {
  const queryClient = useQueryClient();

  return useMutation<Member, Error, UpdateMemberInput>({
    mutationFn: async (data: UpdateMemberInput) => {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update member');
      const responseData = await res.json();
      return responseData.member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.members.detail(id) });
    },
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete member');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
