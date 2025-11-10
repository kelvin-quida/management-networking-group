'use client';

import React, { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { registerMemberSchema } from '@/lib/validations/members';
import { ZodError } from 'zod';

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

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);
    
    try {
      const validatedData = registerMemberSchema.parse({ 
        token, 
        ...formData 
      });

      const response = await fetch('/api/members/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) throw new Error();

      showToast('Cadastro completado com sucesso!', 'success');
      onSuccess?.();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0].toString()] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        showToast('Erro ao completar cadastro.', 'error');
      }
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
        <div>
          <Input
            label="Empresa"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Nome da empresa"
            className={errors.company ? 'border-red-500' : ''}
          />
          {errors.company && (
            <p className="text-xs text-red-600 mt-1">{errors.company}</p>
          )}
        </div>
        
        <div>
          <Input
            label="Cargo"
            name="position"
            value={formData.position}
            onChange={handleChange}
            placeholder="Seu cargo"
            className={errors.position ? 'border-red-500' : ''}
          />
          {errors.position && (
            <p className="text-xs text-red-600 mt-1">{errors.position}</p>
          )}
        </div>
      </div>

      <div>
        <Input
          label="Endereço"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Rua, número, complemento"
          className={errors.address ? 'border-red-500' : ''}
        />
        {errors.address && (
          <p className="text-xs text-red-600 mt-1">{errors.address}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Input
            label="Cidade"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Cidade"
            className={errors.city ? 'border-red-500' : ''}
          />
          {errors.city && (
            <p className="text-xs text-red-600 mt-1">{errors.city}</p>
          )}
        </div>
        
        <div>
          <Input
            label="Estado"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="UF"
            maxLength={2}
            className={errors.state ? 'border-red-500' : ''}
          />
          {errors.state && (
            <p className="text-xs text-red-600 mt-1">{errors.state}</p>
          )}
        </div>
        
        <div>
          <Input
            label="CEP"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            placeholder="00000-000"
            className={errors.zipCode ? 'border-red-500' : ''}
          />
          {errors.zipCode && (
            <p className="text-xs text-red-600 mt-1">{errors.zipCode}</p>
          )}
        </div>
      </div>

      <div>
        <Input
          label="Data de Nascimento"
          name="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={handleChange}
          className={errors.birthDate ? 'border-red-500' : ''}
        />
        {errors.birthDate && (
          <p className="text-xs text-red-600 mt-1">{errors.birthDate}</p>
        )}
      </div>
      
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
