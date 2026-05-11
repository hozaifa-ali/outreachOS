import { z } from 'zod';

const campaignScheduleSchema = z.object({
  timezone: z.string().default('UTC'),
  days: z.array(z.number().int().min(0).max(6)).default([1, 2, 3, 4, 5]),
  startHour: z.number().int().min(0).max(23).default(9),
  endHour: z.number().int().min(0).max(23).default(17),
  throttlePerHour: z.number().int().min(1).default(50),
});

/** Create a new campaign */
export const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  listId: z.string().uuid().optional(),
  schedule: campaignScheduleSchema.optional(),
  trackOpens: z.boolean().default(true),
  trackClicks: z.boolean().default(true),
});
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;

/** Update a campaign */
export const updateCampaignSchema = createCampaignSchema.partial();
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;

/** Sequence step variant for A/B testing */
const stepVariantSchema = z.object({
  id: z.string().uuid().optional(),
  subject: z.string(),
  body: z.string(),
  weight: z.number().min(0).max(100).default(50),
});

/** Step condition for branching */
const stepConditionSchema = z.object({
  trigger: z.enum(['opened', 'clicked', 'replied', 'no_reply']),
});

/** Create a sequence step */
export const createSequenceStepSchema = z.object({
  campaignId: z.string().uuid(),
  stepNumber: z.number().int().min(1),
  type: z.enum(['email', 'linkedin_connect', 'linkedin_message', 'sms', 'wait']),
  delayDays: z.number().int().min(0).default(0),
  subject: z.string().optional(),
  body: z.string().optional(),
  format: z.enum(['plain', 'html', 'newsletter', 'minimal']).default('plain'),
  variants: z.array(stepVariantSchema).default([]),
  condition: stepConditionSchema.optional(),
});
export type CreateSequenceStepInput = z.infer<typeof createSequenceStepSchema>;

/** Update a sequence step */
export const updateSequenceStepSchema = createSequenceStepSchema.partial().omit({ campaignId: true });
export type UpdateSequenceStepInput = z.infer<typeof updateSequenceStepSchema>;

/** Reorder sequence steps */
export const reorderStepsSchema = z.object({
  steps: z.array(z.object({
    id: z.string().uuid(),
    stepNumber: z.number().int().min(1),
  })),
});
export type ReorderStepsInput = z.infer<typeof reorderStepsSchema>;

/** Campaign query filters */
export const campaignQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  status: z.enum(['draft', 'scheduled', 'active', 'paused', 'completed', 'archived']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'name', 'status', 'launchedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export type CampaignQueryInput = z.infer<typeof campaignQuerySchema>;
