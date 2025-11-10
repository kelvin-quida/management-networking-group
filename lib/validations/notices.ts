import { z } from 'zod';

export const createNoticeSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  content: z.string().min(10, 'Conteúdo deve ter no mínimo 10 caracteres'),
  type: z.enum(['INFO', 'WARNING', 'URGENT', 'EVENT']).default('INFO'),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH']).default('NORMAL'),
  expiresAt: z.string().datetime().optional(),
});

export const updateNoticeSchema = z.object({
  title: z.string().min(3).optional(),
  content: z.string().min(10).optional(),
  type: z.enum(['INFO', 'WARNING', 'URGENT', 'EVENT']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH']).optional(),
  expiresAt: z.string().datetime().optional(),
});

export type CreateNoticeInput = z.infer<typeof createNoticeSchema>;
export type UpdateNoticeInput = z.infer<typeof updateNoticeSchema>;
