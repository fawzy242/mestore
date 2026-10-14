import { z } from 'zod'

export const userSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(80, 'Name must be 80 characters or fewer'),
  username: z
    .string()
    .trim()
    .min(1, 'Username is required')
    .max(40, 'Username must be 40 characters or fewer'),
  password: z
    .string()
    .optional()
    .refine((v) => !v || v.length >= 6, {
      message: 'Password must be at least 6 characters',
    }),
  role: z.enum(['admin', 'manager', 'cashier'], {
    message: 'Select a valid role',
  }),
  status: z.enum(['Active', 'Inactive']),
})