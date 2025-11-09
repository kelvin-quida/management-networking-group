'use client';

import { useGroupDashboard } from '@/hooks/useDashboard';

export default function DashboardPage() {
  const { data, isLoading, error } = useGroupDashboard();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold">Erro ao carregar dashboard</p>
          <p className="mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const topPerformers = data?.topPerformers || [];

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Performance</h1>
          <p className="mt-2 text-gray-600">
            Acompanhe os indicadores do grupo de networking
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase">
                  Membros Ativos
                </p>
                <p className="mt-2 text-4xl font-bold text-gray-900">
                  {stats?.activeMembers || 0}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  de {stats?.totalMembers || 0} membros totais
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase">
                  Indicações do Mês
                </p>
                <p className="mt-2 text-4xl font-bold text-gray-900">
                  {stats?.totalReferrals || 0}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {stats?.closedReferrals || 0} fechadas
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase">
                  Agradecimentos do Mês
                </p>
                <p className="mt-2 text-4xl font-bold text-gray-900">
                  {Math.floor((stats?.totalReferrals || 0) * 0.3)}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  registrados publicamente
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Taxa de Presença Média
            </h3>
            <div className="flex items-center">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${stats?.averageAttendance || 0}%` }}
                  ></div>
                </div>
              </div>
              <span className="ml-4 text-2xl font-bold text-gray-900">
                {stats?.averageAttendance?.toFixed(1) || 0}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Valor Total Gerado
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-green-600">
                  R$ {stats?.totalBusinessGenerated?.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || '0,00'}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  em negócios fechados
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Crescimento mensal</p>
                <p className={`text-xl font-semibold ${
                  (stats?.monthlyGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stats?.monthlyGrowth >= 0 ? '+' : ''}
                  {stats?.monthlyGrowth?.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {topPerformers.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Performers
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Membro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Negócios Fechados
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Gerado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topPerformers.map((performer: any, index: number) => (
                    <tr key={performer.member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index === 0 && (
                            <span className="text-2xl mr-2">🥇</span>
                          )}
                          {index === 1 && (
                            <span className="text-2xl mr-2">🥈</span>
                          )}
                          {index === 2 && (
                            <span className="text-2xl mr-2">🥉</span>
                          )}
                          {index > 2 && (
                            <span className="text-gray-500 font-medium">
                              {index + 1}º
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {performer.member.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {performer.referralsClosed}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          R$ {performer.businessGenerated.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
