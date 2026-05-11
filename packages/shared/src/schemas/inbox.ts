import { z } from 'zod';

/** Query inbox threads */
export const inboxQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  status: z.enum(['open', 'closed', 'snoozed']).optional(),
  label: z.enum(['interested', 'not_interested', 'ooo', 'wrong_person', 'meeting_booked', 'referral', 'question', 'unsubscribe_request']).optional(),
  channel: z.enum(['email', 'linkedin', 'sms', 'whatsapp']).optional(),
  assignedTo: z.string().uuid().optional(),
  campaignId: z.string().uuid().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['lastMessageAt', 'createdAt']).default('lastMessageAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export type InboxQueryInput = z.infer<typeof inboxQuerySchema>;

/** Update inbox thread (assign, label, snooze) */
export const updateThreadSchema = z.object({
  status: z.enum(['open', 'closed', 'snoozed']).optional(),
  label: z.enum(['interested', 'not_interested', 'ooo', 'wrong_person', 'meeting_booked', 'referral', 'question', 'unsubscribe_request']).nullish(),
  assignedTo: z.string().uuid().nullish(),
  snoozedUntil: z.string().datetime().nullish(),
});
export type UpdateThreadInput = z.infer<typeof updateThreadSchema>;

/** Send a reply from inbox */
export const sendReplySchema = z.object({
  body: z.string().min(1, 'Reply body is required'),
  htmlBody: z.string().optional(),
});
export type SendReplyInput = z.infer<typeof sendReplySchema>;
