'use client';

import { useGroupDashboard } from '@/hooks/useDashboard';
import { StatsCard } from '@/components/features/dashboard/StatsCard';
import { Container } from '@/components/layout/Container';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

export default function AdminDashboardPage() {
  const { data, isLoading } = useGroupDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <Container>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="mt-2 text-gray-600">
          Visão geral do desempenho do grupo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Membros Totais"
          value={stats?.totalMembers || 0}
          icon="👥"
          subtitle={`${stats?.activeMembers || 0} ativos`}
        />
        
        <StatsCard
          title="Taxa de Presença"
          value={`${stats?.averageAttendance?.toFixed(1) || 0}%`}
          icon="📊"
        />
        
        <StatsCard
          title="Indicações"
          value={stats?.totalReferrals || 0}
          icon="🤝"
          subtitle={`${stats?.closedReferrals || 0} fechadas`}
        />
        
        <StatsCard
          title="Valor Gerado"
          value={`R$ ${(stats?.totalBusinessGenerated || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`}
          icon="💰"
          trend={stats?.monthlyGrowth ? {
            value: stats.monthlyGrowth,
            isPositive: stats.monthlyGrowth >= 0
          } : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <a
                href="/admin/intentions"
                className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Gerenciar Intenções</h3>
                    <p className="text-sm text-gray-600">Aprovar ou rejeitar novos candidatos</p>
                  </div>
                </div>
              </a>
              
              <a
                href="/admin/notices/new"
                className="block p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📢</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Criar Aviso</h3>
                    <p className="text-sm text-gray-600">Publicar novo comunicado</p>
                  </div>
                </div>
              </a>
              
              <a
                href="/admin/meetings/new"
                className="block p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Agendar Reunião</h3>
                    <p className="text-sm text-gray-600">Criar nova reunião do grupo</p>
                  </div>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.topPerformers && data.topPerformers.length > 0 ? (
              <div className="space-y-3">
                {data.topPerformers.slice(0, 5).map((performer: any, index: number) => (
                  <div key={performer.member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{performer.member.name}</p>
                        <p className="text-sm text-gray-600">{performer.referralsClosed} negócios</p>
                      </div>
                    </div>
                    <p className="font-semibold text-green-600">
                      R$ {performer.businessGenerated.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
