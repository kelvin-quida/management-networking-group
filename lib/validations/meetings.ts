import { z } from 'zod';

export const createMeetingSchema = z.object({
  title: z.string().min(3, { error: 'Título deve ter no mínimo 3 caracteres' }),
  description: z.string().optional(),
  date: z.iso.datetime({ error: 'Data inválida' }),
  location: z.string().optional(),
  type: z.enum(['REGULAR', 'SPECIAL', 'TRAINING', 'SOCIAL']).default('REGULAR'),
});

export const updateMeetingSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  date: z.iso.datetime().optional(),
  location: z.string().optional(),
  type: z.enum(['REGULAR', 'SPECIAL', 'TRAINING', 'SOCIAL']).optional(),
});

export const checkInSchema = z.object({
  memberId: z.cuid({ error: 'ID do membro inválido' }),
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type UpdateMeetingInput = z.infer<typeof updateMeetingSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
