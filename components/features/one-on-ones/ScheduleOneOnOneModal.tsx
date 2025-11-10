'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Button, Textarea } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { useMembers } from '@/hooks/useMembers';
import { useAuth } from '@/hooks/useAuth';

interface ScheduleOneOnOneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScheduleOneOnOneModal = ({ isOpen, onClose }: ScheduleOneOnOneModalProps) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: membersData } = useMembers('ACTIVE', 1, 100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    guestId: '',
    scheduledAt: '',
    scheduledTime: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const members = membersData?.data || [];
  const memberOptions = members
    .filter(m => m.id !== user?.memberId)
    .map(m => ({
      value: m.id,
      label: `${m.name} - ${m.company || 'Sem empresa'}`,
    }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, guestId: value }));
    if (errors.guestId) {
      setErrors(prev => ({ ...prev, guestId: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.guestId) {
      newErrors.guestId = 'Selecione um membro';
    }
    if (!formData.scheduledAt) {
      newErrors.scheduledAt = 'Selecione uma data';
    }
    if (!formData.scheduledTime) {
      newErrors.scheduledTime = 'Selecione um horário';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    if (!user?.memberId) {
      showToast('Você precisa ter um perfil de membro para agendar reuniões.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const scheduledAt = new Date(`${formData.scheduledAt}T${formData.scheduledTime}`).toISOString();

      const response = await fetch('/api/one-on-ones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostId: user.memberId,
          guestId: formData.guestId,
          scheduledAt,
          notes: formData.notes || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao agendar reunião');
      }

      showToast('Reunião agendada com sucesso!', 'success');
      queryClient.invalidateQueries({ queryKey: queryKeys.oneOnOnes.all });
      
      setFormData({
        guestId: '',
        scheduledAt: '',
        scheduledTime: '',
        notes: '',
      });
      onClose();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Erro ao agendar reunião.',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        guestId: '',
        scheduledAt: '',
        scheduledTime: '',
        notes: '',
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Agendar Reunião 1:1"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Membro"
          name="guestId"
          value={formData.guestId}
          onValueChange={handleSelectChange}
          options={memberOptions}
          placeholder="Selecione um membro"
          error={errors.guestId}
          required
        />

        <Input
          label="Data"
          type="date"
          name="scheduledAt"
          value={formData.scheduledAt}
          onChange={handleChange}
          error={errors.scheduledAt}
          required
          min={new Date().toISOString().split('T')[0]}
        />

        <Input
          label="Horário"
          type="time"
          name="scheduledTime"
          value={formData.scheduledTime}
          onChange={handleChange}
          error={errors.scheduledTime}
          required
        />

        <Textarea
          label="Notas (opcional)"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Adicione notas sobre a reunião..."
          rows={3}
        />

        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Agendando...' : 'Agendar Reunião'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
