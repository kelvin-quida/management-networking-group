'use client';

import { Container } from '@/components/layout/Container';
import { Card, CardHeader, CardTitle, CardContent, Input, Button } from '@/components/ui';
import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';

export default function ProfilePage() {
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '+55 11 98765-4321',
    company: 'Empresa XYZ',
    position: 'Gerente',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '12345-678',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      showToast('Perfil atualizado com sucesso!', 'success');
      setIsEditing(false);
    } catch (error) {
      showToast('Erro ao atualizar perfil.', 'error');
    }
  };

  return (
    <Container maxWidth="lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="mt-2 text-gray-600">
          Gerencie suas informações pessoais e profissionais
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Informações Pessoais</CardTitle>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome completo"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
              
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </div>

            <Input
              label="Telefone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Empresa"
                name="company"
                value={formData.company}
                onChange={handleChange}
                disabled={!isEditing}
              />
              
              <Input
                label="Cargo"
                name="position"
                value={formData.position}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <Input
              label="Endereço"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Cidade"
                name="city"
                value={formData.city}
                onChange={handleChange}
                disabled={!isEditing}
              />
              
              <Input
                label="Estado"
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={!isEditing}
                maxLength={2}
              />
              
              <Input
                label="CEP"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary">
                  Salvar Alterações
                </Button>
                <Button 
                  type="button" 
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
