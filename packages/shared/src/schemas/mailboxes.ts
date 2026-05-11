import { z } from 'zod';

/** Connect Gmail mailbox via OAuth */
export const connectGmailSchema = z.object({
  code: z.string().min(1, 'OAuth authorization code is required'),
});
export type ConnectGmailInput = z.infer<typeof connectGmailSchema>;

/** Connect Outlook mailbox via OAuth */
export const connectOutlookSchema = z.object({
  code: z.string().min(1, 'OAuth authorization code is required'),
});
export type ConnectOutlookInput = z.infer<typeof connectOutlookSchema>;

/** Connect generic SMTP mailbox */
export const connectSmtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  smtpHost: z.string().min(1, 'SMTP host is required'),
  smtpPort: z.number().int().min(1).max(65535).default(587),
  smtpUser: z.string().min(1, 'SMTP username is required'),
  smtpPass: z.string().min(1, 'SMTP password is required'),
  imapHost: z.string().optional(),
  imapPort: z.number().int().min(1).max(65535).default(993).optional(),
  useTls: z.boolean().default(true),
});
export type ConnectSmtpInput = z.infer<typeof connectSmtpSchema>;

/** Update mailbox settings */
export const updateMailboxSchema = z.object({
  dailyLimit: z.number().int().min(1).max(500).optional(),
  warmupEnabled: z.boolean().optional(),
  status: z.enum(['active', 'paused']).optional(),
});
export type UpdateMailboxInput = z.infer<typeof updateMailboxSchema>;
