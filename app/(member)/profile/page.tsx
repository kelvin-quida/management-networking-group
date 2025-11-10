'use client';

import { Container } from '@/components/layout/Container';
import { Card, CardHeader, CardTitle, CardContent, Input, Button } from '@/components/ui';
import { useState, useMemo } from 'react';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';

export default function ProfilePage() {
  const { showToast } = useToast();
  const { user, isPending: isAuthPending } = useAuth();
  const { data: member, isLoading: isMemberLoading } = useProfile();
  const updateMember = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  
  const initialData = useMemo(() => {
    if (member) {
      return {
        name: member.name || '',
        email: member.email || '',
        phone: member.phone || '',
        company: member.company || '',
        position: member.position || '',
        address: member.address || '',
        city: member.city || '',
        state: member.state || '',
        zipCode: member.zipCode || '',
      };
    } else if (user && !user.memberId) {
      return {
        name: user.name || '',
        email: user.email || '',
        phone: '',
        company: '',
        position: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
      };
    }
    return {
      name: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    };
  }, [member, user]);

  const [formData, setFormData] = useState(initialData);

  if (!isEditing && JSON.stringify(formData) !== JSON.stringify(initialData)) {
    setFormData(initialData);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.memberId) {
      showToast('Você precisa estar vinculado a um membro para atualizar o perfil.', 'error');
      return;
    }

    try {
      await updateMember.mutateAsync(formData);
      showToast('Perfil atualizado com sucesso!', 'success');
      setIsEditing(false);
    } catch (error) {
      showToast('Erro ao atualizar perfil.', 'error');
      console.error('Error updating profile:', error);
    }
  };

  const isLoading = isAuthPending || isMemberLoading;

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando perfil...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg">
        <div className="text-center py-12">
          <p className="text-gray-600">Usuário não autenticado.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="mt-2 text-gray-600">
          Gerencie suas informações pessoais e profissionais
        </p>
        {!user.memberId && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ Seu usuário ainda não está vinculado a um membro do grupo. Entre em contato com o administrador.
            </p>
          </div>
        )}
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
                disabled={true}
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
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={updateMember.isPending || !user.memberId}
                >
                  {updateMember.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(initialData);
                  }}
                  disabled={updateMember.isPending}
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
