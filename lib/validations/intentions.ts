import { z } from 'zod';

export const createIntentionSchema = z.object({
  name: z.string().min(3, { error: 'Nome deve ter no mínimo 3 caracteres' }),
  email: z.email({ error: 'Email inválido' }),
  phone: z.string().optional(),
  message: z.string().optional(),
});

export const approveIntentionSchema = z.object({
  intentionId: z.cuid({ error: 'ID inválido' }),
});

export const rejectIntentionSchema = z.object({
  intentionId: z.cuid({ error: 'ID inválido' }),
  reason: z.string().optional(),
});

export type CreateIntentionInput = z.infer<typeof createIntentionSchema>;
export type ApproveIntentionInput = z.infer<typeof approveIntentionSchema>;
export type RejectIntentionInput = z.infer<typeof rejectIntentionSchema>;
