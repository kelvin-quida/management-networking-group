'use client';

import { useState } from 'react';
import { IntentionsList } from '@/components/features/intentions/IntentionsList';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui';

export default function AdminIntentionsPage() {
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | undefined>('PENDING');

  return (
    <Container>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gerenciar Intenções</h1>
        <p className="mt-2 text-gray-600">
          Aprove ou rejeite candidatos interessados em participar do grupo
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'PENDING' ? 'primary' : 'outline'}
          onClick={() => setFilter('PENDING')}
        >
          Pendentes
        </Button>
        <Button
          variant={filter === 'APPROVED' ? 'primary' : 'outline'}
          onClick={() => setFilter('APPROVED')}
        >
          Aprovados
        </Button>
        <Button
          variant={filter === 'REJECTED' ? 'primary' : 'outline'}
          onClick={() => setFilter('REJECTED')}
        >
          Rejeitados
        </Button>
        <Button
          variant={filter === undefined ? 'primary' : 'outline'}
          onClick={() => setFilter(undefined)}
        >
          Todos
        </Button>
      </div>

      <IntentionsList status={filter} />
    </Container>
  );
}
