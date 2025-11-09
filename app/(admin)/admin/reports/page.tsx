'use client';

import { Container } from '@/components/layout/Container';
import { Card, CardHeader, CardTitle, CardContent, Select, Button } from '@/components/ui';
import { useState } from 'react';

export default function AdminReportsPage() {
  const [period, setPeriod] = useState('monthly');
  const [year, setYear] = useState(new Date().getFullYear().toString());

  return (
    <Container>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
        <p className="mt-2 text-gray-600">
          Gere relatórios detalhados sobre o desempenho do grupo
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Período"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              options={[
                { value: 'weekly', label: 'Semanal' },
                { value: 'monthly', label: 'Mensal' },
                { value: 'quarterly', label: 'Trimestral' },
                { value: 'yearly', label: 'Anual' },
              ]}
            />
            
            <Select
              label="Ano"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              options={[
                { value: '2024', label: '2024' },
                { value: '2023', label: '2023' },
                { value: '2022', label: '2022' },
              ]}
            />
            
            <div className="flex items-end">
              <Button className="w-full">Gerar Relatório</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Relatórios Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <h3 className="font-semibold text-gray-900">📊 Relatório de Presença</h3>
                <p className="text-sm text-gray-600 mt-1">Taxa de presença por membro e reunião</p>
              </button>
              
              <button className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <h3 className="font-semibold text-gray-900">💼 Relatório de Indicações</h3>
                <p className="text-sm text-gray-600 mt-1">Indicações enviadas, recebidas e fechadas</p>
              </button>
              
              <button className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <h3 className="font-semibold text-gray-900">💰 Relatório Financeiro</h3>
                <p className="text-sm text-gray-600 mt-1">Status de pagamentos e inadimplência</p>
              </button>
              
              <button className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <h3 className="font-semibold text-gray-900">📈 Relatório de Performance</h3>
                <p className="text-sm text-gray-600 mt-1">Desempenho geral e por membro</p>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exportar Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Exporte os dados do sistema em diferentes formatos
            </p>
            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                📄 Exportar para PDF
              </Button>
              <Button variant="outline" className="w-full">
                📊 Exportar para Excel
              </Button>
              <Button variant="outline" className="w-full">
                📋 Exportar para CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
