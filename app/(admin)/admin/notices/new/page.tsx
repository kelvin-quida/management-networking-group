'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { Card, CardHeader, CardTitle, CardContent, Input, Textarea, Select, Button } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';

export default function NewNoticePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'INFO',
    priority: 'NORMAL',
    expiresAt: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/notices', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || ''
        },
        body: JSON.stringify({
          ...formData,
          expiresAt: formData.expiresAt || undefined,
        }),
      });

      if (!response.ok) throw new Error();

      showToast('Aviso criado com sucesso!', 'success');
      router.push('/admin/notices');
    } catch (error) {
      showToast('Erro ao criar aviso.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Criar Novo Aviso</h1>
        <p className="mt-2 text-gray-600">
          Publique um comunicado para todos os membros
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Aviso</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Título"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Digite o título do aviso"
            />

            <Textarea
              label="Conteúdo"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={6}
              placeholder="Digite o conteúdo do aviso..."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Tipo"
                name="type"
                value={formData.type}
                onChange={handleChange}
                options={[
                  { value: 'INFO', label: 'Informação' },
                  { value: 'WARNING', label: 'Aviso' },
                  { value: 'URGENT', label: 'Urgente' },
                  { value: 'EVENT', label: 'Evento' },
                ]}
              />

              <Select
                label="Prioridade"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                options={[
                  { value: 'LOW', label: 'Baixa' },
                  { value: 'NORMAL', label: 'Normal' },
                  { value: 'HIGH', label: 'Alta' },
                ]}
              />

              <Input
                label="Data de Expiração"
                name="expiresAt"
                type="date"
                value={formData.expiresAt}
                onChange={handleChange}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="primary" isLoading={isLoading}>
                Publicar Aviso
              </Button>
              <Button 
                type="button" 
                variant="ghost"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
