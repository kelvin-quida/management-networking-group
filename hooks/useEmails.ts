import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { EmailLog } from '@/lib/types';

export function useEmails(limit = 50) {
  return useQuery<EmailLog[]>({
    queryKey: queryKeys.emails.list(limit),
    queryFn: async () => {
      const res = await fetch(`/api/emails?limit=${limit}`, {
        headers: {
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || '',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch emails');
      const data = await res.json();
      return data.emails || [];
    },
  });
}
