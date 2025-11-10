import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatsCard } from '@/components/features/dashboard/StatsCard';

describe('StatsCard', () => {
  it('deve renderizar título e valor', () => {
    render(<StatsCard title="Total de Membros" value={42} />);

    expect(screen.getByText('Total de Membros')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('deve renderizar valor como string', () => {
    render(<StatsCard title="Taxa de Presença" value="85%" />);

    expect(screen.getByText('Taxa de Presença')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('deve renderizar ícone quando fornecido', () => {
    render(<StatsCard title="Reuniões" value={10} icon="📅" />);

    expect(screen.getByText('📅')).toBeInTheDocument();
  });

  it('não deve renderizar ícone quando não fornecido', () => {
    const { container } = render(<StatsCard title="Membros" value={5} />);

    const iconContainer = container.querySelector('.bg-blue-100');
    expect(iconContainer).not.toBeInTheDocument();
  });

  it('deve renderizar trend positivo', () => {
    render(
      <StatsCard
        title="Novos Membros"
        value={15}
        trend={{ value: 12.5, isPositive: true }}
      />
    );

    expect(screen.getByText(/↑ 12.5%/)).toBeInTheDocument();
    expect(screen.getByText(/vs\. período anterior/)).toBeInTheDocument();
  });

  it('deve renderizar trend negativo', () => {
    render(
      <StatsCard
        title="Presença"
        value={20}
        trend={{ value: -5.3, isPositive: false }}
      />
    );

    expect(screen.getByText(/↓ 5.3%/)).toBeInTheDocument();
  });

  it('deve aplicar cor verde para trend positivo', () => {
    const { container } = render(
      <StatsCard
        title="Crescimento"
        value={100}
        trend={{ value: 10, isPositive: true }}
      />
    );

    const trendElement = container.querySelector('.text-green-600');
    expect(trendElement).toBeInTheDocument();
    expect(trendElement).toHaveTextContent('↑ 10%');
  });

  it('deve aplicar cor vermelha para trend negativo', () => {
    const { container } = render(
      <StatsCard
        title="Queda"
        value={50}
        trend={{ value: -8, isPositive: false }}
      />
    );

    const trendElement = container.querySelector('.text-red-600');
    expect(trendElement).toBeInTheDocument();
    expect(trendElement).toHaveTextContent('↓ 8%');
  });

  it('deve usar Math.abs para valores negativos de trend', () => {
    render(
      <StatsCard
        title="Teste"
        value={10}
        trend={{ value: -15.7, isPositive: false }}
      />
    );

    expect(screen.getByText(/↓ 15.7%/)).toBeInTheDocument();
  });

  it('não deve renderizar trend quando não fornecido', () => {
    render(<StatsCard title="Simples" value={10} />);

    expect(screen.queryByText(/vs\. período anterior/)).not.toBeInTheDocument();
  });

  it('deve renderizar subtitle quando fornecido', () => {
    render(
      <StatsCard
        title="Valor Total"
        value="R$ 10.000"
        subtitle="Gerado este mês"
      />
    );

    expect(screen.getByText('Gerado este mês')).toBeInTheDocument();
  });

  it('não deve renderizar subtitle quando não fornecido', () => {
    const { container } = render(<StatsCard title="Teste" value={5} />);

    const subtitleElements = container.querySelectorAll('.text-sm.text-gray-500');

    expect(subtitleElements.length).toBe(0);
  });

  it('deve renderizar todos os elementos juntos', () => {
    render(
      <StatsCard
        title="Indicações"
        value={25}
        icon="🤝"
        trend={{ value: 20, isPositive: true }}
        subtitle="Últimos 30 dias"
      />
    );

    expect(screen.getByText('Indicações')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('🤝')).toBeInTheDocument();
    expect(screen.getByText(/↑ 20%/)).toBeInTheDocument();
    expect(screen.getByText('Últimos 30 dias')).toBeInTheDocument();
  });

  it('deve aplicar classes CSS corretas', () => {
    const { container } = render(
      <StatsCard
        title="Teste"
        value={100}
        icon="✅"
        trend={{ value: 5, isPositive: true }}
      />
    );

    expect(container.querySelector('.text-3xl.font-bold')).toBeInTheDocument();
    expect(container.querySelector('.text-sm.font-medium.text-gray-600')).toBeInTheDocument();
    expect(container.querySelector('.w-12.h-12.bg-blue-100.rounded-lg')).toBeInTheDocument();
  });

  it('deve renderizar valor zero corretamente', () => {
    render(<StatsCard title="Nenhum" value={0} />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('deve renderizar trend com valor zero', () => {
    render(
      <StatsCard
        title="Estável"
        value={50}
        trend={{ value: 0, isPositive: true }}
      />
    );

    expect(screen.getByText(/↑ 0%/)).toBeInTheDocument();
  });
});
