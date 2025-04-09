import { z } from 'zod';

// Product Schema using Zod for runtime validation
export const ProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  handle: z.string(),
  status: z.string(),
});

export const ProductResponseSchema = z.object({
  products: z.array(ProductSchema),
  count: z.number(),
});

// Export our custom types
export type Product = z.infer<typeof ProductSchema>;
export type ProductResponse = z.infer<typeof ProductResponseSchema>;
