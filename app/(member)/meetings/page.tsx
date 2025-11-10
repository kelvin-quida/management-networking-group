'use client';

import { useState } from 'react';
import { useMeetings } from '@/hooks/useMeetings';
import { useAttendances } from '@/hooks/useAttendances';
import { MeetingCard } from '@/components/features/meetings/MeetingCard';
import { Container } from '@/components/layout/Container';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

export default function MeetingsPage() {
  const { data: meetings, isLoading } = useMeetings();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { data: attendances } = useAttendances(user?.memberId || undefined);
  const queryClient = useQueryClient();
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  const checkedInMeetings = new Set(
    attendances
      ?.filter(a => a.checkedIn)
      .map(a => a.meetingId) || []
  );

  const handleCheckIn = async (meetingId: string) => {
    if (!user?.memberId) {
      showToast('Você precisa ter um perfil de membro para fazer check-in.', 'error');
      return;
    }

    setCheckingIn(meetingId);

    try {
      const response = await fetch(`/api/meetings/${meetingId}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: user.memberId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao fazer check-in');
      }

      showToast('Check-in realizado com sucesso!', 'success');
      
      queryClient.invalidateQueries({ queryKey: queryKeys.attendances.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all });
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Erro ao fazer check-in.',
        'error'
      );
    } finally {
      setCheckingIn(null);
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
              isCheckedIn={checkedInMeetings.has(meeting.id)}
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
