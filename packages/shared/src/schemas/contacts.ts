import { z } from 'zod';

/** Create a new contact */
export const createContactSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  industry: z.string().optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
  listId: z.string().uuid().optional(),
});
export type CreateContactInput = z.infer<typeof createContactSchema>;

/** Update a contact */
export const updateContactSchema = createContactSchema.partial();
export type UpdateContactInput = z.infer<typeof updateContactSchema>;

/** Create a contact list */
export const createContactListSchema = z.object({
  name: z.string().min(1, 'List name is required'),
  source: z.enum(['csv_upload', 'google_sheets', 'hubspot', 'salesforce', 'manual']).optional(),
});
export type CreateContactListInput = z.infer<typeof createContactListSchema>;

/** Contact import configuration */
export const importContactsSchema = z.object({
  listId: z.string().uuid().optional(),
  listName: z.string().min(1).optional(),
  fieldMapping: z.record(z.string(), z.string()).optional(),
  skipDuplicates: z.boolean().default(true),
});
export type ImportContactsInput = z.infer<typeof importContactsSchema>;

/** Contact query filters */
export const contactQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().optional(),
  status: z.enum(['active', 'unsubscribed', 'bounced', 'invalid']).optional(),
  listId: z.string().uuid().optional(),
  sortBy: z.enum(['createdAt', 'email', 'firstName', 'company']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export type ContactQueryInput = z.infer<typeof contactQuerySchema>;
