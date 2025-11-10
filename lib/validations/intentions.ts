import { z } from 'zod';

export const createIntentionSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  email: z
    .email('Email inválido')
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .optional()
    .transform(val => val || undefined),
  message: z
    .string()
    .optional()
    .transform(val => val || undefined),
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
