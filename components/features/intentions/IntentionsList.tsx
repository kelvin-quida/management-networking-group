'use client';

import React from 'react';
import { IntentionCard } from './IntentionCard';
import { useIntentions, useApproveIntention, useRejectIntention } from '@/hooks/useIntentions';
import { useToast } from '@/components/ui/Toast';

interface IntentionsListProps {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const IntentionsList = ({ status }: IntentionsListProps) => {
  const { data: response, isLoading } = useIntentions(status);
  const approveIntention = useApproveIntention();
  const rejectIntention = useRejectIntention();
  const { showToast } = useToast();

  const handleApprove = async (id: string) => {
    try {
      await approveIntention.mutateAsync({ intentionId: id });
      showToast('Intenção aprovada com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao aprovar intenção.', 'error');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectIntention.mutateAsync({ intentionId: id });
      showToast('Intenção rejeitada.', 'info');
    } catch (error) {
      showToast('Erro ao rejeitar intenção.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!response || response.data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Nenhuma intenção encontrada.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {response.data.map((intention) => (
        <IntentionCard
          key={intention.id}
          intention={intention}
          onApprove={handleApprove}
          onReject={handleReject}
          isLoading={approveIntention.isPending || rejectIntention.isPending}
        />
      ))}
    </div>
  );
};
