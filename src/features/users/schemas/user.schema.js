import { z } from 'zod'

export const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().optional(),
  role: z.enum(['admin', 'manager', 'cashier']),
  status: z.enum(['Active', 'Inactive']),
})