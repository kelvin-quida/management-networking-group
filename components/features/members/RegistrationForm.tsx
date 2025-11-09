'use client';

import React, { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';

interface RegistrationFormProps {
  token: string;
  memberData: {
    name: string;
    email: string;
  };
  onSuccess?: () => void;
}

export const RegistrationForm = ({ 
  token, 
  memberData,
  onSuccess 
}: RegistrationFormProps) => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    birthDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/members/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...formData }),
      });

      if (!response.ok) throw new Error();

      showToast('Cadastro completado com sucesso!', 'success');
      onSuccess?.();
    } catch (error) {
      showToast('Erro ao completar cadastro.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Bem-vindo, {memberData.name}!</strong><br />
          Complete seu cadastro para ter acesso ao sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Empresa"
          name="company"
          value={formData.company}
          onChange={handleChange}
          required
          placeholder="Nome da empresa"
        />
        
        <Input
          label="Cargo"
          name="position"
          value={formData.position}
          onChange={handleChange}
          required
          placeholder="Seu cargo"
        />
      </div>

      <Input
        label="Endereço"
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Rua, número, complemento"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Cidade"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="Cidade"
        />
        
        <Input
          label="Estado"
          name="state"
          value={formData.state}
          onChange={handleChange}
          placeholder="UF"
          maxLength={2}
        />
        
        <Input
          label="CEP"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleChange}
          placeholder="00000-000"
        />
      </div>

      <Input
        label="Data de Nascimento"
        name="birthDate"
        type="date"
        value={formData.birthDate}
        onChange={handleChange}
      />
      
      <Button 
        type="submit" 
        variant="primary" 
        className="w-full"
        isLoading={isLoading}
      >
        Completar Cadastro
      </Button>
    </form>
  );
};
