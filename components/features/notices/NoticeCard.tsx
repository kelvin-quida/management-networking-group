'use client';

import React from 'react';
import { Card, CardContent, Badge } from '@/components/ui';
import type { Notice } from '@/lib/types';

interface NoticeCardProps {
  notice: Notice;
}

export const NoticeCard = ({ notice }: NoticeCardProps) => {
  const typeVariant = {
    INFO: 'info' as const,
    WARNING: 'warning' as const,
    URGENT: 'danger' as const,
    EVENT: 'success' as const,
  };

  const typeLabel = {
    INFO: 'Informação',
    WARNING: 'Aviso',
    URGENT: 'Urgente',
    EVENT: 'Evento',
  };

  const priorityIcon = {
    LOW: '🔵',
    NORMAL: '🟡',
    HIGH: '🔴',
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span>{priorityIcon[notice.priority]}</span>
            <h3 className="text-lg font-semibold text-gray-900">{notice.title}</h3>
          </div>
          <Badge variant={typeVariant[notice.type]}>
            {typeLabel[notice.type]}
          </Badge>
        </div>

        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{notice.content}</p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Publicado em {new Date(notice.publishedAt).toLocaleDateString('pt-BR')}
          </span>
          {notice.expiresAt && (
            <span>
              Expira em {new Date(notice.expiresAt).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
