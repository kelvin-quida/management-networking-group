import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntentionCard } from '@/components/features/intentions/IntentionCard';
import type { Intention } from '@/lib/types';

describe('IntentionCard', () => {
  const mockIntention: Intention = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '11999999999',
    message: 'Gostaria de fazer parte do grupo de networking',
    status: 'PENDING',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  };

  it('deve renderizar informações básicas da intenção', () => {
    render(<IntentionCard intention={mockIntention} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('11999999999')).toBeInTheDocument();
  });

  it('deve renderizar mensagem quando fornecida', () => {
    render(<IntentionCard intention={mockIntention} />);

    expect(screen.getByText('Gostaria de fazer parte do grupo de networking')).toBeInTheDocument();
  });

  it('não deve renderizar telefone quando não fornecido', () => {
    const intentionWithoutPhone = {
      ...mockIntention,
      phone: null,
    };

    render(<IntentionCard intention={intentionWithoutPhone} />);

    expect(screen.queryByText('11999999999')).not.toBeInTheDocument();
  });

  it('não deve renderizar mensagem quando não fornecida', () => {
    const intentionWithoutMessage = {
      ...mockIntention,
      message: null,
    };

    render(<IntentionCard intention={intentionWithoutMessage} />);

    expect(screen.queryByText('Gostaria de fazer parte')).not.toBeInTheDocument();
  });

  it('deve renderizar data de criação formatada', () => {
    render(<IntentionCard intention={mockIntention} />);

    expect(screen.getByText(/Enviado em/)).toBeInTheDocument();
    const dateElement = screen.getByText(/\d{2}\/\d{2}\/\d{4}/);
    expect(dateElement).toBeInTheDocument();
  });

  it('deve renderizar badge de status PENDING', () => {
    render(<IntentionCard intention={mockIntention} />);

    expect(screen.getByText('Pendente')).toBeInTheDocument();
  });

  it('deve renderizar badge de status APPROVED', () => {
    const approvedIntention = {
      ...mockIntention,
      status: 'APPROVED' as const,
    };

    render(<IntentionCard intention={approvedIntention} />);

    expect(screen.getByText('Aprovado')).toBeInTheDocument();
  });

  it('deve renderizar badge de status REJECTED', () => {
    const rejectedIntention = {
      ...mockIntention,
      status: 'REJECTED' as const,
    };

    render(<IntentionCard intention={rejectedIntention} />);

    expect(screen.getByText('Rejeitado')).toBeInTheDocument();
  });

  it('deve mostrar botões de ação quando status é PENDING', () => {
    render(
      <IntentionCard 
        intention={mockIntention} 
        onApprove={() => {}} 
        onReject={() => {}}
      />
    );

    expect(screen.getByText('Aprovar')).toBeInTheDocument();
    expect(screen.getByText('Rejeitar')).toBeInTheDocument();
  });

  it('não deve mostrar botões quando status não é PENDING', () => {
    const approvedIntention = {
      ...mockIntention,
      status: 'APPROVED' as const,
    };

    render(
      <IntentionCard 
        intention={approvedIntention} 
        onApprove={() => {}} 
        onReject={() => {}}
      />
    );

    expect(screen.queryByText('Aprovar')).not.toBeInTheDocument();
    expect(screen.queryByText('Rejeitar')).not.toBeInTheDocument();
  });

  it('não deve mostrar botões quando callbacks não são fornecidos', () => {
    render(<IntentionCard intention={mockIntention} />);

    expect(screen.queryByText('Aprovar')).not.toBeInTheDocument();
    expect(screen.queryByText('Rejeitar')).not.toBeInTheDocument();
  });

  it('deve chamar onApprove ao clicar em Aprovar', () => {
    const handleApprove = jest.fn();
    render(
      <IntentionCard 
        intention={mockIntention} 
        onApprove={handleApprove} 
        onReject={() => {}}
      />
    );

    const approveButton = screen.getByText('Aprovar');
    fireEvent.click(approveButton);

    expect(handleApprove).toHaveBeenCalledWith('1');
  });

  it('deve chamar onReject ao clicar em Rejeitar', () => {
    const handleReject = jest.fn();
    render(
      <IntentionCard 
        intention={mockIntention} 
        onApprove={() => {}} 
        onReject={handleReject}
      />
    );

    const rejectButton = screen.getByText('Rejeitar');
    fireEvent.click(rejectButton);

    expect(handleReject).toHaveBeenCalledWith('1');
  });

  it('deve desabilitar botões quando isLoading é true', () => {
    render(
      <IntentionCard 
        intention={mockIntention} 
        onApprove={() => {}} 
        onReject={() => {}}
        isLoading={true}
      />
    );

    const approveButton = screen.getByText('Aprovar');
    const rejectButton = screen.getByText('Rejeitar');

    expect(approveButton).toBeDisabled();
    expect(rejectButton).toBeDisabled();
  });

  it('não deve desabilitar botões quando isLoading é false', () => {
    render(
      <IntentionCard 
        intention={mockIntention} 
        onApprove={() => {}} 
        onReject={() => {}}
        isLoading={false}
      />
    );

    const approveButton = screen.getByText('Aprovar');
    const rejectButton = screen.getByText('Rejeitar');

    expect(approveButton).not.toBeDisabled();
    expect(rejectButton).not.toBeDisabled();
  });

  it('deve renderizar mensagem longa corretamente', () => {
    const intentionWithLongMessage = {
      ...mockIntention,
      message: 'Esta é uma mensagem muito longa que descreve em detalhes por que a pessoa quer fazer parte do grupo de networking e quais são suas expectativas e objetivos.',
    };

    render(<IntentionCard intention={intentionWithLongMessage} />);

    expect(screen.getByText(/Esta é uma mensagem muito longa/)).toBeInTheDocument();
  });
});
