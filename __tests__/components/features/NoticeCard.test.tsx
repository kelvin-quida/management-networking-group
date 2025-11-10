import React from 'react';
import { render, screen } from '@testing-library/react';
import { NoticeCard } from '@/components/features/notices/NoticeCard';
import type { Notice } from '@/lib/types';

const mockNotice: Notice = {
  id: 'notice-1',
  title: 'Aviso Importante',
  content: 'Este é um aviso importante para todos os membros.',
  type: 'INFO',
  priority: 'NORMAL',
  publishedAt: new Date('2024-12-01'),
  expiresAt: new Date('2024-12-31'),
  createdBy: 'admin-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('NoticeCard Component', () => {
  it('renders notice title', () => {
    render(<NoticeCard notice={mockNotice} />);
    expect(screen.getByText('Aviso Importante')).toBeInTheDocument();
  });

  it('renders notice content', () => {
    render(<NoticeCard notice={mockNotice} />);
    expect(screen.getByText('Este é um aviso importante para todos os membros.')).toBeInTheDocument();
  });

  it('preserves whitespace in content', () => {
    const noticeWithWhitespace = {
      ...mockNotice,
      content: 'Linha 1\n\nLinha 2\nLinha 3',
    };
    render(<NoticeCard notice={noticeWithWhitespace} />);
    const content = screen.getByText(/Linha 1/);
    expect(content).toHaveClass('whitespace-pre-wrap');
  });

  it('displays INFO type badge', () => {
    render(<NoticeCard notice={mockNotice} />);
    expect(screen.getByText('Informação')).toBeInTheDocument();
  });

  it('displays WARNING type badge', () => {
    const warningNotice = { ...mockNotice, type: 'WARNING' as const };
    render(<NoticeCard notice={warningNotice} />);
    expect(screen.getByText('Aviso')).toBeInTheDocument();
  });

  it('displays URGENT type badge', () => {
    const urgentNotice = { ...mockNotice, type: 'URGENT' as const };
    render(<NoticeCard notice={urgentNotice} />);
    expect(screen.getByText('Urgente')).toBeInTheDocument();
  });

  it('displays EVENT type badge', () => {
    const eventNotice = { ...mockNotice, type: 'EVENT' as const };
    render(<NoticeCard notice={eventNotice} />);
    expect(screen.getByText('Evento')).toBeInTheDocument();
  });

  it('displays LOW priority icon', () => {
    const lowPriorityNotice = { ...mockNotice, priority: 'LOW' as const };
    render(<NoticeCard notice={lowPriorityNotice} />);
    expect(screen.getByText('🔵')).toBeInTheDocument();
  });

  it('displays NORMAL priority icon', () => {
    render(<NoticeCard notice={mockNotice} />);
    expect(screen.getByText('🟡')).toBeInTheDocument();
  });

  it('displays HIGH priority icon', () => {
    const highPriorityNotice = { ...mockNotice, priority: 'HIGH' as const };
    render(<NoticeCard notice={highPriorityNotice} />);
    expect(screen.getByText('🔴')).toBeInTheDocument();
  });

  it('displays published date in pt-BR format', () => {
    render(<NoticeCard notice={mockNotice} />);
    const publishedText = screen.getByText(/Publicado em/i);
    expect(publishedText).toBeInTheDocument();
    expect(publishedText.textContent).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('displays expiration date when provided', () => {
    render(<NoticeCard notice={mockNotice} />);
    const expiresText = screen.getByText(/Expira em/i);
    expect(expiresText).toBeInTheDocument();
    expect(expiresText.textContent).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('does not display expiration date when not provided', () => {
    const noticeWithoutExpiry = { ...mockNotice, expiresAt: null };
    render(<NoticeCard notice={noticeWithoutExpiry} />);
    expect(screen.queryByText(/Expira em/i)).not.toBeInTheDocument();
  });

  it('applies correct badge variant for INFO type', () => {
    const { container } = render(<NoticeCard notice={mockNotice} />);
    const badge = screen.getByText('Informação');
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('applies correct badge variant for WARNING type', () => {
    const warningNotice = { ...mockNotice, type: 'WARNING' as const };
    const { container } = render(<NoticeCard notice={warningNotice} />);
    const badge = screen.getByText('Aviso');
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('applies correct badge variant for URGENT type', () => {
    const urgentNotice = { ...mockNotice, type: 'URGENT' as const };
    const { container } = render(<NoticeCard notice={urgentNotice} />);
    const badge = screen.getByText('Urgente');
    expect(badge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('applies correct badge variant for EVENT type', () => {
    const eventNotice = { ...mockNotice, type: 'EVENT' as const };
    const { container } = render(<NoticeCard notice={eventNotice} />);
    const badge = screen.getByText('Evento');
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');
  });
});
