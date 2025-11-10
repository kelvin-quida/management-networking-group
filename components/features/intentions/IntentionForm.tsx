'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Textarea } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { useCreateIntention } from '@/hooks/useIntentions';
import { createIntentionSchema } from '@/lib/validations/intentions';
import { ZodError } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useMemberProfile } from '@/hooks/useMemberProfile';

export const IntentionForm = () => {
  const { showToast } = useToast();
  const createIntention = useCreateIntention();
  const { user } = useAuth();
  const { data: memberProfile } = useMemberProfile();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => {
        const newName = user.name || '';
        const newEmail = user.email || '';
        const newPhone = memberProfile?.phone || '';
        
        if (prev.name !== newName || prev.email !== newEmail || prev.phone !== newPhone) {
          return {
            ...prev,
            name: newName,
            email: newEmail,
            phone: newPhone,
          };
        }
        return prev;
      });
    }
  }, [user?.id, user?.name, user?.email, memberProfile?.phone]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validatedData = createIntentionSchema.parse(formData);
      
      await createIntention.mutateAsync(validatedData);
      showToast('Intenção enviada com sucesso! Acompanhe o status em /intentions/status', 'success');
      
      setTimeout(() => {
        window.location.href = '/intentions/status';
      }, 2000);
      
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0].toString()] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else if (error instanceof Error) {
        const errorCode = (error as any).code;
        if (errorCode === 'DUPLICATE_EMAIL') {
          showToast(error.message, 'error');
        } else {
          showToast('Erro ao enviar intenção. Tente novamente mais tarde.', 'error');
        }
      } else {
        showToast('Erro ao enviar intenção. Tente novamente mais tarde.', 'error');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          label="Nome completo"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Seu nome"
          className={errors.name ? 'border-red-500' : ''}
          disabled={!!user}
          readOnly={!!user}
        />
        {errors.name && (
          <p className="text-xs text-red-600 mt-1">{errors.name}</p>
        )}
      </div>
      
      <div>
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="seu@email.com"
          className={errors.email ? 'border-red-500' : ''}
          disabled={!!user}
          readOnly={!!user}
        />
        {errors.email && (
          <p className="text-xs text-red-600 mt-1">{errors.email}</p>
        )}
      </div>
      
      <div>
        <Input
          label="Telefone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder=""
          className={errors.phone ? 'border-red-500' : ''}
        />
        {errors.phone && (
          <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
        )}
      </div>
      
      <div>
        <Textarea
          label="Mensagem"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          placeholder="Conte-nos por que você quer participar do grupo..."
          className={errors.message ? 'border-red-500' : ''}
        />
        {errors.message && (
          <p className="text-xs text-red-600 mt-1">{errors.message}</p>
        )}
      </div>
      
      <Button 
        type="submit" 
        variant="primary" 
        className="w-full"
        isLoading={createIntention.isPending}
      >
        Enviar Intenção
      </Button>
    </form>
  );
};
