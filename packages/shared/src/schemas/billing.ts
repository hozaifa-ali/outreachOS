import { z } from 'zod';

/** Create a Stripe checkout session */
export const createCheckoutSchema = z.object({
  plan: z.enum(['starter', 'growth', 'pro']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});
export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;

/** Change plan (upgrade/downgrade) */
export const changePlanSchema = z.object({
  plan: z.enum(['starter', 'growth', 'pro', 'enterprise']),
});
export type ChangePlanInput = z.infer<typeof changePlanSchema>;
