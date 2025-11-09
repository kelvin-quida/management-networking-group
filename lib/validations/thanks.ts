import { z } from 'zod';

export const createThankSchema = z.object({
  fromMemberId: z.cuid({ error: 'ID do membro inválido' }),
  toMemberId: z.cuid({ error: 'ID do membro inválido' }),
  message: z.string().min(10, { error: 'Mensagem deve ter no mínimo 10 caracteres' }),
  value: z.number().positive().optional(),
  isPublic: z.boolean().default(true),
});

export type CreateThankInput = z.infer<typeof createThankSchema>;
