import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MeetingCard } from '@/components/features/meetings/MeetingCard';
import type { Meeting } from '@/lib/types';

const mockMeeting: Meeting & { attendanceCount?: number } = {
  id: 'meeting-1',
  title: 'Reunião Semanal',
  description: 'Reunião de networking semanal',
  date: new Date('2024-12-15T19:00:00'),
  location: 'Sala de Conferências',
  type: 'REGULAR',
  createdAt: new Date(),
  updatedAt: new Date(),
  attendanceCount: 5,
};

describe('MeetingCard Component', () => {
  it('renders meeting title', () => {
    render(<MeetingCard meeting={mockMeeting} />);
    expect(screen.getByText('Reunião Semanal')).toBeInTheDocument();
  });

  it('renders meeting description when provided', () => {
    render(<MeetingCard meeting={mockMeeting} />);
    expect(screen.getByText('Reunião de networking semanal')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const meetingWithoutDesc = { ...mockMeeting, description: null };
    render(<MeetingCard meeting={meetingWithoutDesc} />);
    expect(screen.queryByText('Reunião de networking semanal')).not.toBeInTheDocument();
  });

  it('renders meeting location when provided', () => {
    render(<MeetingCard meeting={mockMeeting} />);
    expect(screen.getByText('Sala de Conferências')).toBeInTheDocument();
  });

  it('does not render location when not provided', () => {
    const meetingWithoutLocation = { ...mockMeeting, location: null };
    render(<MeetingCard meeting={meetingWithoutLocation} />);
    expect(screen.queryByText('Sala de Conferências')).not.toBeInTheDocument();
  });

  it('renders attendance count when provided', () => {
    render(<MeetingCard meeting={mockMeeting} />);
    expect(screen.getByText('5 participantes')).toBeInTheDocument();
  });

  it('displays correct badge for REGULAR meeting type', () => {
    render(<MeetingCard meeting={mockMeeting} />);
    expect(screen.getByText('Regular')).toBeInTheDocument();
  });

  it('displays correct badge for SPECIAL meeting type', () => {
    const specialMeeting = { ...mockMeeting, type: 'SPECIAL' as const };
    render(<MeetingCard meeting={specialMeeting} />);
    expect(screen.getByText('Especial')).toBeInTheDocument();
  });

  it('displays correct badge for TRAINING meeting type', () => {
    const trainingMeeting = { ...mockMeeting, type: 'TRAINING' as const };
    render(<MeetingCard meeting={trainingMeeting} />);
    expect(screen.getByText('Treinamento')).toBeInTheDocument();
  });

  it('displays correct badge for SOCIAL meeting type', () => {
    const socialMeeting = { ...mockMeeting, type: 'SOCIAL' as const };
    render(<MeetingCard meeting={socialMeeting} />);
    expect(screen.getByText('Social')).toBeInTheDocument();
  });

  it('displays "Hoje" badge when meeting is today', () => {
    const today = new Date();
    const todayMeeting = { ...mockMeeting, date: today };
    render(<MeetingCard meeting={todayMeeting} />);
    expect(screen.getByText('Hoje')).toBeInTheDocument();
  });

  it('does not display "Hoje" badge when meeting is not today', () => {
    render(<MeetingCard meeting={mockMeeting} />);
    expect(screen.queryByText('Hoje')).not.toBeInTheDocument();
  });

  it('renders check-in button when canCheckIn is true', () => {
    const onCheckIn = jest.fn();
    render(<MeetingCard meeting={mockMeeting} canCheckIn onCheckIn={onCheckIn} />);
    expect(screen.getByRole('button', { name: /fazer check-in/i })).toBeInTheDocument();
  });

  it('does not render check-in button when canCheckIn is false', () => {
    const onCheckIn = jest.fn();
    render(<MeetingCard meeting={mockMeeting} canCheckIn={false} onCheckIn={onCheckIn} />);
    expect(screen.queryByRole('button', { name: /fazer check-in/i })).not.toBeInTheDocument();
  });

  it('calls onCheckIn with meeting id when check-in button is clicked', () => {
    const onCheckIn = jest.fn();
    render(<MeetingCard meeting={mockMeeting} canCheckIn onCheckIn={onCheckIn} />);
    
    const button = screen.getByRole('button', { name: /fazer check-in/i });
    fireEvent.click(button);
    
    expect(onCheckIn).toHaveBeenCalledWith('meeting-1');
    expect(onCheckIn).toHaveBeenCalledTimes(1);
  });

  it('displays checked-in state when isCheckedIn is true', () => {
    const onCheckIn = jest.fn();
    render(<MeetingCard meeting={mockMeeting} canCheckIn onCheckIn={onCheckIn} isCheckedIn />);
    
    expect(screen.getByText(/check-in realizado/i)).toBeInTheDocument();
  });

  it('disables check-in button when isCheckedIn is true', () => {
    const onCheckIn = jest.fn();
    render(<MeetingCard meeting={mockMeeting} canCheckIn onCheckIn={onCheckIn} isCheckedIn />);
    
    const button = screen.getByRole('button', { name: /check-in realizado/i });
    expect(button).toBeDisabled();
  });

  it('does not call onCheckIn when button is disabled', () => {
    const onCheckIn = jest.fn();
    render(<MeetingCard meeting={mockMeeting} canCheckIn onCheckIn={onCheckIn} isCheckedIn />);
    
    const button = screen.getByRole('button', { name: /check-in realizado/i });
    fireEvent.click(button);
    
    expect(onCheckIn).not.toHaveBeenCalled();
  });

  it('formats date correctly in pt-BR locale', () => {
    render(<MeetingCard meeting={mockMeeting} />);
    expect(screen.getByText(/dezembro/i)).toBeInTheDocument();
  });

  it('formats time correctly in pt-BR locale', () => {
    render(<MeetingCard meeting={mockMeeting} />);
    expect(screen.getByText(/19:00/i)).toBeInTheDocument();
  });
});
