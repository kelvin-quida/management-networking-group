import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import type { Member } from '@/lib/types';
import { useAuth } from './useAuth';

export const useMemberProfile = () => {
  const { user } = useAuth();

  return useQuery<Member | null>({
    queryKey: queryKeys.members.detail(user?.memberId || ''),
    queryFn: async () => {
      if (!user?.memberId) {
        return null;
      }

      const response = await fetch(`/api/members/${user.memberId}`);
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      return data.member;
    },
    enabled: !!user?.memberId,
  });
};
