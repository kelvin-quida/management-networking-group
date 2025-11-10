import { z } from 'zod';

export const registerMemberSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  company: z
    .string()
    .optional()
    .transform(val => val || undefined),
  position: z
    .string()
    .optional()
    .transform(val => val || undefined),
  address: z
    .string()
    .optional()
    .transform(val => val || undefined),
  city: z
    .string()
    .optional()
    .transform(val => val || undefined),
  state: z
    .string()
    .length(2, 'Estado deve ter 2 caracteres (UF)')
    .toUpperCase()
    .optional()
    .or(z.literal('').transform(() => undefined)),
  zipCode: z
    .string()
    .regex(/^\d{5}-?\d{3}$/, 'CEP inválido (formato: 00000-000)')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  birthDate: z
    .string()
    .optional()
    .transform(val => val || undefined),
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
  birthDate: z.string().optional(),
  status: z.enum(['INVITED', 'ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

export type RegisterMemberInput = z.infer<typeof registerMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
