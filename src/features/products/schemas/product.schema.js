import { z } from 'zod'

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Product name is required')
    .max(80, 'Product name must be 80 characters or fewer'),
  sku: z
    .string()
    .trim()
    .min(1, 'SKU is required')
    .max(40, 'SKU must be 40 characters or fewer'),
  category: z.string().trim().min(1, 'Category is required'),
  unit: z.string().trim().optional().default('pcs'),
  price: z.coerce.number().positive('Enter a valid price'),
  cost: z.coerce.number().nonnegative('Cost cannot be negative').optional().default(0),
  stock: z.coerce
    .number()
    .int('Enter a whole number')
    .nonnegative('Enter a valid stock quantity'),
})