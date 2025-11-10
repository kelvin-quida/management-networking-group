'use client';

import { useState } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { useIntentionStatus } from '@/hooks/useIntentions';
import type { IntentionStatus } from '@/lib/types';

const STATUS_CONFIG: Record<IntentionStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger'; description: string }> = {
  PENDING: {
    label: 'Pendente',
    variant: 'warning',
    description: 'Sua intenção está sendo analisada pela equipe. Aguarde nosso contato em breve.',
  },
  APPROVED: {
    label: 'Aprovada',
    variant: 'success',
    description: 'Parabéns! Sua intenção foi aprovada. Verifique seu email para completar o cadastro.',
  },
  REJECTED: {
    label: 'Não Aprovada',
    variant: 'danger',
    description: 'Infelizmente sua intenção não foi aprovada neste momento. Você pode tentar novamente no futuro.',
  },
};

export const IntentionStatusChecker = () => {
  const [email, setEmail] = useState('');
  const [searchEmail, setSearchEmail] = useState<string | null>(null);
  const { data, isLoading, error } = useIntentionStatus(searchEmail);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSearchEmail(email.trim());
    }
  };

  const handleReset = () => {
    setEmail('');
    setSearchEmail(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Consultar Status da Intenção</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite o email usado na intenção"
              required
              disabled={isLoading}
            />
            <div className="flex gap-2">
              <Button 
                type="submit" 
                variant="primary" 
                className="flex-1"
                isLoading={isLoading}
              >
                Consultar Status
              </Button>
              {searchEmail && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleReset}
                >
                  Limpar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma intenção encontrada
            </h3>
            <p className="text-gray-600">
              Não encontramos nenhuma intenção cadastrada com este email.
            </p>
          </CardContent>
        </Card>
      )}

      {data?.intention && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">
                  {data.intention.status === 'APPROVED' && '✅'}
                  {data.intention.status === 'PENDING' && '⏳'}
                  {data.intention.status === 'REJECTED' && '❌'}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Olá, {data.intention.name}!
              </h3>
              <Badge variant={STATUS_CONFIG[data.intention.status].variant} size="lg">
                {STATUS_CONFIG[data.intention.status].label}
              </Badge>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-gray-700 text-center">
                {STATUS_CONFIG[data.intention.status].description}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-900">{data.intention.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Data de envio:</span>
                <span className="font-medium text-gray-900">
                  {new Date(data.intention.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              {data.intention.status !== 'PENDING' && (
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Última atualização:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(data.intention.updatedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            {data.intention.status === 'APPROVED' && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Próximos passos:</strong> Verifique sua caixa de entrada (e spam) para encontrar o email com o link de cadastro. O link é válido por 7 dias.
                </p>
              </div>
            )}

            {data.intention.status === 'REJECTED' && (
              <div className="mt-6 text-center">
                <a 
                  href="/"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Voltar para a página inicial
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
