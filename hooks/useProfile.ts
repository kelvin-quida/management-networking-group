import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { Member } from '@/lib/types';
import { UpdateMemberInput } from '@/lib/validations/members';

const API_URL = '/api/profile';

export function useProfile() {
  return useQuery<Member>({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      return data.member;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<Member, Error, UpdateMemberInput>({
    mutationFn: async (data: UpdateMemberInput) => {
      const res = await fetch(API_URL, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const responseData = await res.json();
      return responseData.member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
    },
  });
}
