'use client';

import { useMeetings } from '@/hooks/useMeetings';
import { MeetingCard } from '@/components/features/meetings/MeetingCard';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui';

export default function AdminMeetingsPage() {
  const { data: meetings, isLoading } = useMeetings();

  return (
    <Container>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Reuniões</h1>
          <p className="mt-2 text-gray-600">
            Crie e gerencie as reuniões do grupo
          </p>
        </div>
        <Button onClick={() => window.location.href = '/admin/meetings/new'}>
          Criar Reunião
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : meetings && meetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma reunião agendada.</p>
        </div>
      )}
    </Container>
  );
}
