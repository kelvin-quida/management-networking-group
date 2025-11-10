import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThankCard } from '@/components/features/thanks/ThankCard';
import type { ThankWithMembers } from '@/lib/types';

describe('ThankCard', () => {
  const mockThank: ThankWithMembers = {
    id: '1',
    fromMemberId: 'member1',
    toMemberId: 'member2',
    message: 'Obrigado pela indicação que gerou R$ 5.000 em negócios!',
    value: 5000,
    isPublic: true,
    createdAt: new Date('2024-01-15').toISOString(),
    fromMember: {
      id: 'member1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '11999999999',
      company: 'ACME Corp',
      position: 'CEO',
      address: null,
      city: null,
      state: null,
      zipCode: null,
      birthDate: null,
      status: 'ACTIVE',
      inviteToken: 'token1',
      tokenExpiry: new Date('2025-01-01'),
      intentionId: 'intention1',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    toMember: {
      id: 'member2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '11988888888',
      company: 'Tech Inc',
      position: 'CTO',
      address: null,
      city: null,
      state: null,
      zipCode: null,
      birthDate: null,
      status: 'ACTIVE',
      inviteToken: 'token2',
      tokenExpiry: new Date('2025-01-01'),
      intentionId: 'intention2',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
  };

  it('deve renderizar nomes dos membros', () => {
    render(<ThankCard thank={mockThank} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText(/agradeceu/)).toBeInTheDocument();
  });

  it('deve renderizar mensagem de agradecimento', () => {
    render(<ThankCard thank={mockThank} />);

    expect(screen.getByText('Obrigado pela indicação que gerou R$ 5.000 em negócios!')).toBeInTheDocument();
  });

  it('deve renderizar valor formatado em reais', () => {
    render(<ThankCard thank={mockThank} />);

    expect(screen.getByText(/R\$ 5\.000,00/)).toBeInTheDocument();
  });

  it('deve renderizar data', () => {
    render(<ThankCard thank={mockThank} />);

    const dateElement = screen.getByText(/\d{2}\/\d{2}\/\d{4}/);
    expect(dateElement).toBeInTheDocument();
  });

  it('deve renderizar ícone de agradecimento', () => {
    render(<ThankCard thank={mockThank} />);

    expect(screen.getByText('🙏')).toBeInTheDocument();
  });

  it('deve renderizar valor zero corretamente', () => {
    const thankWithZeroValue: ThankWithMembers = {
      ...mockThank,
      value: 0,
    };

    render(<ThankCard thank={thankWithZeroValue} />);

    expect(screen.getByText(/R\$/)).toBeInTheDocument();
  });

  it('deve aplicar classes CSS corretas', () => {
    const { container } = render(<ThankCard thank={mockThank} />);

    expect(container.querySelector('.bg-yellow-100')).toBeInTheDocument();
    expect(container.querySelector('.text-green-600')).toBeInTheDocument();
  });

  it('deve renderizar mensagem longa sem quebrar layout', () => {
    const thankWithLongMessage: ThankWithMembers = {
      ...mockThank,
      message: 'Esta é uma mensagem muito longa de agradecimento que deve ser renderizada corretamente sem quebrar o layout do card. Obrigado por tudo!',
    };

    render(<ThankCard thank={thankWithLongMessage} />);

    expect(screen.getByText(/Esta é uma mensagem muito longa/)).toBeInTheDocument();
  });

  it('deve formatar valores grandes corretamente', () => {
    const thankWithLargeValue: ThankWithMembers = {
      ...mockThank,
      value: 1234567.89,
    };

    render(<ThankCard thank={thankWithLargeValue} />);

    expect(screen.getByText(/R\$ 1\.234\.567,89/)).toBeInTheDocument();
  });

  it('deve renderizar data recente corretamente', () => {
    const recentThank: ThankWithMembers = {
      ...mockThank,
      createdAt: new Date('2024-12-25').toISOString(),
    };

    render(<ThankCard thank={recentThank} />);

    const dateElement = screen.getByText(/\d{2}\/\d{2}\/\d{4}/);
    expect(dateElement).toBeInTheDocument();
  });
});
