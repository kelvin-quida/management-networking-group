import { z } from 'zod';

export const createOneOnOneSchema = z.object({
  hostId: z.cuid({ error: 'ID do host inválido' }),
  guestId: z.cuid({ error: 'ID do guest inválido' }),
  scheduledAt: z.iso.datetime({ error: 'Data inválida' }),
  notes: z.string().optional(),
});

export const updateOneOnOneSchema = z.object({
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']).optional(),
  completedAt: z.iso.datetime().optional(),
  notes: z.string().optional(),
});

export type CreateOneOnOneInput = z.infer<typeof createOneOnOneSchema>;
export type UpdateOneOnOneInput = z.infer<typeof updateOneOnOneSchema>;
