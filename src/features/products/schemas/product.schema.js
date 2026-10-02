import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1),
  unit: z.string().optional().default('pcs'),
  price: z.coerce.number().positive('Enter a valid price'),
  cost: z.coerce.number().nonnegative().optional().default(0),
  stock: z.coerce.number().int('Enter a whole number').nonnegative('Enter a valid stock quantity'),
})