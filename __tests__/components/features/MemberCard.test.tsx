import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemberCard } from '@/components/features/members/MemberCard';
import type { Member } from '@/lib/types';

describe('MemberCard', () => {
  const mockMember: Member = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '11999999999',
    company: 'ACME Corp',
    position: 'CEO',
    status: 'ACTIVE',
    address: null,
    city: null,
    state: null,
    zipCode: null,
    birthDate: null,
    inviteToken: 'test-token-123',
    tokenExpiry: new Date('2024-12-31'),
    intentionId: 'intention-123',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  it('deve renderizar informações básicas do membro', () => {
    render(<MemberCard member={mockMember} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('deve renderizar inicial do nome no avatar', () => {
    render(<MemberCard member={mockMember} />);

    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('deve renderizar badge de status correto', () => {
    render(<MemberCard member={mockMember} />);

    expect(screen.getByText('Ativo')).toBeInTheDocument();
  });

  it('deve renderizar diferentes status com badges corretos', () => {
    const statuses: Array<Member['status']> = ['INVITED', 'ACTIVE', 'INACTIVE', 'SUSPENDED'];
    const labels = ['Convidado', 'Ativo', 'Inativo', 'Suspenso'];

    statuses.forEach((status, index) => {
      const { rerender } = render(
        <MemberCard member={{ ...mockMember, status }} />
      );

      expect(screen.getByText(labels[index])).toBeInTheDocument();
      rerender(<div />);
    });
  });

  it('deve renderizar empresa quando fornecida', () => {
    render(<MemberCard member={mockMember} />);

    expect(screen.getByText(/Empresa:/)).toBeInTheDocument();
    expect(screen.getByText(/ACME Corp/)).toBeInTheDocument();
  });

  it('deve renderizar cargo quando fornecido', () => {
    render(<MemberCard member={mockMember} />);

    expect(screen.getByText(/Cargo:/)).toBeInTheDocument();
    expect(screen.getByText(/CEO/)).toBeInTheDocument();
  });

  it('não deve renderizar seção de empresa/cargo quando ambos são null', () => {
    const memberWithoutCompany = {
      ...mockMember,
      company: null,
      position: null,
    };

    const { container } = render(<MemberCard member={memberWithoutCompany} />);

    expect(screen.queryByText(/Empresa:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Cargo:/)).not.toBeInTheDocument();
    expect(container.querySelector('.border-t')).not.toBeInTheDocument();
  });

  it('deve chamar onClick quando card é clicado', () => {
    const handleClick = jest.fn();
    render(<MemberCard member={mockMember} onClick={handleClick} />);

    const card = screen.getByText('John Doe').closest('div')?.parentElement?.parentElement;
    if (card) {
      fireEvent.click(card);
    }

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('deve aplicar classe cursor-pointer quando onClick é fornecido', () => {
    const { container } = render(
      <MemberCard member={mockMember} onClick={() => {}} />
    );

    const wrapper = container.querySelector('.cursor-pointer');
    expect(wrapper).toBeInTheDocument();
  });

  it('não deve mostrar botão de deletar quando showActions é false', () => {
    render(<MemberCard member={mockMember} showActions={false} />);

    expect(screen.queryByTitle('Remover membro')).not.toBeInTheDocument();
  });

  it('deve mostrar botão de deletar quando showActions é true', () => {
    render(<MemberCard member={mockMember} showActions={true} />);

    expect(screen.getByTitle('Remover membro')).toBeInTheDocument();
  });

  it('deve mostrar confirmação ao clicar em deletar', () => {
    render(<MemberCard member={mockMember} showActions={true} />);

    const deleteButton = screen.getByTitle('Remover membro');
    fireEvent.click(deleteButton);

    expect(screen.getByText(/Tem certeza que deseja remover este membro/)).toBeInTheDocument();
    expect(screen.getByText('Confirmar')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('deve chamar onDelete ao confirmar deleção', () => {
    const handleDelete = jest.fn();
    render(
      <MemberCard member={mockMember} showActions={true} onDelete={handleDelete} />
    );

    const deleteButton = screen.getByTitle('Remover membro');
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByText('Confirmar');
    fireEvent.click(confirmButton);

    expect(handleDelete).toHaveBeenCalledWith('1');
  });

  it('deve cancelar deleção ao clicar em Cancelar', () => {
    const handleDelete = jest.fn();
    render(
      <MemberCard member={mockMember} showActions={true} onDelete={handleDelete} />
    );

    const deleteButton = screen.getByTitle('Remover membro');
    fireEvent.click(deleteButton);

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(handleDelete).not.toHaveBeenCalled();
    expect(screen.queryByText(/Tem certeza/)).not.toBeInTheDocument();
  });

  it('deve prevenir propagação de evento ao clicar em deletar', () => {
    const handleClick = jest.fn();
    const handleDelete = jest.fn();

    render(
      <MemberCard 
        member={mockMember} 
        onClick={handleClick} 
        showActions={true} 
        onDelete={handleDelete}
      />
    );

    const deleteButton = screen.getByTitle('Remover membro');
    fireEvent.click(deleteButton);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('deve renderizar apenas empresa quando cargo é null', () => {
    const memberWithoutPosition = {
      ...mockMember,
      position: null,
    };

    render(<MemberCard member={memberWithoutPosition} />);

    expect(screen.getByText(/Empresa:/)).toBeInTheDocument();
    expect(screen.queryByText(/Cargo:/)).not.toBeInTheDocument();
  });

  it('deve renderizar apenas cargo quando empresa é null', () => {
    const memberWithoutCompany = {
      ...mockMember,
      company: null,
    };

    render(<MemberCard member={memberWithoutCompany} />);

    expect(screen.queryByText(/Empresa:/)).not.toBeInTheDocument();
    expect(screen.getByText(/Cargo:/)).toBeInTheDocument();
  });

  it('deve aplicar hover shadow quando onClick é fornecido', () => {
    const { container } = render(
      <MemberCard member={mockMember} onClick={() => {}} />
    );

    const card = container.querySelector('.hover\\:shadow-lg');
    expect(card).toBeInTheDocument();
  });
});
