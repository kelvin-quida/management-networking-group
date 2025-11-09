'use client';

import React from 'react';
import { Card, CardContent, Badge } from '@/components/ui';
import type { Member } from '@/lib/types';

interface MemberCardProps {
  member: Member;
  onClick?: () => void;
}

export const MemberCard = ({ member, onClick }: MemberCardProps) => {
  const statusVariant = {
    INVITED: 'warning' as const,
    ACTIVE: 'success' as const,
    INACTIVE: 'default' as const,
    SUSPENDED: 'danger' as const,
  };

  const statusLabel = {
    INVITED: 'Convidado',
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
    SUSPENDED: 'Suspenso',
  };

  return (
    <div onClick={onClick} className={onClick ? 'cursor-pointer' : ''}>
      <Card className={onClick ? 'hover:shadow-lg transition-shadow' : ''}>
        <CardContent>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-lg">
                {member.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{member.name}</h3>
              <p className="text-sm text-gray-600">{member.email}</p>
            </div>
          </div>
          <Badge variant={statusVariant[member.status]}>
            {statusLabel[member.status]}
          </Badge>
        </div>

        {(member.company || member.position) && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            {member.company && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Empresa:</span> {member.company}
              </p>
            )}
            {member.position && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Cargo:</span> {member.position}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
};
