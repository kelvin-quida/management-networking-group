'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { Card, CardHeader, CardTitle, CardContent, Input, Textarea, Select, Button } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { createNoticeSchema } from '@/lib/validations/notices';
import { ZodError } from 'zod';

export default function NewNoticePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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
    setErrors({});
    
    try {
      const validatedData = createNoticeSchema.parse({
        ...formData,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
      });

      setIsLoading(true);

      const response = await fetch('/api/notices', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-key': process.env.NEXT_PUBLIC_ADMIN_KEY || ''
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao criar aviso');
      }

      showToast('Aviso criado com sucesso!', 'success');
      router.push('/admin/notices');
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0].toString()] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao criar aviso';
        setErrors({ form: errorMessage });
      }
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
            {errors.form && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {errors.form}
              </div>
            )}
            <div>
              <Input
                label="Título"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Digite o título do aviso"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-xs text-red-600 mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <Textarea
                label="Conteúdo"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Digite o conteúdo do aviso..."
                className={errors.content ? 'border-red-500' : ''}
              />
              {errors.content && (
                <p className="text-xs text-red-600 mt-1">{errors.content}</p>
              )}
            </div>

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

              <div>
                <Input
                  label="Data de Expiração"
                  name="expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={handleChange}
                  className={errors.expiresAt ? 'border-red-500' : ''}
                />
                {errors.expiresAt && (
                  <p className="text-xs text-red-600 mt-1">{errors.expiresAt}</p>
                )}
              </div>
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
