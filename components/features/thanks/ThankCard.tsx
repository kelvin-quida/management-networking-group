'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui';
import type { ThankWithMembers } from '@/lib/types';

interface ThankCardProps {
  thank: ThankWithMembers;
}

export const ThankCard = ({ thank }: ThankCardProps) => {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-2xl">🙏</span>
          </div>
          
          <div className="flex-1">
            <div className="mb-2">
              <span className="font-semibold text-gray-900">{thank.fromMember.name}</span>
              <span className="text-gray-600"> agradeceu </span>
              <span className="font-semibold text-gray-900">{thank.toMember.name}</span>
            </div>
            
            <p className="text-gray-700 mb-3">{thank.message}</p>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                {new Date(thank.createdAt).toLocaleDateString('pt-BR')}
              </span>
              {thank.value && (
                <span className="font-semibold text-green-600">
                  R$ {thank.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
