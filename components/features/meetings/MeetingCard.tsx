'use client';

import React from 'react';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import type { Meeting } from '@/lib/types';

interface MeetingCardProps {
  meeting: Meeting & { attendanceCount?: number };
  onCheckIn?: (id: string) => void;
  isCheckedIn?: boolean;
  canCheckIn?: boolean;
}

export const MeetingCard = ({ 
  meeting, 
  onCheckIn,
  isCheckedIn,
  canCheckIn 
}: MeetingCardProps) => {
  const typeVariant = {
    REGULAR: 'default' as const,
    SPECIAL: 'info' as const,
    TRAINING: 'warning' as const,
    SOCIAL: 'success' as const,
  };

  const typeLabel = {
    REGULAR: 'Regular',
    SPECIAL: 'Especial',
    TRAINING: 'Treinamento',
    SOCIAL: 'Social',
  };

  const meetingDate = new Date(meeting.date);
  const isToday = new Date().toDateString() === meetingDate.toDateString();

  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={typeVariant[meeting.type]}>
                {typeLabel[meeting.type]}
              </Badge>
              {isToday && (
                <Badge variant="success">Hoje</Badge>
              )}
            </div>
          </div>
        </div>

        {meeting.description && (
          <p className="text-sm text-gray-700 mb-3">{meeting.description}</p>
        )}

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>{meetingDate.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🕐</span>
            <span>{meetingDate.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}</span>
          </div>
          {meeting.location && (
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>{meeting.location}</span>
            </div>
          )}
          {meeting.attendanceCount !== undefined && (
            <div className="flex items-center gap-2">
              <span>👥</span>
              <span>{meeting.attendanceCount} participantes</span>
            </div>
          )}
        </div>

        {canCheckIn && onCheckIn && (
          <Button
            variant={isCheckedIn ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => onCheckIn(meeting.id)}
            disabled={isCheckedIn}
            className="w-full"
          >
            {isCheckedIn ? '✓ Check-in realizado' : 'Fazer Check-in'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
