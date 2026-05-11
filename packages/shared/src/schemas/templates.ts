import { z } from 'zod';

/** Create a template */
export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  category: z.enum(['cold_outreach', 'follow_up', 'breakup', 'newsletter', 'demo_request']).optional(),
  format: z.enum(['plain', 'html', 'newsletter', 'minimal']).default('plain'),
  subject: z.string().optional(),
  body: z.string().optional(),
  isPublic: z.boolean().default(false),
});
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;

/** Update a template */
export const updateTemplateSchema = createTemplateSchema.partial();
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;

/** Template query filters */
export const templateQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  category: z.enum(['cold_outreach', 'follow_up', 'breakup', 'newsletter', 'demo_request']).optional(),
  search: z.string().optional(),
  isPublic: z.coerce.boolean().optional(),
});
export type TemplateQueryInput = z.infer<typeof templateQuerySchema>;
