'use client';

import { useMeetings } from '@/hooks/useMeetings';
import { MeetingCard } from '@/components/features/meetings/MeetingCard';
import { Container } from '@/components/layout/Container';
import { useToast } from '@/components/ui/Toast';

export default function MeetingsPage() {
  const { data: meetings, isLoading } = useMeetings();
  const { showToast } = useToast();

  const handleCheckIn = async (meetingId: string) => {
    try {
      const memberId = 'current-member-id';
      
      const response = await fetch(`/api/meetings/${meetingId}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      });

      if (!response.ok) throw new Error();

      showToast('Check-in realizado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao fazer check-in.', 'error');
    }
  };

  return (
    <Container>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reuniões</h1>
        <p className="mt-2 text-gray-600">
          Confira as próximas reuniões e faça seu check-in
        </p>
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
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onCheckIn={handleCheckIn}
              canCheckIn={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma reunião agendada no momento.</p>
        </div>
      )}
    </Container>
  );
}
