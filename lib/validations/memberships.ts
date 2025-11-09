import { z } from 'zod';

export const createMembershipSchema = z.object({
  memberId: z.cuid({ error: 'ID do membro inválido' }),
  dueDate: z.iso.datetime({ error: 'Data de vencimento inválida' }),
  amount: z.number().positive({ error: 'Valor deve ser positivo' }),
  notes: z.string().optional(),
});

export const payMembershipSchema = z.object({
  paymentMethod: z.string().min(3, { error: 'Método de pagamento é obrigatório' }),
  paidAt: z.iso.datetime({ error: 'Data de pagamento inválida' }),
  notes: z.string().optional(),
});

export type CreateMembershipInput = z.infer<typeof createMembershipSchema>;
export type PayMembershipInput = z.infer<typeof payMembershipSchema>;
