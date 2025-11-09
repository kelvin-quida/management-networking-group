'use client';

import React from 'react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import type { Intention } from '@/lib/types';

interface IntentionCardProps {
  intention: Intention;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  isLoading?: boolean;
}

export const IntentionCard = ({ 
  intention, 
  onApprove, 
  onReject,
  isLoading 
}: IntentionCardProps) => {
  const statusVariant = {
    PENDING: 'warning' as const,
    APPROVED: 'success' as const,
    REJECTED: 'danger' as const,
  };

  const statusLabel = {
    PENDING: 'Pendente',
    APPROVED: 'Aprovado',
    REJECTED: 'Rejeitado',
  };

  return (
    <Card>
      <CardContent>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{intention.name}</h3>
            <p className="text-sm text-gray-600">{intention.email}</p>
            {intention.phone && (
              <p className="text-sm text-gray-600">{intention.phone}</p>
            )}
          </div>
          <Badge variant={statusVariant[intention.status]}>
            {statusLabel[intention.status]}
          </Badge>
        </div>

        {intention.message && (
          <div className="mb-4">
            <p className="text-sm text-gray-700">{intention.message}</p>
          </div>
        )}

        <div className="text-xs text-gray-500 mb-4">
          Enviado em {new Date(intention.createdAt).toLocaleDateString('pt-BR')}
        </div>

        {intention.status === 'PENDING' && onApprove && onReject && (
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onApprove(intention.id)}
              disabled={isLoading}
              className="flex-1"
            >
              Aprovar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onReject(intention.id)}
              disabled={isLoading}
              className="flex-1"
            >
              Rejeitar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
