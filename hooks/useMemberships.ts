import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateMembershipInput, PayMembershipInput } from '@/lib/validations/memberships';
import { queryKeys } from '@/lib/query-keys';
import { MembershipWithMember, Membership } from '@/lib/types';

const API_URL = '/api/memberships';

export function useMemberships(memberId?: string, status?: string) {
  return useQuery<MembershipWithMember[]>({
    queryKey: queryKeys.memberships.list({ memberId, status }),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (memberId) params.append('memberId', memberId);
      if (status) params.append('status', status);

      const res = await fetch(`${API_URL}?${params}`);
      if (!res.ok) throw new Error('Failed to fetch memberships');
      const data = await res.json();
      return data.memberships || [];
    },
  });
}

export function useCreateMembership() {
  const queryClient = useQueryClient();
  return useMutation<Membership, Error, CreateMembershipInput>({
    mutationFn: async (data: CreateMembershipInput) => {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create membership');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.memberships.all }),
  });
}

export function usePayMembership(id: string) {
  const queryClient = useQueryClient();
  return useMutation<Membership, Error, PayMembershipInput>({
    mutationFn: async (data: PayMembershipInput) => {
      const res = await fetch(`${API_URL}/${id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to pay membership');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.memberships.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.memberships.detail(id) });
    },
  });
}
