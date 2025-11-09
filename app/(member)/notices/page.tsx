'use client';

import { useNotices } from '@/hooks/useNotices';
import { NoticeCard } from '@/components/features/notices/NoticeCard';
import { Container } from '@/components/layout/Container';

export default function NoticesPage() {
  const { data: notices, isLoading } = useNotices();

  return (
    <Container>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Avisos e Comunicados</h1>
        <p className="mt-2 text-gray-600">
          Fique por dentro das novidades e comunicados do grupo
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : notices && notices.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {notices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum aviso disponível no momento.</p>
        </div>
      )}
    </Container>
  );
}
