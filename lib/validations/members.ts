import { z } from 'zod';

export const registerMemberSchema = z.object({
  token: z.string().min(1, { error: 'Token é obrigatório' }),
  company: z.string().optional(),
  position: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  birthDate: z.iso.datetime({ error: 'Data inválida' }).optional(),
});

export const updateMemberSchema = z.object({
  name: z.string().min(3).optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  birthDate: z.iso.datetime({ error: 'Data inválida' }).optional(),
  status: z.enum(['INVITED', 'ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

export type RegisterMemberInput = z.infer<typeof registerMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
