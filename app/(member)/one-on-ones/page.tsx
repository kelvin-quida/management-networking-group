'use client';

import { useOneOnOnes } from '@/hooks/useOneOnOnes';
import { Container } from '@/components/layout/Container';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { ScheduleOneOnOneModal } from '@/components/features/one-on-ones/ScheduleOneOnOneModal';

export default function OneOnOnesPage() {
  const { data: oneOnOnes, isLoading } = useOneOnOnes();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleComplete = async (id: string) => {
    setUpdatingId(id);

    try {
      const response = await fetch(`/api/one-on-ones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'COMPLETED', 
          completedAt: new Date().toISOString() 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao marcar como concluída');
      }

      showToast('Reunião marcada como concluída com sucesso!', 'success');
      queryClient.invalidateQueries({ queryKey: queryKeys.oneOnOnes.all });
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Não foi possível marcar a reunião como concluída.',
        'error'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    setUpdatingId(id);

    try {
      const response = await fetch(`/api/one-on-ones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao cancelar reunião');
      }

      showToast('Reunião cancelada com sucesso!', 'success');
      queryClient.invalidateQueries({ queryKey: queryKeys.oneOnOnes.all });
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Não foi possível cancelar a reunião.',
        'error'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const statusVariant = {
    SCHEDULED: 'warning' as const,
    COMPLETED: 'success' as const,
    CANCELLED: 'default' as const,
  };

  const statusLabel = {
    SCHEDULED: 'Agendado',
    COMPLETED: 'Concluído',
    CANCELLED: 'Cancelado',
  };

  return (
    <Container>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reuniões 1:1</h1>
          <p className="mt-2 text-gray-600">
            Agende e acompanhe suas reuniões individuais com outros membros
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Agendar Reunião</Button>
      </div>

      <ScheduleOneOnOneModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : oneOnOnes && oneOnOnes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {oneOnOnes.map((meeting) => (
            <Card key={meeting.id}>
              <CardContent>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {meeting.host.name} & {meeting.guest.name}
                    </h3>
                  </div>
                  <Badge variant={statusVariant[meeting.status]}>
                    {statusLabel[meeting.status]}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>
                      {new Date(meeting.scheduledAt).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🕐</span>
                    <span>
                      {new Date(meeting.scheduledAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {meeting.notes && (
                  <p className="text-sm text-gray-700 mb-4">{meeting.notes}</p>
                )}

                {meeting.status === 'SCHEDULED' && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="primary" 
                      className="flex-1"
                      onClick={() => handleComplete(meeting.id)}
                      disabled={updatingId === meeting.id}
                    >
                      {updatingId === meeting.id ? 'Concluindo...' : 'Marcar como Concluído'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="flex-1"
                      onClick={() => handleCancel(meeting.id)}
                      disabled={updatingId === meeting.id}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma reunião 1:1 agendada.</p>
        </div>
      )}
    </Container>
  );
}
