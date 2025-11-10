'use client';

import React, { useState } from 'react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import type { Member } from '@/lib/types';

interface MemberCardProps {
  member: Member;
  onClick?: () => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export const MemberCard = ({ member, onClick, onDelete, showActions = false }: MemberCardProps) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(member.id);
    }
    setShowConfirm(false);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(false);
  };

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
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant[member.status]}>
              {statusLabel[member.status]}
            </Badge>
            {showActions && (
              <button
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remover membro"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                  />
                </svg>
              </button>
            )}
          </div>
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

        {showActions && showConfirm && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="space-y-2">
              <p className="text-sm text-red-600 font-medium text-center">
                Tem certeza que deseja remover este membro?
              </p>
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={confirmDelete}
                  className="flex-1"
                >
                  Confirmar
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={cancelDelete}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
};
