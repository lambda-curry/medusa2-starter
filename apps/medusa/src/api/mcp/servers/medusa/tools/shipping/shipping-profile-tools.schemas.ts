import { z } from 'zod';

export const shippingProfileInputSchema = z.object({
  name: z.string().describe('The name of the shipping profile'),
  type: z.string().describe('The type of the shipping profile'),
});

export const createShippingProfileSchema = z.object({
  shipping_profiles: z.array(shippingProfileInputSchema).min(1),
});
