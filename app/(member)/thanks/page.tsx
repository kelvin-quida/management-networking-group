'use client';

import { useThanks } from '@/hooks/useThanks';
import { ThankCard } from '@/components/features/thanks/ThankCard';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui';
import { useState } from 'react';

export default function ThanksPage() {
  const { data: thanks, isLoading } = useThanks();
  const [showForm, setShowForm] = useState(false);

  return (
    <Container>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agradecimentos</h1>
          <p className="mt-2 text-gray-600">
            Veja os agradecimentos públicos por negócios realizados
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          Agradecer
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : thanks && thanks.length > 0 ? (
        <div className="space-y-4">
          {thanks.map((thank) => (
            <ThankCard key={thank.id} thank={thank} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum agradecimento registrado ainda.</p>
        </div>
      )}
    </Container>
  );
}
