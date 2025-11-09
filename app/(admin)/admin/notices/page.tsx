'use client';

import { useNotices } from '@/hooks/useNotices';
import { NoticeCard } from '@/components/features/notices/NoticeCard';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui';

export default function AdminNoticesPage() {
  const { data: notices, isLoading } = useNotices();

  return (
    <Container>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Avisos</h1>
          <p className="mt-2 text-gray-600">
            Crie e gerencie comunicados para os membros
          </p>
        </div>
        <Button onClick={() => window.location.href = '/admin/notices/new'}>
          Criar Aviso
        </Button>
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
          <p className="text-gray-500">Nenhum aviso publicado.</p>
        </div>
      )}
    </Container>
  );
}
