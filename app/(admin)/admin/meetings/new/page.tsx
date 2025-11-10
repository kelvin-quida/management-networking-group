'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { Card, CardHeader, CardTitle, CardContent, Input, Textarea, Select, Button } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';

export default function NewMeetingPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'REGULAR',
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
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          date: dateTime.toISOString(),
          location: formData.location || undefined,
          type: formData.type,
        }),
      });

      if (!response.ok) throw new Error();

      showToast('Reunião criada com sucesso!', 'success');
      router.push('/admin/meetings');
    } catch (error) {
      showToast('Erro ao criar reunião.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Criar Nova Reunião</h1>
        <p className="mt-2 text-gray-600">
          Agende uma reunião para o grupo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Reunião</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Título"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Ex: Reunião Semanal"
            />

            <Textarea
              label="Descrição"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Descreva o objetivo da reunião..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Data"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />

              <Input
                label="Horário"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Local"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Ex: Sala A, Edifício XYZ"
              />

              <Select
                label="Tipo"
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                options={[
                  { value: 'REGULAR', label: 'Regular' },
                  { value: 'SPECIAL', label: 'Especial' },
                  { value: 'TRAINING', label: 'Treinamento' },
                  { value: 'SOCIAL', label: 'Social' },
                ]}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="primary" isLoading={isLoading}>
                Criar Reunião
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
