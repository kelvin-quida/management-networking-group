'use client';

import React, { useState } from 'react';
import { Button, Input, Textarea } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { useCreateIntention } from '@/hooks/useIntentions';

export const IntentionForm = () => {
  const { showToast } = useToast();
  const createIntention = useCreateIntention();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createIntention.mutateAsync(formData);
      showToast('Intenção enviada com sucesso! Aguarde nosso contato.', 'success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      showToast('Erro ao enviar intenção. Tente novamente.', 'error');
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
      <Input
        label="Nome completo"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        placeholder="Seu nome"
      />
      
      <Input
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
        placeholder="seu@email.com"
      />
      
      <Input
        label="Telefone"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handleChange}
        placeholder="+55 11 98765-4321"
      />
      
      <Textarea
        label="Mensagem"
        name="message"
        value={formData.message}
        onChange={handleChange}
        rows={4}
        placeholder="Conte-nos por que você quer participar do grupo..."
      />
      
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
